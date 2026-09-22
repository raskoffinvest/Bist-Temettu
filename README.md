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
  borç/özkaynak, en az 5 yıllık kesintisiz temettü geçmişi.
- **Hisse havuzu tablosu:** Bankacılık, holding, enerji/petrokimya, telekom,
  GYO, gıda/tüketim, sanayi/otomotiv, sigorta ve çimento sektörlerinden örnek
  hisseler; sektöre göre filtreleme, sütuna göre sıralama, kritere uygunluk
  durumu (Uygun / Dikkat / Riskli).
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

- Temettü verimi %4-7 bandı sağlıklı kabul edilir (çok yüksek verim risk
  sinyali olabilir).
- Payout oranı %80'i geçmemeli.
- Temettü geçmişi kesintisiz/artan olmalı, tercihen 5-10 yıllık geçmiş.
- FAVÖK ve serbest nakit akışı kâr kalitesinin göstergesidir.
- Borç/özkaynak oranı düşük olmalı.

**BIST'e özgü riskler:**

- Enflasyon muhasebesi (TFRS/UMS 29) raporlanan kârları etkiliyor.
- TL bazlı temettünün kur riski (nominal vs. reel getiri farkı).
- Stopaj: hisse ağırlıklı fonlarda (PHE/KHA/PBR gibi) %0 stopaj avantajı
  olabiliyor.
- Sektör yoğunlaşmasından kaçınmak gerekiyor.

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
