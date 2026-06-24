# Tanı & Sorun Bildirme — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kullanıcının, sorun yaşadığında teknik tanıyı maskeleyip tek "kontrol et & gönder" adımıyla `support@furkanisikay.com`'a e-postayla ilettiği, cihazda kalan ve gizlilik-hassas bir bildirme akışı kurmak.

**Architecture:** Saf domain servisleri (maskeleme + rapor üretimi), kalıcı bir Redux slice (otomatik tetik + hatırlatma ayarı), `expo-mail-composer` sarmalı (mail yoksa `expo-sharing` fallback), ve App kökünde host edilen bir uyarı modalı + önizleme/onay UI'ı + Ayarlar bölümü. Otomatik tetik yalnız modal gösterir; gönderim daima kullanıcının elinde.

**Tech Stack:** React Native 0.81 / Expo SDK 54 (bare), TypeScript 5.9 strict, Redux Toolkit, NativeWind, FontAwesome5, Jest + jest-expo, expo-mail-composer (yeni), expo-file-system, expo-sharing.

## Global Constraints

- Doğrulama kapısı: her task sonunda ilgili test geçmeli; özellik bitince `npm run verify` (typecheck + lint + test) GEÇMELİ.
- Kod isimleri Türkçe; kullanıcıya görünen metin kibar "siz" dili, sentence case.
- `Alert.alert` KULLANMA → tema-uyumlu modal (`BildirimModali`).
- Her modalda `useDonanimGeriTusu(gorunur, onKapat)`; `<Modal animationType="fade" transparent statusBarTranslucent>`; backdrop `StyleSheet.absoluteFill` ile **kardeş**.
- Tema renkleri yalnız `useRenkler()` üzerinden (ASLA hardcoded); kart `borderRadius: 24`, tonlu ikon-çipi `renk + '20'`, buton deseni (ikincil=`arkaplan`+`sinir` / birincil=dolu `birincil`+ikon+beyaz). Referans: `KerahatOnayModal`.
- Erişilebilirlik: dokunma hedefi ≥44dp (`w-11 h-11`), `accessibilityRole`/`accessibilityLabel`, reduced-motion'a saygı.
- **GİZLİLİK (pazarlık yok):** otomatik gönderim yok; kişisel ibadet verisi (namaz/kaza/puan/ham AsyncStorage) e-postaya KONMAZ; konum opsiyonel + varsayılan KAPALI, açıksa yalnız `toFixed(1)` (şehir).
- Yeni bağımlılık `expo-mail-composer` `npx expo install` ile eklenir; **native rebuild gerekir** (otomatik linklenir; CI/Gradle build'i alır, yerel test için `npx expo run:android`).
- Slice deseni: `*Yukle`/`*Guncelle`, kalıcılık `Depolama` ile thunk içinde. Depolama API: `Depolama.oku<T>(anahtar): Promise<T|null>`, `Depolama.yaz<T>(anahtar, deger): Promise<void>`.

---

### Task 1: Bağımlılık + sabitler

**Files:**
- Modify: `package.json` / `package-lock.json` (expo-mail-composer)
- Modify: `src/core/constants/UygulamaSabitleri.ts` (UYGULAMA.DESTEK_EPOSTA, DEPOLAMA_ANAHTARLARI.TANI_HATIRLATMA_ACIK)

**Interfaces:**
- Produces: `UYGULAMA.DESTEK_EPOSTA: string`, `UYGULAMA.VERSIYON: string` (mevcut), `DEPOLAMA_ANAHTARLARI.TANI_HATIRLATMA_ACIK: string`.

- [ ] **Step 1: Bağımlılığı kur (CI npm sürümüyle uyumlu lockfile)**

Run:
```bash
npx expo install expo-mail-composer
npx -y npm@10 install
```
Expected: `expo-mail-composer` `package.json > dependencies`'e eklenir; lockfile npm 10 ile senkron (AGENTS.md npm-parite kuralı).

- [ ] **Step 2: Sabitleri ekle**

`src/core/constants/UygulamaSabitleri.ts` — `UYGULAMA` bloğuna `DESTEK_EPOSTA` ekle:
```ts
export const UYGULAMA = {
  ADI: 'Namaz Akışı',
  VERSIYON: '0.23.11',
  ACIKLAMA: 'Günlük namaz takip uygulaması',
  GITHUB_REPO: 'furkanisikay/namazakisi',
  DESTEK_EPOSTA: 'support@furkanisikay.com',
} as const;
```
`DEPOLAMA_ANAHTARLARI` bloğuna (diğer `@namaz_akisi/...` anahtarlarının yanına) ekle:
```ts
  TANI_HATIRLATMA_ACIK: '@namaz_akisi/tani_hatirlatma_acik',
```

- [ ] **Step 3: Tip kontrolü**

Run: `npm run typecheck`
Expected: PASS (yeni sabitler tip hatası vermez).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/core/constants/UygulamaSabitleri.ts
git commit -m "feat(tani): expo-mail-composer + DESTEK_EPOSTA/tani sabitleri"
```

---

### Task 2: `loglariMaskele` — saf maskeleme

**Files:**
- Create: `src/domain/services/TaniRaporuServisi.ts`
- Test: `src/domain/services/__tests__/TaniRaporuServisi.test.ts`

**Interfaces:**
- Produces: `loglariMaskele(metin: string, secenek: { konumDahil: boolean }): string`

- [ ] **Step 1: Write the failing test**

`src/domain/services/__tests__/TaniRaporuServisi.test.ts`:
```ts
import { loglariMaskele } from '../TaniRaporuServisi';

describe('loglariMaskele', () => {
  test('konumDahil=false → koordinatları gizler', () => {
    const m = loglariMaskele('Yeni konum: 41.0082, 28.9784 alindi', { konumDahil: false });
    expect(m).toContain('[konum gizlendi]');
    expect(m).not.toContain('41.0082');
    expect(m).not.toContain('28.9784');
  });

  test('konumDahil=true → koordinatı şehir düzeyine (toFixed 1) indirir', () => {
    const m = loglariMaskele('konum 41.0082, 28.9784', { konumDahil: true });
    expect(m).toContain('41.0');
    expect(m).toContain('29.0');
    expect(m).not.toContain('41.0082');
  });

  test('token/anahtar desenlerini redakte eder', () => {
    const m = loglariMaskele('token=abc123secret api_key: ZZZ', { konumDahil: false });
    expect(m).not.toContain('abc123secret');
    expect(m).not.toContain('ZZZ');
    expect(m).toContain('[gizlendi]');
  });

  test('sıradan teknik logu değiştirmez', () => {
    const girdi = 'KazaDefteriSayfasi: render error stack at line 5';
    expect(loglariMaskele(girdi, { konumDahil: false })).toBe(girdi);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest TaniRaporuServisi`
Expected: FAIL ("loglariMaskele is not a function" / modül yok).

- [ ] **Step 3: Write minimal implementation**

`src/domain/services/TaniRaporuServisi.ts`:
```ts
/**
 * Tanı raporu üretimi + log maskeleme (saf, store-bağımsız).
 * Gizlilik: kişisel veri içermez; konum varsayılan gizli, açıksa şehir düzeyi.
 */

// İki ondalıklı koordinat çiftlerini yakalar: "41.0082, 28.9784"
const KOORDINAT = /(-?\d{1,3}\.\d{2,})\s*,\s*(-?\d{1,3}\.\d{2,})/g;
// token=..., api_key: ..., bearer ... gibi gizli değerler
const SIR = /\b(token|api[_-]?key|secret|bearer|password|authorization)\b\s*[:=]?\s*\S+/gi;

export function loglariMaskele(metin: string, secenek: { konumDahil: boolean }): string {
  let cikti = metin.replace(SIR, '$1=[gizlendi]');
  cikti = cikti.replace(KOORDINAT, (_m, lat: string, lng: string) =>
    secenek.konumDahil
      ? `${parseFloat(lat).toFixed(1)}, ${parseFloat(lng).toFixed(1)}`
      : '[konum gizlendi]'
  );
  return cikti;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest TaniRaporuServisi`
Expected: PASS (4 test).

- [ ] **Step 5: Commit**

```bash
git add src/domain/services/TaniRaporuServisi.ts src/domain/services/__tests__/TaniRaporuServisi.test.ts
git commit -m "feat(tani): loglariMaskele (koordinat gizle/şehir + token redaksiyonu)"
```

---

### Task 3: `taniRaporuOlustur` — rapor derleme

**Files:**
- Modify: `src/domain/services/TaniRaporuServisi.ts`
- Test: `src/domain/services/__tests__/TaniRaporuServisi.test.ts`

**Interfaces:**
- Consumes: `loglariMaskele`, `UYGULAMA.VERSIYON`, `Logger.exportLogs()`.
- Produces: `taniRaporuOlustur(opts: { baglam?: string; konumDahil: boolean; neOldu?: string }): { konu: string; govde: string; logMetni: string }`

- [ ] **Step 1: Write the failing test (mock'larla)**

`TaniRaporuServisi.test.ts` üstüne ekle:
```ts
jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 34, constants: { Model: 'SM-S721B', Release: '16' } },
}));
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { exportLogs: () => 'konum 41.0082, 28.9784\nKaza render error' },
}));
```
ve yeni test:
```ts
import { taniRaporuOlustur } from '../TaniRaporuServisi';

describe('taniRaporuOlustur', () => {
  test('konu sürümü içerir, gövde ortam+bağlam taşır, log maskeli (konum kapalı)', () => {
    const r = taniRaporuOlustur({ baglam: 'Kaza sayfası yüklenemedi', konumDahil: false, neOldu: 'açılmadı' });
    expect(r.konu).toContain('0.23.11');
    expect(r.govde).toContain('Kaza sayfası yüklenemedi');
    expect(r.govde).toContain('SM-S721B');
    expect(r.govde).toContain('açılmadı');
    expect(r.logMetni).toContain('[konum gizlendi]');
    expect(r.logMetni).not.toContain('41.0082');
  });

  test('konumDahil=true → log şehir düzeyi konum içerir', () => {
    const r = taniRaporuOlustur({ konumDahil: true });
    expect(r.logMetni).toContain('41.0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest TaniRaporuServisi`
Expected: FAIL ("taniRaporuOlustur is not a function").

- [ ] **Step 3: Write minimal implementation**

`TaniRaporuServisi.ts` başına importlar + sona fonksiyon:
```ts
import { Platform } from 'react-native';
import { UYGULAMA } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
```
```ts
export function taniRaporuOlustur(opts: {
  baglam?: string;
  konumDahil: boolean;
  neOldu?: string;
}): { konu: string; govde: string; logMetni: string } {
  const c = (Platform.constants ?? {}) as { Model?: string; Release?: string };
  const cihaz = c.Model ?? 'bilinmiyor';
  const os = `${Platform.OS} ${c.Release ?? Platform.Version}`;
  const logMetni = loglariMaskele(Logger.exportLogs(), { konumDahil: opts.konumDahil });

  const govde = [
    'Merhaba, uygulamada bir sorun yaşadım. Teknik tanı kaydı ektedir.',
    '',
    `Sürüm: ${UYGULAMA.VERSIYON}`,
    `Cihaz: ${cihaz}`,
    `Android/OS: ${os}`,
    opts.baglam ? `Bağlam: ${opts.baglam}` : '',
    opts.neOldu ? `Ne oldu: ${opts.neOldu}` : '',
  ].filter(Boolean).join('\n');

  return {
    konu: `${UYGULAMA.ADI} tanı — v${UYGULAMA.VERSIYON}`,
    govde,
    logMetni,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest TaniRaporuServisi`
Expected: PASS (6 test toplam).

- [ ] **Step 5: Commit**

```bash
git add src/domain/services/TaniRaporuServisi.ts src/domain/services/__tests__/TaniRaporuServisi.test.ts
git commit -m "feat(tani): taniRaporuOlustur (sürüm/cihaz/OS + maskeli log)"
```

---

### Task 4: `taniSlice` — durum + hatırlatma ayarı

**Files:**
- Create: `src/presentation/store/taniSlice.ts`
- Modify: `src/presentation/store/store.ts`
- Test: `src/presentation/store/__tests__/taniSlice.test.ts`

**Interfaces:**
- Produces: actions `sorunBildirildi(baglam: string)`, `taniModaliKapat()`, default reducer `taniReducer`; thunks `hatirlatmaAyariniYukle()`, `hatirlatmayiGuncelle(acik: boolean)`. State: `{ sorunAlgilandi: boolean; baglam: string | null; hatirlatmaAcik: boolean; oturumdaGosterildi: boolean }`. Store anahtarı: `state.tani`.

- [ ] **Step 1: Write the failing test**

`src/presentation/store/__tests__/taniSlice.test.ts`:
```ts
import reducer, { sorunBildirildi, taniModaliKapat } from '../taniSlice';

const ilk = reducer(undefined, { type: '@@INIT' });

describe('taniSlice', () => {
  test('başlangıç durumu', () => {
    expect(ilk).toEqual({ sorunAlgilandi: false, baglam: null, hatirlatmaAcik: true, oturumdaGosterildi: false });
  });

  test('sorunBildirildi → flag + bağlam set', () => {
    const s = reducer(ilk, sorunBildirildi('Kaza yüklenemedi'));
    expect(s.sorunAlgilandi).toBe(true);
    expect(s.baglam).toBe('Kaza yüklenemedi');
  });

  test('taniModaliKapat → oturumdaGosterildi=true, sorunAlgilandi=false', () => {
    const acik = reducer(ilk, sorunBildirildi('x'));
    const s = reducer(acik, taniModaliKapat());
    expect(s.sorunAlgilandi).toBe(false);
    expect(s.oturumdaGosterildi).toBe(true);
  });

  test('oturumda ikinci kez gösterilmez', () => {
    let s = reducer(ilk, sorunBildirildi('a'));
    s = reducer(s, taniModaliKapat());
    s = reducer(s, sorunBildirildi('b'));
    expect(s.oturumdaGosterildi).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest taniSlice`
Expected: FAIL (modül yok).

- [ ] **Step 3: Write minimal implementation**

`src/presentation/store/taniSlice.ts`:
```ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Depolama } from '../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

interface TaniState {
  sorunAlgilandi: boolean;
  baglam: string | null;
  hatirlatmaAcik: boolean;
  oturumdaGosterildi: boolean;
}

const baslangic: TaniState = {
  sorunAlgilandi: false,
  baglam: null,
  hatirlatmaAcik: true,
  oturumdaGosterildi: false,
};

export const hatirlatmaAyariniYukle = createAsyncThunk('tani/hatirlatmaYukle', async () => {
  const v = await Depolama.oku<boolean>(DEPOLAMA_ANAHTARLARI.TANI_HATIRLATMA_ACIK);
  return v === null ? true : v;
});

export const hatirlatmayiGuncelle = createAsyncThunk('tani/hatirlatmaGuncelle', async (acik: boolean) => {
  await Depolama.yaz(DEPOLAMA_ANAHTARLARI.TANI_HATIRLATMA_ACIK, acik);
  return acik;
});

const taniSlice = createSlice({
  name: 'tani',
  initialState: baslangic,
  reducers: {
    sorunBildirildi: (state, action: PayloadAction<string>) => {
      state.baglam = action.payload;
      // Yalnız bu oturumda henüz gösterilmediyse modalı uyandır
      if (!state.oturumdaGosterildi) state.sorunAlgilandi = true;
    },
    taniModaliKapat: (state) => {
      state.sorunAlgilandi = false;
      state.oturumdaGosterildi = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hatirlatmaAyariniYukle.fulfilled, (state, a) => { state.hatirlatmaAcik = a.payload; })
      .addCase(hatirlatmayiGuncelle.fulfilled, (state, a) => { state.hatirlatmaAcik = a.payload; });
  },
});

export const { sorunBildirildi, taniModaliKapat } = taniSlice.actions;
export default taniSlice.reducer;
```

- [ ] **Step 4: Register reducer**

`src/presentation/store/store.ts` — import + reducer ekle:
```ts
import taniReducer from './taniSlice';
```
`reducer: { ... }` içine:
```ts
    tani: taniReducer,
```

- [ ] **Step 5: Run test + typecheck**

Run: `npx jest taniSlice && npm run typecheck`
Expected: PASS (4 test) + tip temiz.

- [ ] **Step 6: Commit**

```bash
git add src/presentation/store/taniSlice.ts src/presentation/store/store.ts src/presentation/store/__tests__/taniSlice.test.ts
git commit -m "feat(tani): taniSlice (otomatik tetik + kalıcı hatırlatma ayarı)"
```

---

### Task 5: `TaniGonderServisi` — e-posta aç (mail-composer + fallback)

**Files:**
- Create: `src/domain/services/TaniGonderServisi.ts`
- Test: `src/domain/services/__tests__/TaniGonderServisi.test.ts`

**Interfaces:**
- Consumes: `taniRaporuOlustur`, `UYGULAMA.DESTEK_EPOSTA`.
- Produces: `taniEpostasiniAc(opts: { baglam?: string; konumDahil: boolean; neOldu?: string }): Promise<'gonderildi' | 'iptal' | 'paylasildi' | 'hata'>`

- [ ] **Step 1: Write the failing test**

`src/domain/services/__tests__/TaniGonderServisi.test.ts`:
```ts
jest.mock('react-native', () => ({ Platform: { OS: 'android', Version: 34, constants: { Model: 'X', Release: '16' } } }));
jest.mock('../../../core/utils/Logger', () => ({ Logger: { exportLogs: () => 'log', error: jest.fn() } }));
const mockYaz = jest.fn();
jest.mock('expo-file-system/next', () => ({
  Paths: { cache: '/cache' },
  File: class { uri = 'file:///cache/tani.txt'; constructor() {} create() {} write(v: string) { mockYaz(v); } },
}));
const mockCompose = jest.fn();
const mockMailAvail = jest.fn();
jest.mock('expo-mail-composer', () => ({
  isAvailableAsync: () => mockMailAvail(),
  composeAsync: (o: unknown) => mockCompose(o),
}));
const mockShareAvail = jest.fn(() => Promise.resolve(true));
const mockShare = jest.fn();
jest.mock('expo-sharing', () => ({ isAvailableAsync: () => mockShareAvail(), shareAsync: (u: string) => mockShare(u) }));

import { taniEpostasiniAc } from '../TaniGonderServisi';

describe('taniEpostasiniAc', () => {
  beforeEach(() => jest.clearAllMocks());

  test('mail varsa composeAsync ile açar, gönderilince "gonderildi"', async () => {
    mockMailAvail.mockResolvedValue(true);
    mockCompose.mockResolvedValue({ status: 'sent' });
    const r = await taniEpostasiniAc({ konumDahil: false });
    expect(mockCompose).toHaveBeenCalled();
    expect(r).toBe('gonderildi');
  });

  test('mail yoksa share-sheet fallback → "paylasildi"', async () => {
    mockMailAvail.mockResolvedValue(false);
    const r = await taniEpostasiniAc({ konumDahil: false });
    expect(mockShare).toHaveBeenCalled();
    expect(r).toBe('paylasildi');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest TaniGonderServisi`
Expected: FAIL (modül yok).

- [ ] **Step 3: Write minimal implementation**

`src/domain/services/TaniGonderServisi.ts`:
```ts
import * as MailComposer from 'expo-mail-composer';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system/next';
import { UYGULAMA } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { taniRaporuOlustur } from './TaniRaporuServisi';

export async function taniEpostasiniAc(opts: {
  baglam?: string;
  konumDahil: boolean;
  neOldu?: string;
}): Promise<'gonderildi' | 'iptal' | 'paylasildi' | 'hata'> {
  try {
    const rapor = taniRaporuOlustur(opts);
    const dosya = new File(Paths.cache, `namaz-akisi-tani.txt`);
    try { dosya.create(); } catch { /* zaten varsa yoksay */ }
    dosya.write(rapor.logMetni);

    if (await MailComposer.isAvailableAsync()) {
      const sonuc = await MailComposer.composeAsync({
        recipients: [UYGULAMA.DESTEK_EPOSTA],
        subject: rapor.konu,
        body: rapor.govde,
        attachments: [dosya.uri],
      });
      return sonuc.status === 'sent' ? 'gonderildi' : 'iptal';
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(dosya.uri, { mimeType: 'text/plain', dialogTitle: rapor.konu });
      return 'paylasildi';
    }
    return 'hata';
  } catch (error) {
    Logger.error('TaniGonderServisi', 'Tanı e-postası açılamadı', {
      hata: error instanceof Error ? error.message : 'bilinmeyen',
    });
    return 'hata';
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest TaniGonderServisi`
Expected: PASS (2 test).

- [ ] **Step 5: Commit**

```bash
git add src/domain/services/TaniGonderServisi.ts src/domain/services/__tests__/TaniGonderServisi.test.ts
git commit -m "feat(tani): TaniGonderServisi (mail-composer + share-sheet fallback)"
```

---

### Task 6: `TaniOnizleme` — önizleme/onay UI

**Files:**
- Create: `src/presentation/components/Tani/TaniOnizleme.tsx`
- Test: `src/presentation/components/Tani/__tests__/TaniOnizleme.test.tsx`

**Interfaces:**
- Consumes: `taniEpostasiniAc`, `useRenkler`, `useDonanimGeriTusu`, `BildirimModali`.
- Produces: `<TaniOnizleme gorunur baglam onKapat onLoglariGor />` — props: `gorunur: boolean; baglam: string | null; onKapat: () => void; onLoglariGor: () => void`.

**Tasarım (onaylı mockup):** modal kart (`borderRadius:24`); başlık "Ne gönderiliyor?" + yeşil `shield-check` çipi; "Gönderilecek" (yeşil `check` satırları: Uygulama sürümü, Telefon ve Android sürümü, Teknik kayıtlar, *konum açıksa* Yaklaşık konum) ve "Gönderilmeyecek" (gri `times`: Namaz/kaza/puan, Kişisel veriler, *konum kapalıyken* Yaklaşık konum); konum `Switch` (varsayılan `false`); "Tam kaydı görüntüle" (`onLoglariGor`); birincil "E-postayı aç" → `taniEpostasiniAc({ baglam, konumDahil })`.

- [ ] **Step 1: Write the failing test**

`src/presentation/components/Tani/__tests__/TaniOnizleme.test.tsx`:
```tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TaniOnizleme } from '../TaniOnizleme';

jest.mock('../../../../core/theme', () => ({ useRenkler: () => ({
  arkaplan: '#FAFAFA', kartArkaplan: '#FFF', metin: '#000', metinIkincil: '#777',
  birincil: '#4CAF50', sinir: '#E0E0E0', durum: { basarili: '#4CAF50', hata: '#F44336', uyari: '#FFC107' },
}) }));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: () => {} }));
const mockAc = jest.fn(() => Promise.resolve('gonderildi'));
jest.mock('../../../../domain/services/TaniGonderServisi', () => ({ taniEpostasiniAc: (o: unknown) => mockAc(o) }));

describe('TaniOnizleme', () => {
  beforeEach(() => mockAc.mockClear());

  test('şeffaf içerik: gönderilmeyecekler listelenir', () => {
    const { getByText } = render(<TaniOnizleme gorunur baglam="x" onKapat={() => {}} onLoglariGor={() => {}} />);
    expect(getByText('Gönderilmeyecek')).toBeTruthy();
    expect(getByText(/Namaz, kaza, puan/)).toBeTruthy();
  });

  test('E-postayı aç → servis konumDahil:false ile çağrılır', async () => {
    const { getByText } = render(<TaniOnizleme gorunur baglam="x" onKapat={() => {}} onLoglariGor={() => {}} />);
    fireEvent.press(getByText('E-postayı aç'));
    await waitFor(() => expect(mockAc).toHaveBeenCalledWith(expect.objectContaining({ konumDahil: false })));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest TaniOnizleme`
Expected: FAIL (modül yok).

- [ ] **Step 3: Write implementation**

`src/presentation/components/Tani/TaniOnizleme.tsx` — `KerahatOnayModal` desenini izle: `<Modal animationType="fade" transparent statusBarTranslucent>`, backdrop absolute kardeş, `useDonanimGeriTusu(gorunur, onKapat)`. Kart içinde:
- Başlık satırı: `w-11 h-11` yeşil tint (`renkler.birincil + '20'`) çip + `FontAwesome5 name="shield-alt"` + "Ne gönderiliyor?" / "Göndermeden önce görün".
- `useState` `konumDahil=false`. "Gönderilecek" bölümü `check` (yeşil) satırları; `konumDahil` true ise "Yaklaşık konum (şehir)" satırını burada göster. "Gönderilmeyecek" bölümü `times` (gri) satırları: `Namaz, kaza, puan`, `Kişisel veriler`, ve `konumDahil` false ise `Yaklaşık konum`.
- `<Switch value={konumDahil} onValueChange={setKonumDahil} accessibilityLabel="Yaklaşık konumu ekle" />` (RN `Switch`, `trackColor={{ true: renkler.birincil }}`).
- "Tam kaydı görüntüle" `TouchableOpacity onPress={onLoglariGor}` (`accessibilityRole="button"`).
- Birincil buton "E-postayı aç" (`FontAwesome5 name="envelope"` + beyaz): `onPress` → `const r = await taniEpostasiniAc({ baglam: baglam ?? undefined, konumDahil }); onKapat(); setBildirim(...)` (sonuç `'hata'` ise `BildirimModali` tip="hata", `'paylasildi'`/`'gonderildi'` ise gerekirse bilgi). İkincil "İptal" → `onKapat`.
- Tüm metin "siz" dili, sentence case; dokunma hedefleri `py-3.5 rounded-2xl`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest TaniOnizleme`
Expected: PASS (2 test).

- [ ] **Step 5: Commit**

```bash
git add src/presentation/components/Tani/TaniOnizleme.tsx src/presentation/components/Tani/__tests__/TaniOnizleme.test.tsx
git commit -m "feat(tani): TaniOnizleme onay ekranı (gönderilecek/gönderilmeyecek + konum opsiyonel)"
```

---

### Task 7: `TaniBildirModali` — otomatik uyarı + App host

**Files:**
- Create: `src/presentation/components/Tani/TaniBildirModali.tsx`
- Modify: `App.tsx` (kök host)
- Test: `src/presentation/components/Tani/__tests__/TaniBildirModali.test.tsx`

**Interfaces:**
- Consumes: `useAppDispatch`, `useAppSelector` (`state.tani`), `taniModaliKapat`, `hatirlatmayiGuncelle`, `TaniOnizleme`, `useRenkler`, `useDonanimGeriTusu`.
- Produces: `<TaniBildirModali />` (kendi state'ini store'dan okur; App kökünde host edilir).

**Tasarım (onaylı, sade):** `sorunAlgilandi && hatirlatmaAcik` iken modal; ortalı amber tint `w-14 h-14` çip + `FontAwesome5 name="exclamation-triangle"`; başlık "Bir sorun oluştu" / "Bize bildirmek ister misiniz?"; iki güven rozeti (yeşil tint: `lock` "Otomatik gönderilmez", `check-circle` "Onay sizde"); birincil "Bildir" → `TaniOnizleme` aç; "Şimdi değil" → `taniModaliKapat`; "Bir daha sorma" → `hatirlatmayiGuncelle(false)` + `taniModaliKapat`.

- [ ] **Step 1: Write the failing test**

`src/presentation/components/Tani/__tests__/TaniBildirModali.test.tsx`:
```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaniBildirModali } from '../TaniBildirModali';

const mockDispatch = jest.fn();
let durum = { sorunAlgilandi: true, baglam: 'Kaza yüklenemedi', hatirlatmaAcik: true, oturumdaGosterildi: false };
jest.mock('../../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (s: (st: { tani: typeof durum }) => unknown) => s({ tani: durum }),
}));
jest.mock('../../../store/taniSlice', () => ({ taniModaliKapat: () => ({ type: 'kapat' }), hatirlatmayiGuncelle: (v: boolean) => ({ type: 'guncelle', payload: v }) }));
jest.mock('../../../../core/theme', () => ({ useRenkler: () => ({ kartArkaplan: '#FFF', metin: '#000', metinIkincil: '#777', birincil: '#4CAF50', arkaplan: '#FAFAFA', sinir: '#E0E0E0', durum: { uyari: '#FFC107', basarili: '#4CAF50' } }) }));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: () => {} }));
jest.mock('../TaniOnizleme', () => ({ TaniOnizleme: () => null }));

describe('TaniBildirModali', () => {
  beforeEach(() => mockDispatch.mockClear());

  test('başlık görünür', () => {
    const { getByText } = render(<TaniBildirModali />);
    expect(getByText('Bir sorun oluştu')).toBeTruthy();
  });

  test('"Bir daha sorma" → hatırlatma kapatılır', () => {
    const { getByText } = render(<TaniBildirModali />);
    fireEvent.press(getByText('Bir daha sorma'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'guncelle', payload: false });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest TaniBildirModali`
Expected: FAIL (modül yok).

- [ ] **Step 3: Write implementation**

`src/presentation/components/Tani/TaniBildirModali.tsx`: store'dan `const { sorunAlgilandi, hatirlatmaAcik, baglam } = useAppSelector(s => s.tani)`. Yerel `const [onizleme, setOnizleme] = useState(false)`. Modal `visible={sorunAlgilandi && hatirlatmaAcik}` (KerahatOnayModal deseni). İçerik onaylı sade tasarım (ortalı ikon, başlık, iki rozet, üç aksiyon). Butonlar: "Bildir" → `setOnizleme(true)` (modalı kapamadan önizlemeyi aç; `taniModaliKapat` dispatch'i önizleme kapanınca). "Şimdi değil" → `dispatch(taniModaliKapat())`. "Bir daha sorma" → `dispatch(hatirlatmayiGuncelle(false)); dispatch(taniModaliKapat())`. Sonuna `<TaniOnizleme gorunur={onizleme} baglam={baglam} onKapat={() => { setOnizleme(false); dispatch(taniModaliKapat()); }} onLoglariGor={...} />`.

- [ ] **Step 4: Host in App**

`App.tsx` — render ağacının köküne (mevcut global modallar neredeyse oraya) ekle:
```tsx
import { TaniBildirModali } from './src/presentation/components/Tani/TaniBildirModali';
```
ana provider içine (diğer kök-seviye bileşenlerin yanına): `<TaniBildirModali />`. Ayrıca açılışta ayar yükle: mevcut bir `useEffect` init bloğuna `store.dispatch(hatirlatmaAyariniYukle())` ekle (veya App init effect'ine `dispatch(hatirlatmaAyariniYukle())`).

- [ ] **Step 5: Run test + typecheck**

Run: `npx jest TaniBildirModali && npm run typecheck`
Expected: PASS (2 test) + tip temiz.

- [ ] **Step 6: Commit**

```bash
git add src/presentation/components/Tani/TaniBildirModali.tsx src/presentation/components/Tani/__tests__/TaniBildirModali.test.tsx App.tsx
git commit -m "feat(tani): TaniBildirModali otomatik uyarı + App kök host + ayar yükleme"
```

---

### Task 8: `TaniGeriBildirimSayfasi` (Ayarlar) + navigasyon + menü

**Files:**
- Create: `src/presentation/screens/TaniGeriBildirimSayfasi.tsx`
- Modify: `src/presentation/screens/index.ts` (export)
- Modify: `src/navigation/AppNavigator.tsx` (Stack.Screen)
- Modify: Ayarlar ana menü sayfası (yeni satır → `navigation.navigate('TaniGeriBildirim')`)
- Test: `src/presentation/screens/__tests__/TaniGeriBildirimSayfasi.test.tsx`

**Interfaces:**
- Consumes: `useAppDispatch`/`useAppSelector` (`state.tani.hatirlatmaAcik`), `hatirlatmayiGuncelle`, `TaniOnizleme`, `useRenkler`.
- Produces: `TaniGeriBildirimSayfasi` ekranı; nav adı `"TaniGeriBildirim"`.

- [ ] **Step 1: Write the failing test**

`src/presentation/screens/__tests__/TaniGeriBildirimSayfasi.test.tsx`:
```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaniGeriBildirimSayfasi } from '../TaniGeriBildirimSayfasi';

const mockDispatch = jest.fn();
jest.mock('../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (s: (st: { tani: { hatirlatmaAcik: boolean } }) => unknown) => s({ tani: { hatirlatmaAcik: true } }),
}));
jest.mock('../../store/taniSlice', () => ({ hatirlatmayiGuncelle: (v: boolean) => ({ type: 'g', payload: v }) }));
jest.mock('../../../core/theme', () => ({ useRenkler: () => ({ arkaplan: '#FAFAFA', kartArkaplan: '#FFF', metin: '#000', metinIkincil: '#777', birincil: '#4CAF50', sinir: '#E0E0E0', durum: { basarili: '#4CAF50', hata: '#F44336' } }) }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
jest.mock('../../components/Tani/TaniOnizleme', () => ({ TaniOnizleme: () => null }));

describe('TaniGeriBildirimSayfasi', () => {
  test('Sorun Bildir butonu görünür', () => {
    const { getByText } = render(<TaniGeriBildirimSayfasi />);
    expect(getByText('Sorun Bildir')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest TaniGeriBildirimSayfasi`
Expected: FAIL (modül yok).

- [ ] **Step 3: Write implementation**

`TaniGeriBildirimSayfasi.tsx`: `SafeAreaView` + başlık "Tanı ve Geri Bildirim". İçerik: kısa açıklama ("Bir sorun yaşarsanız teknik tanı kaydını bize iletebilirsiniz. Hiçbir şey otomatik gönderilmez; kişisel verileriniz paylaşılmaz."); birincil "Sorun Bildir" → `setOnizleme(true)`; `Switch` "Sorun algılandığında hatırlat" `value={hatirlatmaAcik}` → `dispatch(hatirlatmayiGuncelle(v))`; "Gönderilecek bilgiyi önizle" → `setOnizleme(true)`; "Tanı kayıtlarını görüntüle" → `navigation.navigate('DebugLogs')`. Sona `<TaniOnizleme gorunur={onizleme} baglam={null} onKapat={() => setOnizleme(false)} onLoglariGor={() => navigation.navigate('DebugLogs')} />`.

- [ ] **Step 4: Register screen + export + menu**

`src/presentation/screens/index.ts`: `export { TaniGeriBildirimSayfasi } from './TaniGeriBildirimSayfasi';`
`src/navigation/AppNavigator.tsx`: import + `<Stack.Screen name="TaniGeriBildirim" component={TaniGeriBildirimSayfasi} options={{ headerShown: false }} />` (diğer ayar ekranlarıyla aynı `options`).
Ayarlar ana menü sayfasında (DebugLogs satırının yakınına) yeni bir menü satırı → `onPress={() => navigation.navigate('TaniGeriBildirim')}`, ikon `FontAwesome5 name="bug"` veya `comment-dots`, etiket "Tanı ve Geri Bildirim".

- [ ] **Step 5: Run test + typecheck**

Run: `npx jest TaniGeriBildirimSayfasi && npm run typecheck`
Expected: PASS + tip temiz.

- [ ] **Step 6: Commit**

```bash
git add src/presentation/screens/TaniGeriBildirimSayfasi.tsx src/presentation/screens/index.ts src/navigation/AppNavigator.tsx src/presentation/screens/__tests__/TaniGeriBildirimSayfasi.test.tsx
git commit -m "feat(tani): Ayarlar 'Tanı ve Geri Bildirim' sayfası + navigasyon + menü"
```

> Not: Ayarlar ana menü dosyasının tam adını `grep -rl "DebugLogs" src/presentation/screens` ile bul; menü satırını oraya ekle ve commit'e dahil et.

---

### Task 9: Enstrümantasyon — kaza yükleme reddini tetikle

**Files:**
- Modify: `src/presentation/store/kazaSlice.ts` (rejected → sorunBildirildi)
- Test: `src/presentation/store/__tests__/kazaSlice.test.ts` (yoksa oluştur)

**Interfaces:**
- Consumes: `sorunBildirildi` (taniSlice).

> Bağımlılık notu: Kök neden düzeltmesi `fix/kaza-yukleme-dayaniklilik` dalında. Bu task o düzeltmeyle aynı dalda/üzerinde uygulanmalı (yükleme artık reddetmiyor; bu yüzden enstrümantasyon **savunma-derinliği**: gelecekteki başka reddetme yolları için). Kaza fix'i bu dala merge/rebase edildikten sonra uygula.

- [ ] **Step 1: Write the failing test**

`src/presentation/store/__tests__/kazaSlice.test.ts` (yeni veya mevcut) — `kazaVerileriniYukle.rejected` aksiyonu store'da `sorunBildirildi`'yi tetikleyecek bir listener/middleware veya thunk düzenlemesi test edilir. En basit yol: thunk'ın `catch`'inde değil, ekran tarafında değil — `App` store'una bir `listenerMiddleware` ekleyip rejected'ı dinlemek. (Detay: aşağıdaki Step 3 deseni.)

```ts
import { sorunBildirildi } from '../taniSlice';
import { taniListenerMiddleware } from '../taniListener';
// kazaVerileriniYukle.rejected dispatch edilince sorunBildirildi tetiklenmeli
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest taniListener`
Expected: FAIL (modül yok).

- [ ] **Step 3: Write implementation (RTK listener middleware)**

`src/presentation/store/taniListener.ts`:
```ts
import { createListenerMiddleware, isRejected } from '@reduxjs/toolkit';
import { kazaVerileriniYukle } from './kazaSlice';
import { sorunBildirildi } from './taniSlice';

export const taniListenerMiddleware = createListenerMiddleware();

taniListenerMiddleware.startListening({
  matcher: isRejected(kazaVerileriniYukle),
  effect: (_action, api) => {
    api.dispatch(sorunBildirildi('Kaza sayfası yüklenemedi'));
  },
});
```
`store.ts`: `middleware: (getDefault) => getDefault().prepend(taniListenerMiddleware.middleware)`.

- [ ] **Step 4: Run test + verify**

Run: `npx jest taniListener`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/store/taniListener.ts src/presentation/store/store.ts src/presentation/store/__tests__/kazaSlice.test.ts
git commit -m "feat(tani): kaza yükleme reddinde tanı tetikleyici (listener middleware)"
```

---

### Task 10: Tam doğrulama + manuel duman testi

- [ ] **Step 1: Tam doğrulama kapısı**

Run: `npm run verify`
Expected: typecheck + lint + test üçü de PASS (yeni testler dahil).

- [ ] **Step 2: Manuel duman testi (native rebuild gerekli)**

Run: `npx expo run:android` (expo-mail-composer native modülü için).
Kontrol: Ayarlar → "Tanı ve Geri Bildirim" → "Sorun Bildir" → önizlemede "Gönderilmeyecek" listesi + konum anahtarı (varsayılan kapalı) → "E-postayı aç" → mail uygulaması alıcı/konu/gövde/ek dolu açılır. Konum anahtarını aç/kapat → satır taşınır. Mail uygulaması yoksa share-sheet açılır.

- [ ] **Step 3: Bilgi tabanını güncelle (AGENTS.md)**

`AGENTS.md` "Reçete" benzeri kısa bir madde ekle: "Tanı/sorun-bildir akışı: `TaniRaporuServisi.loglariMaskele` (konum varsayılan gizli), `TaniGonderServisi` (mail-composer + share fallback), `taniSlice` (oturumda-bir-kez), kök neden enstrümantasyonu `taniListener`." Aynı commit.

```bash
git add AGENTS.md
git commit -m "docs(agents): tanı/sorun-bildir akışı notu"
```

---

## Self-Review

**Spec coverage:** Otomatik tetik (T7/T9) · manuel buton (T8) · expo-mail-composer + fallback (T5) · içerik+maskeleme+opsiyonel konum (T2/T3) · önizleme/onay (T6) · Ayarlar bölümü + toggle (T8) · gizlilik (kişisel veri yok — T3/T6) · DESTEK_EPOSTA + dep (T1) · test stratejisi (her task) · animasyon (T6/T7 tasarım notu, AGENTS.md UI standardı). ✓
**Placeholder scan:** Kod adımları gerçek kod içerir; UI tasarım notları onaylı mockup + `KerahatOnayModal` desenine referansla somut (yeni tip/fonksiyon icat etmez). Ayarlar menü dosyası adı T8'de `grep` ile bulunur (kasıtlı, repoya özgü). ✓
**Type consistency:** `taniEpostasiniAc(opts:{baglam?,konumDahil,neOldu?})` ve `taniRaporuOlustur` aynı opts; `sorunBildirildi(string)`/`taniModaliKapat()`/`hatirlatmayiGuncelle(boolean)` tüm task'larda tutarlı; `state.tani` anahtarı T4'te tanımlı, T7/T8/T9'da kullanılır. ✓
