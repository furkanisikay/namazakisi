/**
 * Sayı–birim ve parça arası boşluk nöbetçisi: JS sözlüğün `sure.birimli` ('{n} {birim}',
 * Çince '{n}{birim}') ve `sure.parcali` ('{once} {sonra}') kalıplarındaki ayıraç, native
 * ikizlerin ayıraçlarıyla AYNI olmalı — çevirmen bir dili boşluksuz yaptığında widget/saat/TV
 * sayacı da bitişik yazsın. Native tablolar ayıracı yalnız farklıysa (ya da dalga 9 bloklarında
 * açıkça) yazar; yazılmadıysa tek boşluktur. Kural: `docs/ajan/coklu-dil.md > Sayı ve birim`.
 */
import * as fs from 'fs';
import * as path from 'path';
import { DILLER } from '../core/dil/diller';
import { birimAyiraci, parcaAyiraci } from '../core/dil/sure';

const KOK = path.join(__dirname, '..', '..');
const oku = (yol: string) => fs.readFileSync(path.join(KOK, yol), 'utf8');

type Ayiraclar = Record<string, [string, string]>;

/** Kotlin `object XDili<Ad> : XDili { … }` blokları: `kod` → [birimAyirici, parcaAyirici]. */
function kotlinNesneleri(yol: string, arayuz: string): Ayiraclar {
  const sonuc: Ayiraclar = {};
  const bloklar = oku(yol).split(new RegExp(`\\nobject \\w+ : ${arayuz} \\{`)).slice(1);
  for (const blok of bloklar) {
    const govde = blok.split(/\n\}\n/)[0];
    const kod = /override val kod = "(\w+)"/.exec(govde)?.[1];
    if (!kod) continue;
    const birim = /override val birimAyirici = "([^"]*)"/.exec(govde)?.[1] ?? ' ';
    const parca = /override val parcaAyirici = "([^"]*)"/.exec(govde)?.[1] ?? ' ';
    sonuc[kod] = [birim, parca];
  }
  return sonuc;
}

it('JS kalıplarındaki ayıraçlar native ikizlerle aynı', () => {
  const sayac: Ayiraclar = {};
  const kt = oku('modules/expo-countdown-notification/android/src/main/java/expo/modules/countdownnotification/cekirdek/CanliGuncellemeKurallari.kt');
  for (const e of kt.matchAll(/"(\w+)" to KisaBirimler\("[^"]*", "[^"]*"(?:, birimAyirici = "([^"]*)", parcaAyirici = "([^"]*)")?\)/g)) {
    sayac[e[1]] = [e[2] ?? ' ', e[3] ?? ' '];
  }
  const saat: Ayiraclar = {};
  const swift = oku('targets/saat/ortak/SaatSure.swift');
  for (const e of swift.matchAll(/public static let (\w+) = SaatSureMetinleri\(([\s\S]*?)\n {4}\)/g)) {
    const a = /birimAyirici: "([^"]*)", parcaAyirici: "([^"]*)"/.exec(e[2]);
    saat[e[1]] = [a?.[1] ?? ' ', a?.[2] ?? ' '];
  }
  const tablolar: Record<string, Ayiraclar> = {
    'expo-countdown-notification KISA_BIRIMLER': sayac,
    'Wear SaatDili': kotlinNesneleri('wear/app/src/main/java/com/furkanisikay/namazakisi/saat/cekirdek/SaatDili.kt', 'SaatDili'),
    'TV TvDili': kotlinNesneleri('tv/app/src/main/java/com/furkanisikay/namazakisi/tv/cekirdek/TvDili.kt', 'TvDili'),
    'Swift SaatSureMetinleri': saat,
  };
  for (const [ad, tablo] of Object.entries(tablolar)) {
    for (const { kod } of DILLER) {
      expect([ad, kod, tablo[kod]]).toEqual([ad, kod, [birimAyiraci(kod), parcaAyiraci(kod)]]);
    }
  }
  // Nöbetçinin kendisi: Çince bugün boşluksuz kurulu (ayrıştırma gerçekten okuyor).
  expect(sayac.zh).toEqual(['', '']);
});
