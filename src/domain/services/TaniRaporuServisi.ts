/**
 * Tanı raporu üretimi + log maskeleme (saf, store-bağımsız).
 * Gizlilik: kişisel veri içermez; konum varsayılan gizli, açıksa şehir düzeyi.
 */

// İki ondalıklı koordinat çiftlerini yakalar: "41.0082, 28.9784"
const KOORDINAT = /(-?\d{1,3}\.\d{1,})\s*,\s*(-?\d{1,3}\.\d{1,})/g;
// token=..., api_key: ..., bearer ... gibi gizli değerler
const SIR = /\b(token|api[_-]?key|secret|bearer|password|authorization)\b\s*[:=]?\s*\S+/gi;

export function loglariMaskele(metin: string, secenek: { konumDahil: boolean }): string {
  let cikti = metin.replace(SIR, '$1=[gizlendi]');
  cikti = cikti.replace(KOORDINAT, (_m, lat: string, lng: string) =>
    secenek.konumDahil
      ? `${parseFloat(lat).toFixed(1)}, ${parseFloat(lng).toFixed(1)}`
      : '[konum gizlendi]'
  );
  return cikti;
}
