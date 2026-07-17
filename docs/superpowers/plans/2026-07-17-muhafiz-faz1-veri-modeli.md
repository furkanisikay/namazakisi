# Muhafız Faz 1 — Vakit/Seviye Veri Modeli + Davranış Semantiği (İmplementasyon Planı)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Muhafız ayarlarını vakit×seviye matrisine taşıyan **saf** veri katmanı — tipler, migrasyon, "tümüne uygula", dinamik özet, `{vakit}/{süre}` interpolasyon, aktif-seviye çakışma kuralı, preset. Native/UI yok, tamamen test edilebilir.

**Architecture:** `src/core/muhafiz/` altında saf modüller (store'a bağımsız). Slice'a yeni `matris` alanı EKLENİR; **eski alanlar (`esikler`/`sikliklar`/`gelismisMod`) korunur** ki mevcut tüketiciler (`ArkaplanMuhafizServisi`, `NamazMuhafiziServisi`, `VakitSayacBildirimServisi`) Faz 3'e kadar kırılmasın. Migrasyon yükleme thunk'ında.

**Tech Stack:** TypeScript strict, Redux Toolkit, AsyncStorage, Jest.

## Global Constraints

- **Kod isimleri Türkçe** (değişken/fonksiyon/dosya).
- **Arayüz metni kibar "siz"; ibadet-hatırlatma metni (anons şablonları) "sen" + emir kipi** — AGENTS.md muhafız istisnası. Anons şablonları: "sen" (ör. "{vakit} namazını kaçırma").
- **`npm run verify` (typecheck + lint + test) GEÇMELİ.** Yeni lint warning ekleme.
- **Saf katman store'a bağımlı OLMAZ** (`src/core/muhafiz/` — Redux/AsyncStorage import etmez; slice hariç).
- **Sabit 4 seviye:** `nazik | uyari | sert | acil` (bu sıra = azalan eşik).
- **`MuhafizVakti = Exclude<VakitAdi, 'gunes'>`** — `VakitAdi` `src/core/types` (imsak/gunes/ogle/ikindi/aksam/yatsi).
- **Migrasyon idempotent, veri kaybı yok.** Eski global ayar → 5 vakit × 4 seviyeye kopyalanır.
- **Mevcut slice alanları KIRILMAZ** — yeni `matris` alanı eklenir, eskiler durur.

## Dosya yapısı

- Create `src/core/muhafiz/matrisTipleri.ts` — tipler + sabitler (seviye anahtarları, ses paleti, varsayılan şablonlar).
- Create `src/core/muhafiz/anonsMetni.ts` — `{vakit}/{süre}` interpolasyon + varsayılan şablonlar.
- Create `src/core/muhafiz/seviyeOzeti.ts` — dinamik özet üreticisi.
- Create `src/core/muhafiz/aktifSeviye.ts` — çakışma/sıralama kuralı.
- Create `src/core/muhafiz/matrisIslemleri.ts` — tümüne-uygula + preset-uygula.
- Create `src/core/muhafiz/muhafizGoc.ts` — eski→matris migrasyonu.
- Modify `src/presentation/store/muhafizSlice.ts` — `matris` alanı + yükleme migrasyonu.
- Tests: her modül için `src/core/muhafiz/__tests__/<ad>.test.ts` + `muhafizSlice.test.ts` güncelleme.

---

### Task 1: Matris tipleri ve sabitler

**Files:**
- Create: `src/core/muhafiz/matrisTipleri.ts`
- Test: `src/core/muhafiz/__tests__/matrisTipleri.test.ts`

**Interfaces:**
- Produces: `MuhafizVakti`, `SeviyeKademe` (`'nazik'|'uyari'|'sert'|'acil'`), `UyariModu` (`'sessiz'|'bildirim'|'sesli'|'ikisi'`), `Siklik`, `SeviyeAyari`, `VakitMuhafizAyari`, `MuhafizMatrisi`; sabitler `MUHAFIZ_VAKITLERI: MuhafizVakti[]`, `SEVIYE_KADEMELERI: SeviyeKademe[]`, `SES_PALETI: {id,ad}[]`.

- [ ] **Step 1: Testi yaz**

```typescript
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, SES_PALETI } from '../matrisTipleri';

describe('matrisTipleri sabitleri', () => {
  test('5 muhafız vakti (gunes hariç)', () => {
    expect(MUHAFIZ_VAKITLERI).toEqual(['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi']);
    expect(MUHAFIZ_VAKITLERI).not.toContain('gunes');
  });
  test('4 sabit seviye kademesi, azalan eşik sırası', () => {
    expect(SEVIYE_KADEMELERI).toEqual(['nazik', 'uyari', 'sert', 'acil']);
  });
  test('ses paleti dolu ve id\'ler benzersiz', () => {
    expect(SES_PALETI.length).toBeGreaterThan(0);
    const idler = SES_PALETI.map((s) => s.id);
    expect(new Set(idler).size).toBe(idler.length);
  });
});
```

- [ ] **Step 2: Test kırmızı** — `npx jest matrisTipleri` → FAIL (modül yok).

- [ ] **Step 3: Uygula**

```typescript
import type { VakitAdi } from '../types';

export type MuhafizVakti = Exclude<VakitAdi, 'gunes'>;
export type SeviyeKademe = 'nazik' | 'uyari' | 'sert' | 'acil';
export type UyariModu = 'sessiz' | 'bildirim' | 'sesli' | 'ikisi';
export type Siklik = 'birkez' | { herDk: number };

export interface SeviyeAyari {
  kademe: SeviyeKademe;
  mod: UyariModu;
  esikDk: number;
  siklik: Siklik;
  bildirimSesi: string;
  anonsMetni: string;
}

export interface VakitMuhafizAyari {
  seviyeler: SeviyeAyari[]; // her zaman 4, SEVIYE_KADEMELERI sırası
}

export type MuhafizMatrisi = Record<MuhafizVakti, VakitMuhafizAyari>;

export const MUHAFIZ_VAKITLERI: MuhafizVakti[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];
export const SEVIYE_KADEMELERI: SeviyeKademe[] = ['nazik', 'uyari', 'sert', 'acil'];

export const SES_PALETI: { id: string; ad: string }[] = [
  { id: 'can', ad: 'Çan' },
  { id: 'melodi', ad: 'Melodi' },
  { id: 'alarm', ad: 'Alarm' },
];
export const VARSAYILAN_SES = 'can';
```

- [ ] **Step 4: Test yeşil** — `npx jest matrisTipleri` → PASS.

- [ ] **Step 5: Commit** — `git add src/core/muhafiz/matrisTipleri.ts src/core/muhafiz/__tests__/matrisTipleri.test.ts && git commit -m "feat(muhafiz): matris tipleri ve sabitler"`

---

### Task 2: Anons metni interpolasyonu ({vakit}/{süre})

**Files:**
- Create: `src/core/muhafiz/anonsMetni.ts`
- Test: `src/core/muhafiz/__tests__/anonsMetni.test.ts`

**Interfaces:**
- Consumes: `MuhafizVakti` (Task 1).
- Produces: `ANONS_SABLONLARI: string[]`; `anonsMetniniCoz(sablon: string, vakit: MuhafizVakti, kalanDk: number): string`; `VAKIT_ADLARI_ANONS: Record<MuhafizVakti, string>`.

- [ ] **Step 1: Testi yaz**

```typescript
import { anonsMetniniCoz, ANONS_SABLONLARI } from '../anonsMetni';

describe('anonsMetniniCoz', () => {
  test('{vakit} ve {süre} yerine gerçek değer koyar', () => {
    expect(anonsMetniniCoz('{vakit} vakti çıkıyor, son {süre} dakika.', 'ikindi', 18))
      .toBe('İkindi vakti çıkıyor, son 18 dakika.');
  });
  test('imsak → Sabah adıyla okunur', () => {
    expect(anonsMetniniCoz('{vakit} namazı', 'imsak', 5)).toBe('Sabah namazı');
  });
  test('aynı placeholder birden çok kez geçerse hepsini değiştirir', () => {
    expect(anonsMetniniCoz('{süre} - {süre}', 'ogle', 7)).toBe('7 - 7');
  });
  test('placeholder yoksa metni aynen döndürür', () => {
    expect(anonsMetniniCoz('Namaz vakti', 'aksam', 3)).toBe('Namaz vakti');
  });
  test('şablonlar vakit-agnostik ({vakit} içerir, sabit vakit adı içermez)', () => {
    for (const s of ANONS_SABLONLARI) {
      expect(s).toContain('{vakit}');
      expect(s).not.toMatch(/İkindi|Sabah|Öğle|Akşam|Yatsı/);
    }
  });
});
```

- [ ] **Step 2: Test kırmızı** — `npx jest anonsMetni` → FAIL.

- [ ] **Step 3: Uygula**

```typescript
import type { MuhafizVakti } from './matrisTipleri';

export const VAKIT_ADLARI_ANONS: Record<MuhafizVakti, string> = {
  imsak: 'Sabah', ogle: 'Öğle', ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı',
};

// Şablonlar vakit-agnostik ve "sen" dili (AGENTS.md muhafız istisnası).
export const ANONS_SABLONLARI: string[] = [
  '{vakit} vakti çıkıyor, son {süre} dakika.',
  '{vakit} namazını kaçırma, {süre} dakika kaldı.',
  'Vakit daralıyor, {vakit} namazına {süre} dakika.',
];

export function anonsMetniniCoz(sablon: string, vakit: MuhafizVakti, kalanDk: number): string {
  return sablon
    .split('{vakit}').join(VAKIT_ADLARI_ANONS[vakit])
    .split('{süre}').join(String(kalanDk));
}
```

- [ ] **Step 4: Test yeşil** — `npx jest anonsMetni` → PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(muhafiz): anons metni {vakit}/{süre} interpolasyonu"`

---

### Task 3: Dinamik seviye özeti

**Files:**
- Create: `src/core/muhafiz/seviyeOzeti.ts`
- Test: `src/core/muhafiz/__tests__/seviyeOzeti.test.ts`

**Interfaces:**
- Consumes: `SeviyeAyari`, `SES_PALETI` (Task 1).
- Produces: `seviyeOzetiOlustur(seviye: SeviyeAyari): string`.

- [ ] **Step 1: Testi yaz**

```typescript
import { seviyeOzetiOlustur } from '../seviyeOzeti';
import type { SeviyeAyari } from '../matrisTipleri';

const temel = (o: Partial<SeviyeAyari>): SeviyeAyari => ({
  kademe: 'nazik', mod: 'bildirim', esikDk: 30, siklik: 'birkez', bildirimSesi: 'can', anonsMetni: '', ...o,
});

describe('seviyeOzetiOlustur', () => {
  test('sessiz mod: yalnız "Sessiz"', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'sessiz' }))).toBe('Sessiz');
  });
  test('bildirim: eşik + bildirim + ses adı', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'bildirim', esikDk: 30, bildirimSesi: 'can' })))
      .toBe('30 dk kala · bildirim · Çan');
  });
  test('ikisi: bildirim + sesli anons + ses adı', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'ikisi', esikDk: 15, bildirimSesi: 'melodi' })))
      .toBe('15 dk kala · bildirim + sesli anons · Melodi');
  });
  test('sesli: yalnız sesli anons (ses adı yok)', () => {
    expect(seviyeOzetiOlustur(temel({ mod: 'sesli', esikDk: 8 })))
      .toBe('8 dk kala · sesli anons');
  });
});
```

- [ ] **Step 2: Test kırmızı** — `npx jest seviyeOzeti` → FAIL.

- [ ] **Step 3: Uygula**

```typescript
import type { SeviyeAyari } from './matrisTipleri';
import { SES_PALETI } from './matrisTipleri';

function sesAdi(id: string): string {
  return SES_PALETI.find((s) => s.id === id)?.ad ?? id;
}

export function seviyeOzetiOlustur(seviye: SeviyeAyari): string {
  if (seviye.mod === 'sessiz') return 'Sessiz';
  const parcalar = [`${seviye.esikDk} dk kala`];
  if (seviye.mod === 'bildirim') { parcalar.push('bildirim', sesAdi(seviye.bildirimSesi)); }
  else if (seviye.mod === 'ikisi') { parcalar.push('bildirim + sesli anons', sesAdi(seviye.bildirimSesi)); }
  else { parcalar.push('sesli anons'); } // 'sesli'
  return parcalar.join(' · ');
}
```

- [ ] **Step 4: Test yeşil** — `npx jest seviyeOzeti` → PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(muhafiz): dinamik seviye özeti"`

---

### Task 4: Aktif seviye / çakışma kuralı

**Files:**
- Create: `src/core/muhafiz/aktifSeviye.ts`
- Test: `src/core/muhafiz/__tests__/aktifSeviye.test.ts`

**Interfaces:**
- Consumes: `SeviyeAyari`, `VakitMuhafizAyari` (Task 1).
- Produces: `aktifSeviyeyiBul(vakitAyari: VakitMuhafizAyari, kalanDk: number): SeviyeAyari | null`; `esikSiralamasiGecerliMi(seviyeler: SeviyeAyari[]): boolean`.

Kural (spec 4.2): kalan dakikayı kapsayan (`kalanDk <= esikDk`) **en küçük eşikli (en acil), sessiz olmayan** seviye kazanır. Sessiz seviye pencere sağlamaz.

- [ ] **Step 1: Testi yaz**

```typescript
import { aktifSeviyeyiBul, esikSiralamasiGecerliMi } from '../aktifSeviye';
import type { SeviyeAyari, VakitMuhafizAyari, SeviyeKademe, UyariModu } from '../matrisTipleri';

const sv = (kademe: SeviyeKademe, esikDk: number, mod: UyariModu = 'bildirim'): SeviyeAyari =>
  ({ kademe, mod, esikDk, siklik: 'birkez', bildirimSesi: 'can', anonsMetni: '' });

const vakitAyari: VakitMuhafizAyari = {
  seviyeler: [sv('nazik', 30), sv('uyari', 15), sv('sert', 8), sv('acil', 3)],
};

describe('aktifSeviyeyiBul', () => {
  test('35 dk kala: hiçbir pencere kapsamaz → null', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 35)).toBeNull();
  });
  test('20 dk kala: yalnız nazik(30) kapsar → nazik', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 20)?.kademe).toBe('nazik');
  });
  test('5 dk kala: nazik+uyari+sert kapsar → en acil = sert(8)', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 5)?.kademe).toBe('sert');
  });
  test('2 dk kala: hepsi kapsar → acil(3)', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 2)?.kademe).toBe('acil');
  });
  test('sessiz seviye pencere sağlamaz: acil sessizse 2 dk kala sert kazanır', () => {
    const v: VakitMuhafizAyari = { seviyeler: [sv('nazik', 30), sv('uyari', 15), sv('sert', 8), sv('acil', 3, 'sessiz')] };
    expect(aktifSeviyeyiBul(v, 2)?.kademe).toBe('sert');
  });
});

describe('esikSiralamasiGecerliMi', () => {
  test('azalan eşik geçerli', () => {
    expect(esikSiralamasiGecerliMi([sv('nazik', 30), sv('uyari', 15), sv('sert', 8), sv('acil', 3)])).toBe(true);
  });
  test('ters/eşit sıra geçersiz', () => {
    expect(esikSiralamasiGecerliMi([sv('nazik', 10), sv('uyari', 15), sv('sert', 8), sv('acil', 3)])).toBe(false);
  });
});
```

- [ ] **Step 2: Test kırmızı** — `npx jest aktifSeviye` → FAIL.

- [ ] **Step 3: Uygula**

```typescript
import type { SeviyeAyari, VakitMuhafizAyari } from './matrisTipleri';

export function aktifSeviyeyiBul(vakitAyari: VakitMuhafizAyari, kalanDk: number): SeviyeAyari | null {
  // Pencereyi kapsayan (kalanDk <= esikDk) + sessiz olmayan seviyeler; en küçük eşikli (en acil) kazanır.
  const kapsayan = vakitAyari.seviyeler
    .filter((s) => s.mod !== 'sessiz' && kalanDk <= s.esikDk)
    .sort((a, b) => a.esikDk - b.esikDk);
  return kapsayan[0] ?? null;
}

export function esikSiralamasiGecerliMi(seviyeler: SeviyeAyari[]): boolean {
  // SEVIYE_KADEMELERI sırası (nazik→acil) kesin azalan eşik olmalı.
  for (let i = 1; i < seviyeler.length; i++) {
    if (seviyeler[i].esikDk >= seviyeler[i - 1].esikDk) return false;
  }
  return true;
}
```

- [ ] **Step 4: Test yeşil** — `npx jest aktifSeviye` → PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(muhafiz): aktif seviye çakışma kuralı"`

---

### Task 5: Tümüne uygula + preset uygula

**Files:**
- Create: `src/core/muhafiz/matrisIslemleri.ts`
- Test: `src/core/muhafiz/__tests__/matrisIslemleri.test.ts`

**Interfaces:**
- Consumes: `MuhafizMatrisi`, `MuhafizVakti`, `VakitMuhafizAyari`, `SeviyeAyari`, `MUHAFIZ_VAKITLERI`, `SEVIYE_KADEMELERI` (Task 1).
- Produces: `tumVakitlereUygula(matris, kaynak: MuhafizVakti): MuhafizMatrisi`; `presetUygula(matris, esikler: Record<SeviyeKademe, number>, sikliklar: Record<SeviyeKademe, number>): MuhafizMatrisi`; `zamanlamaDegistiMi(a: MuhafizMatrisi, b: MuhafizMatrisi): boolean` (spec 4.1: elle eşik/sıklık değişince Faz 2 UI yoğunluğu `'ozel'` yapar; bu saf yardımcı o kararı besler — mod/ses değişikliği yoğunluğu etkilemez).

- [ ] **Step 1: Testi yaz**

```typescript
import { tumVakitlereUygula, presetUygula, zamanlamaDegistiMi } from '../matrisIslemleri';
import { MUHAFIZ_VAKITLERI } from '../matrisTipleri';
import type { MuhafizMatrisi, SeviyeAyari, UyariModu, VakitMuhafizAyari } from '../matrisTipleri';

const sv = (esikDk: number, mod: UyariModu = 'bildirim', ses = 'can'): SeviyeAyari =>
  ({ kademe: 'nazik', mod, esikDk, siklik: 'birkez', bildirimSesi: ses, anonsMetni: '' });
const vakit = (esik: number): VakitMuhafizAyari => ({ seviyeler: [sv(esik), sv(esik - 5), sv(esik - 10), sv(esik - 15)] });
const matris = (): MuhafizMatrisi =>
  Object.fromEntries(MUHAFIZ_VAKITLERI.map((v) => [v, vakit(30)])) as MuhafizMatrisi;

describe('tumVakitlereUygula', () => {
  test('kaynak vaktin ayarını tüm vakitlere kopyalar', () => {
    const m = matris();
    m.ikindi = vakit(60);
    const sonuc = tumVakitlereUygula(m, 'ikindi');
    for (const v of MUHAFIZ_VAKITLERI) {
      expect(sonuc[v].seviyeler[0].esikDk).toBe(60);
    }
  });
  test('derin kopya: sonucu değiştirmek kaynağı bozmaz', () => {
    const m = matris();
    const sonuc = tumVakitlereUygula(m, 'ikindi');
    sonuc.ogle.seviyeler[0].esikDk = 999;
    expect(sonuc.ikindi.seviyeler[0].esikDk).not.toBe(999);
  });
});

describe('presetUygula', () => {
  test('yalnız eşik/sıklık değişir, mod/ses korunur', () => {
    const m = matris();
    m.ogle.seviyeler[0].mod = 'ikisi';
    m.ogle.seviyeler[0].bildirimSesi = 'alarm';
    const esikler = { nazik: 45, uyari: 25, sert: 10, acil: 3 };
    const sikliklar = { nazik: 20, uyari: 10, sert: 5, acil: 2 };
    const sonuc = presetUygula(m, esikler, sikliklar);
    expect(sonuc.ogle.seviyeler[0].esikDk).toBe(45);
    expect(sonuc.ogle.seviyeler[0].mod).toBe('ikisi');       // korundu
    expect(sonuc.ogle.seviyeler[0].bildirimSesi).toBe('alarm'); // korundu
  });
});

describe('zamanlamaDegistiMi (spec 4.1 elle-değişiklik → ozel)', () => {
  test('eşik değişince true', () => {
    const a = matris(); const b = matris(); b.ogle.seviyeler[0].esikDk = 99;
    expect(zamanlamaDegistiMi(a, b)).toBe(true);
  });
  test('sıklık değişince true', () => {
    const a = matris(); const b = matris(); b.ikindi.seviyeler[1].siklik = { herDk: 7 };
    expect(zamanlamaDegistiMi(a, b)).toBe(true);
  });
  test('yalnız mod/ses değişince false (zamanlama ekseni değil)', () => {
    const a = matris(); const b = matris();
    b.aksam.seviyeler[0].mod = 'sesli'; b.aksam.seviyeler[0].bildirimSesi = 'alarm';
    expect(zamanlamaDegistiMi(a, b)).toBe(false);
  });
  test('aynı matris false', () => {
    expect(zamanlamaDegistiMi(matris(), matris())).toBe(false);
  });
});
```

- [ ] **Step 2: Test kırmızı** — `npx jest matrisIslemleri` → FAIL.

- [ ] **Step 3: Uygula**

```typescript
import type { MuhafizMatrisi, MuhafizVakti, SeviyeKademe, Siklik } from './matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI } from './matrisTipleri';

const derinKopya = <T>(o: T): T => JSON.parse(JSON.stringify(o));

export function tumVakitlereUygula(matris: MuhafizMatrisi, kaynak: MuhafizVakti): MuhafizMatrisi {
  const sonuc = derinKopya(matris);
  for (const v of MUHAFIZ_VAKITLERI) {
    sonuc[v] = derinKopya(matris[kaynak]);
  }
  return sonuc;
}

export function presetUygula(
  matris: MuhafizMatrisi,
  esikler: Record<SeviyeKademe, number>,
  sikliklar: Record<SeviyeKademe, number>,
): MuhafizMatrisi {
  const sonuc = derinKopya(matris);
  for (const v of MUHAFIZ_VAKITLERI) {
    sonuc[v].seviyeler.forEach((s, i) => {
      const kademe = SEVIYE_KADEMELERI[i];
      s.esikDk = esikler[kademe];
      s.siklik = { herDk: sikliklar[kademe] };
    });
  }
  return sonuc;
}

const siklikDk = (s: Siklik): number => (s === 'birkez' ? -1 : s.herDk);

export function zamanlamaDegistiMi(a: MuhafizMatrisi, b: MuhafizMatrisi): boolean {
  // Yalnız esikDk + siklik karşılaştırılır (mod/ses/anons zamanlama ekseni değil).
  for (const v of MUHAFIZ_VAKITLERI) {
    const as = a[v].seviyeler, bs = b[v].seviyeler;
    for (let i = 0; i < as.length; i++) {
      if (as[i].esikDk !== bs[i].esikDk) return true;
      if (siklikDk(as[i].siklik) !== siklikDk(bs[i].siklik)) return true;
    }
  }
  return false;
}
```

- [ ] **Step 4: Test yeşil** — `npx jest matrisIslemleri` → PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(muhafiz): tümüne uygula + preset uygula"`

---

### Task 6: Migrasyon (eski global ayar → matris)

**Files:**
- Create: `src/core/muhafiz/muhafizGoc.ts`
- Test: `src/core/muhafiz/__tests__/muhafizGoc.test.ts`

**Interfaces:**
- Consumes: `MuhafizMatrisi`, `MUHAFIZ_VAKITLERI`, `SEVIYE_KADEMELERI`, `VARSAYILAN_SES` (Task 1).
- Produces: `EskiMuhafizAyari` (yerel tip: `{ esikler:{seviye1..4}, sikliklar:{seviye1..4} }`); `eskidenMatriseGoc(eski: EskiMuhafizAyari): MuhafizMatrisi`.

Migrasyon (spec 7): eski global eşik/sıklık → tüm 5 vakit × 4 seviye. `mod='bildirim'`, `bildirimSesi=VARSAYILAN_SES`, `anonsMetni=''`.

- [ ] **Step 1: Testi yaz**

```typescript
import { eskidenMatriseGoc } from '../muhafizGoc';
import { MUHAFIZ_VAKITLERI } from '../matrisTipleri';

const eski = {
  esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
  sikliklar: { seviye1: 20, seviye2: 10, seviye3: 5, seviye4: 2 },
};

describe('eskidenMatriseGoc', () => {
  test('5 vaktin hepsini üretir', () => {
    const m = eskidenMatriseGoc(eski);
    expect(Object.keys(m).sort()).toEqual([...MUHAFIZ_VAKITLERI].sort());
  });
  test('eşik/sıklık seviye sırasına doğru dağılır', () => {
    const m = eskidenMatriseGoc(eski);
    const s = m.ikindi.seviyeler;
    expect(s.map((x) => x.esikDk)).toEqual([45, 25, 10, 3]);
    expect(s.map((x) => (x.siklik as { herDk: number }).herDk)).toEqual([20, 10, 5, 2]);
  });
  test('mod=bildirim, ses varsayılan, anons boş (TTS opt-in)', () => {
    const s = eskidenMatriseGoc(eski).ogle.seviyeler[0];
    expect(s.mod).toBe('bildirim');
    expect(s.bildirimSesi).toBe('can');
    expect(s.anonsMetni).toBe('');
  });
  test('idempotent: iki kez çağırmak aynı sonucu verir', () => {
    expect(eskidenMatriseGoc(eski)).toEqual(eskidenMatriseGoc(eski));
  });
});
```

- [ ] **Step 2: Test kırmızı** — `npx jest muhafizGoc` → FAIL.

- [ ] **Step 3: Uygula**

```typescript
import type { MuhafizMatrisi, SeviyeAyari } from './matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, VARSAYILAN_SES } from './matrisTipleri';

export interface EskiMuhafizAyari {
  esikler: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
  sikliklar: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
}

export function eskidenMatriseGoc(eski: EskiMuhafizAyari): MuhafizMatrisi {
  const esikDizi = [eski.esikler.seviye1, eski.esikler.seviye2, eski.esikler.seviye3, eski.esikler.seviye4];
  const siklikDizi = [eski.sikliklar.seviye1, eski.sikliklar.seviye2, eski.sikliklar.seviye3, eski.sikliklar.seviye4];
  const vakitAyari = () => ({
    seviyeler: SEVIYE_KADEMELERI.map((kademe, i): SeviyeAyari => ({
      kademe, mod: 'bildirim', esikDk: esikDizi[i], siklik: { herDk: siklikDizi[i] },
      bildirimSesi: VARSAYILAN_SES, anonsMetni: '',
    })),
  });
  const matris = {} as MuhafizMatrisi;
  for (const v of MUHAFIZ_VAKITLERI) matris[v] = vakitAyari();
  return matris;
}
```

- [ ] **Step 4: Test yeşil** — `npx jest muhafizGoc` → PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(muhafiz): eski ayardan matrise migrasyon"`

---

### Task 7: Slice entegrasyonu (matris alanı + yükleme migrasyonu)

**Files:**
- Modify: `src/presentation/store/muhafizSlice.ts`
- Test: `src/presentation/store/__tests__/muhafizSlice.test.ts` (varsa güncelle; yoksa oluştur)

**Interfaces:**
- Consumes: `MuhafizMatrisi`, `eskidenMatriseGoc` (Task 6), mevcut `MuhafizAyarlari`.
- Produces: `MuhafizAyarlari.matris?: MuhafizMatrisi`; `matrisiGuncelle` action; yükleme thunk'ı matris yoksa migrasyonla doldurur.

Kural: **eski alanlar (`esikler`/`sikliklar`/`gelismisMod`/`yogunluk`) KORUNUR ve DEĞİŞTİRİLMEZ** (tüketiciler + mevcut ekran Faz 3'e kadar kullanır). `matris` opsiyonel eklenir; yükleme sırasında yoksa `eskidenMatriseGoc(...)` ile türetilir.

> **Bilinçli erteleme [I2]:** Spec 7'deki `gelismisMod=true → yogunluk='ozel'` dönüşümü Faz 1'de YAPILMAZ. Faz 1 eski alanları aynen korur (yogunluk'a dokunmak mevcut testi ve tüketicileri bozar). Bu birleştirme Faz 2'de (yeni ekran eski alanları terk edince) yapılır.

- [ ] **Step 1: Mevcut testi güncelle [CRITICAL]** — `muhafizSlice.test.ts:142` "fulfilled: diskteki tam ayarlar state e merge edilir" testi bugün `expect(state).toEqual(kayitli)` yapıyor. Task 7 sonrası state türetilmiş `matris` de içerecek → `toEqual` kırılır. Bu satırı güncelle:

```typescript
// önce: expect(state).toEqual(kayitli);
// sonra:
expect(state).toEqual({ ...kayitli, matris: eskidenMatriseGoc(kayitli) });
```
Dosya başına import ekle: `import { eskidenMatriseGoc } from '../../../core/muhafiz/muhafizGoc';`

- [ ] **Step 2: Yeni testleri yaz** (`muhafizSlice.test.ts`)

**Import düzeltmesi [çift default import önle]:** Bu dosyada zaten `import reducer, { muhafizAyarlariniGuncelle, ... } from '../muhafizSlice';` VAR. YENİ bir `import reducer, ...` EKLEME — mevcut satıra `matrisiGuncelle` ekle: `import reducer, { muhafizAyarlariniGuncelle, matrisiGuncelle, ... } from '../muhafizSlice';`. Ayrıca dosya başına ekle:
```typescript
import { MUHAFIZ_VAKITLERI } from '../../../core/muhafiz/matrisTipleri';
import type { MuhafizMatrisi } from '../../../core/muhafiz/matrisTipleri';
```
(`eskidenMatriseGoc` import'u Step 1'de zaten eklendi.) Sonra bu describe'ları dosya sonuna ekle:

```typescript
const bosMatris = (): MuhafizMatrisi =>
  MUHAFIZ_VAKITLERI.reduce((a, v) => ({ ...a, [v]: { seviyeler: [] } }), {}) as MuhafizMatrisi;

describe('muhafizSlice matris', () => {
  test('initialState taze kurulumda dolu bir matris içerir', () => {
    const bas = reducer(undefined, { type: '@@INIT' });
    expect(bas.matris).toBeDefined();
    expect(Object.keys(bas.matris!).sort()).toEqual([...MUHAFIZ_VAKITLERI].sort());
  });
  test('matrisiGuncelle matrisi yazar, eski alanları bozmaz', () => {
    const bas = reducer(undefined, { type: '@@INIT' });
    const sonra = reducer(bas, matrisiGuncelle(bosMatris()));
    expect(sonra.matris!.imsak.seviyeler).toEqual([]);
    expect(sonra.esikler).toEqual(bas.esikler);   // eski alan korundu
    expect(sonra.yogunluk).toEqual(bas.yogunluk); // yogunluk'a dokunulmadı
  });
});

describe('muhafizAyarlariniYukle matris [M2]', () => {
  test('diskte matris VARSA migrasyon çalışmaz, mevcut matris korunur', async () => {
    const ozelMatris = bosMatris();
    mockStore.set(ANAHTAR, JSON.stringify({ aktif: true, matris: ozelMatris }));
    const store = yeniStore();
    await store.dispatch(muhafizAyarlariniYukle());
    const state = store.getState().muhafiz;
    expect(state.matris).toEqual(ozelMatris); // türetilmedi, korundu
  });
});
```
(NOT: `mockStore`, `ANAHTAR`, `yeniStore`, `muhafizAyarlariniYukle` bu test dosyasında zaten tanımlı — mevcut kurulumu kullan.)

- [ ] **Step 3: Test kırmızı** — `npx jest muhafizSlice` → FAIL (`matrisiGuncelle`/`matris` yok).

- [ ] **Step 4: Uygula** — `muhafizSlice.ts`:
  - import: `import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';` + `import { eskidenMatriseGoc } from '../../core/muhafiz/muhafizGoc';`
  - `MuhafizAyarlari` arayüzüne ekle: `matris?: MuhafizMatrisi;`
  - **`initialState`'e matris ekle [I3]** (eski alanları koruyarak; `initialState` zaten `esikler`/`sikliklar` içeriyor → onlardan türet):
    ```typescript
    // initialState nesnesinin sonuna, mevcut alanlardan sonra:
    // (esikler/sikliklar zaten HATIRLATMA_PRESETLERI.normal'den geliyor)
    ```
    initialState tanımını şuna çevir — mevcut alanları koru, sona `matris` ekle:
    ```typescript
    const initialState: MuhafizAyarlari = {
      aktif: false,
      yogunluk: 'normal',
      gelismisMod: false,
      esikler: HATIRLATMA_PRESETLERI.normal.esikler,
      sikliklar: HATIRLATMA_PRESETLERI.normal.sikliklar,
      matris: eskidenMatriseGoc({
        esikler: HATIRLATMA_PRESETLERI.normal.esikler,
        sikliklar: HATIRLATMA_PRESETLERI.normal.sikliklar,
      }),
    };
    ```
  - reducers'a ekle:
    ```typescript
    matrisiGuncelle: (state, action: PayloadAction<MuhafizMatrisi>) => {
      const yeniState = { ...state, matris: action.payload };
      AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI, JSON.stringify(yeniState));
      return yeniState;
    },
    ```
  - yükleme thunk'ında (`muhafizAyarlariniYukle`), `veri` VARSA dönen nesnede matris yoksa migrasyonla doldur (eski alanlara DOKUNMA):
    ```typescript
    const temel = {
      aktif: parsed.aktif ?? initialState.aktif,
      yogunluk: parsed.yogunluk ?? initialState.yogunluk,
      gelismisMod: parsed.gelismisMod ?? initialState.gelismisMod,
      esikler: parsed.esikler ?? initialState.esikler,
      sikliklar: parsed.sikliklar ?? initialState.sikliklar,
    };
    return { ...temel, matris: parsed.matris ?? eskidenMatriseGoc(temel) };
    ```
    (`veri == null` dalı `return null` kalır — extraReducers `initialState`'i korur, o zaten matris içerir → taze kurulum matrissiz kalmaz.)
  - export'a `matrisiGuncelle` ekle.

- [ ] **Step 5: Test yeşil** — `npx jest muhafizSlice` → PASS (güncellenen + yeni testler).

- [ ] **Step 6: Tam kapı** — `npm run verify` → typecheck + lint + test hepsi PASS. Tüketiciler (`ArkaplanMuhafizServisi`, `NamazMuhafiziServisi`, `VakitSayacBildirimServisi`, `vakitSayacYardimcisi`) eski alanları kullandığı için kırılmamalı; yeni lint warning olmamalı.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat(muhafiz): slice'a matris alanı + yükleme migrasyonu + initialState matris"`

---

## Öz-inceleme (plan yazımı + Fable review sonrası)

- **Spec kapsamı:** bölüm 4 (tipler → T1), 3.3 interpolasyon (T2), dinamik özet (T3), 4.2 çakışma (T4), 4.3 tümüne-uygula + 4.1 preset **+ zamanlamaDegistiMi** (T5), bölüm 7 migrasyon (T6), slice/kalıcılık + initialState matris (T7). ✓
- **4.1 tam kapsam:** preset→matris (`presetUygula`) VE elle-değişiklik→ozel sinyali (`zamanlamaDegistiMi`) — ikisi de T5'te. `gelismisMod→ozel` migrasyonu bilinçli Faz 2'ye ertelendi [I2].
- **Placeholder:** yok — her task'ta gerçek test + implementasyon kodu.
- **Tip tutarlılığı:** `SeviyeKademe`/`UyariModu`/`Siklik`/`MuhafizMatrisi` T1'de tanımlı, sonraki task'larda aynı adlar; `eskidenMatriseGoc` T6→T7 aynı imza. Test helper'ları gerçek tiplerle (`any` yok).
- **Mevcut test kırılması:** T7 Step 1 `toEqual(kayitli)`'yi güncelliyor [CRITICAL çözüldü].
- **Kapsam dışı (Faz 1 değil):** UI, native, TTS, motor adaptörü, Katman-1 vakit-düzeyi özet üreticisi (Faz 2-5).
