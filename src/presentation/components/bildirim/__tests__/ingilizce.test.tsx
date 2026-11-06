/**
 * Bildirim sınırı bileşenleri (bütçe kartı, sınır sayfası, bileklik rehberi, geri al çubuğu)
 * İngilizce çizildiğinde Türkçe metin kalmaz (dil çıkarımı nöbetçisi).
 */
import React from 'react';
import { Platform } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { useRenkler } from '../../../../core/theme';
import { defterOzeti, type DefterKaydi } from '../../../../core/bildirim/bildirimDefteri';
import type { ButceOnerisi } from '../../../../core/bildirim/butceOnerileri';
import { BildirimButceKarti } from '../BildirimButceKarti';
import { BildirimSiniriSayfasi } from '../BildirimSiniriSayfasi';
import { BileklikRehberKarti } from '../BileklikRehberKarti';
import { GeriAlBildirimi } from '../GeriAlBildirimi';
import { ingilizceyeGec, turkceKalanlar } from '../../../../__tests__/yardimci/ingilizceDenetimi';

jest.mock('../../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{`[${props.name}]`}</Text>;
});
const mockCihaz: { samsung: boolean | null } = { samsung: null };
jest.mock('../../../hooks/useCihazDurumu', () => ({
    useCihazDurumu: () => ({ durum: mockCihaz, yenile: jest.fn() }),
}));

const RENKLER = {
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    kartArkaplan: '#FFFFFF',
    arkaplan: '#FAFAFA',
    metin: '#212121',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    durum: { hata: '#F44336', dikkat: '#E65100', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3' },
};

/** Türkçe harfsiz ama Türkçe sözcükler (bu bileşenlerde geçebilecek). */
const YASAKLI = ['Bildirim', 'bildirim\\b', 'Kapat', 'Tamam', 'Geri al', 'Uygula', 'Sinir', 'Ayarlar', 'Uygulamalar'];

const kayitlar = (n: number, kaynak: DefterKaydi['kaynak'] = 'muhafiz', yedek = false): DefterKaydi[] =>
    Array.from({ length: n }, (_, i) => ({ kaynak, zamanMs: i + 1, tur: 'bildirim', ...(yedek ? { yedek: true as const } : {}) }));

const kalan = (el: React.ReactElement) => turkceKalanlar(render(el).toJSON() as never, YASAKLI);
const bos = () => undefined;

let geriAl: () => void;
beforeEach(() => {
    (useRenkler as jest.Mock).mockReturnValue(RENKLER);
    geriAl = ingilizceyeGec();
});
afterEach(() => act(() => geriAl()));

describe('Bildirim sınırı bileşenleri — İngilizce', () => {
    it('bütçe kartı: yaklaşma, aşma (iOS) ve Android', () => {
        expect(kalan(<BildirimButceKarti ozet={defterOzeti(kayitlar(50), 'ios')} onPress={bos} />)).toEqual([]);
        expect(kalan(<BildirimButceKarti ozet={defterOzeti(kayitlar(58), 'ios')} onPress={bos} />)).toEqual([]);
        expect(kalan(<BildirimButceKarti ozet={defterOzeti(kayitlar(84), 'ios')} onPress={bos} />)).toEqual([]);
        expect(kalan(<BildirimButceKarti ozet={defterOzeti(kayitlar(400, 'nafile'), 'android')} onPress={bos} />)).toEqual([]);
    });

    it('sınır sayfası: ayrıntı (öneri, yedek, ek yol) ve ekleme modu', () => {
        const ozet = defterOzeti([...kayitlar(84), ...kayitlar(6, 'muhafiz', true)], 'ios');
        const oneri: ButceOnerisi = {
            tur: 'nafileGunuGunune',
            ikon: 'moon',
            baslik: 'Turn off voluntary prayer reminders',
            aciklama: 'Frees 10 slots.',
            oncekiToplam: 84,
            sonrakiToplam: 74,
            sinirAltinaIner: false,
            girdi: {} as ButceOnerisi['girdi'],
        };
        const ekYol = { etiket: 'Prayer Guardian settings', onPress: bos };
        expect(
            kalan(
                <BildirimSiniriSayfasi gorunur mod={{ tur: 'ayrinti' }} ozet={ozet} oneriler={[oneri]} ekYol={ekYol} onUygula={bos} onKapat={bos} />
            )
        ).toEqual([]);
        expect(
            kalan(<BildirimSiniriSayfasi gorunur mod={{ tur: 'ayrinti' }} ozet={defterOzeti(kayitlar(20), 'ios')} oneriler={[]} onUygula={bos} onKapat={bos} />)
        ).toEqual([]);
        expect(
            kalan(
                <BildirimSiniriSayfasi
                    gorunur
                    mod={{ tur: 'ekleme', baslik: 'Turn on read aloud?', sonraki: defterOzeti(kayitlar(70), 'ios') }}
                    ozet={defterOzeti(kayitlar(50), 'ios')}
                    oneriler={[oneri]}
                    ekYol={ekYol}
                    onUygula={bos}
                    onKapat={bos}
                />
            )
        ).toEqual([]);
    });

    it('bileklik rehberi (Android, açık; Samsung belirsiz) ve geri al çubuğu', () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        const ekran = render(<BileklikRehberKarti />);
        fireEvent.press(ekran.getByTestId('bileklik-rehberi-baslik'));
        expect(turkceKalanlar(ekran.toJSON() as never, YASAKLI)).toEqual([]);
        expect(kalan(<GeriAlBildirimi metin="Read aloud turned off." onGeriAl={bos} onKapat={bos} />)).toEqual([]);
    });
});
