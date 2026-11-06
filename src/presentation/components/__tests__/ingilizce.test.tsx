/**
 * Ortak bileşenler, konum seçicileri, izin açıklaması, hata ekranı, Kıldım onayı ve tablet
 * ev ekranı İngilizce çizilince Türkçe metin kalmaz (dil çıkarımı nöbetçisi). Yer adları
 * (il, ilçe) veridir; çevrilmez.
 */
import * as React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

const mockRenkler = {
  arkaplan: '#FAFAFA', kartArkaplan: '#FFFFFF', birincil: '#4CAF50', birincilKoyu: '#388E3C', birincilMetin: '#FFFFFF',
  metin: '#212121', metinIkincil: '#757575', sinir: '#E0E0E0', hata: '#F44336', basarili: '#4CAF50', bilgi: '#2196F3',
  durum: { basarili: '#4CAF50', uyari: '#FFC107', hata: '#F44336', bilgi: '#2196F3', dikkat: '#E65100' },
};
jest.mock('../../../core/theme', () => {
  const gercek = jest.requireActual('../../../core/theme/temalar');
  return { ...gercek, useRenkler: () => mockRenkler, useTema: () => ({ koyuMu: false }) };
});
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text: T } = require('react-native');
  return (props: { name: string }) => <T>{`[${props.name}]`}</T>;
});
jest.mock('../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: () => undefined }));
jest.mock('../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => true }));
jest.mock('../../hooks/useHesapSurumu', () => ({ useHesapSurumu: () => 0 }));
jest.mock('expo-keep-awake', () => ({ useKeepAwake: () => undefined }));

import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';
import { IlIlceSecici } from '../IlIlceSecici';
import { KonumIzniDisclosureModali } from '../KonumIzniDisclosureModali';
import { YeniOzellikKarti } from '../YeniOzellikKarti';
import { YuklemeGostergesi } from '../YuklemeGostergesi';
import ErrorBoundary from '../common/ErrorBoundary';
import { BildirimModali } from '../common/BildirimModali';
import { SayisalSecici } from '../common/SayisalSecici';
import { SayiGirisModali } from '../common/SayiGirisModali';
import { KonumYenileButonu } from '../common/KonumYenileButonu';
import { Yukleniyor } from '../ortak/BosDurum';
import { KaydedildiIsareti } from '../ortak/Kaydedildi';
import { RizaModali } from '../ortak/RizaModali';
import { GeriAlBandiKatmani, geriAlBandiGoster, geriAlBandiniKapat } from '../ortak/GeriAlBandi';
import { BolumBasligi } from '../ortak/BolumBasligi';
import { KildimIzinModali } from '../kildim/KildimIzinModali';
import { EvEkraniPanosu } from '../evEkrani/EvEkraniPanosu';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { YENI_OZELLIKLER } from '../../../core/constants/YeniOzellikler';

const YASAKLI = ['Kapat', 'Konum', 'Ayar', 'Namaz', 'Vakit', 'vakit', 'Geri', 'Vazge', 'Yeni', 'Seç', 'Tekrar', 'Dene', 'Pil', 'Kaydedildi', 'dk\\b'];

let geriAl: () => void;
beforeEach(() => {
  geriAl = ingilizceyeGec();
});
afterEach(() => geriAl());

const kalan = (el: React.ReactElement) => turkceKalanlar(render(el).toJSON() as never, YASAKLI);
const bos = () => undefined;

it('il/ilçe seçici: kapalı düğme ve açık il listesi (il adları veri)', () => {
  expect(kalan(<IlIlceSecici seciliIlId={null} seciliIlceId={null} seciliIlAdi="" seciliIlceAdi="" onKonumSec={async () => undefined} />)).toEqual([]);
  const e = render(<IlIlceSecici seciliIlId={null} seciliIlceId={null} seciliIlAdi="" seciliIlceAdi="" onKonumSec={async () => undefined} />);
  fireEvent.press(e.getByText('Choose a location...'));
  expect(e.getByText('Choose a province')).toBeTruthy();
  expect(e.getByText('81 provinces listed')).toBeTruthy();
  // Liste satırları il adı (veri) + koordinat; koordinat soneki İngilizce olmalı.
  const metinler = turkceKalanlar(e.toJSON() as never, YASAKLI).filter((m) => !/^[A-ZÇĞİÖŞÜ]/.test(m) || m.includes(' '));
  expect(metinler).toEqual([]);
  expect(e.getAllByText(/°N, .*°E$/).length).toBeGreaterThan(0);
});

it('konum izni açıklaması: üç tür de İngilizce, maddeler eksiksiz', () => {
  for (const tip of ['onPlan', 'arkaPlan', 'camideyim'] as const) {
    expect(kalan(<KonumIzniDisclosureModali gorunur tip={tip} onKabul={bos} onReddet={bos} />)).toEqual([]);
  }
  const e = render(<KonumIzniDisclosureModali gorunur tip="arkaPlan" onKabul={bos} onReddet={bos} />);
  expect(e.getByText('Background location use')).toBeTruthy();
  expect(e.getByText('Turn it off anytime')).toBeTruthy();
});

it('hata ekranı (ErrorBoundary) İngilizce', () => {
  const Patlayan = () => {
    throw new Error('boom');
  };
  const sus = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    const e = render(
      <ErrorBoundary name="Test">
        <Patlayan />
      </ErrorBoundary>,
    );
    expect(e.getByText('Something went wrong')).toBeTruthy();
    expect(turkceKalanlar(e.toJSON() as never, YASAKLI)).toEqual([]);
  } finally {
    sus.mockRestore();
  }
});

it('ortak parçalar: modal varsayılanları, sayaç, yükleniyor, kaydedildi, rıza, geri al bandı, bölüm başlığı', () => {
  expect(kalan(<BildirimModali gorunur tip="bilgi" baslik="Title" mesaj="Body" onKapat={bos} />)).toEqual([]);
  expect(kalan(<SayisalSecici deger={5} min={0} max={10} onChange={bos} renk="#000" />)).toEqual([]);
  expect(kalan(<SayisalSecici deger={5} min={0} max={10} onChange={bos} renk="#000" aciklama="Minutes" />)).toEqual([]);
  expect(
    kalan(
      <SayiGirisModali gorunur baslik="Add" aciklama="How many?" placeholder="0" onayMetni="Add" deger="" onDegisim={bos} onIptal={bos} onOnay={bos} />,
    ),
  ).toEqual([]);
  expect(kalan(<KonumYenileButonu onPress={bos} />)).toEqual([]);
  expect(kalan(<YuklemeGostergesi />)).toEqual([]);
  expect(kalan(<Yukleniyor gecikmeMs={0} />)).toEqual([]);
  expect(kalan(<KaydedildiIsareti gorunur />)).toEqual([]);
  expect(
    kalan(<RizaModali gorunur ikon="bell" baslik="Allow?" maddeler={[]} onaylaEtiketi="Allow" onOnayla={bos} onVazgec={bos} />),
  ).toEqual([]);
  const bant = render(<GeriAlBandiKatmani />);
  act(() => geriAlBandiGoster({ mesaj: 'Marked', geriAl: bos }));
  expect(bant.getByText('Undo')).toBeTruthy();
  expect(turkceKalanlar(bant.toJSON() as never, YASAKLI)).toEqual([]);
  act(() => geriAlBandiniKapat());
  // İngilizce büyük harf: Türkçe "i → İ" eşlemesi uygulanmaz.
  expect(render(<BolumBasligi metin="Reminders" />).getByText('REMINDERS')).toBeTruthy();
  expect(render(<Text>ok</Text>).getByText('ok')).toBeTruthy();
});

it('Kıldım onayı: kimlik Türkçe, görünen vakit İngilizce', () => {
  const ortak = { kimliksizBaslik: 'Mark Dhuhr as prayed?', kimliksizMesaj: 'From a link.', onHerZaman: bos, onBuSefer: bos, onEngelle: bos, onVazgec: bos };
  const kimliksiz = render(<KildimIzinModali vakitAdi={NamazAdi.Ogle} baslatan={null} {...ortak} />);
  expect(kimliksiz.getByText("I've prayed")).toBeTruthy();
  expect(turkceKalanlar(kimliksiz.toJSON() as never, YASAKLI)).toEqual([]);
  const tanidik = render(
    <KildimIzinModali
      vakitAdi={NamazAdi.Ogle}
      baslatan={{ eylem: 'sor', paket: 'net.dinglisch.android.taskerm', ad: 'Tasker', herZaman: true, engel: true }}
      {...ortak}
    />,
  );
  expect(tanidik.getByText(/Prayer to be marked now: Dhuhr\./)).toBeTruthy();
  expect(turkceKalanlar(tanidik.toJSON() as never, YASAKLI)).toEqual([]);
});

it('yeni özellik kartı çerçevesi ve tablet ev ekranı İngilizce', () => {
  const ozellik = { ...YENI_OZELLIKLER[0], baslik: 'Feature', aciklama: 'Details', ctaEtiketi: undefined };
  expect(kalan(<YeniOzellikKarti ozellik={ozellik} onAc={bos} onKapat={bos} />)).toEqual([]);
  const pano = render(<EvEkraniPanosu lat={51.5} lng={-0.12} konumMetni="London" onKapat={bos} />);
  expect(pano.getByText('Back to the app')).toBeTruthy();
  expect(pano.getByText('Fajr')).toBeTruthy();
  expect(turkceKalanlar(pano.toJSON() as never, YASAKLI)).toEqual([]);
});
