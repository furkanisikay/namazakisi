import {
    VARSAYILAN_CAMIDEYIM_AYARLARI,
    camideyimAyarlariniNormalize,
    kullaniciYeriKimligi,
    yerDurumunuAyarla,
} from '../camideyimAyarlari';
import { ilkHarfiBuyut, olaySatiriOlustur, zamanCizelgesiOlustur } from '../olayMetinleri';
import { cumaMi, gunGirisleriniHesapla } from '../vakitGirisleri';
import { kapiPencereleriniHesapla } from '../camiKarar';

describe('camideyimAyarlariniNormalize', () => {
    it('bozuk kayıt varsayılana düşer (kapalı, 3 dk, kapı açık)', () => {
        expect(camideyimAyarlariniNormalize('x')).toEqual(VARSAYILAN_CAMIDEYIM_AYARLARI);
        expect(VARSAYILAN_CAMIDEYIM_AYARLARI).toMatchObject({ aktif: false, beklemeDk: 3, vakitKapisi: true });
    });

    it('bekleme 2–20, alan 10–150 kenetlenir; geçersiz konum atılır', () => {
        const a = camideyimAyarlariniNormalize({
            aktif: true,
            beklemeDk: 99,
            yerler: {
                'osm:n1': { durum: 'favori', alanM: 5, lat: 41, lng: 29 },
                'osm:n2': { durum: 'garip', lat: 999, lng: 29 },
                'osm:n3': 'bozuk',
            },
        });
        expect(a.beklemeDk).toBe(20);
        expect(a.yerler['osm:n1']).toEqual({ durum: 'favori', alanM: 10, lat: 41, lng: 29 });
        expect(a.yerler['osm:n2']).toEqual({ durum: 'normal' });
        expect(a.yerler['osm:n3']).toBeUndefined();
    });
});

describe('yerDurumunuAyarla', () => {
    it('normal + ek bilgisi olmayan kayıt silinir; kendi yer kalır', () => {
        const y1 = yerDurumunuAyarla({}, 'osm:n1', { durum: 'haric', ad: 'X' });
        expect(y1['osm:n1']).toEqual({ durum: 'haric', ad: 'X' });
        expect(yerDurumunuAyarla(y1, 'osm:n1', { durum: 'normal' })['osm:n1']).toBeUndefined();
        const k = yerDurumunuAyarla({}, 'kendi:a', { durum: 'normal', kendi: true, lat: 1, lng: 2 });
        expect(k['kendi:a']).toMatchObject({ kendi: true });
    });

    it('kullanıcı yeri kimliği önekli ve zamana bağlı', () => {
        expect(kullaniciYeriKimligi(1_000)).toBe('kendi:rs');
    });
});

describe('olay zaman çizelgesi', () => {
    it('neden algılanmadı: şüpheli ölçüm ve kafe senaryosu açıklanır', () => {
        expect(olaySatiriOlustur({ zamanMs: 1, tur: 'olcum', sonuc: 'supheli', dogrulukM: 48 })?.aciklama).toContain('48 m doğruluk');
        expect(olaySatiriOlustur({ zamanMs: 1, tur: 'olcum', sonuc: 'disarida', yer: 'Kare Camii', mesafeM: 16 })?.baslik).toBe(
            'Hassas ölçüm: Kare Camii alanının 16 m dışındasınız'
        );
    });

    it('bilinmeyen olay atlanır, en yeni üstte', () => {
        const s = zamanCizelgesiOlustur([
            { zamanMs: 1, tur: 'dwell', yer: 'A', dk: 3 },
            { zamanMs: 3, tur: 'gelecekteki-bir-olay' },
            { zamanMs: 2, tur: 'camide', yer: 'A', mod: 'acildi' },
            { zamanMs: 4, tur: 'yenileme', sonuc: 'cokSik' },
        ]);
        expect(s.map((x) => x.zamanMs)).toEqual([2, 1]);
        expect(s[0].aciklama).toBe('Namaz modu açıldı.');
    });

    it('kılındı satırında Türkçe vakit adı (İkindi, toUpperCase tuzağı yok)', () => {
        expect(olaySatiriOlustur({ zamanMs: 1, tur: 'kildim', vakit: 'ikindi' })?.baslik).toBe('İkindi kılındı olarak işaretlendi');
    });
});

describe('vakit girişleri (adhan)', () => {
    it('cuma tespiti yerel takvim gününe göre', () => {
        expect(cumaMi('2026-10-16')).toBe(true);
        expect(cumaMi('2026-10-15')).toBe(false);
    });

    it('konum yoksa (0,0) boş; varsa dün + 8 gün, artan girişler', () => {
        expect(gunGirisleriniHesapla({ lat: 0, lng: 0 }, '2026-10-16')).toEqual([]);
        const g = gunGirisleriniHesapla({ lat: 41.01, lng: 28.97 }, '2026-10-16');
        expect(g).toHaveLength(9);
        expect(g[0].tarih).toBe('2026-10-15');
        expect(g[1].cuma).toBe(true);
        const p = kapiPencereleriniHesapla(g);
        expect(p).toHaveLength(45);
        expect(p.filter((x) => x.cuma)).toHaveLength(2);
    });
});

describe('Faz 2 ayarları ve güven olayları', () => {
    it('izleme kapsamı ve açılış biçimi: varsayılan yakındakiler + akıllı; bozuk değer varsayılana düşer', () => {
        expect(VARSAYILAN_CAMIDEYIM_AYARLARI).toMatchObject({ izlemeKapsami: 'yakindakiler', acilisBicimi: 'akilli' });
        expect(camideyimAyarlariniNormalize({ izlemeKapsami: 'secilenler', acilisBicimi: 'sorarak' })).toMatchObject({
            izlemeKapsami: 'secilenler',
            acilisBicimi: 'sorarak',
        });
        expect(camideyimAyarlariniNormalize({ izlemeKapsami: 'hepsi', acilisBicimi: 'zorla' })).toMatchObject({
            izlemeKapsami: 'yakindakiler',
            acilisBicimi: 'akilli',
        });
    });

    it('güven olayı: neden sorulduğunu sınıflarla anlatır', () => {
        const s = olaySatiriOlustur({
            zamanMs: 1,
            tur: 'guven',
            yer: 'Kare Camii',
            eylem: 'sor',
            guvenKarari: 'sor',
            zaman: 'ezanYakin',
            yerSinifi: 'tampon',
            hareket: 'durgun',
            tavan: null,
        });
        expect(s?.baslik).toBe('Emin olunamadı, size sorulacak: Kare Camii');
        expect(s?.aciklama).toBe('Ezan vaktine yakın · binanın hemen dışında · duruyordunuz.');
    });

    it('güven olayı: önünden geçme tavanı ve "Sorarak aç" notu', () => {
        expect(
            olaySatiriOlustur({ zamanMs: 1, tur: 'guven', yer: 'A', eylem: 'hicbir', guvenKarari: 'hicbir', hareket: 'hareketli', tavan: 'gecipGidiyor' })
                ?.aciklama
        ).toContain('Önünden geçiyor gibiydiniz');
        expect(
            olaySatiriOlustur({ zamanMs: 1, tur: 'guven', yer: 'A', eylem: 'sor', guvenKarari: 'otomatik', bicim: 'sorarak' })?.aciklama
        ).toContain('"Sorarak aç" seçili');
    });

    it('soru cevapları zaman çizelgesinde görünür', () => {
        expect(olaySatiriOlustur({ zamanMs: 1, tur: 'soruRet', yer: 'A' })?.aciklama).toBe('Bu vakit için burada bir daha sorulmayacak.');
        expect(olaySatiriOlustur({ zamanMs: 1, tur: 'soruKabul', yer: 'A' })?.baslik).toBe('Camide olduğunuzu onayladınız · A');
    });

    it('cümle başı büyütme Türkçe: i → İ (toUpperCase tuzağı yok)', () => {
        expect(ilkHarfiBuyut('içinde')).toBe('İçinde');
        expect(ilkHarfiBuyut('ışık')).toBe('Işık');
        expect(ilkHarfiBuyut('')).toBe('');
    });
});
