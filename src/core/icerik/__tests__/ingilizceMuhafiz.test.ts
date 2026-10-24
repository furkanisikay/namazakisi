/**
 * NÖBETÇİ — İngilizce ibadete çağrı metinleri: önden okuma (16 karakter), kayıt kuralları
 * ve nass kuralı (Türkçe dışında hadis yok; ayet QuranEnc'ten birebir, künyeli).
 */
import { aktifDiliKur, aktifDilSifirla } from '../../dil/aktifDil';
import {
  BANT_GORUNUR_KARAKTER,
  GIRIS_ICERIK_HAVUZU,
  basligiOlustur,
  bildirimGovdesiOlustur,
  geceCapasiBasligi,
  geceCapasiGovdesi,
} from '../../utils/muhafizMetinYardimcisi';
import { SEYTANLA_MUCADELE_ICERIGI, uygunIcerikleriBul } from '../../data/SeytanlaMucadeleIcerigi';
import { VAKIT_BILDIRIM_ICERIKLERI } from '../../data/VakitBildirimIcerikleri';
import { AYET_MEALLERI } from '../../data/ayetMealleri';

const VAKITLER = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const;
const YONLER = ['cikisaDogru', 'girisindenItibaren'] as const;
const SEVIYELER = [1, 2, 3, 4] as const;
const AD = { imsak: 'Fajr', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' };
const BUYUK = { imsak: 'FAJR', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' };

beforeEach(() => aktifDiliKur('en'));
afterEach(() => aktifDilSifirla());

/** Bütün başlık ve gövde metinleri (ton × yön × ölçü × vakit). */
function tumMetinler(): string[] {
  const m: string[] = [];
  for (const vakit of VAKITLER)
    for (const yon of YONLER)
      for (const s of SEVIYELER)
        for (const olcu of [3, 10, 45, 655]) {
          m.push(basligiOlustur(vakit, s, olcu, yon), bildirimGovdesiOlustur(s, yon, olcu));
          m.push(...uygunIcerikleriBul(vakit, s).map((i) => i.metin));
        }
  for (const s of SEVIYELER) m.push(...GIRIS_ICERIK_HAVUZU[s]);
  m.push(geceCapasiBasligi('yatsi'), geceCapasiGovdesi(20));
  return m;
}

it('başlık önden okunur: ilk 16 karakterde vakit adı ve dakika', () => {
  for (const vakit of VAKITLER)
    for (const yon of YONLER)
      for (const s of SEVIYELER)
        for (const olcu of [1, 9, 10, 45, 120, 655, 720]) {
          const bas = basligiOlustur(vakit, s, olcu, yon).slice(0, BANT_GORUNUR_KARAKTER);
          expect(bas.startsWith(`${s === 4 ? BUYUK[vakit] : AD[vakit]} · ${olcu}m`)).toBe(true);
        }
});

it('kayıt: Türkçe kalmaz, "prostrate"/"please" yok, suçlama ve korku yok', () => {
  for (const m of tumMetinler()) {
    expect(m).not.toMatch(/[çğıöşüÇĞİÖŞÜ]/);
    expect(m.toLowerCase()).not.toMatch(/prostrat|sujud|please|\bsin\b|sinner|hell|disbeliev|kafir|abandon|punish/);
  }
});

it('İngilizce havuzlarda hadis yok; ayet QuranEnc metniyle birebir ve künyeli', () => {
  const meal = AYET_MEALLERI.en;
  const denetle = (i: { metin: string; kaynak?: string }) => {
    if (!i.kaynak) return;
    const ref = /^Quran (\d+:\d+) · Noor International Center, QuranEnc \d+\.\d+\.\d+$/.exec(i.kaynak);
    expect(ref).not.toBeNull();
    expect(i.metin).toBe(meal.ayetler[ref![1]]);
  };
  for (const vakit of VAKITLER) {
    VAKIT_BILDIRIM_ICERIKLERI[vakit].forEach(denetle);
    expect(VAKIT_BILDIRIM_ICERIKLERI[vakit].length).toBeGreaterThan(1);
    for (const s of SEVIYELER) uygunIcerikleriBul(vakit, s).forEach(denetle);
  }
  // Türkçe havuz kaynağı bozulmadı: hadisler hâlâ orada (yalnız çeviride düşer).
  expect(SEYTANLA_MUCADELE_ICERIGI.some((i) => i.tur === 'hadis')).toBe(true);
});

it('her seviyede her vakit için en az bir içerik kalır (hadis düşünce havuz boşalmaz)', () => {
  for (const vakit of VAKITLER) for (const s of SEVIYELER) expect(uygunIcerikleriBul(vakit, s).length).toBeGreaterThan(0);
});
