/**
 * BIST temettü aday hisse havuzu.
 * NOT: Bazı hisselerin yieldPct/payoutPct/debtToEquity/peRatio/pbRatio/dividendYears
 * değerleri web araştırmasıyla doğrulanmış GERÇEK verilerdir (bkz. ilgili "note"
 * alanı — kaynak çelişkileri varsa orada açıklanmıştır). Henüz araştırılmamış
 * hisselerde bu alanlar hâlâ ÖRNEK/YER TUTUCU olabilir — "note" alanında böyle bir
 * uyarı yoksa temkinli olun ve KAP/güncel finansal tablolarla teyit edin.
 * geoRisk/manipRisk notları genel/yapısal değerlendirmelerdir (halka açıklık oranı,
 * sektör/ortaklık yapısı gibi), belirli bir manipülasyon iddiası içermez.
 * Bu panel yatırım tavsiyesi değildir.
 *
 * Güncel fiyat/destek/direnç verileri BURADA DEĞİL, js/price-data.json içinde
 * tutulur — o dosya scripts/refresh-price-data.mjs ile (haftalık GitHub Actions
 * üzerinden) otomatik güncellenir, bu dosyadaki elle küratörlüğü yapılmış
 * alanlar değişmeden kalır. app.js sayfa yüklenirken ikisini sembol bazında
 * birleştirir.
 *
 * cyclical: true = döngüsel sektör, false = savunma/defansif
 * policyConsistent: temettü politikasının açık ve tarihsel olarak tutarlı uygulanıp uygulanmadığı
 */
const STOCKS = [
  // Bankacılık (döngüsel)
  { symbol: "ISCTR", verified: true, name: "İş Bankası (C)", sector: "Bankacılık", yieldPct: 3.18, payoutPct: 16.54, debtToEquity: null, dividendYears: 6, peRatio: 7.0, pbRatio: 0.96, cyclical: true, policyConsistent: true, note: "2019-2020 döneminde temettü kesintisi yaşadı, 2021'den beri kesintisiz (6. yıl). Banka olduğu için klasik borç/özkaynak oranı anlamlı değil, null bırakıldı. Verim %3.18 ile hedef bandın (%4-7) altında kalıyor.",
    geoRisk: "Türkiye risk primi (CDS) ve ABD/AB yaptırım gündemine duyarlı; makro şoklarda banka hisseleri ilk tepki veren grup olur.",
    manipRisk: "Görece yüksek halka açıklık ve kurumsal yatırımcı takibi manipülasyon riskini azaltır, ama piyasa geneli oynaklığına tabi." },
  { symbol: "GARAN", verified: false, name: "Garanti BBVA", sector: "Bankacılık", yieldPct: 4.5, payoutPct: 20, debtToEquity: 0.9, dividendYears: 4, peRatio: 5.0, pbRatio: 1.3, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "BBVA ortaklığı üzerinden AB/İspanya bağlantılı; Türkiye risk primi ve küresel banka sektörü düzenlemelerine duyarlı.",
    manipRisk: "Yüksek işlem hacmi ve yabancı takip oranı nedeniyle düşük-orta risk." },
  { symbol: "AKBNK", verified: false, name: "Akbank", sector: "Bankacılık", yieldPct: 4.0, payoutPct: 18, debtToEquity: 0.9, dividendYears: 4, peRatio: 5.2, pbRatio: 1.2, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "Türkiye risk primi ve para politikası kararlarına duyarlı; doğrudan jeopolitik etkisi sınırlı.",
    manipRisk: "Sabancı Holding çatısı altında kurumsal yönetim görece güçlü, manipülasyon riski düşük-orta." },
  { symbol: "YKBNK", verified: false, name: "Yapı Kredi", sector: "Bankacılık", yieldPct: 4.2, payoutPct: 20, debtToEquity: 0.9, dividendYears: 3, peRatio: 4.8, pbRatio: 1.0, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "Koç Holding ve UniCredit geçmişi nedeniyle Avrupa bankacılık düzenlemeleri ve Türkiye risk primine duyarlı.",
    manipRisk: "Görece yüksek halka açıklık, düşük-orta manipülasyon riski." },
  { symbol: "HALKB", verified: false, name: "Halkbank", sector: "Bankacılık", yieldPct: 3.0, payoutPct: 15, debtToEquity: 0.95, dividendYears: 2, peRatio: 3.5, pbRatio: 0.7, cyclical: true, policyConsistent: false, note: "Kamu bankası, temettü politikası değişken",
    geoRisk: "Kamu bankası olması nedeniyle uluslararası yaptırım/soruşturma gündemlerine (geçmişte ABD ile ilgili davalar) ve siyasi karar mekanizmasına yüksek duyarlılık taşır.",
    manipRisk: "Kamu kontrolü nedeniyle yönetim kararları siyasi etkiye açık olabilir, bu da fiyat davranışını piyasa dışı faktörlerle hareket ettirebilir." },
  { symbol: "VAKBN", verified: false, name: "VakıfBank", sector: "Bankacılık", yieldPct: 3.5, payoutPct: 18, debtToEquity: 0.95, dividendYears: 2, peRatio: 3.8, pbRatio: 0.8, cyclical: true, policyConsistent: false, note: "Kamu bankası, temettü politikası değişken",
    geoRisk: "Kamu bankası; Halkbank'a benzer şekilde siyasi/düzenleyici karar mekanizmalarına ve kamu maliyesi politikalarına duyarlı.",
    manipRisk: "Kamu kontrolü nedeniyle yönetim kararları siyasi etkiye açık olabilir." },

  // Holding (karma, ağırlıklı döngüsel)
  { symbol: "KCHOL", verified: true, name: "Koç Holding", sector: "Holding", yieldPct: 3.18, payoutPct: 78.70, debtToEquity: 3.33, dividendYears: 16, peRatio: 14.42, pbRatio: 0.69, cyclical: true, policyConsistent: true, note: "2010'dan beri kesintisiz temettü (16 yıl). Borç/özkaynak (3.33) çok yüksek görünüyor ama konsolide banka iştiraki (Yapı Kredi) dahil edildiği için — bankalar doğası gereği yüksek kaldıraçlı çalışır, bu oran holding'in kendi sanayi/ticaret kolları için yanıltıcı olabilir; yine de kriter aynı şekilde uygulandı. Verim %3.18 ile bandın altında kalıyor.",
    geoRisk: "Enerji (Tüpraş, Aygaz) ve otomotiv (Ford Otosan, Tofaş) kolları üzerinden küresel emtia fiyatları ve AB ticaret ilişkilerine dolaylı maruziyet.",
    manipRisk: "Yüksek piyasa değeri, geniş halka açıklık ve kurumsal takip nedeniyle manipülasyon riski düşük." },
  { symbol: "SAHOL", verified: false, name: "Sabancı Holding", sector: "Holding", yieldPct: 4.0, payoutPct: 30, debtToEquity: 0.6, dividendYears: 10, peRatio: 7.0, pbRatio: 1.2, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "Bankacılık (Akbank) ve enerji kolları üzerinden Türkiye risk primine ve küresel enerji fiyatlarına dolaylı maruziyet.",
    manipRisk: "Yüksek piyasa değeri ve kurumsal takip nedeniyle manipülasyon riski düşük." },
  { symbol: "DOHOL", verified: false, name: "Doğan Holding", sector: "Holding", yieldPct: 3.0, payoutPct: 20, debtToEquity: 0.7, dividendYears: 3, peRatio: 6.0, pbRatio: 0.9, cyclical: true, policyConsistent: false, note: "Kâr olsa da her zaman dağıtmayabiliyor, temettü geçmişi tutarsız",
    geoRisk: "Enerji ve sanayi kollarındaki çeşitlilik nedeniyle küresel emtia/kur şoklarına duyarlı.",
    manipRisk: "Diğer büyük holdinglere kıyasla daha düşük piyasa değeri ve halka açıklık, fiyat hareketlerini daha oynak hale getirebilir — özellikle işlem hacminin düştüğü dönemlerde dikkatli olunmalı." },

  // Enerji / Petrokimya (döngüsel)
  { symbol: "TUPRS", verified: true, name: "Tüpraş", sector: "Enerji/Petrokimya", yieldPct: 6.24, payoutPct: 52.63, debtToEquity: null, dividendYears: 4, peRatio: 10.61, pbRatio: 2.51, cyclical: true, policyConsistent: true, note: "2020-2022 döneminde (zayıf rafineri marjları) temettü dağıtmadı, 2023'ten beri kesintisiz (4. yıl). Payout oranında kaynaklar çelişti (%52.63 ile %882-1038 arası anormal rakamlar) — düşük dönem net kârına karşı yüksek nakit temettü ihtimaline dikkat, %52.63 temsili kabul edildi ama gerçek oran daha yüksek olabilir. Borç/özkaynak için güvenilir bilanço verisi bulunamadı, null bırakıldı.",
    geoRisk: "Ham petrol tedariki ve rafineri marjları küresel jeopolitik olaylara (Orta Doğu, Rusya-Ukrayna, OPEC+ kararları) doğrudan bağlı; olası yaptırım/ambargo gündemleri fiyatı ani etkileyebilir.",
    manipRisk: "Yüksek işlem hacmi ve kurumsal yatırımcı ağırlığı riski azaltır, ama küresel haber akışına aşırı duyarlı ani sert hareketler görülebilir." },
  { symbol: "PETKM", verified: false, name: "Petkim", sector: "Enerji/Petrokimya", yieldPct: 2.5, payoutPct: 40, debtToEquity: 0.7, dividendYears: 3, peRatio: 12.0, pbRatio: 1.0, cyclical: true, policyConsistent: false, note: "Marj baskısı dönemlerinde temettü düşebilir",
    geoRisk: "Petrokimya girdi maliyetleri (nafta) küresel enerji fiyatlarına ve döviz kuruna bağlı; SOCAR ortaklığı nedeniyle bölgesel enerji politikalarına dolaylı maruziyet.",
    manipRisk: "Görece düşük halka açıklık oranı (SOCAR çoğunluk hissedar), işlem hacminin düşük olduğu dönemlerde fiyat oynaklığı artabilir." },

  // Telekom (savunma karakterli)
  { symbol: "TTKOM", verified: false, name: "Türk Telekom", sector: "Telekom", yieldPct: 6.0, payoutPct: 70, debtToEquity: 1.1, dividendYears: 5, peRatio: 9.0, pbRatio: 2.5, cyclical: false, policyConsistent: true, note: "Yüksek borç yükü izlenmeli",
    geoRisk: "BTK düzenlemeleri ve devlet/kamu hissedarlık yapısı nedeniyle siyasi/düzenleyici karar risklerine duyarlı.",
    manipRisk: "Büyük piyasa değeri ve kurumsal takip nedeniyle düşük-orta risk." },
  { symbol: "TCELL", verified: true, name: "Turkcell", sector: "Telekom", yieldPct: 4.30, payoutPct: 49.50, debtToEquity: 0.17, dividendYears: 10, peRatio: 13.43, pbRatio: 0.92, cyclical: false, policyConsistent: true, note: "2010-2015 arası temettü dağıtmadı, 2016'dan beri kesintisiz (10. yıl). Görece istikrarlı nakit akışı, düşük borç/özkaynak (0.17, net borç bazında).",
    geoRisk: "BTK düzenlemelerine duyarlı; doğrudan jeopolitik etkisi sınırlı, görece savunma karakterli.",
    manipRisk: "Yüksek halka açıklık ve ADR (NYSE) çift kotasyonu şeffaflığı artırır, manipülasyon riski düşük." },

  // GYO (döngüsel, inşaat/konut piyasasına bağlı)
  { symbol: "EKGYO", verified: false, name: "Emlak Konut GYO", sector: "GYO", yieldPct: 5.5, payoutPct: 45, debtToEquity: 0.4, dividendYears: 6, peRatio: 7.5, pbRatio: 0.8, cyclical: true, policyConsistent: true, note: "Konut piyasası döngüsüne duyarlı",
    geoRisk: "TOKİ/kamu bağlantılı yönetim yapısı nedeniyle konut politikası kararlarına ve faiz oranı ortamına duyarlı; doğrudan jeopolitik etkisi sınırlı.",
    manipRisk: "Kamu payının yüksekliği yönetim kararlarında siyasi etki riski taşır." },
  { symbol: "ISGYO", verified: false, name: "İş GYO", sector: "GYO", yieldPct: 4.0, payoutPct: 35, debtToEquity: 0.5, dividendYears: 4, peRatio: 9.0, pbRatio: 0.6, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "Konut/ticari gayrimenkul piyasasına ve faiz oranı ortamına duyarlı; doğrudan jeopolitik etkisi sınırlı.",
    manipRisk: "Görece düşük işlem hacmi olabilen küçük-orta ölçekli bir GYO; likidite düştüğünde fiyat oynaklığı artabilir." },
  { symbol: "HLGYO", verified: false, name: "Halk GYO", sector: "GYO", yieldPct: 3.5, payoutPct: 30, debtToEquity: 0.5, dividendYears: 3, peRatio: 10.0, pbRatio: 0.6, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "Kamu bankası (Halkbank) iştiraki; konut piyasası ve kamu bankacılık politikalarına dolaylı bağımlılık.",
    manipRisk: "Küçük ölçekli ve düşük işlem hacmi, likidite düştüğünde fiyat oynaklığı riski taşıyabilir." },

  // Gıda / Tüketim (savunma, temel tüketim)
  { symbol: "ULKER", verified: false, name: "Ülker Bisküvi", sector: "Gıda/Tüketim", yieldPct: 2.0, payoutPct: 25, debtToEquity: 0.6, dividendYears: 7, peRatio: 15.0, pbRatio: 3.0, cyclical: false, policyConsistent: true, note: "Büyüme odaklı, düşük verim",
    geoRisk: "İhracat pazarları (Orta Doğu, Afrika) bölgesel gerginliklere duyarlı; girdi maliyetleri (kakao, şeker) küresel emtia şoklarından etkilenir.",
    manipRisk: "Yıldız Holding çatısı ve görece yüksek halka açıklık, manipülasyon riskini azaltır." },
  { symbol: "CCOLA", verified: false, name: "Coca-Cola İçecek", sector: "Gıda/Tüketim", yieldPct: 3.0, payoutPct: 35, debtToEquity: 0.5, dividendYears: 8, peRatio: 14.0, pbRatio: 2.8, cyclical: false, policyConsistent: true, note: "",
    geoRisk: "Orta Asya ve Orta Doğu operasyonları bölgesel jeopolitik risklere maruz; şişe/ambalaj girdi maliyetleri küresel emtia fiyatlarına duyarlı.",
    manipRisk: "Coca-Cola ve Anadolu Grubu çok uluslu ortaklık yapısı şeffaflığı artırır, manipülasyon riski düşük." },
  { symbol: "BANVT", verified: false, name: "Banvit", sector: "Gıda/Tüketim", yieldPct: 4.5, payoutPct: 40, debtToEquity: 0.6, dividendYears: 4, peRatio: 9.0, pbRatio: 1.5, cyclical: false, policyConsistent: true, note: "",
    geoRisk: "Yem hammaddesi (mısır, soya) ithalatı küresel tarım emtia fiyatlarına ve kur riskine duyarlı.",
    manipRisk: "Görece düşük işlem hacmi, likidite düştüğünde fiyat oynaklığı riski taşıyabilir." },

  // Sanayi / Otomotiv (döngüsel)
  { symbol: "FROTO", verified: false, name: "Ford Otosan", sector: "Sanayi/Otomotiv", yieldPct: 3.5, payoutPct: 40, debtToEquity: 0.6, dividendYears: 9, peRatio: 7.0, pbRatio: 3.0, cyclical: true, policyConsistent: true, note: "İhracat ağırlıklı, kur avantajı",
    geoRisk: "AB pazarına ihracat ağırlıklı; AB gümrük/ticaret politikaları, tedarik zinciri şokları (yarı iletken, enerji) ve olası ticaret savaşlarına duyarlı.",
    manipRisk: "Ford ortaklığı ve yüksek kurumsal takip, manipülasyon riskini azaltır." },
  { symbol: "TOASO", verified: true, name: "Tofaş", sector: "Sanayi/Otomotiv", yieldPct: 5.96, payoutPct: 98.89, debtToEquity: 0.82, dividendYears: 21, peRatio: 12.06, pbRatio: 2.53, cyclical: true, policyConsistent: true, note: "Payout oranı %98.89 ile %80 sınırını ciddi şekilde aşıyor — kâr düşerse temettü kesme riski yüksek. Temettü geçmişi (21 yıl, 2005'ten beri) orta güvenle tahmin edildi, kaynaklar 9-21 yıl arasında çelişti.",
    geoRisk: "Stellantis (Fiat) ortaklığı üzerinden AB pazarı ve küresel otomotiv tedarik zinciri risklerine maruz.",
    manipRisk: "Koç Holding ve Stellantis ortaklığı, kurumsal yönetim şeffaflığını destekler." },
  { symbol: "ARCLK", verified: false, name: "Arçelik", sector: "Sanayi/Otomotiv", yieldPct: 2.5, payoutPct: 30, debtToEquity: 0.9, dividendYears: 7, peRatio: 12.0, pbRatio: 1.4, cyclical: true, policyConsistent: true, note: "Beyaz eşya, Avrupa talebine duyarlı",
    geoRisk: "Avrupa pazarına yüksek bağımlılık; enerji fiyatları, AB ticaret politikaları ve tüketici güveni dalgalanmalarına duyarlı.",
    manipRisk: "Koç Holding çatısı ve yüksek halka açıklık, manipülasyon riskini azaltır." },

  // Sigorta (nispeten savunma karakterli)
  { symbol: "AGESA", verified: false, name: "AgeSA Hayat ve Emeklilik", sector: "Sigorta", yieldPct: 5.0, payoutPct: 50, debtToEquity: 0.3, dividendYears: 5, peRatio: 10.0, pbRatio: 4.0, cyclical: false, policyConsistent: true, note: "",
    geoRisk: "Faiz oranı politikası ve BES teşviklerine duyarlı; doğrudan jeopolitik etkisi sınırlı, savunma karakterli.",
    manipRisk: "Görece düşük işlem hacmi, likidite düştüğünde ani fiyat hareketleri görülebilir." },
  { symbol: "ANHYT", verified: true, name: "Anadolu Hayat Emeklilik", sector: "Sigorta", yieldPct: 8.34, payoutPct: null, debtToEquity: null, dividendYears: 14, peRatio: null, pbRatio: null, cyclical: false, policyConsistent: true, note: "2012'den beri kesintisiz temettü (14 yıl) — güçlü bir geçmiş, ama TTM verim %8.34 ile hedef bandın (%4-7) üzerinde, bu da sürdürülebilirlik açısından bir uyarı işareti. Payout/borç-özkaynak/F-K/PD-DD için güvenilir sayısal veri bulunamadı, null bırakıldı.",
    geoRisk: "Faiz oranı politikası ve BES teşviklerine duyarlı; doğrudan jeopolitik etkisi sınırlı.",
    manipRisk: "İş Bankası/Anadolu Grubu ortaklık yapısı görece şeffaf, ama işlem hacmi düşük olabilir." },

  // Çimento (döngüsel, inşaat)
  { symbol: "AKCNS", verified: false, name: "Akçansa", sector: "Çimento", yieldPct: 5.5, payoutPct: 55, debtToEquity: 0.5, dividendYears: 6, peRatio: 8.0, pbRatio: 1.6, cyclical: true, policyConsistent: true, note: "İnşaat sektörü döngüsüne duyarlı",
    geoRisk: "İhracat pazarları (Afrika, ABD) ve enerji (kömür/elektrik) maliyetleri küresel emtia şoklarına duyarlı.",
    manipRisk: "Sabancı/Heidelberg ortaklığı kurumsal yönetimi destekler, ama işlem hacmi görece düşük olabilir." },
  { symbol: "CIMSA", verified: true, name: "Çimsa", sector: "Çimento", yieldPct: 1.55, payoutPct: 16.42, debtToEquity: 0.67, dividendYears: 26, peRatio: 14.62, pbRatio: 1.56, cyclical: true, policyConsistent: true, note: "26 yıllık uzun bir temettü geçmişi var ama verim şu an sadece %1.55 — hedef bandın (%4-7) çok altında, büyüme/yeniden yatırım odaklı bir dönemde olabilir.",
    geoRisk: "İhracat ağırlıklı (ABD, Afrika) yapı; enerji maliyetleri ve küresel inşaat talebine duyarlı.",
    manipRisk: "Sabancı Holding çatısı kurumsal yönetimi destekler." },

  // Ulaştırma (döngüsel, yüksek operasyonel kaldıraç)
  { symbol: "THYAO", verified: false, name: "Türk Hava Yolları", sector: "Ulaştırma", yieldPct: 3.0, payoutPct: 20, debtToEquity: 1.3, dividendYears: 5, peRatio: 4.0, pbRatio: 1.1, cyclical: true, policyConsistent: true, note: "Yüksek operasyonel kaldıraç, yakıt fiyatı ve kur riskine duyarlı",
    geoRisk: "Doğrudan yüksek jeopolitik risk taşır: hava sahası kapanmaları, savaş/çatışma bölgeleri, terör olayları ve petrol/yakıt fiyat şokları operasyonları anında etkiler.",
    manipRisk: "Yüksek işlem hacmi ve yabancı takip oranı manipülasyon riskini azaltır, ama jeopolitik haber akışına karşı fiyat aşırı oynak olabilir." },

  // Aşağıdaki 14 hisse, kullanıcının paylaştığı güncel BIST Temettü 25 (XTM25)
  // bileşen listesinden eklendi (2026-09-22). Bazı alanlar (payoutPct,
  // debtToEquity, peRatio, pbRatio) için güvenilir kaynak bulunamadığında
  // null bırakıldı — uydurulmadı. Panel bu alanları "–" olarak gösterir ve
  // ağırlıklı ortalamalara dahil etmez.
  { symbol: "AEFES", verified: true, name: "Anadolu Efes", sector: "İçecek/Tüketim", yieldPct: 0.76, payoutPct: 6, debtToEquity: 0.96, dividendYears: 20, peRatio: null, pbRatio: null, cyclical: false, policyConsistent: true, note: "Temettü verimi çok düşük, büyüme/yeniden yatırım odaklı",
    geoRisk: "Rusya ve Orta Asya/Kafkasya pazarlarındaki faaliyetleri nedeniyle bölgesel jeopolitik gelişmelere ve kur dalgalanmalarına duyarlı.",
    manipRisk: "Halka açıklık oranı görece sınırlı ve ana ortak (Anadolu Grubu/AB InBev) kontrolü güçlü." },
  { symbol: "AGHOL", verified: true, name: "Anadolu Grubu Holding", sector: "Holding", yieldPct: 2.09, payoutPct: 67.84, debtToEquity: 1.22, dividendYears: 5, peRatio: null, pbRatio: null, cyclical: true, policyConsistent: false, note: "",
    geoRisk: "Çok sektörlü holding yapısı nedeniyle enerji, otomotiv ve içecek gibi alt sektörler üzerinden makro/jeopolitik risklere dolaylı maruziyeti var.",
    manipRisk: "Kurucu aile kontrolündeki yüksek oranlı ortaklık yapısı ve holding iskontosu fiyat oynaklığını artırabilir." },
  { symbol: "AKSA", verified: true, name: "Aksa", sector: "Kimya/Sanayi", yieldPct: 4.66, payoutPct: 49.59, debtToEquity: 1.08, dividendYears: 5, peRatio: null, pbRatio: null, cyclical: true, policyConsistent: true, note: "",
    geoRisk: "İhracat ağırlıklı akrilik elyaf üretimi nedeniyle küresel talep dalgalanmaları, enerji fiyatları ve döviz kuruna duyarlı.",
    manipRisk: "Ana ortak grubun (Akkök) yüksek kontrol oranı halka açıklığı sınırlandırabilir." },
  { symbol: "BIMAS", verified: true, name: "BİM Mağazalar", sector: "Perakende", yieldPct: 1.56, payoutPct: null, debtToEquity: 1.89, dividendYears: 15, peRatio: 12.06, pbRatio: 3.77, cyclical: false, policyConsistent: true, note: "Payout verisi bulunamadı",
    geoRisk: "Gelirleri büyük ölçüde iç piyasaya dayalı, doğrudan jeopolitik risk sınırlı; enflasyon/kur geçişkenliği maliyet yapısını etkileyebilir.",
    manipRisk: "Görece geniş halka açıklık oranı ve kurumsal yatırımcı takibi manipülasyon riskini sınırlı kılar." },
  { symbol: "BRYAT", verified: true, name: "Borusan Yatırım Pazarlama", sector: "Holding/Otomotiv Yatırım", yieldPct: 8.81, payoutPct: null, debtToEquity: 0.05, dividendYears: 10, peRatio: 11.01, pbRatio: 2.32, cyclical: true, policyConsistent: true, note: "Verim bandın üzerinde, payout verisi bulunamadı",
    geoRisk: "Borusan grubunun otomotiv ve çelik gibi döngüsel iştiraklerine bağlı olduğundan küresel talep/tedarik zinciri risklerine dolaylı maruz.",
    manipRisk: "Düşük halka açıklık oranı ve holding tipi yapı işlem hacminin düşük kalmasına yol açabilir." },
  { symbol: "DOAS", verified: true, name: "Doğuş Otomotiv", sector: "Otomotiv Distribütörlüğü", yieldPct: 13.69, payoutPct: 43.57, debtToEquity: 1.02, dividendYears: 4, peRatio: null, pbRatio: null, cyclical: true, policyConsistent: false, note: "Verim aşırı yüksek, sürdürülebilirliği şüpheli olabilir",
    geoRisk: "İthal araç distribütörlüğü modeli nedeniyle döviz kuru, gümrük/ÖTV politikaları ve küresel tedarik zinciri risklerine yüksek duyarlılık taşır.",
    manipRisk: "Doğuş Grubu'nun yüksek kontrol oranı halka açıklığı sınırlar." },
  { symbol: "ECILC", verified: true, name: "Eczacıbaşı İlaç", sector: "İlaç", yieldPct: 1.60, payoutPct: 57.45, debtToEquity: 0.23, dividendYears: 10, peRatio: null, pbRatio: null, cyclical: false, policyConsistent: true, note: "",
    geoRisk: "İlaç sektörü düzenleyici fiyat politikalarına ve döviz kuruna (ithal hammadde) duyarlı olsa da savunma sektör niteliği jeopolitik riski sınırlar.",
    manipRisk: "Eczacıbaşı Holding'in güçlü kontrolü ve çapraz iştirak yapısı halka açık payları sınırlı kılabilir." },
  { symbol: "ENKAI", verified: true, name: "Enka İnşaat", sector: "İnşaat", yieldPct: 1.95, payoutPct: null, debtToEquity: null, dividendYears: 5, peRatio: 17.39, pbRatio: 1.69, cyclical: true, policyConsistent: false, note: "Payout ve borç/özkaynak verisi bulunamadı",
    geoRisk: "Rusya, BDT ülkeleri ve Orta Doğu'daki inşaat/enerji projeleri nedeniyle bölgesel jeopolitik gelişmelere doğrudan maruziyeti yüksek.",
    manipRisk: "Kurucu aile kontrolündeki yüksek ortaklık oranı ve düşük halka açıklık fiyat hareketlerinde yoğunlaşma riski taşır." },
  { symbol: "EREGL", verified: true, name: "Ereğli Demir Çelik", sector: "Demir-Çelik", yieldPct: 0.92, payoutPct: 77.9, debtToEquity: 0.82, dividendYears: 8, peRatio: null, pbRatio: null, cyclical: true, policyConsistent: false, note: "Temettü verimi hedef bandın çok altında",
    geoRisk: "Küresel çelik fiyatları, enerji maliyetleri ve ticaret/gümrük politikaları nedeniyle jeopolitik ve makro risklere yüksek duyarlılık.",
    manipRisk: "OYAK kontrolündeki yüksek ortaklık payı nedeniyle halka açıklık görece sınırlıdır." },
  { symbol: "ISMEN", verified: true, name: "İş Yatırım Menkul Değerler", sector: "Finans/Aracı Kurum", yieldPct: 9.57, payoutPct: null, debtToEquity: 3.17, dividendYears: 8, peRatio: 8.8, pbRatio: 2.1, cyclical: true, policyConsistent: true, note: "Verim aşırı yüksek; borç/özkaynak aracı kurum faaliyeti nedeniyle doğal olarak yüksek çıkar",
    geoRisk: "Aracı kurum faaliyeti nedeniyle sermaye piyasası oynaklığına, faiz politikalarına ve yabancı yatırımcı akımlarına duyarlı.",
    manipRisk: "İş Bankası grubu kontrolü altında olması işlem yoğunlaşması açısından yapısal bir risk oluşturur." },
  { symbol: "MAVI", verified: true, name: "Mavi Giyim", sector: "Perakende/Tekstil", yieldPct: 4.26, payoutPct: 57.20, debtToEquity: null, dividendYears: 6, peRatio: 16.91, pbRatio: 2.28, cyclical: false, policyConsistent: true, note: "Borç/özkaynak verisi bulunamadı, işlem öncesi ayrıca teyit edin",
    geoRisk: "Gelirlerinin büyük kısmı iç piyasadan gelse de ihracat ve tedarik zinciri (pamuk/tekstil girdileri) küresel fiyat ve kur risklerine tabi.",
    manipRisk: "Kurucu ortakların kontrol oranı yüksek olmakla birlikte halka açıklık oranı görece geniş, bu riski kısmen sınırlar." },
  { symbol: "SARKY", verified: true, name: "Sarkuysan", sector: "Bakır/Metal Sanayi", yieldPct: 1.33, payoutPct: 92.1, debtToEquity: null, dividendYears: 5, peRatio: null, pbRatio: 2.2, cyclical: true, policyConsistent: false, note: "",
    geoRisk: "Bakır fiyatları küresel emtia piyasalarına ve döviz kuruna bağlı olduğundan uluslararası konjonktüre yüksek duyarlılık gösterir.",
    manipRisk: "Görece düşük piyasa değeri ve dar halka açıklık oranı ani fiyat hareketleri riskini artırabilir." },
  { symbol: "TABGD", verified: true, name: "TAB Gıda", sector: "Gıda/Restoran", yieldPct: 1.81, payoutPct: null, debtToEquity: null, dividendYears: 1, peRatio: null, pbRatio: null, cyclical: false, policyConsistent: false, note: "Yeni halka arz, kısa işlem/temettü geçmişi",
    geoRisk: "Faaliyetleri ağırlıklı olarak yurt içi tüketime dayalı, doğrudan jeopolitik risk sınırlı; gıda hammadde fiyatları küresel konjonktüre bağlı.",
    manipRisk: "Yeni halka arz olması nedeniyle sınırlı işlem geçmişi ve göreceli dar halka açıklık fiyat oynaklığı riskini artırabilir." },
  { symbol: "TURSG", verified: true, name: "Türkiye Sigorta", sector: "Sigorta", yieldPct: 2.44, payoutPct: 15.36, debtToEquity: null, dividendYears: 4, peRatio: null, pbRatio: null, cyclical: false, policyConsistent: true, note: "",
    geoRisk: "Sigortacılık faaliyeti makroekonomik istikrara ve doğal afet/iklim risklerine duyarlı olsa da doğrudan jeopolitik maruziyeti sınırlıdır.",
    manipRisk: "Türkiye Varlık Fonu kontrolündeki yüksek ortaklık payı halka açık payların görece sınırlı kalmasına neden olur." },
  { symbol: "TRGYO", verified: true, name: "Torunlar GYO", sector: "GYO", yieldPct: 6.76, payoutPct: 64.68, debtToEquity: 0.28, dividendYears: 4, peRatio: null, pbRatio: null, cyclical: true, policyConsistent: true, note: "Temettü geçmişi kriterin (5 yıl) 1 yıl altında kalıyor: üç bağımsız kaynak, şirketin yatırım/gelişim dönemi gerekçesiyle 2019-2021 arası temettü dağıtmadığını, 2022 kârı için (2023'te ödenen) yeniden başladığını doğruluyor — 2023-2026 = 4 yıl kesintisiz. (Aksini iddia eden tek kaynak bu boşluğu atlamış görünüyor, güvenilir bulunmadı.) Temettü verimi de kaynağa göre %5.0-%8.1 arasında değişiyor; en somut/tarihli veriye (2025: brüt 5 TL/pay) göre %6.76 kullanıldı. Diğer tüm ölçütleri geçiyor. GYO statüsü nedeniyle stopaj yok.",
    geoRisk: "Ticari/konut gayrimenkul projelerine bağlı olduğundan faiz oranı ortamına ve inşaat sektörü döngüsüne duyarlı; doğrudan jeopolitik etkisi sınırlı.",
    manipRisk: "Torun Grubu'nun yüksek kontrol oranı halka açık payları sınırlı kılabilir; GYO'lar proje bazlı düzensiz temettü dağıtımına eğilimlidir." },
];

/** Portföy önerisi kriterleri (özet konuşmadan). */
const CRITERIA = {
  yieldMin: 4,
  yieldMax: 7,
  payoutMax: 80,
  debtToEquityMax: 1.0,
  dividendYearsMin: 4,
  minStocks: 8,
  maxStocks: 15,
  minSectors: 3,
  maxSectorWeightPct: 35,
  valueTrapPE: 5,
  valueTrapPB: 1.0,
};

// Node.js'ten (ör. scripts/refresh-price-data.mjs) require ile okunabilmesi için.
// Tarayıcıda "module" tanımsız olduğundan bu blok atlanır ve STOCKS/CRITERIA
// global scope'ta kalır.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { STOCKS, CRITERIA };
}
