import { oneUiNotu, onkosulGenel, rutinOnkosulNotu } from '../rehberNotlari';

describe('rutinOnkosulNotu — ölçerek konuşur', () => {
    it('ikisi de açık → not yok', () => {
        expect(rutinOnkosulNotu(true, true)).toBeNull();
    });
    it('kapalı olan söylenir', () => {
        expect(rutinOnkosulNotu(false, true)).toBe(
            'Vakit bildirimleri kapalı olduğu için "vakti girdi" tetiklenmez (Hatırlatmalar\'dan açabilirsiniz).',
        );
        expect(rutinOnkosulNotu(true, false)).toBe('"Camiye girince" kapalı olduğu için "Camidesiniz" tetiklenmez.');
        expect(rutinOnkosulNotu(false, false)).toContain('; "Camiye girince" kapalı');
    });
    it('bilinmiyorsa (ve kapalı yoksa) genel cümle', () => {
        expect(rutinOnkosulNotu(null, null)).toBe(onkosulGenel());
        expect(rutinOnkosulNotu(true, null)).toBe(onkosulGenel());
    });
    it('One UI notu sürüm adı vermez', () => {
        expect(oneUiNotu()).not.toMatch(/One UI \d/);
    });
});
