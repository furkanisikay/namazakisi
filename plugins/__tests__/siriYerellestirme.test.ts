/**
 * iOS `.lproj` dosyaları uygulamayı işletim sistemi gözünde çok dilli yapar (Ayarlar'da dil
 * seçici, Siri ve Kısayollar cihaz dilinde). Bir dil bu yüzden JS seçicisiyle AYNI ANDA açılır:
 * eklentinin `diller` seçeneği (yoksa yalnız `tr`) = `DILLER` içindeki seçilebilir diller.
 */
import * as fs from 'fs';
import * as path from 'path';
import { DILLER } from '../../src/core/dil/diller';

type Eklenti = string | [string, { diller?: string[] }?];

it('Siri/Kısayollar yerelleştirme dilleri = JS seçicisindeki diller (yarım dil yok)', () => {
  const app = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'app.json'), 'utf8')) as {
    expo: { plugins: Eklenti[] };
  };
  const kayit = app.expo.plugins.find((p) => (Array.isArray(p) ? p[0] : p) === './plugins/withSiriKisayollari');
  expect(kayit).toBeDefined();
  const diller = (Array.isArray(kayit) ? kayit[1]?.diller : undefined) ?? ['tr'];
  const secilebilir = DILLER.filter((d) => d.secilebilir).map((d) => d.kod);
  expect([...diller].sort()).toEqual([...secilebilir].sort());
});

it('açık her dil için .lproj dizini var (tr dahil: yoksa Türkçe cihaz İngilizceye düşer)', () => {
  const kaynak = path.join(__dirname, '..', '..', 'targets', 'siri-kisayollari');
  for (const d of DILLER) {
    expect(fs.existsSync(path.join(kaynak, `${d.kod}.lproj`, 'Localizable.strings'))).toBe(true);
  }
});
