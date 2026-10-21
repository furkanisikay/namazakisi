import { esitlemeVaadi, gorecelZaman, uyelikDurumMetni } from '../cihazlarimMetni';

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
