/**
 * Kaza Defteri sekmesinin iç yığını (Kaza Defteri 2.0).
 *
 * Sekme kökü (`KazaDefteriAna`) kendi üst başlığını taşır (`headerShown: false`,
 * sekme kökü istisnası); alt ekranların başlığı YALNIZ navigasyon header'ında
 * durur (`KAZA_EKRAN_BASLIKLARI`), gövdede tekrar edilmez.
 */
import type { HesaplamaSihirbazGirdisi } from '../core/types/KazaTipleri';
import { canli } from '../core/dil/aktifDil';

export type KazaStackParamList = {
  KazaDefteriAna: undefined;
  KazaGecmisi: undefined;
  KazaOtomatikAyar: undefined;
  KazaTemizlik: undefined;
  /** Sihirbazın son adımı: girdi serileştirilebilir; taban ekranda hesaplanır. */
  KazaYenidenHesapla: { girdi: HesaplamaSihirbazGirdisi };
};

/** Etkin dilde (okunduğu an sözlükten çözülür). */
export const KAZA_EKRAN_BASLIKLARI: Readonly<Record<Exclude<keyof KazaStackParamList, 'KazaDefteriAna'>, string>> = canli(
  (s) => ({
    KazaGecmisi: s.kaza.ekranlar.gecmis,
    KazaOtomatikAyar: s.kaza.ekranlar.ayarlar,
    KazaTemizlik: s.kaza.ekranlar.temizlik,
    KazaYenidenHesapla: s.kaza.ekranlar.yenidenHesapla,
  })
);
