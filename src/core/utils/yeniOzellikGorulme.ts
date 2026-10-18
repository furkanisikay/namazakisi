/**
 * "Neler Yeni" görülme kuralı (saf).
 *
 * Görülme ve kart kapatma kaydı SÜRÜMLÜ anahtarla tutulur: `<id>@<surum>`. Bir duyuru
 * güncellenip `surum`'u yükseltilince anahtar değişir ve duyuru kullanıcıya yeniden
 * "yeni" görünür — aynı özelliği ikinci bir öğe olarak duyurmaya gerek kalmaz.
 *
 * Eski kayıtlar yalın `id` taşır. Yalın kimlik, yalnız bu biçime geçilmeden önceki
 * içerik için (`surum <= ESKI_GORULME_BICIMI_SON_SURUMU`) geçerlidir. Birden çok eski
 * duyurunun birleştirildiği öğede kullanıcı ancak hepsini (`id` + `oncekiIdler`)
 * görmüşse "görmüş" sayılır; birini kaçırdıysa birleşik öğe yeniden yeni görünür.
 */
import type { YeniOzellik } from '../constants/YeniOzellikler';
import { versiyonKarsilastir } from './versiyonKarsilastir';

/** Yalın kimlik biçiminin geçerli olduğu son katalog sürümü. DEĞİŞTİRME. */
export const ESKI_GORULME_BICIMI_SON_SURUMU = '0.41.0';

type GorulmeOzelligi = Pick<YeniOzellik, 'id' | 'surum' | 'oncekiIdler'>;

/** Duyurunun bugünkü içeriğine ait görülme anahtarı. */
export function gorulmeAnahtari(ozellik: Pick<YeniOzellik, 'id' | 'surum'>): string {
  return `${ozellik.id}@${ozellik.surum}`;
}

/** Duyuru, verilen kayıt listesine (görülenler ya da kapatılan kartlar) göre işlenmiş mi? */
export function ozellikKayittaMi(ozellik: GorulmeOzelligi, kayit: readonly string[]): boolean {
  if (kayit.includes(gorulmeAnahtari(ozellik))) return true;
  if (versiyonKarsilastir(ozellik.surum, ESKI_GORULME_BICIMI_SON_SURUMU) > 0) return false;
  return [ozellik.id, ...(ozellik.oncekiIdler ?? [])].every((id) => kayit.includes(id));
}
