#!/usr/bin/env node
/**
 * Maestro akışlarını Türkçe ve İngilizce dışındaki bir dilin kare turuna hazırlar.
 *
 * Akışlar iki dillidir: metin seçicileri "(Türkçe|İngilizce)" alternasyonudur ve iki değer
 * de sözlükte (`src/core/dil/sozluk/{tr,en}`) aynı anahtardan gelir. Bu betik her
 * alternasyon grubunda Türkçe ya da İngilizce değeri sözlük yaprağıyla birebir eşleyip o
 * anahtarın hedef dildeki değerini gruba ekler. Eşleşmeyen grup (başlatıcı, sistem
 * penceresi metni) olduğu gibi kalır ve raporlanır.
 *
 * Kullanım (CI kopyasında, yerinde yazar): node scripts/maestro/akislari-yerellestir.js <dil>
 * Aynı dilde iki kez koşmak zararsızdır (eklenen değer yeniden eklenmez).
 */
'use strict';
require('sucrase/register');
const fs = require('fs');
const path = require('path');

const dil = process.argv[2];
const KOK = path.resolve(__dirname, '..', '..');
const { sozluk } = require(path.join(KOK, 'src', 'core', 'dil', 'aktifDil'));
const { DILLER } = require(path.join(KOK, 'src', 'core', 'dil', 'diller'));

if (!DILLER.some((d) => d.kod === dil)) {
  console.error(`Bilinmeyen dil: ${dil}`);
  process.exit(1);
}
if (dil === 'tr' || dil === 'en') process.exit(0);

/** Sözlüğü "yol → metin" haritasına açar (çoğul nesnelerde her kategori ayrı yaprak). */
function yapraklar(o, yol = '', cikti = new Map()) {
  if (typeof o === 'string') cikti.set(yol, o);
  else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) if (k !== '__cogul') yapraklar(v, yol ? `${yol}.${k}` : k, cikti);
  }
  return cikti;
}

const kaynak = [yapraklar(sozluk('tr')), yapraklar(sozluk('en'))];
const hedef = yapraklar(sozluk(dil));

/** Metin → onu taşıyan yollar (Türkçe ya da İngilizce). */
const dizin = new Map();
for (const harita of kaynak) {
  for (const [yol, metin] of harita) {
    if (!dizin.has(metin)) dizin.set(metin, new Set());
    dizin.get(metin).add(yol);
  }
}

const kacir = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/**
 * Seçiciler YAML'ın ÇİFT TIRNAKLI dizgesindedir: regex kaçışı orada iki ters bölüdür ("\\\\.").
 * Okurken önce YAML, sonra regex kaçışı çözülür; yazarken regex kaçışı YAML için ikilenir
 * (tek "\\." YAML'da geçersiz kaçıştır ve akış hiç ayrıştırılamaz).
 */
const yamlCoz = (s) => s.replace(/\\(["\\])/g, '$1');
const yamlKacir = (s) => s.replace(/[\\"]/g, '\\$&');
const coz = (s) => yamlCoz(s).replace(/\\(.)/g, '$1');

/** "{ad} vakti hatırlatma ayarları. {ozet}" → ['', '{ad}', ' vakti hatırlatma ayarları. ', '{ozet}', '']. */
const parcala = (sablon) => sablon.split(/(\{[^{}]+\})/);
const yerTutucuMu = (p) => /^\{[^{}]+\}$/.test(p);

/** Yer tutuculu yaprakların listesi (yalnız Türkçe ve İngilizce kaynaklardan). */
const sablonlar = [];
for (const harita of kaynak) {
  for (const [yol, metin] of harita) if (/\{[^{}]+\}/.test(metin)) sablonlar.push([yol, metin]);
}

/** Bir yer tutucu değerinin hedef dildeki karşılığı (regex); bulunamazsa `.*`. */
function degerKarsiligi(deger) {
  // Kurum kısaltması ("JAKIM", "MWL") her dilde aynı yazılır.
  if (/^[A-Z0-9][A-Z0-9 .-]*$/.test(deger)) return kacir(deger);
  const adaylar = [...(dizin.get(deger) ?? [])].map((y) => hedef.get(y)).filter((v) => v && !/[{}]/.test(v));
  const tekil = [...new Set(adaylar)];
  if (!tekil.length) return '.*';
  return tekil.length === 1 ? kacir(tekil[0]) : `(?:${tekil.map(kacir).join('|')})`;
}

/**
 * Seçenek yer tutuculu bir yaprağın (baştan, sonu kesik olabilir) somut hâliyse hedef dilin
 * aynı yaprağını yer tutucular eşlenmiş olarak döndürür ("Sabah vakti hatırlatma ayarları"
 * → "Fajr: Erinnerungseinstellungen\\. .*"). Yoksa boş dizi.
 */
function sablonKarsiliklari(secenek) {
  const sonuc = [];
  for (const [yol, sablon] of sablonlar) {
    const parcalar = parcala(sablon);
    // Son parçaya kadar tam, son literal parça yalnız önekiyle eşleşebilir.
    for (let k = parcalar.length; k > 0; k--) {
      const son = parcalar[k - 1];
      if (yerTutucuMu(son) || !son) continue;
      const govde = new RegExp(`^${parcalar.slice(0, k - 1).map((p) => (yerTutucuMu(p) ? '(.+?)' : kacir(p))).join('')}$`, 's');
      // Seçenek = gövde + son literalin (boş olmayan) öneki.
      let m = null;
      for (let i = secenek.length - 1; i >= 0 && !m; i--) {
        if (son.startsWith(secenek.slice(i))) m = govde.exec(secenek.slice(0, i));
      }
      if (!m) continue;
      const degerler = {};
      parcalar.slice(0, k - 1).filter(yerTutucuMu).forEach((p, i) => (degerler[p] = m[i + 1]));
      // Yer tutucu sözlükte bilinen bir değer (vakit adı) ya da sayı olmalı; yoksa eşleşme
      // tesadüfidir ("{ad} …" her metni yutar) ve yanlış öğeye dokunurdu.
      if (Object.values(degerler).some((d) => !/^\d+$/.test(d) && degerKarsiligi(d) === '.*')) continue;
      const hedefSablon = hedef.get(yol);
      if (!hedefSablon) break;
      const hedefParcalar = parcala(hedefSablon);
      sonuc.push(
        hedefParcalar
          .map((p) => (yerTutucuMu(p) ? (degerler[p] !== undefined ? degerKarsiligi(degerler[p]) : '.*') : kacir(p)))
          .join(''),
      );
      // Önek eşleşmesinde hedefin yer tutucudan önceki baş literali de ("Mode reprise" ← "Recovery mode").
      const bas = hedefParcalar[0].replace(/[\s:.\u00a0\u202f]+$/, '');
      if (k === 1 && parcalar.length > 1 && bas) sonuc.push(kacir(bas));
      break;
    }
  }
  return sonuc;
}

let degisen = 0;
const eslesmeyen = new Set();

/** Doğrulayıcı (geçişli bağımlılık); yoksa doğrulama atlanır, akış yine yazılır. */
let yaml = null;
try {
  yaml = require('js-yaml');
} catch {
  yaml = null;
}

function grubuGenislet(govde) {
  const secenekler = govde.split('|');
  const eklenecek = [];
  let eslesti = false;
  const ekle = (k) => {
    if (!secenekler.includes(k) && !eklenecek.includes(k)) eklenecek.push(k);
  };
  for (const secenek of secenekler) {
    const duz = coz(secenek);
    for (const yol of dizin.get(duz) ?? []) {
      eslesti = true;
      const karsilik = hedef.get(yol);
      if (karsilik && !/[{}]/.test(karsilik)) ekle(kacir(karsilik));
    }
    if (dizin.has(duz)) continue;
    for (const k of sablonKarsiliklari(duz)) {
      eslesti = true;
      ekle(k);
    }
  }
  if (!eslesti) eslesmeyen.add(govde);
  return eklenecek.length ? [...secenekler, ...eklenecek.map(yamlKacir)].join('|') : govde;
}

function dosyalar(dizinYolu) {
  return fs.readdirSync(dizinYolu, { withFileTypes: true }).flatMap((g) => {
    const tam = path.join(dizinYolu, g.name);
    if (g.isDirectory()) return dosyalar(tam);
    return g.name.endsWith('.yaml') ? [tam] : [];
  });
}

for (const dosya of dosyalar(path.join(KOK, 'scripts', 'maestro'))) {
  const eski = fs.readFileSync(dosya, 'utf8');
  // Yorum satırlarına dokunulmaz; yalnız iç içe olmayan "(a|b)" grupları.
  const yeni = eski
    .split('\n')
    .map((satir) =>
      /^\s*#/.test(satir)
        ? satir
        : satir
            .replace(/\(([^()]*\|[^()]*)\)/g, (_, g) => `(${grubuGenislet(g)})`)
            // Fransız yazımı iki noktadan önce bölünmez boşluk koyar ("Série\u00a0: 25 jours").
            .replace(/\): /g, ')[\u00a0\u202f]?: '),
    )
    .join('\n');
  if (yeni !== eski) {
    // Bozuk YAML akışı Maestro'da sessizce boş koşu olur: yazmadan önce ayrıştır.
    try {
      yaml?.loadAll(yeni);
    } catch (e) {
      console.error(`${path.relative(KOK, dosya)}: yerelleştirilmiş akış ayrıştırılamadı: ${e.message}`);
      process.exitCode = 1;
      continue;
    }
    fs.writeFileSync(dosya, yeni);
    degisen++;
  }
}

console.log(`Maestro akışları ${dil} için genişletildi: ${degisen} dosya.`);
if (eslesmeyen.size) {
  console.log('Sözlükte karşılığı bulunmayan gruplar (olduğu gibi kaldı):');
  for (const g of [...eslesmeyen].sort()) console.log(`  (${g})`);
}
