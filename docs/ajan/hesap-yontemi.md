# Hesap yöntemi ve dünya konumu

Ne zaman okunur: vakit hesap parametrelerine, ülke profillerine, "Hesap yöntemi" sayfasına, bölge takvimi önerisine, dünya şehri seçimine, ülke tespitine ya da TV'ye giden hesap özetine dokunuyorsan. Tasarım ve araştırma kaynakları: `docs/superpowers/specs/2026-10-24-cok-dil-dunya-konum-design.md`.

Katmanlar: `core/vakit/hesapProfilleri.ts` (profil tablosu, `hesapParametreleriOlustur`) · `core/vakit/ulkeProfilleri.ts` (ülke → varsayılan profil + güven) · `core/vakit/aktifHesap.ts` (süreç içi etkin ayar, `aktifPrayerTimes`) · `HesapAyariServisi` (disk, giriş kapısı) · `hesapSlice` (ekran) · `core/konum/{dunyaSehirleri,ulkeTespiti,ulkeAdlari}.ts` · `core/vakit/tvHesapOzeti.ts`.

## Hesap

- **Tek yol `aktifPrayerTimes(koordinat, tarih)`; parametre gün ve enleme göre kurulur** (Ümmü'l-Kurâ Ramazan yatsısı +30 dk, 48° üstünde Diyanet dışı profillerde `SeventhOfTheNight`). Dokunulmamış Diyanet ayarı `turkiyeHesapParametreleri()`'ni BİREBİR döndürür; Türkiye kullanıcısının vakti bu işten hiç etkilenmez. Nöbetçi: `hesapProfilleri.test.ts` "Diyanet byte-identical".
- **Sahip kararı (2026-10-24): Türkiye dışında varsayılan YEREL OTORİTEDİR; Caferî ve Tahran yalnız elle seçilir** (`yalnizElle`). İran'ın resmî takvimi Tahran yöntemidir; Şia yöntemleri otomatik önerilmediği için İran varsayılanı genel yöntemdir (MWL, güven `genel`). Güney Asya (PK/IN/BD/AF) ve Orta Asya'da varsayılan ikindi asr-ı sânîdir.
- **`guven` kullanıcıya söylenir:** `olculdu` (resmî takvimle karşılaştırıldı), `kaynakli` (otoritenin yayımladığı açı/kural), `genel` ("bu ülke için doğrulanmış bir resmî takvim bulamadık"). Tahmini sessizce "resmî" gösterme.
- **Yöntem asla sessizce değişmez:** başka ülkeye geçince `useBolgeTakvimiOnerisi` ülke başına BİR KEZ sorar (`sorulanUlkeler`); "Kabul" profili/ikindiyi kurar, elle dakika ve açıları siler. Hesap ayarı yüklenmeden karar verilmez (initialState Diyanet'i gerçek veri sanma).
- **Adhan'ın `Singapore` hazır ayarı Malezya için YANLIŞ:** JAKIM 18°/18° + ihtiyat kullanır (Kuala Lumpur sabahı ~10 dk kayar). Kemenag 20°/18° + ihtiyat. Nöbetçi: `hesapProfilleri.test.ts` (KL 05:49/20:10).
- **Hesap ayarı değişince yayma `konumDegistiUygula`'dan geçer** (`hesapSlice.hesapAyariniKaydet`, yalnız vakit değiştiyse) → bildirim planları, widget, saat ve TV aynı turda tazelenir. `NamazVaktiHesaplayiciServisi` önbellek anahtarı `aktifHesapSurumu()` ile başlar.
- **Giriş kapısı:** `index.ts` headless görevleri, notifee arka plan olayı, `ArkaplanGorevServisi`, geofence görevi ve kılınmışlık dinleyicisi kuran servisler `HesapAyariServisi.hazir()`'dan SONRA yüklenir. Yeni bir arka plan giriş noktası da önce bunu beklemeli.
- **Yedek:** anahtar `hesap_ayari` üç beyaz listede; içe aktarmada hesap ayarı konumdan ÖNCE yüklenir (`yedeklemeSlice` sırası, nöbetçi testte).

## Dünya konumu

- **Dünya şehirleri GeoNames (CC BY 4.0) varlığıdır, OSM (ODbL) cami verisinden AYRI tutulur:** `assets/konum/dunya.bin` (`scripts/konum/dunya-sehirleri-uret.js`, Türkiye hariç; Türkiye il/ilçe listesi değişmedi), atıf Hakkında sayfasında ve `assets/konum/LICENSE.md`'de. Okuyucu `data/local/dunyaSehirVerisi.ts` (expo-asset + `File.text()`), ekranda TEMBEL `require` + try/catch (jest'te expo-asset yok). **Release APK'da varlık okuması cihazda DOĞRULANMADI.**
- **Ülke adları üretilmiş tablodur** (`scripts/konum/ulke-adlari-uret.js` → `ulkeAdlariVerisi.ts`, Node `Intl.DisplayNames` CLDR'den): Hermes'te `Intl.DisplayNames` yok.
- **Ülke kodu konum kaydıyla birlikte tazelenir:** GPS/geofence `yeniKonumuUygula` ters kodlamadan `ulkeKodu` yazar ve `dunyaSehri`'ni siler; `konumKaydiTutarliHale` Türkiye ili ↔ dünya şehri seçimini birbirini silecek şekilde tutar. `kayitliUlkeKodu` dünya şehrini YALNIZ elle modda okur. Kayıtta ülke yoksa `koordinatinUlkesi` çevrimdışı tespit eder (Türkiye ilçe merkezleri + en yakın dünya şehri). Nöbetçi: `konumKaydiTutarliligi.test.ts`.
- **Ekranda Türkçe ek getirme:** ülke adına hal eki ("…'dasınız") yazma; ses uyumu ada göre değişir → "Bulunduğunuz yer · <ad>".

## TV ve diğer cihazlar

- **Android TV vakitleri kendisi hesaplar → telefon yüke çözülmüş parametre özeti koyar (`durum.hesap`, `tvHesapOzeti`).** Alan yoksa (dokunulmamış Diyanet ya da eski telefon) TV Türkiye yolunu kullanır. TV `tel_hesap`'ta saklar; elle il seçimi ve 7 haneli kod (Türkiye ızgarası) Türkiye yoluna döner. adhan2 0.0.6'da akşam açısı yok → `VakitHesabi.aciliAksam` adhan JS kuralıyla ekler. Kilit: `scripts/tv/tv-verisi-uret.js` (`sucrase/register` ile TS kaynağını doğrudan okur) → `vakit-fiksturu-dunya.json` (20 şehir × 3 tarih) ↔ Kotlin `VakitHesabiTest.dunyaYontemleriTelefonlaAyni` ↔ jest `TvVakitParitesi` (özet + servis yolu). Profil/parametre değişirse betiği yeniden koş.
- **Apple TV panosu Türkiye illeriyle sınırlıdır** (ağ yok, il elle seçilir) → yalnız Turkey yolu taşınır; telefondan konum almaya başlarsa genel yol da taşınmalı.
- **Widget, saat, Android asistan fonksiyonları, Namaz modu ve iOS hedefleri vakit HESAPLAMAZ;** JS'in yazdığı çizelgeyi okur — etkin ayar kendiliğinden yansır.
- **Özel günler (`ozelGunler.ts`) Diyanet takvimidir;** Türkiye dışında hicri gün bir gün kayabilir (tablo dışı = sus kuralı geçerli).
