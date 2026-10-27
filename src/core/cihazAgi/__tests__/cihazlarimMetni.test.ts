import { esitlemeVaadi, gorecelZaman, haritaRozeti, saatDurumMetni, uyelikDurumMetni } from '../cihazlarimMetni';
import { aktifDiliKur, aktifDilSifirla } from '../../dil/aktifDil';

const SIMDI = Date.UTC(2026, 9, 21, 12, 0, 0);
const dk = (n: number) => SIMDI - n * 60000;

describe('gorecelZaman', () => {
    it.each([
        [dk(0), 'az önce'],
        [dk(12), '12 dk önce'],
        [dk(60 * 3), '3 sa önce'],
        [dk(60 * 30), 'dün'],
        [dk(60 * 24 * 4), '4 gün önce'],
    ])('%p → %p', (ms, beklenen) => expect(gorecelZaman(ms, SIMDI)).toBe(beklenen));

    it('hiç eşitlenmemiş (0) → null; gelecek zaman "az önce"', () => {
        expect(gorecelZaman(0, SIMDI)).toBeNull();
        expect(gorecelZaman(SIMDI + 5000, SIMDI)).toBe('az önce');
    });
});

describe('uyelikDurumMetni', () => {
    it('tamam: son eşitleme zamanı, açıklama yok', () => {
        expect(uyelikDurumMetni('tamam', dk(5), SIMDI)).toEqual({ cip: 'Son eşitleme 5 dk önce', aciklama: null, ton: 'iyi' });
        expect(uyelikDurumMetni('tamam', 0, SIMDI).cip).toBe('Bağlandı');
    });

    it('ulaşılamadı: yön gösterir, son eşitlemeyi korur', () => {
        const m = uyelikDurumMetni('ulasilamadi', dk(90), SIMDI);
        expect(m.cip).toBe('Son eşitleme 1 sa önce');
        expect(m.aciklama).toMatch(/aynı Wi-Fi/);
        expect(m.ton).toBe('bekliyor');
    });

    it('reddedildi: yeniden eklemeye yönlendirir', () => {
        const m = uyelikDurumMetni('reddedildi', dk(5), SIMDI);
        expect(m.cip).toBe('Yeniden ekleyin');
        expect(m.ton).toBe('sorun');
    });
});

describe('esitlemeVaadi', () => {
    it('Android 15 dk kontrolünü söyler, iOS söylemez (background fetch güvenilmez)', () => {
        expect(esitlemeVaadi('android')).toMatch(/15 dakikalık kontrolde/);
        expect(esitlemeVaadi('ios')).not.toMatch(/15 dakika/);
    });

    it('metin kibar dilde ve "sen" içermez', () => {
        for (const p of ['android', 'ios']) expect(esitlemeVaadi(p)).not.toMatch(/\b(sen|senin)\b/i);
    });
});

describe('Cihazlarım metinleri — İngilizce', () => {
    const TR = /[çğıöşüÇĞİÖŞÜ]/;
    beforeEach(() => aktifDiliKur('en'));
    afterEach(() => aktifDilSifirla());

    it('göreli zaman, durum, rozet, vaat ve saat metni İngilizce', () => {
        expect([dk(0), dk(1), dk(12), dk(60), dk(60 * 3), dk(60 * 24), dk(60 * 24 * 4)].map((t) => gorecelZaman(t, SIMDI))).toEqual([
            'just now', '1 min ago', '12 min ago', '1 h ago', '3 h ago', 'yesterday', '4 days ago',
        ]);
        const metinler: string[] = [];
        for (const d of ['tamam', 'ulasilamadi', 'reddedildi'] as const) {
            for (const t of [0, dk(5)]) {
                const m = uyelikDurumMetni(d, t, SIMDI);
                metinler.push(m.cip, m.aciklama ?? '', haritaRozeti(d, t, SIMDI));
            }
        }
        for (const p of ['android', 'ios']) metinler.push(esitlemeVaadi(p));
        for (const s of ['esli', 'esliDegil', null] as const) metinler.push(saatDurumMetni(s).baslik, saatDurumMetni(s).aciklama);
        for (const m of metinler) expect(m).not.toMatch(TR);
        expect(haritaRozeti('tamam', dk(5), SIMDI)).toBe('connected · 5 min ago');
    });
});
