/**
 * Hazır sesli okuma şablonları diller arasında: kayıtta YAZILI Türkçe şablon İngilizcede
 * İngilizce okunur; kullanıcının kendi yazdığı metin aynen kalır.
 */
import { aktifDiliKur, aktifDilSifirla } from '../../dil/aktifDil';
import { anonsMetniniCoz, ANONS_SABLONLARI, ANONS_SABLONLARI_GIRIS, varsayilanAnonsMetni } from '../../muhafiz/anonsMetni';
import { anonsCoz, ANONS_SOZLUKLERI } from '../anonsYerTutucu';
import { hazirSablonMu, sablonuYerellestir } from '../anonsSablonlari';
import { yonDegisimindeMetniCevir } from '../../muhafiz/matrisIslemleri';
import type { VakitMuhafizAyari } from '../../muhafiz/matrisTipleri';

afterEach(() => aktifDilSifirla());

it('Türkçede hiçbir şey değişmez (kayıt-oynat)', () => {
  expect(anonsMetniniCoz(ANONS_SABLONLARI[0], 'ogle', 7)).toBe('Öğle vakti çıkıyor, son 7 dakika.');
  expect(sablonuYerellestir(ANONS_SABLONLARI_GIRIS[2])).toBe(ANONS_SABLONLARI_GIRIS[2]);
});

it('kayıttaki Türkçe şablon İngilizcede aynı sıradaki İngilizce şablonla okunur', () => {
  aktifDiliKur('en');
  expect(anonsMetniniCoz(ANONS_SABLONLARI[0], 'ogle', 7)).toBe('Dhuhr time is ending, 7 minutes left.');
  expect(anonsMetniniCoz(ANONS_SABLONLARI_GIRIS[1], 'aksam', 12, 'girisindenItibaren')).toBe("Don't delay Maghrib, 12 minutes have passed.");
  expect(anonsCoz(ANONS_SOZLUKLERI.cuma.sablonlar[0], { vakit: "Jumu'ah", sureDk: 30 })).toBe(
    "30 minutes left until Jumu'ah. Get ready and head to the mosque.",
  );
  // Türkçe kayıt da İngilizce şablona çevrilir (sözlük sırası eşleşir).
  expect(anonsCoz('Yatmadan önce yatsıyı kıl.', { vakit: 'Isha', sureDk: 0 })).toBe('Pray Isha before you go to bed.');
  expect(varsayilanAnonsMetni()).toBe('{vakit} time is ending, {süre} minutes left.');
});

it('kullanıcının kendi yazdığı metin aynen kalır; {vakit} etkin dilde dolar', () => {
  aktifDiliKur('en');
  const ozel = 'Kalk, {vakit} için {süre} dakika var!';
  expect(hazirSablonMu(ozel)).toBe(false);
  expect(anonsMetniniCoz(ozel, 'ikindi', 5)).toBe('Kalk, Asr için 5 dakika var!');
});

it('yön değişimi dil fark etmeksizin sırayı korur', () => {
  aktifDiliKur('en');
  const ayar = {
    yon: 'cikisaDogru',
    seviyeler: [{ anonsMetni: ANONS_SABLONLARI[1] }, { anonsMetni: 'kendi metnim' }],
  } as unknown as VakitMuhafizAyari;
  const cevrilmis = yonDegisimindeMetniCevir(ayar, 'girisindenItibaren');
  expect(cevrilmis.seviyeler[0].anonsMetni).toBe("Don't delay {vakit}, {süre} minutes have passed.");
  expect(cevrilmis.seviyeler[1].anonsMetni).toBe('kendi metnim');
});

it('her dilde şablon listeleri aynı uzunlukta (sıra eşlemesi)', () => {
  const { sozluk } = jest.requireActual('../../dil/aktifDil') as typeof import('../../dil/aktifDil');
  const tr = sozluk('tr').anons.sablon;
  const en = sozluk('en').anons.sablon;
  for (const k of Object.keys(tr) as (keyof typeof tr)[]) expect([k, en[k].length]).toEqual([k, tr[k].length]);
});
