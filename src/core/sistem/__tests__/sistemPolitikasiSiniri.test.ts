/**
 * NÖBETÇİ — "hatırlatma güvenilirliğine dokunulmaz" sözünün kanıtı.
 *
 * Sistem koşulları (güç/veri tasarrufu, ağ, şarj) yalnız ERTELENEBİLİR işleri uyarlar:
 * dekoratif hareket, tek seferlik konum ölçümü, eşitleme, güncelleme kontrolü, ekran
 * bilgisi. Bildirim/alarm/sesli okuma planlayan hiçbir dosya bu modülleri içe
 * aktaramaz. Yeni bir tüketici eklerken bu listeye BİLEREK ekleyin; planlayıcıysa
 * eklemeyin — hatırlatma her koşulda kurulur.
 */
import * as fs from 'fs';
import * as path from 'path';

const KOK = path.resolve(__dirname, '../../../..');
const SRC = path.join(KOK, 'src');

/** İçe aktarması serbest olan dosyalar (src'ye göre, POSIX ayraçlı). */
const IZINLI = new Set([
  'core/sistem/sistemDurumu.ts',
  'core/esitleme/esitlemePolitikasi.ts',
  'core/ayarlar/kurulumSagligi.ts',
  'domain/services/SistemKosullariServisi.ts',
  'domain/services/EsitlemeServisi.ts',
  'domain/services/GuncellemeServisi.ts',
  'domain/services/KonumTakipServisi.ts',
  'presentation/hooks/useSistemKosullari.ts',
  'presentation/hooks/useHareketAzalt.ts',
  'presentation/hooks/useAyarOzetleri.ts',
  'presentation/components/esitleme/EsitlemeTetikleyici.tsx',
  'presentation/screens/Ayarlar/SistemDurumuCipi.tsx',
]);

const KALIP = /(core\/sistem\/sistemDurumu|SistemKosullariServisi|useSistemKosullari|expo-sistem-durumu)['"]/;

function tara(dizin: string, sonuc: string[]): void {
  for (const ad of fs.readdirSync(dizin)) {
    const yol = path.join(dizin, ad);
    if (fs.statSync(yol).isDirectory()) {
      if (ad !== '__tests__') tara(yol, sonuc);
    } else if (/\.(ts|tsx)$/.test(ad)) {
      sonuc.push(yol);
    }
  }
}

describe('sistem koşulları politikası — sınır', () => {
  const dosyalar: string[] = [];
  tara(SRC, dosyalar);
  const iceAktaranlar = dosyalar
    .filter((y) => KALIP.test(fs.readFileSync(y, 'utf8')))
    .map((y) => path.relative(SRC, y).split(path.sep).join('/'));

  it('yalnız izinli (ertelenebilir iş) dosyaları içe aktarır', () => {
    expect(iceAktaranlar.filter((y) => !IZINLI.has(y))).toEqual([]);
  });

  it('hiçbir hatırlatma planlayıcısı listede değil', () => {
    const planlayici = /(Muhafiz|Teslimci|Alarm|Anons|Bildirim|Hatirlatma|Sayac|Nafile|Cuma|CamiyeGit|Yatis|TakvimCakisma)/;
    expect([...IZINLI].filter((y) => y.startsWith('domain/') && planlayici.test(y))).toEqual([]);
    expect(iceAktaranlar.some((y) => y.startsWith('core/muhafiz/') || y.startsWith('core/bildirim/'))).toBe(false);
  });
});
