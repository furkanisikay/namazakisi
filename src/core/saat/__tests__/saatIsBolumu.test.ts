/**
 * Saat iş bölümünün TELEFON tarafı (saat W3) — plan üreticilerindeki iki kapı:
 *  - uyandırma "saatte": sabahın gerçek alarmı ve teheccüd uyandırması telefonda YEDEK,
 *    `SAAT_YEDEK_GECIKMESI_DK` sonra; kimlik DEĞİŞMEZ (saat kapatınca bununla iptal eder);
 *  - anons "yalnız saatte": telefon TTS planlamaz (`sesliAnons` üreticide kapanır).
 * Bildirim defteri aynı üreticileri koşar → SAYI değişmez (yalnız zaman kayar).
 */
import { muhafizVakitleriniHesapla, vakitTeslimAdaylari, anonsAlarmiKurarMi } from '../../muhafiz/muhafizTeslimPlani';
import { muhafizMatrisiniCoz } from '../../muhafiz/motorAdaptoru';
import type { MuhafizMatrisi } from '../../muhafiz/matrisTipleri';
import { nafilePlaniOlustur } from '../../nafile/nafilePlani';
import { VARSAYILAN_NAFILE_AYARLARI, type NafileAyarlari } from '../../nafile/nafileTipleri';
import { bildirimDefteriOlustur } from '../../bildirim/bildirimDefteri';
import { SAAT_YEDEK_GECIKMESI_DK, VARSAYILAN_SAAT_AYARLARI, type SaatAyarlari } from '../saatAyarlari';
import { tarihiISOFormatinaCevir } from '../../utils/TarihYardimcisi';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const SAATTE: SaatAyarlari = { uyandirmaYeri: 'saat', anonsYeri: 'otomatik' };
const DK = 60_000;

const matris = (): MuhafizMatrisi => {
    const m = muhafizMatrisiniCoz({
        esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
        sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
    });
    for (const v of ['imsak', 'ogle'] as const) {
        m[v] = {
            ...m[v],
            seviyeler: m[v].seviyeler.map((s, i) =>
                i === 1
                    ? { ...s, kanallar: { ...s.kanallar, alarm: true } }
                    : i === 2
                      ? { ...s, kanallar: { bildirim: true, sesli: true }, anonsMetni: '{vakit} için {süre} dakika {yön}.' }
                      : s
            ),
        };
    }
    return m;
};

/** Bugünün imsağından 2 sa önce (plan imsağın tamamını kapsar). */
const simdi = (): Date => {
    const taslak = new Date();
    const imsak = muhafizVakitleriniHesapla(ISTANBUL, taslak).find((v) => v.vakit === 'imsak')!;
    return new Date(imsak.giris.getTime() - 2 * 60 * DK);
};

describe('muhafız üreticisi — saat iş bölümü', () => {
    const an = simdi();
    const vakitler = muhafizVakitleriniHesapla(ISTANBUL, an);
    const imsak = vakitler.find((v) => v.vakit === 'imsak')!;
    const ogle = vakitler.find((v) => v.vakit === 'ogle')!;

    it('ayar verilmezse ya da varsayılansa plan BİREBİR aynı (kayıt-oynat korunur)', () => {
        const ham = vakitTeslimAdaylari(matris(), imsak, an);
        expect(vakitTeslimAdaylari(matris(), imsak, an, VARSAYILAN_SAAT_AYARLARI)).toEqual(ham);
    });

    it('uyandırma saatte: YALNIZ imsak alarmı +3 dk kayar, kimlik aynı kalır; öğle alarmı kaymaz', () => {
        const ham = vakitTeslimAdaylari(matris(), imsak, an);
        const kayik = vakitTeslimAdaylari(matris(), imsak, an, SAATTE);
        expect(kayik.map((a) => a.id)).toEqual(ham.map((a) => a.id));
        const alarmlar = ham.filter((a) => a.uyari.alarm === true);
        expect(alarmlar.length).toBe(1);
        for (const [i, a] of ham.entries()) {
            const fark = kayik[i].zaman.getTime() - a.zaman.getTime();
            expect(fark).toBe(a.uyari.alarm === true ? SAAT_YEDEK_GECIKMESI_DK * DK : 0);
        }
        const ogleHam = vakitTeslimAdaylari(matris(), ogle, an);
        expect(vakitTeslimAdaylari(matris(), ogle, an, SAATTE)).toEqual(ogleHam);
    });

    it('anons yalnız saatte: telefon TTS kurmaz; otomatik/telefon seçiminde kurar', () => {
        const kurulan = (saat?: SaatAyarlari) => vakitTeslimAdaylari(matris(), ogle, an, saat).filter(anonsAlarmiKurarMi).length;
        expect(kurulan()).toBeGreaterThan(0);
        expect(kurulan({ uyandirmaYeri: 'telefon', anonsYeri: 'telefon' })).toBe(kurulan());
        expect(kurulan({ uyandirmaYeri: 'telefon', anonsYeri: 'saat' })).toBe(0);
    });

    it('bildirim defteri: saat seçimi SAYIYI değiştirmez (parite — yedek yine sayılır)', () => {
        const g = {
            platform: 'android' as const,
            simdi: an,
            koordinat: ISTANBUL,
            muhafiz: { aktif: true, matris: matris() },
            widget: false,
        };
        const taban = bildirimDefteriOlustur(g);
        const saatte = bildirimDefteriOlustur({ ...g, saat: SAATTE });
        expect(saatte.length).toBe(taban.length);
        // "Yalnız saatte" anons: telefonun anons alarmları defterden düşer (telefon kurmuyor).
        const sessiz = bildirimDefteriOlustur({ ...g, saat: { uyandirmaYeri: 'telefon', anonsYeri: 'saat' } });
        expect(sessiz.filter((k) => k.kaynak === 'anons')).toHaveLength(0);
        expect(taban.filter((k) => k.kaynak === 'anons').length).toBeGreaterThan(0);
    });
});

describe('nafile üreticisi — teheccüd uyandırması yedeği', () => {
    const ayar: NafileAyarlari = {
        ...VARSAYILAN_NAFILE_AYARLARI,
        teheccud: { ...VARSAYILAN_NAFILE_AYARLARI.teheccud, aktif: true, uyandirma: true },
    };
    const an = new Date();
    const bugun = tarihiISOFormatinaCevir(an);

    it('saatte: teheccüd tetikleri +3 dk (kimlik aynı); varsayılanda birebir', () => {
        const ham = nafilePlaniOlustur(ISTANBUL, ayar, an, bugun);
        expect(ham.length).toBeGreaterThan(0);
        expect(nafilePlaniOlustur(ISTANBUL, ayar, an, bugun, () => false, { gunduzGunSayisi: 3, teheccudGeceSayisi: 7, saat: VARSAYILAN_SAAT_AYARLARI })).toEqual(ham);
        const kayik = nafilePlaniOlustur(ISTANBUL, ayar, an, bugun, () => false, {
            gunduzGunSayisi: 3,
            teheccudGeceSayisi: 7,
            saat: SAATTE,
        });
        expect(kayik.map((p) => p.id)).toEqual(ham.map((p) => p.id));
        for (const [i, p] of ham.entries()) {
            expect(kayik[i].zaman.getTime() - p.zaman.getTime()).toBe(SAAT_YEDEK_GECIKMESI_DK * DK);
            expect(kayik[i].zaman.getTime()).toBeLessThan(p.son.getTime());
        }
    });
});
