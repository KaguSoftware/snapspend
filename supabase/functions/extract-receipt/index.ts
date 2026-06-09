// extract-receipt — Supabase Edge Function (Deno)
//
// Downloads a receipt image from Storage, sends it to Claude vision with a
// strict JSON schema, and persists the extracted fields + line items.
// Not yet deployed (see BACKEND_NOTES.md). Deploy with:
//   supabase functions deploy extract-receipt
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Request body: { "receipt_id": "<uuid>" }
// Caller: authenticated app user (their JWT is forwarded by supabase-js invoke()).

import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const CATEGORIES = [
  "groceries",
  "dining",
  "transport",
  "shopping",
  "utilities",
  "health",
  "entertainment",
  "other",
] as const;

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    merchant: { type: "string", description: "Store or merchant name as printed" },
    purchased_at: {
      type: "string",
      format: "date",
      description: "Purchase date in YYYY-MM-DD; today's date if unreadable",
    },
    total: { type: "number", description: "Grand total paid" },
    currency: { type: "string", description: "ISO 4217 code, e.g. USD" },
    category: { type: "string", enum: [...CATEGORIES] },
    confidence: { type: "number", description: "0-1 confidence in the extraction" },
    line_items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          quantity: { type: "number" },
          unit_price: { type: "number" },
        },
        required: ["name", "quantity", "unit_price"],
        additionalProperties: false,
      },
    },
  },
  required: ["merchant", "purchased_at", "total", "currency", "category", "confidence", "line_items"],
  additionalProperties: false,
} as const;

interface Extraction {
  merchant: string;
  purchased_at: string;
  total: number;
  currency: string;
  category: (typeof CATEGORIES)[number];
  confidence: number;
  line_items: { name: string; quantity: number; unit_price: number }[];
}

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Resolve the calling user from their JWT so we only process their receipts.
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receipt_id } = await req.json();
  if (!receipt_id) {
    return Response.json({ error: "receipt_id is required" }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: receipt, error: receiptError } = await admin
    .from("receipts")
    .select("id, user_id, image_path")
    .eq("id", receipt_id)
    .eq("user_id", user.id)
    .single();
  if (receiptError || !receipt?.image_path) {
    return Response.json({ error: "Receipt not found" }, { status: 404 });
  }

  try {
    const { data: blob, error: downloadError } = await admin.storage
      .from("receipts")
      .download(receipt.image_path);
    if (downloadError || !blob) throw downloadError ?? new Error("Image download failed");

    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    const imageBase64 = btoa(binary);
    const mediaType = blob.type || "image/jpeg";

    const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      output_config: { format: { type: "json_schema", schema: EXTRACTION_SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageBase64 },
            },
            {
              type: "text",
              text: "Extract the receipt data. Use the printed totals; if a field is unreadable, give your best estimate and lower the confidence.",
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No extraction returned");
    const extraction = JSON.parse(textBlock.text) as Extraction;

    const { error: updateError } = await admin
      .from("receipts")
      .update({
        merchant: extraction.merchant,
        total: extraction.total,
        currency: extraction.currency,
        purchased_at: extraction.purchased_at,
        category: extraction.category,
        status: "done",
        raw_extraction: extraction,
      })
      .eq("id", receipt.id);
    if (updateError) throw updateError;

    if (extraction.line_items.length > 0) {
      const { error: itemsError } = await admin.from("line_items").insert(
        extraction.line_items.map((li) => ({ ...li, receipt_id: receipt.id })),
      );
      if (itemsError) throw itemsError;
    }

    return Response.json({ ok: true, extraction });
  } catch (err) {
    await admin.from("receipts").update({ status: "failed" }).eq("id", receipt.id);
    const message = err instanceof Error ? err.message : "Extraction failed";
    return Response.json({ error: message }, { status: 500 });
  }
});
