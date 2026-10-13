/**
 * NÖBETÇİ (issue #299): köprüden gelen güven kararı bozuksa GÜVENLİ tarafa düşer —
 * sessiz işaretleme asla varsayılan olmaz; metinler kibar "siz".
 */
import {
    BILINMEYEN_BASLATAN,
    baglantiKarariniCoz,
    guvenKarariEtiketi,
    guvenListesiniCoz,
    guvenListesiniSirala,
    kildimEngellendiMetni,
    kildimIzinAciklamasi,
    kildimIzinSorusu,
    kildimTarayiciAciklamasi,
    KILDIM_GUVEN_ETIKETLERI,
} from '../kildimGuven';

const RUTIN = 'com.samsung.android.app.routines';

describe('baglantiKarariniCoz', () => {
    it('geçerli kararlar aynen okunur', () => {
        expect(
            baglantiKarariniCoz(JSON.stringify({ eylem: 'sor', paket: RUTIN, ad: 'Modlar ve Rutinler', herZaman: true, engel: true }))
        ).toEqual({ eylem: 'sor', paket: RUTIN, ad: 'Modlar ve Rutinler', herZaman: true, engel: true });
        expect(baglantiKarariniCoz({ eylem: 'dogrudan', paket: 'com.sec.android.app.launcher', ad: 'One UI Home' }).eylem).toBe(
            'dogrudan'
        );
        expect(baglantiKarariniCoz({ eylem: 'yokSay', paket: RUTIN, ad: 'R' }).eylem).toBe('yokSay');
    });

    it('bozuk ya da tanınmayan yanıt kimliksiz soruya düşer', () => {
        expect(baglantiKarariniCoz('bozuk{')).toEqual(BILINMEYEN_BASLATAN);
        expect(baglantiKarariniCoz(null)).toEqual(BILINMEYEN_BASLATAN);
        expect(baglantiKarariniCoz({ eylem: 'hepsiniIsaretle', paket: RUTIN })).toEqual(BILINMEYEN_BASLATAN);
    });

    it('paketi olmayan "doğrudan" kabul edilmez (kimliksiz başlatan sessizce işaretleyemez)', () => {
        expect(baglantiKarariniCoz({ eylem: 'dogrudan', paket: null })).toEqual(BILINMEYEN_BASLATAN);
        expect(baglantiKarariniCoz({ eylem: 'dogrudan', paket: '' })).toEqual(BILINMEYEN_BASLATAN);
    });

    it('paketi olmayana kalıcı seçenek sunulmaz', () => {
        const k = baglantiKarariniCoz({ eylem: 'sor', paket: null, herZaman: true, engel: true });
        expect(k.herZaman).toBe(false);
        expect(k.engel).toBe(false);
    });

    it('ad yoksa paket adı gösterilir', () => {
        expect(baglantiKarariniCoz({ eylem: 'sor', paket: RUTIN, ad: ' ' }).ad).toBe(RUTIN);
    });
});

describe('guvenListesiniCoz / guvenListesiniSirala', () => {
    it('bozuk öğeler düşer, geçerliler okunur', () => {
        const ham = JSON.stringify([
            { paket: RUTIN, karar: 'izin', ad: 'Modlar ve Rutinler', zamanMs: 5 },
            { paket: 'net.dinglisch.android.taskerm', karar: 'engel', ad: '', zamanMs: 'x' },
            { paket: 'com.a.b', karar: 'belki' },
            null,
            'metin',
        ]);
        expect(guvenListesiniCoz(ham)).toEqual([
            { paket: RUTIN, karar: 'izin', ad: 'Modlar ve Rutinler', zamanMs: 5 },
            { paket: 'net.dinglisch.android.taskerm', karar: 'engel', ad: 'net.dinglisch.android.taskerm', zamanMs: 0 },
        ]);
        expect(guvenListesiniCoz('bozuk')).toEqual([]);
        expect(guvenListesiniCoz('{}')).toEqual([]);
    });

    it('önce izinliler, sonra engelliler; Türkçe ad sırası', () => {
        const sirali = guvenListesiniSirala([
            { paket: 'a.b.c', karar: 'engel', ad: 'Tasker', zamanMs: 0 },
            { paket: 'a.b.d', karar: 'izin', ad: 'Şablon', zamanMs: 0 },
            { paket: 'a.b.e', karar: 'izin', ad: 'Çizelge', zamanMs: 0 },
        ]);
        expect(sirali.map((k) => k.ad)).toEqual(['Çizelge', 'Şablon', 'Tasker']);
    });
});

describe('metinler', () => {
    it('soru ve açıklamalar kibar "siz" dilinde', () => {
        expect(kildimIzinSorusu('Tasker')).toBe('Tasker namazlarınızı kılındı olarak işaretleyebilsin mi?');
        const hepsi = [
            kildimIzinAciklamasi('Öğle'),
            kildimTarayiciAciklamasi('Öğle'),
            kildimEngellendiMetni('Tasker'),
            guvenKarariEtiketi('izin'),
            guvenKarariEtiketi('engel'),
        ].join(' ');
        expect(hepsi).not.toMatch(/\b(sen|senin|seni)\b/i);
        expect(kildimIzinAciklamasi('Öğle')).toContain('Öğle');
    });

    it('düğme etiketleri issue metniyle aynı', () => {
        expect(KILDIM_GUVEN_ETIKETLERI).toEqual({
            herZaman: 'Her zaman izin ver',
            buSefer: 'Yalnız bu sefer',
            engelle: 'Engelle',
        });
    });
});
