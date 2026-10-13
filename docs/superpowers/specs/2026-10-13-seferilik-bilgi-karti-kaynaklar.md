# Seferîlik bilgi kartı: birincil kaynaklar (issue #296)

Kart **hüküm vermez**, Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulunun
(DİYK) yayımladığı fetvaları özetler ve okuyucuyu onlara yönlendirir. Issue
şartı gereği karta yalnız **birincil Diyanet metni bulunan** maddeler girdi.
Metinler 2026-10-13'te `kurul.diyanet.gov.tr` üzerinden doğrudan okundu
(`dinisorular.diyanet.gov.tr` o gün erişilemedi; DİYK'nin kendi sitesi
birincil kaynaktır). Kod tarafındaki karşılığı:
`src/core/seferilik/seferilikMetni.ts > SEFERILIK_KAYNAKLARI`.

## 1. Mesafe (≈90 km), Hanefî 15 gün, Şâfiî 4 gün, kasr

**Kaynak:** DİYK, "Seferî sayılma bakımından bulunulan yerleri ifade eden vatan-ı
aslî, vatan-ı ikamet ve vatan-ı süknâ ne demektir?" (12.07.2017)
<https://kurul.diyanet.gov.tr/tr/fetva/seferi-sayilma-bakimindan-bulunulan-yerleri-ifade-eden/0193c42d-5c14-7784-0d36-180562700f47>

> "Buna göre dinen yolcu (seferî) sayılan kimselerin dört rek'atlı farz
> namazları iki rek'at kılmaları, Ramazan oruçlarını sonradan tutmak üzere
> erteleyebilmeleri bu özel hükümlerdendir."

> "Vatan-ı süknâ: Bir kimsenin on beş günden az bir süre kalmak niyetiyle
> bulunduğu, aslî ya da ikamet vatanından en az doksan km uzaklıktaki yerdir
> (Haddâd, el-Cevhera, 1/87). Kişi kaldığı yerde bu durumda ise yolcu sayılır.
> Bu hükümler Hanefî mezhebine göredir."

> "Şâfiî mezhebine göre ise seferî sayılabilmek için yaklaşık 90 km bir mesafeye
> gitme niyeti ile yola çıkılmış olmalı ve gidilen yerde, giriş ve çıkış günleri
> hariç dört günden az kalınmalıdır. Dört gün ya da daha fazla kalınmaya niyet
> edilmesi hâlinde seferîlik hükmü biter (Remlî, Nihâyetü'l-muhtâc, 2/257)."

Sonuç: eşik **iki mezhepte de ≈90 km** (`SEFER_MESAFESI_KM`). Fark kalış
süresindedir (Hanefî 15 gün, Şâfiî giriş-çıkış hariç 4 gün).

**Destekleyen DİYK fetvası** (aynı ölçüler, ziyaret bağlamı): "Anne babasının
yaşadığı beldeye giden kişi seferî olur mu?"
<https://kurul.diyanet.gov.tr/tr/fetva/anne-babasinin-yasadigi-beldeye-giden-kisi-seferi-olur-mu/0193c42d-5d08-7c36-6d03-f4153952d330>

> "... 90 km ve daha uzak yerde yerleşik olan anne-babasının yanına giderse,
> seferîlik hükümlerine tabi olur. Dolayısıyla gittiği yerde Hanefîler'e göre 15,
> Şâfiîlere göre 4 günden daha az kalmaya niyet ettiği takdirde seferî olur."

## 2. Cem (iki namazı birleştirme)

**Kaynak:** DİYK, "Namazlar cem edilmek (birleştirilmek) suretiyle kılınabilir
mi?" (12.07.2017)
<https://kurul.diyanet.gov.tr/tr/fetva/namazlar-cem-edilmek-birlestirilmek-suretiyle-kilinabilir-mi/0193c42d-4df6-7e81-a5ab-dc99c59adece>

> "Hanefî mezhebine göre cem sadece hacılar için söz konusudur. Arefe (arife)
> günü Arafat'ta ikindi öne alınarak öğle vaktiyle birlikte (cem-i takdim sureti
> ile) kılınır. Aynı gün akşam namazı geciktirilerek, Müzdelife'de yatsı vaktinde
> birlikte (cem-i te'hir) kılınır. Bunun dışında namazları cem ederek kılmak caiz
> değildir."

> "Diğer mezheplerde (aralarında bazı konularda ihtilaf olmakla birlikte) sefer,
> yağmur, fırtına gibi mazeretlerle öğle ile ikindiyi veya akşam ile yatsıyı
> cem-i takdim ya da cem-i tehir yoluyla kılmak caizdir."

> "Önemli mazeretlerin bulunduğu durumlarda Hanefî birisi de diğer mezhepleri
> taklit ederek anılan namazları cem ederek kılabilir. Mesela seferde olmak, ..."

**Not (issue gövdesine ek):** Issue "Hanefî'de cem yok (Arafat/Müzdelife hariç)"
diyordu. Birincil metin bunu doğrular **ama** aynı fetva önemli mazerette (seferde
olmak dahil) Hanefî'nin diğer mezhepleri taklit edebileceğini de söyler. Kart bu
ikinci cümleyi de anar; yalnız ilkini yazmak Diyanet'in görüşünü eksik aktarırdı.

## 3. Seferîliğin başlangıcı (karta girmedi, yalnız bağlam)

**Kaynak:** DİYK, "Seferîliğin başlangıcı nasıl belirlenir?"
<https://kurul.diyanet.gov.tr/tr/fetva/seferiligin-baslangici-nasil-belirlenir/0193c42d-5c2b-7ba0-4ab5-e2b35365b083>

> "Dinen sefer sayılacak mesafedeki bir yere gitmek üzere yola çıkan kişi,
> yaşadığı yerleşim yerinin meskûn mahallinden çıkınca misafir hükmünde kabul
> edilir."

Bu yüzden uygulamanın ölçtüğü **kuş uçuşu** mesafe yalnız bir *işarettir*: dinî
ölçü yola çıkış niyeti ve gidilen yerdir, kart bunu "gibi görünüyor" diye anar.
Kuş uçuşu mesafe karayolu mesafesinden kısa olduğu için 90 km eşiği ihtiyatlı
taraftadır (kart gereğinden geç çıkabilir, erken çıkmaz).

## Bulunamayan / karta konmayan

- **Kasrın hükmü (Hanefî'de azimet/vacip, Şâfiî'de ruhsat):** DİYK sitesinde bu
  ayrımı doğrudan yazan bir fetva bulunamadı (yalnız müftülük PDF özetlerinde
  geçiyor — birincil değil). Kart yalnız "dört rekâtlı farzlar iki rekât kılınır
  (kasr)" der; hükmün derecesini söylemez.
- **15 günün sayımı:** Kural yalnız bilgi olarak anılır; uygulama gün saymaz
  (gün sayımı hüküm vermeye kayar).
