import {
  GIRIS_VARSAYILAN_YOGUNLUK,
  GIRIS_ZAMANLAMA_TABLOSU,
  VAKIT_PENCERE_SINIFI,
  girisTablosuOlanYogunlukMu,
  girisZamanlamasiniSec,
  type PencereSinifi,
  type PresetYogunlugu,
  type ZamanlamaSeviyeleri,
} from '../girisZamanlamasi';
import { esikSiralamasiGecerliMi } from '../aktifSeviye';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI } from '../matrisTipleri';

const SINIFLAR: PencereSinifi[] = ['kisa', 'orta', 'uzun'];
const YOGUNLUKLAR: PresetYogunlugu[] = ['hafif', 'normal', 'yogun'];

/** Ekrandaki stepper adimi (`pencereTanimi.ESIK_ADIM_DK`). Cekirdek ona import etmez. */
const ESIK_ADIMI = 5;

/**
 * Her sinifin EN KISA penceresi (dk, Istanbul / adhan Turkey; yaz-kis taranarak
 * olculdu): aksam 87, imsak 92 → kisa 87 · ogle 138, ikindi 141 → orta 138 ·
 * yatsi 286 → uzun 286.
 *
 * Bir adim `esikDk >= pencere` ise O GUN HIC CALISMAZ (motor `olcuDk >= pencere`
 * kapisini kapatir). Hazir yogunlugun kendi verdigi degerin olu dogmasi
 * "tek dokunusla ayarlayin" vaadini bosa cikarir → tablolar bu tavanlarin
 * ALTINDA kalmak zorunda.
 */
const EN_KISA_PENCERE: Record<PencereSinifi, number> = { kisa: 87, orta: 138, uzun: 286 };

const adimlar = (z: ZamanlamaSeviyeleri) => SEVIYE_KADEMELERI.map((k) => z[k]);

describe('giris zamanlama tablolari', () => {
  it('her vaktin bir pencere sinifi vardir', () => {
    for (const vakit of MUHAFIZ_VAKITLERI) {
      expect(SINIFLAR).toContain(VAKIT_PENCERE_SINIFI[vakit]);
    }
  });

  it('her sinif x yogunluk bilesimi tanimlidir', () => {
    for (const sinif of SINIFLAR) {
      for (const y of YOGUNLUKLAR) {
        expect(GIRIS_ZAMANLAMA_TABLOSU[sinif][y]).toBeDefined();
      }
    }
  });

  describe.each(SINIFLAR)('%s pencere', (sinif) => {
    describe.each(YOGUNLUKLAR)('%s', (yogunluk) => {
      const tablo = GIRIS_ZAMANLAMA_TABLOSU[sinif][yogunluk];

      /**
       * ASIL NOBETCI: giris yonunde kapsama `olcuDk >= esikDk` ve EN BUYUK esik
       * kazanir. Sira azalan olursa eskalasyon TERSINE doner — duzeltilen hatanin
       * ta kendisi.
       */
      it('esikler kesin ARTAN (nazik en kucuk)', () => {
        expect(esikSiralamasiGecerliMi(adimlar(tablo), 'girisindenItibaren')).toBe(true);
      });

      it('esikler stepper adiminin (5 dk) kati ve >= 1', () => {
        for (const a of adimlar(tablo)) {
          expect(a.esikDk).toBeGreaterThanOrEqual(1);
          expect(a.esikDk % ESIK_ADIMI).toBe(0);
        }
      });

      it('en buyuk esik sinifin EN KISA penceresine sigar (adim olu dogmaz)', () => {
        const enBuyuk = Math.max(...adimlar(tablo).map((a) => a.esikDk));
        expect(enBuyuk).toBeLessThan(EN_KISA_PENCERE[sinif]);
      });

      it('tekrar araligi pozitif', () => {
        for (const a of adimlar(tablo)) {
          if (a.siklik !== 'birkez') expect(a.siklik.herDk).toBeGreaterThan(0);
        }
      });
    });
  });

  /**
   * Preset kimligi: 'hafif' KASTEN sessiz ve seyrek, 'yogun' en erken baslar.
   * (Yon degisimi preset'in karakterini korumali — `muhafizSlice` HAFIF gerekcesi.)
   */
  it('yogunluk arttikca ilk uyari ERKENE gelir', () => {
    for (const sinif of SINIFLAR) {
      const t = GIRIS_ZAMANLAMA_TABLOSU[sinif];
      expect(t.yogun.nazik.esikDk).toBeLessThanOrEqual(t.normal.nazik.esikDk);
      expect(t.normal.nazik.esikDk).toBeLessThanOrEqual(t.hafif.nazik.esikDk);
    }
  });
});

describe('girisZamanlamasiniSec', () => {
  it('vaktin sinifina gore tablo doner', () => {
    expect(girisZamanlamasiniSec('yatsi', 'normal')).toBe(GIRIS_ZAMANLAMA_TABLOSU.uzun.normal);
    expect(girisZamanlamasiniSec('aksam', 'yogun')).toBe(GIRIS_ZAMANLAMA_TABLOSU.kisa.yogun);
    expect(girisZamanlamasiniSec('ogle', 'hafif')).toBe(GIRIS_ZAMANLAMA_TABLOSU.orta.hafif);
  });

  /**
   * 'ozel' yogunlukta preset tablosu yoktur. "Elle kurulmus cikis esiklerini
   * yansitmak" (pencere - esik) REDDEDILDI: pencere gune bagli, ekranda hic
   * bilinmiyor olabilir ve yansitma kullanicinin niyetini korumaz. Veri kaybi da
   * yok — ayrilan yonun zamanlamasi `yonYedegi`'nde durur.
   */
  it.each([['ozel'], [undefined], [null], ['bilinmeyen'], [42]])(
    'bilinmeyen yogunlukta (%p) varsayilana duser',
    (deger) => {
      expect(girisZamanlamasiniSec('yatsi', deger)).toBe(
        GIRIS_ZAMANLAMA_TABLOSU.uzun[GIRIS_VARSAYILAN_YOGUNLUK]
      );
    }
  );

  it('girisTablosuOlanYogunlukMu yalniz hazir yogunluklara true der', () => {
    expect(girisTablosuOlanYogunlukMu('normal')).toBe(true);
    expect(girisTablosuOlanYogunlukMu('ozel')).toBe(false);
    expect(girisTablosuOlanYogunlukMu(undefined)).toBe(false);
  });
});
