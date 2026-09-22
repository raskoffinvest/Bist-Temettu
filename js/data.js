/**
 * BIST temettü aday hisse havuzu.
 * NOT: Aşağıdaki verim/payout/borç-özkaynak rakamları ÖRNEK/YER TUTUCU değerlerdir.
 * Gerçek portföy kararları için mutlaka güncel finansal tablolar ve KAP verileriyle
 * teyit edin. Bu panel yatırım tavsiyesi değildir.
 */
const STOCKS = [
  // Bankacılık
  { symbol: "ISCTR", name: "İş Bankası (C)", sector: "Bankacılık", yieldPct: 6.0, payoutPct: 25, debtToEquity: 0.9, dividendYears: 6, note: "Kâr payı politikası düzenli değil, yıldan yıla değişebilir" },
  { symbol: "GARAN", name: "Garanti BBVA", sector: "Bankacılık", yieldPct: 4.5, payoutPct: 20, debtToEquity: 0.9, dividendYears: 4, note: "" },
  { symbol: "AKBNK", name: "Akbank", sector: "Bankacılık", yieldPct: 4.0, payoutPct: 18, debtToEquity: 0.9, dividendYears: 4, note: "" },
  { symbol: "YKBNK", name: "Yapı Kredi", sector: "Bankacılık", yieldPct: 4.2, payoutPct: 20, debtToEquity: 0.9, dividendYears: 3, note: "" },
  { symbol: "HALKB", name: "Halkbank", sector: "Bankacılık", yieldPct: 3.0, payoutPct: 15, debtToEquity: 0.95, dividendYears: 2, note: "Kamu bankası, temettü politikası değişken" },
  { symbol: "VAKBN", name: "VakıfBank", sector: "Bankacılık", yieldPct: 3.5, payoutPct: 18, debtToEquity: 0.95, dividendYears: 2, note: "Kamu bankası, temettü politikası değişken" },

  // Holding
  { symbol: "KCHOL", name: "Koç Holding", sector: "Holding", yieldPct: 4.2, payoutPct: 35, debtToEquity: 0.6, dividendYears: 10, note: "Geniş sektör çeşitliliği (enerji, otomotiv, dayanıklı tüketim)" },
  { symbol: "SAHOL", name: "Sabancı Holding", sector: "Holding", yieldPct: 4.0, payoutPct: 30, debtToEquity: 0.6, dividendYears: 10, note: "" },
  { symbol: "DOHOL", name: "Doğan Holding", sector: "Holding", yieldPct: 3.0, payoutPct: 20, debtToEquity: 0.7, dividendYears: 3, note: "Temettü geçmişi tutarsız" },

  // Enerji / Petrokimya
  { symbol: "TUPRS", name: "Tüpraş", sector: "Enerji/Petrokimya", yieldPct: 6.5, payoutPct: 60, debtToEquity: 0.8, dividendYears: 8, note: "Rafineri marjlarına duyarlı, döngüsel" },
  { symbol: "PETKM", name: "Petkim", sector: "Enerji/Petrokimya", yieldPct: 2.5, payoutPct: 40, debtToEquity: 0.7, dividendYears: 3, note: "Marj baskısı dönemlerinde temettü düşebilir" },

  // Telekom
  { symbol: "TTKOM", name: "Türk Telekom", sector: "Telekom", yieldPct: 6.0, payoutPct: 70, debtToEquity: 1.1, dividendYears: 5, note: "Yüksek borç yükü izlenmeli" },
  { symbol: "TCELL", name: "Turkcell", sector: "Telekom", yieldPct: 5.0, payoutPct: 50, debtToEquity: 0.7, dividendYears: 9, note: "Görece istikrarlı nakit akışı" },

  // GYO
  { symbol: "EKGYO", name: "Emlak Konut GYO", sector: "GYO", yieldPct: 5.5, payoutPct: 45, debtToEquity: 0.4, dividendYears: 6, note: "Konut piyasası döngüsüne duyarlı" },
  { symbol: "ISGYO", name: "İş GYO", sector: "GYO", yieldPct: 4.0, payoutPct: 35, debtToEquity: 0.5, dividendYears: 4, note: "" },
  { symbol: "HLGYO", name: "Halk GYO", sector: "GYO", yieldPct: 3.5, payoutPct: 30, debtToEquity: 0.5, dividendYears: 3, note: "" },

  // Gıda / Tüketim
  { symbol: "ULKER", name: "Ülker Bisküvi", sector: "Gıda/Tüketim", yieldPct: 2.0, payoutPct: 25, debtToEquity: 0.6, dividendYears: 7, note: "Büyüme odaklı, düşük verim" },
  { symbol: "CCOLA", name: "Coca-Cola İçecek", sector: "Gıda/Tüketim", yieldPct: 3.0, payoutPct: 35, debtToEquity: 0.5, dividendYears: 8, note: "" },
  { symbol: "BANVT", name: "Banvit", sector: "Gıda/Tüketim", yieldPct: 4.5, payoutPct: 40, debtToEquity: 0.6, dividendYears: 4, note: "" },

  // Sanayi / Otomotiv
  { symbol: "FROTO", name: "Ford Otosan", sector: "Sanayi/Otomotiv", yieldPct: 3.5, payoutPct: 40, debtToEquity: 0.6, dividendYears: 9, note: "İhracat ağırlıklı, kur avantajı" },
  { symbol: "TOASO", name: "Tofaş", sector: "Sanayi/Otomotiv", yieldPct: 4.0, payoutPct: 45, debtToEquity: 0.6, dividendYears: 8, note: "" },
  { symbol: "ARCLK", name: "Arçelik", sector: "Sanayi/Otomotiv", yieldPct: 2.5, payoutPct: 30, debtToEquity: 0.9, dividendYears: 7, note: "Beyaz eşya, Avrupa talebine duyarlı" },

  // Sigorta
  { symbol: "AGESA", name: "AgeSA Hayat ve Emeklilik", sector: "Sigorta", yieldPct: 5.0, payoutPct: 50, debtToEquity: 0.3, dividendYears: 5, note: "" },
  { symbol: "ANHYT", name: "Anadolu Hayat Emeklilik", sector: "Sigorta", yieldPct: 4.5, payoutPct: 45, debtToEquity: 0.3, dividendYears: 6, note: "" },

  // Çimento
  { symbol: "AKCNS", name: "Akçansa", sector: "Çimento", yieldPct: 5.5, payoutPct: 55, debtToEquity: 0.5, dividendYears: 6, note: "İnşaat sektörü döngüsüne duyarlı" },
  { symbol: "CIMSA", name: "Çimsa", sector: "Çimento", yieldPct: 4.0, payoutPct: 40, debtToEquity: 0.6, dividendYears: 5, note: "" },
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
};
