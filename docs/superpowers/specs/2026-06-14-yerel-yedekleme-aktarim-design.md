# Yerel Yedekleme & Aktarım — Tasarım (Faz 1)

> Tarih: 2026-06-14 · Durum: onaylandı · Kapsam: **yerel içe/dışa aktarma + akıllı içe-aktarma sihirbazı**. Bulut (Google Drive) otomatik yedek **Faz 2**'ye bırakıldı (bu belgenin sonunda taslak).

## 1. Amaç ve karar özeti

Kullanıcı verilerini (namaz kayıtları, seri/puan/rozet, kaza defteri, ayarlar) kaybetmeden saklayabilmek, başka cihaza taşıyabilmek ve içe aktarırken mevcut veriyle **akıllıca birleştirebilmek** için yerel yedekleme/aktarma özelliği.

Onaylanan kararlar:
- **Kapsam:** Aşamalı — Faz 1 yerel dosya (oluştur/paylaş + belge seçiciyle içe aktar + sihirbaz). Drive Faz 2.
- **Güvenlik:** **Uygulama-yönetimli anahtar** ile şifreleme (kullanıcıdan parola İSTENMEZ; uygulama her zaman çözebilir). Dürüst sınır: bu "gözden saklama + bütünlük" seviyesidir, gerçek gizlilik değil — uygulamaya sahip biri teknik olarak çözebilir. Faz 2'de hesap-türevli anahtar düşünülecek.
- **Çakışma modeli:** 4 strateji — **Akıllı birleştir (varsayılan)**, Üzerine yaz, Sadece eksikleri ekle, Gelişmiş (kategori-kategori).
- **UI:** Takvim ayarları (bottom-sheet) + Kurulum Sihirbazı (çok-adımlı) diliyle birebir kalite.

## 2. Hedefler / hedef-olmayanlar

**Hedefler (Faz 1):** Tam yedek dosyası oluşturma; sistem paylaşımıyla dışa aktarma; belge seçiciyle içe aktarma; şifreli + bütünlük-doğrulamalı dosya; 4 stratejili akıllı içe-aktarma sihirbazı; içe-aktarma sonrası store + puanlama tutarlılığı; veri-kaybı yok.

**Hedef değil (Faz 1):** Google Drive / bulut; otomatik zamanlanmış yedek; hesap girişi; çapraz-platform şifre uyumu; kısmi/seçmeli gün-gün dışa aktarma (yalnız kategori düzeyi).

## 3. Yedeklenecek veri kapsamı

Kaynak: kod tabanı haritası (`src/data/local/*`, `src/presentation/store/*`, `UygulamaSabitleri.DEPOLAMA_ANAHTARLARI`). Tüm erişim `src/data/local/Depolama.ts` üzerinden (atomik kuyruk, güvenli parse).

| Kategori | Anahtar(lar) | Yedeklenir |
|---|---|---|
| Namaz kayıtları | `namaz_gun_*` (önek) | ✅ kritik |
| Kılınan vakitler | `${MUHAFIZ_AYARLARI}_kilinan_*` (önek) | ✅ kritik (namazlardan türetilebilir ama tutarlılık için dahil) |
| Migrasyon bayrağı | `@namaz_akisi/namaz_gun_migrasyon_tamam` | içe-aktarmada `1` set edilir (değer dosyada taşınmaz) |
| Seri / puan | `seri_durumu`, `rozet_verileri`, `seviye_durumu`, `@namaz_akisi/bonus_puan` | ✅ kritik |
| İstatistik | `toplam_kililan_namaz`, `mukemmel_gun_sayisi`, `toparlanma_sayisi` | ✅ kritik (puan reconcile ile de türetilir) |
| Kaza defteri | `@namaz_akisi/kaza_durumu`, `@namaz_akisi/kaza_tempo_gecmis` | ✅ kritik |
| Ayarlar | `seri_ayarlari`, `ozel_gun_ayarlari`, `muhafiz_ayarlari`, `@namaz_akisi/konum_ayarlari`, `vakit_bildirim_ayarlari`, `@namaz_akisi/takvim_ayarlari`, `vakit_sayac_ayarlari`, `sahur_sayac_ayarlari`, `iftar_sayac_ayarlari` | ⚙️ opsiyonel (varsayılan dahil; "Gelişmiş"te hariç tutulabilir) |
| Türev / UI / önbellek | `@namaz_akisi/ilk_kurulum_tamamlandi`, `@namaz_akisi/gorulen_ozellikler`, `@namaz_akisi/guncelleme_durumu`, eski `namaz_verileri` blob'u | ❌ yedeklenmez |

## 4. Dosya biçimi

Dosya adı: `namaz-yedek-YYYY-MM-DD.json`. İçerik = şifreli zarf:

```jsonc
{
  "bicim": "namaz-akisi-yedek",
  "surum": 1,
  "olusturulma": "2026-06-14T10:00:00.000Z",
  "uygulamaSurumu": "0.24.0",
  "sifreli": true,
  "nonce": "<base64>",          // tweetnacl secretbox nonce (dosya-başına rastgele)
  "veri": "<base64>",           // secretbox(şifrelenmiş payload JSON)
  "kontrol": "<sha256 hex>"     // payload düz-metninin SHA-256'sı (bütünlük)
}
```

Payload (şifre çözülünce):

```jsonc
{
  "namazGunleri": { "2026-06-14": { "Sabah": true, "Öğle": false, ... } },
  "kilinanVakitler": { "2026-06-14": ["imsak", "ogle"] },
  "seri": { ... }, "rozetler": [ ... ], "seviye": { ... }, "bonusPuan": 50,
  "istatistik": { "toplamKilinan": 1250, "mukemmelGun": 42, "toparlanma": 3 },
  "kaza": { ... }, "kazaTempo": { ... },
  "ayarlar": { "muhafiz": {...}, "vakitBildirim": {...}, "konum": {...},
               "takvim": {...}, "vakitSayac": {...}, "sahurSayac": {...},
               "iftarSayac": {...}, "seriAyarlari": {...}, "ozelGun": {...} }
}
```

İleri-uyum: `surum` artırılabilir; içe-aktarmada eski sürümler küçük göç adımlarıyla yükseltilir. Uygulamadan **yeni** sürüm → kibar "uygulamayı güncelleyin" hatası.

## 5. Şifreleme

- Kütüphane: **tweetnacl** + **tweetnacl-util** (saf-JS, native yok, Expo-uyumlu, kimlik-doğrulamalı `secretbox` = XSalsa20-Poly1305).
- Anahtar: uygulamada gömülü 32-baytlık sabit (kaynak kodda `src/core/constants` dışında, ayrı util içinde; sır olmadığı net belgelenir). Dosya-başına rastgele `nonce` (`nacl.randomBytes`).
- Bütünlük: secretbox zaten MAC sağlar; ayrıca payload düz-metninin `sha256` (`expo-crypto.digestStringAsync`) `kontrol` alanında — çözme sonrası doğrulanır.
- Rastgelelik: `nacl.randomBytes` (expo ortamında `global.crypto`/`expo-crypto` poly ile). Gerekirse `expo-crypto.getRandomBytesAsync` ile besle.
- Dürüst sınır belgesi: anahtar uygulamayla geldiğinden gizlilik garantisi yok; amaç düz-metin dosyanın ortada durmaması + bozulma tespiti.

## 6. Mimari ve modüller

Domain saf kalır (store'a bağımsız; tipler dosya-içi). Yeni dosyalar:

- `src/core/utils/yedekSifreleme.ts` — `sifrele(payloadJson): {nonce, veri}`, `coz(nonce, veri): string`, `kontrolHesapla(json): Promise<string>`. tweetnacl sarmalayıcı.
- `src/domain/services/YedeklemeServisi.ts` — `yedekZarfiOlustur(): Promise<string>` (anahtarları `Depolama` ile topla → payload → checksum → şifrele → zarf JSON); `zarfiCoz(dosyaIcerigi): Promise<Payload>` (parse → biçim/sürüm doğrula → çöz → checksum doğrula → sürüm göçü).
- `src/domain/services/YedekBirlestirmeServisi.ts` — saf: `farkCikar(mevcutOzet, gelenPayload): FarkOzeti`; `birlestir(strateji, gelen, secimler): YazimPlani` (hangi anahtara ne yazılacağının düz planı). **AsyncStorage'a yazmaz** — yalnız plan üretir; yazımı servis `Depolama` ile yapar.
- `src/data/local/YedekDepolama.ts` (veya `YedeklemeServisi` içinde) — `tumYedekAnahtarlariniTopla()`, `yazimPlaniniUygula(plan)` (her anahtar `Depolama.yaz/guncelle` atomik; `namaz_gun_migrasyon_tamam=1`).
- `src/presentation/store/yedeklemeSlice.ts` — UI durumu (aşama, ilerleme, hata) + orkestratör thunk `iceAktarmayiUygula(payload, strateji, secimler)`: domain birleştir → `Depolama` yaz → **§10 sırasıyla** loader thunk'ları + `puanlamayiYenidenHesapla` dispatch.
- `src/presentation/screens/Yedekleme/`
  - `YedeklemeSayfasi.tsx` — giriş sayfası: "Yedek oluştur" (tek dokunuş → şifrele → paylaş) ve "İçe aktar / Geri yükle" (→ sihirbaz). Bilgi kartı: neyin dahil olduğu + güvenlik notu.
  - `IceAktarmaSihirbazi/IceAktarmaSihirbaziSayfasi.tsx`, `adimlar.tsx`, `stiller.ts`, `tipler.ts` — adımlar: (1) dosya seç, (2) çöz & doğrula, (3) karşılaştır & strateji, (4) (Gelişmiş ise) kategori seçimi, (5) uygula (ilerleme), (6) özet.

## 7. Dışa aktarma akışı

1. `YedeklemeServisi.yedekZarfiOlustur()` → şifreli zarf string.
2. `expo-file-system` ile cache'e `namaz-yedek-<tarih>.json` yaz.
3. `expo-sharing.shareAsync` ile sistem paylaşım sayfası.
4. Varsayılan **tam yedek**; "Gelişmiş" genişletmesinde kategori kapatma (ör. ayarları hariç tut) → payload'dan ilgili alanlar çıkarılır.

## 8. İçe aktarma akışı (sihirbaz)

1. `expo-document-picker` ile `.json` seç.
2. `expo-file-system` ile oku → `YedeklemeServisi.zarfiCoz` (biçim/sürüm/checksum doğrula; hata → kibar mesaj, sihirbaz durur).
3. `farkCikar(mevcutÖzet, gelen)` → özet (toplam gün, çakışan gün, rozet/kaza/ayar varlığı). Ekran: mockup'taki karşılaştırma + 4 strateji kartı.
4. Strateji seç (Gelişmiş ise kategori-kategori alt-ekran).
5. `iceAktarmayiUygula` → yazım + store tazeleme (§10). İlerleme göstergesi.
6. Özet ekranı: ne eklendi/güncellendi/atlandı; "Tamam".

Donanım geri tuşu: her modal/adımda `useDonanimGeriTusu`.

## 9. Birleştirme semantiği

**Akıllı birleştir (varsayılan) — veri-kaybı yok:**
- `namaz_gun_*`: gün+namaz bazında `kılındı = mevcut || gelen` (birinde işaretliyse korunur, **asla geri alınmaz**). Yeni günler eklenir.
- `kilinanVakitler`: vakit kümelerinin birleşimi.
- İstatistik & seviye & mükemmel-gün: **birleşmiş kayıttan** `puanlamayiYenidenHesapla` ile yeniden türetilir (olay-tetiklemeli artırma YOK — AGENTS.md).
- `bonusPuan`: `max(mevcut, gelen)`.
- Kaza: namaz başına `tamamlanan = max`, `kalanBorc` buna göre; tempo geçmişi tarih-bazlı birleşim (çakışan tarihte `max`).
- Ayarlar: **mevcut korunur** (cihazın konumu/bildirimi bozulmaz); gelen ayarlar uygulanmaz.

**Üzerine yaz:** Tüm kategoriler gelenle değiştirilir (mevcut silinir). Net uyarı + onay.

**Sadece eksikleri ekle:** Yalnız mevcutta olmayan gün/kayıt eklenir; çakışan her şey atlanır; ayarlar dokunulmaz.

**Gelişmiş:** Kategori bazında (namaz / puan & rozet / kaza / ayarlar) ayrı strateji seçimi; her biri yukarıdaki kurallarla.

Her durumda yazımdan sonra reconcile zinciri **sıralı** çalışır (`seriKontrolet → puanlamayiYenidenHesapla`; paralel dispatch yok — AGENTS.md yarış kuralı).

## 10. İçe-aktarma sonrası store tazeleme sırası

Kritik sıra (App.tsx/AnaSayfa.tsx başlangıç akışıyla uyumlu):
1. `konumAyarlariniYukle` (önce — sayaç/muhafız buna bağlı)
2. `muhafizAyarlariniYukle`, `vakitSayacAyarlariniYukle`, `iftarSayacAyarlariniYukle`, `sahurSayacAyarlariniYukle`, `vakitBildirimAyarlariniYukle`, `takvimAyarlariniYukle`
3. `namazlariYukle({ tarih: bugunuAl() })`
4. `seriVerileriniYukle` (bonusPuan göç kontrolü) → sonra `seriKontrolet` → `puanlamayiYenidenHesapla` (sıralı)
5. `kazaVerileriniYukle`, `ozellikleriYukle`
6. Arka plan servislerini yeniden yapılandır (muhafız/vakit bildirim planlaması).

## 11. Hata yönetimi & kenar durumlar

- Bozuk/yanlış dosya / çözme hatası / checksum uyuşmazlığı → "Bu dosya bir Namaz Akışı yedeği değil veya bozulmuş." Sihirbaz güvenle durur, hiçbir yazım yapılmaz.
- Yedek sürümü > uygulama → "Bu yedek daha yeni bir sürümle oluşturulmuş; lütfen uygulamayı güncelleyin."
- **Önce tam doğrula, sonra yaz**: yarım uygulama olmaz (plan tamamen hazırlanır, sonra atomik yazılır).
- Boş/çok büyük dosya, yetki reddi (paylaşım/seçici iptali) → kibar bilgilendirme, çökme yok.
- `migrasyonyiGarantile` ile yarış olmaması için içe-aktarma `namaz_gun_migrasyon_tamam=1` set eder.

## 12. Güvenlik (AGENTS.md)

- Loglara koordinat/hassas veri yazma; gerekiyorsa `toFixed(1)`.
- `allowBackup="false"` korunur (OS otomatik yedeği kapalı — bilinçli; bizim yedek kullanıcı kontrolünde).
- Yeni izin sızıntısı kontrolü: `expo-document-picker` ve tweetnacl native izin eklememeli; `android/` manifest merge gözden geçirilir.
- Paylaşım yalnız sistem paylaşım sayfası (kullanıcı hedefi seçer); uygulama dış URL açmaz.

## 13. Test planı

Domain saf → ağır unit test (mock: async-storage, expo-file-system, expo-crypto/tweetnacl, react-native Platform; sabit tarih YOK → `bugunuAl()/dunuAl()`):
- `yedekSifreleme`: şifrele↔çöz tur-turu; yanlış nonce/bozuk veri → hata; checksum.
- `YedeklemeServisi`: `yedekZarfiOlustur` tüm anahtarları toplar; `zarfiCoz` biçim/sürüm/checksum doğrular; eski sürüm göçü; bozuk dosya.
- `YedekBirlestirmeServisi`: `farkCikar` doğru özet; her strateji için `birlestir` planı; **akıllı birleştir union'ın asla geri-almadığı**; bonusPuan max; kaza max; ayarlar korunur.
- `yedeklemeSlice`: `iceAktarmayiUygula` doğru sırada thunk dispatch + reconcile (Immer dondurulmuş state → `[...]` kopya).
- Sihirbaz bileşen testleri (kritik akış + kibar "siz" dili).

## 14. Yeni bağımlılıklar (AGENTS.md "önce sor" — onaylandı)

- `expo-document-picker` (SDK 54 uyumlu sürüm) — içe aktarma için zorunlu.
- `tweetnacl` + `tweetnacl-util` — şifreleme. (Alternatif düşünülen: crypto-js; tweetnacl seçildi: küçük, kimlik-doğrulamalı.)
- `expo-sharing`, `expo-file-system`, `expo-crypto` — kurulu/uyumlu (expo-crypto digest için; gerekirse eklenir).

İkisi de saf-JS/Expo-uyumlu; `android/` native değişikliği beklenmez. Eklemeden sonra `npm install` + izin sızıntı kontrolü.

## 15. Entegrasyon noktaları

- `src/navigation/AppNavigator.tsx` — AyarlarStack'e `YedeklemeAktarim` ekranı + import.
- `src/presentation/screens/AyarlarSayfasi.tsx` — `MENU_IKONLARI` + `menuOgeleri` ("Yedekleme & Aktarım", ikon `download`/`database-export`).
- `src/presentation/screens/index.ts` — export.
- `src/core/constants/YeniOzellikler.ts` — duyuru girişi (kibar "siz" dili, `kartGoster`, `hedefSayfa: 'YedeklemeAktarim'`).
- `src/presentation/store` — `yedeklemeSlice` reducer kaydı.

## 16. Faz 2 (gelecek — Google Drive otomatik yedek)

Taslak (bu spec'in kapsamı dışında): Google Sign-In SDK + Drive `appDataFolder` kapsamı; kullanıcı kendi hesabına WhatsApp-tarzı otomatik yedek; hesap-türevli/şifreli anahtar; zamanlanmış yedek + "son yedek N gün önce" hatırlatması. Gerektirir: GCP projesi, OAuth izin ekranı, SHA-1 parmak izleri, `android/` native yapılandırma — ayrı tasarım + onay.

## 17. Varsayılanlar (spec incelemesinde değiştirilebilir)

- Dışa aktarma varsayılanı: tam yedek (ayarlar dahil).
- Şifreleme kütüphanesi: tweetnacl.
- Dosya uzantısı: `.json` (paylaşım/seçici uyumu için; içerik şifreli zarf).
- Faz 1'de otomatik/zamanlanmış yerel yedek YOK (Faz 2 ile Drive'a bağlı).
