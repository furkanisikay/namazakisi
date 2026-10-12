# Nafile namaz vakitleri (issue #77) — tasarım

Durum: TASLAK (Fable incelemesi bekleniyor)

> Issue: "Nafile namazlar için alarm ve bildirim desteği eklenebilmeli. Gün içindeki nafileler için hem gösterge olmalı hem de bildirim kurulabilmeli, aynı şekilde gece kılınan teheccüd için mesela alarm kurulabilmeli."

## 1. Hangi nafileler, hangi pencere (Hanefî, Diyanet uygulaması)

| Nafile | Pencere başı | Pencere sonu | Faziletli an (gösterge) |
|---|---|---|---|
| **İşrak** | güneş doğuşu + 45 dk (şuruk kerahati çıkınca) | işrak + 60 dk (kuşluğa devreder) | pencere başı |
| **Kuşluk (Duhâ)** | güneş doğuşu + 45 dk | öğle − 45 dk (istiva kerahatinden önce) | gündüzün dörtte biri: `gunes + (aksam − gunes) / 4` |
| **Evvâbîn** | akşam + 10 dk (akşamın farzı ve sünneti kılınmış sayılır) | yatsı | pencere başı |
| **Teheccüd** | yatsı + 30 dk (uyuyup kalkma şartı için sabit pay — gösterge amaçlı) | ertesi imsak | gecenin son üçte biri: `aksam + 2/3 × (imsak' − aksam)` (adhan `SunnahTimes.lastThirdOfTheNight` ile birebir) |

**Kerahat sabiti tek kaynak DEĞİL — bilinçli:** `KAZA_SABITLERI.MEKRUH_TOLERANS_DK = 20` kaza ekranında "pratik uyarı" içindir. Nafile göstergesi **başlatıcı** bir öneridir; Diyanet'in yaygın "güneş doğduktan 45–50 dk sonra" ifadesine uyan **ihtiyatlı** 45 dk kullanılır (`NAFILE_SABITLERI.SURUK_SONRASI_DK = 45`, `ISTIVA_ONCESI_DK = 45`). İki sabit ayrı tutulur, ikisi de kodda gerekçesiyle yazılır. (Not: kaza tarafını 45'e çekmek ayrı bir karar — bu iş kapsamında değil.)

Vakitler `CalculationMethod.Turkey()` ile, **gün bazında** ayrı `PrayerTimes` ile hesaplanır (AGENTS.md kuralı). Teheccüd gece yarısını aşar: "bu gecenin teheccüdü" = bugünün yatsısı → yarının imsakı.

## 2. Katmanlar (cuma hatırlatmasının deseni)

- `src/core/nafile/nafileVakitleri.ts` — SAF: `nafilePencereleriHesapla(vakitler: GunVakitleri, yarininImsaki: Date): NafilePencere[]`, `aktifVeyaSiradakiNafile(pencereler, simdi)`. adhan'a bağımlı değil (girdi = hazır `Date`'ler) → deterministik testler.
- `src/data/local/LocalNafileServisi.ts` — ayarlar (`DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI`).
- `src/domain/services/NafileHatirlatmaServisi.ts` — `yapilandirVePlanla(koordinat, ayarlar)`; koordinat **parametre** (cuma dersi: headless'ta singleton boş), `(0,0)` reddedilir.
- `src/presentation/store/nafileSlice.ts` — `nafileAyarlariniYukle` / `nafileAyarlariniGuncelle`.
- Ekran: `NafileAyarlariSayfasi.tsx` (AyarlarStack, başlık header'da — sayfa gövdesinde tekrarlanmaz).

## 3. Ayarlar şekli

```ts
interface NafileAyarlari {
  gostergeAktif: boolean;            // ana ekranda nafile şeridi (varsayılan false — opt-in)
  hatirlatmalar: Record<'israk' | 'kusluk' | 'evvabin', { aktif: boolean; ofsetDk: number }>; // ofset: pencere başından sonra 0–60
  teheccud: {
    aktif: boolean;
    hedef: 'sonUcteBir' | 'imsaktanOnce';
    imsaktanOnceDk: number;          // 15–120, hedef='imsaktanOnce' iken
    uyandirma: boolean;              // true: alarm kanalı (sessiz modu deler), false: normal bildirim
  };
}
```
Varsayılan: hepsi kapalı. Eski kayıt / bozuk alan → varsayılandan tamamlanır (`localSeriAyarlariniGetir` deseni).

## 4. Bildirim / "alarm"

- Gün içi nafileler: mevcut `vakit_bildirim` kanalı (yeni kanal açılmaz), `DATE` trigger, **3 gün ileri** planlanır (bugün + 2), id öneki `nafile_<tarih>_<tur>`; her planlamada önce tüm `nafile_` ön ekli bildirimler iptal edilir.
- Teheccüd **uyandırma**: yeni kanal `nafile_uyandirma` — `IMPORTANCE_HIGH`, `audioAttributes.usage = ALARM` (expo `setNotificationChannelAsync` destekliyor; **native kod yok**), ses `bildirim`, `bypassDnd: true` (izin yoksa Android sessizce yok sayar — AGENTS.md'de kayıtlı). Kanal **yoksa** oluşturulur, mevcut kanala ses yazılmaz (AGENTS.md tuzağı). Tam ekran alarm (#74) **kapsam dışı**.
- iOS: aynı DATE bildirimleri çalışır; uyandırma iOS'ta `interruptionLevel: 'timeSensitive'` normal bildirimdir (sessiz anahtarı delmez — `AdimNotlari`'ndaki gibi ekranda söylenir).
- Metin kaydı: bu bir **ibadete çağrı** → "sen" dili istisnası geçerli, **ama** nafile gönüllüdür: emir/sertlik YOK, davet tonu: "Kuşluk vakti girdi. İki rekât kılmak için güzel bir an." / "Gecenin son üçte biri. Kalk, teheccüd için güzel bir vakit." Suçlama, "kaçırdın" dili, terk nassı **yasak**. Nass yalnız ilgili bildirimde, vakte özgü (ör. teheccüd: İsrâ 17/79).

## 5. Tetikleme noktaları (konuma bağlı tüketici)

`App.tsx` açılış zinciri **ve** `KonumDegisikligiServisi.konumDegistiUygula` (ikisine de — AGENTS.md "yeni tüketici eklerken İKİSİNE de ekle"; nöbetçi test genişletilir) + `ArkaplanGorevServisi` (muhafız erken dönüşlerinden ÖNCE) + slice thunk'ı + yedekten geri yükleme. Yedekleme beyaz listesi: `YedeklemeServisi.ayarlariTopla` + `YedekBirlestirmeServisi.AYAR_ANAHTARLARI` + `yedeklemeSlice` yükleme zinciri.

## 6. Gösterge (ana ekran)

`gostergeAktif` iken `VakitKarti`'nın altında **tek satırlık sakin şerit** (`NafileSeridi`): ikon çipi (`renk+'20'`, `FontAwesome5 "moon"/"sun"`) + "Kuşluk vakti · 11:47'ye kadar" ya da sıradaki için "Sıradaki nafile: Evvâbîn · 18:24". Dokununca `BildirimModali` (`tip:'bilgi'`) pencerenin kısa açıklamasını ve faziletli anı gösterir. **Gösterilen güne göre** hesaplanır (`sayfaTarihi`), bugün değilse şerit gizlenir (geçmiş günde "şimdi" anlamsız). Ana ekran saniyede bir çizilir → şerit `React.memo`, prop'lar dize/sayı (Date değil — AGENTS.md).

Takip/işaretleme (kıldım), puan/seri etkisi: **YOK** (kapsam dışı — nafile ibadet takibi ayrı bir tartışma; puanlama türev modelini bozmaz).

## 7. Ekran (NafileAyarlariSayfasi)

Ayarlar > Bildirimler bölümüne yeni satır "Nafile namazlar". Sayfa: üstte açıklama satırı; "Ana ekranda göster" anahtarı (`Anahtar`); üç gündüz/akşam kartı (anahtar + "Vakit girince / N dk sonra" `SayisalSecici`, `aciklama` prop zorunlu); teheccüd kartı (anahtar + hedef seçici iki çip "Gecenin son üçte biri" / "İmsaktan önce" + dk seçici + "Uyandırma sesi" anahtarı ve açıklaması "Sessiz modda da çalar"). Her kartta o günün penceresi küçük metinle ("Bugün 07:12 – 12:21"). Tasarım dili: kart `borderRadius 24`, tonlu ikon çipi, `useRenkler` tokenları.

## 8. Testler
- `nafileVakitleri.test.ts`: yaz/kış iki mevsim, İstanbul; teheccüd gece yarısını aşar; kuşluk penceresi öğle−45'te biter; son üçte bir adhan `SunnahTimes` ile eşit.
- `NafileHatirlatmaServisi.test.ts`: kapalıyken hiçbir şey planlanmaz; (0,0) reddi; iptal → planla sırası; id formatı (tarih `bugunuAl()` ile, sabit tarih YOK).
- `KonumDegisikligiServisi.test.ts` nöbetçisi yeni tüketiciyi kapsar.
- Ekran testi: anahtar → slice dispatch; `SayisalSecici` etiketleri benzersiz.
