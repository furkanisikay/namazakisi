# Yerel Yedekleme & Aktarım Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kullanıcı verilerini şifreli bir dosyaya dışa aktarabilen ve belge seçiciyle, akıllı çakışma çözümlü bir sihirbazla geri içe aktarabilen yerel yedekleme/aktarma özelliği.

**Architecture:** Domain katmanında saf servisler (topla → şifreli zarf; çöz → doğrula → fark → stratejiyle birleştirme PLANI üret), `Depolama` atomik kuyruğuyla yazım, Redux orkestratör thunk ile içe-aktarma sonrası store tazeleme + reconcile. UI takvim/kurulum sihirbazı desenlerini izler.

**Tech Stack:** React Native 0.81 / Expo SDK 54, TypeScript strict, Redux Toolkit, tweetnacl (şifreleme), expo-file-system + expo-sharing (dışa), expo-document-picker (içe), expo-crypto (sha256), Jest.

> **Spec:** `docs/superpowers/specs/2026-06-14-yerel-yedekleme-aktarim-design.md` — her görevden önce ilgili bölümü oku.
> **Ortam notu:** Worktree taze ise `npm install` yerine ana repo node_modules'a junction kullanılabilir; ama bu görevde yeni bağımlılık ekleneceği için `npm install` zaten gerekli.
> **Doğrulama kapısı:** Her görevin sonunda `npm run verify` (typecheck+lint+test) GEÇMELİ.

---

## Reconnaissance (kod yazmadan önce — her implementer okusun)

Tam imzaları doğrulamak için şu dosyaları OKU (plan bunlara referans veriyor; isimler değişmişse koda uy):
- `src/data/local/Depolama.ts` — `oku/yaz/guncelle/cogunuOku/onEkiOlanAnahtarlar/hamYaz` imzaları.
- `src/core/constants/UygulamaSabitleri.ts` — `DEPOLAMA_ANAHTARLARI` (tüm anahtar adları/önekleri).
- `src/data/local/LocalNamazServisi.ts` — `hamGunVerisiniCoz`, gün anahtarı üretimi, migrasyon bayrağı.
- `src/presentation/store/index.ts` (veya store kurulumu) — `configureStore`, reducer kaydı, `RootState`/`AppDispatch` tipleri.
- Loader thunk'lar: `namazSlice`, `seriSlice` (`seriVerileriniYukle/seriKontrolet/puanlamayiYenidenHesapla`), `kazaSlice`, `muhafizSlice`, `konumSlice`, `vakitSayacSlice`, `iftarSayacSlice`, `sahurSayacSlice`, `vakitBildirimSlice`, `takvimSlice`, `ozelliklerSlice`.
- UI desenleri: `src/presentation/screens/TakvimAyarlariSayfasi.tsx` (bottom-sheet), `src/presentation/screens/KurulumSihirbaziSayfasi.tsx` + `KurulumSihirbazi/adimlar.tsx` (çok-adımlı sihirbaz, geçiş animasyonu, ilerleme noktaları, InfoKutu), `src/core/theme` (`useRenkler`), `src/core/feedback` (`useFeedback`), `src/presentation/hooks/useDonanimGeriTusu.ts`.
- `src/core/constants/YeniOzellikler.ts` + `src/presentation/screens/AyarlarSayfasi.tsx` + `src/navigation/AppNavigator.tsx` (entegrasyon).
- `src/core/utils/TarihYardimcisi` — `bugunuAl()`.

---

## File Structure

**Yeni:**
- `src/core/utils/yedekSifreleme.ts` — tweetnacl sarmalayıcı (şifrele/çöz/checksum).
- `src/domain/services/YedeklemeServisi.ts` — topla → zarf; çöz → doğrula.
- `src/domain/services/YedekBirlestirmeServisi.ts` — fark + birleştirme planı (saf).
- `src/domain/services/__tests__/YedeklemeServisi.test.ts`
- `src/domain/services/__tests__/YedekBirlestirmeServisi.test.ts`
- `src/core/utils/__tests__/yedekSifreleme.test.ts`
- `src/presentation/store/yedeklemeSlice.ts` — UI durumu + orkestratör thunk.
- `src/presentation/store/__tests__/yedeklemeSlice.test.ts`
- `src/presentation/screens/Yedekleme/YedeklemeSayfasi.tsx` — giriş.
- `src/presentation/screens/Yedekleme/IceAktarmaSihirbazi/IceAktarmaSihirbaziSayfasi.tsx`
- `src/presentation/screens/Yedekleme/IceAktarmaSihirbazi/adimlar.tsx`
- `src/presentation/screens/Yedekleme/IceAktarmaSihirbazi/stiller.ts`
- `src/presentation/screens/Yedekleme/IceAktarmaSihirbazi/tipler.ts`

**Değişecek:**
- `package.json` — yeni bağımlılıklar.
- `src/presentation/store/index.ts` — `yedekleme` reducer kaydı.
- `src/navigation/AppNavigator.tsx` — `YedeklemeAktarim` ekranı.
- `src/presentation/screens/index.ts` — export.
- `src/presentation/screens/AyarlarSayfasi.tsx` — menü + ikon.
- `src/core/constants/YeniOzellikler.ts` — duyuru.

---

## Task 1: Bağımlılıkları ekle

**Files:** Modify `package.json` (+ lockfile).

- [ ] **Step 1: Kur**

Run:
```bash
npx expo install expo-document-picker
npm install tweetnacl tweetnacl-util
```
(expo-sharing/expo-file-system/expo-crypto zaten kurulu mu kontrol et; değilse `npx expo install expo-crypto`.)

- [ ] **Step 2: İzin sızıntısı kontrolü**

`android/app/src/main/AndroidManifest.xml` merge'ini gözden geçir — yeni native izin eklenmemeli. tweetnacl saf-JS; expo-document-picker yeni tehlikeli izin gerektirmemeli.

- [ ] **Step 3: Doğrula + commit**

Run: `npm run typecheck`
```bash
git add package.json package-lock.json
git commit -m "build(yedekleme): expo-document-picker + tweetnacl bagimliliklari"
```

---

## Task 2: Şifreleme util (`yedekSifreleme.ts`)

**Files:**
- Create: `src/core/utils/yedekSifreleme.ts`
- Test: `src/core/utils/__tests__/yedekSifreleme.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { sifrele, coz, kontrolHesapla } from '../yedekSifreleme';

describe('yedekSifreleme', () => {
  it('sifrele -> coz tur-turu ozgun metni geri verir', async () => {
    const metin = JSON.stringify({ a: 1, b: 'merhaba', c: [true, false] });
    const { nonce, veri } = await sifrele(metin);
    expect(typeof nonce).toBe('string');
    expect(veri).not.toContain('merhaba'); // ham metin gorunmemeli
    const cozulen = coz(nonce, veri);
    expect(cozulen).toBe(metin);
  });

  it('bozuk veri cozulemez (null doner)', () => {
    expect(coz('AAAA', 'Qm9ydW0=')).toBeNull();
  });

  it('kontrolHesapla ayni girdi icin ayni sha256 verir', async () => {
    const a = await kontrolHesapla('x');
    const b = await kontrolHesapla('x');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});
```

- [ ] **Step 2: Test fail (modül yok)** — Run: `npx jest yedekSifreleme -v` → FAIL.

- [ ] **Step 3: Implementasyon**

```ts
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import * as Crypto from 'expo-crypto';

// Uygulama-yonetimli anahtar. NOT: Bu bir sir DEGILDIR; amac duz-metin
// dosyanin ortada durmamasi + butunluk. Gercek gizlilik icin (Faz 2) hesap-
// turevli anahtar gerekir.
const ANAHTAR_BAYTLARI = new Uint8Array([
  0x4e, 0x61, 0x6d, 0x61, 0x7a, 0x41, 0x6b, 0x69, 0x73, 0x69, 0x59, 0x65,
  0x64, 0x65, 0x6b, 0x32, 0x30, 0x32, 0x36, 0x4b, 0x65, 0x79, 0x21, 0x40,
  0x23, 0x24, 0x25, 0x5e, 0x26, 0x2a, 0x28, 0x29,
]); // 32 bayt

export async function sifrele(metin: string): Promise<{ nonce: string; veri: string }> {
  const nonceBaytlari = nacl.randomBytes(nacl.secretbox.nonceLength);
  const mesaj = naclUtil.decodeUTF8(metin);
  const sifreli = nacl.secretbox(mesaj, nonceBaytlari, ANAHTAR_BAYTLARI);
  return {
    nonce: naclUtil.encodeBase64(nonceBaytlari),
    veri: naclUtil.encodeBase64(sifreli),
  };
}

export function coz(nonce: string, veri: string): string | null {
  try {
    const nonceBaytlari = naclUtil.decodeBase64(nonce);
    const sifreli = naclUtil.decodeBase64(veri);
    const cozulen = nacl.secretbox.open(sifreli, nonceBaytlari, ANAHTAR_BAYTLARI);
    if (!cozulen) return null;
    return naclUtil.encodeUTF8(cozulen);
  } catch {
    return null;
  }
}

export async function kontrolHesapla(metin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, metin);
}
```

> Test ortamında `nacl.randomBytes` çalışır (tweetnacl kendi PRNG'sini kurar). Jest'te `expo-crypto` mock'la: `jest.mock('expo-crypto', () => ({ CryptoDigestAlgorithm: { SHA256: 'SHA-256' }, digestStringAsync: jest.fn(async (_a, s) => require('crypto').createHash('sha256').update(s).digest('hex')) }))`.

- [ ] **Step 4: Test pass** — Run: `npx jest yedekSifreleme -v` → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/core/utils/yedekSifreleme.ts src/core/utils/__tests__/yedekSifreleme.test.ts
git commit -m "feat(yedekleme): uygulama-anahtarli sifreleme util (tweetnacl)"
```

---

## Task 3: Tipler ve anahtar envanteri (`tipler.ts` + sabitler)

**Files:**
- Create: `src/presentation/screens/Yedekleme/IceAktarmaSihirbazi/tipler.ts`
- Modify: `src/core/constants/UygulamaSabitleri.ts` (gerekiyorsa yedek dosya biçim sabiti)

- [ ] **Step 1: Tipleri yaz** (domain saf kalsın diye payload/zarf tipleri burada merkezi)

```ts
export const YEDEK_BICIMI = 'namaz-akisi-yedek';
export const YEDEK_SURUMU = 1;

export interface YedekZarfi {
  bicim: string;
  surum: number;
  olusturulma: string;
  uygulamaSurumu: string;
  sifreli: boolean;
  nonce: string;
  veri: string;
  kontrol: string;
}

export interface YedekPayload {
  namazGunleri: Record<string, Record<string, boolean>>;
  kilinanVakitler: Record<string, string[]>;
  seri: unknown;
  rozetler: unknown[];
  seviye: unknown;
  bonusPuan: number;
  istatistik: { toplamKilinan: number; mukemmelGun: number; toparlanma: number };
  kaza: unknown;
  kazaTempo: Record<string, number>;
  ayarlar: Record<string, unknown>;
}

export type BirlestirmeStratejisi = 'akilli' | 'uzerineYaz' | 'eksikleriEkle' | 'gelismis';

export interface KategoriSecimleri {
  namaz: Exclude<BirlestirmeStratejisi, 'gelismis'>;
  puan: Exclude<BirlestirmeStratejisi, 'gelismis'>;
  kaza: Exclude<BirlestirmeStratejisi, 'gelismis'>;
  ayarlar: Exclude<BirlestirmeStratejisi, 'gelismis'>;
}

export interface FarkOzeti {
  gelenGunSayisi: number;
  mevcutGunSayisi: number;
  cakisanGunSayisi: number;
  rozetVar: boolean;
  kazaVar: boolean;
  ayarVar: boolean;
}
```

- [ ] **Step 2: Doğrula + commit**
Run: `npm run typecheck`
```bash
git add src/presentation/screens/Yedekleme/IceAktarmaSihirbazi/tipler.ts src/core/constants/UygulamaSabitleri.ts
git commit -m "feat(yedekleme): yedek zarf/payload/strateji tipleri"
```

---

## Task 4: `YedeklemeServisi` — topla & çöz/doğrula

**Files:**
- Create: `src/domain/services/YedeklemeServisi.ts`
- Test: `src/domain/services/__tests__/YedeklemeServisi.test.ts`

**Sorumluluk:** `yedekZarfiOlustur()` tüm kalıcı anahtarları `Depolama` ile okuyup payload kurar, checksum + şifreler, `YedekZarfi` JSON döner. `zarfiCoz(dosya)` parse → biçim/sürüm doğrula → çöz → checksum doğrula → `YedekPayload` döner (hatada `null` veya tipli hata).

- [ ] **Step 1: Failing test** (Depolama, yedekSifreleme, expo-crypto, TarihYardimcisi mock'lu)

```ts
jest.mock('../../../data/local/Depolama');
jest.mock('../../../core/utils/yedekSifreleme', () => ({
  sifrele: jest.fn(async (m: string) => ({ nonce: 'N', veri: Buffer.from(m).toString('base64') })),
  coz: jest.fn((_n: string, v: string) => Buffer.from(v, 'base64').toString('utf8')),
  kontrolHesapla: jest.fn(async (m: string) => 'sum-' + m.length),
}));

import { yedekZarfiOlustur, zarfiCoz } from '../YedeklemeServisi';
import { YEDEK_BICIMI, YEDEK_SURUMU } from '../../../presentation/screens/Yedekleme/IceAktarmaSihirbazi/tipler';

describe('YedeklemeServisi', () => {
  it('yedekZarfiOlustur tum kategorileri iceren bir zarf uretir', async () => {
    // Depolama mock'larini namaz_gun_* ve sabit anahtarlar donecek sekilde ayarla
    const zarfJson = await yedekZarfiOlustur();
    const zarf = JSON.parse(zarfJson);
    expect(zarf.bicim).toBe(YEDEK_BICIMI);
    expect(zarf.surum).toBe(YEDEK_SURUMU);
    expect(zarf.sifreli).toBe(true);
    expect(zarf.kontrol).toBeDefined();
  });

  it('zarfiCoz dogru zarfi payload olarak coz', async () => {
    const zarfJson = await yedekZarfiOlustur();
    const payload = await zarfiCoz(zarfJson);
    expect(payload).not.toBeNull();
    expect(payload!.namazGunleri).toBeDefined();
  });

  it('zarfiCoz yanlis bicimde null/hata verir', async () => {
    await expect(zarfiCoz('{"bicim":"baska"}')).resolves.toBeNull();
  });

  it('zarfiCoz checksum uyusmazliginda null verir', async () => {
    const zarfJson = await yedekZarfiOlustur();
    const bozuk = JSON.parse(zarfJson); bozuk.kontrol = 'YANLIS';
    await expect(zarfiCoz(JSON.stringify(bozuk))).resolves.toBeNull();
  });
});
```

- [ ] **Step 2: Test fail** — Run: `npx jest YedeklemeServisi -v` → FAIL.

- [ ] **Step 3: Implementasyon** (Depolama API'sini Reconnaissance'ta doğrula; aşağıdaki çatı)

```ts
import * as Depolama from '../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { sifrele, coz, kontrolHesapla } from '../../core/utils/yedekSifreleme';
import {
  YEDEK_BICIMI, YEDEK_SURUMU, YedekZarfi, YedekPayload,
} from '../../presentation/screens/Yedekleme/IceAktarmaSihirbazi/tipler';
// uygulamaSurumu icin UYGULAMA.VERSIYON sabitini kullan.

export async function yedekZarfiOlustur(): Promise<string> {
  const payload = await payloadTopla();
  const duzMetin = JSON.stringify(payload);
  const kontrol = await kontrolHesapla(duzMetin);
  const { nonce, veri } = await sifrele(duzMetin);
  const zarf: YedekZarfi = {
    bicim: YEDEK_BICIMI,
    surum: YEDEK_SURUMU,
    olusturulma: new Date().toISOString(),
    uygulamaSurumu: '0.0.0', // UYGULAMA.VERSIYON ile degistir
    sifreli: true,
    nonce, veri, kontrol,
  };
  return JSON.stringify(zarf);
}

async function payloadTopla(): Promise<YedekPayload> {
  // 1) namaz_gun_* anahtarlarini onEkiOlanAnahtarlar + cogunuOku ile topla,
  //    hamGunVerisiniCoz ile guvenli coz.
  // 2) kilinanVakitler onekini benzer sekilde topla.
  // 3) Sabit anahtarlari (seri/seviye/rozet/bonusPuan/istatistik/kaza/ayarlar)
  //    Depolama.oku ile oku.
  // Tam anahtar listesi Reconnaissance'tan; spec §3 tablosu.
  // ... (implementer kod tabanindaki gercek anahtar adlarini kullanir)
  return {/* doldur */} as YedekPayload;
}

export async function zarfiCoz(dosyaIcerigi: string): Promise<YedekPayload | null> {
  let zarf: YedekZarfi;
  try { zarf = JSON.parse(dosyaIcerigi); } catch { return null; }
  if (!zarf || zarf.bicim !== YEDEK_BICIMI) return null;
  if (typeof zarf.surum !== 'number') return null;
  if (zarf.surum > YEDEK_SURUMU) return null; // uygulamayi guncelle
  const duzMetin = coz(zarf.nonce, zarf.veri);
  if (duzMetin === null) return null;
  const beklenen = await kontrolHesapla(duzMetin);
  if (beklenen !== zarf.kontrol) return null;
  let payload: YedekPayload;
  try { payload = JSON.parse(duzMetin); } catch { return null; }
  return surumGocu(payload, zarf.surum);
}

function surumGocu(payload: YedekPayload, surum: number): YedekPayload {
  // surum < YEDEK_SURUMU ise alan donusumleri. Su an surum 1 -> degisiklik yok.
  return payload;
}
```

- [ ] **Step 4: Test pass** — Run: `npx jest YedeklemeServisi -v` → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/domain/services/YedeklemeServisi.ts src/domain/services/__tests__/YedeklemeServisi.test.ts
git commit -m "feat(yedekleme): topla -> sifreli zarf ve coz/dogrula servisi"
```

---

## Task 5: `YedekBirlestirmeServisi` — fark + birleştirme planı

**Files:**
- Create: `src/domain/services/YedekBirlestirmeServisi.ts`
- Test: `src/domain/services/__tests__/YedekBirlestirmeServisi.test.ts`

**Sorumluluk (saf, AsyncStorage'a dokunmaz):** `farkCikar(mevcutOzet, gelen)` → `FarkOzeti`. `birlestir(strateji|secimler, mevcut, gelen)` → `YazimPlani` (anahtar→değer haritası). Yazımı Task 7 yapar.

- [ ] **Step 1: Failing test** — kritik kurallar:

```ts
import { birlestirNamazGunleri } from '../YedekBirlestirmeServisi';

describe('YedekBirlestirmeServisi - akilli birlestir', () => {
  it('kilindi union: birinde true ise sonuc true (asla geri almaz)', () => {
    const mevcut = { '2026-06-14': { Sabah: true, 'Öğle': false } };
    const gelen = { '2026-06-14': { Sabah: false, 'Öğle': true } };
    const sonuc = birlestirNamazGunleri('akilli', mevcut, gelen);
    expect(sonuc['2026-06-14'].Sabah).toBe(true);
    expect(sonuc['2026-06-14']['Öğle']).toBe(true);
  });

  it('eksikleriEkle: mevcut gun korunur, yeni gun eklenir', () => {
    const mevcut = { '2026-06-14': { Sabah: true } };
    const gelen = { '2026-06-14': { Sabah: false }, '2026-06-15': { Sabah: true } };
    const sonuc = birlestirNamazGunleri('eksikleriEkle', mevcut, gelen);
    expect(sonuc['2026-06-14'].Sabah).toBe(true); // mevcut dokunulmadi
    expect(sonuc['2026-06-15'].Sabah).toBe(true); // yeni eklendi
  });

  it('uzerineYaz: gelen baz alinir', () => {
    const mevcut = { '2026-06-14': { Sabah: true } };
    const gelen = { '2026-06-14': { Sabah: false } };
    const sonuc = birlestirNamazGunleri('uzerineYaz', mevcut, gelen);
    expect(sonuc['2026-06-14'].Sabah).toBe(false);
  });
});
```
(Ek testler: `bonusPuan = max`, kaza `tamamlanan = max`, `farkCikar` çakışan gün sayısı.)

- [ ] **Step 2: Test fail** — Run: `npx jest YedekBirlestirmeServisi -v` → FAIL.

- [ ] **Step 3: Implementasyon** (saf fonksiyonlar; spec §9 kuralları)

```ts
import { BirlestirmeStratejisi, FarkOzeti, YedekPayload, KategoriSecimleri } from '../../presentation/screens/Yedekleme/IceAktarmaSihirbazi/tipler';

type GunHaritasi = Record<string, Record<string, boolean>>;

export function birlestirNamazGunleri(
  strateji: Exclude<BirlestirmeStratejisi, 'gelismis'>,
  mevcut: GunHaritasi,
  gelen: GunHaritasi,
): GunHaritasi {
  if (strateji === 'uzerineYaz') return { ...gelen };
  if (strateji === 'eksikleriEkle') {
    const sonuc: GunHaritasi = { ...gelen, ...mevcut }; // mevcut son sozu soyler
    return sonuc;
  }
  // akilli: gun+namaz bazinda kilindi = mevcut || gelen
  const sonuc: GunHaritasi = {};
  const gunler = new Set([...Object.keys(mevcut), ...Object.keys(gelen)]);
  for (const gun of gunler) {
    const a = mevcut[gun] || {}; const b = gelen[gun] || {};
    const namazlar = new Set([...Object.keys(a), ...Object.keys(b)]);
    sonuc[gun] = {};
    for (const n of namazlar) sonuc[gun][n] = Boolean(a[n]) || Boolean(b[n]);
  }
  return sonuc;
}

export function farkCikar(
  mevcutGunler: GunHaritasi,
  gelen: YedekPayload,
): FarkOzeti {
  const mevcutAnahtarlar = Object.keys(mevcutGunler);
  const gelenAnahtarlar = Object.keys(gelen.namazGunleri || {});
  const cakisan = gelenAnahtarlar.filter((g) => mevcutAnahtarlar.includes(g));
  return {
    gelenGunSayisi: gelenAnahtarlar.length,
    mevcutGunSayisi: mevcutAnahtarlar.length,
    cakisanGunSayisi: cakisan.length,
    rozetVar: Array.isArray(gelen.rozetler) && gelen.rozetler.length > 0,
    kazaVar: gelen.kaza != null,
    ayarVar: gelen.ayarlar != null && Object.keys(gelen.ayarlar).length > 0,
  };
}

// birlestir(secimler|strateji, mevcut, gelen) -> YazimPlani: namaz, kilinanVakitler,
// bonusPuan (max), kaza (tamamlanan max), ayarlar (akilli=mevcut korunur; uzerineYaz=gelen).
// Tam YazimPlani tipi ve fonksiyonu burada; Task 7 uygular.
```

- [ ] **Step 4: Test pass** — Run: `npx jest YedekBirlestirmeServisi -v` → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/domain/services/YedekBirlestirmeServisi.ts src/domain/services/__tests__/YedekBirlestirmeServisi.test.ts
git commit -m "feat(yedekleme): fark + birlestirme plan servisi (4 strateji)"
```

---

## Task 6: Dışa aktarma — dosya yaz + paylaş (servis fonksiyonu)

**Files:** Modify `src/domain/services/YedeklemeServisi.ts` (+ test eklemesi).

- [ ] **Step 1: Failing test** (expo-file-system, expo-sharing mock'lu)

```ts
jest.mock('expo-file-system');
jest.mock('expo-sharing');
import { yedeginiPaylas } from '../YedeklemeServisi';
it('yedeginiPaylas cache dosyasi yazip paylasim acar', async () => {
  await yedeginiPaylas();
  // expo-file-system write + expo-sharing.shareAsync cagrildi (mock assert)
});
```

- [ ] **Step 2: Test fail** — Run: `npx jest YedeklemeServisi -v` → FAIL.

- [ ] **Step 3: Implementasyon** — `yedekZarfiOlustur()` → cache'e `namaz-yedek-<bugunuAl()>.json` yaz (expo-file-system `File`/`Paths` API; `DebugLogsSayfasi.tsx:201-231` desenini örnek al) → `Sharing.shareAsync(uri)`. Paylaşılabilirlik yoksa kibar dön.

- [ ] **Step 4: Test pass** + **Step 5: Commit**
```bash
git commit -am "feat(yedekleme): disa aktarma dosya yaz + sistem paylasimi"
```

---

## Task 7: `yedeklemeSlice` — orkestratör thunk + UI durumu

**Files:**
- Create: `src/presentation/store/yedeklemeSlice.ts`
- Test: `src/presentation/store/__tests__/yedeklemeSlice.test.ts`
- Modify: `src/presentation/store/index.ts` (reducer kaydı)

**Sorumluluk:** state `{ asama, ilerleme, hata }`. Thunk `iceAktarmayiUygula({ payload, strateji|secimler })`: (1) `YedekBirlestirmeServisi.birlestir` ile plan, (2) plan `Depolama` ile atomik yaz + `namaz_gun_migrasyon_tamam=1`, (3) **spec §10 sırasıyla** loader thunk'lar + `seriKontrolet` → `puanlamayiYenidenHesapla` (sıralı await), (4) `asama='ozet'`.

- [ ] **Step 1: Failing test** — doğru sıra + reconcile (loader thunk'lar mock'lu; dispatch sırası assert).

```ts
it('iceAktarmayiUygula konum -> ... -> seri -> puan reconcile sirasiyla dispatch eder', async () => {
  // mock store; thunk'larin cagrilma sirasini kaydet; bekleneni dogrula
});
```

- [ ] **Step 2: Test fail** → **Step 3: Implementasyon** (createSlice + createAsyncThunk; Immer dondurulmus state → dizi sort öncesi `[...]`).
- [ ] **Step 4: Test pass** — Run: `npx jest yedeklemeSlice -v` → PASS.
- [ ] **Step 5: Commit**
```bash
git add src/presentation/store/yedeklemeSlice.ts src/presentation/store/__tests__/yedeklemeSlice.test.ts src/presentation/store/index.ts
git commit -m "feat(yedekleme): ice-aktarma orkestrator thunk + slice"
```

---

## Task 8: `YedeklemeSayfasi` giriş ekranı

**Files:** Create `src/presentation/screens/Yedekleme/YedeklemeSayfasi.tsx`. Modify `src/presentation/screens/index.ts`.

**UI:** `useRenkler` + `useFeedback`; giriş animasyonu (fade-in, `KurulumSihirbazi` deseni). İki ana aksiyon kartı: "Yedek oluştur" (ikon `database-export`/`download`, `yedeginiPaylas` çağırır, sırasında spinner) ve "İçe aktar / Geri yükle" (ikon `database-import`/`upload`, sihirbaza navigasyon). Üstte bilgi kartı: neyin dahil olduğu + güvenlik notu (kibar "siz"). `AyarlarSayfasi`/`RamazanAyarlariSayfasi` kart desenini izle.

- [ ] **Step 1: Bileşeni yaz** (frontend-design skill'i ile; takvim/kurulum stil rehberi spec'te).
- [ ] **Step 2: Smoke test** — render + "Yedek oluştur" basınca `yedeginiPaylas` çağrısı (mock'lu).
- [ ] **Step 3: Doğrula** — Run: `npm run verify`.
- [ ] **Step 4: Commit**
```bash
git add src/presentation/screens/Yedekleme/YedeklemeSayfasi.tsx src/presentation/screens/index.ts
git commit -m "feat(yedekleme): yedekleme giris sayfasi"
```

---

## Task 9: İçe aktarma sihirbazı (UI)

**Files:** Create `src/presentation/screens/Yedekleme/IceAktarmaSihirbazi/{IceAktarmaSihirbaziSayfasi,adimlar,stiller}.tsx/ts`.

**UI (KurulumSihirbazi deseni):** state `adim` (0..5); `gecisYap` fade+slide; ilerleme noktaları; `useDonanimGeriTusu`. Adımlar:
0. Dosya seç (`expo-document-picker`).
1. Çöz & doğrula (`YedeklemeServisi.zarfiCoz`; hata → kibar mesaj + tekrar dene).
2. Karşılaştır & strateji (4 kart; mockup'taki düzen; `farkCikar` özeti).
3. (Gelişmiş seçilirse) kategori-kategori strateji.
4. Uygula (`iceAktarmayiUygula`; ilerleme).
5. Özet (eklendi/güncellendi/atlandı; "Tamam" → geri).

- [ ] **Step 1: stiller.ts + adimlar.tsx** (InfoKutu/kart desenleri; kibar "siz").
- [ ] **Step 2: IceAktarmaSihirbaziSayfasi.tsx** (akış + state + animasyon).
- [ ] **Step 3: Bileşen testi** — kritik akış: doğrulanmış payload → strateji seç → `iceAktarmayiUygula` çağrısı; bozuk dosya → hata ekranı; kibar dil.
- [ ] **Step 4: Doğrula** — Run: `npm run verify`.
- [ ] **Step 5: Commit**
```bash
git commit -am "feat(yedekleme): akilli ice-aktarma sihirbazi (cok adimli)"
```

---

## Task 10: Navigasyon + ayarlar menüsü + duyuru

**Files:** Modify `src/navigation/AppNavigator.tsx`, `src/presentation/screens/AyarlarSayfasi.tsx`, `src/core/constants/YeniOzellikler.ts`.

- [ ] **Step 1:** AppNavigator AyarlarStack'e `YedeklemeAktarim` ekranı + import (sihirbaz ayrı ekran olarak da kaydedilir veya sayfa-içi modal). `options={{ title: 'Yedekleme & Aktarım' }}`.
- [ ] **Step 2:** `AyarlarSayfasi` — `MENU_IKONLARI.yedekleme` + `menuOgeleri` girişi (`baslik: 'Yedekleme & Aktarım'`, `aciklama: 'Verilerinizi yedekleyin ve başka cihaza aktarın'`, `sayfa: 'YedeklemeAktarim'`).
- [ ] **Step 3:** `YeniOzellikler.ts` — diziye en üste giriş (id `yerel-yedekleme`, sürüm sonraki, kibar metin, `hedefSayfa: 'YedeklemeAktarim'`, `kartGoster: true`).
- [ ] **Step 4: Doğrula** — Run: `npm run verify`.
- [ ] **Step 5: Commit**
```bash
git commit -am "feat(yedekleme): ayarlar menusu, navigasyon ve yeni-ozellik duyurusu"
```

---

## Task 11: Bütünleşme + AGENTS.md + son doğrulama

- [ ] **Step 1:** `AGENTS.md`'ye kısa reçete/ders ekle (yedekleme: anahtar envanteri tek kaynak, içe-aktarma `migrasyon_tamam=1`, reconcile sırası).
- [ ] **Step 2:** Tam `npm run verify` (831+ test geçmeli; yeni testler dahil).
- [ ] **Step 3:** Manuel akış gözden geçirme (mümkünse `/run` ile): dışa aktar → içe aktar → birleştir.
- [ ] **Step 4: Commit + PR**
```bash
git commit -am "docs(yedekleme): AGENTS.md recetesi"
gh pr create --base master --title "feat(yedekleme): yerel yedekleme & akilli ice-aktarma sihirbazi" --body "..."
```

---

## Self-Review (plan ↔ spec)

- **Spec coverage:** §3 kapsam→Task4 payloadTopla; §4 biçim→Task3 tipler+Task4; §5 şifreleme→Task2; §6 modüller→Task2/4/5/7/8/9; §7 dışa→Task6; §8 içe akış→Task9; §9 birleştirme→Task5; §10 tazeleme sırası→Task7; §11 hata→Task4(zarfiCoz)+Task9; §13 test→her task TDD; §14 bağımlılık→Task1; §15 entegrasyon→Task10. ✅
- **Placeholder:** `payloadTopla`/`birlestir`/UI adımları gerçek anahtar adları ve mevcut API imzaları için Reconnaissance'a bağlı — implementer kod tabanından doğrular (kasıtlı; isimler kodda kesin).
- **Tip tutarlılığı:** `BirlestirmeStratejisi`, `FarkOzeti`, `YedekPayload`, `YedekZarfi` tek yerde (`tipler.ts`); tüm task'lar buradan import eder.
