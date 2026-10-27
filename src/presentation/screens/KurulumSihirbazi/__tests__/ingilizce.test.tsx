/**
 * Kurulum sihirbazı İngilizce çizildiğinde Türkçe metin kalmaz (dil çıkarımı nöbetçisi).
 * Cırcırın göremediği Türkçe harfsiz sözcükler `YASAKLI` listesiyle yakalanır.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return ({ name }: { name: string }) => <Text>{`[${name}]`}</Text>;
});
const RENKLER = {
  birincil: '#4CAF50', arkaplan: '#FAFAFA', kartArkaplan: '#FFFFFF', metin: '#212121', metinIkincil: '#757575',
  sinir: '#E0E0E0', basarili: '#4CAF50', dikkat: '#E65100', bilgi: '#2196F3', hata: '#F44336', uyari: '#FFC107',
  durum: { bilgi: '#2196F3', uyari: '#FFC107', dikkat: '#E65100', basarili: '#4CAF50', hata: '#F44336' },
  birincilMetin: '#FFFFFF',
};
jest.mock('../../../../core/theme', () => ({ useRenkler: () => RENKLER, useTema: () => ({ koyuMu: false }) }));
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => true }));
jest.mock('../../../components/DunyaSehirSecici', () => ({ DunyaSehirSecici: () => null }));

import { BildirimAdimi, DuzeyAdimi, HazirAdimi, HosgeldinizAdimi, KonumAdimi, VARSAYILAN_KURULUM_SECIMLERI } from '../adimlar';
import { ingilizceyeGec, turkceKalanlar } from '../../../../__tests__/yardimci/ingilizceDenetimi';

/** Türkçe harfsiz ama Türkçe sözcükler (bu ekranlarda geçebilecek). */
const YASAKLI = ['Konum', 'Bildirim', 'Kıldım', 'Ayarlar', 'Sade', 'Cuma', 'Hafif', 'Kapal', 'Evet', 'Hayır', 'Hesap', 'Vakit', 'dk'];

let geriAl: () => void;
beforeEach(() => {
  geriAl = ingilizceyeGec();
});
afterEach(() => geriAl());

const bos = () => undefined;
const kalan = (el: React.ReactElement) => turkceKalanlar(render(el).toJSON() as never, YASAKLI);

it('karşılama (ve gerçekten İngilizce çizildiği)', () => {
  expect(kalan(<HosgeldinizAdimi />)).toEqual([]);
  expect(render(<HosgeldinizAdimi />).getByText('Everything stays on this phone')).toBeTruthy();
});

it('konum: bekliyor, alındı, il listesi, başka ülke', () => {
  const ortak = { izin: 'reddedildi' as const, izinSonucu: 'ayarlar' as const, manuelIl: null, onIlSec: bos, onBolge: bos, dunyaSehri: null, onDunyaSehriSec: bos };
  expect(kalan(<KonumAdimi {...ortak} durum="bekliyor" konumBilgi="" hata={null} bolge="turkiye" />)).toEqual([]);
  expect(kalan(<KonumAdimi {...ortak} durum="alindi" konumBilgi="London" hata={null} bolge="turkiye" />)).toEqual([]);
  // İl listesi Türkçe yer adıdır (çevrilmez): yalnız liste dışı metinler denetlenir.
  const il = render(<KonumAdimi {...ortak} durum="manuel" konumBilgi="" hata="We couldn’t find your location." bolge="turkiye" />);
  const ilDisi = turkceKalanlar(il.toJSON() as never, YASAKLI).filter((m) => !/^[A-ZÇĞİÖŞÜ][a-zçğıöşü]+$/.test(m) && !m.startsWith('['));
  expect(ilDisi).toEqual([]);
  expect(kalan(<KonumAdimi {...ortak} durum="manuel" konumBilgi="" hata={null} bolge="dunya" />)).toEqual([]);
});

it('bildirim: verildi, ret, kalıcı ret', () => {
  expect(kalan(<BildirimAdimi izin="verildi" izinSonucu={null} />)).toEqual([]);
  expect(kalan(<BildirimAdimi izin="sorulabilir" izinSonucu="tekrarDene" />)).toEqual([]);
  expect(kalan(<BildirimAdimi izin="reddedildi" izinSonucu="ayarlar" />)).toEqual([]);
});

it('düzey: ana cihaz sorusu, işaretlemiyorum notu, bütün kartlar', () => {
  expect(
    kalan(
      <DuzeyAdimi
        duzey="normal"
        onDuzey={bos}
        secimler={{ ...VARSAYILAN_KURULUM_SECIMLERI, isaretler: 'hayir' }}
        onIsaretler={bos}
        onSecim={bos}
        onSabahAlarmiIste={bos}
        sesliBilgi="Read aloud works like an alarm."
        sesliOrnek="Dhuhr ends in 3 minutes."
        sade={false}
        onSade={bos}
        anaCihaz={{ secili: 'hayir', onSec: bos }}
      />,
    ),
  ).toEqual([]);
});

it('hazır: her satır açık', () => {
  expect(
    kalan(
      <HazirAdimi
        ozet={{ konum: 'London', bildirim: true, duzey: 'yogun', sade: true, yontem: 'Moonsighting · Earlier Asr', secimler: { isaretler: 'evet', sesli: true, gece: true, sabahAlarm: true, cuma: true } }}
        hata="Settings could not be saved."
      />,
    ),
  ).toEqual([]);
});

it('dil bağlantısı: yalnız verilince çizilir, iki dillidir', () => {
  const { getByTestId, getByText } = render(<HosgeldinizAdimi onDil={bos} />);
  expect(getByTestId('kurulum-dil-baglantisi')).toBeTruthy();
  expect(getByText('Language · Dil')).toBeTruthy();
  expect(render(<HosgeldinizAdimi />).queryByTestId('kurulum-dil-baglantisi')).toBeNull();
});
