import { act, renderHook } from '@testing-library/react-native';

import { useKatlanmaPosturu } from '../useKatlanmaPosturu';
import { DUZ_POSTUR } from '../../../core/utils/katlanmaPosturu';

// moduleNameMapper ile eşlenen mock'a `require` ile ulaşılır (jest.requireMock DEĞİL — AGENTS.md).
const kopru = require('../../../../modules/expo-katlanma-posturu/src');

const sinir = { sol: 0, ust: 440, sag: 800, alt: 440 };
const masaustuHam = { durum: 'yariAcik', yon: 'yatay', ayirici: true, sinir };

describe('useKatlanmaPosturu', () => {
  let yayinla: ((veri: unknown) => void) | null;
  let kaldir: jest.Mock;

  beforeEach(() => {
    yayinla = null;
    kaldir = jest.fn();
    (kopru.sonPostur as jest.Mock).mockReturnValue(null);
    (kopru.posturDinle as jest.Mock).mockImplementation((cb: (veri: unknown) => void) => {
      yayinla = cb;
      return { remove: kaldir };
    });
  });

  afterAll(() => {
    (kopru.sonPostur as jest.Mock).mockReturnValue(null);
    (kopru.posturDinle as jest.Mock).mockImplementation(() => ({ remove: jest.fn() }));
  });

  it('modül yoksa / bilgi yoksa DÜZ döner', () => {
    const { result } = renderHook(() => useKatlanmaPosturu());
    expect(result.current).toBe(DUZ_POSTUR);
  });

  it('açılışta bilinen son postürü kullanır', () => {
    (kopru.sonPostur as jest.Mock).mockReturnValue(masaustuHam);
    const { result } = renderHook(() => useKatlanmaPosturu());
    expect(result.current).toEqual({ tur: 'masaustu', mentese: sinir });
  });

  it('olayla masaüstüne geçer, düzleşince geri döner; abonelik kaldırılır', () => {
    const { result, unmount } = renderHook(() => useKatlanmaPosturu());
    act(() => yayinla!(masaustuHam));
    expect(result.current.tur).toBe('masaustu');
    act(() => yayinla!({ durum: 'duz', yon: 'yatay', sinir }));
    expect(result.current).toBe(DUZ_POSTUR);
    unmount();
    expect(kaldir).toHaveBeenCalledTimes(1);
  });

  it('değerce aynı olay YENİ referans üretmez (saniyelik render memo dostu)', () => {
    const { result } = renderHook(() => useKatlanmaPosturu());
    act(() => yayinla!(masaustuHam));
    const ilk = result.current;
    act(() => yayinla!({ ...masaustuHam, sinir: { ...sinir } }));
    expect(result.current).toBe(ilk);
  });

  it('bozuk olay düze düşer, çökmez', () => {
    const { result } = renderHook(() => useKatlanmaPosturu());
    act(() => yayinla!(masaustuHam));
    act(() => yayinla!({ durum: 'yariAcik', yon: 'yatay', sinir: 'bozuk' }));
    expect(result.current).toBe(DUZ_POSTUR);
  });
});
