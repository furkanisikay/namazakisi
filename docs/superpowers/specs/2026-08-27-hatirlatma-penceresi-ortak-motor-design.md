# Tasarım: Hatırlatma Penceresi — ortak hatırlatma motoru

> Tarih: 2026-08-27 · Durum: **taslak, onay bekliyor** · Kaynak: kullanıcı talebi (dört madde)

## 1. Problem

Muhafız motoru bu ürünün ayırt edici özelliği ama bugün **beş namaz vaktine çakılı**. Kullanıcının dört isteği:

1. **Ortak yapı.** Aynı "hedefe kadar, senin verdiğin aralıklarla, senin seçtiğin biçimde hatırlat" mekanizması cuma hatırlatmasında da kullanılabilsin. Yarın **titreşim** üçüncü bir kanal olarak eklenmek istendiğinde tek yerden eklensin.
2. **Dinamik aralıklar.** Bugün yatsının 1. seviyesi bile 120 dk'dan önce kurulamıyor; oysa yatsı kışın ~11 saat sürüyor. Sınır pencerenin gerçek uzunluğuna göre esnemeli.
3. **İki yön.** Bugün yalnız "vakit çıkışına doğru geri sayım" var. Kullanıcı "vakit girer girmez başla, çıkana kadar hatırlatmaya devam et" de isteyebilmeli.
4. **Seri hatırlatması büyük sayaçlı olsun** (Ramazan iftar/sahur bildirimleri gibi): kullanıcının seçtiği anda görünmeye başlar, seriyi kaybedeceği ana kadar canlı sayar.

## 2. Bugün elimizde ne var (envanter)

Dürüst tespit: **çekirdek zaten büyük ölçüde genel.** Vakte bağlayan yalnızca iki şey var.

| Parça | Yeri | Vakte bağlı mı? |
|---|---|---|
| `SeviyeAyari` (mod, `esikDk`, `siklik`, ses, anons metni) | `core/muhafiz/matrisTipleri.ts:8` | **Hayır** — tamamen genel bir "hatırlatma adımı" |
| `seviyeTetiklenirMi(seviye, kalanDk)` | `core/muhafiz/motorAdaptoru.ts:71` | Hayır; ama parametre adı çıkışa-doğru varsayıyor |
| `aktifSeviyeyiBul` | `core/muhafiz/aktifSeviye.ts` | Hayır |
| `vakitUyariPlaniOlustur` | `core/muhafiz/motorAdaptoru.ts:107` | Yalnız adında; gövde saf dakika aritmetiği |
| `esikSinirlariniHesapla` | `core/muhafiz/esikSinirlari.ts:26` | Hayır, ama `ESIK_MUTLAK_MAX = 120` **sabit** |
| `MuhafizMatrisi = Record<MuhafizVakti, VakitMuhafizAyari>` | `matrisTipleri.ts:49` | **Evet** — asıl bağ burada |
| `ArkaplanMuhafizServisi` planlayıcı | `domain/services/ArkaplanMuhafizServisi.ts:148` | **Evet** — vakit döngüsü |
| `startCountdown(id, targetTimeMs, …, themeType)` | `modules/expo-countdown-notification/src/index.ts:34` | Hayır — `themeType: 'iftar'\|'vakit'\|'sahur'` |
| Cuma hatırlatması | `domain/services/CumaHatirlatmaServisi.ts` | Ayrı, **tek atışlı** servis |
| Seri gün sonu bildirimi | `presentation/store/seriSlice.ts:172` | `bildirimPlanla` + DAILY tekrar, sayaçsız |

Yani soyutlama sıfırdan kurulmayacak; **var olan çekirdeğin etrafındaki vakit varsayımı sökülecek.**

## 3. Çekirdek kavram: Hatırlatma Penceresi

```ts
/** Eşiğin hangi uca göre ölçüldüğü. */
export type PencereYonu = 'cikisaDogru' | 'girisindenItibaren';

/** Motorun bildiği tek zaman birimi: bir açılış, bir kapanış, bir yön. */
export interface HatirlatmaPenceresi {
  /** Kimlik öneki — bildirim/alarm id'leri bundan türer: 'vakit:ogle', 'cuma', 'seri' */
  kaynak: string;
  baslangic: Date;
  bitis: Date;
  yon: PencereYonu;
}
```

### Tek değişken adı, iki yön

Bugün motor `kalanDk` ile konuşuyor. Bunu **`olcuDk`** (ölçülen dakika) yapıyoruz:

- `cikisaDogru` → `olcuDk = bitis − şimdi` (bugünkü davranış, birebir)
- `girisindenItibaren` → `olcuDk = şimdi − baslangic`

`seviyeTetiklenirMi(seviye, olcuDk)` gövdesi **değişmez**. "45 dk kala nazik" ile "girişten 45 dk sonra nazik" aynı aritmetiktir; fark yalnızca ölçünün hangi uçtan alındığıdır. Bu, isteğin 3. maddesini tek bir hesap değişikliğiyle karşılar.

**Metin uyumu:** `anonsMetniniCoz` bugün `{süre}` yerine kalan dakikayı koyuyor. Yön `girisindenItibaren` iken "42 dk kaldı" yanlış olur → şablon sözlüğü yöne göre seçilir (`{süre} dk geçti` / `{süre} dk kaldı`). Metin havuzu zaten `core/muhafiz/anonsMetni.ts`'te tek yerde.

### Kanallar: `mod` enum'undan kanal kümesine

Bugün `UyariModu = 'sessiz' | 'bildirim' | 'sesli' | 'ikisi'`. Titreşim eklenirse bu enum 8 değere çıkar (`bildirim+titresim`, `sesli+titresim`, `üçü`, …) — kombinatoryal patlama.

```ts
export interface UyariKanallari {
  bildirim: boolean;
  sesliAnons: boolean;
  titresim: boolean;   // Faz 2'de alan açılır, motor Faz 6'da bağlar
}
```

- "Kapalı" = hiçbir kanal açık değil (`hicKanalAcikMi`). Bugünkü `mod: 'sessiz'`'in yerini alır.
- `oncekiMod` (UI geri-alma hafızası, `seviyeAcKapa.ts`) → `oncekiKanallar`. Aynı sözleşme, aynı kural: motor okumaz, yalnız `seviyeAcKapa` yazar.
- Göç kayıpsız ve tek yönlü: `sessiz → {}`, `bildirim → {bildirim}`, `sesli → {sesliAnons}`, `ikisi → {bildirim, sesliAnons}`.

**Yarın titreşim eklemenin maliyeti bu modelde:** alan zaten var → (a) `ArkaplanMuhafizServisi`'nde bildirim `vibrationPattern`'i, (b) ön planda `Vibration.vibrate`, (c) ekranda bir çip. Motor, plan üreticisi, önizleme ve beş tüketici **hiç değişmez**.

> **Uyarı — bedava değil:** Android'de titreşim de kanal özelliğidir ve kanal id'si bugün **sesin fonksiyonu** (`sesKimligi.muhafizKanalIdOlustur`, AGENTS.md). Titreşim gelince id **ses + titreşim** hash'inden üretilmeli, yoksa aynı sesi paylaşan iki hücreden biri sessizce yanlış titreşim davranışı alır. Bu, Faz 6'nın asıl işi; alan açmak (Faz 2) ucuz, bağlamak değil.

## 4. Dinamik eşik sınırı (istek 2)

Bugün `ESIK_MUTLAK_MAX = 120` (`esikSinirlari.ts:13`) sabit ve tüm vakitlere aynı tavanı koyuyor.

**Öneri:** tavan pencerenin gerçek uzunluğundan türesin.

```ts
esikSinirlariniHesapla(seviyeler, indeks, { pencereUzunluguDk })
// max = min(pencereUzunluguDk - 1, ESIK_GUVENLIK_TAVANI)
```

- Yatsı kışın ~11 saat → 1. seviye 600+ dk'ya kurulabilir.
- `ESIK_GUVENLIK_TAVANI` yine gerekir (öneri: 720 dk). Sebep pil değil **planlama maliyeti**: `vakitUyariPlaniOlustur` pencereyi dakika dakika tarar ve her tetik ayrı bir zamanlanmış bildirim + exact alarm demektir. 600 dk / 5 dk = 120 bildirim — Android'in zamanlanmış bildirim bütçesi bunu kaldırmaz.
- **Pencere uzunluğu mevsimle değişir.** Kullanıcı yatsıya 600 dk kurar, yaz gelir pencere 400 dk'ya iner. Motor bunu zaten güvenli karşılıyor: `seviyeTetiklenirMi` `olcuDk > esikDk` iken tetiklemez, `vakitUyariPlaniOlustur` `Math.min(kalanDkSiniri, enBuyukEsik)`'ten başlar → adım o gün **sessizce atlanır**, çökme yok.
- Sessizce atlanması yeterli değil: ekran, o adımın bugünkü pencereye sığmadığını **söylemeli** ("Bu adım bugün çalışmayacak — yatsı bugün 6 sa 40 dk"). Aksi halde kullanıcı ayarı kurar ve neden hiç uyarı gelmediğini anlamaz.

Sınır hesabı için ekranın o vaktin **bugünkü** giriş/çıkış saatlerini bilmesi gerekir; `MuhafizAyarlariSayfasi` bugün bunu bilmiyor. Ek girdi: `NamazVaktiHesaplayiciServisi`'nden vakit aralıkları (ekran zaten store'a bağlı, ucuz).

## 5. Cuma: periyodik hatırlatma (kullanıcı kararı)

Kullanıcı kademeli istemiyor; **tek adım + periyot** yeterli.

Pencere olarak: `baslangic = öğleVakti − oncedenDk`, `bitis = öğleVakti`, `yon: 'cikisaDogru'`, tek seviye, `siklik: { herDk: N }`.

Kazanç: "60 dk kala bir kez" yerine "60 dk kala başla, 15 dk'da bir hatırlat" olur ve bu **yeni kod değil**, mevcut plan üreticisinin aynısıdır. Kademeli istenirse ileride seviye sayısı 1'den 4'e çıkar; şema değişmez.

**Cuma'ya özgü korunacaklar** (bunlar pencereye taşınmaz, `CumaHatirlatmaServisi`'nde kalır): dört hafta ileri planlama, her cuma için ayrı `PrayerTimes`, `NamazAdi.Ogle` kimliği, cumaya özgü nass ve `vakit_bildirim` kanalı.

## 6. Ortak arayüz bileşeni (kullanıcının açık isteği)

> "tasarlarken kullanılan arayüz bileşeni de bence her yerde ortak olsun ki hepsi için ayrı ayrı ekranlar tasarlamayalım sürekli"

Bugünkü üç katman (`MuhafizAyarlariSayfasi` kabuk → `MuhafizAyarlari/VakitKarti` → `SeviyeDetayModal`) zaten doğru şekle sahip; eksik olan **parametrelenmesi**.

```
presentation/components/hatirlatma/
  PencereKarti.tsx        (bugünkü MuhafizAyarlari/VakitKarti — genelleştirilmiş)
  AdimDetayModal.tsx      (bugünkü SeviyeDetayModal)
  SesSecimSatiri.tsx      (taşınır, aynen)
  AkisOnizlemeModal.tsx   (taşınır — plan üreticisinden beslendiği için otomatik doğru)
  pencereTanimi.ts        (adım renkleri/başlıkları/ikonları burada, ekranda değil)
```

```ts
interface PencereTanimi {
  kaynak: string;              // 'vakit:yatsi' | 'cuma' | 'seri'
  baslik: string;              // "Yatsı" | "Cuma namazı" | "Seri hatırlatması"
  ikon: string;
  yon: PencereYonu;
  yonSecilebilir: boolean;     // muhafızda evet, cuma/seride hayır
  maksAdim: number;            // muhafız 4, cuma 1
  pencereUzunluguDk?: number;  // eşik tavanı buradan (§4)
  adimBilgileri: AdimBilgisi[];// renk/başlık — bugünkü SEVIYE_BILGILERI
}
```

Böylece:
- **Muhafız ekranı** = 5 `PencereKarti`
- **Cuma bölümü** (Bildirim Ayarları içinde) = 1 `PencereKarti`, `maksAdim: 1`
- **Seri bölümü** = 1 `PencereKarti`

Ekranların hiçbiri kendi adım/mod/ses arayüzünü yeniden çizmez. Yeni bir kanal (titreşim) eklendiğinde çip `AdimDetayModal`'a bir kez eklenir, üç ekranda birden görünür.

**Korunacak UI kuralları** (AGENTS.md'de kanla yazılı, taşınırken kaybolmamalı): iç içe modal yok (akordiyon bilinçli) · Switch satırı saran Touchable'ın **kardeşi** · serbest metin `onEndEditing`/blur'da yazılır · eşik stepper'ı komşulara kilitli · ekran ayarı yazmakla kalmaz, debounce'lu (1200 ms) **gerçek planı da tazeler** · adım renkleri kasten hardcoded, gövde metni daima tema token'ı.

## 7. Seri hatırlatması: büyük sayaçlı bildirim (istek 4)

Altyapı hazır: `startCountdown` canlı sayan bir bildirim kuruyor, `themeType` layout seçiyor (`CountdownNotificationHelper.kt:97`).

> **Mekanizma düzeltmesi:** `expo-countdown-notification/src/index.ts`'in doc-yorumu "Foreground Service + CountDownTimer" diyor; **bu bayat bir yorum**. Modülde Service sınıfı da `startForeground` da yok. Gerçek yol `NotificationManager.notify` + `RemoteViews.setChronometerCountDown` (`CountdownNotificationHelper.kt:113,158`): sayacı **sistem** çizer, uygulama süreci tik atmaz. İki sonucu var: (a) "pil maliyeti" gerekçesi geçersiz — geriye yalnız *kalıcı bildirim* UX gerekçesi kalır; (b) chronometer hedefte **kendiliğinden durmaz**, sıfırı geçince saymaya devam eder → hedef anında sayacı durduran ayrı bir tetik gerekir.

**Ama önce düzeltilmesi gereken bir tutarsızlık var** — kullanıcının "bu da zaten sabah namazına denk geliyordu sanırım?" sorusunun cevabı **hayır**:

| Ne | Nereden | Değer |
|---|---|---|
| Serinin gerçekten bittiği an (motor) | `seriHesapla` → `namazGunuHesapla(new Date(), ayarlar.gunBitisSaati)` (`SeriHesaplayiciServisi.ts:281`) | **sabit 05:00** |
| Hatırlatma bildiriminin saati | `seriSlice.ts:150-168` | imsak − `bildirimImsakOncesiDk` (otomatik) veya kullanıcının sabit saati |

`gunBitisSaati` alanı "DEPRECATED — artık otomatik hesaplanıyor (imsak vaktine göre)" diye işaretli (`SeriTipleri.ts:213`) ama motor **hâlâ onu okuyor**. Yazın imsak 03:30 olduğunda bildirim 03:00'te "gün bitmek üzere" der, oysa seri 05:00'e kadar sürer: kullanıcı 04:00'te namazını kılsa seri korunur, ama bildirim bunu "son an" diye göstermiştir.

Sayaç hedefi bu belirsizliğin üstüne kurulamaz — canlı bir geri sayım yanlış ana sayarsa hata **saniye saniye görünür** hâle gelir. O yüzden:

**Faz 5 iki adımdır:**
1. **Gün sınırını tek kaynağa bağla.** Seri gününün bittiği an = ertesi imsak (konum yoksa 05:00'e düş). `namazGunuHesapla` bu kaynaktan beslenir; `gunBitisSaati` gerçekten emekliye ayrılır. Bu bir davranış değişikliğidir (gün sınırı 05:00'ten imsağa kayar; yazın geriye, **kışın ileri** — TR kış imsağı ~06:40 > 05:00). Mevcut hâl zaten tutarsız olduğu için **kullanıcıya duyurulmaz**, ama nöbetçi test zorunludur (iki mevsim de).
2. **Sayacı kur.** `startCountdown({ id: 'seri_gun_sonu', targetTimeMs: <ertesi imsak>, themeType: 'seri' })`, başlangıç anı kullanıcının seçtiği zaman.

`themeType: 'seri'` yeni bir layout XML'i demek (native değişiklik, ayrı doğrulama turu). Ucuz yol olarak ilk sürümde `'vakit'` layout'u yeniden kullanılabilir; ama iftar/sahur'un kendi kimliği varken serinin de kendi rengi olmalı — kararı ürün tarafı versin.

**Algı notu:** sayaç saatlerce ekranda kalan bir bildirim üretir (pil değil, dikkat maliyeti). Bu yüzden başlangıç eşiği kullanıcı tarafından seçilmeli ve varsayılan **dar** olmalı (öneri: 2 saat). "Gün boyu sayan" bir bildirim istenmiyor.

## 8. Fazlar

Her faz tek başına sevk edilebilir; sıra bağımlılığa göre.

| Faz | İş | Bağımlılık | Büyüklük |
|---|---|---|---|
| **0** | Dinamik eşik tavanı + "bu adım bugün çalışmayacak" uyarısı | yok | S |
| **1** | `kalanDk` → `olcuDk`, `PencereYonu`, metin şablonu yöne göre | yok | M |
| **2** | `UyariModu` → `UyariKanallari` göçü (titreşim alanı açılır, bağlanmaz) | yok | M |
| **3** | Ortak `PencereKarti`/`AdimDetayModal` bileşenleri; muhafız ekranı bunlara taşınır | 1, 2 | L |
| **4** | Cuma periyodik hatırlatma (pencere + ortak bileşen) | 1, 3 | M |
| **5** | Seri gün sınırı tek kaynağa + büyük sayaçlı bildirim | yok (paralel gidebilir) | M + native |
| **6** | Titreşim kanalını gerçekten bağla (kanal id'si ses+titreşim hash'i) | 2 | M + native |

Faz 0 ve 5 diğerlerinden bağımsız; istenirse hemen çıkabilir.

## 9. Göç ve riskler

- **Disk şeması.** `MUHAFIZ_AYARLARI` tek JSON blob'u; `mod → kanallar` göçü `muhafizGoc.ts` desenini izler: idempotent, değişiklik yoksa **aynı referans**, yükleme yolu diske yazarken `{...parsed, ...sonuc}` ile **bilinmeyen alanları korur** (AGENTS.md'deki koordinat kaybı tuzağı).
- **Beş tüketici, üçü değil.** `ArkaplanMuhafizServisi`, `NamazMuhafiziServisi`, `VakitSayacBildirimServisi` **+ `ArkaplanGorevServisi` ve `KonumTakipServisi`** — son ikisi store'u değil ham AsyncStorage'ı okur. `muhafizMatrisiniCoz` tek kapı olmaya devam etmeli.
- **Preset'ler.** `HATIRLATMA_PRESETLERI` mod yazıyor → kanal kümesine çevrilmeli. `sesliIzinVar` zorunlu pozisyonel parametre sözleşmesi korunur (rıza kaydı uydurulamaz).
- **`sesliOnayi` rıza kaydı.** Kanal kümesine geçişte "sesli anons açık" anlamı değişmemeli; onay yalnız ekranda `SesliOnayModal` görüldüyse yazılır.
- **Id paritesi.** Ön plan/arka plan anons tekilleştirmesi `muhafizBildirimIdOlustur` id paritesine dayanıyor. `kaynak` alanı id formatına girerse **iki taraf da** aynı üreticiden beslenmeli, yoksa çift konuşma geri gelir.
- **Yön × kılınmışlık.** `girisindenItibaren` yönünde "vakit girdi, hâlâ kılmadın" hatırlatması, kılınmışlık kontrolüne bugünkünden **daha çok** dayanır (pencere boyunca sürekli tetiklenir). `kilinanVakitleriAl` hidrasyonu (#92) burada kritik; hydrate edilmeden `baslat` çağrılırsa kullanıcı kıldığı namaz için pencere boyunca uyarı alır.

## 10. Karşı argümanlar (kendi tasarımıma)

- **"Genelleştirme erken."** Bugün gerçek ikinci tüketici yalnız cuma ve o da tek adımlı. Karşı görüş: titreşim isteği zaten `mod` enum'unu patlatıyor; o göç yapılacaksa kanal kümesine bir kez geçmek daha ucuz. Yine de **Faz 3'ü (ortak bileşen) Faz 4 gerçekten gelmeden yapmamak** savunulabilir — bileşeni tek tüketiciyle genelleştirmek yanlış eksende soyutlama riskidir.
- **"`olcuDk` yeniden adlandırması gürültü."** Doğru, ama yönü desteklemenin daha ucuz yolu yok; alternatif (iki ayrı plan üreticisi) AGENTS.md'nin "iki motor aynı kuraldan beslenmeli" ilkesini kırar — bu projede zaten iki kez bug ürettiği yer.
- **Ortak bileşen tek ekranı şişirebilir.** Cuma bölümü tam bir muhafız kartına ihtiyaç duymuyor; `maksAdim: 1` ile sadeleşiyor ama yine de tek bir "önceden kaç dk" stepper'ından ağır. Ölçüt: cuma ekranı bugünkünden **daha karmaşık görünüyorsa** ortak bileşen o ekran için yanlıştır.

## 11. Kararlar (kullanıcı onayı alındı)

1. **Hepsi yapılacak**, tek dalda; Faz 0 ve 5 paralel kulvarda.
2. Seri gün sınırının imsağa kayması **kabul, duyurusuz** — mevcut davranış zaten bozuk.
3. Seri sayacı **kendi native layout'unu** alır (`themeType: 'seri'`).
4. Faz 3 ile 4 **birlikte** (tek tüketiciyle genelleştirme riski, §10).

Uygulama adımları: [plan](../plans/2026-08-27-hatirlatma-penceresi.md).
