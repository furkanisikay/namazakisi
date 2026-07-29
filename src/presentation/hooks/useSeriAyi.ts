/**
 * `SeriSekmesi` için veri hook'u — ADAPTÖR + orkestrasyon.
 *
 * `localTarihAraligindakiNamazlariGetir` `ApiYanit<GunlukNamazlar[]>` döner;
 * `GunlukNamazlar.namazlar` `NAMAZ_ISIMLERI` sırasındadır ve bu sıra ışın
 * sırasıyla birebir aynıdır. Bu hook onu saf çekirdeğin beklediği
 * `Record<tarih, boolean[5]>`'e çevirir — adaptör SUNUMDA yaşar, core'da değil
 * (core `ApiYanit`/`GunlukNamazlar` tiplerini tanımaz).
 *
 * `bugun` TAKVİM GÜNÜ DEĞİLDİR: `namazGunuHesapla(new Date(), gunBitisSaati)`
 * ile üretilir (gece yarısı-05:00 arası düne sayılır) — yoksa gece 02:00'de
 * açan kullanıcıya bugünü "gelecek" gösteririz.
 *
 * HATA YOLU ZORUNLU: `basarili:false` geldiğinde `hata` doldurulur, ekran
 * sonsuz spinner'da KALMAZ (AGENTS.md'nin yaşanmış "sessiz sonsuz spinner"
 * dersi — `LocalKazaServisi` ikizi). `hata` DAİMA sabit, kibar bir metindir
 * — `LocalNamazServisi`'nin ham `error.message`'ı (teknik, kullanıcıya
 * anlamsız) doğrudan UI'a sızdırılmaz; ham mesaj yalnız `Logger`'a gider
 * (inceleme bulgusu — ilk sürüm ham mesajı UI'da gösteriyordu).
 *
 * HİDRASYON NÖBETÇİSİ: `seri` slice'ını yalnız `AnaSayfa` yükler
 * (`AnaSayfa.tsx:299`). Soğuk açılışta (doğrudan İstatistikler -> Seri
 * sekmesine girilirse) hidrasyon garanti değildir; hidrate edilmemiş
 * state'te `tamGunEsigi` varsayılana düşer ve harita yanlış eşikle çizilir.
 * Bu yüzden mount'ta `seriVerileriniYukle` dispatch edilir (idempotent —
 * yalnız local okuma, izin istemez).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { seriVerileriniYukle } from '../store/seriSlice';
import { localTarihAraligindakiNamazlariGetir } from '../../data/local/LocalNamazServisi';
import { Logger } from '../../core/utils/Logger';
import { ISOTarihiDateNesnesiNeCevir, ayAdiniAl } from '../../core/utils/TarihYardimcisi';
import { namazGunuHesapla } from '../../domain/services/SeriHesaplayiciServisi';
import { aylikIzgaraOlustur, izgaraAraligi, IzgaraGunu } from '../../core/seri/aylikIzgara';
import { zincirBaglari, ZincirBagi } from '../../core/seri/zincir';
import { ozelGunKumesi } from '../../core/seri/ozelGunKumesi';

export interface SeriAyiSonucu {
  /** İlk yükleme sürüyor mu (henüz ne veri ne hata var). */
  yukleniyor: boolean;
  /** Namaz kayıtları okunamadıysa kibar hata metni; başarılıysa `null`. */
  hata: string | null;
  /** `aylikIzgaraOlustur` çıktısı — görüntülenen ay için (bugünü içeren ay). */
  izgara: IzgaraGunu[];
  /** `zincirBaglari` çıktısı. */
  zincirler: ZincirBagi[];
  /** "Temmuz 2026" biçiminde görüntülenen ay adı. */
  ayAdi: string;
  /** `namazGunuHesapla`'dan gelen ISO tarih — takvim günü DEĞİLDİR. */
  bugun: string;
  /** `seriSlice.ayarlar.tamGunEsigi`. */
  tamGunEsigi: number;
  /** `seriSlice.seriDurumu.mevcutSeri`. */
  mevcutSeri: number;
  /** Hata durumunda kullanıcının "Yeniden deneyin" ile tetikleyeceği fonksiyon. */
  yenidenDene: () => void;
}

interface OkumaDurumu {
  yukleniyor: boolean;
  hata: string | null;
  kayitlar: Record<string, boolean[]>;
}

const BASLANGIC_OKUMA_DURUMU: OkumaDurumu = {
  yukleniyor: true,
  hata: null,
  kayitlar: {},
};

// UI'a giden TEK ve DAİMA SABİT hata metni — LocalNamazServisi'nin ham
// error.message'ı (teknik, kullanıcıya anlamsız) burada asla kullanılmaz;
// ham içerik yalnız Logger.error'a gider (bkz. dosya başı JSDoc'u). Testte de
// tüketilebilsin diye export edilir (iki yerde aynı sabit metin tekrar
// yazılmasın).
export const KIBAR_HATA_METNI = 'Geçmiş kayıtlarınız şu anda okunamadı.';

export function useSeriAyi(): SeriAyiSonucu {
  const dispatch = useAppDispatch();
  const ayarlar = useAppSelector((s) => s.seri.ayarlar);
  const ozelGunAyarlari = useAppSelector((s) => s.seri.ozelGunAyarlari);
  const mevcutSeri = useAppSelector((s) => s.seri.seriDurumu?.mevcutSeri ?? 0);
  // Seri slice'ı henüz hidrate edilmediyse (`seriVerileriniYukle` daha
  // tamamlanmadı — bkz. yukarıdaki nöbetçi) `sonYukleme` `null` kalır.
  // İnceleme bulgusu: `yukleniyor` önceden yalnız namaz okumasını temsil
  // ediyordu; seri slice'ı geç hidrat olursa panel bir-iki kare
  // `tamGunEsigi` varsayılanıyla (yanlış eşik) çizilip düzeliyordu.
  //
  // KRITIK (ikinci inceleme turu bulgusu — AGENTS.md'nin kaza-defteri dersi):
  // `seriVerileriniYukle` REDDEDİLEBİLİR (`seriSlice.ts` rejected'ta `hata`
  // dolar ama `sonYukleme` HİÇ yazılmaz). Yalnız `sonYukleme !== null` ile
  // beklemek, ret durumunda `yukleniyor`'u SONSUZA DEK true, `hata`'yı null
  // bırakırdı — hatasız sonsuz spinner (tam da o dersin tarif ettiği tuzak).
  // `hata !== null` de bekleme kapısını kapatır: panel bu durumda
  // `ayarlar`/`seriDurumu` için initialState VARSAYILANLARIYLA (VARSAYILAN_SERI_AYARLARI,
  // mevcutSeri 0) çizilir — düzeltme ÖNCESİ davranışla aynı (spinner'da
  // asılı kalmak yerine "varsayılan eşikle çiz").
  const seriHidrateEdildi = useAppSelector((s) => s.seri.sonYukleme !== null || s.seri.hata !== null);

  // Hidrasyon nöbetçisi — bkz. dosya başı JSDoc'u. İdempotent (yalnız local okuma).
  useEffect(() => {
    dispatch(seriVerileriniYukle());
  }, [dispatch]);

  const bugun = namazGunuHesapla(new Date(), ayarlar.gunBitisSaati);
  const bugunTarihi = ISOTarihiDateNesnesiNeCevir(bugun);
  const yil = bugunTarihi.getFullYear();
  const ay = bugunTarihi.getMonth();

  const [okuma, setOkuma] = useState<OkumaDurumu>(BASLANGIC_OKUMA_DURUMU);
  const [yenidenDeneSayaci, setYenidenDeneSayaci] = useState(0);

  useEffect(() => {
    let iptal = false;
    setOkuma((onceki) => ({ ...onceki, yukleniyor: true, hata: null }));

    (async () => {
      // TEK KAYNAK: `aylikIzgaraOlustur`'un çizdiği aralıkla BİREBİR aynı
      // fonksiyon (`izgaraAraligi`, `core/seri/aylikIzgara.ts`) — önceden bu
      // 5 satır burada AYRICA hesaplanıyordu (ikiz kod, inceleme bulgusu).
      const { baslangic: izgaraBaslangici, bitis: izgaraBitisi } = izgaraAraligi(yil, ay);

      const yanit = await localTarihAraligindakiNamazlariGetir(izgaraBaslangici, izgaraBitisi);
      if (iptal) {
        return;
      }

      if (!yanit.basarili || !yanit.veri) {
        // Teknik ayrıntı (ham error.message) yalnız log'a gider — kullanıcı
        // daima aynı kibar, sabit metni görür (bkz. KIBAR_HATA_METNI JSDoc'u).
        Logger.error('useSeriAyi', 'Namaz kayıtları okunamadı (aralık okuma)', {
          hata: yanit.hata,
          izgaraBaslangici,
          izgaraBitisi,
        });
        setOkuma({ yukleniyor: false, hata: KIBAR_HATA_METNI, kayitlar: {} });
        return;
      }

      const kayitlar: Record<string, boolean[]> = {};
      for (const gun of yanit.veri) {
        kayitlar[gun.tarih] = gun.namazlar.map((n) => n.tamamlandi);
      }
      setOkuma({ yukleniyor: false, hata: null, kayitlar });
    })();

    return () => {
      iptal = true;
    };
  }, [yil, ay, yenidenDeneSayaci]);

  const dondurulmusTarihler = useMemo(() => ozelGunKumesi(ozelGunAyarlari), [ozelGunAyarlari]);

  const izgara = useMemo(
    () =>
      aylikIzgaraOlustur({
        yil,
        ay,
        kayitlar: okuma.kayitlar,
        dondurulmusTarihler,
        bugun,
      }),
    [yil, ay, okuma.kayitlar, dondurulmusTarihler, bugun]
  );

  const zincirler = useMemo(() => zincirBaglari(izgara, ayarlar.tamGunEsigi), [izgara, ayarlar.tamGunEsigi]);

  const ayAdi = `${ayAdiniAl(ay)} ${yil}`;

  const yenidenDene = useCallback(() => setYenidenDeneSayaci((n) => n + 1), []);

  return {
    // Namaz okuması bitse bile seri slice'ı henüz hidrate değilse `yukleniyor`
    // true kalır (yukarıdaki `seriHidrateEdildi` yorumu).
    yukleniyor: okuma.yukleniyor || !seriHidrateEdildi,
    hata: okuma.hata,
    izgara,
    zincirler,
    ayAdi,
    bugun,
    tamGunEsigi: ayarlar.tamGunEsigi,
    mevcutSeri,
    yenidenDene,
  };
}
