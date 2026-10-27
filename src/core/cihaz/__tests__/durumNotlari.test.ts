import { BOS_CIHAZ_DURUMU, canliYuzeyAdi, durumNotlari, durumNotu, EYLEM_ETIKETLERI, type CihazDurumu } from '../durumNotlari';
import { aktifDiliKur, aktifDilSifirla } from '../../dil/aktifDil';
import { isletimSistemiSurumu } from '../surum';

const android = (ek: Partial<CihazDurumu>): CihazDurumu => ({ ...BOS_CIHAZ_DURUMU, surum: isletimSistemiSurumu('android', 35), ...ek });
const ios = (ek: Partial<CihazDurumu>): CihazDurumu => ({ ...BOS_CIHAZ_DURUMU, surum: isletimSistemiSurumu('ios', '26.0'), ...ek });

describe('durumNotu — ölçebildiğini sorma', () => {
    it('bilinmeyen (null) her koşulda SUS', () => {
        for (const k of ['bildirimIzni', 'konumIzni', 'takvimIzni', 'tamAlarm', 'tamEkran', 'pil', 'dndErisimi', 'turkceTts', 'alarmSesi', 'canliGuncelleme'] as const) {
            expect(durumNotu(k, android({}))).toBeNull();
        }
    });

    it('izin: sorulabilir → izin isteği, kalıcı red → uygulama ayarları, verildi → hiçbir şey', () => {
        expect(durumNotu('konumIzni', android({ konumIzni: 'sorulabilir' }))?.eylem).toBe('konumIzni');
        expect(durumNotu('konumIzni', android({ konumIzni: 'reddedildi' }))?.eylem).toBe('uygulamaAyarlari');
        expect(durumNotu('konumIzni', android({ konumIzni: 'verildi' }))).toBeNull();
    });

    it("Android'e özgü koşullar iPhone'da çizilmez", () => {
        const kapali = { tamAlarm: false, tamEkran: false, pilMuaf: false, dndErisimi: false, alarmSesiAcik: false, canliGuncelleme: 'kapali' as const };
        for (const k of ['tamAlarm', 'tamEkran', 'pil', 'dndErisimi', 'alarmSesi', 'canliGuncelleme'] as const) {
            expect(durumNotu(k, ios(kapali))).toBeNull();
            expect(durumNotu(k, android(kapali))).not.toBeNull();
        }
    });

    it('canlı güncelleme: açık ve desteklenmiyor → hiçbir şey; kapalı → ayar düğmesi', () => {
        expect(durumNotu('canliGuncelleme', android({ canliGuncelleme: 'acik' }))).toBeNull();
        expect(durumNotu('canliGuncelleme', android({ canliGuncelleme: 'desteklenmiyor' }))).toBeNull();
        expect(durumNotu('canliGuncelleme', android({ canliGuncelleme: 'kapali' }))?.eylem).toBe('canliGuncellemeAyari');
    });

    it("Türkçe ses: Android'de tek dokunuş indirme, iPhone'da yol tarifi", () => {
        expect(durumNotu('turkceTts', android({ turkceTts: false }))?.eylem).toBe('ttsIndir');
        const i = durumNotu('turkceTts', ios({ turkceTts: false }));
        expect(i?.eylem).toBeUndefined();
        // iOS: menü yolu sürüme göre değişir → tam yol ("A > B > C") YAZILMAZ.
        expect(i?.metin).toContain('Erişilebilirlik ayarlarından Türkçe ses indirin.');
        expect(i?.metin).not.toContain('>');
        expect(durumNotu('turkceTts', android({ turkceTts: true }))).toBeNull();
    });

    it('metinler kibar, teknik terimsiz ve tek cümle; her eylemin etiketi var', () => {
        const hepsi = durumNotlari(
            ['bildirimIzni', 'konumIzni', 'tamAlarm', 'tamEkran', 'pil', 'dndErisimi', 'turkceTts', 'alarmSesi', 'canliGuncelleme'],
            android({ bildirimIzni: 'reddedildi', konumIzni: 'sorulabilir', tamAlarm: false, tamEkran: false, pilMuaf: false, dndErisimi: false, turkceTts: false, alarmSesiAcik: false, canliGuncelleme: 'kapali' }),
        );
        expect(hepsi).toHaveLength(9);
        for (const n of hepsi) {
            expect(n.metin).not.toMatch(/\b(sen|senin|TTS|API|kanal)\b/i);
            if (n.eylem) expect(EYLEM_ETIKETLERI[n.eylem]).toBeTruthy();
        }
    });

    it('Now Bar adı yalnız Samsung\'da geçer', () => {
        expect(canliYuzeyAdi(true)).toContain('Now Bar');
        expect(canliYuzeyAdi(false)).not.toContain('Now Bar');
        expect(canliYuzeyAdi(null)).not.toContain('Now Bar');
    });
});

describe('durumNotu — İngilizce', () => {
    const TR = /[çğıöşüÇĞİÖŞÜ]/;
    beforeEach(() => aktifDiliKur('en'));
    afterEach(() => aktifDilSifirla());

    it('her satır ve düğme etiketi İngilizce', () => {
        const kosullar = ['bildirimIzni', 'konumIzni', 'takvimIzni', 'tamAlarm', 'tamEkran', 'pil', 'dndErisimi', 'turkceTts', 'alarmSesi', 'canliGuncelleme'] as const;
        const kapali = { bildirimIzni: 'sorulabilir', konumIzni: 'reddedildi', takvimIzni: 'sorulabilir', tamAlarm: false, tamEkran: false, pilMuaf: false, dndErisimi: false, turkceTts: false, alarmSesiAcik: false, canliGuncelleme: 'kapali' } as const;
        const notlar = [...durumNotlari(kosullar, android(kapali)), ...durumNotlari(kosullar, ios(kapali))];
        expect(notlar.length).toBeGreaterThan(10);
        for (const n of notlar) {
            expect(n.metin).not.toMatch(TR);
            if (n.eylem) expect(EYLEM_ETIKETLERI[n.eylem]).not.toMatch(TR);
        }
        expect(EYLEM_ETIKETLERI.bildirimIzni).toBe('Allow');
        expect(canliYuzeyAdi(true)).toBe('in the status bar and Now Bar');
        expect(canliYuzeyAdi(false)).toBe('in the status bar');
    });
});
