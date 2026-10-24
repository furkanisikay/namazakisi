/**
 * Dil seçimi — Ayarlar'daki dil sayfası ve kurulum sihirbazı aynı bileşeni kullanır.
 *
 * Seçenekler: "Cihazın dili" (açık seçim yok; cihaz dili seçilebilirse o, değilse Türkçe) ve
 * seçilebilir diller. Dilin adı KENDİ dilinde yazılır (dili okuyamayan kullanıcı da bulur),
 * açıklama satırı arayüz dilindedir; gözden geçirilmemiş çeviri "Beta" taşır.
 *
 * Dil değişince elle yazılmış sesli okuma metinleri için BİR KEZ sorulur (sahip kararı):
 * "değiştirin" denirse yeni dilin hazır şablonu yazılır, denmezse dokunulmaz.
 */
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { diliKaydet, ozelAnonsSay, ozelAnonslariDegistir } from '../../store/dilSlice';
import { useAktifDil, useMetin } from '../../hooks/useMetin';
import { bicim, sayili } from '../../../core/dil/aktifDil';
import { cihazDilindenSec, DILLER, type DilKodu } from '../../../core/dil/diller';
import { SecenekListesi, type Secenek } from '../ortak/SecenekListesi';
import { BildirimModali } from '../common/BildirimModali';
import { kisaBildirimGoster } from '../common/KisaBildirim';
import { Logger } from '../../../core/utils/Logger';

type Secim = DilKodu | 'cihaz';

export interface DilSeciciProps {
  /** Açık seçim var mı? Bilinmiyorsa (yükleniyor) `null` → hiçbir kart seçili görünmez. */
  secimVar: boolean | null;
  /** Cihazın yerel ayar kimliği ("en_US"); okunamazsa null. */
  cihazYerelAyari: string | null;
  /** Seçim kaydedilince (sayfa açık seçim durumunu tazeler). */
  onDegisti?: (secim: Secim) => void;
  testID?: string;
}

export const DilSecici: React.FC<DilSeciciProps> = ({ secimVar, cihazYerelAyari, onDegisti, testID }) => {
  const dispatch = useAppDispatch();
  const m = useMetin().dilAyar;
  const kod = useAktifDil();
  const [ozelSayi, setOzelSayi] = useState(0);
  const [bekliyor, setBekliyor] = useState(false);

  const cihazDili = cihazDilindenSec(cihazYerelAyari);
  const secili: Secim | '' = secimVar === null ? '' : secimVar ? kod : 'cihaz';

  const secenekler = useMemo<Secenek<Secim>[]>(() => {
    const cihaz: Secenek<Secim> = {
      deger: 'cihaz',
      etiket: m.cihazDili,
      ikon: 'mobile-alt',
      aciklama: cihazDili
        ? bicim(m.cihazDiliKullaniliyor, { ad: DILLER.find((d) => d.kod === cihazDili)?.yerelAd ?? cihazDili })
        : m.cihazDiliDesteklenmiyor,
    };
    const diller = DILLER.filter((d) => d.secilebilir).map<Secenek<Secim>>((d) => ({
      deger: d.kod,
      etiket: d.yerelAd,
      // Arayüz dilindeki ad kendi adıyla aynıysa (Türkçe arayüzde "Türkçe") tekrarlanmaz.
      aciklama: d.beta
        ? bicim(m.betaAciklama, { ad: m.dilAdlari[d.kod] })
        : m.dilAdlari[d.kod] === d.yerelAd
          ? undefined
          : m.dilAdlari[d.kod],
    }));
    return [cihaz, ...diller];
  }, [m, cihazDili]);

  const sec = useCallback(
    async (yeni: Secim) => {
      if (bekliyor || yeni === secili) return;
      setBekliyor(true);
      try {
        const once = kod;
        const sonra = await dispatch(diliKaydet(yeni)).unwrap();
        onDegisti?.(yeni);
        if (sonra !== once) {
          const n = await dispatch(ozelAnonsSay()).unwrap();
          if (n > 0) setOzelSayi(n);
        }
      } catch (e) {
        Logger.warn('DilSecici', 'Dil kaydedilemedi', e);
        kisaBildirimGoster(m.kaydedilemedi);
      } finally {
        setBekliyor(false);
      }
    },
    [bekliyor, secili, kod, dispatch, onDegisti, m]
  );

  const degistir = useCallback(async () => {
    setOzelSayi(0);
    try {
      const n = await dispatch(ozelAnonslariDegistir()).unwrap();
      if (n > 0) kisaBildirimGoster(sayili(m.ozelAnons.degisti, n));
    } catch (e) {
      Logger.warn('DilSecici', 'Sesli okuma metinleri değiştirilemedi', e);
    }
  }, [dispatch, m]);

  const kapat = useCallback(() => setOzelSayi(0), []);

  return (
    <View testID={testID}>
      <SecenekListesi<Secim>
        secenekler={secenekler}
        secili={secili as Secim}
        onSec={sec}
        erisimEtiketi={m.grup}
      />
      <BildirimModali
        gorunur={ozelSayi > 0}
        tip="bilgi"
        baslik={m.ozelAnons.baslik}
        mesaj={sayili(m.ozelAnons.govde, ozelSayi)}
        birincilEtiket={m.ozelAnons.degistir}
        onBirincil={degistir}
        kapatEtiketi={m.ozelAnons.koru}
        onKapat={kapat}
      />
    </View>
  );
};
