/**
 * BIST temettü aday hisse havuzu.
 * NOT: yieldPct/payoutPct/debtToEquity/peRatio/pbRatio değerleri ÖRNEK/YER TUTUCU'dur.
 * currentPrice/support/resistance alanları web aramasıyla çekilen GÜNCEL (ama anlık
 * olmayan, "priceAsOfDate" tarihli) verilerdir — canlı bir borsa akışı DEĞİLDİR.
 * geoRisk/manipRisk notları genel/yapısal değerlendirmelerdir (halka açıklık oranı,
 * sektör/ortaklık yapısı gibi), belirli bir manipülasyon iddiası içermez.
 * Gerçek portföy kararları için mutlaka güncel finansal tablolar ve KAP verileriyle
 * teyit edin. Bu panel yatırım tavsiyesi değildir.
 *
 * cyclical: true = döngüsel sektör, false = savunma/defansif
 * policyConsistent: temettü politikasının açık ve tarihsel olarak tutarlı uygulanıp uygulanmadığı
 */
const STOCKS = [
  // Bankacılık (döngüsel)
  { symbol: "ISCTR", name: "İş Bankası (C)", sector: "Bankacılık", yieldPct: 6.0, payoutPct: 25, debtToEquity: 0.9, dividendYears: 6, peRatio: 4.5, pbRatio: 1.0, cyclical: true, policyConsistent: true, note: "Kâr payı politikası düzenli değil, yıldan yıla değişebilir",
    geoRisk: "Türkiye risk primi (CDS) ve ABD/AB yaptırım gündemine duyarlı; makro şoklarda banka hisseleri ilk tepki veren grup olur.",
    manipRisk: "Görece yüksek halka açıklık ve kurumsal yatırımcı takibi manipülasyon riskini azaltır, ama piyasa geneli oynaklığına tabi.",
    currentPrice: 13.90, priceAsOfDate: "2026-09-21", support1: 13.63, support2: 13.09, resistance1: 14.18, resistance2: 14.58, sourceUrl: "https://uzmanpara.milliyet.com.tr/hisse/teknik-analiz/ISCTR/" },
  { symbol: "GARAN", name: "Garanti BBVA", sector: "Bankacılık", yieldPct: 4.5, payoutPct: 20, debtToEquity: 0.9, dividendYears: 4, peRatio: 5.0, pbRatio: 1.3, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "BBVA ortaklığı üzerinden AB/İspanya bağlantılı; Türkiye risk primi ve küresel banka sektörü düzenlemelerine duyarlı.",
    manipRisk: "Yüksek işlem hacmi ve yabancı takip oranı nedeniyle düşük-orta risk.",
    currentPrice: 133.50, priceAsOfDate: "2026-09-21", support1: 121.67, support2: 114.33, resistance1: 134.67, resistance2: 140.33, sourceUrl: "https://tr.tradingview.com/symbols/BIST-GARAN/technicals/" },
  { symbol: "AKBNK", name: "Akbank", sector: "Bankacılık", yieldPct: 4.0, payoutPct: 18, debtToEquity: 0.9, dividendYears: 4, peRatio: 5.2, pbRatio: 1.2, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "Türkiye risk primi ve para politikası kararlarına duyarlı; doğrudan jeopolitik etkisi sınırlı.",
    manipRisk: "Sabancı Holding çatısı altında kurumsal yönetim görece güçlü, manipülasyon riski düşük-orta.",
    currentPrice: 68.75, priceAsOfDate: "2026-09-21", support1: 67.08, support2: 66.00, resistance1: 71.08, resistance2: 72.00, sourceUrl: "https://borsaverileri.com/bist-akbnk-akbank-hisse-teknik-analiz-son-durum.html" },
  { symbol: "YKBNK", name: "Yapı Kredi", sector: "Bankacılık", yieldPct: 4.2, payoutPct: 20, debtToEquity: 0.9, dividendYears: 3, peRatio: 4.8, pbRatio: 1.0, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "Koç Holding ve UniCredit geçmişi nedeniyle Avrupa bankacılık düzenlemeleri ve Türkiye risk primine duyarlı.",
    manipRisk: "Görece yüksek halka açıklık, düşük-orta manipülasyon riski.",
    currentPrice: 34.00, priceAsOfDate: "2026-09-21", support1: 33.28, support2: 32.70, resistance1: 34.80, resistance2: 35.90, sourceUrl: "https://tr.tradingview.com/symbols/BIST-YKBNK/technicals/" },
  { symbol: "HALKB", name: "Halkbank", sector: "Bankacılık", yieldPct: 3.0, payoutPct: 15, debtToEquity: 0.95, dividendYears: 2, peRatio: 3.5, pbRatio: 0.7, cyclical: true, policyConsistent: false, note: "Kamu bankası, temettü politikası değişken",
    geoRisk: "Kamu bankası olması nedeniyle uluslararası yaptırım/soruşturma gündemlerine (geçmişte ABD ile ilgili davalar) ve siyasi karar mekanizmasına yüksek duyarlılık taşır.",
    manipRisk: "Kamu kontrolü nedeniyle yönetim kararları siyasi etkiye açık olabilir, bu da fiyat davranışını piyasa dışı faktörlerle hareket ettirebilir.",
    currentPrice: 46.52, priceAsOfDate: "2026-09-21", support1: 44.15, support2: 43.05, resistance1: 46.75, resistance2: 48.25, sourceUrl: "https://www.borsametre.com.tr/teknik-analizler/halkb-ve-banka-endeksinde-one-cikan-destek-ve-direnc-seviyeleri-138087h" },
  { symbol: "VAKBN", name: "VakıfBank", sector: "Bankacılık", yieldPct: 3.5, payoutPct: 18, debtToEquity: 0.95, dividendYears: 2, peRatio: 3.8, pbRatio: 0.8, cyclical: true, policyConsistent: false, note: "Kamu bankası, temettü politikası değişken",
    geoRisk: "Kamu bankası; Halkbank'a benzer şekilde siyasi/düzenleyici karar mekanizmalarına ve kamu maliyesi politikalarına duyarlı.",
    manipRisk: "Kamu kontrolü nedeniyle yönetim kararları siyasi etkiye açık olabilir.",
    currentPrice: 31.42, priceAsOfDate: "2026-09-21", support1: 31.07, support2: null, resistance1: 33.35, resistance2: null, sourceUrl: "https://borsaverileri.com/bist-vakbn-vakiflarbankasi-hisse-teknik-analiz-son-durum.html" },

  // Holding (karma, ağırlıklı döngüsel)
  { symbol: "KCHOL", name: "Koç Holding", sector: "Holding", yieldPct: 4.2, payoutPct: 35, debtToEquity: 0.6, dividendYears: 10, peRatio: 8.0, pbRatio: 1.5, cyclical: true, policyConsistent: true, note: "Geniş sektör çeşitliliği (enerji, otomotiv, dayanıklı tüketim)",
    geoRisk: "Enerji (Tüpraş, Aygaz) ve otomotiv (Ford Otosan, Tofaş) kolları üzerinden küresel emtia fiyatları ve AB ticaret ilişkilerine dolaylı maruziyet.",
    manipRisk: "Yüksek piyasa değeri, geniş halka açıklık ve kurumsal takip nedeniyle manipülasyon riski düşük.",
    currentPrice: 222.30, priceAsOfDate: "2026-09-21", support1: 203.00, support2: 197.00, resistance1: 229.90, resistance2: null, sourceUrl: "https://atayatirim.com.tr/hisse/kchol" },
  { symbol: "SAHOL", name: "Sabancı Holding", sector: "Holding", yieldPct: 4.0, payoutPct: 30, debtToEquity: 0.6, dividendYears: 10, peRatio: 7.0, pbRatio: 1.2, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "Bankacılık (Akbank) ve enerji kolları üzerinden Türkiye risk primine ve küresel enerji fiyatlarına dolaylı maruziyet.",
    manipRisk: "Yüksek piyasa değeri ve kurumsal takip nedeniyle manipülasyon riski düşük.",
    currentPrice: 89.60, priceAsOfDate: "2026-09-21", support1: 87.00, support2: 83.55, resistance1: 94.95, resistance2: 99.00, sourceUrl: "https://atayatirim.com.tr/hisse/sahol" },
  { symbol: "DOHOL", name: "Doğan Holding", sector: "Holding", yieldPct: 3.0, payoutPct: 20, debtToEquity: 0.7, dividendYears: 3, peRatio: 6.0, pbRatio: 0.9, cyclical: true, policyConsistent: false, note: "Kâr olsa da her zaman dağıtmayabiliyor, temettü geçmişi tutarsız",
    geoRisk: "Enerji ve sanayi kollarındaki çeşitlilik nedeniyle küresel emtia/kur şoklarına duyarlı.",
    manipRisk: "Diğer büyük holdinglere kıyasla daha düşük piyasa değeri ve halka açıklık, fiyat hareketlerini daha oynak hale getirebilir — özellikle işlem hacminin düştüğü dönemlerde dikkatli olunmalı.",
    currentPrice: 21.56, priceAsOfDate: "2026-09-21", support1: 20.77, support2: null, resistance1: 21.89, resistance2: null, sourceUrl: "https://borsaverileri.com/bist-dohol-doganholding-hisse-teknik-analiz-son-durum.html" },

  // Enerji / Petrokimya (döngüsel)
  { symbol: "TUPRS", name: "Tüpraş", sector: "Enerji/Petrokimya", yieldPct: 6.5, payoutPct: 60, debtToEquity: 0.8, dividendYears: 8, peRatio: 6.5, pbRatio: 1.8, cyclical: true, policyConsistent: true, note: "Rafineri marjlarına duyarlı, döngüsel",
    geoRisk: "Ham petrol tedariki ve rafineri marjları küresel jeopolitik olaylara (Orta Doğu, Rusya-Ukrayna, OPEC+ kararları) doğrudan bağlı; olası yaptırım/ambargo gündemleri fiyatı ani etkileyebilir.",
    manipRisk: "Yüksek işlem hacmi ve kurumsal yatırımcı ağırlığı riski azaltır, ama küresel haber akışına aşırı duyarlı ani sert hareketler görülebilir.",
    currentPrice: 410.00, priceAsOfDate: "2026-09-21", support1: 406.33, support2: 395.67, resistance1: 422.33, resistance2: 427.67, sourceUrl: "https://www.borsametre.com.tr/teknik-analizler/tuprs-hisse-analizi-iste-guncel-destek-ve-direnc-seviyeleri-138079h" },
  { symbol: "PETKM", name: "Petkim", sector: "Enerji/Petrokimya", yieldPct: 2.5, payoutPct: 40, debtToEquity: 0.7, dividendYears: 3, peRatio: 12.0, pbRatio: 1.0, cyclical: true, policyConsistent: false, note: "Marj baskısı dönemlerinde temettü düşebilir",
    geoRisk: "Petrokimya girdi maliyetleri (nafta) küresel enerji fiyatlarına ve döviz kuruna bağlı; SOCAR ortaklığı nedeniyle bölgesel enerji politikalarına dolaylı maruziyet.",
    manipRisk: "Görece düşük halka açıklık oranı (SOCAR çoğunluk hissedar), işlem hacminin düşük olduğu dönemlerde fiyat oynaklığı artabilir.",
    currentPrice: 20.10, priceAsOfDate: "2026-09-21", support1: 19.00, support2: null, resistance1: 20.76, resistance2: 21.10, sourceUrl: "https://www.borsametre.com.tr/teknik-analizler/petkm-hisselerinde-teknik-seviyeler-neler-138113h" },

  // Telekom (savunma karakterli)
  { symbol: "TTKOM", name: "Türk Telekom", sector: "Telekom", yieldPct: 6.0, payoutPct: 70, debtToEquity: 1.1, dividendYears: 5, peRatio: 9.0, pbRatio: 2.5, cyclical: false, policyConsistent: true, note: "Yüksek borç yükü izlenmeli",
    geoRisk: "BTK düzenlemeleri ve devlet/kamu hissedarlık yapısı nedeniyle siyasi/düzenleyici karar risklerine duyarlı.",
    manipRisk: "Büyük piyasa değeri ve kurumsal takip nedeniyle düşük-orta risk.",
    currentPrice: 49.84, priceAsOfDate: "2026-09-21", support1: 48.33, support2: 44.67, resistance1: 56.33, resistance2: 60.67, sourceUrl: "https://finans.mynet.com/haber/detay/borsa/turk-telekom-ttkom-21-eylul-pazartesi-2026-gunluk-teknik-analiz/575798/" },
  { symbol: "TCELL", name: "Turkcell", sector: "Telekom", yieldPct: 5.0, payoutPct: 50, debtToEquity: 0.7, dividendYears: 9, peRatio: 8.5, pbRatio: 2.0, cyclical: false, policyConsistent: true, note: "Görece istikrarlı nakit akışı",
    geoRisk: "BTK düzenlemelerine duyarlı; doğrudan jeopolitik etkisi sınırlı, görece savunma karakterli.",
    manipRisk: "Yüksek halka açıklık ve ADR (NYSE) çift kotasyonu şeffaflığı artırır, manipülasyon riski düşük.",
    currentPrice: 113.40, priceAsOfDate: "2026-09-21", support1: 111.20, support2: 106.00, resistance1: 129.60, resistance2: 138.00, sourceUrl: "https://www.hisse.net/borsa/hisseler/tcell-turkcell" },

  // GYO (döngüsel, inşaat/konut piyasasına bağlı)
  { symbol: "EKGYO", name: "Emlak Konut GYO", sector: "GYO", yieldPct: 5.5, payoutPct: 45, debtToEquity: 0.4, dividendYears: 6, peRatio: 7.5, pbRatio: 0.8, cyclical: true, policyConsistent: true, note: "Konut piyasası döngüsüne duyarlı",
    geoRisk: "TOKİ/kamu bağlantılı yönetim yapısı nedeniyle konut politikası kararlarına ve faiz oranı ortamına duyarlı; doğrudan jeopolitik etkisi sınırlı.",
    manipRisk: "Kamu payının yüksekliği yönetim kararlarında siyasi etki riski taşır.",
    currentPrice: 20.06, priceAsOfDate: "2026-09-21", support1: 19.02, support2: null, resistance1: 20.10, resistance2: null, sourceUrl: "https://www.gcmyatirim.com.tr/borsa/hisse/ekgyo-hisse-emlak-konut-gayrimenkul-yatirim-ortakligi-a-s" },
  { symbol: "ISGYO", name: "İş GYO", sector: "GYO", yieldPct: 4.0, payoutPct: 35, debtToEquity: 0.5, dividendYears: 4, peRatio: 9.0, pbRatio: 0.6, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "Konut/ticari gayrimenkul piyasasına ve faiz oranı ortamına duyarlı; doğrudan jeopolitik etkisi sınırlı.",
    manipRisk: "Görece düşük işlem hacmi olabilen küçük-orta ölçekli bir GYO; likidite düştüğünde fiyat oynaklığı artabilir.",
    currentPrice: 23.40, priceAsOfDate: "2026-09-21", support1: 21.82, support2: 21.50, resistance1: 23.98, resistance2: null, sourceUrl: "https://www.getmidas.com/canli-borsa/isgyo-hisse/" },
  { symbol: "HLGYO", name: "Halk GYO", sector: "GYO", yieldPct: 3.5, payoutPct: 30, debtToEquity: 0.5, dividendYears: 3, peRatio: 10.0, pbRatio: 0.6, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "Kamu bankası (Halkbank) iştiraki; konut piyasası ve kamu bankacılık politikalarına dolaylı bağımlılık.",
    manipRisk: "Küçük ölçekli ve düşük işlem hacmi, likidite düştüğünde fiyat oynaklığı riski taşıyabilir.",
    currentPrice: 4.92, priceAsOfDate: "2026-09-21", support1: 4.56, support2: 4.46, resistance1: 6.20, resistance2: 6.61, sourceUrl: "https://finans.cnnturk.com/borsa/teknik-analiz/HLGYO" },

  // Gıda / Tüketim (savunma, temel tüketim)
  { symbol: "ULKER", name: "Ülker Bisküvi", sector: "Gıda/Tüketim", yieldPct: 2.0, payoutPct: 25, debtToEquity: 0.6, dividendYears: 7, peRatio: 15.0, pbRatio: 3.0, cyclical: false, policyConsistent: true, note: "Büyüme odaklı, düşük verim",
    geoRisk: "İhracat pazarları (Orta Doğu, Afrika) bölgesel gerginliklere duyarlı; girdi maliyetleri (kakao, şeker) küresel emtia şoklarından etkilenir.",
    manipRisk: "Yıldız Holding çatısı ve görece yüksek halka açıklık, manipülasyon riskini azaltır.",
    currentPrice: 112.60, priceAsOfDate: "2026-09-21", support1: 101.20, support2: 98.70, resistance1: 115.00, resistance2: null, sourceUrl: "https://finans.mynet.com/haber/detay/borsa/ulker-biskuvi-ulker-21-eylul-pazartesi-2026-gunluk-teknik-analiz/575833/" },
  { symbol: "CCOLA", name: "Coca-Cola İçecek", sector: "Gıda/Tüketim", yieldPct: 3.0, payoutPct: 35, debtToEquity: 0.5, dividendYears: 8, peRatio: 14.0, pbRatio: 2.8, cyclical: false, policyConsistent: true, note: "",
    geoRisk: "Orta Asya ve Orta Doğu operasyonları bölgesel jeopolitik risklere maruz; şişe/ambalaj girdi maliyetleri küresel emtia fiyatlarına duyarlı.",
    manipRisk: "Coca-Cola ve Anadolu Grubu çok uluslu ortaklık yapısı şeffaflığı artırır, manipülasyon riski düşük.",
    currentPrice: 85.80, priceAsOfDate: "2026-09-21", support1: 83.15, support2: null, resistance1: 87.10, resistance2: null, sourceUrl: "https://www.gcmyatirim.com.tr/borsa/hisse/ccola-hisse-coca-cola-icecek-a-s" },
  { symbol: "BANVT", name: "Banvit", sector: "Gıda/Tüketim", yieldPct: 4.5, payoutPct: 40, debtToEquity: 0.6, dividendYears: 4, peRatio: 9.0, pbRatio: 1.5, cyclical: false, policyConsistent: true, note: "",
    geoRisk: "Yem hammaddesi (mısır, soya) ithalatı küresel tarım emtia fiyatlarına ve kur riskine duyarlı.",
    manipRisk: "Görece düşük işlem hacmi, likidite düştüğünde fiyat oynaklığı riski taşıyabilir.",
    currentPrice: 164.10, priceAsOfDate: "2026-09-21", support1: 157.20, support2: 150.40, resistance1: 177.50, resistance2: 182.20, sourceUrl: "https://ekofin.net/sirket/detay/BANVT/teknik" },

  // Sanayi / Otomotiv (döngüsel)
  { symbol: "FROTO", name: "Ford Otosan", sector: "Sanayi/Otomotiv", yieldPct: 3.5, payoutPct: 40, debtToEquity: 0.6, dividendYears: 9, peRatio: 7.0, pbRatio: 3.0, cyclical: true, policyConsistent: true, note: "İhracat ağırlıklı, kur avantajı",
    geoRisk: "AB pazarına ihracat ağırlıklı; AB gümrük/ticaret politikaları, tedarik zinciri şokları (yarı iletken, enerji) ve olası ticaret savaşlarına duyarlı.",
    manipRisk: "Ford ortaklığı ve yüksek kurumsal takip, manipülasyon riskini azaltır.",
    currentPrice: 90.00, priceAsOfDate: "2026-09-07", support1: 84.85, support2: 81.00, resistance1: 100.00, resistance2: 110.00, sourceUrl: "https://www.habergo.com.tr/haber/bist-te-kritik-seviyeler-asels-tcell-froto-ve-ekgyo-icin-7-eylul-teknik-gorunum" },
  { symbol: "TOASO", name: "Tofaş", sector: "Sanayi/Otomotiv", yieldPct: 4.0, payoutPct: 45, debtToEquity: 0.6, dividendYears: 8, peRatio: 7.5, pbRatio: 2.8, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "Stellantis (Fiat) ortaklığı üzerinden AB pazarı ve küresel otomotiv tedarik zinciri risklerine maruz.",
    manipRisk: "Koç Holding ve Stellantis ortaklığı, kurumsal yönetim şeffaflığını destekler.",
    // Not: Kaynaktaki destek/direnç seviyeleri güncel fiyatla (317 TL) tutarsız görünüyordu
    // (direnç < güncel fiyat) — muhtemelen eski bir fiyat aralığı, bu yüzden boş bırakıldı.
    currentPrice: 317.00, priceAsOfDate: "2026-09-21", support1: null, support2: null, resistance1: null, resistance2: null, sourceUrl: "https://www.borsametre.com.tr/piyasalar/toasoda-hacimli-yukselis-direnc-ve-destek-noktalari-138200h" },
  { symbol: "ARCLK", name: "Arçelik", sector: "Sanayi/Otomotiv", yieldPct: 2.5, payoutPct: 30, debtToEquity: 0.9, dividendYears: 7, peRatio: 12.0, pbRatio: 1.4, cyclical: true, policyConsistent: true, note: "Beyaz eşya, Avrupa talebine duyarlı",
    geoRisk: "Avrupa pazarına yüksek bağımlılık; enerji fiyatları, AB ticaret politikaları ve tüketici güveni dalgalanmalarına duyarlı.",
    manipRisk: "Koç Holding çatısı ve yüksek halka açıklık, manipülasyon riskini azaltır.",
    currentPrice: 115.20, priceAsOfDate: "2026-09-21", support1: 113.33, support2: 108.67, resistance1: null, resistance2: null, sourceUrl: "https://www.borsaverileri.com/bist-arclk-arcelik-hisse-teknik-analiz-son-durum.html" },

  // Sigorta (nispeten savunma karakterli)
  { symbol: "AGESA", name: "AgeSA Hayat ve Emeklilik", sector: "Sigorta", yieldPct: 5.0, payoutPct: 50, debtToEquity: 0.3, dividendYears: 5, peRatio: 10.0, pbRatio: 4.0, cyclical: false, policyConsistent: true, note: "",
    geoRisk: "Faiz oranı politikası ve BES teşviklerine duyarlı; doğrudan jeopolitik etkisi sınırlı, savunma karakterli.",
    manipRisk: "Görece düşük işlem hacmi, likidite düştüğünde ani fiyat hareketleri görülebilir.",
    currentPrice: 232.20, priceAsOfDate: "2026-09-21", support1: null, support2: null, resistance1: null, resistance2: null, sourceUrl: "https://tr.tradingview.com/symbols/BIST-AGESA/technicals/" },
  { symbol: "ANHYT", name: "Anadolu Hayat Emeklilik", sector: "Sigorta", yieldPct: 4.5, payoutPct: 45, debtToEquity: 0.3, dividendYears: 6, peRatio: 9.0, pbRatio: 3.5, cyclical: false, policyConsistent: true, note: "",
    geoRisk: "Faiz oranı politikası ve BES teşviklerine duyarlı; doğrudan jeopolitik etkisi sınırlı.",
    manipRisk: "İş Bankası/Anadolu Grubu ortaklık yapısı görece şeffaf, ama işlem hacmi düşük olabilir.",
    currentPrice: 105.60, priceAsOfDate: "2026-09-21", support1: null, support2: null, resistance1: 112.73, resistance2: 122.93, sourceUrl: "https://tr.tradingview.com/symbols/BIST-ANHYT/technicals/" },

  // Çimento (döngüsel, inşaat)
  { symbol: "AKCNS", name: "Akçansa", sector: "Çimento", yieldPct: 5.5, payoutPct: 55, debtToEquity: 0.5, dividendYears: 6, peRatio: 8.0, pbRatio: 1.6, cyclical: true, policyConsistent: true, note: "İnşaat sektörü döngüsüne duyarlı",
    geoRisk: "İhracat pazarları (Afrika, ABD) ve enerji (kömür/elektrik) maliyetleri küresel emtia şoklarına duyarlı.",
    manipRisk: "Sabancı/Heidelberg ortaklığı kurumsal yönetimi destekler, ama işlem hacmi görece düşük olabilir.",
    currentPrice: 133.80, priceAsOfDate: "2026-09-21", support1: 133.20, support2: 122.30, resistance1: 139.50, resistance2: 146.40, sourceUrl: "https://atayatirim.com.tr/hisse/akcns" },
  { symbol: "CIMSA", name: "Çimsa", sector: "Çimento", yieldPct: 4.0, payoutPct: 40, debtToEquity: 0.6, dividendYears: 5, peRatio: 9.0, pbRatio: 1.5, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "İhracat ağırlıklı (ABD, Afrika) yapı; enerji maliyetleri ve küresel inşaat talebine duyarlı.",
    manipRisk: "Sabancı Holding çatısı kurumsal yönetimi destekler.",
    // Not: Kaynaktaki destek/direnç seviyeleri güncel fiyatla (48.54 TL) tutarsız görünüyordu
    // (direnç < güncel fiyat) — muhtemelen eski bir fiyat aralığı, bu yüzden boş bırakıldı.
    currentPrice: 48.54, priceAsOfDate: "2026-09-21", support1: null, support2: null, resistance1: null, resistance2: null, sourceUrl: "https://finans.mynet.com/haber/detay/borsa/cimsa-cimsa-21-eylul-pazartesi-2026-gunluk-teknik-analiz/575866/" },

  // Ulaştırma (döngüsel, yüksek operasyonel kaldıraç)
  { symbol: "THYAO", name: "Türk Hava Yolları", sector: "Ulaştırma", yieldPct: 3.0, payoutPct: 20, debtToEquity: 1.3, dividendYears: 5, peRatio: 4.0, pbRatio: 1.1, cyclical: true, policyConsistent: true, note: "Yüksek operasyonel kaldıraç, yakıt fiyatı ve kur riskine duyarlı",
    geoRisk: "Doğrudan yüksek jeopolitik risk taşır: hava sahası kapanmaları, savaş/çatışma bölgeleri, terör olayları ve petrol/yakıt fiyat şokları operasyonları anında etkiler.",
    manipRisk: "Yüksek işlem hacmi ve yabancı takip oranı manipülasyon riskini azaltır, ama jeopolitik haber akışına karşı fiyat aşırı oynak olabilir.",
    currentPrice: 293.50, priceAsOfDate: "2026-09-22", support1: 279.67, support2: 266.33, resistance1: 299.67, resistance2: 306.33, sourceUrl: "https://finans.mynet.com/haber/detay/borsa/turk-hava-yollari-thyao-22-eylul-sali-2026-gunluk-teknik-analiz/576125/" },
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
