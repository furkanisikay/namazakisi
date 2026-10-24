/**
 * Hesap profillerinin görünen adları ve özet metinleri (Türkçe; çok dil dalgasında sözlüğe taşınır).
 */
import type { CalculationParameters } from 'adhan';
import type { HesapProfiliKimligi, IkindiYontemi, ProfilGuveni } from './hesapProfilleri';

export const PROFIL_ADLARI: Readonly<Record<HesapProfiliKimligi, string>> = {
  diyanet: 'Diyanet (Türkiye)',
  mwl: 'Müslüman Dünya Birliği',
  ummulKura: "Ümmü'l-Kurâ (Suudi Arabistan)",
  misir: 'Mısır Genel Araştırma Kurumu',
  karachi: 'Karaçi İslami Bilimler Üniversitesi',
  isna: 'ISNA (Kuzey Amerika)',
  kanada: 'FCNA (Kanada)',
  moonsighting: 'Moonsighting Committee',
  dubai: 'BAE Evkaf Kurumu',
  katar: 'Katar Evkaf Bakanlığı',
  kuveyt: 'Kuveyt Evkaf Bakanlığı',
  jakim: 'JAKIM (Malezya)',
  muis: 'MUIS (Singapur)',
  kemenag: 'Kemenag (Endonezya)',
  urdun: 'Ürdün Evkaf Bakanlığı',
  bosna: 'Bosna-Hersek İslam Birliği',
  fas: 'Fas Habous Bakanlığı',
  tunus: 'Tunus Din İşleri Bakanlığı',
  tahran: 'Tahran Jeofizik Enstitüsü (İran)',
  caferi: 'Caferî (Leva Enstitüsü, Kum)',
};

export const GUVEN_METNI: Readonly<Record<ProfilGuveni, string>> = {
  olculdu: 'Resmî takvimle ölçüldü',
  kaynakli: 'Kurumun yöntemi',
  genel: 'Genel yöntem, camiyle karşılaştırın',
};

export const IKINDI_ADLARI: Readonly<Record<IkindiYontemi, string>> = {
  evvel: 'Asr-ı evvel',
  sani: 'Asr-ı sânî',
};

export const IKINDI_ACIKLAMASI: Readonly<Record<IkindiYontemi, string>> = {
  evvel: 'Gölge bir boy olunca',
  sani: 'Gölge iki boy olunca (Hanefî)',
};

function derece(d: number): string {
  return `${Number.isInteger(d) ? d : d.toFixed(1).replace('.', ',')}°`;
}

/** "Sabah 18° · Yatsı 17°" ya da "Sabah 18,5° · Yatsı akşamdan 90 dk sonra". */
export function aciOzeti(p: CalculationParameters): string {
  const yatsi = p.ishaInterval > 0 ? `Yatsı akşamdan ${p.ishaInterval} dk sonra` : `Yatsı ${derece(p.ishaAngle)}`;
  return `Sabah ${derece(p.fajrAngle)} · ${yatsi}`;
}
