/**
 * Telefonun hesap ayarının Android TV'ye giden ÖZETİ (cihaz ağı yükü `durum.hesap`).
 *
 * TV vakitleri cihazda adhan2 (Kotlin) ile hesaplar; telefon hangi yöntemi kullanıyorsa TV de
 * onu kullanmalı. Profil adı değil, ÇÖZÜLMÜŞ parametreler gider: TV profil tablosu taşımaz,
 * yeni profil eklemek TV sürümü gerektirmez. Dokunulmamış Diyanet ayarında özet YOKTUR
 * (alan yoksa TV Türkiye yolunu kullanır — eski telefon sürümleriyle de aynı sonuç).
 *
 * İkizi: TV `cekirdek/VakitHesabi.kt > hesapla(…, hesap)`. Kilit: `vakit-fiksturu-dunya.json`
 * (üretici `scripts/tv/tv-verisi-uret.js`) ↔ Kotlin `VakitHesabiTest` ↔ jest `TvVakitParitesi`.
 * Saf modül.
 */
import { CalculationParameters, HighLatitudeRule, Madhab } from 'adhan';
import {
  diyanetDokunulmamisMi,
  HESAP_PROFILLERI,
  hesapParametreleriOlustur,
  UMMUL_KURA_RAMAZAN,
  type HesapAyari,
} from './hesapProfilleri';

export type TvYuksekEnlem = 'orta' | 'yedide' | 'aci';

export interface TvHesapOzeti {
  /** `ay` = Moonsighting Committee (mevsimsel sabah/yatsı), `diger` = açı tabanlı genel yol. */
  y: 'diger' | 'ay';
  /** Sabah ve yatsı açısı (derece). */
  f: number;
  i: number;
  /** Yatsı = akşam + `ia` dk (0 = açıyla). Ramazan eki DAHİL DEĞİL (`rmz`). */
  ia: number;
  /** Akşam açısı (Caferî/Tahran); yoksa akşam = gün batımı. */
  ma?: number;
  /** İkindi: evvel (gölge 1×) / sani (2×). */
  a: 'evvel' | 'sani';
  k: TvYuksekEnlem;
  /** Vakit başına toplam dakika düzeltmesi: [imsak, güneş, öğle, ikindi, akşam, yatsı]. */
  o: [number, number, number, number, number, number];
  /** Ümmü'l-Kurâ: bu aralıkta (iki uç dahil) yatsı aralığına `dk` eklenir. */
  rmz?: { b: string; s: string; dk: number };
}

const YUKSEK_ENLEM: Record<string, TvYuksekEnlem> = {
  [HighLatitudeRule.MiddleOfTheNight]: 'orta',
  [HighLatitudeRule.SeventhOfTheNight]: 'yedide',
  [HighLatitudeRule.TwilightAngle]: 'aci',
};

function isoGun(t: Date): string {
  const a = t.getMonth() + 1;
  const g = t.getDate();
  return `${t.getFullYear()}-${a < 10 ? '0' : ''}${a}-${g < 10 ? '0' : ''}${g}`;
}

/**
 * Ayarı TV özetine çevirir. `enlem` yüksek enlem kuralı için (yükteki konumla aynı yer),
 * `bugun` Ramazan aralığını seçmek için (süren ya da sıradaki ilk aralık).
 */
export function tvHesapOzeti(ayar: HesapAyari, enlem: number, bugun: Date): TvHesapOzeti | null {
  if (diyanetDokunulmamisMi(ayar)) return null;
  // Ramazan ekini özetten ayrı tutmak için tarihsiz kurulur (ek `rmz` ile gider).
  const p = hesapParametreleriOlustur(ayar, { enlem });
  const ek = (k: keyof CalculationParameters['adjustments']) =>
    (p.adjustments[k] || 0) + (p.methodAdjustments[k] || 0);
  const ozet: TvHesapOzeti = {
    y: p.method === 'MoonsightingCommittee' ? 'ay' : 'diger',
    f: p.fajrAngle,
    i: p.ishaAngle,
    ia: p.ishaInterval,
    ...(p.maghribAngle ? { ma: p.maghribAngle } : {}),
    a: p.madhab === Madhab.Hanafi ? 'sani' : 'evvel',
    k: YUKSEK_ENLEM[String(p.highLatitudeRule)] ?? 'orta',
    o: [ek('fajr'), ek('sunrise'), ek('dhuhr'), ek('asr'), ek('maghrib'), ek('isha')],
  };
  const profil = HESAP_PROFILLERI[ayar.profil];
  if (profil?.ramazanYatsiEkDk && p.ishaInterval > 0) {
    const gun = isoGun(bugun);
    const aralik = UMMUL_KURA_RAMAZAN.find(([, son]) => son >= gun);
    if (aralik) ozet.rmz = { b: aralik[0], s: aralik[1], dk: profil.ramazanYatsiEkDk };
  }
  return ozet;
}
