#!/usr/bin/env node
/**
 * js/price-data.json içindeki güncel fiyat / destek-direnç verilerini,
 * Claude API'nin sunucu taraflı web_search aracını kullanarak yeniler.
 *
 * Kullanım:
 *   ANTHROPIC_API_KEY=... node scripts/refresh-price-data.mjs
 *
 * Bu script haftalık olarak .github/workflows/refresh-price-data.yml
 * tarafından çalıştırılır. Elle de çalıştırılabilir.
 *
 * Bir hissede arama başarısız olursa veya sonuç ayrıştırılamazsa, o hissenin
 * price-data.json'daki ÖNCEKİ değeri korunur (geçici bir hata yüzünden
 * elimizdeki en güncel bilgiyi kaybetmemek için).
 */
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import Anthropic from "@anthropic-ai/sdk";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_JS_PATH = path.join(__dirname, "..", "js", "data.js");
const PRICE_DATA_PATH = path.join(__dirname, "..", "js", "price-data.json");
const MODEL = "claude-sonnet-5";
const CONCURRENCY = 4;

const { STOCKS } = require(DATA_JS_PATH);

const client = new Anthropic();

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    currentPrice: { type: ["number", "null"] },
    priceAsOfDate: { type: ["string", "null"], description: "ISO tarih, örn. 2026-09-21" },
    support1: { type: ["number", "null"] },
    support2: { type: ["number", "null"] },
    resistance1: { type: ["number", "null"] },
    resistance2: { type: ["number", "null"] },
    sourceUrl: { type: ["string", "null"] },
  },
  required: ["currentPrice", "priceAsOfDate", "support1", "support2", "resistance1", "resistance2", "sourceUrl"],
  additionalProperties: false,
};

function buildPrompt(symbol, name) {
  return `BIST (Borsa İstanbul) hissesi ${symbol} (${name}) için güncel fiyat ve kısa vadeli destek/direnç seviyelerini web_search aracıyla bul.

Türkçe finans sitelerini tercih et: finans.mynet.com, hisse.net, borsametre.com.tr, tr.tradingview.com, borsaverileri.com, atayatirim.com.tr, gcmyatirim.com.tr gibi kaynaklar genelde günlük teknik analiz yazıları içerir.

Bul:
- currentPrice: güncel fiyat (TL, sayı)
- priceAsOfDate: bu fiyatın ait olduğu tarih (ISO format, "YYYY-MM-DD")
- support1, support2: en yakın iki destek seviyesi (support1 = güncel fiyata en yakın olan, mutlaka currentPrice'dan KÜÇÜK olmalı)
- resistance1, resistance2: en yakın iki direnç seviyesi (resistance1 = güncel fiyata en yakın olan, mutlaka currentPrice'dan BÜYÜK olmalı)
- sourceUrl: kullandığın en güvenilir kaynağın URL'si

ÖNEMLİ TUTARLILIK KURALI: Bazı kaynaklar eski/farklı bir fiyat aralığından kalma destek-direnç seviyeleri gösterebilir. Eğer bulduğun bir direnç seviyesi currentPrice'dan KÜÇÜKse, ya da bir destek seviyesi currentPrice'dan BÜYÜKse, o seviye tutarsızdır ve muhtemelen eski bir veridir — o alanı null bırak, uydurma veya yanlış haliyle raporlama.

Hiçbir güvenilir veri bulamazsan ilgili alanları null bırak.

Sonucu SADECE JSON olarak, başka hiçbir açıklama eklemeden, tam olarak şu şemaya uygun şekilde ver:
{"currentPrice": number|null, "priceAsOfDate": string|null, "support1": number|null, "support2": number|null, "resistance1": number|null, "resistance2": number|null, "sourceUrl": string|null}`;
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON bulunamadı");
  return JSON.parse(raw.slice(start, end + 1));
}

function sanityCheck(result) {
  const out = { ...result };
  const price = out.currentPrice;
  if (typeof price === "number") {
    if (typeof out.resistance1 === "number" && out.resistance1 <= price) out.resistance1 = null;
    if (typeof out.resistance2 === "number" && out.resistance2 <= price) out.resistance2 = null;
    if (typeof out.support1 === "number" && out.support1 >= price) out.support1 = null;
    if (typeof out.support2 === "number" && out.support2 >= price) out.support2 = null;
  }
  return out;
}

async function fetchOne(stock) {
  let messages = [{ role: "user", content: buildPrompt(stock.symbol, stock.name) }];

  for (let round = 0; round < 4; round++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 4 }],
      messages,
    });

    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) throw new Error(`${stock.symbol}: metin bloğu yok (stop_reason=${response.stop_reason})`);

    const parsed = extractJson(textBlock.text);
    return sanityCheck(parsed);
  }

  throw new Error(`${stock.symbol}: çok fazla pause_turn döngüsü`);
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function runner() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner));
  return results;
}

async function main() {
  const existingRaw = await fs.readFile(PRICE_DATA_PATH, "utf-8").catch(() => "{}");
  const existing = JSON.parse(existingRaw);
  const updated = { ...existing };
  let okCount = 0;
  let failCount = 0;

  await runWithConcurrency(STOCKS, CONCURRENCY, async (stock) => {
    try {
      const result = await fetchOne(stock);
      updated[stock.symbol] = result;
      okCount++;
      console.log(`OK   ${stock.symbol}: ${result.currentPrice ?? "?"} TL (${result.priceAsOfDate ?? "tarih yok"})`);
    } catch (err) {
      failCount++;
      console.error(`FAIL ${stock.symbol}: ${err.message} — önceki değer korunuyor`);
    }
  });

  updated._meta = {
    description:
      "Web aramasıyla çekilen anlık fiyat/destek-direnç görüntüsü. Canlı borsa akışı değildir. Haftalık olarak scripts/refresh-price-data.mjs tarafından (GitHub Actions üzerinden) güncellenir.",
    lastRefreshedAt: new Date().toISOString(),
  };

  await fs.writeFile(PRICE_DATA_PATH, JSON.stringify(updated, null, 2) + "\n", "utf-8");
  console.log(`\nTamamlandı: ${okCount} başarılı, ${failCount} başarısız (toplam ${STOCKS.length}).`);

  if (failCount === STOCKS.length) {
    console.error("Tüm hisseler başarısız oldu — muhtemel API/ağ sorunu.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
