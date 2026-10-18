/**
 * Ayarlar ekranındaki "kurulum sağlığı" kartı için saf sağlık kontrolleri.
 * Store/React/AsyncStorage/native modül import ETMEZ; girdiler parametre
 * olarak alınır (`AGENTS.md`: core saf kalmalı).
 */

const GUN_MS = 24 * 60 * 60 * 1000;
const YEDI_GUN_MS = 7 * GUN_MS;

export type SorunSeviyesi = 'kritik' | 'uyari' | 'bilgi';

export interface Sorun {
  id: 'bildirimIzni' | 'konumAlinamadi' | 'hatirlatmaYok' | 'konumBayat' | 'tamAlarm' | 'pilKisiti';
  seviye: SorunSeviyesi;
  baslik: string;
  aciklama: string;
  eylemEtiketi?: string;
  eylem?:
    | { tip: 'sayfa'; sayfa: string }
    | { tip: 'sistemAyarlari' }
    /** Rehber gösterilir, sonra Samsung "Asla uyumayan" / pil optimizasyonu ekranı açılır. */
    | { tip: 'pilAyarlari' }
    | { tip: 'alarmIzni' };
  /** Seviye ikonunun yerine (FontAwesome5). */
  ikon?: string;
}

/**
 * Pil kısıtı: `muaf` null = okunamadı (iOS, eski build, hata) → uyarı YOK
 * (yanlış alarm, hiç uyarmamaktan kötüdür). `samsung` metni ve eylemi seçer.
 */
export interface PilDurumu {
  muaf: boolean | null;
  /** `null` = bilinmiyor (Android ama köprü yok/hata) → genel metin. */
  samsung: boolean | null;
}

export interface SaglikGirdisi {
  izinDurumu: 'verildi' | 'reddedildi' | 'belirsiz';
  konumModu: 'oto' | 'manuel';
  sonGpsGuncellemesi: string | null; // ISO
  akilliTakipAktif: boolean;
  muhafizAktif: boolean;
  acikVakitBildirimSayisi: number;
  /** Verilmezse kontrol yapılmaz (geriye uyumlu). */
  pil?: PilDurumu;
  /** Android 12+ tam alarm izni. Yalnız 'reddedildi' uyarır. */
  tamAlarm?: 'verildi' | 'reddedildi' | 'belirsiz';
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

  // Pil ve tam alarm yalnız bir hatırlatma AÇIKKEN anlamlıdır: hatırlatması olmayan
  // kullanıcıya "hatırlatmalarınız gecikebilir" demek gürültüdür.
  const hatirlatmaVar = g.muhafizAktif || g.acikVakitBildirimSayisi > 0;

  if (hatirlatmaVar && g.tamAlarm === 'reddedildi') {
    sorunlar.push({
      id: 'tamAlarm',
      seviye: 'kritik',
      baslik: 'Tam zamanlı hatırlatma izni kapalı',
      aciklama: 'Hatırlatmalar birkaç dakika geç gelebilir; vaktin son dakikalarında bu önemli.',
      eylemEtiketi: 'İzni açın',
      eylem: { tip: 'alarmIzni' },
      ikon: 'clock',
    });
  }

  if (!g.muhafizAktif && g.acikVakitBildirimSayisi === 0) {
    sorunlar.push({
      id: 'hatirlatmaYok',
      seviye: 'uyari',
      baslik: 'Vakit hatırlatmaları kapalı',
      aciklama: 'Vakit girince de çıkmadan da hatırlatma yok.',
      eylemEtiketi: 'Hatırlatmaları açın',
      eylem: { tip: 'sayfa', sayfa: 'Hatirlatmalar' },
    });
  }

  if (hatirlatmaVar && g.pil?.muaf === false) {
    sorunlar.push(
      g.pil.samsung
        ? {
            id: 'pilKisiti',
            seviye: 'uyari',
            baslik: 'Hatırlatmalarınız uyutulabilir',
            aciklama:
              'Samsung telefonlar birkaç gün açılmayan uygulamaları uyutur. O zaman muhafız ve vakit hatırlatmaları gecikir ya da hiç gelmez.',
            eylemEtiketi: 'Uyutulmasın',
            eylem: { tip: 'pilAyarlari' },
            ikon: 'moon',
          }
        : {
            id: 'pilKisiti',
            seviye: 'uyari',
            baslik: 'Pil tasarrufu hatırlatmaları geciktirebilir',
            aciklama: 'Telefonunuz uygulamayı arka planda kısıtlıyor. Muhafız ve vakit hatırlatmaları gecikebilir.',
            eylemEtiketi: 'Pil ayarlarını açın',
            eylem: { tip: 'pilAyarlari' },
            ikon: 'battery-quarter',
          }
    );
  }

  // `konumBayat`, `konumAlinamadi` ile aynı anda dönmez: `konumAlinamadi`
  // zaten `sonGpsGuncellemesi` yokluğunu kapsar; `konumBayat` damganın
  // VAR olmasını ve yalnız 7+ gün eski olmasını ister.
  // Pil kısıtı zaten raporlandıysa `konumBayat` aynı sebebin ikinci yüzüdür → tekrarlanmaz.
  const pilRaporlandi = sorunlar.some((x) => x.id === 'pilKisiti');
  if (g.akilliTakipAktif && g.sonGpsGuncellemesi && !pilRaporlandi) {
    const damgaMs = new Date(g.sonGpsGuncellemesi).getTime();
    const gecenMs = g.simdi.getTime() - damgaMs;
    if (gecenMs >= YEDI_GUN_MS) {
      sorunlar.push({
        id: 'konumBayat',
        seviye: 'bilgi',
        baslik: 'Arka plan güncellemesi durmuş görünüyor',
        aciklama: 'Konumunuz 7 gündür yenilenmedi; pil ayarları uygulamayı kısıtlıyor olabilir.',
        // "Konumu yenileyin" semptomu GİZLERDİ: elle sabitleme damgayı tazeler,
        // uyarı kaybolur ama arka plan görevi hâlâ ölüdür (AGENTS.md). Asıl
        // sebep pil kısıtı → oraya götür.
        eylemEtiketi: 'Pil ayarlarını açın',
        eylem: { tip: 'pilAyarlari' },
      });
    }
  }

  return sorunlar.sort((a, b) => SEVIYE_SIRASI[a.seviye] - SEVIYE_SIRASI[b.seviye]);
}
