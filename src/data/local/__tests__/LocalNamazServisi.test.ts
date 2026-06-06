import AsyncStorage from '@react-native-async-storage/async-storage';
import { NAMAZ_ISIMLERI, NamazAdi, DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import {
  localNamazDurumunuGuncelle,
  localTumNamazlariGuncelle,
  localNamazlariGetir,
  kilinanVakitleriAl,
} from '../LocalNamazServisi';

describe('LocalNamazServisi — eşzamanlı yazma (race condition)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('aynı gün için 5 namazın eşzamanlı güncellenmesi hepsini korur (lost update olmamalı)', async () => {
    const tarih = '2026-06-06';

    // Hepsi aynı anda: serileştirme yoksa hepsi {} okur, son yazan diğerlerini ezer.
    await Promise.all(
      NAMAZ_ISIMLERI.map((ad) => localNamazDurumunuGuncelle(tarih, ad, true))
    );

    const sonuc = await localNamazlariGetir(tarih);
    const namazlar = sonuc.veri!.namazlar;
    for (const ad of NAMAZ_ISIMLERI) {
      expect(namazlar.find((n) => n.namazAdi === ad)?.tamamlandi).toBe(true);
    }
  });

  it('tekil ve toplu güncelleme eşzamanlı çalıştığında veri tutarlı kalır', async () => {
    const tarih = '2026-06-07';

    await Promise.all([
      localTumNamazlariGuncelle(tarih, true),
      localNamazDurumunuGuncelle(tarih, NamazAdi.Sabah, true),
      localNamazDurumunuGuncelle(tarih, NamazAdi.Yatsi, true),
    ]);

    const sonuc = await localNamazlariGetir(tarih);
    const namazlar = sonuc.veri!.namazlar;
    // Sıralı kuyruk sayesinde son durumda Sabah ve Yatsı kesin true olmalı.
    expect(namazlar.find((n) => n.namazAdi === NamazAdi.Sabah)?.tamamlandi).toBe(true);
    expect(namazlar.find((n) => n.namazAdi === NamazAdi.Yatsi)?.tamamlandi).toBe(true);
  });
});

describe('LocalNamazServisi — kilinanVakitleriAl', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('kayıt yoksa boş dizi döner', async () => {
    expect(await kilinanVakitleriAl('2026-06-07')).toEqual([]);
  });

  it('kayıtlı vakitleri doğru storage key ile okur', async () => {
    const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_2026-06-07`;
    await AsyncStorage.setItem(anahtar, JSON.stringify(['ogle', 'ikindi']));
    expect(await kilinanVakitleriAl('2026-06-07')).toEqual(['ogle', 'ikindi']);
  });

  it('bozuk JSON gelirse boş dizi döner (çökmemeli)', async () => {
    const anahtar = `${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_2026-06-07`;
    await AsyncStorage.setItem(anahtar, '{bozuk-json');
    expect(await kilinanVakitleriAl('2026-06-07')).toEqual([]);
  });
});
