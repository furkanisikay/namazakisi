# Tasarım: Puan Bütünlüğü — Karma Türev/Defter Modeli

> Tarih: 2026-06-14 · Dal: `feat/puan-defteri-veri-butunlugu` · Durum: onaylandı (10. adam gözden geçirmesi sonrası düzeltildi)

## 1. Problem

Puan/sayaç muhasebesi "tek doğru kaynak"tan (namaz kayıtları) **türetilmiyor**; olay-tetiklemeli artırımlarla tutuluyor ve gerçeklikten kayıyor. Kapatılacak **4 gerçek bug**:

1. **Toggle şişmesi:** `namazKilindiPuanla` ([seriSlice.ts:253](../../../src/presentation/store/seriSlice.ts)) "kıldım"da koşulsuz `+5`/`+1` ekler ([AnaSayfa.tsx:362](../../../src/presentation/screens/AnaSayfa.tsx)); "kılmadım" dalı geri almaz → `kıldım→kılmadım→kıldım` ile sınırsız puan.
2. **Arka plan "Kıldım" puanlanmıyor:** Bildirimden işaretleme ([BildirimServisi.ts:278](../../../src/domain/services/BildirimServisi.ts)) namaz kaydını yazar ama `namazKilindiPuanla` yalnız AnaSayfa'dan çağrıldığı için puan/seviye/toplam **hiç işlenmez** → kalıcı sapma.
3. **`mukemmelGun` sabit `=== 5`:** ([seriSlice.ts:203](../../../src/presentation/store/seriSlice.ts)) `tamGunEsigi` 3/4 seçen kullanıcı "mükemmeliyetçi" rozetine asla ulaşamaz.
4. **Aynı gün 5/5 → 4/5'e düşünce "tam gün" geri alınmıyor:** `sonTamGun===bugun` erken dönüşü ([SeriHesaplayiciServisi.ts:287](../../../src/domain/services/SeriHesaplayiciServisi.ts)) yeniden değerlendirmeyi engeller → seri durumu gerçekle ayrışır.

## 2. Kararlar (kullanıcı onaylı)

- Bonus ekonomisi **korunur** (tam gün, seri, toparlanma, rozet puanları yaşar).
- Mevcut şişme **gerçeğe göre düzeltilir** (taban puan/sayaç yeniden hesaplanır; düşebilir).
- "Mükemmel gün" = günlük `tamGunEsigi` (3/4/5), güncel eşiğe göre türev.
- Sıra: puan bütünlüğü **önce**, sonra depolama refaktörü (Faz 0→1→2). Tek dal, sıralı. Paralel değil (paylaşılan dosyalar).

## 3. Mimari — KARMA model

Tek `toplamPuan` sayısı yerine iki ayrı kovaya bölünür:

| Kova | Kalemler | Yaklaşım | Kalıcılık |
|---|---|---|---|
| **Türev** | `toplamKilinanNamaz`, `mukemmelGunSayisi`, `tabanPuan` (= kılınan × 5) | Namaz kayıtlarından **saf fonksiyon** olarak hesaplanır | Diske **yazılmaz**, okuma anında türetilir |
| **Kalıcı** | tam gün bonusu (10/gün), seri bonusu, toparlanma (25), rozet puanı, `enUzunSeri`, `toparlanmaSayisi`, `kullaniciRozetleri` | Yol-bağımlı; kazanıldığında **append-only** eklenir | Diske yazılır; reconcile **asla düşürmez** (monotonic-floor) |

**`toplamPuan = tabanPuan(türev) + bonusPuan(kalıcı)`.** İstenirse tek-int checkpoint olarak cache'lenir (büyümez); kalem-bazlı defter haritası diske **materyalize edilmez**.

### Neden saf ledger değil (10. adam bulgusu)
- `toparlanma`/`rozet`/`enUzunSeri` namaz blob'undan **türetilemez** (yol-bağımlı, duvar saatine ve birikmiş değerlere bağlı — [SeriHesaplayiciServisi.ts:181-184,304,384](../../../src/domain/services/SeriHesaplayiciServisi.ts)). Reconcile bunları "kayıttan yeniden kur" derse meşru kazanımları **siler** (veri kaybı).
- Türetilebilen kalemleri (namaz/tamgun) diske defter olarak yazmak gerçeği iki yerde tutar + depolama fazının çözdüğü büyüme sorununu geri getirir.

### Çekirdek türetme fonksiyonu
`puanlamayiYenidenDegerlendir(tumKayitlar, tamGunEsigi)` — saf, domain katmanında, native bağımsız:
- `toplamKilinanNamaz` = `tamamlandi===true` sayısı.
- `mukemmelGunSayisi` = günlük (kılınan ≥ `tamGunEsigi`) olan gün sayısı.
- `tabanPuan` = `toplamKilinanNamaz × PUAN_DEGERLERI.namaz_kilindi (5)`.

Kaynak: mevcut [`localVerileriSenkronizasyonIcinAl`](../../../src/data/local/LocalNamazServisi.ts) `{tarih,namazAdi,tamamlandi}[]` zaten düzleştiriyor.

**Tek fonksiyon, tüm yazım yollarından çağrılır** (toggle, arka plan `onKildimCallback`, `tumNamazlariTamamla/Sifirla`) ve açılış reconcile aynı kodu kullanır → incremental ile reconcile sapması matematiksel olarak imkânsız (bug #1 ve #2 birlikte kapanır).

## 4. Migrasyon — şişmeyi düşür, bonusu kaybetme (kritik)

Eski `toplamPuan` commingled: `eskiToplamPuan = eskiToplamKilinanNamaz × 5 + B` (B = tüm bonuslar). Şişme yalnız tabanı etkiler (her sahte toggle hem `+1` sayım hem `+5` taban ekler) ve **çıkarımda sadeleşir**:

```
bonusPuan_baslangic = max(0, eskiToplamPuan − eskiToplamKilinanNamaz × 5)   // = B, şişmeden arınmış
toplamKilinanNamaz  ← kayıtlardan yeniden hesapla   // şişme düşer (Q2: düzelt)
mukemmelGunSayisi   ← kayıtlardan, güncel tamGunEsigi ile
kullaniciRozetleri, enUzunSeri, mevcutSeri, toparlanmaSayisi, toparlanmaDurumu  ← KORUNUR (monotonic-floor)
```

Sonuç: `yeniToplamPuan = tabanPuan(gerçek) + B = eskiToplamPuan − (şişme × 5)` → **yalnızca toggle şişmesi düşer, tüm meşru bonuslar (tam gün/seri/toparlanma/rozet) aynen korunur.** Seri bonusu geçmişi kaybolmaz (B içinde).

İleriye dönük (1b): kalıcı bonus kayıtları yalnız **migrasyon tarihinden sonraki** günler için eklenir (tarih-anahtarlı, idempotent); migrasyon öncesi bonuslar donmuş `bonusPuan_baslangic` içinde kalır → çift sayım olmaz.

## 5. Değişmez kurallar (invaryant)

1. **Reconcile SESSİZ:** hiçbir kutlama/seviye-atlama/bildirim üretmez.
2. **Kutlama yalnız gerçek kullanıcı eylemi** yeni kutlanabilir *kalıcı* kayıt eklediğinde; reconcile/silme/un-toggle'da asla.
3. **Monotonic-floor:** reconcile kalıcı kalemleri (rozet/`enUzunSeri`/`toparlanmaSayisi`) asla düşürmez.
4. **Sparse = kılınmadı:** "kayıt yok" ≠ "0/5"; uygulamadan önceki günler not-prayed sayılır.
5. **Tek kaynak = `NAMAZ_VERILERI`:** türetme bunu okur; muhafız `kilinan_<tarih>` anahtarı ikincil (türetmeye dahil değil).
6. **Türev ve kalıcı kovalar ayrı namespace;** reconkile türev hesabı kalıcı kalemi ezmez.

## 6. Fazlama

- **Faz 1a — namaz/tamgün türev (bug #1, #2, #3 + #4 kapanır):**
  - `puanlamayiYenidenDegerlendir` saf fonksiyonu + birim testleri.
  - Tüm yazım yollarını (toggle/arka plan/toplu) ve açılış reconcile'ı bu fonksiyona bağla; `namazKilindiPuanla` koşulsuz artışını kaldır.
  - `mukemmelGun` `=== 5` → `>= tamGunEsigi`; rozet kopyasını eşikten bağımsız ifadeyle güncelle.
  - Bug #4: `sonTamGun===bugun` erken dönüşünü aynı-gün yeniden değerlendirmeye izin verecek şekilde düzelt (true→false'ta `tamamlananGun`/`sonTamGun` geri sar).
  - **`bonusPuan` kovasını ayır:** `seriKontrolet`'in bonus eklemeleri (`kazanilanPuan` + rozet puanı) artık commingled `toplamPuan` yerine ayrı `bonusPuan` kovasına yazılır (1a'da henüz tam idempotent-anahtarlı değil — mevcut gün-idempotent davranışını korur; tam anahtarlama 1b). `toplamPuan = tabanPuan(türev) + bonusPuan` → tek sayıya çift yazıcı olmaz.
  - Migrasyon (Bölüm 4): `bonusPuan_baslangic` checkpoint + sayaç yeniden hesabı + kalıcı kalemlerin korunması.
- **Faz 1b — bonusları kalıcı append-only kaleme taşı:** tam gün/seri/toparlanma/rozet puanları monoton `puanEkle` yerine tarih/olay-anahtarlı idempotent kayıt; reconcile koru/birleştir (rebuild değil). Seri bonusu yazımını `seriHesapla` gün-idempotency'sine sıkıca bağla.
- **Sonra — Depolama:** Faz 0 (merkezî `Depolama` katmanı) → Faz 1 (gün-bazlı kayıt + migration) → Faz 2 (güvenlik/`allowBackup`). Faz 3 (motor değişimi) tetikleyici-bağımlı, ertelenir.

## 7. Test matrisi

- Saf türetme: 0/5, kısmi, 5/5; çoklu gün; eşik 3/4/5; sparse (eksik gün) = kılınmadı.
- Toggle-off geri-al simetrisi (taban alt sınır 0).
- Arka plan "Kıldım" + sonraki açılış → puan/seviye doğru.
- `tumNamazlariTamamla` / `tumNamazlariSifirla`.
- Aynı gün 5/5 → 4/5 → `tamamlananGun`/`sonTamGun` geri alınır (bug #4).
- Re-toggle idempotency (sınırsız aç/kapa sabit puan).
- Reconcile sessizliği (kutlama üretmez).
- Migrasyon: şişmiş taban düşer, bonus (B) korunur, rozet/rekor/toparlanma korunur.
- Mevcut ~9 seri/puan + `SeriSistemiSimulasyonu` testinin yeni desene migrasyonu; `npm run verify` geçer.

## 8. Riskler / kabuller

- Migrasyonda taban puan görünür düşebilir → kalıcı kalemler (rozet/seviye) korunarak "seviye düştü" algısı minimize; gerekirse tek seferlik bilgilendirme.
- Çok-yıllık kullanıcıda açılış reconcile O(N) → blob zaten okunuyor, türetme memoize edilir; profil ile doğrula (Depolama Faz 1 sonrası ucuzlar).
- Özel gün (mazeret) dondurma: türev `tamgun` geçmiş dondurma pencerelerini bilmezse dondurulmuş günleri yanlış sayabilir → özel gün geçmişini türetmeye dahil et veya bu günleri kalıcı kaleme yaz (1b detayı).
- İki paralel "kılındı" deposu (muhafız `kilinan` vs `NAMAZ_VERILERI`) senkron değil → tek kaynak `NAMAZ_VERILERI` (invaryant #5).

## 9. Kapsam dışı

- Depolama motor değişimi (MMKV/SQLite — tetikleyici-bağımlı).
- Yeni rozet/seviye tasarımı, yeni puan kaynakları.
- Bulut/hesap/senkronizasyon.
