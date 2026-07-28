/**
 * Ayarlar ekranındaki "kurulum sağlığı" kartı için saf sağlık kontrolleri.
 * Store/React/AsyncStorage/native modül import ETMEZ; girdiler parametre
 * olarak alınır (`AGENTS.md`: core saf kalmalı).
 */

const GUN_MS = 24 * 60 * 60 * 1000;
const YEDI_GUN_MS = 7 * GUN_MS;

export type SorunSeviyesi = 'kritik' | 'uyari' | 'bilgi';

export interface Sorun {
  id: 'bildirimIzni' | 'konumAlinamadi' | 'hatirlatmaYok' | 'konumBayat';
  seviye: SorunSeviyesi;
  baslik: string;
  aciklama: string;
  eylemEtiketi?: string;
  eylem?: { tip: 'sayfa'; sayfa: string } | { tip: 'sistemAyarlari' };
}

export interface SaglikGirdisi {
  izinDurumu: 'verildi' | 'reddedildi' | 'belirsiz';
  konumModu: 'oto' | 'manuel';
  sonGpsGuncellemesi: string | null; // ISO
  akilliTakipAktif: boolean;
  muhafizAktif: boolean;
  acikVakitBildirimSayisi: number;
  /** Test edilebilirlik için ENJEKTE edilir — `new Date()` çağırma. */
  simdi: Date;
}

const SEVIYE_SIRASI: Record<SorunSeviyesi, number> = {
  kritik: 0,
  uyari: 1,
  bilgi: 2,
};

export function kurulumSagligi(g: SaglikGirdisi): Sorun[] {
  const sorunlar: Sorun[] = [];

  // NÖBETÇİ: yalnız 'reddedildi' tetikler. 'belirsiz' henüz sorulmamış demektir
  // — yanlış alarm vermemek uyarıyı hiç göstermemekten daha kötüdür.
  if (g.izinDurumu === 'reddedildi') {
    sorunlar.push({
      id: 'bildirimIzni',
      seviye: 'kritik',
      baslik: 'Bildirim izni kapalı',
      aciklama: 'Uygulama bildirimleri size ulaşamıyor.',
      eylemEtiketi: 'İzni açın',
      eylem: { tip: 'sistemAyarlari' },
    });
  }

  if (g.konumModu === 'oto' && !g.sonGpsGuncellemesi) {
    sorunlar.push({
      id: 'konumAlinamadi',
      seviye: 'kritik',
      baslik: 'Konumunuz alınamadı',
      aciklama: 'Vakitler varsayılan konuma göre hesaplanıyor.',
      eylemEtiketi: 'Konumu ayarlayın',
      eylem: { tip: 'sayfa', sayfa: 'KonumAyarlari' },
    });
  }

  if (!g.muhafizAktif && g.acikVakitBildirimSayisi === 0) {
    sorunlar.push({
      id: 'hatirlatmaYok',
      seviye: 'uyari',
      baslik: 'Vakit hatırlatmaları kapalı',
      aciklama: 'Ne muhafız ne de vakit bildirimleri açık.',
      eylemEtiketi: 'Hatırlatmaları açın',
      eylem: { tip: 'sayfa', sayfa: 'MuhafizAyarlari' },
    });
  }

  // `konumBayat`, `konumAlinamadi` ile aynı anda dönmez: `konumAlinamadi`
  // zaten `sonGpsGuncellemesi` yokluğunu kapsar; `konumBayat` damganın
  // VAR olmasını ve yalnız 7+ gün eski olmasını ister.
  if (g.akilliTakipAktif && g.sonGpsGuncellemesi) {
    const damgaMs = new Date(g.sonGpsGuncellemesi).getTime();
    const gecenMs = g.simdi.getTime() - damgaMs;
    if (gecenMs >= YEDI_GUN_MS) {
      sorunlar.push({
        id: 'konumBayat',
        seviye: 'bilgi',
        baslik: 'Konumunuz 7 günden eski',
        aciklama: 'Şehir değiştiyseniz vakitler kaymış olabilir.',
        eylemEtiketi: 'Konumu yenileyin',
        eylem: { tip: 'sayfa', sayfa: 'KonumAyarlari' },
      });
    }
  }

  return sorunlar.sort((a, b) => SEVIYE_SIRASI[a.seviye] - SEVIYE_SIRASI[b.seviye]);
}
