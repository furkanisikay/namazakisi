/**
 * Android 13+ uygulama başına dil listesi (`res/xml/locales_config.xml`) seçilebilir dillerle
 * birebir aynı olmalı: kapalı dil sistem ayarından seçilirse uygulama Türkçeye düşer, açık dil
 * listede yoksa sistem ayarında görünmez.
 */
import * as fs from 'fs';
import * as path from 'path';
import { DILLER } from '../core/dil/diller';

const kok = path.join(__dirname, '..', '..', 'android', 'app', 'src', 'main');
/**
 * Dil kodu → `locales_config.xml` adı. Basitleştirilmiş Çince betikle yazılır (`zh-Hans`, Android
 * belgesinin örneği): sistemin uygulama dili seçicisi "简体中文" gösterir ve seçim `values-zh` ile eşleşir.
 */
const LOCALE_CONFIG_ADI: Partial<Record<string, string>> = { zh: 'zh-Hans' };

it('locales_config.xml = seçilebilir diller, manifest ona bağlı', () => {
  const xml = fs.readFileSync(path.join(kok, 'res', 'xml', 'locales_config.xml'), 'utf8');
  const listede = [...xml.matchAll(/<locale android:name="([^"]+)"\s*\/>/g)].map((m) => m[1]).sort();
  const acik = DILLER.filter((d) => d.secilebilir).map((d) => LOCALE_CONFIG_ADI[d.kod] ?? d.kod).sort();
  expect(listede).toEqual(acik);
  const manifest = fs.readFileSync(path.join(kok, 'AndroidManifest.xml'), 'utf8');
  expect(manifest).toContain('android:localeConfig="@xml/locales_config"');
});
