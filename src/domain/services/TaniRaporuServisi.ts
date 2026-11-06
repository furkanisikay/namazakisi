/**
 * Tanı raporu üretimi + log maskeleme (saf, store-bağımsız).
 * Gizlilik: kişisel veri içermez; konum varsayılan gizli, açıksa şehir düzeyi.
 */

import { Platform } from 'react-native';
import { UYGULAMA } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { bicim, metin } from '../../core/dil/aktifDil';

// Ondalıklı koordinat çiftlerini yakalar (en az 1 ondalık): "41.0082, 28.9784"
const KOORDINAT = /(-?\d{1,3}\.\d{1,})\s*,\s*(-?\d{1,3}\.\d{1,})/g;
// token=..., api_key: ..., secret ..., password=..., authorization ... gibi gizli DEĞERLER.
// Değer yakalaması (sırayla): "bearer <jwt>" (Authorization: Bearer ... — tek \S+ JWT'yi
// kaçırmasın), "tırnaklı çok-kelimeli değer" (örn. "password": "my secret password" — ilk
// boşlukten sonrasını sızdırmasın), aksi halde tek token \S+. "bearer" anahtar olarak da
// listede → kendi başına da yakalanır.
const SIR = /\b(token|api[_-]?key|secret|bearer|password|authorization)\b\s*[:=]?\s*(bearer\s+\S+|"[^"]+"|'[^']+'|\S+)/gi;
// JSON log data'sında şehir/ilçe/adres adlarını taşıyan alanlar
// exportLogs() formatı: "alan": "değer"  (JSON.stringify ile 2-boşluk girintili)
// Yeni konum taşıyan log alanı eklenirse buraya kaydedilmeli; isim-bazlı, en iyi-çaba.
// i bayrağı: "Il"/"Sehir" gibi büyük-harfli alan adları da yakalansın.
const SEHIR_ALANI = /"(il|seciliIlAdi|ilAdi|ilce|sehir|adres|mahalle|bolge|semt)"\s*:\s*"([^"]*)"/gi;

export function loglariMaskele(metin: string, secenek: { konumDahil: boolean }): string {
  // KOORDINAT'ı SIR'den ÖNCE çalıştır: aksi halde "secret 41.0082, 28.9784" gibi
  // dizilerde SIR koordinatın bir parçasını yutup boylamı sızdırabilir.
  let cikti = metin.replace(KOORDINAT, (_m, lat: string, lng: string) =>
    secenek.konumDahil
      ? `${parseFloat(lat).toFixed(1)}, ${parseFloat(lng).toFixed(1)}`
      : '[konum gizlendi]'
  );
  cikti = cikti.replace(SIR, '$1=[gizlendi]');
  if (!secenek.konumDahil) {
    cikti = cikti.replace(SEHIR_ALANI, '"$1": "[konum gizlendi]"');
  }
  return cikti;
}

export function taniRaporuOlustur(opts: {
  baglam?: string;
  konumDahil: boolean;
  neOldu?: string;
}): { konu: string; govde: string; logMetni: string } {
  const c = (Platform.constants ?? {}) as { Model?: string; Release?: string };
  const m = metin().genel.tani.rapor;
  const cihaz = c.Model ?? m.bilinmiyor;
  const os = `${Platform.OS} ${c.Release ?? Platform.Version}`;
  const logMetni = loglariMaskele(Logger.exportLogs(), { konumDahil: opts.konumDahil });

  const govde = [
    m.giris,
    '',
    bicim(m.surum, { surum: UYGULAMA.VERSIYON }),
    bicim(m.cihaz, { cihaz }),
    `Android/OS: ${os}`,
    opts.baglam ? bicim(m.baglam, { baglam: opts.baglam }) : '',
    opts.neOldu ? bicim(m.neOldu, { neOldu: opts.neOldu }) : '',
  ].filter(Boolean).join('\n');

  return {
    konu: bicim(m.konu, { ad: UYGULAMA.ADI, surum: UYGULAMA.VERSIYON }),
    govde,
    logMetni,
  };
}
