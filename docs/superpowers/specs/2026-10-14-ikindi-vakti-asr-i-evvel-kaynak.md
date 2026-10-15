# İkindi vakti: asr-ı evvel — birincil kaynak

Uygulama ikindinin girişini **asr-ı evvel** (her şeyin gölgesi, fey-i zevâl
hariç, kendi boyu kadar olduğunda) ile hesaplar. Hanefî **asr-ı sânî** (gölge
iki misli) KULLANILMAZ. Gerekçe: Diyanet İşleri Başkanlığı takvimi asr-ı evveli
esas alır; uygulama o takvimle ve camideki ezanla aynı saati göstermelidir.

Metin 2026-10-14'te `kurul.diyanet.gov.tr` üzerinden doğrudan okundu.

## Kaynak

**DİYK (Din İşleri Yüksek Kurulu), "İkindi namazının vakti ne zaman başlar ve ne
zaman sona erer?"** — Fetvalar > Namaz > Namazın Farzları, 12.07.2017
<https://kurul.diyanet.gov.tr/Cevap-Ara/133/ikindi-namazinin-vakti-ne-zaman-baslar-ve-ne-zaman-sona-erer>

> "İkindi namazı vaktinin başlangıcı, öğle namazı vaktinin sona ermesine bağlı
> olduğu için öğle namazının sona ermesi konusundaki görüş ayrılığı ikindi
> vaktinin başlamasına da yansımıştır. Dolayısıyla İmam Ebû Yûsuf ile İmam
> Muhammed ve diğer mezhep imamlarına göre öğle vakti, her şeyin gölgesi
> 'fey-i zevâl' hariç kendisinin bir mislî olduğu zaman biter ve ikindi namazının
> vakti başlar. Buna asr-ı evvel (ikindi namazının ilk vakti) denir. İmam Ebû
> Hanîfe'ye göre ise öğle vaktinin bitişi, her şeyin gölgesi "fey-i zevâl" hariç
> kendisinin iki mislî olduğu zaman biter ve ikindi namazının vakti başlar. Buna
> asr-ı sânî (ikindi namazının ikinci vakti) denir. **Diyanet İşleri Başkanlığı
> takviminde asr-ı evvel uygulaması esas alınmaktadır.**"

Aynı kavramlar için DİYK'nin ayrı sayfası: "“Asr-ı evvel” ve “asr-ı sani” ne
demektir?" <https://kurul.diyanet.gov.tr/Cevap-Ara/132/asr-i-evvel-ve-asr-i-sani-ne-demektir>
(bu not için lafzı ayrıca alınmadı; hüküm yukarıdaki metne dayanır).

## Koddaki karşılığı

- adhan'da asr-ı evvel = `Madhab.Shafi` (gölge 1×); `CalculationMethod.Turkey()`'nin
  **varsayılanıdır**. Tek kaynak: `src/core/vakit/hesapParametreleri.ts >
  turkiyeHesapParametreleri()`.
- TV (`tv/.../cekirdek/VakitHesabi.kt`) adhan2 ile `Madhab.SHAFI`'yi açıkça yazar;
  fikstür telefonun adhan JS yolundan üretilir (`scripts/tv/tv-verisi-uret.js`).
- Nöbetçiler: `src/core/vakit/__tests__/hesapParametreleri.test.ts`,
  `GunesVaktiHesaplama.test.ts > NÖBETÇİ: ikindi = asr-ı evvel`, TV paritesi
  (`TvVakitParitesi.test.ts` ↔ `VakitHesabiTest`).
- `Madhab.Hanafi`'ye geçmek ikindiyi İstanbul'da ~40-45 dk sonraya kaydırır
  (mevsime ve enleme göre değişir).

## Kapsam dışı

Diyanet takviminin temkin dakikaları ve hesap yönteminin (Turkey) ayrıntıları bu
notun konusu değildir; burada yalnız ikindinin hangi gölge ölçüsüyle girdiği
belgelenir.
