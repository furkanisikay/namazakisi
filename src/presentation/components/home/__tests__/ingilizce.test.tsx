/**
 * Ana ekran bileşenleri İngilizce çizildiğinde Türkçe metin kalmaz (dil çıkarımı nöbetçisi).
 * Kimlik değerleri (`NamazAdi.Ogle` = 'Öğle') prop olarak Türkçe gelir; ekranda görünen
 * ad sözlükten çözülmelidir. Cırcırın göremediği Türkçe harfsiz sözcükler `YASAKLI` ile yakalanır.
 */
import * as React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text: T } = require('react-native');
  return ({ name }: { name: string }) => <T>{`[${name}]`}</T>;
});
jest.mock('@expo/vector-icons/MaterialIcons', () => () => null);
jest.mock('expo-linear-gradient', () => ({ LinearGradient: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('expo-blur', () => ({ BlurView: () => null }));
const RENKLER = {
  birincil: '#4CAF50', arkaplan: '#FAFAFA', kartArkaplan: '#FFFFFF', metin: '#212121', metinIkincil: '#757575',
  sinir: '#E0E0E0', basarili: '#4CAF50', dikkat: '#E65100', bilgi: '#2196F3', hata: '#F44336', uyari: '#FFC107', vurgu: '#FF9800',
  durum: { bilgi: '#2196F3', uyari: '#FFC107', dikkat: '#E65100', basarili: '#4CAF50', hata: '#F44336' },
  birincilMetin: '#FFFFFF',
};
jest.mock('../../../../core/theme', () => ({ useRenkler: () => RENKLER, useTema: () => ({ koyuMu: false }) }));
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => true }));
jest.mock('../../Sharing/PaylasimModal', () => ({ PaylasimModal: () => null }));
jest.mock('../../Sharing/PaylasilabilirSeri', () => ({ PaylasilabilirSeri: () => null }));

import { NamazAdi } from '../../../../core/constants/UygulamaSabitleri';
import type { VakitBilgisi } from '../../../../domain/services/NamazVaktiHesaplayiciServisi';
import { bugunuAl } from '../../../../core/utils/TarihYardimcisi';
import { HomeHeader } from '../HomeHeader';
import { VakitKarti } from '../VakitKarti';
import { VakitAkisi } from '../VakitAkisi';
import { DurumAlani, DurumSeridi } from '../DurumAlani';
import { MasaustuGeriSayim } from '../MasaustuGeriSayim';
import { KazaOneriModal } from '../KazaOneriModal';
import { KerahatOnayModal } from '../KerahatOnayModal';
import { SeriKartiModal } from '../SeriKartiModal';
import { BolgeTakvimiModali } from '../BolgeTakvimiModali';
import { ingilizceyeGec, turkceKalanlar } from '../../../../__tests__/yardimci/ingilizceDenetimi';

/** Türkçe harfsiz ama Türkçe sözcükler (bu ekranlarda geçebilecek). */
const YASAKLI = ['Sabah', 'Vakit', 'vakit', 'Kaza', 'kaza', 'Seri', 'Toparlanma', 'puan', 'Bu hafta', 'Yine', 'Kapat', 'Tamam', 'dk', 'sa\\b', 'sn\\b', 'Cuma', 'Pazar', 'Mart', 'Nisan', 'Ekim'];

let geriAl: () => void;
beforeEach(() => {
  geriAl = ingilizceyeGec();
});
afterEach(() => geriAl());

const bos = () => undefined;
const kalan = (el: React.ReactElement) => turkceKalanlar(render(el).toJSON() as never, YASAKLI);
const SIMDI = Date.now();
const vakitBilgisi = { sonrakiVakitGiris: new Date(SIMDI + 90 * 60 * 1000).toISOString() } as unknown as VakitBilgisi;

it('başlık: bugün, aktif gün, seçili tarih, toparlanma', () => {
  const ortak = { tarih: bugunuAl(), streakGun: 3, onTarihTikla: bos, onSeriTikla: bos };
  expect(kalan(<HomeHeader {...ortak} bugunMu />)).toEqual([]);
  expect(kalan(<HomeHeader {...ortak} bugunMu={false} aktifGunMu />)).toEqual([]);
  expect(kalan(<HomeHeader {...ortak} bugunMu={false} />)).toEqual([]);
  expect(kalan(<HomeHeader {...ortak} bugunMu toparlanmaModu toparlanmaIlerleme={{ tamamlanan: 1, hedef: 3 }} />)).toEqual([]);
  expect(render(<HomeHeader {...ortak} bugunMu />).getByText('3 days')).toBeTruthy();
});

it('vakit kartı: şu anki, sıradaki (kilitli), kılınmış; kimlik Türkçe, görünen İngilizce', () => {
  const ortak = {
    vakitBilgisi, suankiVakitAdi: NamazAdi.Ikindi, vakitAraligi: '15:15 - 17:42', onTamamla: bos,
    konumModu: 'oto' as const, konumMetni: 'London', onKonumYenile: bos, yontemAdi: 'MWL', onYontem: bos,
  };
  expect(kalan(<VakitKarti {...ortak} tamamlandi={false} />)).toEqual([]);
  expect(kalan(<VakitKarti {...ortak} tamamlandi={false} kilitli />)).toEqual([]);
  expect(kalan(<VakitKarti {...ortak} tamamlandi onGeriAl={bos} kabulMetni="May Allah accept it" />)).toEqual([]);
  const e = render(<VakitKarti {...ortak} tamamlandi={false} />);
  expect(e.getByText('Asr')).toBeTruthy();
  expect(e.getByText('CURRENT PRAYER')).toBeTruthy();
});

it('vakit akışı: durumlar ve tam gün satırı', () => {
  const gun = bugunuAl();
  const namazlar = ([NamazAdi.Sabah, NamazAdi.Ogle, NamazAdi.Ikindi, NamazAdi.Aksam, NamazAdi.Yatsi] as const).map((namazAdi, i) => ({
    namazAdi, tamamlandi: i < 2, tarih: gun, saat: ['04:30', '13:15', '17:05', '20:10', '21:45'][i],
  }));
  const ortak = { namazlar, suankiVakitAdi: NamazAdi.Ikindi, onVakitTikla: bos, aktifGunMu: true, gunTarihiIso: gun, cumaEtiketi: true };
  expect(kalan(<VakitAkisi {...ortak} tamamlananSayisi={2} toplamSayi={5} />)).toEqual([]);
  const tamam = namazlar.map((n) => ({ ...n, tamamlandi: true }));
  expect(kalan(<VakitAkisi {...ortak} namazlar={tamam} tamamlananSayisi={5} toplamSayi={5} />)).toEqual([]);
});

it('durum alanı ve masaüstü sayacı', () => {
  const oge = (anahtar: 'kerahat' | 'seferilik', ozet: string) => ({ anahtar, ozet, dugum: <Text>{ozet}</Text> });
  expect(kalan(<DurumAlani ogeler={[oge('kerahat', 'makruh time'), oge('seferilik', 'travel info')]} />)).toEqual([]);
  expect(kalan(<DurumSeridi ikon="bolt" renk="#000" baslik="Recovery" metin="x" />)).toEqual([]);
  const ortak = { vakitAdi: 'Dhuhr', vakitAraligi: '13:00 - 16:30', hedefIso: vakitBilgisi.sonrakiVakitGiris };
  expect(kalan(<MasaustuGeriSayim {...ortak} tamamlandi kilitli={false} />)).toEqual([]);
  expect(kalan(<MasaustuGeriSayim {...ortak} tamamlandi={false} kilitli />)).toEqual([]);
});

it('modallar: kaza önerisi, kerahat onayı, seri kartı, bölge takvimi', () => {
  expect(
    kalan(<KazaOneriModal gorunur kilinanFarz={NamazAdi.Ogle} kazaNamazi="İkindi" onKildim={bos} onSimdiDegil={bos} onBirDahaSorma={bos} />),
  ).toEqual([]);
  expect(kalan(<KerahatOnayModal gorunur aciklama={null} namazAdi={NamazAdi.Ikindi} onOnayla={bos} onVazgec={bos} />)).toEqual([]);
  expect(kalan(<SeriKartiModal gorunur onKapat={bos} mevcutSeri={5} enUzunSeri={12} />)).toEqual([]);
  const bolge = render(
    <BolgeTakvimiModali
      gorunur
      ulkeAdi="Malaysia"
      yerAdi="Kuala Lumpur"
      koordinat={{ lat: 3.139, lng: 101.687 }}
      mevcut={{ profil: 'diyanet', ikindi: 'evvel' }}
      oneri={{ profil: 'jakim', ikindi: 'evvel', guven: 'genel' }}
      onKabul={bos}
      onReddet={bos}
    />,
  );
  expect(turkceKalanlar(bolge.toJSON() as never, YASAKLI)).toEqual([]);
  expect(bolge.getByText('Switch to JAKIM')).toBeTruthy();
});
