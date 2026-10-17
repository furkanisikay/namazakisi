/**
 * Kaza Defteri sekmesinin iç yığını (Kaza Defteri 2.0).
 *
 * Sekme kökü (`KazaDefteriAna`) kendi üst başlığını taşır (`headerShown: false`,
 * sekme kökü istisnası); alt ekranların başlığı YALNIZ navigasyon header'ında
 * durur (`KAZA_EKRAN_BASLIKLARI`), gövdede tekrar edilmez.
 */
import type { HesaplamaSihirbazGirdisi } from '../core/types/KazaTipleri';

export type KazaStackParamList = {
  KazaDefteriAna: undefined;
  KazaGecmisi: undefined;
  KazaOtomatikAyar: undefined;
  KazaTemizlik: undefined;
  /** Sihirbazın son adımı: girdi serileştirilebilir; taban ekranda hesaplanır. */
  KazaYenidenHesapla: { girdi: HesaplamaSihirbazGirdisi };
};

export const KAZA_EKRAN_BASLIKLARI: Record<Exclude<keyof KazaStackParamList, 'KazaDefteriAna'>, string> = {
  KazaGecmisi: 'Hareket Geçmişi',
  KazaOtomatikAyar: 'Otomatik Kaza Ekleme',
  KazaTemizlik: 'Kayıtları Temizleyin',
  KazaYenidenHesapla: 'Yeniden Hesapla',
};
