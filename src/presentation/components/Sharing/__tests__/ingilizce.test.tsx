/**
 * Paylaşım kartları, paylaşım modalı, rozet kartı ve toparlanma modalı İngilizce
 * çizildiğinde Türkçe metin kalmaz (dil çıkarımı nöbetçisi). Rozet adı slice'taki
 * (yükleme anının dilindeki) kopyadan değil, kimlikten çizilir.
 */
import React from 'react';
import { Text } from 'react-native';
import { cleanup, render, fireEvent, waitFor } from '@testing-library/react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

jest.mock('@expo/vector-icons', () => {
  const { Text: T } = require('react-native');
  return { FontAwesome5: (props: { name: string }) => <T>{`[${props.name}]`}</T>, MaterialIcons: () => null };
});
jest.mock('@expo/vector-icons/FontAwesome5', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').FontAwesome5 }));
jest.mock('@expo/vector-icons/MaterialIcons', () => ({ __esModule: true, default: () => null }));
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
    arkaplan: '#FAFAFA',
    hata: '#F44336',
    bilgi: '#2196F3',
    basarili: '#10b981',
    durum: { basarili: '#4CAF50' },
  }),
  useTema: () => ({ koyuMu: false }),
}));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => true }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: (props: object) => <View {...props} /> };
});
// Toparlanma kartının kendi metinleri bu alanın dışında; burada yalnız modalın kendisi denetlenir.
jest.mock('../../ToparlanmaKarti', () => ({ ToparlanmaKarti: () => null }));

import { PaylasilabilirSeri } from '../PaylasilabilirSeri';
import { PaylasilabilirRozet } from '../PaylasilabilirRozet';
import { PaylasilabilirKutlama } from '../PaylasilabilirKutlama';
import { PaylasimModal } from '../PaylasimModal';
import { RozetKarti } from '../../RozetKarti';
import { ToparlanmaModal } from '../../ToparlanmaModal';
import {
  enUzunSeriKutlamasiOlustur,
  hedefKutlamasiOlustur,
  rozetKutlamasiOlustur,
  seviyeKutlamasiOlustur,
  toparlanmaKutlamasiOlustur,
} from '../../../../domain/services/RozetYoneticisiServisi';
import { ROZET_TANIMLARI, SEVIYE_TANIMLARI, type RozetDetay } from '../../../../core/types/SeriTipleri';
import { ingilizceyeGec, turkceKalanlar } from '../../../../__tests__/yardimci/ingilizceDenetimi';

/** Türkçe harfsiz ama Türkçe sözcükler (bu kartlarda geçebilecek). */
const YASAKLI = ['Seri', 'seri', 'Rozet', 'rozet', 'Efsane', 'Kapat', 'Tamam', 'Allah daim', 'Namaz\\b', 'BRONZ\\b', 'ALTIN', 'kilitli'];

let geriAl: () => void;
beforeEach(() => {
  geriAl = ingilizceyeGec();
});
afterEach(() => {
    // Önce ağaçları kaldır: dil geri dönerken takılı ekranlar act dışında yeniden çizilmesin.
    cleanup();
    geriAl();
  });

const kalan = (el: React.ReactElement) => turkceKalanlar(render(el).toJSON() as never, YASAKLI);

/** Slice'ta Türkçe saklanmış (yükleme anının dili) bir rozet kopyası. */
const turkceKopya = (id: string, kazanildiMi: boolean): RozetDetay =>
  ({
    id,
    ad: 'İlk Adım',
    aciklama: 'İlk haftayı tamamladınız!',
    kosulAciklamasi: '7 günlük seri',
    ikon: '🌱',
    tip: 'seri',
    seviye: 'bronz',
    kosul: 7,
    rozetId: id,
    kazanildiMi,
    kazanilmaTarihi: kazanildiMi ? '2026-10-14T10:00:00.000Z' : null,
  }) as RozetDetay;

it('seri ve rozet paylaşım kartları', () => {
  expect(kalan(<PaylasilabilirSeri mevcutSeri={12} enUzunSeri={30} />)).toEqual([]);
  expect(render(<PaylasilabilirSeri mevcutSeri={1} enUzunSeri={1} />).getByText('My Longest Streak: 1 Day')).toBeTruthy();
  const r = render(<PaylasilabilirRozet rozet={turkceKopya('ilk_adim', true)} />);
  expect(r.getByText('First Step')).toBeTruthy();
  expect(turkceKalanlar(r.toJSON() as never, YASAKLI)).toEqual([]);
});

it('kutlama kartları (her kutlama tipi)', () => {
  const kutlamalar = [
    rozetKutlamasiOlustur(ROZET_TANIMLARI[0]),
    hedefKutlamasiOlustur(21, 'Habit Master'),
    seviyeKutlamasiOlustur(SEVIYE_TANIMLARI[2]),
    toparlanmaKutlamasiOlustur(9),
    enUzunSeriKutlamasiOlustur(40),
  ];
  for (const k of kutlamalar) expect(kalan(<PaylasilabilirKutlama kutlama={k} />)).toEqual([]);
  expect(kutlamalar[0].mesaj).toBe('You earned the "First Step" badge.');
  expect(kutlamalar[2].mesaj).toBe('You now continue as "Salik". May Allah make it lasting.');
});

it('paylaşım modalı ve bildirimleri', async () => {
  (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);
  (captureRef as jest.Mock).mockResolvedValue('file:///x.png');
  const r = render(
    <PaylasimModal gorunur onKapat={() => undefined}>
      <Text>card</Text>
    </PaylasimModal>
  );
  expect(r.getByText('Share your progress')).toBeTruthy();
  expect(turkceKalanlar(r.toJSON() as never, YASAKLI)).toEqual([]);
  fireEvent.press(r.getByText('Add to your story'));
  await waitFor(() => expect(r.getByText("Sharing isn't available on this device.")).toBeTruthy());
  expect(turkceKalanlar(r.toJSON() as never, YASAKLI)).toEqual([]);
});

it('rozet kartı: ad/açıklama kimlikten, nadirlik etiketi ve tarih İngilizce', () => {
  const kazanilmis = render(<RozetKarti rozet={turkceKopya('ilk_adim', true)} />);
  expect(kazanilmis.getByText('First Step')).toBeTruthy();
  expect(kazanilmis.getByText('BRONZE')).toBeTruthy();
  expect(kazanilmis.getByText('14 October 2026')).toBeTruthy();
  expect(kazanilmis.getByLabelText('First Step badge, earned')).toBeTruthy();
  expect(turkceKalanlar(kazanilmis.toJSON() as never, YASAKLI)).toEqual([]);
  const kilitli = render(<RozetKarti rozet={turkceKopya('efsane', false)} />);
  expect(kilitli.getByText('90-day streak')).toBeTruthy();
  expect(turkceKalanlar(kilitli.toJSON() as never, YASAKLI)).toEqual([]);
  expect(kalan(<RozetKarti rozet={turkceKopya('bin_namaz', true)} kompakt />)).toEqual([]);
});

it('toparlanma modalı', () => {
  const r = render(
    <ToparlanmaModal
      gorunur
      onKapat={() => undefined}
      oncekiSeri={5}
      toparlanmaDurumu={{ tamamlananGun: 1, baslangicTarihi: '2026-10-20', hedefGunSayisi: 2, oncekiSeri: 5 } as never}
    />
  );
  expect(r.getByText('Got it')).toBeTruthy();
  expect(turkceKalanlar(r.toJSON() as never, YASAKLI)).toEqual([]);
});
