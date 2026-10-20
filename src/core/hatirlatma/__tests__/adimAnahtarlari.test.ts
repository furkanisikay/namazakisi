import { adimAnahtarlariniGuncelle } from '../adimAnahtarlari';

describe('adimAnahtarlariniGuncelle — kararlı satır anahtarları', () => {
    const ilk = adimAnahtarlariniGuncelle(null, [45, 25, 10]);

    test('ilk çizim: indeks sırasında anahtar, olay yok', () => {
        expect(ilk.anahtarlar).toEqual(['adim-0', 'adim-1', 'adim-2']);
        expect(ilk.sonEklenen).toBeNull();
        expect(ilk.sonSilinen).toBeNull();
    });

    test('aynı eşikler → AYNI nesne (gereksiz çizim yok)', () => {
        expect(adimAnahtarlariniGuncelle(ilk, [45, 25, 10])).toBe(ilk);
    });

    test('eşik düzenleme (uzunluk aynı) → anahtarlar korunur', () => {
        const d = adimAnahtarlariniGuncelle(ilk, [45, 30, 10]);
        expect(d.anahtarlar).toEqual(ilk.anahtarlar);
    });

    test('ORTAYA ekleme: yalnız yeni satır yeni anahtar alır, komşular korunur', () => {
        const d = adimAnahtarlariniGuncelle(ilk, [45, 35, 25, 10]);
        expect(d.anahtarlar).toEqual(['adim-0', 'adim-3', 'adim-1', 'adim-2']);
        expect(d.sonEklenen).toBe('adim-3');
    });

    test('sona ekleme', () => {
        const d = adimAnahtarlariniGuncelle(ilk, [45, 25, 10, 3]);
        expect(d.anahtarlar.slice(-1)).toEqual(['adim-3']);
    });

    test('ORTADAN silme: silinen anahtar ve ESKİ indeksi bildirilir', () => {
        const d = adimAnahtarlariniGuncelle(ilk, [45, 10]);
        expect(d.anahtarlar).toEqual(['adim-0', 'adim-2']);
        expect(d.sonSilinen).toEqual({ anahtar: 'adim-1', indeks: 1 });
    });

    test('çift çağrı (React) olayı kaybettirmez: son ekleme korunur', () => {
        const d = adimAnahtarlariniGuncelle(ilk, [45, 35, 25, 10]);
        expect(adimAnahtarlariniGuncelle(d, [45, 35, 25, 10]).sonEklenen).toBe('adim-3');
    });

    test('toplu değişim (hazır düzey) → hepsi yeni, animasyon olayı yok', () => {
        const d = adimAnahtarlariniGuncelle(ilk, [60, 40, 20, 10, 5]);
        expect(new Set(d.anahtarlar).size).toBe(5);
        expect(d.anahtarlar.some((a) => ilk.anahtarlar.includes(a))).toBe(false);
        expect(d.sonEklenen).toBeNull();
        expect(d.sonSilinen).toBeNull();
    });
});
