/**
 * Acil ton kisiti notu (issue #274, Fable incelemesi): son 15 dk disindaki ya da
 * giris yonlu acil adim SERT konusur ve Rahatsiz Etmeyin'i delmez. Bu bilincli
 * urun karari mevcut kayitlarin davranisini degistirdi → ekranda soylenmeli.
 */
jest.mock('../../../../core/theme', () => ({ useRenkler: () => ({}) }));
jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');

import { acilKisitNotu, adimNotlariniOlustur } from '../AdimNotlari';
import type { SeviyeAyari } from '../../../../core/muhafiz/matrisTipleri';
import type { PencereYonu } from '../../../../core/muhafiz/pencereTipleri';

const adim = (o: Partial<SeviyeAyari>): SeviyeAyari => ({
    kademe: 'acil',
    kanallar: { bildirim: true },
    esikDk: 5,
    siklik: 'birkez',
    bildirimSesi: 'varsayilan',
    anonsMetni: '',
    ...o,
});

const notlar = (seviye: SeviyeAyari, yon: PencereYonu = 'cikisaDogru') =>
    adimNotlariniOlustur(seviye, [seviye], { pencereAdi: 'yatsı', pencereUzunluguDk: 300, yon }).map(
        (n) => n.metin
    );

describe('AdimNotlari — acil ton kısıtı', () => {
    it('çıkışta 15 dk üstü acil adım: sert tonda çalıştığı söylenir', () => {
        expect(notlar(adim({ esikDk: 40, acilKanal: true }))).toContain(
            'Bu adım vaktin son 15 dakikası dışında olduğu için sert tonda çalışır; Rahatsız Etmeyin’i delmez'
        );
    });

    it('giriş yönünde acil adım: kendi yönüne uygun not', () => {
        expect(notlar(adim({ esikDk: 5 }), 'girisindenItibaren')).toContain(
            acilKisitNotu('girisindenItibaren')
        );
    });

    it('geçerli acil adım (çıkış, ≤15 dk): not ÇIKMAZ', () => {
        expect(notlar(adim({ esikDk: 15, acilKanal: true })).join(' ')).not.toContain('Rahatsız');
    });

    it('erken adımda acilKanal bayrağı (eski alarm sesi göçü): DND notu', () => {
        expect(notlar(adim({ kademe: 'nazik', esikDk: 45, acilKanal: true }))).toContain(
            'Bu adım vaktin son 15 dakikası dışında olduğu için Rahatsız Etmeyin’i delmez'
        );
    });

    it('kapalı adımda not YOK', () => {
        expect(notlar(adim({ esikDk: 40, kanallar: {} }))).toEqual([]);
    });
});
