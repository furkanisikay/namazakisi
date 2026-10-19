/**
 * Gece sessizliği — TEK kural (`geceSessizligiSusturuyorMu`) ve arka plan üreticisi
 * (`vakitTeslimAdaylari`, defter de buradan beslenir) üzerinden uçtan uca.
 * Saatler YEREL kurulur (kural da yerel saate bakar) → saat diliminden bağımsız.
 */
import {
    VARSAYILAN_GECE_SESSIZLIGI,
    geceBaslangicMs,
    geceBaslangicMetni,
    geceSessizligiSusturuyorMu,
    geceSessizliginePencereyiUyarla,
    geceSessizliginiNormalize,
} from '../geceSessizligi';
import { muhafizBildirimIdOlustur } from '../anonsKimligi';
import { muhafizTeslimPlaniOlustur, vakitTeslimAdaylari, type MuhafizVakitZamani } from '../muhafizTeslimPlani';
import { presetMatrisiOlustur } from '../matrisIslemleri';
import { HATIRLATMA_PRESETLERI } from '../../../presentation/store/muhafizSlice';
import { wearMuhafizPlaniOlustur } from '../../wear/wearMuhafizPlani';

const yerel = (g: number, s: number, d = 0) => new Date(2026, 5, g, s, d, 0, 0);
const ACIK = VARSAYILAN_GECE_SESSIZLIGI;

describe('geceSessizligiSusturuyorMu', () => {
    it('kapalı ya da alanı olmayan kayıt hiçbir şeyi susturmaz (mevcut kullanıcı göçle susmaz)', () => {
        expect(geceSessizligiSusturuyorMu(undefined, '2026-06-21', yerel(22, 3).getTime())).toBe(false);
        expect(geceSessizligiSusturuyorMu({ ...ACIK, aktif: false }, '2026-06-21', yerel(22, 3).getTime())).toBe(false);
    });

    it('namaz gününün 23:00’ünden itibaren susturur (gece yarısından sonrası dahil)', () => {
        expect(geceSessizligiSusturuyorMu(ACIK, '2026-06-21', yerel(21, 22, 59).getTime())).toBe(false);
        expect(geceSessizligiSusturuyorMu(ACIK, '2026-06-21', yerel(21, 23, 0).getTime())).toBe(true);
        expect(geceSessizligiSusturuyorMu(ACIK, '2026-06-21', yerel(22, 3, 21).getTime())).toBe(true);
    });

    it('ertesi sabahın uyarıları ertesi namaz gününe aittir → susmaz', () => {
        expect(geceSessizligiSusturuyorMu(ACIK, '2026-06-22', yerel(22, 4, 40).getTime())).toBe(false);
    });

    it('GERÇEK ALARM muaftır', () => {
        expect(geceSessizligiSusturuyorMu(ACIK, '2026-06-21', yerel(22, 3, 0).getTime(), true)).toBe(false);
    });

    it('öğleden önceki başlangıç gece yarısından SONRA demektir', () => {
        const a = { aktif: true, baslangicSaat: 0, baslangicDakika: 30 };
        expect(geceBaslangicMs('2026-06-21', a)).toBe(yerel(22, 0, 30).getTime());
        expect(geceSessizligiSusturuyorMu(a, '2026-06-21', yerel(21, 23, 50).getTime())).toBe(false);
        expect(geceBaslangicMetni(a)).toBe('00:30');
    });

    it('normalize: bozuk kayıt kapalı (undefined), eksik saat varsayılana düşer', () => {
        expect(geceSessizliginiNormalize(undefined)).toBeUndefined();
        expect(geceSessizliginiNormalize({ aktif: 'evet' })).toBeUndefined();
        expect(geceSessizliginiNormalize({ aktif: true, baslangicSaat: 99 })).toEqual(ACIK);
    });
});

describe('vakitTeslimAdaylari — gece sessizliği (arka plan + defter AYNI üretici)', () => {
    const yatsi: MuhafizVakitZamani = { vakit: 'yatsi', giris: yerel(21, 22, 38), cikis: yerel(22, 3, 24), tarih: '2026-06-21' };
    const simdi = yerel(21, 20, 0);
    const matris = presetMatrisiOlustur(HATIRLATMA_PRESETLERI.normal.seviyeler, true);

    it('çıkış yönlü yatsının gece uyarıları KURULMAZ', () => {
        expect(vakitTeslimAdaylari(matris, yatsi, simdi)).toHaveLength(3);
        expect(vakitTeslimAdaylari(matris, yatsi, simdi, undefined, ACIK)).toHaveLength(0);
    });

    it('gerçek alarm adımı sessizlikte de kurulur', () => {
        const alarmli = presetMatrisiOlustur(HATIRLATMA_PRESETLERI.normal.seviyeler, true);
        alarmli.yatsi.seviyeler[0] = { ...alarmli.yatsi.seviyeler[0], kanallar: { ...alarmli.yatsi.seviyeler[0].kanallar, alarm: true } };
        const adaylar = vakitTeslimAdaylari(alarmli, yatsi, simdi, undefined, ACIK);
        expect(adaylar).toHaveLength(1);
        expect(adaylar[0].uyari.alarm).toBe(true);
    });

    it('YATSI ÇAPASI (plan girdisi → servis + defter): 25/10/3 sessizlik başlangıcına göre kurulur', () => {
        const plan = muhafizTeslimPlaniOlustur({ matris, vakitler: [yatsi], simdi, geceSessizligi: ACIK });
        expect(plan.map((a) => a.zaman.getTime())).toEqual([
            yerel(21, 22, 35).getTime(),
            yerel(21, 22, 50).getTime(),
            yerel(21, 22, 57).getTime(),
        ]);
        // Kimlik biçimi aynı; kalanDk ETKİN çıkışa göre (ön plan ve saat de böyle üretir).
        expect(plan.map((a) => a.id)).toEqual([
            muhafizBildirimIdOlustur('yatsi', plan[0].uyari.seviye, '2026-06-21', 25),
            muhafizBildirimIdOlustur('yatsi', plan[1].uyari.seviye, '2026-06-21', 10),
            muhafizBildirimIdOlustur('yatsi', plan[2].uyari.seviye, '2026-06-21', 3),
        ]);
    });

    it('sessizlik KAPALIYKEN plan birebir eskisi (imsağa kala)', () => {
        const plan = muhafizTeslimPlaniOlustur({ matris, vakitler: [yatsi], simdi });
        expect(plan.map((a) => a.zaman.getTime())).toEqual([
            yerel(22, 2, 59).getTime(),
            yerel(22, 3, 14).getTime(),
            yerel(22, 3, 21).getTime(),
        ]);
    });

    it('yatsı sessizlikten SONRA giriyorsa o gece yatsı uyarısı yok', () => {
        const gec = { ...yatsi, giris: yerel(21, 23, 10) };
        expect(muhafizTeslimPlaniOlustur({ matris, vakitler: [gec], simdi, geceSessizligi: ACIK })).toHaveLength(0);
    });
});

describe('saatin hazır planı (Wear) — telefonla AYNI kural', () => {
    it('gece penceresindeki yatsı kayıtları saate GİTMEZ', () => {
        const g = {
            koordinat: { lat: 41.01, lng: 28.97 },
            bugunIso: '2026-06-21',
            simdiMs: yerel(21, 12, 0).getTime(),
            aktif: true,
            matris: presetMatrisiOlustur(HATIRLATMA_PRESETLERI.normal.seviyeler, true),
            kilinanlar: {},
        };
        const yatsiSayisi = (plan: ReturnType<typeof wearMuhafizPlaniOlustur>) =>
            plan.flat().filter((k) => k.vakit === 'yatsi' && k.tarih === '2026-06-21').length;
        expect(yatsiSayisi(wearMuhafizPlaniOlustur(g))).toBe(3);
        // Çapa: saat de yatsıyı 23:00'e göre alır (telefonla aynı anlar).
        const anlar = wearMuhafizPlaniOlustur({ ...g, geceSessizligi: ACIK })
            .flat()
            .filter((k) => k.vakit === 'yatsi' && k.tarih === '2026-06-21')
            .map((k) => k.ms);
        expect(anlar).toEqual([yerel(21, 22, 35).getTime(), yerel(21, 22, 50).getTime(), yerel(21, 22, 57).getTime()]);
    });
});

describe('geceSessizliginePencereyiUyarla — yatsı çapası', () => {
    const yatsi = { vakit: 'yatsi', tarih: '2026-06-21', giris: yerel(21, 20, 0), cikis: yerel(22, 4, 0) };

    it('kapalıyken ve yatsı dışı vakitte AYNI nesne (plan birebir eskisi)', () => {
        expect(geceSessizliginePencereyiUyarla(undefined, yatsi)).toBe(yatsi);
        const aksam = { ...yatsi, vakit: 'aksam' };
        expect(geceSessizliginePencereyiUyarla(ACIK, aksam)).toBe(aksam);
    });

    it('etkin çıkış = sessizlik başlangıcı; gece yarısı sonrası başlangıç ertesi takvim günü', () => {
        expect(geceSessizliginePencereyiUyarla(ACIK, yatsi)?.cikis).toEqual(yerel(21, 23, 0));
        const a = { aktif: true, baslangicSaat: 0, baslangicDakika: 30 };
        expect(geceSessizliginePencereyiUyarla(a, yatsi)?.cikis).toEqual(yerel(22, 0, 30));
    });

    it('sessizlik çıkıştan sonra başlıyorsa dokunmaz; yatsı sessizlikten sonra giriyorsa null', () => {
        const kisa = { ...yatsi, cikis: yerel(21, 22, 30) };
        expect(geceSessizliginePencereyiUyarla(ACIK, kisa)).toBe(kisa);
        expect(geceSessizliginePencereyiUyarla(ACIK, { ...yatsi, giris: yerel(21, 23, 0) })).toBeNull();
    });
});
