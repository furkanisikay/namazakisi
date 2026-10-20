import {
    camiyeGitOzeti,
    cumaOzeti,
    enErkenEsik,
    geceSessizligiOzeti,
    gunSonuOzeti,
    hatirlatmalarOzeti,
    ozelGunOzeti,
    takvimCakismaOzeti,
    vakitCikmadanOzeti,
    vakitGirinceOzeti,
    vakitListesi,
    yatisOzeti,
} from '../hatirlatmaOzetleri';

describe('hatirlatmaOzetleri — tek cümlelik canlı özetler', () => {
    it('vakit listesi kronolojik, ilk büyük harf; İkindi sabit haritadan (toLowerCase tuzağı yok)', () => {
        expect(vakitListesi({ yatsi: true, ikindi: true, imsak: true })).toBe('Sabah, ikindi, yatsı');
        expect(vakitListesi({ ikindi: true })).toBe('İkindi');
        expect(vakitListesi({})).toBe('');
    });

    it('vakit girince: kapalı / beş vakit / liste', () => {
        expect(vakitGirinceOzeti({})).toBe('Kapalı');
        expect(vakitGirinceOzeti({ imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true })).toBe('Beş vakitte');
        expect(vakitGirinceOzeti({ ogle: true, aksam: true })).toBe('Öğle, akşam');
    });

    it('vakit çıkmadan: düzey adı; özel ve bilinmeyen yoğunluk', () => {
        expect(vakitCikmadanOzeti(false, 'normal')).toBe('Kapalı');
        expect(vakitCikmadanOzeti(true, 'normal')).toBe('Normal düzey');
        expect(vakitCikmadanOzeti(true, 'ozel')).toBe('Kendi ayarınız');
        expect(vakitCikmadanOzeti(true, 'tuhaf')).toBe('Açık');
    });

    it('en erken eşik = en büyük eşik; adım yoksa null', () => {
        expect(enErkenEsik([{ esikDk: 15 }, { esikDk: 60 }])).toBe(60);
        expect(enErkenEsik([])).toBeNull();
        expect(enErkenEsik(undefined)).toBeNull();
    });

    it('cuma ve camiye gitme', () => {
        expect(cumaOzeti(false)).toBe('Kapalı');
        expect(cumaOzeti(true, [{ esikDk: 60 }])).toBe('Öğleden 60 dk önce');
        expect(cumaOzeti(true, [])).toBe('Açık');
        expect(camiyeGitOzeti(false, { ogle: true })).toBe('Kapalı');
        expect(camiyeGitOzeti(true, {})).toBe('Vakit seçilmedi');
        expect(camiyeGitOzeti(true, { ogle: true, aksam: true }, [{ esikDk: 20 }])).toBe('Öğle, akşam: 20 dk önce');
    });

    it('yatış, takvim, gün sonu, özel gün', () => {
        expect(yatisOzeti(true, 23, 5)).toBe('Yatış 23:05');
        expect(yatisOzeti(false, 23, 5)).toBe('Kapalı');
        expect(takvimCakismaOzeti(true)).toBe('Takviminize bakar');
        expect(gunSonuOzeti({ aktif: true, mod: 'otomatik', imsakOncesiDk: 30, saat: 0, dakika: 0 })).toBe('İmsaktan 30 dk önce');
        expect(gunSonuOzeti({ aktif: true, mod: 'sabit', imsakOncesiDk: 30, saat: 23, dakika: 0 })).toBe('Her gün 23:00');
        expect(gunSonuOzeti({ aktif: false, mod: 'sabit', imsakOncesiDk: 30, saat: 23, dakika: 0 })).toBe('Kapalı');
        expect(ozelGunOzeti(true, true)).toBe('Şu an sürüyor');
        expect(ozelGunOzeti(true, false)).toBe('Hazır, başlatılmadı');
        expect(ozelGunOzeti(false, false)).toBe('Kapalı');
    });

    it('Ayarlar kökündeki "Hatırlatmalar" özeti', () => {
        expect(hatirlatmalarOzeti(false, 'normal', 0)).toBe('Kapalı');
        expect(hatirlatmalarOzeti(false, 'normal', 2)).toBe('2 hatırlatma açık');
        expect(hatirlatmalarOzeti(true, 'yogun', 0)).toBe('Yoğun düzey');
        expect(hatirlatmalarOzeti(true, 'normal', 3)).toBe('Normal düzey, 3 hatırlatma daha');
    });

    it('teknik terim yok (kanal / ton / TTS / {süre})', () => {
        const hepsi = [
            vakitCikmadanOzeti(true, 'hafif'),
            cumaOzeti(true, [{ esikDk: 30 }]),
            camiyeGitOzeti(true, { ogle: true }, [{ esikDk: 10 }]),
            hatirlatmalarOzeti(true, 'normal', 1),
        ].join(' ');
        expect(hepsi).not.toMatch(/kanal|\bton\b|TTS|\{süre\}/i);
    });

    it('orta nokta ayracı (·) yok — görsel dil kuralı', () => {
        const hepsi = [
            geceSessizligiOzeti(undefined),
            camiyeGitOzeti(true, { ogle: true, aksam: true }, [{ esikDk: 10 }]),
            hatirlatmalarOzeti(true, 'normal', 2),
        ].join(' ');
        expect(hepsi).not.toContain('·');
    });
});
