/**
 * Elle yazılmış sesli okuma metinleri: hazır şablon (herhangi bir dilde) ve boş metin sayılmaz;
 * değiştirme yüzeyin ve muhafızda en yakın `yon`un listesinden ilk şablonu yazar.
 */
import { tr } from '../../dil/sozluk/tr';
import { en } from '../../dil/sozluk/en';
import { ozelAnonsMetniMi, ozelAnonsSay, ozelAnonslariSablonlaDegistir } from '../ozelAnonsMetinleri';

const OZEL = 'Kalk, abdest al.';

const muhafizKaydi = {
  aktif: true,
  matris: {
    ogle: { yon: 'cikisaDogru', seviyeler: [{ anonsMetni: OZEL }, { anonsMetni: tr.anons.sablon.muhafizCikis[1] }, { anonsMetni: '' }] },
    ikindi: { yon: 'girisindenItibaren', seviyeler: [{ anonsMetni: OZEL }, { anonsMetni: en.anons.sablon.muhafizGiris[0] }] },
  },
};

it('hazır şablon, boş ve boşluk sayılmaz', () => {
  expect(ozelAnonsMetniMi(OZEL)).toBe(true);
  expect(ozelAnonsMetniMi(tr.anons.sablon.cuma[0])).toBe(false);
  expect(ozelAnonsMetniMi(en.anons.sablon.cuma[0])).toBe(false);
  expect(ozelAnonsMetniMi('  ')).toBe(false);
  expect(ozelAnonsMetniMi(undefined)).toBe(false);
});

it('sayım iç içe kayıtları dolaşır; bozuk kayıt 0', () => {
  expect(ozelAnonsSay(muhafizKaydi)).toBe(2);
  expect(ozelAnonsSay(null)).toBe(0);
  expect(ozelAnonsSay('bozuk')).toBe(0);
  expect(ozelAnonsSay({ adimlar: [{ anonsMetni: OZEL }, { anonsMetni: OZEL }] })).toBe(2);
});

it('muhafız: yöne göre ilk şablon, hazır ve boş metne dokunulmaz', () => {
  const yeni = ozelAnonslariSablonlaDegistir(muhafizKaydi, 'muhafiz', 'en');
  expect(yeni.matris.ogle.seviyeler.map((s) => s.anonsMetni)).toEqual([
    en.anons.sablon.muhafizCikis[0],
    tr.anons.sablon.muhafizCikis[1],
    '',
  ]);
  expect(yeni.matris.ikindi.seviyeler[0].anonsMetni).toBe(en.anons.sablon.muhafizGiris[0]);
  expect(yeni.matris.ikindi.seviyeler[1]).toBe(muhafizKaydi.matris.ikindi.seviyeler[1]);
  expect(yeni.aktif).toBe(true);
});

it('ek yüzey kendi listesini kullanır; değişecek bir şey yoksa aynı referans', () => {
  const cuma = { aktif: true, adimlar: [{ anonsMetni: OZEL }] };
  expect(ozelAnonslariSablonlaDegistir(cuma, 'cuma', 'en').adimlar[0].anonsMetni).toBe(en.anons.sablon.cuma[0]);
  const hazir = { adimlar: [{ anonsMetni: tr.anons.sablon.yatis[2] }] };
  expect(ozelAnonslariSablonlaDegistir(hazir, 'yatis', 'en')).toBe(hazir);
});
