/**
 * Sesli okuma metni — yer tutucu çözücü, yüzey sözlükleri ve planlayıcıların KULLANICI
 * METNİNİ okuması (birleşik hatırlatma modülü §3.4, §4.1).
 *
 * Nöbetçiler:
 *  - her yüzeyde metin normalize'dan SAĞ çıkar ve planlayıcı onu (yer tutucusuz) okur;
 *  - takvimde etkinlik ADI hiçbir yolla anonsa giremez;
 *  - yatış muhasebesi kullanıcı metnini KULLANMAZ (kılınmış yatsıda "yatsıyı kıl" okunmasın);
 *  - hazır cümleler fıkıh/metin kurallarına uyar.
 */
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../../vakit/hesapParametreleri';
import type { SeviyeAyari } from '../../muhafiz/matrisTipleri';
import { ANONS_METIN_UST_SINIRI } from '../../muhafiz/ios/anonsKlibi';
import { ANONS_SOZLUKLERI, adimAnonsMetni, anonsCoz, anonsMetniDoluMu } from '../anonsYerTutucu';
import { ekAdim, adimlariNormalize } from '../adimDizisi';
import { cumaAyarlariniNormalize } from '../../cuma/cumaAyarlari';
import { cumaPlaniOlustur } from '../../bildirim/cumaPlani';
import { camiyeGitAyarlariniNormalize } from '../../camiyeGit/camiyeGitAyarlari';
import { camiyeGitPlaniOlustur } from '../../bildirim/camiyeGitPlani';
import { yatisAyarlariniNormalize } from '../../yatis/yatisAyarlari';
import { yatisPlaniOlustur } from '../../yatis/yatisPlani';
import { takvimCakismaAyarlariniNormalize } from '../../takvimCakisma/takvimCakismaAyarlari';
import { takvimCakismaPlaniOlustur, type TakvimEtkinligi } from '../../bildirim/takvimCakismaPlani';
import { nafileAyarlariniNormalize } from '../../../data/local/LocalNafileServisi';
import { VARSAYILAN_NAFILE_AYARLARI } from '../../nafile/nafileTipleri';
import { nafilePlaniOlustur } from '../../nafile/nafilePlani';
import { gununNafilePencereleri } from '../../nafile/gunVakitleri';
import { seviyeyiAc, seviyeyiKapat } from '../../muhafiz/seviyeAcKapa';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const DK = 60_000;

/** Tek sesli adım, kullanıcının yazdığı metinle. */
const sesliAdim = (esikDk: number, metin: string): SeviyeAyari => ({
    ...ekAdim(esikDk, 'birkez', { bildirim: true, sesli: true }),
    anonsMetni: metin,
});

describe('anonsCoz — yer tutucu çözücü', () => {
    it('{vakit} {süre} {yön} doldurulur', () => {
        expect(anonsCoz('{vakit} için {süre} dakika {yön}.', { vakit: 'Kuşluk', sureDk: 12, yon: 'girisindenItibaren' })).toBe(
            'Kuşluk için 12 dakika geçti.'
        );
        expect(anonsCoz('{vakit}: {süre} dakika {yön}.', { vakit: 'Evvâbîn', sureDk: 3, yon: 'cikisaDogru' })).toBe(
            'Evvâbîn: 3 dakika kaldı.'
        );
    });

    it('bilinmeyen ya da bağlamı olmayan yer tutucu BOŞA indirgenir; boşluk/noktalama temizlenir', () => {
        expect(anonsCoz('{etkinlik} başlıyor, {vakit} vakti {yön} .', { vakit: 'Öğle', sureDk: 5 })).toBe(
            'başlıyor, Öğle vakti.'
        );
        expect(anonsCoz('{ad}{saat}', { vakit: 'Öğle', sureDk: 5 })).toBe('');
    });

    it('büyük/küçük harfe dokunulmaz (Türkçe İ tuzağı)', () => {
        expect(anonsCoz('İKİNDİ {vakit}', { vakit: 'İkindi', sureDk: 1 })).toBe('İKİNDİ İkindi');
    });

    it('boşluktan ibaret metin BOŞ sayılır → otomatik cümle', () => {
        expect(anonsMetniDoluMu('   ')).toBe(false);
        expect(adimAnonsMetni('  ', { vakit: 'Öğle', sureDk: 5 }, () => 'otomatik')).toBe('otomatik');
        expect(adimAnonsMetni('{vakit}!', { vakit: 'Öğle', sureDk: 5 }, () => 'otomatik')).toBe('Öğle!');
    });
});

describe('Yüzey sözlükleri', () => {
    it('her yüzeyde yer tutucu var; takvimde etkinlik adı/saati/başlığı için yer tutucu YOK', () => {
        for (const sozluk of Object.values(ANONS_SOZLUKLERI)) expect(sozluk.yerTutucular.length).toBeGreaterThan(0);
        const takvim = ANONS_SOZLUKLERI.takvim.yerTutucular.map((y) => y.anahtar as string);
        expect(takvim).toEqual(['{vakit}', '{süre}']);
        for (const sablon of ANONS_SOZLUKLERI.takvim.sablonlar) expect(sablon).not.toMatch(/\{(etkinlik|ad|saat|baslik|başlık)\}/);
    });

    it('{yön} yalnız yön taşıyan yüzeylerde (muhafız, nafile) sunulur', () => {
        const yonlu = Object.entries(ANONS_SOZLUKLERI)
            .filter(([, s]) => s.yerTutucular.some((y) => y.anahtar === '{yön}'))
            .map(([ad]) => ad)
            .sort();
        expect(yonlu).toEqual(['muhafiz', 'nafile']);
    });

    it('hazır cümleler: "secde", terk/küfür dili ve nass YOK; yer tutucular sözlükte tanımlı', () => {
        for (const [ad, sozluk] of Object.entries(ANONS_SOZLUKLERI)) {
            const tanimli = new Set(sozluk.yerTutucular.map((y) => y.anahtar as string));
            for (const sablon of sozluk.sablonlar) {
                expect(sablon).not.toMatch(/secde|terk|küfür|kafir|kâfir|Buhârî|Müslim|İsrâ|ayet|hadis/i);
                for (const yt of sablon.match(/\{[^{}]*\}/g) ?? []) {
                    if (!tanimli.has(yt)) throw new Error(`${ad}: ${yt} sözlükte yok`);
                }
            }
        }
    });
});

describe('Normalize metni KORUR (diskten birebir döner)', () => {
    const KISIT = { maksAdim: 3, tekrarMinDk: 5, tekrarMaxDk: 60 };

    it('metin kırpılmadan döner; tavan ANONS_METIN_UST_SINIRI', () => {
        const [a] = adimlariNormalize([sesliAdim(30, '  Kendi {vakit} cümlem  ')], 'cikisaDogru', 30, KISIT);
        expect(a.anonsMetni).toBe('  Kendi {vakit} cümlem  ');
        const [b] = adimlariNormalize([sesliAdim(30, 'x'.repeat(ANONS_METIN_UST_SINIRI + 50))], 'cikisaDogru', 30, KISIT);
        expect(b.anonsMetni).toHaveLength(ANONS_METIN_UST_SINIRI);
    });

    it('metin olmayan değer boş metne düşer', () => {
        const [a] = adimlariNormalize([{ ...ekAdim(30), anonsMetni: 42 }], 'cikisaDogru', 30, KISIT);
        expect(a.anonsMetni).toBe('');
    });

    it.each([
        ['cuma', (m: string) => cumaAyarlariniNormalize({ aktif: true, adimlar: [sesliAdim(60, m)] }).adimlar],
        [
            'camiye',
            (m: string) =>
                camiyeGitAyarlariniNormalize({ aktif: true, vakitler: { ogle: true }, adimlar: [sesliAdim(30, m)] }).adimlar,
        ],
        ['yatış', (m: string) => yatisAyarlariniNormalize({ aktif: true, adimlar: [sesliAdim(30, m)] }).adimlar],
        [
            'takvim',
            (m: string) =>
                takvimCakismaAyarlariniNormalize({ aktif: true, rizaZamani: '2026-10-01T00:00:00.000Z', adimlar: [sesliAdim(30, m)] })
                    .adimlar,
        ],
        [
            'nafile',
            (m: string) =>
                nafileAyarlariniNormalize({
                    ...VARSAYILAN_NAFILE_AYARLARI,
                    hatirlatmalar: { kusluk: { aktif: true, yon: 'girisindenItibaren', adimlar: [sesliAdim(5, m)] } },
                }).hatirlatmalar.kusluk.adimlar,
        ],
    ])('%s ayar normalize metni korur', (_ad, normalize) => {
        expect(normalize('Benim cümlem {süre}')[0].anonsMetni).toBe('Benim cümlem {süre}');
    });
});

describe('Planlayıcılar KULLANICI METNİNİ okur (yer tutucusuz, yüzeyin bağlamıyla)', () => {
    it('cuma: {vakit} = Cuma (muhafız vakti "Öğle" DEĞİL), {süre} = öğleye kalan dk', () => {
        const ayarlar = cumaAyarlariniNormalize({ aktif: true, adimlar: [sesliAdim(45, '{vakit} için {süre} dakika, acele et.')] });
        const plan = cumaPlaniOlustur(ISTANBUL, ayarlar, new Date(2026, 7, 3, 8, 0));
        expect(plan.length).toBeGreaterThan(0);
        for (const p of plan) expect(p.uyari.anonsMetni).toBe('Cuma için 45 dakika, acele et.');
    });

    it('camiye gitme: {vakit} = o vaktin adı', () => {
        const ayarlar = camiyeGitAyarlariniNormalize({
            aktif: true,
            vakitler: { imsak: false, ogle: false, ikindi: true, aksam: false, yatsi: false },
            adimlar: [sesliAdim(30, '{vakit} vaktine {süre} dakika.')],
        });
        const plan = camiyeGitPlaniOlustur(ISTANBUL, ayarlar, new Date(2026, 7, 3, 0, 1), { gunSayisi: 2 });
        expect(plan.length).toBeGreaterThan(0);
        for (const p of plan) expect(p.uyari.anonsMetni).toBe('İkindi vaktine 30 dakika.');
    });

    it('nafile: {vakit} nafilenin adı, {süre} ölçü, {yön} yöne göre', () => {
        const GUN = '2026-06-21';
        const ayarlar = nafileAyarlariniNormalize({
            ...VARSAYILAN_NAFILE_AYARLARI,
            hatirlatmalar: {
                kusluk: { aktif: true, yon: 'girisindenItibaren', adimlar: [sesliAdim(5, '{vakit}: {süre} dakika {yön}.')] },
                evvabin: { aktif: true, yon: 'cikisaDogru', adimlar: [sesliAdim(20, '{vakit}: {süre} dakika {yön}.')] },
            },
        });
        const gunBasi = new Date(gununNafilePencereleri(ISTANBUL, GUN)[0].baslangic.getTime() - 3 * 60 * DK);
        const plan = nafilePlaniOlustur(ISTANBUL, ayarlar, gunBasi, GUN);
        const metinler = new Set(plan.map((p) => p.uyari.anonsMetni));
        expect(metinler).toEqual(new Set(['Kuşluk: 5 dakika geçti.', 'Evvâbîn: 20 dakika kaldı.']));
    });

    it('yatış: yatsı hatırlatması metni okur; muhasebe OTOMATİK kalır', () => {
        const ayarlar = yatisAyarlariniNormalize({
            aktif: true,
            saat: 23,
            dakika: 30,
            yatsiHatirlatmasi: true,
            muhasebe: true,
            adimlar: [sesliAdim(30, '{vakit} kılınmadı, {süre} dakika sonra yatıyorsun.')],
        });
        const simdi = new Date(2026, 9, 13, 13, 15);
        const yatsi = yatisPlaniOlustur({ koordinat: ISTANBUL, ayarlar, simdi, gunSayisi: 2 });
        expect(yatsi.length).toBeGreaterThan(0);
        for (const p of yatsi) expect(p.uyari.anonsMetni).toBe('Yatsı kılınmadı, 30 dakika sonra yatıyorsun.');
        const muhasebe = yatisPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar,
            simdi,
            gunSayisi: 2,
            kilinanlar: () => ['imsak', 'ikindi', 'aksam', 'yatsi'],
        });
        expect(muhasebe.length).toBeGreaterThan(0);
        for (const p of muhasebe) expect(p.uyari.anonsMetni).toBe('Bugün öğle vakti işaretlenmemiş görünüyor.');
    });

    it('takvim: metin okunur, etkinlik ADI asla (kullanıcı {etkinlik} yazsa bile); {süre} çapaya gerçek kalan', () => {
        const ayarlar = takvimCakismaAyarlariniNormalize({
            aktif: true,
            rizaZamani: '2026-10-01T00:00:00.000Z',
            baslikGoster: true,
            adimlar: [sesliAdim(30, '{etkinlik} {vakit} ile çakışıyor, {süre} dakika var.')],
        });
        const pt = new PrayerTimes(new Coordinates(ISTANBUL.lat, ISTANBUL.lng), new Date(2026, 9, 13), turkiyeHesapParametreleri());
        const etkinlikler: TakvimEtkinligi[] = [
            { baslangicMs: pt.asr.getTime() + 60 * DK, bitisMs: pt.maghrib.getTime() + 10 * DK, baslik: 'Gizli Toplantı' },
        ];
        const plan = takvimCakismaPlaniOlustur({
            koordinat: ISTANBUL,
            ayarlar,
            simdi: new Date(2026, 9, 12, 0, 5),
            gunSayisi: 3,
            etkinlikler,
        });
        expect(plan.length).toBeGreaterThan(0);
        for (const p of plan) {
            expect(p.uyari.anonsMetni).toBe('İkindi ile çakışıyor, 30 dakika var.');
            expect(p.uyari.anonsMetni).not.toMatch(/Gizli|Toplantı|\{/);
        }
    });
});

describe('seviyeyiAc — doldurma yalnız muhafızda', () => {
    const kapali = seviyeyiKapat(ekAdim(30, 'birkez', { bildirim: true, sesli: true }));

    it('muhafız (varsayılan): boş metin yön-uygun şablonla dolar', () => {
        expect(seviyeyiAc(kapali, 'cikisaDogru').anonsMetni).not.toBe('');
    });

    it('ek yüzey/nafile (`doldur = false`): kutu BOŞ kalır = otomatik cümle', () => {
        expect(seviyeyiAc(kapali, 'cikisaDogru', false).anonsMetni).toBe('');
    });
});
