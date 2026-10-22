/**
 * Apple Watch kare hattinin acilis ekrani dedektoru (`scripts/saat-kare-denetle.js`).
 * Master 39759842547'de dort magaza karesi uygulama yerine watchOS acilis ekranini
 * (siyah zemin + ortada simge) gosteriyordu; hat o kareleri basarili sayiyordu.
 * Esikler gercek simulator kareleriyle olculdu: acilis ekrani disk disinda %0,0 / %0,00,
 * en sonuk gercek kare (her zaman acik) %3,1 siyah-olmayan + %2,2 parlak.
 */
const { bmpCoz, kareDurumu } = require('../../../../scripts/saat-kare-denetle.js');

type Renk = [number, number, number];

/** 32 bit, asagidan yukari BMP (sips ciktisinin bicimi). */
function bmpUret(genislik: number, yukseklik: number, boya: (x: number, y: number) => Renk): Buffer {
  const veriBasi = 54;
  const satir = genislik * 4;
  const buf = Buffer.alloc(veriBasi + satir * yukseklik);
  buf.write('BM', 0, 'ascii');
  buf.writeUInt32LE(buf.length, 2);
  buf.writeUInt32LE(veriBasi, 10);
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(genislik, 18);
  buf.writeInt32LE(yukseklik, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(32, 28);
  buf.writeUInt32LE(0, 30);
  for (let y = 0; y < yukseklik; y++) {
    for (let x = 0; x < genislik; x++) {
      const [r, g, b] = boya(x, y);
      const o = veriBasi + (yukseklik - 1 - y) * satir + x * 4;
      buf[o] = b;
      buf[o + 1] = g;
      buf[o + 2] = r;
      buf[o + 3] = 255;
    }
  }
  return buf;
}

const G = 422;
const Y = 514;
const merkezde = (x: number, y: number, r: number) => (x - G / 2) ** 2 + (y - Y / 2) ** 2 <= r * r;

describe('saat kare dedektörü', () => {
  it('açılış ekranı (siyah zemin + ortada simge ve dönen noktalar) → acilis', () => {
    const kare = bmpUret(G, Y, (x, y) => (merkezde(x, y, 45) ? [255, 255, 255] : [0, 0, 0]));
    expect(kareDurumu(bmpCoz(kare)).durum).toBe('acilis');
  });

  it('tonlu zeminli uygulama ekranı → uygulama', () => {
    const kare = bmpUret(G, Y, (_x, y) => [Math.round(70 * (1 - y / Y)), Math.round(55 * (1 - y / Y)), 0]);
    expect(kareDurumu(bmpCoz(kare)).durum).toBe('uygulama');
  });

  it('siyah zeminli ama metinli ekran (onay penceresi, sönük) → uygulama', () => {
    const kare = bmpUret(G, Y, (x, y) => (y > 20 && y < 40 && x > 250 && x < 400 ? [255, 255, 255] : [0, 0, 0]));
    expect(kareDurumu(bmpCoz(kare)).durum).toBe('uygulama');
  });

  it('yukarıdan aşağı (negatif yükseklik) BMP de aynı pikselleri okur', () => {
    const kare = bmpUret(4, 2, (x, y) => [x * 10, y * 100, 7]);
    kare.writeInt32LE(-2, 22);
    const c = bmpCoz(kare);
    // Negatif yukseklikte satirlar ters okunur: (0, 0) artik ilk yazilan son satirdir.
    expect(c.piksel(3, 0)).toEqual([30, 100, 7]);
  });

  it('BI_BITFIELDS maskeleriyle kanal sırasını okur; alfa renk sayılmaz', () => {
    // RGBA bayt sirasi (R maskesi 0x000000ff), alfa 255: alfa renk sanilsaydi acilis
    // ekrani "parlak" gorunup uygulama diye gecerdi.
    const kare = bmpUret(G, Y, (x, y) => (merkezde(x, y, 45) ? [255, 255, 255] : [0, 0, 0]));
    const ham = Buffer.alloc(kare.length + 16);
    kare.copy(ham, 0, 0, 54);
    ham.write('BM', 0, 'ascii');
    ham.writeUInt32LE(70, 10);
    ham.writeUInt32LE(3, 30);
    ham.writeUInt32LE(0x000000ff, 54);
    ham.writeUInt32LE(0x0000ff00, 58);
    ham.writeUInt32LE(0x00ff0000, 62);
    ham.writeUInt32LE(0xff000000, 66);
    for (let o = 54; o < kare.length; o += 4) {
      const [b, g, r] = [kare[o], kare[o + 1], kare[o + 2]];
      ham[o + 16] = r;
      ham[o + 17] = g;
      ham[o + 18] = b;
      ham[o + 19] = 255;
    }
    const c = bmpCoz(ham);
    expect(c.piksel(0, 0)).toEqual([0, 0, 0]);
    expect(kareDurumu(c).durum).toBe('acilis');
  });

  it('BMP olmayan dosyayı reddeder', () => {
    expect(() => bmpCoz(Buffer.from('PNG değil'))).toThrow();
  });
});
