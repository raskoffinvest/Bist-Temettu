/**
 * BIST temettü aday hisse havuzu.
 * NOT: Aşağıdaki verim/payout/borç-özkaynak/F-K/PD-DD rakamları ÖRNEK/YER TUTUCU
 * değerlerdir. Gerçek portföy kararları için mutlaka güncel finansal tablolar
 * (enflasyon düzeltmeli TFRS/UMS 29 dahil) ve KAP verileriyle teyit edin.
 * Bu panel yatırım tavsiyesi değildir.
 *
 * cyclical: true = döngüsel sektör (ekonomik çevrime duyarlı), false = savunma/defansif
 * policyConsistent: temettü politikasının açık ve tarihsel olarak tutarlı uygulanıp uygulanmadığı
 */
const STOCKS = [
  // Bankacılık (döngüsel)
  { symbol: "ISCTR", name: "İş Bankası (C)", sector: "Bankacılık", yieldPct: 6.0, payoutPct: 25, debtToEquity: 0.9, dividendYears: 6, peRatio: 4.5, pbRatio: 1.0, cyclical: true, policyConsistent: true, note: "Kâr payı politikası düzenli değil, yıldan yıla değişebilir" },
  { symbol: "GARAN", name: "Garanti BBVA", sector: "Bankacılık", yieldPct: 4.5, payoutPct: 20, debtToEquity: 0.9, dividendYears: 4, peRatio: 5.0, pbRatio: 1.3, cyclical: true, policyConsistent: true, note: "" },
  { symbol: "AKBNK", name: "Akbank", sector: "Bankacılık", yieldPct: 4.0, payoutPct: 18, debtToEquity: 0.9, dividendYears: 4, peRatio: 5.2, pbRatio: 1.2, cyclical: true, policyConsistent: true, note: "" },
  { symbol: "YKBNK", name: "Yapı Kredi", sector: "Bankacılık", yieldPct: 4.2, payoutPct: 20, debtToEquity: 0.9, dividendYears: 3, peRatio: 4.8, pbRatio: 1.0, cyclical: true, policyConsistent: true, note: "" },
  { symbol: "HALKB", name: "Halkbank", sector: "Bankacılık", yieldPct: 3.0, payoutPct: 15, debtToEquity: 0.95, dividendYears: 2, peRatio: 3.5, pbRatio: 0.7, cyclical: true, policyConsistent: false, note: "Kamu bankası, temettü politikası değişken" },
  { symbol: "VAKBN", name: "VakıfBank", sector: "Bankacılık", yieldPct: 3.5, payoutPct: 18, debtToEquity: 0.95, dividendYears: 2, peRatio: 3.8, pbRatio: 0.8, cyclical: true, policyConsistent: false, note: "Kamu bankası, temettü politikası değişken" },

  // Holding (karma, ağırlıklı döngüsel)
  { symbol: "KCHOL", name: "Koç Holding", sector: "Holding", yieldPct: 4.2, payoutPct: 35, debtToEquity: 0.6, dividendYears: 10, peRatio: 8.0, pbRatio: 1.5, cyclical: true, policyConsistent: true, note: "Geniş sektör çeşitliliği (enerji, otomotiv, dayanıklı tüketim)" },
  { symbol: "SAHOL", name: "Sabancı Holding", sector: "Holding", yieldPct: 4.0, payoutPct: 30, debtToEquity: 0.6, dividendYears: 10, peRatio: 7.0, pbRatio: 1.2, cyclical: true, policyConsistent: true, note: "" },
  { symbol: "DOHOL", name: "Doğan Holding", sector: "Holding", yieldPct: 3.0, payoutPct: 20, debtToEquity: 0.7, dividendYears: 3, peRatio: 6.0, pbRatio: 0.9, cyclical: true, policyConsistent: false, note: "Kâr olsa da her zaman dağıtmayabiliyor, temettü geçmişi tutarsız" },

  // Enerji / Petrokimya (döngüsel)
  { symbol: "TUPRS", name: "Tüpraş", sector: "Enerji/Petrokimya", yieldPct: 6.5, payoutPct: 60, debtToEquity: 0.8, dividendYears: 8, peRatio: 6.5, pbRatio: 1.8, cyclical: true, policyConsistent: true, note: "Rafineri marjlarına duyarlı, döngüsel" },
  { symbol: "PETKM", name: "Petkim", sector: "Enerji/Petrokimya", yieldPct: 2.5, payoutPct: 40, debtToEquity: 0.7, dividendYears: 3, peRatio: 12.0, pbRatio: 1.0, cyclical: true, policyConsistent: false, note: "Marj baskısı dönemlerinde temettü düşebilir" },

  // Telekom (savunma karakterli)
  { symbol: "TTKOM", name: "Türk Telekom", sector: "Telekom", yieldPct: 6.0, payoutPct: 70, debtToEquity: 1.1, dividendYears: 5, peRatio: 9.0, pbRatio: 2.5, cyclical: false, policyConsistent: true, note: "Yüksek borç yükü izlenmeli" },
  { symbol: "TCELL", name: "Turkcell", sector: "Telekom", yieldPct: 5.0, payoutPct: 50, debtToEquity: 0.7, dividendYears: 9, peRatio: 8.5, pbRatio: 2.0, cyclical: false, policyConsistent: true, note: "Görece istikrarlı nakit akışı" },

  // GYO (döngüsel, inşaat/konut piyasasına bağlı)
  { symbol: "EKGYO", name: "Emlak Konut GYO", sector: "GYO", yieldPct: 5.5, payoutPct: 45, debtToEquity: 0.4, dividendYears: 6, peRatio: 7.5, pbRatio: 0.8, cyclical: true, policyConsistent: true, note: "Konut piyasası döngüsüne duyarlı" },
  { symbol: "ISGYO", name: "İş GYO", sector: "GYO", yieldPct: 4.0, payoutPct: 35, debtToEquity: 0.5, dividendYears: 4, peRatio: 9.0, pbRatio: 0.6, cyclical: true, policyConsistent: true, note: "" },
  { symbol: "HLGYO", name: "Halk GYO", sector: "GYO", yieldPct: 3.5, payoutPct: 30, debtToEquity: 0.5, dividendYears: 3, peRatio: 10.0, pbRatio: 0.6, cyclical: true, policyConsistent: true, note: "" },

  // Gıda / Tüketim (savunma, temel tüketim)
  { symbol: "ULKER", name: "Ülker Bisküvi", sector: "Gıda/Tüketim", yieldPct: 2.0, payoutPct: 25, debtToEquity: 0.6, dividendYears: 7, peRatio: 15.0, pbRatio: 3.0, cyclical: false, policyConsistent: true, note: "Büyüme odaklı, düşük verim" },
  { symbol: "CCOLA", name: "Coca-Cola İçecek", sector: "Gıda/Tüketim", yieldPct: 3.0, payoutPct: 35, debtToEquity: 0.5, dividendYears: 8, peRatio: 14.0, pbRatio: 2.8, cyclical: false, policyConsistent: true, note: "" },
  { symbol: "BANVT", name: "Banvit", sector: "Gıda/Tüketim", yieldPct: 4.5, payoutPct: 40, debtToEquity: 0.6, dividendYears: 4, peRatio: 9.0, pbRatio: 1.5, cyclical: false, policyConsistent: true, note: "" },

  // Sanayi / Otomotiv (döngüsel)
  { symbol: "FROTO", name: "Ford Otosan", sector: "Sanayi/Otomotiv", yieldPct: 3.5, payoutPct: 40, debtToEquity: 0.6, dividendYears: 9, peRatio: 7.0, pbRatio: 3.0, cyclical: true, policyConsistent: true, note: "İhracat ağırlıklı, kur avantajı" },
  { symbol: "TOASO", name: "Tofaş", sector: "Sanayi/Otomotiv", yieldPct: 4.0, payoutPct: 45, debtToEquity: 0.6, dividendYears: 8, peRatio: 7.5, pbRatio: 2.8, cyclical: true, policyConsistent: true, note: "" },
  { symbol: "ARCLK", name: "Arçelik", sector: "Sanayi/Otomotiv", yieldPct: 2.5, payoutPct: 30, debtToEquity: 0.9, dividendYears: 7, peRatio: 12.0, pbRatio: 1.4, cyclical: true, policyConsistent: true, note: "Beyaz eşya, Avrupa talebine duyarlı" },

  // Sigorta (nispeten savunma karakterli)
  { symbol: "AGESA", name: "AgeSA Hayat ve Emeklilik", sector: "Sigorta", yieldPct: 5.0, payoutPct: 50, debtToEquity: 0.3, dividendYears: 5, peRatio: 10.0, pbRatio: 4.0, cyclical: false, policyConsistent: true, note: "" },
  { symbol: "ANHYT", name: "Anadolu Hayat Emeklilik", sector: "Sigorta", yieldPct: 4.5, payoutPct: 45, debtToEquity: 0.3, dividendYears: 6, peRatio: 9.0, pbRatio: 3.5, cyclical: false, policyConsistent: true, note: "" },

  // Çimento (döngüsel, inşaat)
  { symbol: "AKCNS", name: "Akçansa", sector: "Çimento", yieldPct: 5.5, payoutPct: 55, debtToEquity: 0.5, dividendYears: 6, peRatio: 8.0, pbRatio: 1.6, cyclical: true, policyConsistent: true, note: "İnşaat sektörü döngüsüne duyarlı" },
  { symbol: "CIMSA", name: "Çimsa", sector: "Çimento", yieldPct: 4.0, payoutPct: 40, debtToEquity: 0.6, dividendYears: 5, peRatio: 9.0, pbRatio: 1.5, cyclical: true, policyConsistent: true, note: "" },

  // Ulaştırma (döngüsel, yüksek operasyonel kaldıraç)
  { symbol: "THYAO", name: "Türk Hava Yolları", sector: "Ulaştırma", yieldPct: 3.0, payoutPct: 20, debtToEquity: 1.3, dividendYears: 5, peRatio: 4.0, pbRatio: 1.1, cyclical: true, policyConsistent: true, note: "Yüksek operasyonel kaldıraç, yakıt fiyatı ve kur riskine duyarlı" },
];

/** Portföy önerisi kriterleri (özet konuşmadan). */
const CRITERIA = {
  yieldMin: 4,
  yieldMax: 7,
  payoutMax: 80,
  debtToEquityMax: 1.0,
  dividendYearsMin: 5,
  minStocks: 8,
  maxStocks: 15,
  minSectors: 3,
  maxSectorWeightPct: 35,
  valueTrapPE: 5,
  valueTrapPB: 1.0,
};
