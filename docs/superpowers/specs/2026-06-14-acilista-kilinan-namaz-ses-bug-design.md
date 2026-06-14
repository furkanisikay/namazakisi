# Açılışta kılınmış namaza ses çalma bug'ı — Tasarım (#92)

## Sorun
Uygulama açılışında, içinde bulunulan namaz vaktinin çıkmasına kısa süre kala
(muhafız seviye ≥ 3) çan sesi (`SesServisi.bildirimSesiCal()`) çalıyor — kullanıcı
o namazı zaten **kıldığını işaretlemiş** olsa bile.

## Kök neden
Foreground `NamazMuhafiziServisi` (uygulama açıkken `AnaSayfa`'da `baslat()` ile
başlatılır, `seviye >= 3` olunca ses çalar) kılınmışlık durumunu **yalnızca
bellek-içi** `kilinanVakitler` map'inden okur. Bu map:

1. **Açılışta boştur** — diskteki kalıcı kılınmışlık kaydından beslenmez.
2. Yalnızca aynı oturumda `namazKilindiIsaretle(...)` çağrılınca dolar.

Buna karşılık `ArkaplanMuhafizServisi` ve `VakitSayacBildirimServisi` doğru deseni
kullanır: `kilinanVakitleriAl(tarih)` (LocalNamazServisi) ile **diskten**
(`MUHAFIZ_AYARLARI_kilinan_<tarih>` → `VakitAdi[]`) okuyup kılınmış vakitleri atlar.
Bu disk kaydı, kullanıcı toggle ettiğinde `vakitKilindiTemizle` →
`ArkaplanMuhafizServisi.vakitBildirimleriniIptalEt` → `kilinanVaktiKaydetTarihli`
zinciriyle güncellenir.

Sonuç: namaz kılınmış olsa bile foreground muhafız açılışta "kılınmadı" varsayar ve
ses çalar.

## Çözüm (Seçilen yaklaşım)
Foreground muhafıza, **açılışta diskteki kılınmışlık kaydını bellek-içi
`kilinanVakitler` map'ine yükleyen** (hydrate) bir adım eklenir. `kontrolEt()`'in
mevcut senkron mantığı değişmez; yalnızca map artık açılışta diskten beslenir.

- Yeni public metot: `acilistaKilinanlariYukle(): Promise<void>` — bugün **ve dün**
  (gece yarısı geçişi) için `kilinanVakitleriAl` ile diskten okur, her vakiti
  `kilinanVakitler[`${tarih.toDateString()}_${vakit}`] = true` olarak işaretler.
  Map anahtarı `kontrolEt()`'in kullandığı `new Date().toDateString()` formatıyla
  birebir aynı olmalı (yoksa eşleşmez).
- `AnaSayfa`, `muhafiz.baslat(...)`'tan **önce** `await
  muhafiz.acilistaKilinanlariYukle()` çağırır. Böylece `baslat()` içindeki ilk
  senkron `kontrolEt()` map dolu çalışır → kılınmış vakit için susar (race yok).

### Neden bu yaklaşım
- Kök nedeni (açılışta boş map) doğrudan çözer.
- Mevcut deseni yeniden kullanır (`kilinanVakitleriAl` zaten iki servis tarafından
  kullanılıyor); domain servisi store'a değil yalnız veri katmanına bağımlı kalır.
- `baslat()` / `kontrolEt()` senkron sözleşmesini bozmaz → mevcut testler aynen geçer.

### Reddedilen alternatifler
- **`kontrolEt`'i async + her tick disk okuması:** senkron testleri ve `baslat`
  sözleşmesini kırar, gereksiz dakikalık disk I/O.
- **AnaSayfa'da ses öncesi Redux `gunlukNamazlar` kontrolü:** domain mantığını
  presentation'a sızdırır; gösterilen tarih farklı olabilir; mantık tek yerde toplanmaz.

## Test
TDD: önce bug'ı yakalayan başarısız test.
- `NamazMuhafiziServisi.test.ts`: `kilinanVakitleriAl` mock'lanır; disk "öğle kılınmış"
  döndürür; `acilistaKilinanlariYukle()` await edilip `baslat()` çağrılınca, öğle
  vaktine kısa süre kala (seviye ≥ 3) ses tetiklemeye karşılık gelen bildirim
  GELMEMELİ — yalnız banner temizleme (seviye 0). Tarihler `bugunuAl()`/`dunuAl()`
  ile (sabit tarih yazılmaz).
- Mevcut tüm testler (hydrate çağrılmadan) korunur.

## Sınırlar / etkilenmeyenler
- Disk kayıt şeması değişmez (`MUHAFIZ_AYARLARI_kilinan_<tarih>`).
- `ArkaplanMuhafizServisi` / `VakitSayacBildirimServisi` değişmez.
