/**
 * NÖBETÇİ — birleşik hatırlatma modülü Opus incelemesi (#4, #5, #6, #10; #8/#9 ekran testinde).
 */
import { ayniAnaDusenleriBirlestir } from '../ekPlan';
import { adimAnonsMetni, cozulmusAnonsVeyaNull } from '../anonsYerTutucu';
import { anonsMetniniCoz, ANONS_SABLONLARI, ANONS_SABLONLARI_GIRIS } from '../../muhafiz/anonsMetni';
import { komsuyaKilitliSinirlar } from '../../muhafiz/esikSinirlari';
import type { UyariPlani } from '../../muhafiz/motorAdaptoru';
import type { SeviyeAyari } from '../../muhafiz/matrisTipleri';

const uyari = (ek: Partial<UyariPlani>): UyariPlani => ({
    kalanDk: 30,
    olcuDk: 30,
    seviye: 1,
    adimIndeks: 0,
    kanallar: { bildirim: true },
    bildirimSesi: 'varsayilan',
    anonsMetni: '',
    sesliAnons: false,
    ...ek,
});

describe('#4 muhafız anonsMetniniCoz — bilinmeyen yer tutucu BOŞA iner', () => {
    it('bilinmeyen `{x}` silinir, boşluk/noktalama toplanır', () => {
        expect(anonsMetniniCoz('{vakit} {etkinlik} vakti , {süre} dakika.', 'ogle', 10)).toBe('Öğle vakti, 10 dakika.');
    });
    it('yalnız bilinmeyen yer tutucu → boş (muhafızda boş = SESSİZ, otomatiğe düşmez)', () => {
        expect(anonsMetniniCoz('{etkinlik}', 'ogle', 10)).toBe('');
    });
    it('bilinen yer tutuculu havuz şablonları BİREBİR eskisi (temizlik dokunmaz)', () => {
        for (const s of [...ANONS_SABLONLARI, ...ANONS_SABLONLARI_GIRIS]) {
            const eski = s.split('{vakit}').join('İkindi').split('{süre}').join('7').split('{yön}').join('kaldı');
            expect(anonsMetniniCoz(s, 'ikindi', 7)).toBe(eski);
        }
        // Kullanıcının çift boşluğu korunur (bilinmeyen yer tutucu yoksa metne dokunulmaz).
        expect(anonsMetniniCoz('Kalk  {vakit}', 'ogle', 1)).toBe('Kalk  Öğle');
    });
});

describe('#5 ayniAnaDusenleriBirlestir — okunacak metin sesli kanalı AÇIK adımdan', () => {
    const sesli = uyari({ kanallar: { bildirim: true, sesli: true }, sesliAnons: true, anonsMetni: 'Benim cümlem.' });
    const alarm = uyari({ kanallar: { bildirim: true, alarm: true }, alarm: true, anonsMetni: 'Otomatik cümle.' });
    it.each([
        ['sesli önce', sesli, alarm],
        ['alarm önce', alarm, sesli],
    ])('%s: en güçlü adım (alarm) sesli değilse metin sesli adımdan', (_ad, a, b) => {
        const birlesik = ayniAnaDusenleriBirlestir(a, b);
        expect(birlesik.alarm).toBe(true);
        expect(birlesik.kanallar).toEqual({ bildirim: true, sesli: true, alarm: true });
        expect(birlesik.anonsMetni).toBe('Benim cümlem.');
    });
    it('ikisi de sesliyse en güçlü adımın metni', () => {
        const guclu = uyari({ kanallar: { sesli: true, alarm: true }, alarm: true, anonsMetni: 'Güçlü.' });
        expect(ayniAnaDusenleriBirlestir(sesli, guclu).anonsMetni).toBe('Güçlü.');
    });
});

describe('#6 çözüm boş kalırsa otomatik cümle (ek yüzey)', () => {
    const baglam = { vakit: 'Öğle', sureDk: 10 };
    it('yalnız bilinmeyen yer tutucu → otomatik', () => {
        expect(adimAnonsMetni('{etkinlik}', baglam, () => 'Oto.')).toBe('Oto.');
        expect(adimAnonsMetni(' { x } ', baglam, () => 'Oto.')).toBe('Oto.');
        expect(cozulmusAnonsVeyaNull('{etkinlik}', baglam)).toBeNull();
    });
    it('dolu çözüm aynen', () => {
        expect(adimAnonsMetni('{vakit} için {süre} dakika.', baglam, () => 'Oto.')).toBe('Öğle için 10 dakika.');
        expect(cozulmusAnonsVeyaNull('{vakit}.', baglam)).toBe('Öğle.');
    });
});

describe('#10 komsuyaKilitliSinirlar — sabit sınırlı yüzeyde iki adım aynı eşiğe çekilemez', () => {
    const sv = (esikDk: number): SeviyeAyari => ({
        kademe: 'nazik', kanallar: { bildirim: true }, esikDk, siklik: 'birkez', bildirimSesi: 'varsayilan', anonsMetni: '',
    });
    const taban = { min: 15, max: 180 };
    it('komşuların bir ızgara adımı içinde kilitlenir (sıra bağımsız)', () => {
        const s = [sv(60), sv(120), sv(30)];
        expect(komsuyaKilitliSinirlar(taban, s, 0, 15)).toEqual({ min: 45, max: 105 });
        expect(komsuyaKilitliSinirlar(taban, s, 1, 15)).toEqual({ min: 75, max: 180 });
        expect(komsuyaKilitliSinirlar(taban, s, 2, 15)).toEqual({ min: 15, max: 45 });
    });
    it('kapalı adım da kilitler; yer kalmazsa kendi değerine sabitlenir', () => {
        const kapali = { ...sv(45), kanallar: {} };
        expect(komsuyaKilitliSinirlar(taban, [sv(30), kapali], 0, 15)).toEqual({ min: 15, max: 30 });
        expect(komsuyaKilitliSinirlar(taban, [sv(30), sv(35), sv(40)], 1, 15)).toEqual({ min: 35, max: 35 });
    });
    it('tek adımda taban sınırlar aynen', () => {
        expect(komsuyaKilitliSinirlar(taban, [sv(60)], 0, 15)).toEqual(taban);
    });
});
