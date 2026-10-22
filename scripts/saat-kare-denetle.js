#!/usr/bin/env node
/**
 * Apple Watch simulator karesi gercekten UYGULAMAYI mi gosteriyor, yoksa watchOS acilis
 * ekranini mi (siyah zemin + ortada tek uygulama simgesi + donen noktalar)?
 *
 * Kullanim: node scripts/saat-kare-denetle.js <kare.bmp>
 *   cikis 0 → "uygulama", cikis 3 → "acilis", cikis 2 → okunamadi.
 * BMP: `sips -s format bmp` ciktisi (macOS'ta PNG cozucu bagimliligi gerektirmez).
 *
 * Kural (saf, `kareDurumu`): merkezdeki diskin (simge + noktalar) DISINDA kalan pikseller
 * acilis ekraninda tamamen siyahtir. Uygulama ekranlari ya tonlu zemin cizer
 * (`containerBackground` / radyal gradyan) ya da en azindan metin/dugme (onay penceresi).
 * Bu yuzden disk disinda "siyah olmayan" ya da "parlak" piksel orani esigi asarsa uygulama.
 */
'use strict';

const fs = require('fs');

/** Sikistirilmamis 24/32 bit BMP → { genislik, yukseklik, piksel(x, y) → [r, g, b] }. */
function bmpCoz(buf) {
  if (buf.length < 54 || buf.toString('ascii', 0, 2) !== 'BM') throw new Error('BMP degil');
  const veriBasi = buf.readUInt32LE(10);
  const genislik = buf.readInt32LE(18);
  const hamYukseklik = buf.readInt32LE(22);
  const bit = buf.readUInt16LE(28);
  const sikistirma = buf.readUInt32LE(30);
  if (bit !== 24 && bit !== 32) throw new Error(`desteklenmeyen bit derinligi: ${bit}`);
  // 0 = BI_RGB, 3 = BI_BITFIELDS (sips 32 bit'te yazar; duzen BGRA kabul edilir).
  if (sikistirma !== 0 && sikistirma !== 3) throw new Error(`sikistirilmis BMP: ${sikistirma}`);
  const yukseklik = Math.abs(hamYukseklik);
  const asagidanYukari = hamYukseklik > 0;
  const bayt = bit / 8;
  const satir = Math.ceil((bit * genislik) / 32) * 4;
  // Kanal bayt konumlari: varsayilan BGR(A). BI_BITFIELDS'te maskeler (BITMAPINFOHEADER'da
  // basliktan hemen sonra, V4/V5'te basligin icinde — ikisi de 54. bayt) okunur. ALFA'yi
  // renk sanmak tum kareyi "parlak" yapar ve acilis ekranini uygulama diye gecirirdi.
  let [ri, gi, bi] = [2, 1, 0];
  if (sikistirma === 3 && bit === 32 && buf.length >= 66) {
    const konum = (maske) => [0, 1, 2, 3].find((i) => maske === ((0xff << (8 * i)) >>> 0));
    const [kr, kg, kb] = [buf.readUInt32LE(54), buf.readUInt32LE(58), buf.readUInt32LE(62)].map(konum);
    if (kr === undefined || kg === undefined || kb === undefined) throw new Error('desteklenmeyen kanal maskesi');
    [ri, gi, bi] = [kr, kg, kb];
  }
  return {
    genislik,
    yukseklik,
    piksel(x, y) {
      const sy = asagidanYukari ? yukseklik - 1 - y : y;
      const o = veriBasi + sy * satir + x * bayt;
      return [buf[o + ri], buf[o + gi], buf[o + bi]];
    },
  };
}

/** @returns {{ durum: 'uygulama' | 'acilis', siyahOlmayan: number, parlak: number }} */
function kareDurumu(kare) {
  const { genislik, yukseklik } = kare;
  const cx = genislik / 2;
  const cy = yukseklik / 2;
  const r = 0.3 * Math.min(genislik, yukseklik);
  let toplam = 0;
  let siyahOlmayan = 0;
  let parlak = 0;
  for (let y = 0; y < yukseklik; y += 2) {
    for (let x = 0; x < genislik; x += 2) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) continue;
      toplam += 1;
      const [kr, kg, kb] = kare.piksel(x, y);
      const enBuyuk = Math.max(kr, kg, kb);
      if (enBuyuk > 12) siyahOlmayan += 1;
      if (enBuyuk > 90) parlak += 1;
    }
  }
  const siyahOran = toplam ? siyahOlmayan / toplam : 0;
  const parlakOran = toplam ? parlak / toplam : 0;
  const uygulama = siyahOran > 0.04 || parlakOran > 0.002;
  return { durum: uygulama ? 'uygulama' : 'acilis', siyahOlmayan: siyahOran, parlak: parlakOran };
}

module.exports = { bmpCoz, kareDurumu };

if (require.main === module) {
  const yol = process.argv[2];
  try {
    const sonuc = kareDurumu(bmpCoz(fs.readFileSync(yol)));
    console.log(
      `${sonuc.durum} (siyah olmayan %${(sonuc.siyahOlmayan * 100).toFixed(1)}, parlak %${(sonuc.parlak * 100).toFixed(2)})`,
    );
    process.exit(sonuc.durum === 'uygulama' ? 0 : 3);
  } catch (e) {
    console.log(`okunamadi: ${e.message}`);
    process.exit(2);
  }
}
