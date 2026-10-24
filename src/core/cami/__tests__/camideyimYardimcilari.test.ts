import {
    VARSAYILAN_CAMIDEYIM_AYARLARI,
    camideyimAyarlariniNormalize,
    kullaniciYeriKimligi,
    yerDurumunuAyarla,
} from '../camideyimAyarlari';
import { ilkHarfiBuyut, olaySatiriOlustur, zamanCizelgesiOlustur } from '../olayMetinleri';
import { cumaMi, gunGirisleriniHesapla } from '../vakitGirisleri';
import { kapiPencereleriniHesapla } from '../camiKarar';
import { aktifDiliKur, aktifDilSifirla } from '../../dil/aktifDil';
import { EYLEM_METNI, guvenOrnekleriOlustur } from '../guvenOrnekleri';
import { sinirAciklamasi } from '../sinirAyari';
import { mesafeKmYaz } from '../geometri';
import { namazModuMetni } from '../../namazModu/namazModuMetni';
import { iosSessizOzeti } from '../../sessiz/iosSessizKurulum';

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

    it('yenileme: kaba konum (D-09) kullanıcıya bayat konum gibi anlatılır', () => {
        expect(olaySatiriOlustur({ zamanMs: 1, tur: 'yenileme', sonuc: 'kabaKonum', dogrulukM: 900 })?.baslik).toBe(
            'Konum yeterince kesin ölçülemedi; liste daha sonra yenilenecek'
        );
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

describe('Camideyim metinleri — İngilizce', () => {
    const TR = /[çğıöşüÇĞİÖŞÜ]/;
    beforeEach(() => aktifDiliKur('en'));
    afterEach(() => aktifDilSifirla());

    it('her olay satırı, güven örnekleri, sınır ve özet metinleri İngilizce', () => {
        const olaylar: Record<string, unknown>[] = [
            { tur: 'izlemeKuruldu', sayi: 1 },
            { tur: 'izinYok', izin: 'arkaPlanYok' },
            { tur: 'izinYok' },
            { tur: 'izlemeHatasi' },
            { tur: 'dwell', yer: 'Mosque A', dk: 3 },
            { tur: 'vakitDisi' },
            { tur: 'olcum', sonuc: 'camide', yer: 'Mosque A', dogrulukM: 12 },
            { tur: 'olcum', sonuc: 'supheli', dogrulukM: 48 },
            { tur: 'olcum', sonuc: 'supheli' },
            { tur: 'olcum', sonuc: 'disarida', yer: 'Mosque A', mesafeM: 30 },
            { tur: 'olcum', sonuc: 'disarida' },
            { tur: 'olcum', sonuc: 'konumYok' },
            { tur: 'guven', eylem: 'otomatik', zaman: 'ezanYakin', yerSinifi: 'poligonIci', hareket: 'durgun' },
            { tur: 'guven', eylem: 'sor', bicim: 'sorarak', guvenKarari: 'otomatik', zaman: 'kapiIci', yerSinifi: 'noktaKenar', hareket: 'yavas' },
            { tur: 'guven', eylem: 'hicbir', tavan: 'gecipGidiyor', zaman: 'serbest', yerSinifi: 'kullaniciAlani', hareket: 'hareketli' },
            { tur: 'soruldu' },
            { tur: 'soruKabul' },
            { tur: 'soruRet' },
            { tur: 'soruCikis' },
            { tur: 'reddedilmis' },
            ...['acildi', 'kullaniciKapatti', 'erisimYok', 'sessiz'].map((mod) => ({ tur: 'camide', mod })),
            { tur: 'cikis', dk: 1 },
            { tur: 'sure' },
            { tur: 'kapatildi' },
            { tur: 'haricTutuldu' },
            { tur: 'modElleKapatildi' },
            { tur: 'kildim', vakit: 'ogle' },
            { tur: 'kildim' },
            ...['yenile', 'bayatKonum', 'kabaKonum'].map((sonuc) => ({ tur: 'yenileme', sonuc })),
        ];
        for (const o of olaylar) {
            const s = olaySatiriOlustur({ zamanMs: 1, ...o } as never);
            expect(s).not.toBeNull();
            expect(`${s!.baslik} ${s!.aciklama ?? ''}`).not.toMatch(TR);
        }
        expect(olaySatiriOlustur({ zamanMs: 1, tur: 'kildim', vakit: 'ogle' })!.baslik).toBe('Dhuhr marked as prayed');
        expect(olaySatiriOlustur({ zamanMs: 1, tur: 'izlemeKuruldu', sayi: 1 })!.baslik).toBe('Watching 1 place near you');
        expect(olaySatiriOlustur({ zamanMs: 1, tur: 'cikis', yer: 'Mosque A', dk: 1 })!.aciklama).toBe('You stayed 1 minute.');
        expect(olaySatiriOlustur({ zamanMs: 1, tur: 'soruKabul' })!.baslik).toMatch(/· Mosque$/);
        // Cümle başı: İngilizcede noktalı `i` yine `I` olur (Türkçe `İ` değil).
        expect(ilkHarfiBuyut('inside the mosque')).toBe('Inside the mosque');
        for (const o of guvenOrnekleriOlustur({ acilisBicimi: 'akilli', beklemeDk: 3, vakitKapisi: true })) {
            expect(`${o.baslik} ${EYLEM_METNI[o.eylem]}`).not.toMatch(TR);
        }
        const sinir = [
            sinirAciklamasi({ poligonVar: true, yaricapM: 30, alanM: null, olcek: null, kendi: false }),
            sinirAciklamasi({ poligonVar: true, yaricapM: 30, alanM: null, olcek: 2, kendi: false }),
            sinirAciklamasi({ poligonVar: true, yaricapM: 30, alanM: 60, olcek: null, kendi: false }),
            sinirAciklamasi({ poligonVar: false, yaricapM: 30, alanM: 60, olcek: null, kendi: false }),
            sinirAciklamasi({ poligonVar: false, yaricapM: 30, alanM: 60, olcek: null, kendi: true }),
        ];
        for (const s of sinir) expect(s).not.toMatch(TR);
        for (const n of [namazModuMetni(28, 'filtre'), namazModuMetni(35, 'kural')]) expect(`${n.giris} ${n.anahtar}`).not.toMatch(TR);
        expect([0, 1, 3].map((n) => iosSessizOzeti({ tamam: (['odak', 'cami', 'vakit'] as const).slice(0, n), dakika: 20 }))).toEqual([
            'Set up with Focus',
            '1/3 steps done',
            'Set up with Focus',
        ]);
        expect(mesafeKmYaz(1450)).toBe('1.4 km');
    });
});
