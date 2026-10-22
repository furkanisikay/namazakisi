/**
 * İlçe merkezi koordinatları — nöbetçi testler.
 *
 * Yaşanmış hata (denetim 2026-10-21): turkiyeapi.dev ilçe kayıtlarında koordinat yoktu,
 * elle ilçe seçen kullanıcıya il merkezinin koordinatı yazılıyor ve vakitler il merkezine
 * göre hesaplanıyordu. Bu testler hem tablonun bütünlüğünü hem de vaktin gerçekten
 * ilçeye göre değiştiğini kilitler.
 */
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../../vakit/hesapParametreleri';
import { ILCE_MERKEZLERI } from '../ilceMerkezleriVerisi';
import {
  adAnahtari,
  cevrimdisiIlceler,
  ilceKoordinatiBul,
  manuelIlceKoordinatiniDuzelt,
} from '../ilceKoordinati';

/** İstanbul il merkezi (TURKIYE_ILLERI_OFFLINE ile aynı) — eski sürümün yazdığı değer. */
const ISTANBUL_IL_MERKEZI = { lat: 41.0082, lng: 28.9784 };

function ogleVakti(k: { lat: number; lng: number }): Date {
  // Sabit tarih burada güvenli: yalnız iki noktanın AYNI gündeki farkı ölçülür.
  return new PrayerTimes(new Coordinates(k.lat, k.lng), new Date(2026, 2, 21), turkiyeHesapParametreleri()).dhuhr;
}

describe('ilçe merkezi tablosu — bütünlük', () => {
  it('81 ilin hepsi ve 973 ilçenin hepsi var', () => {
    const iller = Object.keys(ILCE_MERKEZLERI).map(Number).sort((a, b) => a - b);
    expect(iller).toEqual(Array.from({ length: 81 }, (_, i) => i + 1));
    const toplam = Object.values(ILCE_MERKEZLERI).reduce((a, l) => a + l.length, 0);
    expect(toplam).toBe(973);
  });

  it('her koordinat Türkiye sınır kutusu içinde ve kimlikler tekil', () => {
    const kimlikler = new Set<number>();
    for (const liste of Object.values(ILCE_MERKEZLERI)) {
      for (const [id, ad, lat, lng] of liste) {
        expect(ad.length).toBeGreaterThan(0);
        expect(lat).toBeGreaterThan(35.8);
        expect(lat).toBeLessThan(42.2);
        expect(lng).toBeGreaterThan(25.6);
        expect(lng).toBeLessThan(44.9);
        expect(kimlikler.has(id)).toBe(false);
        kimlikler.add(id);
      }
    }
  });

  it('il içinde aynı adlı iki ilçe yok (ad ile arama belirsiz kalmasın)', () => {
    for (const liste of Object.values(ILCE_MERKEZLERI)) {
      const anahtarlar = liste.map((k) => adAnahtari(k[1]));
      expect(new Set(anahtarlar).size).toBe(anahtarlar.length);
    }
  });
});

describe('NÖBETÇİ: çevrimdışı il koordinatı şehir merkezindedir', () => {
  it('"Merkez" ilçesi olan her ilde il koordinatı merkez ilçeye 5 km’den yakın', () => {
    // Denetim 2026-10-21: Burdur 35 km, Muş 33 km sapıyordu (il kutusunun ortası gibi).
    const { TURKIYE_ILLERI_OFFLINE } = require('../../../domain/services/TurkiyeKonumServisi') as {
      TURKIYE_ILLERI_OFFLINE: { id: number; ad: string; lat: number; lng: number }[];
    };
    const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
      const r = Math.PI / 180;
      const x = (b.lng - a.lng) * r * Math.cos(((a.lat + b.lat) / 2) * r);
      return Math.hypot(x, (b.lat - a.lat) * r) * 6371;
    };
    const sapanlar = TURKIYE_ILLERI_OFFLINE.flatMap((il) => {
      const merkez = ilceKoordinatiBul(il.id, 'Merkez');
      return merkez && km(il, merkez) > 5 ? [`${il.ad} ${km(il, merkez).toFixed(1)} km`] : [];
    });
    expect(sapanlar).toEqual([]);
  });
});

describe('ilceKoordinatiBul', () => {
  it('kimlikle ve adla aynı ilçeyi bulur; ad Türkçe harf/boşluk duyarsız', () => {
    const kimlikle = ilceKoordinatiBul(34, 'yanlış ad', 1622);
    const adla = ilceKoordinatiBul(34, 'SİLİVRİ');
    expect(kimlikle).not.toBeNull();
    expect(adla).toEqual(kimlikle);
  });

  it('aynı adlı ilçeleri ile göre ayırır (Ereğli: Konya ↔ Zonguldak)', () => {
    const konya = ilceKoordinatiBul(42, 'Ereğli')!;
    const zonguldak = ilceKoordinatiBul(67, 'Ereğli')!;
    expect(konya.lat).toBeLessThan(38.5); // İç Anadolu
    expect(zonguldak.lat).toBeGreaterThan(41); // Karadeniz kıyısı
  });

  it('OSM etiketi yanlış olan ilçeleri de doğru ile bağlar (Mersin/Anamur)', () => {
    const anamur = ilceKoordinatiBul(33, 'Anamur')!;
    expect(anamur.lat).toBeCloseTo(36.08, 1);
    expect(anamur.lng).toBeCloseTo(32.83, 1);
  });

  it('bilinmeyen ilçede null döner (çağıran il merkezine düşer)', () => {
    expect(ilceKoordinatiBul(34, 'Olmayan İlçe')).toBeNull();
    expect(ilceKoordinatiBul(null, 'Silivri')).toBeNull();
  });

  it('çevrimdışı ilçe listesi ilin tüm ilçelerini kimlikleriyle verir', () => {
    const liste = cevrimdisiIlceler(34);
    expect(liste.length).toBe(39);
    expect(liste.find((i) => i.ad === 'Kadıköy')).toBeDefined();
  });
});

describe('NÖBETÇİ: ilçe vakti il merkezinden farklıdır', () => {
  it('Silivri öğlesi İstanbul il merkezinden en az 2 dk sonra, Kartal ile en az 3 dk fark', () => {
    const silivri = ilceKoordinatiBul(34, 'Silivri')!;
    const kartal = ilceKoordinatiBul(34, 'Kartal')!;
    const ilFark = (ogleVakti(silivri).getTime() - ogleVakti(ISTANBUL_IL_MERKEZI).getTime()) / 60000;
    const ilceFark = (ogleVakti(silivri).getTime() - ogleVakti(kartal).getTime()) / 60000;
    expect(ilFark).toBeGreaterThanOrEqual(2);
    expect(ilceFark).toBeGreaterThanOrEqual(3);
  });
});

describe('manuelIlceKoordinatiniDuzelt (göç)', () => {
  const temel = {
    konumModu: 'manuel',
    seciliIlId: 34,
    seciliIlceId: 1622,
    seciliIlceAdi: 'Silivri',
    koordinatlar: ISTANBUL_IL_MERKEZI,
    seciliIlAdi: 'İstanbul',
  };

  it('eski kaydın il merkezi koordinatını ilçe merkezine çeker, diğer alanları korur', () => {
    const sonuc = manuelIlceKoordinatiniDuzelt(temel);
    expect(sonuc).not.toBe(temel);
    expect(sonuc.koordinatlar).toEqual(ilceKoordinatiBul(34, 'Silivri'));
    expect(sonuc.seciliIlAdi).toBe('İstanbul');
  });

  it('idempotent: düzeltilmiş kayıtta AYNI referansı döndürür', () => {
    const bir = manuelIlceKoordinatiniDuzelt(temel);
    expect(manuelIlceKoordinatiniDuzelt(bir)).toBe(bir);
  });

  it('otomatik modda, ilçesiz seçimde ve bilinmeyen ilçede dokunmaz', () => {
    const oto = { ...temel, konumModu: 'oto' };
    const ilcesiz = { ...temel, seciliIlceAdi: '', seciliIlceId: null };
    const bilinmeyen = { ...temel, seciliIlceAdi: 'Olmayan', seciliIlceId: 999999 };
    expect(manuelIlceKoordinatiniDuzelt(oto)).toBe(oto);
    expect(manuelIlceKoordinatiniDuzelt(ilcesiz)).toBe(ilcesiz);
    expect(manuelIlceKoordinatiniDuzelt(bilinmeyen)).toBe(bilinmeyen);
  });
});

describe('üretici betik ile çalışma anı aynı ad kuralını kullanır', () => {
  it('scripts/konum/ilce-merkezleri-uret.js > adAnahtari = core adAnahtari', () => {
    const { adAnahtari: betikAnahtari } = require('../../../../scripts/konum/ilce-merkezleri-uret.js') as {
      adAnahtari: (ad: string) => string;
    };
    for (const ornek of ['İstanbul', 'EYÜP SULTAN', 'Şanlıurfa', 'Çağlayancerit', 'Kâhta', 'Ağrı Merkez', 'Of']) {
      expect(betikAnahtari(ornek)).toBe(adAnahtari(ornek));
    }
  });
});
