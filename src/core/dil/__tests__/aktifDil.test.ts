import { aktifDil, aktifDiliKur, aktifDilSifirla, bicim, metin, sayili, sozluk } from '../aktifDil';
import { cihazDilindenSec, DILLER, iosYerelAdi, yerelAyarDili } from '../diller';
import { cogul, type CogulMetin } from '../tipler';
import { tr } from '../sozluk/tr';

afterEach(() => aktifDilSifirla());

it('varsayılan Türkçe; geçersiz kod Türkçeye düşer', () => {
  expect(aktifDil()).toBe('tr');
  expect(aktifDiliKur('xx')).toBe(false);
  expect(aktifDiliKur('en')).toBe(true);
  expect(metin()).toBe(sozluk('en'));
  expect(aktifDiliKur(undefined)).toBe(true);
  expect(aktifDil()).toBe('tr');
});

it('yer tutucu ve çoğul', () => {
  expect(bicim('{ad} ile devam edin', { ad: 'İzmir' })).toBe('İzmir ile devam edin');
  expect(bicim('{yok} kalır')).toBe('{yok} kalır');
  const gun = cogul({ one: '{n} day', other: '{n} days' });
  expect(sayili(gun, 1, {}, 'en')).toBe('1 day');
  expect(sayili(gun, 3, {}, 'en')).toBe('3 days');
});

it('cihaz dili yalnız SEÇİLEBİLİR dilse kullanılır (yarım dil kendiliğinden açılmaz)', () => {
  expect(cihazDilindenSec('tr_TR')).toBe('tr');
  const en = DILLER.find((d) => d.kod === 'en')!;
  expect(cihazDilindenSec('en_US')).toBe(en.secilebilir ? 'en' : null);
  // Uygulamanın hiç bilmediği dil (İzlandaca) seçilmez; İbranice artık seçilebilir, eski `iw` kodu da İbranicedir.
  expect(cihazDilindenSec('is-IS')).toBeNull();
  expect(cihazDilindenSec('iw_IL')).toBe('he');
  // Android'in eski Endonezce kodu ("in_ID") Endonezceye eşlenir.
  const id = DILLER.find((d) => d.kod === 'id')!;
  expect(cihazDilindenSec('in_ID')).toBe(id.secilebilir ? 'id' : null);
  expect(cihazDilindenSec(null)).toBeNull();
  // Çincenin bütün cihaz dilleri (Android `zh_CN`, `zh_TW_#Hant`; iOS `zh-Hans-CN`, `zh-Hant-HK`) Basitleştirilmiş `zh`'dir.
  const zh = DILLER.find((d) => d.kod === 'zh')!;
  for (const yerel of ['zh-Hans-CN', 'zh-CN', 'zh_CN', 'zh-TW', 'zh_TW_#Hant', 'zh-Hant-HK', 'zh-HK', 'zh-Hans', 'zh']) {
    expect(yerelAyarDili(yerel)).toBe('zh');
    expect(cihazDilindenSec(yerel)).toBe(zh.secilebilir ? 'zh' : null);
  }
  expect(yerelAyarDili('yi-US')).toBeNull();
  expect(yerelAyarDili('in_ID')).toBe('id');
  // Portekizcenin bütün cihaz dilleri (Brezilya dahil) Avrupa normlu `pt`'dir; İngilizceye düşmez.
  const pt = DILLER.find((d) => d.kod === 'pt')!;
  for (const yerel of ['pt-BR', 'pt_BR', 'pt-PT', 'pt_PT', 'pt-MZ', 'pt-AO', 'pt-GW', 'pt']) {
    expect(yerelAyarDili(yerel)).toBe('pt');
    expect(cihazDilindenSec(yerel)).toBe(pt.secilebilir ? 'pt' : null);
  }
  // Latin Sırpça cihaz (iOS `sr-Latn-RS`, Android `sr_RS_#Latn`) Kiril `sr` arayüzünü alır (Latin seçenek yok).
  const sr = DILLER.find((d) => d.kod === 'sr')!;
  for (const yerel of ['sr-Latn-RS', 'sr_RS_#Latn', 'sr-Cyrl-RS', 'sr_RS', 'sr-ME', 'sr']) {
    expect(yerelAyarDili(yerel)).toBe('sr');
    expect(cihazDilindenSec(yerel)).toBe(sr.secilebilir ? 'sr' : null);
  }
  // Kurmancî: uygulama kodu `ku`; ISO 639-3 `kmr` de `ku`'dur. Arap harfli cihaz (`ku-Arab`, `ku-IQ`) da `ku`
  // alır (uygulamada Kurmancî yalnız Latin). Soranî (`ckb`) ayrı dildir, `ku`'ya düşmez.
  const ku = DILLER.find((d) => d.kod === 'ku')!;
  for (const yerel of ['ku', 'ku-TR', 'ku_TR', 'kmr', 'kmr-Latn', 'kmr_TR', 'ku-Latn-TR', 'ku-Arab', 'ku-IQ']) {
    expect(yerelAyarDili(yerel)).toBe('ku');
    expect(cihazDilindenSec(yerel)).toBe(ku.secilebilir ? 'ku' : null);
  }
  expect(yerelAyarDili('ckb-IQ')).toBe('ckb');
  for (const [yerel, kod] of [['tk-TM', 'tk'], ['tt-RU', 'tt'], ['sd-PK', 'sd'], ['sd-Arab-PK', 'sd'], ['pl_PL', 'pl'], ['ja-JP', 'ja'], ['gu-IN', 'gu'], ['bg_BG', 'bg'], ['mk-MK', 'mk']] as const) {
    expect(yerelAyarDili(yerel)).toBe(kod);
  }
  // Dalga 12. Filipince: `fil` ve AOSP'nin Tagalog kodu `tl` (`values-tl`) `fil`'dir.
  for (const yerel of ['fil', 'fil-PH', 'fil_PH', 'tl', 'tl-PH', 'tl_PH']) expect(yerelAyarDili(yerel)).toBe('fil');
  // Pencapça yalnız Şahmuki: Arap betikli ya da Pakistan bölgeli cihaz ve Batı Pencapçası `pnb` `pa`. Çıplak `pa`
  // (CLDR'de Gurmuki) ve Gurmuki cihaz (`pa-IN`, `pa-Guru`) EŞLENMEZ: Gurmuki okuyucu Şahmukiye düşmez.
  for (const yerel of ['pa-PK', 'pa_PK', 'pa-Arab', 'pa-Arab-PK', 'pa_PK_#Arab', 'pnb', 'pnb-PK']) expect(yerelAyarDili(yerel)).toBe('pa');
  for (const yerel of ['pa', 'pa-IN', 'pa_IN', 'pa-Guru', 'pa-Guru-IN', 'pa_IN_#Guru']) {
    expect(yerelAyarDili(yerel)).toBeNull();
    expect(cihazDilindenSec(yerel)).toBeNull();
  }
  for (const [yerel, kod] of [['te-IN', 'te'], ['kn_IN', 'kn'], ['mr-IN', 'mr'], ['as-IN', 'as'], ['ne-NP', 'ne'], ['ne-IN', 'ne'], ['si-LK', 'si'], ['km-KH', 'km']] as const) {
    expect(yerelAyarDili(yerel)).toBe(kod);
  }
  // Dalga 13. İbranice: `he` ve Java/Android'in eski kodu `iw` (kaynak dizini `values-iw`) `he`'dir.
  for (const yerel of ['he', 'he-IL', 'he_IL', 'iw', 'iw-IL', 'iw_IL']) expect(yerelAyarDili(yerel)).toBe('he');
  for (const [yerel, kod] of [
    ['ka-GE', 'ka'], ['lt_LT', 'lt'], ['mg-MG', 'mg'], ['lg-UG', 'lg'], ['rw-RW', 'rw'], ['rn-BI', 'rn'], ['ln-CD', 'ln'],
    ['dag-GH', 'dag'], ['mos-BF', 'mos'], ['aa-ET', 'aa'], ['mdh-PH', 'mdh'], ['ak-GH', 'ak'], ['ceb_PH', 'ceb'], ['nqo-GN', 'nqo'],
  ] as const) {
    expect(yerelAyarDili(yerel)).toBe(kod);
  }
});

it('iOS yerelleştirme adı: Basitleştirilmiş Çince zh-Hans, diğer diller kendi kodu', () => {
  expect(iosYerelAdi('zh')).toBe('zh-Hans');
  // Pencapça yalnız Şahmuki: `pa-Arab.lproj` (çıplak `pa` CLDR'de Gurmuki).
  expect(iosYerelAdi('pa')).toBe('pa-Arab');
  for (const d of DILLER.filter((x) => x.kod !== 'zh' && x.kod !== 'pa')) expect(iosYerelAdi(d.kod)).toBe(d.kod);
  // Portekizce `pt.lproj`: Apple yalnız bölge varyantından genel dile düşer (pt-BR/pt-PT/pt-MZ → pt);
  // `pt-PT.lproj`un pt-BR cihazında seçildiği belgelenmemiştir (QA1828). Sırpça `sr.lproj` (Kiril).
  expect(iosYerelAdi('pt')).toBe('pt');
  expect(iosYerelAdi('sr')).toBe('sr');
});

/** Sözlük ağacındaki her metin: boş değil, yer tutucuları Türkçeyle aynı, çoğullar dilin kategorilerini taşır. */
function yapraklar(o: unknown, yol = ''): [string, unknown][] {
  if (typeof o === 'string' || (o && typeof o === 'object' && '__cogul' in (o as object))) return [[yol, o]];
  return Object.entries(o as object).flatMap(([k, v]) => yapraklar(v, yol ? `${yol}.${k}` : k));
}
const yerTutucular = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe.each(DILLER.map((d) => d.kod))('%s sözlüğü', (kod) => {
  const kaynak = new Map(yapraklar(tr));
  const hedef = yapraklar(sozluk(kod));

  it('dil satırı iki dilli: yerel ad + " · Language" (İngilizcede "Language · Dil")', () => {
    const s = sozluk(kod);
    const satirlar = [s.genel.ekranlar.DilAyarlari, s.dilAyar.baslik, s.dilAyar.sihirbazBaglantisi, s.ayarlar.arama['sayfa-dil'].baslik];
    for (const satir of satirlar) {
      if (kod === 'en') expect(satir).toBe('Language · Dil');
      else expect(satir).toMatch(/^\S.* · Language$/);
    }
  });

  it('anahtar kümesi Türkçeyle aynı', () => {
    expect(hedef.map(([y]) => y).sort()).toEqual([...kaynak.keys()].sort());
  });

  it('boş metin yok, yer tutucular aynı, çoğul kategorileri tam', () => {
    const icu = new Intl.PluralRules(kod).resolvedOptions().pluralCategories;
    for (const [yol, deger] of hedef) {
      const k = kaynak.get(yol);
      if (typeof deger === 'string') {
        expect(deger.trim()).not.toBe('');
        expect([yol, yerTutucular(deger)]).toEqual([yol, yerTutucular(k as string)]);
      } else {
        const c = deger as CogulMetin;
        for (const kat of icu) expect([yol, kat, typeof c[kat]]).toEqual([yol, kat, 'string']);
      }
    }
  });
});
