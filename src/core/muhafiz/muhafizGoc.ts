import type { MuhafizMatrisi, SeviyeAyari } from './matrisTipleri';
import { MUHAFIZ_VAKITLERI, SEVIYE_KADEMELERI, VARSAYILAN_SES } from './matrisTipleri';

/** Eski semada ACILIYETI tasiyan ses id'si (bkz. `eskiAlarmSesiniGoc`). */
export const ESKI_ALARM_SESI = 'alarm';

export interface EskiMuhafizAyari {
  esikler: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
  sikliklar: { seviye1: number; seviye2: number; seviye3: number; seviye4: number };
}

export function eskidenMatriseGoc(eski: EskiMuhafizAyari): MuhafizMatrisi {
  const esikDizi = [eski.esikler.seviye1, eski.esikler.seviye2, eski.esikler.seviye3, eski.esikler.seviye4];
  const siklikDizi = [eski.sikliklar.seviye1, eski.sikliklar.seviye2, eski.sikliklar.seviye3, eski.sikliklar.seviye4];
  const vakitAyari = () => ({
    seviyeler: SEVIYE_KADEMELERI.map((kademe, i): SeviyeAyari => ({
      kademe,
      mod: 'bildirim',
      esikDk: esikDizi[i],
      siklik: { herDk: siklikDizi[i] },
      bildirimSesi: VARSAYILAN_SES,
      anonsMetni: '',
    })),
  });
  const matris = {} as MuhafizMatrisi;
  for (const v of MUHAFIZ_VAKITLERI) matris[v] = vakitAyari();
  return matris;
}

/**
 * ESKI 'alarm' SES ID'SINI ACILIYET ALANINA TASIR (bir kerelik, idempotent).
 *
 * NEDEN: eski semada aciliyet SES ID'SIYLE tasiniyordu (`bildirimSesi: 'alarm'`
 * = MAX onem + bypassDnd). Ses ile onem ayrildiktan sonra bu deger diskte
 * OKSUZ kaldi: motor onu hala aciliyet sinyali sayiyordu ama UI'da izi yoktu
 * (`sesKimliginiNormalize('alarm')` → "Uygulama sesi"). Kullanici yeni bir ses
 * sectigi an aciliyet SESSIZCE kayboluyor, geri getirme yolu da bulunmuyordu.
 *
 * Goc, anlami GORUNUR ve DEGISTIRILEBILIR bir alana taşır:
 *   `bildirimSesi: 'alarm'` → `bildirimSesi: 'varsayilan'` + `acilKanal: true`
 *
 * `acilKanal` ZATEN yazilmissa dokunulmaz — kullanicinin acik tercihi eski
 * cikarimdan onceliklidir (uc durumlu `acilKanal`, bkz. `muhafizAcilKanalMi`).
 *
 * DEGISIKLIK YOKSA AYNI REFERANS doner: `muhafizMatrisiniCoz` kimligi korur ve
 * gereksiz kopya/diske-yazma tetiklenmez.
 */
export function eskiAlarmSesiniGoc(matris: MuhafizMatrisi): MuhafizMatrisi {
  let degisti = false;
  const sonuc = {} as MuhafizMatrisi;

  for (const vakit of MUHAFIZ_VAKITLERI) {
    const vakitAyari = matris[vakit];
    if (!vakitAyari?.seviyeler) {
      sonuc[vakit] = vakitAyari;
      continue;
    }

    let vakitDegisti = false;
    const seviyeler = vakitAyari.seviyeler.map((seviye) => {
      if (seviye?.bildirimSesi !== ESKI_ALARM_SESI) return seviye;
      vakitDegisti = true;
      return {
        ...seviye,
        bildirimSesi: VARSAYILAN_SES,
        sesAdi: undefined,
        acilKanal: seviye.acilKanal ?? true,
      };
    });

    if (vakitDegisti) degisti = true;
    sonuc[vakit] = vakitDegisti ? { ...vakitAyari, seviyeler } : vakitAyari;
  }

  return degisti ? sonuc : matris;
}
