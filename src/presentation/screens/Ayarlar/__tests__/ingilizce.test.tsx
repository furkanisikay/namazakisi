/**
 * Ayarlar kökünün parçaları, kurulum sağlığı, sistem çipi, pil rehberi ve ayar arama
 * dizini İngilizce çizilince Türkçe metin kalmaz (dil çıkarımı nöbetçisi). Türkçe harfsiz
 * sözcükler (`Kapat`, `Konum`, `Ayarlar`) `YASAKLI` ile yakalanır.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: () => ({ params: undefined }),
}));
const mockRenkler = {
  arkaplan: '#ffffff', kartArkaplan: '#f0f0f0', birincil: '#4CAF50', birincilMetin: '#FFFFFF', metin: '#333333',
  metinIkincil: '#666666', sinir: '#cccccc', hata: '#F44336', basarili: '#4CAF50',
  durum: { basarili: '#4CAF50', uyari: '#FFC107', hata: '#F44336', bilgi: '#2196F3', dikkat: '#E65100' },
};
jest.mock('../../../../core/theme', () => ({ useRenkler: () => mockRenkler }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
  const { Text } = require('react-native');
  return (props: { name: string }) => <Text>{`[${props.name}]`}</Text>;
});
const mockKosullar = { current: {} as Record<string, unknown> };
jest.mock('../../../hooks/useSistemKosullari', () => ({ useSistemKosullari: () => mockKosullar.current }));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: () => undefined }));

import { ingilizceyeGec, turkceKalanlar } from '../../../../__tests__/yardimci/ingilizceDenetimi';
import { AramaAlani } from '../AramaAlani';
import { AramaSonuclari } from '../AramaSonuclari';
import { KurulumSagligiKarti } from '../KurulumSagligiKarti';
import { SistemDurumuCipi } from '../SistemDurumuCipi';
import { PilRehberModal } from '../../../components/pil/PilRehberi';
import { AYAR_INDEKSI } from '../../../../core/ayarlar/aramaIndeksi';
import { ayarAra } from '../../../../core/ayarlar/ayarAra';
import { kurulumSagligi } from '../../../../core/ayarlar/kurulumSagligi';
import {
  bildirimOzeti,
  gorunumOzeti,
  hakkindaOzeti,
  konumOzeti,
  muhafizOzeti,
  nafileOzeti,
  ramazanOzeti,
  seriOzeti,
  takvimOzeti,
  yedeklemeOzeti,
} from '../../../../core/ayarlar/ozetler';
import { BILINMEYEN_SISTEM_DURUMU, sistemCipi } from '../../../../core/sistem/sistemDurumu';
import { RENK_PALETLERI } from '../../../../core/theme/temalar';
import { konumDegisimBildirimMetni } from '../../../../core/konum/konumDegisimBildirimi';
import { guvenKarariEtiketi, kildimIzinSorusu, KILDIM_GUVEN_ETIKETLERI } from '../../../../core/kildim/kildimGuven';
import { PANO_ADLARI } from '../../../../core/evEkrani/evEkrani';
import { UYGULAMA } from '../../../../core/constants/UygulamaSabitleri';
import { sozluk } from '../../../../core/dil/aktifDil';

/** Türkçe harfsiz ama Türkçe sözcükler (bu yüzeylerde geçebilecek). */
const YASAKLI = ['Kapat', 'Konum', 'Ayar', 'Namaz', 'vakit', 'Vakit', 'Hesap', 'Yedek', 'Seri', 'Ramazan', 'Tema', 'Renk', 'Sorun', 'sonuc', 'Pil', 'Yardim', 'dk\\b', 'Mart', 'Ekim'];
const TR = /[çğıöşüÇĞİÖŞÜ]/;

let geriAl: () => void;
beforeEach(() => {
  geriAl = ingilizceyeGec();
  (useNavigation as jest.Mock).mockReturnValue({ navigate: jest.fn() });
  mockKosullar.current = { ...BILINMEYEN_SISTEM_DURUMU };
});
afterEach(() => geriAl());

const kalan = (el: React.ReactElement) => turkceKalanlar(render(el).toJSON() as never, YASAKLI);
const SIMDI = new Date('2026-10-20T10:00:00Z');

it('arama alanı ve sonuçlar (boş, dolu, Türkçe terimle arama)', () => {
  expect(kalan(<AramaAlani deger="ad" onDegistir={() => undefined} />)).toEqual([]);
  expect(kalan(<AramaSonuclari sonuclar={[]} />)).toEqual([]);
  const ezan = ayarAra(AYAR_INDEKSI, 'adhan');
  expect(ezan.length).toBeGreaterThan(0);
  expect(kalan(<AramaSonuclari sonuclar={ezan} />)).toEqual([]);
  // Türkçe terimler İngilizcede de aranır (yurt dışındaki Türkçe konuşan kullanıcı).
  expect(ayarAra(AYAR_INDEKSI, 'ezan').map((k) => k.id)).toEqual(ezan.map((k) => k.id));
  const tumu = AYAR_INDEKSI.flatMap((k) => [k.baslik, k.grup]);
  expect(tumu.filter((m) => TR.test(m))).toEqual([]);
  expect(render(<AramaSonuclari sonuclar={ayarAra(AYAR_INDEKSI, 'qibla calc')} />).getByText('No matching setting found')).toBeTruthy();
});

it('arama dizini Türkçede birebir eski başlıkları taşır', () => {
  geriAl();
  expect(AYAR_INDEKSI.find((k) => k.id === 'sayfa-hatirlatmalar')?.baslik).toBe('Hatırlatmalar');
  expect(AYAR_INDEKSI.find((k) => k.id === 'tema')?.grup).toBe('Görünüm');
  geriAl = ingilizceyeGec();
});

it('kurulum sağlığı kartı: bütün sorunlar İngilizce', () => {
  const ortak = {
    izinDurumu: 'reddedildi' as const, konumModu: 'oto' as const, sonGpsGuncellemesi: null, akilliTakipAktif: true,
    muhafizAktif: true, acikVakitBildirimSayisi: 0, tamAlarm: 'reddedildi' as const, simdi: SIMDI,
  };
  const sorunlar = [
    ...kurulumSagligi({ ...ortak, pil: { muaf: false, samsung: true } }),
    ...kurulumSagligi({ ...ortak, pil: { muaf: false, samsung: false }, kosullar: { ...BILINMEYEN_SISTEM_DURUMU, gucTasarrufu: true } }),
    ...kurulumSagligi({ ...ortak, muhafizAktif: false }),
    ...kurulumSagligi({
      ...ortak,
      kosullar: { ...BILINMEYEN_SISTEM_DURUMU, platform: 'android', arkaPlanKisitli: true },
    }),
    ...kurulumSagligi({
      ...ortak,
      kosullar: { ...BILINMEYEN_SISTEM_DURUMU, platform: 'ios', arkaPlanYenileme: 'kapali' },
    }),
    ...kurulumSagligi({ ...ortak, izinDurumu: 'verildi', sonGpsGuncellemesi: '2026-10-01T10:00:00Z' }),
  ];
  expect(new Set(sorunlar.map((s) => s.id)).size).toBe(8);
  for (const s of sorunlar) {
    expect(kalan(<KurulumSagligiKarti sorunlar={[s, s]} onEylem={() => undefined} ozetSatiri="" />)).toEqual([]);
  }
  expect(kalan(<KurulumSagligiKarti sorunlar={[]} onEylem={() => undefined} ozetSatiri={sozluk('en').ayarlar.ozet.saglikSatiri} />)).toEqual([]);
});

it('sistem çipi ve pil rehberi', () => {
  mockKosullar.current = { ...BILINMEYEN_SISTEM_DURUMU, platform: 'android', gucTasarrufu: true };
  expect(kalan(<SistemDurumuCipi pilMuaf={false} onPilRehberi={() => undefined} />)).toEqual([]);
  mockKosullar.current = { ...BILINMEYEN_SISTEM_DURUMU, platform: 'ios', veriTasarrufu: 'acik' };
  expect(kalan(<SistemDurumuCipi pilMuaf={null} onPilRehberi={() => undefined} />)).toEqual([]);
  expect(sistemCipi({ ...BILINMEYEN_SISTEM_DURUMU, platform: 'ios', gucTasarrufu: true }, null)?.metin).toBe(
    "Low Power Mode on — reminders aren't affected"
  );
  for (const samsung of [true, false]) {
    const e = render(<PilRehberModal gorunur samsung={samsung} onAc={() => undefined} onKapat={() => undefined} />);
    expect(turkceKalanlar(e.toJSON() as never, YASAKLI).filter((m) => m !== 'Namaz Akışı · Battery' && !m.includes('Namaz Akışı'))).toEqual([]);
  }
});

it('satır özetleri, palet adları, pano adları ve çekirdek metinler İngilizce', () => {
  const ozetler = [
    konumOzeti({ konumModu: 'oto', gpsAdres: null, seciliIlceAdi: '', seciliIlAdi: '' }),
    konumOzeti({ konumModu: 'manuel', gpsAdres: null, seciliIlceAdi: '', seciliIlAdi: '' }),
    takvimOzeti(true),
    muhafizOzeti({ aktif: true, yogunluk: 'yogun' }),
    muhafizOzeti({ aktif: true, yogunluk: 'ozel' }),
    bildirimOzeti(0, true),
    bildirimOzeti(3, true),
    seriOzeti({ tamGunEsigi: 1, gunSonuBildirimAktif: false }),
    nafileOzeti({ kusluk: true, evvabin: true, teheccud: false, gosterge: false }),
    nafileOzeti({ kusluk: false, evvabin: false, teheccud: false, gosterge: true }),
    ramazanOzeti(true, true),
    gorunumOzeti('koyu', RENK_PALETLERI[0].ad),
    yedeklemeOzeti('2025-03-05T10:00:00Z', SIMDI),
    yedeklemeOzeti(null, SIMDI),
    hakkindaOzeti('1.0.0', true),
    konumDegisimBildirimMetni({ ilce: 'Kadıköy', il: 'İstanbul' }).govde,
    kildimIzinSorusu('Tasker'),
    guvenKarariEtiketi('izin'),
    KILDIM_GUVEN_ETIKETLERI.herZaman,
    UYGULAMA.ACIKLAMA,
    ...RENK_PALETLERI.map((p) => p.ad),
    ...Object.values(PANO_ADLARI),
  ];
  expect(ozetler.filter((m) => TR.test(m))).toEqual([]);
  expect(seriOzeti({ tamGunEsigi: 4, gunSonuBildirimAktif: false })).toBe('Full day: 4 prayers');
  expect(yedeklemeOzeti('2025-03-05T10:00:00Z', SIMDI)).toBe('Last export: 5 March 2025');
  expect(PANO_ADLARI.imsak).toBe('Fajr');
  expect(RENK_PALETLERI[0].ad).toBe('Emerald');
});
