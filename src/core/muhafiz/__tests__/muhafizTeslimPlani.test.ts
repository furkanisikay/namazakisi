/**
 * Muhafız teslim planı — YARININ İMSAĞI (issue #74, Fable M2).
 *
 * Akşam uygulamayı açan kişinin yarınki sabah hatırlatması (gerçek alarm dahil) eskiden
 * ancak gece yarısından sonraki ilk turda kurulurdu; OEM 15 dk görevini öldürürse hiç
 * kurulmazdı. Android'de plan artık yarının imsağını da (TÜM adımlarıyla) içerir.
 */
import {
    muhafizTeslimPlaniOlustur,
    muhafizVakitleriniHesapla,
    yarininImsagiKipi,
    yarininImsagiPlanlanirMi,
    butceArtigiMi,
} from '../muhafizTeslimPlani';
import { ISTANBUL, matrisKur } from '../../bildirim/__tests__/defterFikstur';

const isoGun = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Akşam 20:00 (yerel): bugünün imsağı geçmiş, yarınınki ~9 saat sonra.
const AKSAM = new Date(2026, 9, 13, 20, 0, 0);
const BUGUN = '2026-10-13';
const YARIN = '2026-10-14';

describe('muhafizVakitleriniHesapla — yarının imsağı', () => {
    it('seçenek yoksa liste ESKİSİYLE birebir (vakit sayacı ufku değişmez)', () => {
        const eski = muhafizVakitleriniHesapla(ISTANBUL, AKSAM);
        expect(eski.map((v) => `${v.tarih}_${v.vakit}`)).toEqual([
            `${BUGUN}_imsak`,
            `${BUGUN}_ogle`,
            `${BUGUN}_ikindi`,
            `${BUGUN}_aksam`,
            `${BUGUN}_yatsi`,
        ]);
        expect(muhafizVakitleriniHesapla(ISTANBUL, AKSAM, { yarininImsagi: false })).toEqual(eski);
    });

    it('açıkken yarının imsağı YARININ tarihiyle SONA eklenir; liste kronolojik kalır', () => {
        const liste = muhafizVakitleriniHesapla(ISTANBUL, AKSAM, { yarininImsagi: true });
        const son = liste[liste.length - 1];
        expect(son.vakit).toBe('imsak');
        expect(son.tarih).toBe(YARIN);
        expect(son.yarininImsagi).toBe(true);
        // İşaret YALNIZ eklenen kayıtta (bugünün planı işaretsiz kalır).
        expect(liste.slice(0, -1).some((v) => v.yarininImsagi)).toBe(false);
        expect(isoGun(son.giris)).toBe(YARIN);
        // Yarının imsağı bugünün yatsısının çıkışında (fajr) girer.
        expect(son.giris.getTime()).toBe(liste[liste.length - 2].cikis.getTime());
        expect(son.cikis.getTime()).toBeGreaterThan(son.giris.getTime());
        for (let i = 1; i < liste.length; i++) {
            expect(liste[i].giris.getTime()).toBeGreaterThanOrEqual(liste[i - 1].giris.getTime());
        }
    });

    it('gece yarısından sonra da (dünün yatsısı sürerken) bugünün VE yarının imsağı ayrı kalır', () => {
        const gece = new Date(2026, 9, 14, 1, 0, 0);
        const liste = muhafizVakitleriniHesapla(ISTANBUL, gece, { yarininImsagi: true });
        expect(liste.map((v) => `${v.tarih}_${v.vakit}`)).toEqual([
            `${BUGUN}_yatsi`,
            `${YARIN}_imsak`,
            `${YARIN}_ogle`,
            `${YARIN}_ikindi`,
            `${YARIN}_aksam`,
            `${YARIN}_yatsi`,
            '2026-10-15_imsak',
        ]);
    });
});

describe('muhafizTeslimPlaniOlustur — yarının imsağı', () => {
    const plan = (kilinan: Record<string, string[]> = {}, ozelGundeMi?: (t: string) => boolean) =>
        muhafizTeslimPlaniOlustur({
            matris: matrisKur(),
            vakitler: muhafizVakitleriniHesapla(ISTANBUL, AKSAM, { yarininImsagi: true }),
            simdi: AKSAM,
            kilindiMi: (t, v) => (kilinan[t] ?? []).includes(v),
            ozelGundeMi,
        });

    it('yarının imsağı TÜM adımlarıyla planlanır; kimlik yarının tarihini taşır', () => {
        const yarinki = plan().filter((a) => a.vakit.tarih === YARIN);
        expect(yarinki.length).toBeGreaterThan(0);
        expect(yarinki.every((a) => a.id.startsWith(`muhafiz_${YARIN}_vakit_imsak_`))).toBe(true);
        // Adım kesilmez: matristeki her açık adımın ilk tetiği planda.
        const seviyeler = new Set(yarinki.map((a) => a.uyari.seviye));
        expect(seviyeler.size).toBe(matrisKur().imsak.seviyeler.length);
    });

    it('kılınmışlık ve özel gün kapıları YARININ tarihiyle uygulanır', () => {
        const hepsi = plan();
        // Bugünün imsağını kılmak yarınkine dokunmaz.
        expect(plan({ [BUGUN]: ['imsak'] }).filter((a) => a.vakit.tarih === YARIN)).toEqual(
            hepsi.filter((a) => a.vakit.tarih === YARIN)
        );
        // Yarın özel gün → yarının imsağı planlanmaz; bugününkiler aynen.
        const ozel = plan({}, (t) => t === YARIN);
        expect(ozel.some((a) => a.vakit.tarih === YARIN)).toBe(false);
        expect(ozel.length).toBe(hepsi.filter((a) => a.vakit.tarih !== YARIN).length);
    });
});

describe('yarininImsagiKipi — tek kaynak', () => {
    it('iki platformda da planlanır; Android tam hakla, iOS BÜTÇE ARTIĞI olarak', () => {
        expect(yarininImsagiPlanlanirMi('android')).toBe(true);
        expect(yarininImsagiPlanlanirMi('ios')).toBe(true);
        expect(yarininImsagiKipi('android')).toBe('tam');
        expect(yarininImsagiKipi('ios')).toBe('butceArtigi');
    });

    it('bütçe artığı yalnız iOS + yalnız yarının imsağı', () => {
        const liste = muhafizVakitleriniHesapla(ISTANBUL, AKSAM, { yarininImsagi: true });
        const yarin = liste[liste.length - 1];
        expect(butceArtigiMi(yarin, 'ios')).toBe(true);
        expect(butceArtigiMi(yarin, 'android')).toBe(false);
        expect(liste.slice(0, -1).some((v) => butceArtigiMi(v, 'ios'))).toBe(false);
    });
});
