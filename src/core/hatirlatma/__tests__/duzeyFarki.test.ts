import { duzeyFarki } from '../duzeyOzeti';

describe('duzeyFarki — "Yeni öneriyi uygulayın" yalnız gerçekten farklıysa', () => {
    const o = (uyariSayisi: number, ilkDk: number, sesliSayisi = 0) => ({
        uyariSayisi,
        ilkDk,
        sesliSayisi,
        sesli: sesliSayisi > 0,
    });
    it('aynı ölçü → null (düğme gösterilmez)', () => {
        expect(duzeyFarki(o(3, 25, 1), o(3, 25, 1))).toBeNull();
    });
    it('farkı YÖNÜYLE söyler (sayı > başlangıç > sesli)', () => {
        expect(duzeyFarki(o(6, 45), o(3, 25))).toBe('daha az uyarı');
        expect(duzeyFarki(o(3, 45), o(5, 45))).toBe('daha çok uyarı');
        expect(duzeyFarki(o(3, 25), o(3, 45))).toBe('daha erken başlar');
        expect(duzeyFarki(o(3, 45), o(3, 25))).toBe('daha geç başlar');
        expect(duzeyFarki(o(3, 25, 0), o(3, 25, 1))).toBe('+ sesli okuma');
        expect(duzeyFarki(o(3, 25, 1), o(3, 25, 0))).toBe('sesli okumasız');
    });
    it('sesli rıza YOKSA sesli farkı sayılmaz (yeni düzey sesliyi bildirime düşürür)', () => {
        expect(duzeyFarki(o(3, 25, 0), o(3, 25, 1), false)).toBeNull();
    });
    it('ölçü yoksa null', () => {
        expect(duzeyFarki(null, o(3, 25))).toBeNull();
    });
});
