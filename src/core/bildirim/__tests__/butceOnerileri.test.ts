/**
 * Bildirim sınırı rehberi — öneri motoru (issue #298). Fable kararları:
 * sıra (seyrek → tek kez → nafile günü gününe → kapat), sert/acil dokunulmaz,
 * her öneri aynı defterle ölçülür, ekleme anında simülasyon.
 */
import {
    adimlariKapat,
    butceOnerileriOlustur,
    degisiklikSimuleEt,
    nazikTekrariKaldir,
    ONERI_TEKRAR_UST_DK,
    tekrarlariSeyreklestir,
} from '../butceOnerileri';
import { defterOzetiHesapla, type DefterGirdisi } from '../bildirimDefteri';
import { TEKRAR_MAX_DK } from '../../../presentation/components/hatirlatma/pencereTanimi';
import { MUHAFIZ_VAKITLERI, type MuhafizMatrisi } from '../../muhafiz/matrisTipleri';
import { adimKapaliMi } from '../../muhafiz/kanalKumesi';
import { VARSAYILAN_NAFILE_AYARLARI, type NafileAyarlari } from '../../nafile/nafileTipleri';
import { nafileAyarlariniNormalize } from '../../../data/local/LocalNafileServisi';
import { adimEkle } from '../../muhafiz/adimDuzenleme';
import { adim, ISTANBUL, matrisKur } from './defterFikstur';

const SIMDI = new Date(2026, 9, 13, 9, 0, 0);

// Eski (#273 öncesi) kayıt biçimi: göç yolu da kapsamda kalsın.
const NAFILE: NafileAyarlari = nafileAyarlariniNormalize({
    ...VARSAYILAN_NAFILE_AYARLARI,
    hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 5 }, evvabin: { aktif: true, ofsetDk: 15 } },
    teheccud: { aktif: true, hedef: 'sonUcteBir', imsaktanOnceDk: 60, uyandirma: true },
});

const girdi = (ek: Partial<DefterGirdisi> = {}): DefterGirdisi => ({
    platform: 'ios',
    simdi: SIMDI,
    koordinat: ISTANBUL,
    muhafiz: { aktif: true, matris: matrisKur() },
    nafile: NAFILE,
    vakitBildirimi: { imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true },
    cuma: { aktif: true, oncedenDk: 60, siklik: 'birkez' },
    ...ek,
});

/** Sert/acil adımların imzası — hiçbir öneri bunları değiştirmemeli. */
const sertAcilImzasi = (m: MuhafizMatrisi) =>
    MUHAFIZ_VAKITLERI.map((v) =>
        m[v].seviyeler.filter((s) => s.kademe === 'sert' || s.kademe === 'acil').map((s) => JSON.stringify(s))
    );

describe('öneri motoru', () => {
    it('tekrar tavanı ekrandaki stepper tavanıyla AYNI', () => {
        expect(ONERI_TEKRAR_UST_DK).toBe(TEKRAR_MAX_DK);
    });

    it('SIRA anlam kaybı artan: seyrek → tek kez → nafile günü gününe → kapat', () => {
        const oneriler = butceOnerileriOlustur(girdi());
        expect(oneriler.map((o) => o.tur)).toEqual(['seyreklestir', 'tekKez', 'nafileGunuGunune', 'adimKapat']);
    });

    it('her öneri AYNI defterle ölçülür (öncesi/sonrası = defter özeti)', () => {
        const g = girdi();
        const once = defterOzetiHesapla(g).toplam;
        for (const o of butceOnerileriOlustur(g)) {
            expect(o.oncekiToplam).toBe(once);
            expect(o.sonrakiToplam).toBe(defterOzetiHesapla(o.girdi).toplam);
            expect(o.sonrakiToplam).toBeLessThan(once);
            expect(o.sinirAltinaIner).toBe(defterOzetiHesapla(o.girdi).gelmeyecek === 0);
        }
    });

    it('SERT ve ACİL tona ASLA dokunulmaz', () => {
        const g = girdi();
        const asil = sertAcilImzasi(g.muhafiz!.matris);
        for (const o of butceOnerileriOlustur(g)) {
            if (o.girdi.muhafiz) expect(sertAcilImzasi(o.girdi.muhafiz.matris)).toEqual(asil);
        }
    });

    it('acil kısıtıyla SERT konuşan acil adım da korunur (etkin ton)', () => {
        const m = matrisKur(() => ({
            seviyeler: [adim({ kademe: 'acil', esikDk: 40, siklik: { herDk: 5 } }), adim({ kademe: 'nazik', esikDk: 10, siklik: { herDk: 5 } })],
        }));
        const yeni = tekrarlariSeyreklestir(m, ['nazik', 'uyari']);
        expect(yeni.ogle.seviyeler[0]).toBe(m.ogle.seviyeler[0]);
        expect(yeni.ogle.seviyeler[1].siklik).toEqual({ herDk: 10 });
    });

    it('nazikten BAŞLAR: yalnız nazikle sınırın altına iniliyorsa uyarıya dokunulmaz', () => {
        // Android, havuz büyük: nazik seyreltmesi tek başına yeterli
        const g = girdi({ platform: 'android' });
        const seyrek = butceOnerileriOlustur(g).find((o) => o.tur === 'seyreklestir')!;
        const m = seyrek.girdi.muhafiz!.matris;
        expect(m.ogle.seviyeler[0].siklik).toEqual({ herDk: 10 }); // nazik 5 → 10
        expect(m.ogle.seviyeler[1].siklik).toEqual({ herDk: 5 }); // uyarı aynen
    });

    it('yetmiyorsa uyarı tonu da seyreltilir (iOS, aşım)', () => {
        const seyrek = butceOnerileriOlustur(girdi()).find((o) => o.tur === 'seyreklestir')!;
        expect(seyrek.girdi.muhafiz!.matris.ogle.seviyeler[1].siklik).toEqual({ herDk: 10 });
    });

    it('tavan 30 dk: 30 dk\'lık tekrar seyreltilemez', () => {
        const m = matrisKur(() => ({ seviyeler: [adim({ kademe: 'nazik', esikDk: 60, siklik: { herDk: 30 } })] }));
        expect(tekrarlariSeyreklestir(m, ['nazik'])).toBe(m);
    });

    it('tek kez: yalnız NAZİK adımların tekrarı kalkar', () => {
        const yeni = nazikTekrariKaldir(matrisKur());
        expect(yeni.ogle.seviyeler[0].siklik).toBe('birkez');
        expect(yeni.ogle.seviyeler[1].siklik).toEqual({ herDk: 5 });
    });

    it('kapat: vaktin SON açık adımı asla kapanmaz', () => {
        const m = matrisKur(() => ({ seviyeler: [adim({ kademe: 'nazik', esikDk: 30 }), adim({ kademe: 'uyari', esikDk: 10 })] }));
        const yeni = adimlariKapat(m, ['nazik', 'uyari']);
        for (const v of MUHAFIZ_VAKITLERI) {
            expect(yeni[v].seviyeler.filter((s) => !adimKapaliMi(s.kanallar))).toHaveLength(1);
        }
    });

    it('kapat: kapatılan adım geri açılabilir (oncekiKanallar hafızası)', () => {
        const yeni = adimlariKapat(matrisKur(), ['nazik']);
        expect(adimKapaliMi(yeni.ogle.seviyeler[0].kanallar)).toBe(true);
        expect(yeni.ogle.seviyeler[0].oncekiKanallar).toEqual({ bildirim: true });
    });

    it('nafile önerisi YALNIZ iOS\'ta ve nafile açıkken', () => {
        expect(butceOnerileriOlustur(girdi({ platform: 'android' })).some((o) => o.tur === 'nafileGunuGunune')).toBe(false);
        expect(butceOnerileriOlustur(girdi({ nafile: VARSAYILAN_NAFILE_AYARLARI })).some((o) => o.tur === 'nafileGunuGunune')).toBe(false);
        expect(
            butceOnerileriOlustur(girdi({ nafile: { ...NAFILE, gunuGununeKur: true } })).some((o) => o.tur === 'nafileGunuGunune')
        ).toBe(false);
    });

    it('muhafız kapalıysa muhafız önerisi yok', () => {
        const oneriler = butceOnerileriOlustur(girdi({ muhafiz: { aktif: false, matris: matrisKur() } }));
        expect(oneriler.map((o) => o.tur)).toEqual(['nafileGunuGunune']);
    });

    it('önerileri ART ARDA uygulamak sınırın altına indirir', () => {
        let g = girdi();
        for (let i = 0; i < 6 && defterOzetiHesapla(g).gelmeyecek > 0; i++) {
            const [ilk] = butceOnerileriOlustur(g);
            if (!ilk) break;
            g = ilk.girdi;
        }
        expect(defterOzetiHesapla(g).gelmeyecek).toBe(0);
    });
});

describe('ekleme anında simülasyon', () => {
    it('sığmayan ekleme ENGELLENİR (sayı artıyor ve sınır aşılıyor)', () => {
        const once = girdi();
        const m = once.muhafiz!.matris;
        const sonra: DefterGirdisi = { ...once, muhafiz: { aktif: true, matris: { ...m, yatsi: adimEkle(m.yatsi, 600) } } };
        const s = degisiklikSimuleEt(once, sonra);
        expect(s.sonra.toplam).toBeGreaterThan(s.once.toplam);
        expect(s.sigar).toBe(false);
    });

    it('sınırın altında kalan ekleme serbest', () => {
        const once = girdi({ nafile: VARSAYILAN_NAFILE_AYARLARI, muhafiz: { aktif: true, matris: matrisKur(() => ({ seviyeler: [adim({ kademe: 'sert', esikDk: 10 })] })) } });
        const m = once.muhafiz!.matris;
        const sonra: DefterGirdisi = { ...once, muhafiz: { aktif: true, matris: { ...m, yatsi: adimEkle(m.yatsi, 600) } } };
        expect(degisiklikSimuleEt(once, sonra).sigar).toBe(true);
    });

    it('yer AÇAN değişiklik aşımdayken bile engellenmez', () => {
        const once = girdi();
        const sonra: DefterGirdisi = { ...once, muhafiz: { aktif: true, matris: nazikTekrariKaldir(once.muhafiz!.matris) } };
        expect(degisiklikSimuleEt(once, sonra).sigar).toBe(true);
    });
});
