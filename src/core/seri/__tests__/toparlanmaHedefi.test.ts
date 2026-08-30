import { toparlanmaHedefiniNormalize } from '../toparlanmaHedefi';
import { ToparlanmaDurumu } from '../../types/SeriTipleri';

const durumOlustur = (
  tamamlananGun: number,
  hedefGunSayisi: number
): ToparlanmaDurumu => ({
  tamamlananGun,
  baslangicTarihi: '2026-06-13',
  hedefGunSayisi,
  oncekiSeri: 22,
});

describe('toparlanmaHedefiniNormalize', () => {
  test('toparlanma yoksa null aynen dondurulur', () => {
    expect(toparlanmaHedefiniNormalize(null, 2)).toBeNull();
  });

  test('bayat hedef (5) guncel kurala (2) cekilir', () => {
    const sonuc = toparlanmaHedefiniNormalize(durumOlustur(0, 5), 2);
    expect(sonuc?.hedefGunSayisi).toBe(2);
    expect(sonuc?.tamamlananGun).toBe(0);
    expect(sonuc?.oncekiSeri).toBe(22);
  });

  test('hedef ASLA yukseltilmez (2 -> 3 istense bile 2 kalir)', () => {
    const durum = durumOlustur(1, 2);
    expect(toparlanmaHedefiniNormalize(durum, 3)).toBe(durum); // ayni referans
  });

  test('hedef, tamamlanan gun sayisinin altina/esitine indirilmez', () => {
    // 4/5 iken kural 2'ye inerse "4/2" gibi tamamlanmis GORUNEN ama kurtarilmamis
    // bir duruma dusulmemeli; taban tamamlanan + 1'dir (bir sonraki tam gunde biter).
    const sonuc = toparlanmaHedefiniNormalize(durumOlustur(4, 5), 2);
    expect(sonuc?.hedefGunSayisi).toBe(5);

    const sonuc2 = toparlanmaHedefiniNormalize(durumOlustur(2, 5), 2);
    expect(sonuc2?.hedefGunSayisi).toBe(3);
  });

  test('degisiklik yoksa AYNI referans doner (gereksiz yazma olmaz)', () => {
    const durum = durumOlustur(1, 2);
    expect(toparlanmaHedefiniNormalize(durum, 2)).toBe(durum);
  });
});
