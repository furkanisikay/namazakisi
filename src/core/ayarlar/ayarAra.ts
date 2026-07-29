/**
 * Ayarlar indeksinde saf arama/eşleştirme.
 * `src/core/` saf kalır — girdi/çıktı yalnız veri, React/store/native yok.
 */
import { aramaIcinKatla } from './metinKatlama';
import type { AyarIndeksKaydi } from './aramaIndeksi';

/**
 * `indeks` içinde `sorgu` ile eşleşen kayıtları skora göre azalan sırada
 * döner. Skor: başlık **başlangıcı** eşleşirse 3, başlık **içinde** geçerse
 * 2, yalnız bir anahtar kelimede geçerse 1 — bunların en yükseği alınır.
 * Eşit skorlu kayıtlar arasında `indeks` sırası korunur (`Array.sort` ES2019+
 * itibarıyla stabildir — hem Jest/Node'da hem Hermes'te).
 */
export function ayarAra(indeks: AyarIndeksKaydi[], sorgu: string): AyarIndeksKaydi[] {
  const temizSorgu = sorgu.trim();
  if (!temizSorgu) return [];

  const katlanmisSorgu = aramaIcinKatla(temizSorgu);

  const skorlu: Array<{ kayit: AyarIndeksKaydi; skor: number }> = [];

  for (const kayit of indeks) {
    const katlanmisBaslik = aramaIcinKatla(kayit.baslik);
    let skor = 0;

    if (katlanmisBaslik.startsWith(katlanmisSorgu)) {
      skor = 3;
    } else if (katlanmisBaslik.includes(katlanmisSorgu)) {
      skor = 2;
    } else if (kayit.anahtarKelimeler.some(k => aramaIcinKatla(k).includes(katlanmisSorgu))) {
      skor = 1;
    }

    if (skor > 0) skorlu.push({ kayit, skor });
  }

  return skorlu.sort((a, b) => b.skor - a.skor).map(s => s.kayit);
}
