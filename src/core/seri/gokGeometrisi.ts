/**
 * Gök takımyıldızı panelinin geometrisi: hücre merkezleri hesapla (ÖLÇÜLMEZ),
 * bir zincir bağının SVG yol dizesini üret, o yolun uzunluğunu hesapla.
 *
 * SAF: react-native-svg'ye hiç dokunmaz — yalnız yol/koordinat matematiği.
 * `getTotalLength()` react-native-svg'de vardır ama imperatif ref + native
 * çağrı ister (mount öncesi/testte kullanılamaz) — bilerek kullanılmaz.
 */

export interface GokOlculeri {
  panelGenislik: number;
  satirSayisi: number;
  yatayPay: number;
  ustPay: number;
  satirAraligi: number;
}

export interface Nokta {
  x: number;
  y: number;
}

export interface GokYerlesimi {
  hucreGenislik: number;
  toplamYukseklik: number;
  merkez(indeks: number): Nokta;
}

/** Izgara sütun sayısı — `GokPaneli`'nin yerleşimi ve `zincir.ts`'in
 * satır-sarması işaretlemesi (`i % SUTUN_SAYISI === SUTUN_SAYISI - 1`) bu
 * değerle SENKRON olmak zorundadır; önceden üç yerde ayrı ayrı tanımlıydı
 * (inceleme bulgusu) — tek kaynak burası. */
export const SUTUN_SAYISI = 7;

/**
 * Panel ölçülerinden (genişlik, satır sayısı, boşluklar) hücre merkezlerini
 * HESAPLAR. Ölçüm turu (`onLayout` sonrası ikinci geçiş) gerekmez.
 */
export function gokYerlesimi(o: GokOlculeri): GokYerlesimi {
  const hucreGenislik = (o.panelGenislik - 2 * o.yatayPay) / SUTUN_SAYISI;
  const toplamYukseklik =
    2 * o.ustPay + o.satirSayisi * hucreGenislik + (o.satirSayisi - 1) * o.satirAraligi;

  return {
    hucreGenislik,
    toplamYukseklik,
    merkez(indeks: number): Nokta {
      const sutun = indeks % SUTUN_SAYISI;
      const satir = Math.floor(indeks / SUTUN_SAYISI);
      return {
        x: o.yatayPay + hucreGenislik * (sutun + 0.5),
        y: o.ustPay + (hucreGenislik + o.satirAraligi) * satir + hucreGenislik / 2,
      };
    },
  };
}

/**
 * Bir zincir bağının SVG yol dizesi.
 *
 * `bosluk` HER İKİ uçta da uygulanır — yol `a`/`b` merkezlerinden değil,
 * merkezlerden `bosluk` kadar İÇERİ ÇEKİLMİŞ noktalardan başlar/biter.
 * Bunsuz (bosluk=0 çağrılırsa) yol tam merkez-merkez çizilir ve kalın/parlak
 * (`ikisiTam`) bağlar yıldızın halka+bloom bölgesinin İÇİNDEN geçer — bu,
 * incelemede yakalanan bir görsel hataydı (referans `M x1+bosluk … L
 * x2-bosluk` çiziyor, uçlar hep yıldızın dışında kalıyor).
 *
 * Satır sarmasında (haftanın son günü -> ertesi haftanın ilk günü) satırlar
 * arası şeritten geçen TEK bir kübik yay çizilir; kenarlara gidip geri dönen
 * KUTU biçimi (referansta denenip) REDDEDİLDİ. Uçlar burada da `bosluk`
 * kadar içeri çekilir (yatayda; `y` değişmez), kontrol noktaları o içeri
 * çekilmiş uçlardan şeridin y-konumuna (`seritY`) doğru bükülür — yay
 * hiçbir yıldızın üstünden geçmez.
 */
export function bagYolu(a: Nokta, b: Nokta, satirSarmasi: boolean, seritY: number, bosluk: number): string {
  if (!satirSarmasi) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const uzunluk = Math.hypot(dx, dy);
    if (uzunluk === 0 || bosluk <= 0) {
      return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    }
    const birimX = dx / uzunluk;
    const birimY = dy / uzunluk;
    const baslangic: Nokta = { x: a.x + birimX * bosluk, y: a.y + birimY * bosluk };
    const bitis: Nokta = { x: b.x - birimX * bosluk, y: b.y - birimY * bosluk };
    return `M ${baslangic.x} ${baslangic.y} L ${bitis.x} ${bitis.y}`;
  }

  const baslangic: Nokta = { x: a.x + bosluk, y: a.y };
  const bitis: Nokta = { x: b.x - bosluk, y: b.y };
  const kontrol1: Nokta = { x: baslangic.x, y: seritY };
  const kontrol2: Nokta = { x: bitis.x, y: seritY };

  return `M ${baslangic.x} ${baslangic.y} C ${kontrol1.x} ${kontrol1.y} ${kontrol2.x} ${kontrol2.y} ${bitis.x} ${bitis.y}`;
}

/** `bagYolu` tarafından üretilen bir yol dizesinden sayıları sırayla çıkarır. */
function sayilariAyikla(yol: string): number[] {
  const eslesmeler = yol.match(/-?\d+(?:\.\d+)?/g);
  return eslesmeler ? eslesmeler.map(Number) : [];
}

function kubikBezierNoktasi(t: number, p0: Nokta, p1: Nokta, p2: Nokta, p3: Nokta): Nokta {
  const ters = 1 - t;
  const a = ters * ters * ters;
  const b = 3 * ters * ters * t;
  const c = 3 * ters * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

/** Kübik Bezier yol uzunluğu bu kadar adımda örneklenir (hata < %1). */
const ORNEKLEME_ADIMI = 16;

/**
 * Bir yol dizesinin (yalnız `bagYolu`'nun ürettiği `M..L..` veya `M..C..`
 * biçimleri) uzunluğunu hesaplar.
 *
 * - Düz yol (`L`): iki nokta arası Öklid mesafesi.
 * - Kübik yol (`C`): eğri `ORNEKLEME_ADIMI` adımda çokgene örneklenir ve
 *   parça uzunlukları toplanır (hata < %1).
 */
export function yolUzunlugu(yol: string): number {
  const sayilar = sayilariAyikla(yol);

  if (yol.includes('C') && sayilar.length >= 8) {
    const [x0, y0, c1x, c1y, c2x, c2y, x1, y1] = sayilar;
    const p0: Nokta = { x: x0, y: y0 };
    const p1: Nokta = { x: c1x, y: c1y };
    const p2: Nokta = { x: c2x, y: c2y };
    const p3: Nokta = { x: x1, y: y1 };

    let toplam = 0;
    let onceki = p0;
    for (let i = 1; i <= ORNEKLEME_ADIMI; i++) {
      const t = i / ORNEKLEME_ADIMI;
      const nokta = kubikBezierNoktasi(t, p0, p1, p2, p3);
      toplam += Math.hypot(nokta.x - onceki.x, nokta.y - onceki.y);
      onceki = nokta;
    }
    return toplam;
  }

  if (sayilar.length >= 4) {
    const [x0, y0, x1, y1] = sayilar;
    return Math.hypot(x1 - x0, y1 - y0);
  }

  return 0;
}
