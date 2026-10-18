import { ONE_UI_NOTU, ONKOSUL_GENEL, rutinOnkosulNotu } from '../rehberNotlari';

describe('rutinOnkosulNotu — ölçerek konuşur', () => {
    it('ikisi de açık → not yok', () => {
        expect(rutinOnkosulNotu(true, true)).toBeNull();
    });
    it('kapalı olan söylenir', () => {
        expect(rutinOnkosulNotu(false, true)).toBe(
            'Vakit bildirimleri kapalı olduğu için "vakti girdi" tetiklenmez (Bildirim Ayarları\'ndan açabilirsiniz).',
        );
        expect(rutinOnkosulNotu(true, false)).toBe('Camideyim kapalı olduğu için "Camidesiniz" tetiklenmez.');
        expect(rutinOnkosulNotu(false, false)).toContain('; Camideyim kapalı');
    });
    it('bilinmiyorsa (ve kapalı yoksa) genel cümle', () => {
        expect(rutinOnkosulNotu(null, null)).toBe(ONKOSUL_GENEL);
        expect(rutinOnkosulNotu(true, null)).toBe(ONKOSUL_GENEL);
    });
    it('One UI notu sürüm adı vermez', () => {
        expect(ONE_UI_NOTU).not.toMatch(/One UI \d/);
    });
});
