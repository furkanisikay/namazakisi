/**
 * Ayarlar ekranındaki her satırın özetini ve "kurulum sağlığı" durumunu
 * üretir. Sync veriler Redux'tan, async olanlar (bildirim izni, son dışa
 * aktarma damgası) `useFocusEffect` ile — sayfaya her dönüşte tazelenir.
 *
 * Saf hesaplama `src/core/ayarlar/` altındaki fonksiyonlara devredilir; bu
 * hook yalnız girdileri (store, tema, async okumalar) toplayıp onlara geçirir
 * — `kurulumSagligi`/`yedeklemeOzeti`'ye `simdi: new Date()` enjekte eden TEK
 * yer burasıdır.
 *
 * (Task 4 brief — Ayarlar ekranı yeniden kurulumu)
 */
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { useTema } from '../../core/theme';
import { Depolama } from '../../data/local/Depolama';
import { DEPOLAMA_ANAHTARLARI, UYGULAMA } from '../../core/constants/UygulamaSabitleri';
import { izinDurumunuOku, type BildirimIzinDurumu } from '../../domain/services/BildirimIzinOkuyucu';
import {
  konumOzeti,
  takvimOzeti,
  muhafizOzeti,
  bildirimOzeti,
  seriOzeti,
  ramazanOzeti,
  gorunumOzeti,
  yedeklemeOzeti,
  hakkindaOzeti,
} from '../../core/ayarlar/ozetler';
import { kurulumSagligi, type Sorun } from '../../core/ayarlar/kurulumSagligi';
import { konumMetniHesapla } from '../../core/ayarlar/konumMetni';

export interface AyarOzetleri {
  konum: string;
  takvim: string;
  muhafiz: string;
  bildirim: string;
  seri: string;
  ramazan: string;
  gorunum: string;
  yedekleme: string;
  hakkinda: string;
}

interface AsyncOzetVerisi {
  izinDurumu: BildirimIzinDurumu;
  sonDisaAktarmaISO: string | null;
}

const ASYNC_VARSAYILAN: AsyncOzetVerisi = {
  izinDurumu: 'belirsiz',
  sonDisaAktarmaISO: null,
};

export function useAyarOzetleri(): {
  ozetler: AyarOzetleri;
  sorunlar: Sorun[];
  saglikOzetSatiri: string;
} {
  const { tema, palet } = useTema();

  const konum = useAppSelector((s) => s.konum);
  const muhafizAktif = useAppSelector((s) => s.muhafiz.aktif);
  const muhafizYogunluk = useAppSelector((s) => s.muhafiz.yogunluk);
  const vakitBildirimAyarlari = useAppSelector((s) => s.vakitBildirim.ayarlar);
  const cumaAktif = useAppSelector((s) => s.cumaHatirlatma.ayarlar.aktif);
  const seriAyarlari = useAppSelector((s) => s.seri.ayarlar);
  const iftarAktif = useAppSelector((s) => s.iftarSayac.ayarlar.aktif);
  const sahurAktif = useAppSelector((s) => s.sahurSayac.ayarlar.aktif);
  const takvimAktif = useAppSelector((s) => s.takvim.ayarlar.aktif);
  const guncellemeMevcut = useAppSelector((s) => s.guncelleme.guncellemeMevcut);

  const [asyncVeri, setAsyncVeri] = useState<AsyncOzetVerisi>(ASYNC_VARSAYILAN);

  useFocusEffect(
    useCallback(() => {
      // `iptal` bayrağı: kullanıcı sayfadan async okuma (izin/damga) devam
      // ederken çıkarsa (ör. hızlı geri-git) promise ekran unmount olduktan
      // SONRA çözülür. Bayraksız `setAsyncVeri` çağrısı bu durumda unmount
      // olmuş bir bileşende state güncellemeye çalışır — React 18'de artık
      // hata/uyarı fırlatmıyor ama gereksiz bir render'a ve (teorik olarak)
      // yeniden odaklanmış farklı bir focus döngüsünün state'ini bayat bir
      // sonuçla ezmeye yol açabilir. `iptal`, cleanup'ta true'lanarak bu geç
      // gelen sonucu sessizce yok sayar.
      let iptal = false;

      (async () => {
        const [izinDurumu, sonDisaAktarmaISO] = await Promise.all([
          izinDurumunuOku(),
          Depolama.oku<string>(DEPOLAMA_ANAHTARLARI.SON_DISA_AKTARMA),
        ]);
        if (!iptal) {
          setAsyncVeri({ izinDurumu, sonDisaAktarmaISO });
        }
      })();

      return () => {
        iptal = true;
      };
    }, [])
  );

  const konumGirdisi = {
    konumModu: konum.konumModu,
    gpsAdres: konum.gpsAdres,
    seciliIlceAdi: konum.seciliIlceAdi,
    seciliIlAdi: konum.seciliIlAdi,
  };

  const acikVakitBildirimSayisi = Object.values(vakitBildirimAyarlari).filter(Boolean).length;
  const simdi = new Date();

  const sorunlar = kurulumSagligi({
    izinDurumu: asyncVeri.izinDurumu,
    konumModu: konum.konumModu,
    sonGpsGuncellemesi: konum.sonGpsGuncellemesi,
    akilliTakipAktif: konum.akilliTakipAktif,
    muhafizAktif,
    acikVakitBildirimSayisi,
    simdi,
  });

  const ozetler: AyarOzetleri = {
    konum: konumOzeti(konumGirdisi),
    takvim: takvimOzeti(takvimAktif),
    muhafiz: muhafizOzeti({ aktif: muhafizAktif, yogunluk: muhafizYogunluk }),
    bildirim: bildirimOzeti(acikVakitBildirimSayisi, cumaAktif),
    seri: seriOzeti(seriAyarlari),
    ramazan: ramazanOzeti(iftarAktif, sahurAktif),
    gorunum: gorunumOzeti(tema.mod, palet.ad),
    yedekleme: yedeklemeOzeti(asyncVeri.sonDisaAktarmaISO, simdi),
    hakkinda: hakkindaOzeti(UYGULAMA.VERSIYON, guncellemeMevcut),
  };

  const saglikOzetSatiri =
    `Kurulumunuz eksiksiz · ${konumMetniHesapla(konumGirdisi)} · muhafız ${muhafizAktif ? 'açık' : 'kapalı'}`;

  return { ozetler, sorunlar, saglikOzetSatiri };
}
