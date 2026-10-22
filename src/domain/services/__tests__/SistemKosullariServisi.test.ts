jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { fetch: jest.fn() },
}));

import NetInfo from '@react-native-community/netinfo';
import {
  gucTasarrufuAcikMi,
  sistemKosullarinaAbone,
  sistemKosullariDeposunuSifirla,
  sistemKosullariniOku,
  sonSistemKosullari,
} from '../SistemKosullariServisi';
import { BILINMEYEN_SISTEM_DURUMU } from '../../../core/sistem/sistemDurumu';

const kopru = require('../../../../modules/expo-sistem-durumu/src');
const fetchMock = NetInfo.fetch as jest.Mock;

describe('SistemKosullariServisi', () => {
  beforeEach(() => {
    sistemKosullariDeposunuSifirla();
    jest.clearAllMocks();
    kopru.sistemModuluVarMi.mockReturnValue(false);
    kopru.hamSistemDurumuAl.mockResolvedValue(null);
    kopru.sistemDurumunuDinle.mockImplementation(() => ({ remove: jest.fn() }));
    fetchMock.mockResolvedValue({ isConnected: true, type: 'cellular', details: { isConnectionExpensive: true } });
  });

  afterAll(() => {
    kopru.sistemModuluVarMi.mockReturnValue(false);
    kopru.hamSistemDurumuAl.mockResolvedValue(null);
  });

  it('köprü yoksa ağ alanları NetInfo ile tamamlanır, gerisi bilinmiyor', async () => {
    const d = await sistemKosullariniOku();
    expect(d).toEqual({ ...BILINMEYEN_SISTEM_DURUMU, agTuru: 'hucresel', olculuAg: true });
  });

  it('köprü ağ türünü veriyorsa NetInfo sorulmaz', async () => {
    kopru.hamSistemDurumuAl.mockResolvedValue({ platform: 'ios', agTuru: 'wifi', olculuAg: false, gucTasarrufu: true });
    const d = await sistemKosullariniOku();
    expect(d).toMatchObject({ platform: 'ios', agTuru: 'wifi', gucTasarrufu: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('NetInfo da patlarsa asla fırlatmaz', async () => {
    fetchMock.mockRejectedValue(new Error('yok'));
    await expect(sistemKosullariniOku()).resolves.toEqual(BILINMEYEN_SISTEM_DURUMU);
  });

  it('gucTasarrufuAcikMi: köprü yoksa null', async () => {
    expect(await gucTasarrufuAcikMi()).toBeNull();
    kopru.hamSistemDurumuAl.mockResolvedValue({ gucTasarrufu: true });
    expect(await gucTasarrufuAcikMi()).toBe(true);
  });

  it('depo: köprü yoksa hiç dinleme kurulmaz ve değer değişmez', () => {
    const cik = sistemKosullarinaAbone(jest.fn());
    expect(kopru.sistemDurumunuDinle).not.toHaveBeenCalled();
    expect(sonSistemKosullari()).toBe(BILINMEYEN_SISTEM_DURUMU);
    cik();
  });

  it('depo: TEK native dinleyici; olay aboneleri bilgilendirir, son abone gidince dinleme kalkar', async () => {
    kopru.sistemModuluVarMi.mockReturnValue(true);
    kopru.hamSistemDurumuAl.mockResolvedValue({ gucTasarrufu: false });
    let yayinla: (ham: Record<string, unknown>) => void = () => undefined;
    const remove = jest.fn();
    kopru.sistemDurumunuDinle.mockImplementation((cb: typeof yayinla) => {
      yayinla = cb;
      return { remove };
    });
    const a = jest.fn();
    const b = jest.fn();
    const cikA = sistemKosullarinaAbone(a);
    const cikB = sistemKosullarinaAbone(b);
    expect(kopru.sistemDurumunuDinle).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    await Promise.resolve();
    yayinla({ gucTasarrufu: true });
    expect(sonSistemKosullari().gucTasarrufu).toBe(true);
    expect(a).toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
    const onceki = a.mock.calls.length;
    yayinla({ gucTasarrufu: true }); // aynı değer → yayın yok
    expect(a.mock.calls.length).toBe(onceki);
    cikA();
    expect(remove).not.toHaveBeenCalled();
    cikB();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
