/**
 * Zemin adları sözlükten: vakit gökleri o dilin kendi vakit adlarını kullanır (İmsak →
 * `vakit.imsakVakti` = fecir adı, Kuşluk → `nafile.adlar.kusluk`, öteki vakitler `vakit.adlar`).
 */
import type { Sozluk } from '../../../../core/dil/sozluk/tr';
import type { DuvarZemini } from '../../../../core/icerik/gununAyetiYuku';

export const ZEMIN_SIRASI: readonly DuvarZemini[] = ['foto', 'imsak', 'kusluk', 'ikindi', 'aksam', 'yatsi', 'gece', 'kagit', 'palet'];

export function zeminEtiketi(zemin: DuvarZemini, s: Sozluk): string {
  switch (zemin) {
    case 'foto':
      return s.gununAyeti.duvar.foto;
    case 'imsak':
      return s.vakit.imsakVakti;
    case 'kusluk':
      return s.nafile.adlar.kusluk;
    case 'ikindi':
    case 'aksam':
    case 'yatsi':
      return s.vakit.adlar[zemin];
    default:
      return s.gununAyeti.ayar.zeminler[zemin];
  }
}
