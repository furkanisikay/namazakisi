/**
 * Aylik izgaradaki ardisik "tam" gunler arasindaki zincir baglarini hesaplar.
 *
 * SAF: hicbir React/Redux/native import yok.
 */
import { IzgaraGunu, GunDurumu } from './aylikIzgara';
import { gunTamMi } from './gunTamMi';
import { SUTUN_SAYISI } from './gokGeometrisi';

export interface ZincirBagi {
  indeks: number; // sol gunun izgara indeksi (bag i <-> i+1 arasindadir)
  ikisiTam: boolean; // iki uc da 5/5 -> KALIN ve parlak cizilir
  satirSarmasi: boolean; // indeks % 7 === 6 -> satirlar arasi yay
}

const VAKIT_SAYISI = 5;

/** Bir gun zincirin korunmasina (bagin kurulmasina) katkida bulunur mu?
 * Dondurulmus gunler mazeretlidir — zinciri KOPARMAZ. Kilinmis gunler ise
 * Task 1'deki SAF esik kuraliyla (gunTamMi) degerlendirilir; kural burada
 * KOPYALANMAZ. */
function zincirKorur(gun: IzgaraGunu, tamGunEsigi: number): boolean {
  if (gun.durum.tip === 'dondurulmus') {
    return true;
  }
  if (gun.durum.tip === 'kilindi') {
    const kilinanSayisi = gun.durum.vakitler.filter(Boolean).length;
    return gunTamMi(kilinanSayisi, tamGunEsigi);
  }
  return false; // 'gelecek'
}

/**
 * Bir gun harfiyen 5/5 mi (esikten BAGIMSIZ) — burada "ikisiTam" vurgusu
 * icin kullanilir; zincirin kurulup kurulmayacagina karismaz.
 *
 * PAYLASILAN: `screens/Seri` sunum katmani (`AnimasyonluYildiz.tsx`,
 * `GokPaneli.tsx`) AYNI 5/5 kuralini ihtiyac duyuyordu ve ayri ayri kopyalanmisti
 * (inceleme bulgusu) — tek kaynak burasi, EXPORT edilir. `GunDurumu` alir
 * (tum `IzgaraGunu` DEGIL) — cagiran taraflarin cogu zaten `durum`'u elinde
 * tutuyor (`gun.durum`), boylece hem `zincirBaglari` (`sol.durum`/`sag.durum`)
 * hem sunum katmani ayni imzayi kullanabiliyor.
 */
export function besTeBesMi(durum: GunDurumu): boolean {
  return durum.tip === 'kilindi' && durum.vakitler.length === VAKIT_SAYISI && durum.vakitler.every(Boolean);
}

/**
 * Ardisik iki izgara hucresi arasinda zincir bagi kurulup kurulmadigini
 * hesaplar. Ay siniri baglanmayi ENGELLEMEZ (30 Haziran -> 1 Temmuz bagi
 * kurulur); satir sonu da engellemez, yalnizca `satirSarmasi` ile isaretlenir.
 */
export function zincirBaglari(izgara: IzgaraGunu[], tamGunEsigi: number): ZincirBagi[] {
  const baglar: ZincirBagi[] = [];

  for (let i = 0; i < izgara.length - 1; i++) {
    const sol = izgara[i];
    const sag = izgara[i + 1];

    if (zincirKorur(sol, tamGunEsigi) && zincirKorur(sag, tamGunEsigi)) {
      baglar.push({
        indeks: i,
        ikisiTam: besTeBesMi(sol.durum) && besTeBesMi(sag.durum),
        satirSarmasi: i % SUTUN_SAYISI === SUTUN_SAYISI - 1,
      });
    }
  }

  return baglar;
}
