/**
 * Tanı raporu üretimi + log maskeleme (saf, store-bağımsız).
 * Gizlilik: kişisel veri içermez; konum varsayılan gizli, açıksa şehir düzeyi.
 */

import { Platform } from 'react-native';
import { UYGULAMA } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';

// İki ondalıklı koordinat çiftlerini yakalar: "41.0082, 28.9784"
const KOORDINAT = /(-?\d{1,3}\.\d{1,})\s*,\s*(-?\d{1,3}\.\d{1,})/g;
// token=..., api_key: ..., bearer ... gibi gizli değerler
const SIR = /\b(token|api[_-]?key|secret|bearer|password|authorization)\b\s*[:=]?\s*\S+/gi;
// JSON log data'sında şehir/ilçe adlarını taşıyan alanlar
// exportLogs() formatı: "alan": "değer"  (JSON.stringify ile 2-boşluk girintili)
const SEHIR_ALANI = /"(il|seciliIlAdi|ilAdi|ilce|sehir)"\s*:\s*"([^"]*)"/g;

export function loglariMaskele(metin: string, secenek: { konumDahil: boolean }): string {
  let cikti = metin.replace(SIR, '$1=[gizlendi]');
  cikti = cikti.replace(KOORDINAT, (_m, lat: string, lng: string) =>
    secenek.konumDahil
      ? `${parseFloat(lat).toFixed(1)}, ${parseFloat(lng).toFixed(1)}`
      : '[konum gizlendi]'
  );
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
  const cihaz = c.Model ?? 'bilinmiyor';
  const os = `${Platform.OS} ${c.Release ?? Platform.Version}`;
  const logMetni = loglariMaskele(Logger.exportLogs(), { konumDahil: opts.konumDahil });

  const govde = [
    'Merhaba, uygulamada bir sorun yaşadım. Teknik tanı kaydı ektedir.',
    '',
    `Sürüm: ${UYGULAMA.VERSIYON}`,
    `Cihaz: ${cihaz}`,
    `Android/OS: ${os}`,
    opts.baglam ? `Bağlam: ${opts.baglam}` : '',
    opts.neOldu ? `Ne oldu: ${opts.neOldu}` : '',
  ].filter(Boolean).join('\n');

  return {
    konu: `${UYGULAMA.ADI} tanı — v${UYGULAMA.VERSIYON}`,
    govde,
    logMetni,
  };
}
