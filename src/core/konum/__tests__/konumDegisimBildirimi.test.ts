import {
    konumAdiMetni,
    konumDegisimBildirimiGerekliMi,
    konumDegisimBildirimMetni,
} from '../konumDegisimBildirimi';

const beyoglu = { ilce: 'Beyoğlu', il: 'İstanbul' };
const kadikoy = { ilce: 'Kadıköy', il: 'İstanbul' };
const palandoken = { ilce: 'Palandöken', il: 'Erzurum' };

describe('konumDegisimBildirimiGerekliMi', () => {
    it('ilçe ya da il değişince bildirim gerekir', () => {
        expect(konumDegisimBildirimiGerekliMi(beyoglu, palandoken, true)).toBe(true);
        // Aynı şehirde ilçe değişti: vakitler de (dakika dakika) değişir, ad değişti.
        expect(konumDegisimBildirimiGerekliMi(beyoglu, kadikoy, true)).toBe(true);
    });

    it('ad değişmediyse bildirim YOK (mesafe eşiği aşılsa bile: şehir içi gidiş geliş gürültü olurdu)', () => {
        expect(konumDegisimBildirimiGerekliMi(beyoglu, { ...beyoglu }, true)).toBe(false);
        // Ters kodlamanın getirdiği baştaki/sondaki boşluk "değişiklik" sayılmaz
        expect(konumDegisimBildirimiGerekliMi(beyoglu, { ilce: ' Beyoğlu ', il: 'İstanbul ' }, true)).toBe(false);
    });

    it('ayar yalnız AÇIKÇA false ise kapalıdır; alan yoksa (eski kayıt) açık sayılır', () => {
        expect(konumDegisimBildirimiGerekliMi(beyoglu, palandoken, false)).toBe(false);
        expect(konumDegisimBildirimiGerekliMi(beyoglu, palandoken, undefined)).toBe(true);
    });

    it('eski ad bilinmiyorsa (ilk konum alımı) bildirim YOK: karşılaştıracak bir şey yok', () => {
        expect(konumDegisimBildirimiGerekliMi(null, palandoken, true)).toBe(false);
        expect(konumDegisimBildirimiGerekliMi(undefined, palandoken, true)).toBe(false);
        expect(konumDegisimBildirimiGerekliMi({ ilce: '', il: '' }, palandoken, true)).toBe(false);
    });

    it('yeni ad çözülemediyse bildirim YOK: yer adı veremeyen bir "konumunuz güncellendi" yazılmaz', () => {
        expect(konumDegisimBildirimiGerekliMi(beyoglu, null, true)).toBe(false);
        expect(konumDegisimBildirimiGerekliMi(beyoglu, { ilce: '', il: '' }, true)).toBe(false);
    });
});

describe('konum bildirimi metni', () => {
    it('ilçe ve il birlikte yazılır', () => {
        expect(konumAdiMetni(palandoken)).toBe('Palandöken, Erzurum');
    });

    it('ilçe ile il aynıysa ya da biri boşsa tek ad yazılır', () => {
        expect(konumAdiMetni({ ilce: 'Erzurum', il: 'Erzurum' })).toBe('Erzurum');
        expect(konumAdiMetni({ ilce: '', il: 'Erzurum' })).toBe('Erzurum');
        expect(konumAdiMetni({ ilce: 'Palandöken', il: '' })).toBe('Palandöken');
    });

    it('arayüz metnidir: kibar "siz" dilinde, yer adını başlıkta taşır', () => {
        const { baslik, govde } = konumDegisimBildirimMetni(palandoken);
        expect(baslik).toBe('Konumunuz güncellendi: Palandöken, Erzurum');
        expect(govde).toBe('Namaz vakitleri yeni konumunuza göre ayarlandı.');
    });
});
