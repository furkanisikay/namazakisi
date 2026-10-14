/**
 * Android TV panosu (issue #286) — telefon ↔ TV paritesi, JS tarafı.
 *
 * TV vakitleri cihazda adhan2 (Kotlin) ile hesaplar; telefonun yolu adhan JS +
 * `CalculationMethod.Turkey()`. İki taraf AYNI fikstürü kabul etmek zorundadır:
 *  - Kotlin: `tv/app/src/test/.../VakitHesabiTest.kt`
 *  - JS (bu dosya): fikstür telefonun GERÇEK servis yolundan yeniden hesaplanır.
 * Fikstür üreticisi: `node scripts/tv/tv-verisi-uret.js`.
 */
import * as fs from 'fs';
import * as path from 'path';
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import { TURKIYE_ILLERI_OFFLINE } from '../TurkiyeKonumServisi';
import { mekruhVakitKontrolEt } from '../KazaHesaplayiciServisi';
import { KAZA_SABITLERI } from '../../../core/constants/UygulamaSabitleri';

const KOK = path.resolve(__dirname, '../../../..');

interface Pencere {
  tur: string;
  baslangic: number;
  bitis: number;
}
interface Ornek {
  plaka: string;
  il: string;
  lat: number;
  lng: number;
  tarih: string;
  vakitler: Record<'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi', number>;
  kerahat: Pencere[];
}
interface Fikstur {
  kerahat: { surukDk: number; istivaDk: number; gurubDk: number };
  ornekler: Ornek[];
}

const fikstur: Fikstur = JSON.parse(
  fs.readFileSync(path.join(KOK, 'tv/app/src/test/resources/vakit-fiksturu.json'), 'utf8'),
);

const yerelTarih = (ms: number): string => {
  const d = new Date(ms);
  const iki = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${iki(d.getMonth() + 1)}-${iki(d.getDate())}`;
};

describe('Android TV panosu — telefonla vakit paritesi', () => {
  it('fikstür telefonun hesap yolundan (NamazVaktiHesaplayiciServisi) birebir çıkar', () => {
    const servis = NamazVaktiHesaplayiciServisi.getInstance();
    expect(fikstur.ornekler.length).toBeGreaterThanOrEqual(30);
    for (const o of fikstur.ornekler) {
      servis.yapilandir({ latitude: o.lat, longitude: o.lng });
      const [y, a, g] = o.tarih.split('-').map(Number);
      const v = servis.getGunlukVakitler(new Date(y, a - 1, g));
      expect(v).not.toBeNull();
      expect({
        imsak: v!.imsak.getTime(),
        gunes: v!.gunes.getTime(),
        ogle: v!.ogle.getTime(),
        ikindi: v!.ikindi.getTime(),
        aksam: v!.aksam.getTime(),
        yatsi: v!.yatsi.getTime(),
      }).toEqual(o.vakitler);
    }
  });

  it('kerahat sabitleri kaza ekranıyla aynı', () => {
    expect(fikstur.kerahat.surukDk).toBe(KAZA_SABITLERI.MEKRUH_TOLERANS_DK);
    expect(fikstur.kerahat.gurubDk).toBe(KAZA_SABITLERI.MEKRUH_TOLERANS_DK);
    expect(fikstur.kerahat.istivaDk).toBe(KAZA_SABITLERI.ISTIVA_TOLERANS_DK);
  });

  describe('kerahat pencereleri mekruhVakitKontrolEt ile aynı sınırda', () => {
    afterEach(() => jest.useRealTimers());

    it('başlangıç ve bitiş dahil, bir dakika dışı hariç', () => {
      let denetlenen = 0;
      for (const o of fikstur.ornekler) {
        for (const p of o.kerahat) {
          // Telefon fonksiyonu "şimdi"nin YEREL gününü hesaplar → yalnız yerel günü
          // fikstür günüyle çakışan pencereler karşılaştırılabilir (TZ'den bağımsız test).
          if (yerelTarih(p.baslangic) !== o.tarih || yerelTarih(p.bitis + 60_000) !== o.tarih) continue;
          const sor = (ms: number) => {
            jest.useFakeTimers({ now: ms });
            return mekruhVakitKontrolEt(o.lat, o.lng).mekruhMu;
          };
          expect(sor(p.baslangic)).toBe(true);
          expect(sor(p.bitis)).toBe(true);
          expect(sor(p.bitis + 60_000)).toBe(false);
          denetlenen++;
        }
      }
      expect(denetlenen).toBeGreaterThan(0);
    });
  });

  it('TV il listesi (assets/iller.json) telefonun çevrimdışı listesiyle aynı', () => {
    const tvIller = JSON.parse(
      fs.readFileSync(path.join(KOK, 'tv/app/src/main/assets/iller.json'), 'utf8'),
    );
    expect(tvIller).toEqual(
      TURKIYE_ILLERI_OFFLINE.map((i) => ({ plaka: i.plakaKodu, ad: i.ad, lat: i.lat, lng: i.lng })),
    );
  });
});
