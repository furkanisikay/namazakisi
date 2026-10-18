import { namazModuMetni } from '../namazModuMetni';

describe('namazModuMetni — sürüme göre doğru yer', () => {
    it('Android 10+ ve bilinmeyen: genel ifade, OEM menü adı ("Modlar", "Zamanlamalar") KESİN yazılmaz', () => {
        for (const api of [29, 34, 35, 36, null]) {
            const m = namazModuMetni(api, 'kural');
            const tum = `${m.giris} ${m.anahtar}`;
            expect(m.anahtar).toContain('Rahatsız Etmeyin/mod ayarlarına');
            expect(tum).not.toMatch(/Modlar|Zamanlamalar|→/);
        }
    });
    it('Android 7–9 (filtre): doğrudan Rahatsız Etmeyin', () => {
        expect(namazModuMetni(28, 'filtre').anahtar).toContain('Rahatsız Etmeyin modu açılır');
        expect(namazModuMetni(null, 'filtre').giris).not.toContain('Modlar');
    });
});
