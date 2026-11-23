import { etkilesimSonrasi } from '../etkilesimSonrasi';

type Kuresel = {
  requestIdleCallback?: (gorev: () => void, secenek?: { timeout?: number }) => number;
  cancelIdleCallback?: (kimlik: number) => void;
};

describe('etkilesimSonrasi', () => {
  const kuresel = globalThis as Kuresel;

  afterEach(() => {
    delete kuresel.requestIdleCallback;
    delete kuresel.cancelIdleCallback;
    jest.useRealTimers();
  });

  test('requestIdleCallback varsa üst sınırlı bekleme ile onu kullanır ve iptal eder', () => {
    const iste = jest.fn((_gorev: () => void, _secenek?: { timeout?: number }) => 7);
    const iptal = jest.fn();
    kuresel.requestIdleCallback = iste;
    kuresel.cancelIdleCallback = iptal;
    const gorev = jest.fn();

    const tutamak = etkilesimSonrasi(gorev);
    expect(iste).toHaveBeenCalledWith(expect.any(Function), { timeout: 2000 });
    iste.mock.calls[0][0]();
    expect(gorev).toHaveBeenCalledTimes(1);

    tutamak.cancel();
    expect(iptal).toHaveBeenCalledWith(7);
  });

  test('requestIdleCallback yoksa (jest/node) sonraki makro görevde çalışır, iptal edilebilir', () => {
    jest.useFakeTimers();
    const calisan = jest.fn();
    etkilesimSonrasi(calisan);
    const iptalEdilen = jest.fn();
    etkilesimSonrasi(iptalEdilen).cancel();

    expect(calisan).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(calisan).toHaveBeenCalledTimes(1);
    expect(iptalEdilen).not.toHaveBeenCalled();
  });
});
