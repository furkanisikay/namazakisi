# DRY Temizliği — Faz 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bildirim servisleri ve konum ekranları arasında kopyalanmış 4 fonksiyon grubunu merkezi util/hook'lara taşıyarak DRY ihlallerini gider (bir agent bir kopyayı düzeltip diğerlerini unutamasın).

**Architecture:** Saf yardımcılar `src/core/utils/`'e, veri erişimi `src/data/local/`'e, UI mantığı `src/presentation/hooks/`'a taşınır. Mevcut davranış korunur; her taşıma sonrası tüm test suite regresyon güvencesi olarak çalıştırılır. Her görev `npm run verify` ile bitirilir.

**Tech Stack:** TypeScript 5.9 (strict), React Native 0.81 + Expo 54, Redux Toolkit, Jest + jest-expo.

**Kaynak:** `.agent/kod_kalite_raporu.md` → Faz 1 (düşük risk). Faz 2 (ortak servis çıkarımı) ve Faz 3 (SRP dosya bölme) ayrı planlara bırakılmıştır (bkz. son bölüm).

**Ön koşul:** `npm install` yapılmış, `npm run verify` baseline'da yeşil olmalı.

---

## Dosya yapısı (bu planın dokunacağı dosyalar)

- **Değiştir:** `src/core/utils/TarihYardimcisi.ts` (yeni `dunuAl()` ekle)
- **Oluştur:** `src/core/utils/__tests__/TarihYardimcisi.test.ts` (yoksa)
- **Oluştur:** `src/core/utils/MesafeHesaplayici.ts` + `__tests__/MesafeHesaplayici.test.ts`
- **Değiştir:** `src/data/local/LocalNamazServisi.ts` (yeni `kilinanVakitleriAl()` ekle)
- **Oluştur:** `src/presentation/hooks/useKonumMetni.ts` + `__tests__/useKonumMetni.test.ts`
- **Değiştir (call-site migrasyonu):** `ArkaplanMuhafizServisi.ts`, `VakitSayacBildirimServisi.ts`, `IftarSayacBildirimServisi.ts`, `SahurSayacBildirimServisi.ts`, `KonumTakipServisi.ts`, `KonumAyarlariSayfasi.tsx`, `MuhafizAyarlariSayfasi.tsx`

---

## Task 1: `dunuAl()` merkezi tarih yardımcısı

Servislerdeki `bugunTarihiAl()` zaten var olan `bugunuAl()` ile birebir aynı. `dunTarihiAl()` için merkezi karşılık yok — onu ekliyoruz.

**Files:**
- Modify: `src/core/utils/TarihYardimcisi.ts` (32-34 arası `bugunuAl` mevcut)
- Test: `src/core/utils/__tests__/TarihYardimcisi.test.ts`

- [ ] **Step 1: Failing test yaz** (`src/core/utils/__tests__/TarihYardimcisi.test.ts` — yoksa oluştur)

```typescript
import { bugunuAl, dunuAl, gunEkle } from '../TarihYardimcisi';

describe('TarihYardimcisi - bugun/dun', () => {
  it('dunuAl(), bugunden tam 1 gun onceyi ISO formatinda dondurur', () => {
    expect(dunuAl()).toBe(gunEkle(bugunuAl(), -1));
  });

  it('dunuAl() YYYY-MM-DD formatinda doner', () => {
    expect(dunuAl()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
```

- [ ] **Step 2: Test'in fail ettigini dogrula**

Run: `npx jest TarihYardimcisi`
Expected: FAIL — `dunuAl is not a function` / export bulunamadı.

- [ ] **Step 3: `dunuAl()` ekle** (`TarihYardimcisi.ts`, `bugunuAl` tanımının hemen altına)

```typescript
/**
 * Dunun tarihini ISO formatinda dondurur (yyyy-MM-dd)
 */
export const dunuAl = (): string => {
  return gunEkle(bugunuAl(), -1);
};
```

- [ ] **Step 4: Test'in geçtiğini doğrula**

Run: `npx jest TarihYardimcisi`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/utils/TarihYardimcisi.ts src/core/utils/__tests__/TarihYardimcisi.test.ts
git commit -m "refactor(tarih): merkezi dunuAl() yardimcisi ekle"
```

---

## Task 2: `ArkaplanMuhafizServisi` tarih helper migrasyonu

**Files:**
- Modify: `src/domain/services/ArkaplanMuhafizServisi.ts` (private `bugunTarihiAl` ~505, `dunTarihiAl` ~517; çağrılar 95-101, 450-451, 534-549, 631)

- [ ] **Step 1: Import ekle** (dosyanın üst import bloğuna)

```typescript
import { bugunuAl, dunuAl } from '../../core/utils/TarihYardimcisi';
```

- [ ] **Step 2: Tüm `this.bugunTarihiAl()` → `bugunuAl()`, `this.dunTarihiAl()` → `dunuAl()` değiştir**

Etkilenen satırlar: 95, 96, 100, 101, 450, 451, 534, 545, 549, 631. (Editörde "this.bugunTarihiAl()" ve "this.dunTarihiAl()" tam-kelime değiştir.)

- [ ] **Step 3: Artık kullanılmayan private metotları sil** (`bugunTarihiAl` 505-511 ve `dunTarihiAl` 517-524 blokları)

- [ ] **Step 4: Doğrula (regresyon)**

Run: `npm run verify`
Expected: PASS — typecheck temiz (kullanılmayan metot kalmadı), mevcut servis testleri geçer.

- [ ] **Step 5: Commit**

```bash
git add src/domain/services/ArkaplanMuhafizServisi.ts
git commit -m "refactor(muhafiz): tarih helper'larini merkezi TarihYardimcisi'na tasi"
```

---

## Task 3: `VakitSayacBildirimServisi` tarih helper migrasyonu

`bugunTarihiAl` (385) ve `dunTarihiAl` (393) gövdeleri Task 2'dekiyle birebir aynı.

**Files:**
- Modify: `src/domain/services/VakitSayacBildirimServisi.ts` (private metotlar 385-400; çağrılar 75-79, 335-336)

- [ ] **Step 1: Import ekle**

```typescript
import { bugunuAl, dunuAl } from '../../core/utils/TarihYardimcisi';
```

- [ ] **Step 2: `this.bugunTarihiAl()` → `bugunuAl()`, `this.dunTarihiAl()` → `dunuAl()`** (satır 75, 76, 78, 79, 335, 336)

- [ ] **Step 3: Private `bugunTarihiAl` (385-391) ve `dunTarihiAl` (393-400) metotlarını sil**

- [ ] **Step 4: Doğrula**

Run: `npm run verify`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/domain/services/VakitSayacBildirimServisi.ts
git commit -m "refactor(vakitSayac): tarih helper'larini merkezi yardimciya tasi"
```

---

## Task 4: `IftarSayacBildirimServisi` + `SahurSayacBildirimServisi` tarih helper migrasyonu

İkisinde de sadece `bugunTarihiAl` var (`dunTarihiAl` yok). Iftar: tanım ~300, çağrı 72. Sahur: tanım ~283, çağrı 67.

**Files:**
- Modify: `src/domain/services/IftarSayacBildirimServisi.ts`
- Modify: `src/domain/services/SahurSayacBildirimServisi.ts`

- [ ] **Step 1: Her iki dosyaya import ekle**

```typescript
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
```

- [ ] **Step 2: `this.bugunTarihiAl()` → `bugunuAl()`** (Iftar: satır 72; Sahur: satır 67)

- [ ] **Step 3: Her iki dosyadaki private `bugunTarihiAl()` metodunu sil** (Iftar ~300-?, Sahur ~283-?)

- [ ] **Step 4: Doğrula**

Run: `npm run verify`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/domain/services/IftarSayacBildirimServisi.ts src/domain/services/SahurSayacBildirimServisi.ts
git commit -m "refactor(sayac): iftar/sahur tarih helper'larini merkezi yardimciya tasi"
```

---

## Task 5: Haversine `mesafeHesapla` → `MesafeHesaplayici.ts`

`KonumTakipServisi.ts:72` bağımsız fonksiyon. (`TurkiyeKonumServisi`'nde de benzer hesap olabilir — Step 5'te kontrol et.)

**Files:**
- Create: `src/core/utils/MesafeHesaplayici.ts`
- Create: `src/core/utils/__tests__/MesafeHesaplayici.test.ts`
- Modify: `src/domain/services/KonumTakipServisi.ts` (fonksiyon 72-81, kullanım 129)

- [ ] **Step 1: Failing test yaz**

```typescript
import { mesafeHesapla } from '../MesafeHesaplayici';

describe('MesafeHesaplayici', () => {
  it('ayni noktada 0 metre doner', () => {
    expect(mesafeHesapla(41, 29, 41, 29)).toBe(0);
  });
  it('Istanbul-Ankara arasi ~350km (±10km) doner', () => {
    const m = mesafeHesapla(41.0082, 28.9784, 39.9334, 32.8597);
    expect(m).toBeGreaterThan(340_000);
    expect(m).toBeLessThan(360_000);
  });
});
```

- [ ] **Step 2: Test'in fail ettiğini doğrula**

Run: `npx jest MesafeHesaplayici`
Expected: FAIL — modül yok.

- [ ] **Step 3: `MesafeHesaplayici.ts` oluştur** (gövde KonumTakipServisi'nden birebir taşınır)

```typescript
/**
 * Iki koordinat arasi mesafeyi hesapla (Haversine formulu)
 * @returns Mesafe (metre)
 */
export function mesafeHesapla(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Dunya yaricapi (metre)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

- [ ] **Step 4: Test'in geçtiğini doğrula**

Run: `npx jest MesafeHesaplayici`
Expected: PASS

- [ ] **Step 5: `KonumTakipServisi.ts`'i migrate et**

Import ekle: `import { mesafeHesapla } from '../../core/utils/MesafeHesaplayici';`
Yerel `function mesafeHesapla(...)` tanımını (72-81) sil; `mesafeHesapla(...)` çağrısı (129) aynen çalışır.
Ayrıca `TurkiyeKonumServisi.ts`'te Haversine mantığı varsa onu da bu fonksiyonla değiştir (yoksa atla — `grep -n "atan2\|6371" src/domain/services/TurkiyeKonumServisi.ts`).

- [ ] **Step 6: Doğrula**

Run: `npm run verify`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/core/utils/MesafeHesaplayici.ts src/core/utils/__tests__/MesafeHesaplayici.test.ts src/domain/services/KonumTakipServisi.ts
git commit -m "refactor(konum): Haversine mesafe hesabini merkezi MesafeHesaplayici'ya tasi"
```

---

## Task 6: `tarihIcinKilinanVakitleriAl` → `LocalNamazServisi`

`ArkaplanMuhafizServisi:561` ve `VakitSayacBildirimServisi:406` birebir aynı (storage key: `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${tarih}`).

**Files:**
- Modify: `src/data/local/LocalNamazServisi.ts` (yeni metot/fonksiyon ekle)
- Test: `src/data/local/__tests__/LocalNamazServisi.test.ts` (yoksa oluştur)
- Modify: `ArkaplanMuhafizServisi.ts`, `VakitSayacBildirimServisi.ts`

- [ ] **Step 1: Failing test yaz** (AsyncStorage mock'lu)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { kilinanVakitleriAl } from '../LocalNamazServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/DepolamaAnahtarlari';

jest.mock('@react-native-async-storage/async-storage');

describe('LocalNamazServisi.kilinanVakitleriAl', () => {
  it('kayit yoksa bos dizi doner', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    expect(await kilinanVakitleriAl('2026-06-06')).toEqual([]);
  });
  it('kayitli vakitleri dogru key ile okur', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(['ogle']));
    const sonuc = await kilinanVakitleriAl('2026-06-06');
    expect(sonuc).toEqual(['ogle']);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(
      `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_2026-06-06`
    );
  });
});
```

> NOT: `DEPOLAMA_ANAHTARLARI` import yolunu Step 3'te dosyadaki gerçek yola göre teyit et (`grep -rn "DEPOLAMA_ANAHTARLARI" src/core`).

- [ ] **Step 2: Fail doğrula** — Run: `npx jest LocalNamazServisi` → FAIL (export yok).

- [ ] **Step 3: `LocalNamazServisi.ts`'e fonksiyonu ekle**

```typescript
import { VakitAdi } from '../../core/types'; // gercek tip yolunu teyit et
import { Logger } from '../../core/utils/Logger';

/**
 * Belirli bir tarih icin kilinan vakitleri al (Muhafiz storage key'i).
 */
export async function kilinanVakitleriAl(tarih: string): Promise<VakitAdi[]> {
  try {
    const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${tarih}`;
    const veri = await AsyncStorage.getItem(anahtar);
    return veri ? JSON.parse(veri) : [];
  } catch (error) {
    Logger.error('LocalNamaz', 'Kilinan vakitler alinamadi:', error);
    return [];
  }
}
```

- [ ] **Step 4: Geçtiğini doğrula** — Run: `npx jest LocalNamazServisi` → PASS

- [ ] **Step 5: Her iki servisi migrate et**

İki dosyaya da `import { kilinanVakitleriAl } from '../../data/local/LocalNamazServisi';` ekle. `this.tarihIcinKilinanVakitleriAl(X)` çağrılarını `kilinanVakitleriAl(X)` ile değiştir (Arkaplan: 95, 96, 631; VakitSayac: 75, 76). İki private `tarihIcinKilinanVakitleriAl` metodunu sil (Arkaplan 561-570, VakitSayac 406-415).

- [ ] **Step 6: Doğrula** — Run: `npm run verify` → PASS

- [ ] **Step 7: Commit**

```bash
git add src/data/local/LocalNamazServisi.ts src/data/local/__tests__/LocalNamazServisi.test.ts src/domain/services/ArkaplanMuhafizServisi.ts src/domain/services/VakitSayacBildirimServisi.ts
git commit -m "refactor(kilinan-vakit): tekrarlanan okuma mantigini LocalNamazServisi'na tasi"
```

---

## Task 7: `konumMetniOlustur` → `useKonumMetni` hook

⚠️ **DİKKAT:** İki ekrandaki fonksiyon **birebir aynı değil** — fallback metinleri farklı:
- `KonumAyarlariSayfasi`: `'GPS konumu alındı'`, `'Konum takip ediliyor'`, `'Konum seçilmedi'`
- `MuhafizAyarlariSayfasi`: `'GPS konumu'`, `'GPS aktif'`, `'Konum secilmedi'`

Bu kullanıcıya görünen metin → birleştirmeden önce hangi sürümün kanonik olacağına **kullanıcı karar vermeli** (öneri: KonumAyarlari'nın daha açıklayıcı ve doğru "ı"lı yazımı). Bu görev o karar alınmadan başlatılmaz.

**Files:**
- Create: `src/presentation/hooks/useKonumMetni.ts`
- Create: `src/presentation/hooks/__tests__/useKonumMetni.test.ts`
- Modify: `KonumAyarlariSayfasi.tsx` (659-672), `MuhafizAyarlariSayfasi.tsx` (353-366)

- [ ] **Step 1: Failing test yaz** (saf fonksiyon olarak test edilebilir girdi tipiyle)

```typescript
import { konumMetniHesapla } from '../useKonumMetni';

describe('konumMetniHesapla', () => {
  it('oto + gpsAdres (ilce+il) → "ilce, il"', () => {
    expect(konumMetniHesapla({ konumModu: 'oto', gpsAdres: { ilce: 'Kadikoy', il: 'Istanbul' } } as any)).toBe('Kadikoy, Istanbul');
  });
  it('manuel + secili il/ilce → "ilce, il"', () => {
    expect(konumMetniHesapla({ konumModu: 'manuel', seciliIlceAdi: 'Cankaya', seciliIlAdi: 'Ankara' } as any)).toBe('Cankaya, Ankara');
  });
  it('hicbiri → "Konum secilmedi" (kanonik metin)', () => {
    expect(konumMetniHesapla({ konumModu: 'manuel' } as any)).toBe('Konum seçilmedi');
  });
});
```

- [ ] **Step 2: Fail doğrula** — Run: `npx jest useKonumMetni` → FAIL

- [ ] **Step 3: Hook + saf fonksiyon oluştur** (kanonik metinler: KonumAyarlari sürümü)

```typescript
import { useMemo } from 'react';
import type { KonumAyarlari } from '../store/konumSlice'; // gercek tip yolunu teyit et

export function konumMetniHesapla(konumAyarlari: KonumAyarlari): string {
  if (konumAyarlari.konumModu === 'oto') {
    if (konumAyarlari.gpsAdres) {
      const { ilce, il } = konumAyarlari.gpsAdres;
      if (ilce && il) return `${ilce}, ${il}`;
      return ilce || il || 'GPS konumu alındı';
    }
    return 'Konum takip ediliyor';
  }
  if (konumAyarlari.seciliIlceAdi && konumAyarlari.seciliIlAdi) {
    return `${konumAyarlari.seciliIlceAdi}, ${konumAyarlari.seciliIlAdi}`;
  }
  return konumAyarlari.seciliIlAdi || 'Konum seçilmedi';
}

export function useKonumMetni(konumAyarlari: KonumAyarlari): string {
  return useMemo(() => konumMetniHesapla(konumAyarlari), [konumAyarlari]);
}
```

- [ ] **Step 4: Geçtiğini doğrula** — Run: `npx jest useKonumMetni` → PASS

- [ ] **Step 5: Her iki ekranı migrate et**

Her iki dosyada yerel `konumMetniOlustur` tanımını sil; `const konumMetni = useKonumMetni(konumAyarlari);` ekle (bileşen gövdesinin üstünde). JSX'te `{konumMetniOlustur()}` → `{konumMetni}` yap (KonumAyarlari 743, Muhafiz 500). MuhafizAyarlari artık kanonik metinleri gösterecek (kullanıcı onayı alındı varsayımıyla).

- [ ] **Step 6: Doğrula** — Run: `npm run verify` → PASS

- [ ] **Step 7: Commit**

```bash
git add src/presentation/hooks/useKonumMetni.ts src/presentation/hooks/__tests__/useKonumMetni.test.ts src/presentation/screens/KonumAyarlariSayfasi.tsx src/presentation/screens/MuhafizAyarlariSayfasi.tsx
git commit -m "refactor(konum): konum metni mantigini useKonumMetni hook'una tasi"
```

---

## Kapsam dışı — sonraki planlar (öneri)

Bu plan yalnızca **düşük riskli** DRY temizliğini kapsar. `kod_kalite_raporu.md`'deki şu maddeler ayrı planlar gerektirir (daha yüksek risk, daha geniş):

- **Faz 2 — Ortak servis çıkarımı:** `bugunVakitleriniHesapla()` (~80 satır, 2 kopya) → `NamazVaktiHesaplayiciServisi`; `kanalOlustur()` (3 kopya) → `BildirimKanalYoneticisi`; notifee olay işleme (`index.ts`/`App.tsx`) → `BildirimAksiyonIsleyici`.
- **Faz 3 — SRP dosya bölme:** `AnaSayfa.tsx` (540 satır) → custom hook'lar; `KonumAyarlariSayfasi.tsx` (991 satır) → `IlIlceSecici` ayrımı; `MuhafizAyarlariSayfasi.tsx`/`BildirimAyarlariSayfasi.tsx` alt bileşen ayrımları.

Bunlar için, başlamadan önce ilgili dosyalar derinlemesine okunup ayrı `writing-plans` oturumu yapılmalı.

---

## Self-review notları

- **Davranış değişimi:** Yalnızca Task 7 kullanıcıya görünen metni etkiler (MuhafizAyarlari fallback metinleri) — açıkça işaretlendi, kullanıcı onayı şart.
- **Tip/import yolları:** `VakitAdi`, `KonumAyarlari`, `DEPOLAMA_ANAHTARLARI` import yolları taşıma anında `grep` ile teyit edilmeli (placeholder değil, doğrulama adımı olarak işaretli).
- **Regresyon güvencesi:** Servislerin mevcut testleri (`__tests__`) call-site değişimlerini yakalar; her görev `npm run verify` ile kapanır.
