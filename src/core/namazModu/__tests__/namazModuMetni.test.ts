import { namazModuMetni } from '../namazModuMetni';

describe('namazModuMetni — sürüme göre doğru yer', () => {
    it('Android 15+ ve bilinmeyen: Modlar listesi', () => {
        expect(namazModuMetni(35, 'kural').anahtar).toContain('Modlar');
        expect(namazModuMetni(null, 'kural').anahtar).toContain('Modlar');
    });
    it('Android 10–14: Rahatsız Etmeyin zamanlamaları, "Modlar" YOK', () => {
        const m = namazModuMetni(34, 'kural');
        expect(m.anahtar).toContain('Zamanlamalar');
        expect(`${m.giris} ${m.anahtar}`).not.toContain('Modlar');
    });
    it('Android 7–9 (filtre): doğrudan Rahatsız Etmeyin', () => {
        expect(namazModuMetni(28, 'filtre').anahtar).toContain('Rahatsız Etmeyin modu açılır');
        expect(namazModuMetni(null, 'filtre').giris).not.toContain('Modlar');
    });
});
