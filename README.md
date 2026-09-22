# BIST Temettü Portföy Paneli

Uzun vadeli, temettü odaklı BIST hisse portföyü oluşturmak için basit bir statik
web panel. Build aracı gerektirmez; tarayıcıda doğrudan çalışır.

## Çalıştırma

```bash
python3 -m http.server 8000
```

sonra `http://localhost:8000` adresini açın. (Doğrudan `index.html` dosyasını
`file://` ile açmak da çoğu tarayıcıda çalışır çünkü veriler `js/data.js`
içine gömülüdür, ayrı bir `fetch` gerektirmez.)

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

## Veri hakkında önemli not

`js/data.js` içindeki hisse verileri (temettü verimi, payout oranı,
borç/özkaynak, temettü geçmişi yılı) **örnek/yer tutucu** değerlerdir. Gerçek
portföy kararları vermeden önce bu değerleri güncel finansal tablolar, KAP
açıklamaları ve borsa verileriyle güncelleyin. Bu araç yatırım tavsiyesi
değildir.

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
index.html        Ana sayfa
css/style.css      Görünüm
js/data.js         Hisse havuzu + kriter sabitleri
js/app.js          Tablo/portföy/grafik mantığı
```
