/**
 * Vakit adı takımları: her takım sözlükteki adlandırma alanlarının TAMAMINI taşır, kimlikler
 * tekildir, ülke varsayılanları var olan takıma işaret eder; etkin sözlük referansı yalnız
 * dil/takım değişince değişir (`useMetin` anlık görüntüsü).
 */
import { aktifDiliKur, aktifDilSifirla, metin, sozluk, vakitTakiminiKur } from '../aktifDil';
import type { DilKodu } from '../diller';
import { tr } from '../sozluk/tr';
import { takimCoz, TAKIM_ALANLARI, TEMEL_TAKIM, ULKE_VARSAYILANLARI, VAKIT_TAKIMLARI } from '../vakitTakimlari';

const takimlar = Object.entries(VAKIT_TAKIMLARI).flatMap(([dil, l]) => (l ?? []).map((t) => [dil as DilKodu, t] as const));

afterEach(() => aktifDilSifirla());

it.each(takimlar.map(([dil, t]) => [`${dil}/${t.id}`, t] as const))('%s sözlüğün adlandırma alanlarının tamamını taşır', (_, t) => {
  expect(Object.keys(t.adlar).sort()).toEqual([...TAKIM_ALANLARI].sort());
  for (const harita of ['adlar', 'buyuk', 'kucuk'] as const) {
    expect(Object.keys(t.adlar[harita]).sort()).toEqual(Object.keys(tr.vakit[harita]).sort());
    for (const ad of Object.values(t.adlar[harita])) expect(ad.trim()).not.toBe('');
  }
  // TAKIM_ALANLARI sözlükte gerçekten var (sözlük yeniden adlandırılırsa takım sessizce boşa düşmesin).
  for (const alan of TAKIM_ALANLARI) expect(tr.vakit).toHaveProperty(alan);
});

it('kimlikler dil içinde tekil ve temel takım kimliğiyle çakışmaz; ülke varsayılanları var olan takıma işaret eder', () => {
  for (const [dil, liste] of Object.entries(VAKIT_TAKIMLARI)) {
    const idler = (liste ?? []).map((t) => t.id);
    expect(new Set(idler).size).toBe(idler.length);
    expect(idler).not.toContain(TEMEL_TAKIM);
    for (const id of Object.values(ULKE_VARSAYILANLARI[dil as DilKodu] ?? {})) expect(idler).toContain(id);
  }
  for (const [dil, harita] of Object.entries(ULKE_VARSAYILANLARI)) {
    for (const ulke of Object.keys(harita ?? {})) expect([dil, ulke]).toEqual([dil, expect.stringMatching(/^[A-Z]{2}$/)]);
  }
});

it('çözüm sırası: açık seçim → ülke varsayılanı → temel; bilinmeyen kimlik ülkeye düşer', () => {
  expect(takimCoz('fr', undefined, 'DZ')?.id).toBe('cezayir');
  expect(takimCoz('fr', TEMEL_TAKIM, 'DZ')).toBeNull();
  expect(takimCoz('fr', 'magrip', 'DZ')?.id).toBe('magrip');
  expect(takimCoz('fr', 'silinmis', 'DZ')?.id).toBe('cezayir');
  expect(takimCoz('fr', undefined, 'FR')).toBeNull();
  expect(takimCoz('fr', undefined, null)).toBeNull();
  // Başka dilin takımı seçilemez.
  expect(takimCoz('fr', 'diyanet-de', null)).toBeNull();
  expect(takimCoz('tr', 'diyanet-de', 'DE')).toBeNull();
});

it('etkin sözlük referansı kararlı; yalnız dil ya da takım değişince yenilenir', () => {
  aktifDiliKur('fr');
  const ilk = metin();
  expect(metin()).toBe(ilk);
  expect(sozluk('fr')).toBe(ilk);

  const cezayir = takimCoz('fr', 'cezayir', null);
  expect(vakitTakiminiKur(cezayir)).toBe(true);
  const ikinci = metin();
  expect(ikinci).not.toBe(ilk);
  expect(ikinci.vakit.adlar.imsak).toBe('Sobh');
  expect(ikinci.vakit.durum).toBe(ilk.vakit.durum);
  expect(vakitTakiminiKur(cezayir)).toBe(false);
  expect(metin()).toBe(ikinci);

  // Dil değişince takım sıfırlanır (her dilin takımı ayrı çözülür).
  aktifDiliKur('de');
  expect(metin().vakit.adlar.imsak).not.toBe('Sobh');
  expect(sozluk('fr').vakit.adlar.imsak).not.toBe('Sobh');
});

it('Farsçada Afganistan Darî takımını, İran ve diğer ülkeler temel takımı alır', () => {
  expect(takimCoz('fa', undefined, 'AF')?.id).toBe('afgan');
  expect(takimCoz('fa', undefined, 'IR')).toBeNull();
  expect(takimCoz('fa', undefined, null)).toBeNull();
  expect(takimCoz('fa', TEMEL_TAKIM, 'AF')).toBeNull();
  // Başka dilde Afganistan takımı yok (Peştuca kendi sözlüğüyle).
  expect(takimCoz('ps', undefined, 'AF')).toBeNull();
  const afgan = takimCoz('fa', undefined, 'AF');
  expect(afgan?.adlar.adlar.yatsi).toBe('خفتن');
  expect(afgan?.adlar.imsakVakti).not.toBe('امساک');
});
