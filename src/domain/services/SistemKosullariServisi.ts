/**
 * Sistem koşulları (güç/veri tasarrufu, ağ, şarj, arka plan kısıtı) — TEK okuma
 * noktası. Ham veri native köprüden (`modules/expo-sistem-durumu`), yorum saf
 * çekirdekten (`core/sistem/sistemDurumu.ts`).
 *
 * İki yol:
 *  - `sistemKosullariniOku()`: servisler (arka plan görevi dahil) için anlık okuma;
 *    köprüsüz build'de ağ alanları NetInfo'dan tamamlanır. ASLA fırlatmaz.
 *  - `sistemKosullarinaAbone()` + `sonSistemKosullari()`: ekranlar için bellek-içi
 *    depo (useSyncExternalStore). TEK native dinleyici, abone kalmayınca kalkar.
 *    Köprü yoksa depo HİÇ değişmez (testlerde act gürültüsü olmaz).
 *
 * Köprü TEMBEL yüklenir (`require`): statik import, bu servisi dolaylı yükleyen her
 * testi native modül aramaya zorlardı (AGENTS.md requireNativeModule tuzağı).
 */

import {
  BILINMEYEN_SISTEM_DURUMU,
  SistemDurumu,
  sistemDurumuEsitMi,
  sistemDurumunuCoz,
} from '../../core/sistem/sistemDurumu';

type Kopru = typeof import('../../../modules/expo-sistem-durumu/src');

const kopru = (): Kopru | null => {
  try {
    return require('../../../modules/expo-sistem-durumu/src') as Kopru;
  } catch {
    return null;
  }
};

/** Köprü ağ türünü veremediyse (eski build) NetInfo ile tamamlar. */
async function netInfoIleTamamla(d: SistemDurumu): Promise<SistemDurumu> {
  if (d.agTuru !== null) return d;
  try {
    const NetInfo = (require('@react-native-community/netinfo') as typeof import('@react-native-community/netinfo')).default;
    const n = await NetInfo.fetch();
    let agTuru: SistemDurumu['agTuru'] = null;
    if (n.isConnected === false) agTuru = 'yok';
    else if (n.type === 'wifi') agTuru = 'wifi';
    else if (n.type === 'ethernet') agTuru = 'ethernet';
    else if (n.type === 'cellular') agTuru = 'hucresel';
    else if (n.isConnected === true) agTuru = 'diger';
    const pahali = (n.details as { isConnectionExpensive?: unknown } | null)?.isConnectionExpensive;
    return {
      ...d,
      agTuru,
      olculuAg: d.olculuAg ?? (typeof pahali === 'boolean' ? pahali : null),
    };
  } catch {
    return d;
  }
}

/** Anlık sistem koşulları. Okunamayan alan `null`; asla fırlatmaz. */
export async function sistemKosullariniOku(): Promise<SistemDurumu> {
  const k = kopru();
  const ham = k ? await k.hamSistemDurumuAl() : null;
  return netInfoIleTamamla(sistemDurumunuCoz(ham));
}

/** Yalnız güç tasarrufu (konum gibi ağ alanı gerekmeyen tüketiciler için, NetInfo'suz). */
export async function gucTasarrufuAcikMi(): Promise<boolean | null> {
  const k = kopru();
  if (!k) return null;
  return sistemDurumunuCoz(await k.hamSistemDurumuAl()).gucTasarrufu;
}

// ---------------------------------------------------------------------------
// Ekran deposu
// ---------------------------------------------------------------------------

let son: SistemDurumu = BILINMEYEN_SISTEM_DURUMU;
const aboneler = new Set<() => void>();
let nativeAbonelik: { remove(): void } | null = null;

const guncelle = (yeni: SistemDurumu) => {
  if (sistemDurumuEsitMi(son, yeni)) return;
  son = yeni;
  aboneler.forEach((f) => {
    try {
      f();
    } catch {
      // Bir abonenin hatası diğerlerini susturmasın.
    }
  });
};

/** Depodaki son değer (useSyncExternalStore anlık görüntüsü; referans kararlı). */
export function sonSistemKosullari(): SistemDurumu {
  return son;
}

/**
 * Değişimlere abone olur. İlk abone native dinlemeyi ve ilk okumayı başlatır; son
 * abone kalkınca dinleme durur. Köprü yoksa hiçbir şey yapılmaz.
 */
export function sistemKosullarinaAbone(dinleyici: () => void): () => void {
  aboneler.add(dinleyici);
  const k = kopru();
  if (aboneler.size === 1 && k?.sistemModuluVarMi()) {
    nativeAbonelik = k.sistemDurumunuDinle((ham) => guncelle(sistemDurumunuCoz(ham)));
    void k.hamSistemDurumuAl().then((ham) => {
      if (ham && aboneler.size > 0) guncelle(sistemDurumunuCoz(ham));
    });
  }
  return () => {
    aboneler.delete(dinleyici);
    if (aboneler.size === 0) {
      nativeAbonelik?.remove();
      nativeAbonelik = null;
    }
  };
}

/** Testler için: depoyu sıfırlar. */
export function sistemKosullariDeposunuSifirla(): void {
  nativeAbonelik?.remove();
  nativeAbonelik = null;
  aboneler.clear();
  son = BILINMEYEN_SISTEM_DURUMU;
}
