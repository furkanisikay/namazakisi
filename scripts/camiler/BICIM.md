# Cami verisi ikili biçimi (`NACM` sürüm 1)

Camideyim (issue #297) için cihazda taşınan cami listesi. Üretici:
`scripts/camiler/cami_verisi_uret.py`. Okuyucular **iki tanedir ve aynı fikstürle
test edilir**:

- JS: `src/core/cami/camiVerisi.ts` (önizleme, ayar ekranı, test)
- Kotlin: `modules/expo-cami-geofence/android/.../cekirdek/CamiVerisi.kt` (karar)

Ortak fikstür: `modules/expo-cami-geofence/android/src/test/resources/ornek-camiler.bin`
+ `ornek-camiler-beklenen.json` (SENTETİK veri; kaynağı `scripts/camiler/ornek/ornek-camiler.osm`).
Biçim değişirse sürümü artırın, iki okuyucuyu ve fikstürü birlikte güncelleyin.

Tüm sayılar **little-endian**. Koordinatlar mikro-derece (`değer × 1e6`, `int32`).

## Başlık (64 bayt)

| Ofset | Tür | Alan |
|---|---|---|
| 0 | 4 bayt | sihir `NACM` |
| 4 | u16 | sürüm (= 1) |
| 6 | u16 | kayıt boyutu (= 24) |
| 8 | u32 | kayıt sayısı `N` |
| 12 | u32 | ızgara hücresi `H` (µ°, = 100 000 → 0,1°) |
| 16 | i32 | ızgara en küçük enlem (µ°, `H` katı) |
| 20 | i32 | ızgara en küçük boylam (µ°, `H` katı) |
| 24 | u16 | satır sayısı `S` |
| 26 | u16 | sütun sayısı `C` |
| 28 | u32 | veri zamanı (Unix saniye) |
| 32 | u32 | kayıt tablosu ofseti |
| 36 | u32 | poligon tablosu ofseti |
| 40 | u32 | ad tablosu ofseti |
| 44 | u32 | ızgara tablosu ofseti (= 64) |
| 48 | u32 | dosya uzunluğu (kesik dosya denetimi) |
| 52 | u32 | CRC-32 (bayt 64 → son) |
| 56 | 8 bayt | ayrılmış (0) |

Okuyucu sihir, sürüm, kayıt boyutu, uzunluk, CRC ve tablo sınırlarını denetler;
**herhangi biri tutmazsa veri yok sayılır** (çökme yok, "cami verisi yok" durumu).

## Izgara tablosu

`(S × C + 1)` adet `u32`. Hücre `i = satır × C + sütun`; o hücrenin kayıtları
kayıt tablosunda `[g[i], g[i+1])` aralığındadır. Kayıtlar hücreye göre
**satır öncelikli** sıralıdır (hücre içinde enlem, boylam, tür, kimlik).

> Not: Fable kararı "geohash sıralı ızgara" diyordu. Sabit boyutlu enlem/boylam
> ızgarası seçildi: hücre bulma O(1), komşu halka taraması geohash komşu hesabı
> gerektirmez; yerellik aynıdır. 0,1° hücre Türkiye'de ~12 bin hücre = ~48 KB.

## Kayıt (24 bayt)

| Ofset | Tür | Alan |
|---|---|---|
| 0 | i32 | merkez enlem (µ°) |
| 4 | i32 | merkez boylam (µ°) |
| 8 | u32 | OSM kimliğinin alt 32 biti |
| 12 | u8 | OSM kimliğinin üst 8 biti (node kimlikleri 2³²'yi aştı) |
| 13 | u8 | tür: 0 node · 1 way · 2 relation |
| 14 | u8 | poligon köşe sayısı (0 ya da 3–12) |
| 15 | u8 | yarıçap (m; 0 = varsayılan 25 m) |
| 16 | u32 | poligon tablosu içi bayt ofseti (`0xFFFFFFFF` = yok) |
| 20 | u32 | ad tablosu içi bayt ofseti (`0xFFFFFFFF` = adsız) |

Kalıcı kimlik `osm:<n|w|r><id>` biçimindedir (ör. `osm:w9100000001`); favori /
hariç / özel alan ayarları bu kimliğe bağlanır, kayıt sırasına DEĞİL — veri her
ay yenilenip sıra değişse de ayarlar korunur.

Way/relation merkezi dış halkanın alan ağırlık merkezidir; yarıçap merkezden en
uzak köşeye uzaklıktır (yukarı yuvarlanır, 1–255). Relation için en büyük dış
halka alınır (avlu gibi iç halkalar atılır).

## Poligon tablosu

Köşe başına `i16 dEnlem, i16 dBoylam` (µ°, kaydın merkezine göre). En fazla 12
köşe (Douglas-Peucker, gerekirse konveks zarf). ±32 767 µ°'yi (~3,6 km) aşan alan
poligonsuz yazılır.

## Ad tablosu

`u8 uzunluk` + UTF-8 bayt (en fazla 255). Aynı ad bir kez yazılır. Kaynak
`name:tr`, yoksa `name`.

## Lisans

Çıktı OpenStreetMap türevidir: **ODbL 1.0** (`assets/camiler/LICENSE.ODbL`),
atıf "© OpenStreetMap katkıcıları". Betik GPL-3.0'dır.
