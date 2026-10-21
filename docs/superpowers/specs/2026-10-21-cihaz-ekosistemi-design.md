# Cihaz ekosistemi — tasarım (v2, Fable incelemesi işlendi; sahip onayı bekliyor)

Tarih: 2026-10-21. Kapsam: telefon, Wear OS, Apple Watch, Android tablet, iPad, Fold, Android TV, Apple TV, araç.

## 0. Neden
Sahip eleştirisi: cihazlar ayrı ayrı yapıldı; TV "duvar saati", iPad "uzatılmış telefon", Apple Watch "sade ve güzel değil". Çıta: saat↔telefon işi. Tek soru: **"Bu cihaz, bu anda namazı kılmayı nasıl kolaylaştırır?"** Cevabı olmayan öğe çıkarılır.

## 1. İlke: tek beyin, çok yüzey
- **Telefon beyindir:** vakit hesabı, kayıt, muhafız, kaza, erteleme tek yerde. İkinci motor YOK.
- **Diğerleri yüzeydir:** gösterir, (bilekte/araçta) Kıldım alır, telefon yetişemediğinde (yalnız saat) hatırlatır.
- **Tablet ikinci motor olmaz:** iCloud/Drive eşitlemesiyle kayıt birleşir (union), ama aynı kişinin tabletinde muhafız telefonla çift bildirim üretir → tablette "Hatırlatmaları bu cihazda kur" varsayılan KAPALI (telefon varsa), ev ekranı modunda hiç kurulmaz.
- **Sunucu yok.** Ev içi cihazlar yerel ağda, şifreli.

## 2. Senaryolar
| An | Ne olur | Cihaz |
|---|---|---|
| İmsak, eşi uyuyor | Bilek sessiz titrer; bilekte Kıldım → telefon yedeği iptal, TV bandı/tablet ✓ | Saat → telefon → TV/tablet |
| Kahvaltı, mutfak | Tablet ev ekranı: bugünün vakitleri, sıradaki, kalan süre | Tablet/iPad/Fold masaüstü |
| İş | Takvim çakışması uyarısı, saat bilekte | Telefon + saat |
| Yol | Sıradaki vakit + yakın cami + rota; Siri "Kıldım" | Android Auto / iOS widget+Siri |
| İkindi daralıyor, telefon şarjda | TV köşesinde sessiz bant "Vakit daralıyor · 20 dk" — yalnız kendi durumunu TV'ye açan üyeler için; o üyeler kılınca/ertelediğinde kalkar | Telefon → TV |
| Ramazan | TV'de büyük iftar ve sahur geri sayımı | TV |
| Cuma | TV'de "Cumaya 45 dk — çıkış 12:40" (yürüme süresi telefondan) | TV |
| Özel gün (seri dondurulmuş) | TV bandı da susar | TV |
| Telefon değişti | Bulut eşitlemesi geri getirir; TV yeniden eşleşir (anahtar yedeklenmez — "yeniden eşleştirin" yönlendirmesi) | Telefon |

Çıkarılanlar (Fable): kumandadan "Kıldım" (başkası adına ibadet beyanı + TV→telefon kanalı yok), "herkes kılınca kalkar" (kimin kılmadığını açık eder), TV'de yatış ekran koruyucusu (tvOS'ta yol yok, Google TV doğrulanmadı).

## 3. Cihaz rolleri
- **Telefon:** beyin + **Cihazlarım** (yeni): bağlı saatler, TV'ler, tabletler; durum (son eşitleme), "TV'de durumum sayılsın" anahtarı, eşleşmeyi kaldır.
- **Saatler:** bilek (uyandırma, telefon uzaktayken hatırlatma, Kıldım, kıble, tesbihat).
- **Tablet/iPad:** ikinci cihaz (yalnız gösterir + Kıldım) ya da ev ekranı (tam ekran + şarj + yatay; Split View/Stage Manager'da kapalı).
- **Fold:** masaüstü postürü = küçük ev ekranı.
- **TV:** evin ortak ekranı — pano, iftar/sahur, cuma kartı, sessiz görsel bant. Kıldım ALMAZ.
- **Araç:** Android Auto POI, iOS widget/canlı etkinlik + Siri.

## 4. TV eşitlemesi
### 4.1 Eşleştirme
- QR yalnız **geçici eşleştirme sırrı** taşır (`namazakisi://tv?v=2&a&p&i=<tvKimlik>&s=<geçici sır>`); her başarılı eşleşmede QR yenilenir.
- Telefon önce kendi ekranında onay: "Şu TV'ye bağlanıyorsunuz: <TV adı>". TV'de kumandayla "Bu telefonu ekleyelim mi?" onayı.
- Onaydan sonra TV **üyeye özel 32 bayt anahtar** üretir ve eşleşme yanıtında döner (kanal geçici sırla şifreli). Her üye ayrı anahtar → taklit ve nonce paylaşımı yok.
- 7 haneli kod: YALNIZ konum; ekranda söylenir.
- Kaldırma iki uçtan; anahtar iki uçta silinir.

### 4.2 Bulma ve tetik
- TV pano açılışında/panoya dönüşte (ve Apple TV ön plandayken) mDNS `_namazakisi._tcp` yayınlar (TXT `i=<tvKimlik>`).
- Telefon (Android) "TV göründü" keşfinde son yükü yeniden yollar → TV başka uygulamadan dönünce güncellenir. Keşif yalnız adres başarısızlığında ve süre sınırlı (multicast kilidi → `CHANGE_WIFI_MULTICAST_STATE` yeni izin: sahip onayı).
- mDNS yanıtı anahtarlı el sıkışmayla doğrulanmadan adres güncellenmez.
- iOS: olay anında (ör. Apple Watch'tan Kıldım uyandırması) önbellekteki adrese TEK deneme, keşif yok; başarısızsa sonraki ön plana gelişte.

### 4.3 Kanal
- POST `/esitle`, gövde `{v,u,n,iv,ct}`; **AES-256-GCM**, üye anahtarı; **iv = rastgele 12 bayt** (expo-crypto `getRandomBytes`); `n` üye başına kesin artan, yalnız tekrar koruması; AAD = `v|tvKimlik|u|n`.
- Kütüphaneler: Kotlin `javax.crypto` (API 26 ✓), Apple TV CryptoKit, telefon `@noble/ciphers` **1.x sabit** (MIT; 2.x ESM-only — jest kırılır). tweetnacl seçeneği yok (CryptoKit'te XSalsa yok).
- Yerel ağ kapısı iki uçta; gövde ≤ 8 KB; eşzamanlı bağlantı tavanı 2–3; IP başına hız sınırı; yanlış anahtarda sessiz 403 + artan bekleme. Eşleşik üye yoksa port kapalı.
- Kalan risk (belgeye): sahte afiş QR'ı + aynı ağdaki saldırgan cihaz → telefon onay ekranı TV adını gösterir; kullanıcı yanlış TV'yi onaylarsa kılınmışlık o cihaza gider.

### 4.4 Yük
`{ad?, konum?(değiştiyse), kilinan: {<gün>: [vakit]}(dün+bugün), ertele: {<vakit>: hedefMs}, ozelGun: bool, tvHatirlat: bool, durumumSayilsin: bool, cuma: {aktif, cikisDk}, ramazan: bool}` ≈ 300–700 bayt; zaman damgası YOK (aynı içerik "yeni" sayılmasın — Wear dersi). Vakitleri TV kendisi hesaplar (parite fikstürü).

### 4.5 Ne zaman gönderilir
- Olayla: `kayitDegistiBildir` (yuva `tv`, 1–2 sn debounce, `sonGonderilen` tekilleştirme + sıralı zincir — `WearSenkronServisi` deseni), konum/ayar/erteleme değişimi, "TV göründü".
- Android: 15 dk görevi, muhafız erken dönüşlerinden ÖNCE, yalnız özet değiştiyse. iOS: olay anında tek deneme + ön plana geliş.
- Tüketici listeleri: `konumDegistiUygula` VE `App.tsx` açılışı (+ nöbetçi test). Ağ yoksa (NetInfo) denenmez; üstel geri çekilme, tavanlı.

### 4.6 Bayatlık
Bant yalnız: TV hatırlatması açık + vaktin son 30 dk'sı + durumunu açan üyelerden biri kılmamış/ertelememiş + o üyeden son 12 saatte haber + özel gün değil. Haber yoksa bant yok. Metin kişi/sayı ima etmez. SES yok (ezan sesi ayrı, isteğe bağlı, varsayılan kapalı, lisanslı kayıt şartı).

## 5. Geniş ekran
- **Android tablet:** Material 3 navigation rail (600–839 dp), kalıcı çekmece/kenar (≥840 dp).
- **iPad:** size class dili (regular genişlik) — kenar çubuğu gezinmesi (özel bileşen; react-navigation bottom-tabs vermez), yatay + Split View/Stage Manager açılır (`requireFullScreen` kaldırılır; iOS 26 durumu doğrulanacak). Klavye kısayolları native `UIKeyCommand` modülü ister → ayrı iş.
- **Bugün (yatay):** sol vakit kartı (büyük sayaç + Kıldım), orta günlük akış, sağ "bu hafta" (seri mini, kılma oranı, kaza özeti, yarın). Dikeyde iki sütun. Kıble gülü gibi dolgu yok.
- **Ayarlar/hatırlatmalar:** ana-ayrıntı.
- Performans: yeni kartlar dakika anahtarlı memo; saniyelik render'a girmez.

## 6. Apple Watch
- `TabView(.verticalPage)`: Şimdi (geri sayım halkası + Kıldım) · Bugün (beş vakit; taçla vakte odaklanma) · Kıble · Tesbihat.
- Sistem tint + SF Symbols hiyerarşik renk (Wear paletini kopyalama), `isLuminanceReduced` ile sönük her zaman açık varyant, Smart Stack (mevcut widget'a `accessoryRectangular` + relevance), komplikasyonlar.
- Kıldım `SiriDeposu.kildimEkle` kuyruğundan; halka kapanış + tik + tek haptik.
- applicationContext 64 KB sınırı: yük boyutu testi (beklenen ≈ 6–10 KB).

## 7. Kalite eksenleri (her PR)
Performans (memo, değişen alanı çizme; TV Compose `derivedStateOf`) · Pil (yoklama yok, olay tetikli, dinleyici yalnız pano görünürken) · Veri (yük boyutu testleri) · Güvenlik (§4.3). Paralel denetim raporu: `docs/ajan/denetim-2026-10-21.md`.

## 8. Sahip kararları
1. TV'de "durumum sayılsın" kişi başına, varsayılan KAPALI (önerim).
2. TV ezan sesi: isteğe bağlı, varsayılan kapalı (önerim).
3. Tablet ev ekranı: ayardan açılır (önerim).
4. Yeni izin `CHANGE_WIFI_MULTICAST_STATE` (TV'yi IP değişince bulmak için) — onay.

## 9. Sıra
Onay → paralel: (a) TV eşitlemesi + Cihazlarım (telefon + Android TV → Apple TV), (b) geniş ekran, (c) Apple Watch, (d) denetim düzeltmeleri. Her PR: önce/sonra kontak sayfası + video + kendi incelemem.
