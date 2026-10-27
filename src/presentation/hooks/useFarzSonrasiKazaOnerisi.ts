/**
 * "Her farzla bir kaza" önerisi (issue #294) — ana ekran orkestrasyonu.
 *
 * Karar SAF çekirdektedir (`core/kaza/farzSonrasiKazaOnerisi.ts`); bu hook yalnız
 * girdileri toplar (ayar + sorulma hafızası diskten, kerahat tek kaynaktan
 * `mekruhVakitKontrolEt`, defter `kazaVerileriniYukle` ile TAZE) ve yanıtları
 * uygular. Yalnız uygulama içi "kıldım"da çalışır: bildirim/widget/saat
 * "Kıldım"ı arka planda işlenir, soru açacak bir arayüz yoktur.
 */
import { useCallback, useRef, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  kazaOneriAyarlariniGuncelle,
  kazaTamamla,
  kazaVerileriniYukle,
} from '../store/kazaSlice';
import { LocalKazaOneriServisi } from '../../data/local/LocalKazaOneriServisi';
import {
  KAZA_ADLARI_KUCUK,
  kazaOnerisiKarari,
  kazaOnerisiOnKosulu,
  simdiDegilKaydet,
  soruAcildiKaydet,
  type KazaOneriOnKosulGirdisi,
} from '../../core/kaza/farzSonrasiKazaOnerisi';
import type { KazaNamazAdi } from '../../core/types/KazaTipleri';
import { mekruhVakitKontrolEt } from '../../domain/services/KazaHesaplayiciServisi';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { Logger } from '../../core/utils/Logger';
import { bicim, metin } from '../../core/dil/aktifDil';
import { kazaKabulMetni } from '../../core/samimiyet/kabulDuasi';

export interface KazaOnerisi {
  /** "Kıldım" işaretlenen farz (NamazAdi değeri). */
  kilinanFarz: string;
  /** Önerilen kaza. */
  kazaNamazi: KazaNamazAdi;
  /** Sorunun ait olduğu namaz günü. */
  aktifGun: string;
}

export interface KazaOnerisiDegerlendirmeGirdisi {
  kilinanNamaz: string;
  tamamlandi: boolean;
  gosterilenGun: string;
  aktifGun: string;
  suankiVakitNamazi: string | null;
  koordinat: { lat: number; lng: number } | null | undefined;
}

/** `{0,0}` "yapılandırılmadı" nöbetçisidir (AGENTS.md) → kerahat bilinemez. */
const kerahatDurumu = (koordinat: KazaOnerisiDegerlendirmeGirdisi['koordinat']): boolean | null => {
  if (!koordinat || (!koordinat.lat && !koordinat.lng)) return null;
  return mekruhVakitKontrolEt(koordinat.lat, koordinat.lng, 'kaza').mekruhMu;
};

export const useFarzSonrasiKazaOnerisi = () => {
  const dispatch = useAppDispatch();
  const [oneri, setOneri] = useState<KazaOnerisi | null>(null);
  const [isleniyor, setIsleniyor] = useState(false);
  // Her değerlendirme (ve geri alma) sayacı artırır: kıldım → hemen geri al
  // yapılırsa geç dönen disk okuması bayat soruyu AÇMAZ.
  const istekRef = useRef(0);

  const degerlendir = useCallback(
    async (g: KazaOnerisiDegerlendirmeGirdisi) => {
      const istek = ++istekRef.current;
      if (!g.tamamlandi) return;
      try {
        const [ayarlar, kayit] = await Promise.all([
          LocalKazaOneriServisi.ayarlariGetir(),
          LocalKazaOneriServisi.kaydiGetir(g.aktifGun),
        ]);
        const onGirdi: KazaOneriOnKosulGirdisi = {
          ayarlar,
          tamamlandi: g.tamamlandi,
          kilinanNamaz: g.kilinanNamaz,
          gosterilenGun: g.gosterilenGun,
          aktifGun: g.aktifGun,
          suankiVakitNamazi: g.suankiVakitNamazi,
          kerahatMi: kerahatDurumu(g.koordinat),
          kayit,
        };
        // Ucuz kapılar önce: defter diske ancak gerekirse okunur.
        if (kazaOnerisiOnKosulu(onGirdi) || istek !== istekRef.current) return;

        // Defter TAZE okunur: bildirimdeki "Kazaya ekle" store'suz diske yazmış olabilir.
        const yuk = await dispatch(kazaVerileriniYukle());
        const namazlar = kazaVerileriniYukle.fulfilled.match(yuk) ? yuk.payload.kazaDurumu.namazlar : null;
        const karar = kazaOnerisiKarari({ ...onGirdi, namazlar });
        if (!karar.sor || istek !== istekRef.current) return;

        // Soru AÇILIRKEN hafızaya yazılır: aynı vakit o gün bir daha sorulmaz.
        await LocalKazaOneriServisi.kaydiYaz(soruAcildiKaydet(kayit, g.aktifGun, g.kilinanNamaz));
        if (istek !== istekRef.current) return;
        setOneri({ kilinanFarz: g.kilinanNamaz, kazaNamazi: karar.kazaNamazi, aktifGun: g.aktifGun });
      } catch (e) {
        Logger.warn('KazaOnerisi', 'Degerlendirme yapilamadi', e);
      }
    },
    [dispatch]
  );

  const kildim = useCallback(async () => {
    if (!oneri || isleniyor) return;
    setIsleniyor(true);
    const kucukAd = KAZA_ADLARI_KUCUK[oneri.kazaNamazi];
    try {
      // Bayat store ile yazmak araya giren disk yazımını (bildirimden borç ekleme) silerdi.
      const yuk = await dispatch(kazaVerileriniYukle());
      if (!kazaVerileriniYukle.fulfilled.match(yuk)) throw new Error('Kaza defteri okunamadi');
      const borc = yuk.payload.kazaDurumu.namazlar.find((n) => n.namazAdi === oneri.kazaNamazi)?.kalanBorc ?? 0;
      if (borc <= 0) {
        kisaBildirimGoster(bicim(metin().kaza.oneri.borcYok, { kaza: kucukAd }));
        return;
      }
      const sonuc = await dispatch(kazaTamamla({ namazAdi: oneri.kazaNamazi, sayi: 1 }));
      if (!kazaTamamla.fulfilled.match(sonuc)) throw new Error('Kaza kaydedilemedi');
      kisaBildirimGoster(kazaKabulMetni(kucukAd));
    } catch (e) {
      Logger.warn('KazaOnerisi', 'Kaza dusulemedi', e);
      kisaBildirimGoster(metin().kaza.oneri.kaydedilemedi, true);
    } finally {
      setOneri(null);
      setIsleniyor(false);
    }
  }, [dispatch, oneri, isleniyor]);

  const simdiDegil = useCallback(async () => {
    if (!oneri) return;
    const { aktifGun } = oneri;
    setOneri(null);
    const kayit = await LocalKazaOneriServisi.kaydiGetir(aktifGun);
    await LocalKazaOneriServisi.kaydiYaz(simdiDegilKaydet(kayit, aktifGun));
  }, [oneri]);

  const birDahaSorma = useCallback(async () => {
    if (!oneri) return;
    setOneri(null);
    const sonuc = await dispatch(kazaOneriAyarlariniGuncelle({ farzSonrasiOner: false }));
    if (kazaOneriAyarlariniGuncelle.fulfilled.match(sonuc)) {
      kisaBildirimGoster(metin().kaza.oneri.kapatildi, true);
    } else {
      kisaBildirimGoster(metin().kaza.oneri.ayarKaydedilemedi);
    }
  }, [dispatch, oneri]);

  return { oneri, isleniyor, degerlendir, kildim, simdiDegil, birDahaSorma };
};
