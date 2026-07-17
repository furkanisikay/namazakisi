# Muhafız Bildirim Başlığı — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Muhafız bildiriminde kalan süreyi gövdenin sonundan alıp başlığın başına taşımak, böylece daraltılmış bildirimde açmadan görünmesini sağlamak.

**Architecture:** Başlık üretimi şu an `ArkaplanMuhafizServisi`'nin planlama döngüsünde inline sabit atamalar hâlinde; test edilemez. Saf bir `muhafizMetinYardimcisi` modülü çıkarılıp başlık/gövde metinleri oraya taşınır, servis yalnız onu çağırır. Banner yüzeyi (`NamazMuhafiziServisi`) kendi mesaj şeklini korur; orada sadece "sen" dili düzeltilir.

**Tech Stack:** TypeScript 5.9 (strict), Jest + jest-expo, expo-notifications.

**Spec:** `docs/superpowers/specs/2026-07-17-muhafiz-bildirim-basligi-design.md`

## Global Constraints

- Kod isimleri **Türkçe** (`basligiOlustur`, `VAKIT_ADLARI`).
- Kullanıcıya görünen **TÜM** metin kibar **"siz"** dilinde. Sertlik korunur, kabalık değil.
- **`toUpperCase()` KULLANMA.** `'İkindi'.toUpperCase()` → `'İKINDI'` (noktalı İ kaybolur). Sabit `VAKIT_ADLARI_BUYUK` haritası kullanılacak — `toLocaleUpperCase('tr-TR')` de **kullanılmayacak** (Hermes'te Intl/ICU ortama bağlı).
- Başlık kalıbı: `<ikon> <süre> dk · <vakit adı> vakti <durum>` — süre daima ikondan hemen sonra, ilk sözcük.
- Bildirim gövdesi başlığı **birebir tekrarlamaz** ve sonunda `(N dk kaldı)` **taşımaz**. Banner mesajı süreyi **korur**.
- Bitmeden `npm run verify` (typecheck + lint + test) **geçmeli**.
- Dokunulmaz: seviye eşikleri/sıklıkları, bildirim ID'leri/gruplama, kanallar/sesler, `SeytanlaMucadeleIcerigi.ts` havuzu, `AnaSayfa.tsx`.

---

### Task 1: Saf metin modülü (`muhafizMetinYardimcisi`)

**Files:**
- Create: `src/core/utils/muhafizMetinYardimcisi.ts`
- Test: `src/core/utils/__tests__/muhafizMetinYardimcisi.test.ts`

**Interfaces:**
- Consumes: `VakitAdi` — `src/core/types/index.ts` (`'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi'`)
- Produces (Task 2 bunlara dayanır):
  - `MuhafizSeviye = 1 | 2 | 3 | 4`
  - `VAKIT_ADLARI: Record<VakitAdi, string>`
  - `VAKIT_ADLARI_BUYUK: Record<VakitAdi, string>`
  - `basligiOlustur(vakit: VakitAdi, seviye: MuhafizSeviye, kalanDk: number): string`
  - `bildirimGovdesiOlustur(seviye: MuhafizSeviye): string`

- [ ] **Step 1: Write the failing test**

Create `src/core/utils/__tests__/muhafizMetinYardimcisi.test.ts`:

```typescript
import {
  basligiOlustur,
  bildirimGovdesiOlustur,
  VAKIT_ADLARI_BUYUK,
} from '../muhafizMetinYardimcisi';

describe('basligiOlustur', () => {
  test('seviye 1: süre + vakit adı', () => {
    expect(basligiOlustur('imsak', 1, 30)).toBe('⏰ 30 dk · Sabah vakti');
  });

  test('seviye 2: daralıyor', () => {
    expect(basligiOlustur('ogle', 2, 15)).toBe('⚠️ 15 dk · Öğle vakti daralıyor');
  });

  test('seviye 3: kaçıyor', () => {
    expect(basligiOlustur('aksam', 3, 8)).toBe('🔥 8 dk · Akşam vakti kaçıyor');
  });

  test('seviye 4: büyük harf + ÇIKIYOR', () => {
    expect(basligiOlustur('yatsi', 4, 3)).toBe('🚨 3 dk · YATSI VAKTİ ÇIKIYOR');
  });

  // NÖBETÇİ TEST — bu testin sebebi:
  // 'İkindi'.toUpperCase() => 'İKINDI' (noktalı İ kaybolur, i -> I).
  // Sabit harita kullanılmazsa kullanıcıya yanlış yazılmış namaz adı gider.
  // Diğer dört vakitte harf tuzağı YOK, o yüzden yalnız bu test koruyor.
  test('İkindi seviye 4 başlığı noktalı İKİNDİ üretir (toUpperCase tuzağı)', () => {
    expect(basligiOlustur('ikindi', 4, 5)).toBe('🚨 5 dk · İKİNDİ VAKTİ ÇIKIYOR');
    expect(basligiOlustur('ikindi', 4, 5)).not.toContain('İKINDI');
  });

  test('VAKIT_ADLARI_BUYUK ham toUpperCase ile aynı DEĞİL (regresyon nöbetçisi)', () => {
    expect(VAKIT_ADLARI_BUYUK.ikindi).toBe('İKİNDİ');
    expect('İkindi'.toUpperCase()).toBe('İKINDI'); // tuzağın kanıtı
  });

  test('süre daima ikondan sonraki ilk sözcük', () => {
    const seviyeler: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
    for (const s of seviyeler) {
      expect(basligiOlustur('aksam', s, 7)).toMatch(/^\S+ 7 dk · /u);
    }
  });

  test('beş vaktin beşi de doğru ada çözülür', () => {
    expect(basligiOlustur('imsak', 1, 1)).toContain('Sabah');
    expect(basligiOlustur('ogle', 1, 1)).toContain('Öğle');
    expect(basligiOlustur('ikindi', 1, 1)).toContain('İkindi');
    expect(basligiOlustur('aksam', 1, 1)).toContain('Akşam');
    expect(basligiOlustur('yatsi', 1, 1)).toContain('Yatsı');
  });
});

describe('bildirimGovdesiOlustur', () => {
  test('gövde sondaki kalan süreyi TAŞIMAZ (süre başlıkta)', () => {
    for (const s of [1, 2, 3, 4] as const) {
      expect(bildirimGovdesiOlustur(s)).not.toMatch(/dk kaldı|dakika kaldı/u);
    }
  });

  test('gövde başlığın durum ifadesini birebir tekrarlamaz', () => {
    // Seviye 4 başlığı "... VAKTİ ÇIKIYOR" diyor; gövde bunu tekrar etmemeli.
    expect(bildirimGovdesiOlustur(4)).not.toContain('ÇIKIYOR');
    expect(bildirimGovdesiOlustur(4)).not.toContain('çıkmak üzere');
    // Seviye 2 başlığı "daralıyor" diyor.
    expect(bildirimGovdesiOlustur(2)).not.toContain('daralıyor');
  });

  test('kibar "siz" dili — emir kipinde "sen" kalıbı yok', () => {
    const senKaliplari = /\b(kapan|bırakma|uyma|kıl)\b(?!ın|ınız|ayın)/u;
    for (const s of [1, 2, 3, 4] as const) {
      expect(bildirimGovdesiOlustur(s)).not.toMatch(senKaliplari);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest muhafizMetinYardimcisi`
Expected: FAIL — `Cannot find module '../muhafizMetinYardimcisi'`

- [ ] **Step 3: Write minimal implementation**

Create `src/core/utils/muhafizMetinYardimcisi.ts`:

```typescript
/**
 * Muhafiz bildirim metinleri (saf).
 *
 * Baslik uretimi eskiden ArkaplanMuhafizServisi'nin planlama dongusunde inline
 * sabit atamalardaydi -> test edilemiyordu. Buraya cikarildi.
 *
 * Kalan sure BASLIKTA ve daima ikondan hemen sonra: Android daraltilmis
 * bildirimde basligi + govdenin basini gosterir; sure sonda olursa kirpilir.
 */
import type { VakitAdi } from '../types';

export type MuhafizSeviye = 1 | 2 | 3 | 4;

export const VAKIT_ADLARI: Record<VakitAdi, string> = {
    imsak: 'Sabah',
    gunes: 'Güneş',
    ogle: 'Öğle',
    ikindi: 'İkindi',
    aksam: 'Akşam',
    yatsi: 'Yatsı',
};

/**
 * DIKKAT: toUpperCase() KULLANMA.
 * 'İkindi'.toUpperCase() -> 'İKINDI' (noktali İ kaybolur, i -> I).
 * toLocaleUpperCase('tr-TR') dogru sonuc verir ama Hermes'te Intl/ICU
 * varligina baglidir -> sabit harita motordan bagimsiz ve kesindir.
 */
export const VAKIT_ADLARI_BUYUK: Record<VakitAdi, string> = {
    imsak: 'SABAH',
    gunes: 'GÜNEŞ',
    ogle: 'ÖĞLE',
    ikindi: 'İKİNDİ',
    aksam: 'AKŞAM',
    yatsi: 'YATSI',
};

/**
 * Bildirim basligi: <ikon> <sure> dk · <vakit adi> vakti <durum>
 */
export function basligiOlustur(vakit: VakitAdi, seviye: MuhafizSeviye, kalanDk: number): string {
    const ad = VAKIT_ADLARI[vakit];
    switch (seviye) {
        case 1:
            return `⏰ ${kalanDk} dk · ${ad} vakti`;
        case 2:
            return `⚠️ ${kalanDk} dk · ${ad} vakti daralıyor`;
        case 3:
            return `🔥 ${kalanDk} dk · ${ad} vakti kaçıyor`;
        case 4:
            return `🚨 ${kalanDk} dk · ${VAKIT_ADLARI_BUYUK[vakit]} VAKTİ ÇIKIYOR`;
    }
}

/**
 * Bildirim govdesi. Vakit adi ve kalan sure ALMAZ - ikisi de baslikta.
 * Seviye 3'un govdesi havuzdan gelir (bkz. ArkaplanMuhafizServisi); buradaki
 * seviye 3 metni yalnizca havuz bos oldugunda kullanilan YEDEKtir.
 */
export function bildirimGovdesiOlustur(seviye: MuhafizSeviye): string {
    switch (seviye) {
        case 1:
            return 'Vakit daralmaya başladı, fırsat varken kılabilirsiniz.';
        case 2:
            return 'Namazı sona bırakmayın; şimdi kılmak için vakit uygun.';
        case 3:
            return 'Şeytana uymayın, namazı kılın!';
        case 4:
            return 'Hemen secdeye kapanın — sonra kaza etmek zorunda kalırsınız.';
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest muhafizMetinYardimcisi`
Expected: PASS — 11 test

- [ ] **Step 5: Commit**

```bash
git add src/core/utils/muhafizMetinYardimcisi.ts src/core/utils/__tests__/muhafizMetinYardimcisi.test.ts
git commit -m "feat(muhafiz): saf metin modulu -- sure basliga tasindi

Baslik uretimi ArkaplanMuhafizServisi'nin dongusunden cikarilip saf
basligiOlustur() fonksiyonuna alindi (eskiden test edilemiyordu).

VAKIT_ADLARI_BUYUK sabit haritasi: 'İkindi'.toUpperCase() -> 'İKINDI'
(noktali İ kaybolur) tuzagi icin. toLocaleUpperCase('tr-TR') de
kullanilmadi -- Hermes'te Intl/ICU ortama bagli. Nobetci test eklendi."
```

---

### Task 2: `ArkaplanMuhafizServisi`'ni yeni modüle bağla (bildirim yüzeyi)

**Files:**
- Modify: `src/domain/services/ArkaplanMuhafizServisi.ts` (import; döngü ~245-318; planlama döngüsü ~321-337; `bildirimMesajiOlustur` ~405-435)
- Modify (test): `src/domain/services/__tests__/ArkaplanMuhafizServisi.test.ts` (satır 152, 190, 238, 240, 242, 246)

**Interfaces:**
- Consumes: Task 1'den `basligiOlustur`, `bildirimGovdesiOlustur`, `MuhafizSeviye`
- Produces: davranış değişikliği yok — yalnız bildirim `title`/`body` metinleri değişir. ID'ler, gruplama, kanallar, tetik zamanları **aynı kalır**.

> **Bağlam:** Bu testlerin hepsi `aksam` vakti üzerinden çalışır (mock'ta yalnız akşamın çıkışı gelecekte). Beklenen başlıklarda vakit adı bu yüzden **Akşam/AKŞAM**'dır. `'Akşam'.toUpperCase()` doğru sonuç verdiği için **bu testler harf tuzağını yakalamaz** — onu Task 1'deki İkindi nöbetçi testi koruyor.

- [ ] **Step 1: Önce testleri yeni formata çevir (kırmızı)**

Testler şu an eski başlıkları assert ediyor. TDD sırası: **önce testi yeni beklentiye çevir**, kırmızıya düşür, sonra uygula.

`src/domain/services/__tests__/ArkaplanMuhafizServisi.test.ts`:

Satır 152 (`Aynı dakikaya düşen bildirimler birleştirilmeli`, k=25, seviye 4):
```typescript
        expect(tekBildirim.content.title).toBe('🚨 25 dk · AKŞAM VAKTİ ÇIKIYOR');
```

Satır 190 (`Çakışan dakikada en yüksek seviye kazanmalı`, k=10, seviye 4):
```typescript
        expect(onDkBildirimleri[0].content.title).toBe('🚨 10 dk · AKŞAM VAKTİ ÇIKIYOR');
```

Satır 238/240/242 (`Farklı dakikalara düşen bildirimler ayrı planlanmalı`):
```typescript
        expect(dkToBildirim.get(25)!.content.title).toBe('⏰ 25 dk · Akşam vakti');
        expect(dkToBildirim.get(20)!.content.data.seviye).toBe(2);
        expect(dkToBildirim.get(20)!.content.title).toBe('⚠️ 20 dk · Akşam vakti daralıyor');
        expect(dkToBildirim.get(15)!.content.data.seviye).toBe(3);
        expect(dkToBildirim.get(15)!.content.title).toBe('🔥 15 dk · Akşam vakti kaçıyor');
```

Satır 246 (döngü, k ∈ {10,8,6,4,2}) — başlık artık **k'ya göre değişiyor**:
```typescript
        for (const k of [10, 8, 6, 4, 2]) {
            expect(dkToBildirim.get(k)!.content.data.seviye).toBe(4);
            expect(dkToBildirim.get(k)!.content.title).toBe(`🚨 ${k} dk · AKŞAM VAKTİ ÇIKIYOR`);
        }
```

- [ ] **Step 2: Testleri çalıştır, kırmızı olduğunu gör**

Run: `npx jest ArkaplanMuhafizServisi`
Expected: FAIL — 6 assertion. `Expected: "🚨 25 dk · AKŞAM VAKTİ ÇIKIYOR"` / `Received: "🚨 VAKİT ÇIKIYOR!"`

- [ ] **Step 3: Import ekle**

`src/domain/services/ArkaplanMuhafizServisi.ts` — mevcut `import type { VakitAdi } from '../../core/types';` satırının altına:

```typescript
import { basligiOlustur, bildirimGovdesiOlustur, type MuhafizSeviye } from '../../core/utils/muhafizMetinYardimcisi';
```

- [ ] **Step 4: `aktifBaslik`'i döngüden tamamen kaldır**

Döngüde (~245-274) `aktifBaslik` değişkeni ve 4 atamasını sil. Sonuç:

```typescript
        // 1 dakikaya kadar geri say
        for (let k = baslangicDk; k > 0; k--) {
            let aktifSeviye = 0;
            let aktifSiklik = 0;

            // Hangi seviye araligindayiz? (Kucukten buyuge kontrol et ki overwrite etsin)
            // Seviye 1
            if (k <= esikler.seviye1) {
                aktifSeviye = 1;
                aktifSiklik = esikler.seviye1Siklik;
            }
            // Seviye 2
            if (k <= esikler.seviye2) {
                aktifSeviye = 2;
                aktifSiklik = esikler.seviye2Siklik;
            }
            // Seviye 3
            if (k <= esikler.seviye3) {
                aktifSeviye = 3;
                aktifSiklik = esikler.seviye3Siklik;
            }
            // Seviye 4
            if (k <= esikler.seviye4) {
                aktifSeviye = 4;
                aktifSiklik = esikler.seviye4Siklik;
            }
```

`dakikaGruplari.set(...)` çağrısından `baslik` alanını çıkar (~308-312):

```typescript
                        dakikaGruplari.set(k, {
                            seviye: aktifSeviye,
                            dakika: k,
                        });
```

- [ ] **Step 5: Map tipinden `baslik`'i çıkar**

~230. satırdaki tanım:

```typescript
        const dakikaGruplari: Map<number, { seviye: number, dakika: number }> = new Map();
```

- [ ] **Step 6: Başlığı planlama döngüsünde üret**

~321-337 arasını şu hâle getir (`veri.dakika` zaten kalan dakikadır):

```typescript
        // Gruplanan bildirimleri planla
        for (const [kalanDk, veri] of dakikaGruplari) {
            const bildirimZamani = new Date(cikisSuresi - kalanDk * 60 * 1000);
            const seviye = veri.seviye as MuhafizSeviye;
            const baslik = basligiOlustur(vakit.vakit, seviye, veri.dakika);
            const mesaj = this.bildirimMesajiOlustur(seviye);
            // ID'ye dakikayi da ekleyelim ki uniqueness bozulmasin
            // Vakit tarihini kullan (yatsi icin onceki gun olabilir)
            const bildirimId = this.bildirimIdOlustur(vakit.vakit, veri.seviye, vakit.tarih) + BILDIRIM_SABITLERI.ONEKLEME.DAKIKA + kalanDk;

            await this.tekBildirimPlanla(
                bildirimId,
                baslik,
                mesaj,
                bildirimZamani,
                veri.seviye,
                vakit.vakit,
                vakit.tarih
            );
        }
```

- [ ] **Step 7: `bildirimMesajiOlustur`'u sadeleştir**

~405-435 arasındaki metodu tamamen şununla değiştir. Artık `vakit` ve `kalanDakika` **almıyor** — ikisi de başlıkta (kullanılmayan parametre = yeni lint warning; AGENTS.md yasaklıyor):

```typescript
    /**
     * Bildirim govdesi.
     * Vakit adi ve kalan sure ALMAZ -> ikisi de baslikta (bkz. basligiOlustur).
     * Seviye 3 govdesi mucadele havuzundan rastgele secilir; havuz bossa yedek metin.
     */
    private bildirimMesajiOlustur(seviye: MuhafizSeviye): string {
        if (seviye === 3) {
            const icerikler = SEYTANLA_MUCADELE_ICERIGI.filter(i => i.siddetSeviyesi === 3);
            if (icerikler.length > 0) {
                const rastgele = Math.floor(Math.random() * icerikler.length);
                return icerikler[rastgele].metin;
            }
        }
        return bildirimGovdesiOlustur(seviye);
    }
```

- [ ] **Step 8: Kullanılmayan kalıntıları temizle**

`vakitAdlari` haritası `bildirimMesajiOlustur` içinden kalktı. Dosyada başka kullanımı yoksa sil; `VakitAdi` importu hâlâ gerekiyorsa bırak.

Run: `npm run lint`
Expected: yeni **warning yok** (mevcut warning sayısı artmamalı).

- [ ] **Step 9: Testleri çalıştır — yeşile dön**

Run: `npx jest ArkaplanMuhafizServisi`
Expected: PASS — Step 1'de kırmızıya döndürdüğün 6 assertion dahil tüm suite yeşil.

> Gövde assertion'ı yok (doğrulandı) → `bildirimMesajiOlustur` değişikliği mevcut testleri kırmaz.

- [ ] **Step 10: Commit**

```bash
git add src/domain/services/ArkaplanMuhafizServisi.ts src/domain/services/__tests__/ArkaplanMuhafizServisi.test.ts
git commit -m "fix(muhafiz): bildirim basliginda kalan sureyi basa al

Eskiden baslik sabitti ('🚨 VAKİT ÇIKIYOR!') ve kalan sure govdenin
SONUNDAYDI -> Android daraltilmis bildirimde kirpiliyordu, kullanici
bildirimi acmak zorunda kaliyordu.

Ayrica baslik ve govde ayni seyi soyluyordu ('VAKİT ÇIKIYOR' iki kez);
sureyi disari iten asil sebep buydu. Govde artik basligi tekrarlamiyor
ve sondaki '(N dk kaldi)' kalkti (sure baslikta).

aktifBaslik degiskeni dongudan tamamen kalkti; baslik planlama
dongusunde saf basligiOlustur() ile uretiliyor.

6 mevcut test assertion'i yeni formata guncellendi."
```

---

### Task 3: `NamazMuhafiziServisi` (banner yüzeyi) — "siz" dili

**Files:**
- Modify: `src/domain/services/NamazMuhafiziServisi.ts` (satır ~172, ~178, ~213)

**Interfaces:**
- Consumes: yok (bu yüzey Task 1 modülünü kullanmaz — mesaj şekli farklı)
- Produces: banner metinleri; **süre gövdede kalır** (banner başlığı `AnaSayfa.tsx`'te sabit ve kırpılma yok)

> **Neden bu yüzey farklı:** Bildirimde süre başlığa taşındı çünkü orada kırpılma var. Banner'da başlık ayrı bir bileşen ve `numberOfLines` yok → sarıyor, kırpılmıyor. Süreyi oradan kaldırmak **bilgi kaybı** olurdu. Bu yüzeyde tek sorun "sen" dili.
>
> **Drift uyarısı:** Bu iki servis aynı mesaj mantığının kopyası. Bu turda ikisi **aynı PR'da** düzeltiliyor ki ton ve sözcük dağarcığı ayrışmasın (bu repoda "Kıldım" handler drift'i olarak yaşandı — `docs/repo-denetim-2026-06-06.md`).

- [ ] **Step 1: Mevcut testlerin geçtiğini doğrula (baseline)**

Run: `npx jest NamazMuhafiziServisi`
Expected: PASS. (Bu testler `stringContaining` kullanıyor ve tuttukları ifadeler — `'Namaz vaktinin bitmesine 45 dakika kaldı'`, `'Vakit daralıyor'`, `'VAKİT ÇIKIYOR'` — değişmeyecek. Değişiklikten sonra da geçmeleri **beklenir**; geçmezlerse metni fazla değiştirmişsindir.)

- [ ] **Step 2: "sen" dilini düzelt (3 metin)**

`src/domain/services/NamazMuhafiziServisi.ts` ~170-182:

```typescript
        if (kalanDk <= this.config.seviye4BaslangicDk) {
            aktifSeviye = 4;
            mesaj = `VAKİT ÇIKIYOR! Hemen secdeye kapanın! (${kalanDk} dk kaldı)`;
        } else if (kalanDk <= this.config.seviye3BaslangicDk) {
            aktifSeviye = 3;
            mesaj = this.getRandomIcerik(3);
        } else if (kalanDk <= this.config.seviye2BaslangicDk) {
            aktifSeviye = 2;
            mesaj = `Vakit daralıyor, namazı sona bırakmayın. (${kalanDk} dk kaldı)`;
        } else if (kalanDk <= this.config.seviye1BaslangicDk) {
            aktifSeviye = 1;
            mesaj = `Namaz vaktinin bitmesine ${kalanDk} dakika kaldı.`;
        }
```

~213'teki yedek metin:

```typescript
        if (uygunIcerikler.length === 0) return "Şeytana uymayın, namazı kılın.";
```

- [ ] **Step 3: Testleri çalıştır**

Run: `npx jest NamazMuhafiziServisi`
Expected: PASS — hiçbir test kırılmamalı.

- [ ] **Step 4: Doğrulama kapısı**

Run: `npm run verify`
Expected: typecheck + lint + test **üçü de** geçer. Lint'te **yeni warning yok**.

- [ ] **Step 5: Commit**

```bash
git add src/domain/services/NamazMuhafiziServisi.ts
git commit -m "fix(muhafiz): banner metinlerini kibar 'siz' diline cevir

AGENTS.md zorunlu kurali: kullaniciya gorunen TUM metin kibar 'siz'
dilinde. Uc metin 'sen' dilindeydi:
  'Hemen secdeye kapan!'      -> 'Hemen secdeye kapanin!'
  'namazi sona birakma'       -> 'namazi sona birakmayin'
  'Şeytana uyma, namazini kil'-> 'Şeytana uymayin, namazi kilin'

Sertlik korundu. Banner'da kalan sure GOVDEDE kaliyor (bildirimden
farkli olarak): banner basligi ayri bir bilesen ve kirpilma yok ->
sureyi kaldirmak bilgi kaybi olurdu.

Bildirim yuzeyiyle ayni PR'da duzeltildi ki ton ayrismasin."
```

---

## Kapsam dışı (bu planda YOK — bilinçli)

| Konu | Nereye ait |
|---|---|
| Seviye 3 içerik havuzu (`SeytanlaMucadeleIcerigi.ts`) | İçerik işi — 2. araştırma turu bekliyor |
| `siddetSeviyesi` 1 ve 2 ölü verisi (t1/t2/u1/u2 hiç gösterilmiyor) | İçerik işi |
| Buhârî Ezân 34'ün yanlış vakitte çıkması | İçerik işi |
| Mevcut meal metinlerinin telif riski (FSEK m.6/1) | İçerik işi — karar: meal gömülmeyecek |
| TTS ("son 3 dakika" sesli) | Ayrı iş — `expo-speech` + cihaz doğrulaması |
| `AnaSayfa.tsx` banner'ının hardcoded renkleri | Ayrı iş — görsel doğrulama ister |
| `MuhafizAyarlariSayfasi.tsx:43` "Şeytanla Mücadele" adı | İçerik işi — bildirim başlığıyla kopuyor, kabul edildi |

## Cihaz doğrulaması (birleştirmeden önce önerilir)

Metin değişikliği olduğu için unit test yeterli değil:
1. Muhafızı aç, bir vaktin çıkışına ~30 dk kala uygulamayı kapat.
2. Bildirim düştüğünde **daraltılmış** hâlde bak: süre görünüyor mu, açmadan okunabiliyor mu?
3. **İkindi** vaktinde seviye 4'ü gör: `İKİNDİ` (noktalı) yazıyor mu, `İKINDI` değil?
