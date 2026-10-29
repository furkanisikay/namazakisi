/**
 * Alfabe (yazı sistemi): Kiril → Latin harf çevirisi (Özbekçe 1995, Kazakça 2021), çözüm sırası
 * (açık seçim → ülke → dil) ve etkin sözlüğün önbellekli çevirisi (`aktifDil`).
 * Kural: `docs/ajan/coklu-dil.md > Alfabe`.
 */
import {
  derinCevir,
  dilYaziVarsayilani,
  kirildenLatine,
  YAZI_SECENEKLERI,
  yaziDonusumuGerekli,
  yaziSecilebilir,
  yaziSecimiGecerliMi,
  yaziSistemiCoz,
} from '../yazi';
import { cogul } from '../tipler';
import { DILLER } from '../diller';

// Özbek sözlüğü iskelette İngilizcedir; çeviri yolunu sınamak için Kiril metinli bir kopya.
jest.mock('../sozluk/uz', () => {
  const { en } = jest.requireActual('../sozluk/en');
  const sablon = Object.fromEntries(
    Object.entries(en.anons.sablon as Record<string, string[]>).map(([k, v]) => [k, v.map((x, i) => (i === 0 ? `Намоз вақти ${k}` : x))])
  );
  return {
    uz: {
      ...en,
      ortak: { ...en.ortak, devamEdin: 'Давом этиш', marka: 'Namaz Akışı' },
      anons: { ...en.anons, sablon },
      vakit: { ...en.vakit, adlar: { ...en.vakit.adlar, ogle: 'Пешин' } },
    },
  };
});
jest.mock('../sozluk/kk', () => {
  const { en } = jest.requireActual('../sozluk/en');
  return { kk: { ...en, ortak: { ...en.ortak, devamEdin: 'Жалғастыру' } } };
});

import { aktifDiliKur, aktifDilSifirla, aktifYaziSistemi, hamSozluk, metin, sozluk, yaziSisteminiKur, yaziyaCevir } from '../aktifDil';
import { ayetMeali } from '../../icerik/nassDili';
import { hazirSablonMu, sablonlar, sablonuYerellestir } from '../../hatirlatma/anonsSablonlari';
import { vakitTemizleBasliklari } from '../../../presentation/screens/TakvimAyarlari/sabitler';
import { gununAyetiGorunumu, gununAyetiKaydi } from '../../icerik/gununAyeti';
import { AYET_MEALLERI } from '../../data/ayetMealleri';

afterEach(() => aktifDilSifirla());

describe('Özbekçe Kiril → Latin (1995)', () => {
  const uz = (s: string) => kirildenLatine('uz', s);

  it('temel harfler, ʻ (U+02BB) ve ʼ (U+02BC)', () => {
    expect(uz('Ўзбекистон')).toBe('Oʻzbekiston');
    expect(uz('ғалаба')).toBe('gʻalaba');
    expect(uz('Қуръон')).toBe('Qurʼon');
    expect(uz('Бомдод Пешин Аср Шом Хуфтон')).toBe('Bomdod Peshin Asr Shom Xufton');
    expect(uz('ҳаёт')).toBe('hayot');
    expect(uz('юлдуз')).toBe('yulduz');
    expect(uz('альбом')).toBe('albom');
    expect(uz('Ўзбекистон')).toContain('ʻ');
    expect(uz('Қуръон')).toContain('ʼ');
  });

  it('е: kelime başında ve ünlü/ъ/ь sonrası "ye", aksi "e"', () => {
    expect(uz('ер')).toBe('yer');
    expect(uz('келди')).toBe('keldi');
    expect(uz('поезд')).toBe('poyezd');
    expect(uz('объект')).toBe('obʼyekt');
    expect(uz('бу ер')).toBe('bu yer');
  });

  it('ц: kelime başında ve ünsüz sonrası "s", ünlü sonrası "ts"', () => {
    expect(uz('цирк')).toBe('sirk');
    expect(uz('Франция')).toBe('Fransiya');
    expect(uz('милиция')).toBe('militsiya');
  });

  it('büyük harf: tek büyük harf "Sh", komşusu da büyükse "SH"', () => {
    expect(uz('Шом')).toBe('Shom');
    expect(uz('ШОМ')).toBe('SHOM');
    expect(uz('ЁШ')).toBe('YOSH');
    expect(uz('Ёз')).toBe('Yoz');
    expect(uz('Ер')).toBe('Yer');
    expect(uz('ҒАЛАБА')).toBe('GʻALABA');
    expect(uz('Ғалаба')).toBe('Gʻalaba');
    expect(uz('ЎЗБЕКИСТОН')).toBe('OʻZBEKISTON');
    expect(uz('Я')).toBe('Ya');
    expect(uz('Ҳ')).toBe('H');
  });

  it('Kiril olmayan her şey aynen: yer tutucu, marka, rakam, noktalama', () => {
    expect(uz('{n} дақиқа · Namaz Akışı · Google Drive 2026!')).toBe('{n} daqiqa · Namaz Akışı · Google Drive 2026!');
    expect(uz('{ad}: {sure}')).toBe('{ad}: {sure}');
    expect(uz('')).toBe('');
  });
});

describe('Kazakça Kiril → Latin (2021)', () => {
  const kk = (s: string) => kirildenLatine('kk', s);

  it('vakit adları ve özel harfler', () => {
    expect(kk('Таң Күн Бесін Екінті Ақшам Құптан')).toBe('Tañ Kün Besın Ekıntı Aqşam Qūptan');
    expect(kk('Қазақша')).toBe('Qazaqşa');
    expect(kk('Әке Өмір Ғылым үй')).toBe('Äke Ömır Ğylym üi');
    expect(kk('ащы')).toBe('aşşy');
    expect(kk('Һ')).toBe('H');
    expect(kk('съезд')).toBe('sezd');
  });

  it('büyük harf açık tablodan: И → İ, І → I (toUpperCase yok)', () => {
    expect(kk('ҚАЗАҚСТАН')).toBe('QAZAQSTAN');
    expect(kk('Иә')).toBe('İä');
    expect(kk('ИӘ')).toBe('İÄ');
    expect(kk('Іс')).toBe('Is');
    expect(kk('Ю')).toBe('İu');
    expect(kk('ЮЛ')).toBe('İUL');
    expect(kk('ШЫҢ')).toBe('ŞYÑ');
  });

  it('Latin marka ve yer tutucu aynen', () => {
    expect(kk('{n} минут · QuranEnc · JAKIM')).toBe('{n} minut · QuranEnc · JAKIM');
  });
});

it('alfabe seçimi olmayan dilde metin aynen döner (Rusça Kiril kalır)', () => {
  expect(kirildenLatine('ru', 'Шом')).toBe('Шом');
  expect(kirildenLatine('tr', 'Akşam')).toBe('Akşam');
});

describe('çözüm sırası', () => {
  it('seçenekler: Özbekçe Latin, Kazakça Kiril varsayılan; diğer dillerde seçim yok', () => {
    expect(YAZI_SECENEKLERI.uz).toEqual(['latn', 'cyrl']);
    expect(YAZI_SECENEKLERI.kk).toEqual(['cyrl', 'latn']);
    expect(dilYaziVarsayilani('uz')).toBe('latn');
    expect(dilYaziVarsayilani('kk')).toBe('cyrl');
    for (const { kod } of DILLER) {
      if (kod === 'uz' || kod === 'kk') continue;
      expect(yaziSecilebilir(kod)).toBe(false);
      expect(dilYaziVarsayilani(kod)).toBeNull();
    }
  });

  it('açık seçim → ülke → dil; geçersiz seçim yok sayılır', () => {
    expect(yaziSistemiCoz('uz', 'cyrl', 'UZ')).toBe('cyrl');
    expect(yaziSistemiCoz('uz', null, 'UZ')).toBe('latn');
    expect(yaziSistemiCoz('uz', 'arab', null)).toBe('latn');
    expect(yaziSistemiCoz('kk', 'latn', 'KZ')).toBe('latn');
    expect(yaziSistemiCoz('kk', undefined, null)).toBe('cyrl');
    expect(yaziSistemiCoz('ru', 'latn', 'RU')).toBeNull();
    expect(yaziSecimiGecerliMi('tr', 'latn')).toBe(false);
  });

  it('dönüşüm yalnız kaynak (Kiril) dışındaki yazıda', () => {
    expect(yaziDonusumuGerekli('uz', 'latn')).toBe(true);
    expect(yaziDonusumuGerekli('uz', 'cyrl')).toBe(false);
    expect(yaziDonusumuGerekli('kk', 'latn')).toBe(true);
    expect(yaziDonusumuGerekli('ru', 'latn')).toBe(false);
    expect(yaziDonusumuGerekli('uz', null)).toBe(false);
  });
});

it('derinCevir: dize yaprakları, diziler; çoğul işareti ve sayılar aynen; fonksiyon çıktısı çevrilir', () => {
  const ag = {
    a: 'шом',
    b: ['ер', 'цирк'],
    c: cogul({ one: '{n} дақиқа', other: '{n} дақиқа' }),
    d: 3,
    e: (x: string) => `${x} шом`,
  };
  const cevrik = derinCevir(ag, (s) => kirildenLatine('uz', s));
  expect(cevrik.a).toBe('shom');
  expect(cevrik.b).toEqual(['yer', 'sirk']);
  expect(cevrik.c).toEqual({ __cogul: true, one: '{n} daqiqa', other: '{n} daqiqa' });
  expect(cevrik.d).toBe(3);
  expect(cevrik.e('ер')).toBe('yer shom');
  expect(ag.a).toBe('шом');
});

describe('etkin sözlük (aktifDil)', () => {
  it('Özbekçe Latin varsayılan: Kiril kaynak çevrilir, marka dokunulmaz; Kiril seçilince kaynak', () => {
    aktifDiliKur('uz');
    expect(aktifYaziSistemi()).toBe('latn');
    expect(metin().ortak.devamEdin).toBe('Davom etish');
    expect(metin().ortak.marka).toBe('Namaz Akışı');
    expect(yaziyaCevir('Ўзбекча')).toBe('Oʻzbekcha');

    expect(yaziSisteminiKur('cyrl')).toBe(true);
    expect(metin().ortak.devamEdin).toBe('Давом этиш');
    expect(yaziyaCevir('Ўзбекча')).toBe('Ўзбекча');
    expect(hamSozluk('uz').ortak.devamEdin).toBe('Давом этиш');
  });

  it('önbellek: referans yalnız yazı değişince değişir; geçersiz yazı dil varsayılanına düşer', () => {
    aktifDiliKur('uz');
    const ilk = metin();
    expect(metin()).toBe(ilk);
    expect(yaziSisteminiKur('latn')).toBe(false);
    expect(metin()).toBe(ilk);
    yaziSisteminiKur('cyrl');
    const kiril = metin();
    expect(kiril).not.toBe(ilk);
    yaziSisteminiKur('latn');
    expect(metin()).not.toBe(kiril);
    expect(yaziSisteminiKur(null)).toBe(false);
    expect(aktifYaziSistemi()).toBe('latn');
  });

  it('Kazakça Kiril varsayılan; Latin seçilince çevrilir; dil değişince yazı dilin varsayılanına döner', () => {
    aktifDiliKur('kk');
    expect(aktifYaziSistemi()).toBe('cyrl');
    expect(metin().ortak.devamEdin).toBe('Жалғастыру');
    yaziSisteminiKur('latn');
    expect(metin().ortak.devamEdin).toBe('Jalğastyru');
    aktifDiliKur('uz');
    expect(aktifYaziSistemi()).toBe('latn');
    aktifDiliKur('tr');
    expect(aktifYaziSistemi()).toBeNull();
    expect(yaziSisteminiKur('latn')).toBe(false);
  });

  it('etkin olmayan dilin sözlüğü dilin varsayılan yazısıyla', () => {
    expect(sozluk('uz').ortak.devamEdin).toBe('Davom etish');
    expect(sozluk('kk').ortak.devamEdin).toBe('Жалғастыру');
    expect(yaziyaCevir('Ўзбекча', 'uz')).toBe('Oʻzbekcha');
  });
});

describe('QuranEnc meali (Kiril kaynak) dilin gösterilen yazısıyla', () => {
  const KIRIL = /[\u0400-\u04FF]/;

  it('Özbekçe Latin varsayılanda bildirim ayeti ve günün ayeti Latin; Kiril seçilince birebir kaynak', () => {
    aktifDiliKur('uz');
    const kaynak = AYET_MEALLERI.uz.ayetler['2:153'];
    expect(KIRIL.test(kaynak)).toBe(true);
    const latin = ayetMeali('2:153');
    expect(latin?.metin).toBe(kirildenLatine('uz', kaynak));
    expect(KIRIL.test(latin?.metin ?? 'Ж')).toBe(false);
    const gun = gununAyetiGorunumu(gununAyetiKaydi('2026-10-29'));
    expect(gun.meal).not.toBeNull();
    expect(KIRIL.test(gun.meal ?? 'Ж')).toBe(false);

    yaziSisteminiKur('cyrl');
    expect(ayetMeali('2:153')?.metin).toBe(kaynak);
    expect(KIRIL.test(gununAyetiGorunumu(gununAyetiKaydi('2026-10-29')).meal ?? '')).toBe(true);
  });

  it('Kazakça Kiril varsayılanda meal birebir kaynak; Latin seçilince çevrilir', () => {
    aktifDiliKur('kk');
    const kayit = gununAyetiKaydi('2026-10-29');
    const kiril = gununAyetiGorunumu(kayit).meal ?? '';
    expect(KIRIL.test(kiril)).toBe(true);
    yaziSisteminiKur('latn');
    expect(gununAyetiGorunumu(kayit).meal).toBe(kirildenLatine('kk', kiril));
  });
});

it('kayda yazılmış hazır şablon alfabe değişince de tanınır ve yeni alfabeye çevrilir', () => {
  aktifDiliKur('uz');
  const liste = Object.keys(metin().anons.sablon)[0] as Parameters<typeof sablonlar>[0];
  const latin = sablonlar(liste)[0];
  expect(latin).toBe(`Namoz vaqti ${liste}`);
  yaziSisteminiKur('cyrl');
  expect(hazirSablonMu(latin)).toBe(true);
  expect(sablonuYerellestir(latin)).toBe(`Намоз вақти ${liste}`);
  yaziSisteminiKur('latn');
  expect(sablonuYerellestir(`Намоз вақти ${liste}`)).toBe(latin);
});

it('takvim temizleme süzgeci iki alfabeli dilde her alfabedeki başlığı eşler', () => {
  const basliklar = vakitTemizleBasliklari('ogle');
  expect(basliklar).toEqual(expect.arrayContaining(['Peshin prayer', 'Пешин prayer', 'Dhuhr prayer']));
});
