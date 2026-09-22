# BIST Temettü Portföy Paneli

Uzun vadeli, temettü odaklı BIST hisse portföyü oluşturmak için basit bir statik
web panel. Build aracı gerektirmez; tarayıcıda doğrudan çalışır.

## Çalıştırma

```bash
python3 -m http.server 8000
# veya: npm run serve
```

sonra `http://localhost:8000` adresini açın. Panel açılırken `js/price-data.json`
dosyasını `fetch` ile okur; bu yüzden `index.html`'i doğrudan `file://` ile
açmak fiyat/destek-direnç sütunlarını boş bırakır (tarayıcılar `file://`
altında yerel JSON fetch'ine izin vermez) — bir HTTP sunucusu üzerinden açın.

## Özellikler

- **Tarama kriterleri:** Temettü verimi %4-7 bandı, payout oranı ≤%80, düşük
  borç/özkaynak, en az 5 yıllık kesintisiz temettü geçmişi, makul F/K ve PD/DD
  (aşırı düşük ikisi birlikte "value trap" sinyali olarak işaretlenir), açık ve
  tutarlı temettü politikası.
- **Hisse havuzu tablosu:** Bankacılık, holding, enerji/petrokimya, telekom,
  GYO, gıda/tüketim, sanayi/otomotiv, sigorta, çimento ve ulaştırma
  sektörlerinden örnek hisseler; sektöre göre filtreleme, sütuna göre
  sıralama, döngüsel/savunma sektör etiketi, kritere uygunluk durumu
  (Uygun / Dikkat / Riskli).
- **Portföy oluşturucu:** Havuzdan hisse ekleyip ağırlık (%) belirleyerek
  hipotetik bir portföy kurun. Seçimler tarayıcının `localStorage`'ında saklanır.
- **Özet kartları:** Hisse/sektör sayısı, ağırlıklı temettü verimi, ağırlıklı
  payout oranı, ağırlıklı borç/özkaynak.
- **Sektör dağılım grafiği:** Portföyün sektörlere göre ağırlık dağılımı (donut
  grafik).
- **Uyarılar:** Toplam ağırlık %100 değilse, hisse/sektör sayısı önerilen
  aralığın dışındaysa, bir sektör ağırlığı %35'i aşıyorsa veya bir hisse
  kriterlere uymuyorsa otomatik uyarı gösterir.
- **Güncel fiyat + destek/direnç:** Her hisse için web aramasıyla çekilmiş
  güncel fiyat ve kısa vadeli destek/direnç seviyeleri (tarih ve kaynak linki
  ile birlikte gösterilir — linke tıklayıp doğrulayabilirsiniz).
- **Jeopolitik/manipülasyon risk notları:** Her hissenin sembolü yanındaki ⓘ
  ikonu, sektör/ortaklık yapısına dayalı genel risk değerlendirmesi gösterir.
- **Alım fiyatı uyarısı:** Portföyünüzdeki her hisse için hedef alım fiyatı ve
  güncel fiyatı elle girin; güncel fiyat hedefe indiğinde panelde "ALIM
  SİNYALİ" rozeti belirir (push/email bildirimi değildir, panel açıkken
  görünür).
- **AI Portföy Önerisi:** Claude API, tarama kriterlerini geçen ("Uygun"
  statülü) hisselerden sektör bazında çeşitlendirilmiş bir örnek portföy kurar
  ve her hisse için somut sayılara dayanan bir gerekçe yazar. "Bu Portföyü
  Uygula" butonuyla tek tıkla kendi portföyünüze aktarabilirsiniz (mevcut
  portföyünüzün üzerine yazar, onay ister).

## Veri hakkında önemli not

`js/data.js` içindeki temettü verimi/payout/borç-özkaynak/F-K/PD-DD değerleri
**örnek/yer tutucu**dur ve elle güncellenmelidir. `js/price-data.json`
içindeki `currentPrice`/`support`/`resistance` alanları web aramasıyla
çekilmiş **anlık görüntülerdir** (`priceAsOfDate` tarihli, canlı borsa akışı
değildir) — bazı kaynaklarda güncel fiyatla tutarsız görünen destek/direnç
seviyeleri (ör. TOASO, CIMSA) bilinçli olarak boş bırakıldı.
`geoRisk`/`manipRisk` notları genel, yapısal değerlendirmelerdir (halka
açıklık oranı, ortaklık yapısı gibi), belirli bir olay/manipülasyon iddiası
içermez. Gerçek portföy kararları vermeden önce bu değerleri güncel finansal
tablolar, KAP açıklamaları ve profesyonel danışmanlıkla teyit edin. Bu araç
yatırım tavsiyesi değildir.

**IBKR ile ilgili not:** Bu panel için Interactive Brokers (IBKR) bağlantısı
test edildi; bu hesapta Borsa İstanbul'da işlem gören hisselere doğrudan
erişim bulunmuyor (sadece tahvil/ADR sonuçları dönüyor). Bu yüzden gerçek
zamanlı BIST verisi veya IBKR üzerinden fiyat alarmı kurulamıyor — panel
web aramasıyla çekilen anlık görüntülere ve manuel girilen hedef fiyatlara
dayanıyor.

## Fiyat/destek-direnç ve AI portföy önerisinin otomatik güncellenmesi

`js/price-data.json` ve `js/ai-portfolio.json`, sırasıyla
`scripts/refresh-price-data.mjs` ve `scripts/generate-ai-portfolio.mjs`
scriptleri tarafından Claude API kullanılarak yenilenir. Her iki script de
`.github/workflows/refresh-price-data.yml` ile **her Pazartesi otomatik
olarak** (art arda) çalışır ve değişiklik varsa doğrudan `main`/varsayılan
branch'e commit atar.

**Kurulum (bir kere yapılır):**

1. Bir Anthropic API anahtarı alın (https://console.anthropic.com).
2. Repo ayarlarında **Settings → Secrets and variables → Actions** altına
   `ANTHROPIC_API_KEY` adında bir secret ekleyin.
3. Bu workflow `schedule` tetikleyicisi GitHub'da yalnızca **varsayılan
   branch'te** (genelde `main`) çalışır — bu yüzden otomatik haftalık
   güncelleme, bu değişiklikler varsayılan branch'e alındıktan sonra devreye
   girer. O ana kadar, veya istediğiniz zaman, **Actions** sekmesinden
   "Fiyat ve AI Portföy Önerisini Yenile" workflow'unu **Run workflow**
   butonuyla elle de tetikleyebilirsiniz (`workflow_dispatch`).

**Elle/lokal çalıştırma:**

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npm run refresh-data
ANTHROPIC_API_KEY=sk-ant-... npm run generate-ai-portfolio
```

`refresh-data`, her hisse için ayrı bir web araması yapar (~27 istek,
`claude-sonnet-5` ile), destek/direnç seviyelerinin güncel fiyatla tutarlı
olup olmadığını otomatik kontrol eder (tutarsızsa null bırakır) ve bir
hissede arama başarısız olursa o hissenin **önceki değerini korur** — geçici
bir hata yüzünden elimizdeki en güncel veriyi kaybetmez.

`generate-ai-portfolio`, `js/data.js`'teki STOCKS + CRITERIA verisini
(`claude-opus-5` ile, yapılandırılmış çıktı kullanarak) tek bir istekte
işler; tarama kriterlerini geçen hisselerden sektör bazında çeşitlendirilmiş
bir örnek portföy kurar ve her hisse için somut sayılara dayanan bir gerekçe
üretir.

## Stratejinin dayandığı kriterler

- Temettü verimi %4-7 bandı sağlıklı kabul edilir; çok yüksek verim (%10+)
  genelde fiyat düşüşünün sonucudur ve sürdürülebilir olmayabilir.
- Payout oranı %80'i geçmemeli — geçen oranlar risk taşır, kâr düşünce
  temettü kesilir.
- Temettü geçmişi kesintisiz/artan olmalı, tercihen 5-10 yıllık geçmiş.
- FAVÖK ve serbest nakit akışı kâr kalitesinin göstergesidir (muhasebesel kâr
  değil, gerçek nakit üretimi temettüyü besler).
- Borç/özkaynak oranı düşük olmalı — yüksek borçlu şirket kriz döneminde
  temettüyü ilk kesen olur.
- F/K ve PD/DD makul seviyede olmalı; aşırı ucuz olması "value trap" sinyali
  olabilir.
- Sektörün döngüsel olmayan, savunma karakterli olması tercih edilebilir
  (gıda, ilaç, temel tüketim, telekom gibi).
- Yönetim/ortaklık yapısında temettü politikasının açık ve tutarlı olması
  gerekir (bazı holdingler kâr olsa da dağıtmıyor).

**BIST'e özgü riskler:**

- Enflasyon muhasebesi: 2024'ten beri TFRS/UMS 29 enflasyon düzeltmesi
  uygulanıyor — raporlanan kârları ve temettü kapasitesini önemli ölçüde
  etkiliyor, şirket bazında enflasyon düzeltmeli tablolar kontrol edilmeli.
- TL bazlı temettünün kur riski: TL'nin değer kaybıyla dolar bazında erimiş
  olabilir, nominal ile reel getiri farkı büyük olabilir.
- Stopaj: hisse temettülerinde stopaj var; hisse ağırlıklı fonlarda
  (PHE/KHA/PBR gibi) %0 stopaj avantajı olabiliyor — bazı yatırımcılar için
  doğrudan hisse yerine fon üzerinden gitmek daha avantajlı olabilir.
- Sektör yoğunlaşması: BIST'te bankalar ve holding şirketleri ağırlıklı — tek
  sektöre aşırı yüklenmemek (banka, sanayi, GYO, enerji arasında dağıtmak)
  önemli.

**Portföy önerisi:**

- 3-4 farklı sektörden pozisyon (tek makro faktöre bağımlılığı azaltmak için).
- 8-15 hisse arası çeşitlendirme.
- Kademeli alım (DCA) ile fiyat riski yayılması.
- Temettülerin yeniden yatırımı (bileşik büyüme).
- Yıllık/2 yıllık periyotlarla gözden geçirme.

## Dosya yapısı

```
index.html                              Ana sayfa
css/style.css                            Görünüm
js/data.js                               Hisse havuzu (elle küratörlü) + kriter sabitleri
js/price-data.json                       Fiyat/destek-direnç (otomatik yenilenir)
js/ai-portfolio.json                     AI portföy önerisi + gerekçeler (otomatik yenilenir)
js/app.js                                Tablo/portföy/grafik mantığı, üçünü birleştirir
scripts/refresh-price-data.mjs           price-data.json'ı Claude API + web_search ile yeniler
scripts/generate-ai-portfolio.mjs        ai-portfolio.json'ı Claude API ile üretir
.github/workflows/refresh-price-data.yml Haftalık otomatik yenileme workflow'u (her iki script)
```
