/**
 * Siri/Kısayollar eklentisi — duvar kâğıdı yazı tipleri (Kısayollar "Günün ayeti görseli").
 *
 * Intent ana uygulama sürecinde çoğu zaman JS çalışmadan çizer: `expo-font`'un çalışma anında
 * yüklediği yazı tipi orada yoktur → Amiri Quran (Arapça) ve Amiri ("Zarif") Resources fazına ve
 * `UIAppFonts`'a girer. Tek kaynak `assets/fonts/` (git'te kopya yok). Gerçek derleme macOS CI'da.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const eklenti = require('../withSiriKisayollari');
const xcode = require('xcode');

const KOK = path.join(__dirname, '../..');

function sablonProjesi() {
  const icerik = execFileSync(
    'tar',
    ['-xzf', 'node_modules/expo/template.tgz', '-O', 'package/ios/HelloWorld.xcodeproj/project.pbxproj'],
    { encoding: 'utf8', cwd: KOK }
  );
  const proje = xcode.project('/yok/project.pbxproj');
  proje.hash = require('xcode/lib/parser/pbxproj').parse(icerik);
  return proje;
}

describe('withSiriKisayollari — duvar kâğıdı yazı tipleri', () => {
  it('Amiri Quran ve Amiri tek kaynaktan (assets/fonts) gelir; Swift aynı PostScript adlarını kullanır', () => {
    expect(eklenti.ANA_FONTLAR).toEqual(['AmiriQuran-Regular.ttf', 'Amiri-Regular.ttf']);
    for (const ad of eklenti.ANA_FONTLAR as string[]) {
      expect(eklenti.FONT_KAYNAKLARI[ad]).toBe(path.join(KOK, 'assets', 'fonts', ad));
      expect(fs.existsSync(eklenti.FONT_KAYNAKLARI[ad])).toBe(true);
      expect(fs.existsSync(path.join(KOK, 'targets', 'siri-kisayollari', ad))).toBe(false);
    }
    const intent = fs.readFileSync(path.join(KOK, 'targets/siri-kisayollari/GununAyetiGorseliIntent.swift'), 'utf8');
    expect(intent).toContain('"AmiriQuran-Regular"');
    expect(intent).toContain('"Amiri-Regular"');
  });

  it('UIAppFonts mevcut listeyi korur, eksikleri bir kez ekler', () => {
    expect(eklenti.fontlariPlisteEkle({})).toEqual({ UIAppFonts: ['AmiriQuran-Regular.ttf', 'Amiri-Regular.ttf'] });
    const plist = eklenti.fontlariPlisteEkle({ UIAppFonts: ['Diger.ttf', 'Amiri-Regular.ttf'] });
    expect(plist.UIAppFonts).toEqual(['Diger.ttf', 'Amiri-Regular.ttf', 'AmiriQuran-Regular.ttf']);
    expect(eklenti.fontlariPlisteEkle(plist).UIAppFonts).toEqual(plist.UIAppFonts);
  });

  it('yazı tipleri kopyalanır ve ana hedefin Resources fazına BİR KEZ girer (ikinci prebuild çoğaltmaz)', () => {
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'namaz-siri-'));
    try {
      let proje = sablonProjesi();
      proje = eklenti.fontlariEkle(proje, dizin, 'HelloWorld');
      proje = eklenti.fontlariEkle(proje, dizin, 'HelloWorld');
      for (const ad of eklenti.ANA_FONTLAR as string[]) {
        expect(fs.readFileSync(path.join(dizin, 'HelloWorld', ad))).toEqual(fs.readFileSync(eklenti.FONT_KAYNAKLARI[ad]));
      }
      const anaHedef = proje.getFirstTarget().uuid;
      const kaynaklar = proje.pbxResourcesBuildPhaseObj(anaHedef).files.map((f: { comment: string }) => f.comment);
      for (const ad of eklenti.ANA_FONTLAR as string[]) {
        expect(kaynaklar.filter((c: string) => c === `${ad} in Resources`)).toHaveLength(1);
      }
    } finally {
      fs.rmSync(dizin, { recursive: true, force: true });
    }
  });
});
