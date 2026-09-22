#!/usr/bin/env node
/**
 * js/ai-portfolio.json'ı, Claude API kullanarak STOCKS + CRITERIA verisinden
 * kriterlere uygun, sektör bazında çeşitlendirilmiş bir örnek portföy +
 * gerekçe üretir.
 *
 * Kullanım:
 *   ANTHROPIC_API_KEY=... node scripts/generate-ai-portfolio.mjs
 *
 * Bu script haftalık olarak .github/workflows/refresh-price-data.yml
 * tarafından, fiyat verisi yenilendikten sonra çalıştırılır.
 */
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_JS_PATH = path.join(__dirname, "..", "js", "data.js");
const AI_PORTFOLIO_PATH = path.join(__dirname, "..", "js", "ai-portfolio.json");
const MODEL = "claude-opus-5";

const { STOCKS, CRITERIA } = require(DATA_JS_PATH);

const client = new Anthropic();

const PortfolioSchema = z.object({
  portfolioReasoning: z
    .string()
    .describe("Portföyün genel stratejisini, sektör dağılımını ve neden bu hisselerin seçildiğini özetleyen 3-5 cümlelik Türkçe bir paragraf."),
  stocks: z
    .array(
      z.object({
        symbol: z.string(),
        weightPct: z.number(),
        reasoning: z.string().describe("Bu hissenin neden seçildiğini açıklayan, somut sayılara (verim, payout, borç/özkaynak, temettü geçmişi) atıfta bulunan 1-2 cümlelik Türkçe metin."),
      }),
    )
    .describe("Seçilen hisseler ve ağırlıkları (yüzde, toplamda ~100 olmalı)."),
});

function buildPrompt() {
  const stocksJson = JSON.stringify(
    STOCKS.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      sector: s.sector,
      yieldPct: s.yieldPct,
      payoutPct: s.payoutPct,
      debtToEquity: s.debtToEquity,
      peRatio: s.peRatio,
      pbRatio: s.pbRatio,
      dividendYears: s.dividendYears,
      cyclical: s.cyclical,
      policyConsistent: s.policyConsistent,
    })),
    null,
    2,
  );

  return `Aşağıda BIST temettü hisse havuzu (STOCKS) ve tarama kriterleri (CRITERIA) var. Bu verilere dayanarak, kriterlere uygun, sektör bazında çeşitlendirilmiş bir örnek temettü portföyü kur ve her hisse için neden seçildiğini açıklayan kısa bir gerekçe yaz.

Kurallar:
- Sadece şu kriterleri geçen hisseleri önceliklendir: temettü verimi ${CRITERIA.yieldMin}-${CRITERIA.yieldMax} arası, payout oranı <= %${CRITERIA.payoutMax}, borç/özkaynak <= ${CRITERIA.debtToEquityMax}, temettü geçmişi >= ${CRITERIA.dividendYearsMin} yıl, value trap olmayan (F/K < ${CRITERIA.valueTrapPE} VE PD/DD < ${CRITERIA.valueTrapPB} birlikte olmamalı), temettü politikası tutarlı (policyConsistent: true).
- ${CRITERIA.minStocks}-${CRITERIA.maxStocks} arası hisse seç, en az ${CRITERIA.minSectors} farklı sektörden.
- Hiçbir sektörün toplam ağırlığı %${CRITERIA.maxSectorWeightPct}'i aşmasın.
- Ağırlıklar toplamda ~100 olmalı.
- Her hissenin gerekçesinde somut sayılara (verim, payout, borç/özkaynak, temettü geçmişi yılı) atıfta bulun.
- Bu örnek bir tarama aracıdır, yatırım tavsiyesi değildir; gerekçelerde bunu iddia etmeyen, açıklayıcı bir dil kullan.

STOCKS:
${stocksJson}

CRITERIA:
${JSON.stringify(CRITERIA, null, 2)}`;
}

async function main() {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    messages: [{ role: "user", content: buildPrompt() }],
    output_config: { format: zodOutputFormat(PortfolioSchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error("Model yapılandırılmış çıktı üretemedi (parsed_output null).");
  }

  // Bilinmeyen sembolleri at, mevcut STOCKS'takilerle sınırla
  const validSymbols = new Set(STOCKS.map((s) => s.symbol));
  const stocks = parsed.stocks.filter((s) => validSymbols.has(s.symbol));

  const output = {
    generatedAt: new Date().toISOString(),
    generatedBy: MODEL,
    portfolioReasoning: parsed.portfolioReasoning,
    stocks,
  };

  await fs.writeFile(AI_PORTFOLIO_PATH, JSON.stringify(output, null, 2) + "\n", "utf-8");
  console.log(`AI portföy önerisi yazıldı: ${stocks.length} hisse.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
