import { nafileBildirimMetni, NAFILE_ACIKLAMALARI, NAFILE_NASLARI } from '../nafileMetinleri';

const SON = new Date(2026, 5, 22, 3, 30);

const tumMetinler = () => [
    nafileBildirimMetni({ tur: 'kusluk', son: SON }),
    nafileBildirimMetni({ tur: 'evvabin', son: SON }),
    nafileBildirimMetni({ tur: 'teheccud', son: SON, teheccudPenceresi: 'sonUcteBir' }),
    nafileBildirimMetni({ tur: 'teheccud', son: SON, teheccudPenceresi: 'yatsi', yon: 'cikisaDogru', kalanDk: 60 }),
    nafileBildirimMetni({ tur: 'teheccud', son: SON, teheccudPenceresi: 'sonUcteBir', uyandirma: true }),
    nafileBildirimMetni({ tur: 'teheccud', son: SON, teheccudPenceresi: 'yatsi', yon: 'cikisaDogru', kalanDk: 45, uyandirma: true }),
];

describe('nafileBildirimMetni', () => {
    it('NÖBETÇİ: suçlama/terk dili ve "secde" yok (nafile gönüllüdür)', () => {
        const yasak = /kaçır|terk|küfr|secde|günah|azap/i;
        for (const m of tumMetinler()) {
            expect(m.baslik).not.toMatch(yasak);
            expect(m.govde).not.toMatch(yasak);
        }
        for (const a of Object.values(NAFILE_ACIKLAMALARI)) expect(a).not.toMatch(yasak);
    });

    it('NÖBETÇİ: İsrâ 17/79 kullanılmaz (muhatabı Hz. Peygamber)', () => {
        for (const m of tumMetinler()) expect(m.govde).not.toMatch(/İsrâ|17\/79/);
    });

    it('evvâbîn bildiriminde nass yoktur (rivayet zayıf)', () => {
        const m = nafileBildirimMetni({ tur: 'evvabin', son: SON });
        expect(m.govde).not.toContain('"');
    });

    it('emir kipi ("Kalk") yalnız uyandırmada', () => {
        const metinler = tumMetinler();
        const uyandirmalar = metinler.slice(4);
        const digerleri = metinler.slice(0, 4);
        for (const m of uyandirmalar) expect(m.govde.startsWith('Kalk')).toBe(true);
        for (const m of digerleri) expect(m.govde).not.toMatch(/\bKalk\b/);
    });

    it('saate hal eki eklenmez', () => {
        for (const m of tumMetinler()) expect(m.govde).not.toMatch(/\d\d:\d\d'/);
    });

    it('kuşluk ve son üçte bir bildirimleri doğru nassı taşır', () => {
        expect(nafileBildirimMetni({ tur: 'kusluk', son: SON }).govde).toContain(NAFILE_NASLARI.kusluk);
        expect(nafileBildirimMetni({ tur: 'teheccud', son: SON }).govde).toContain(NAFILE_NASLARI.teheccud);
        expect(nafileBildirimMetni({ tur: 'teheccud', son: SON }).govde).toContain('03:30');
    });
});
