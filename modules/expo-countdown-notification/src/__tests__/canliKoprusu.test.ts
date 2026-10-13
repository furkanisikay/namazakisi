/**
 * Android 16 Live Update köprüsü (issue #282).
 *
 * `canli` verilirse `startCountdownCanli` (tek JSON ek yükü); verilmezse eski
 * `startCountdown` BİREBİR. Native ikili eskiyse (fonksiyon yok) eski yola düşer —
 * sayaç kaybolmamalı.
 */

const mockStartCountdown = jest.fn();
const mockStartCountdownCanli = jest.fn();
// Getter: degerler cagri aninda okunur (fabrika import'tan once kosar, TDZ olmaz).
const mockDurum = { canliVar: true };

jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: () => ({
    startCountdown: (...a: unknown[]) => mockStartCountdown(...a),
    get startCountdownCanli() {
      return mockDurum.canliVar ? (...a: unknown[]) => mockStartCountdownCanli(...a) : undefined;
    },
  }),
}));

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

import { startCountdown } from '../index';

const temel = {
  id: 'sayac_2026-10-13_ikindi',
  targetTimeMs: 1_800_000_000_000,
  title: 'İkindi Namazı',
  bodyTemplate: 'İkindi namazı vakti çıkmak üzere!\n{time}',
  channelId: 'vakit_sayac_v2',
  themeType: 'vakit' as const,
};

describe('startCountdown — Live Update köprüsü', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDurum.canliVar = true;
  });

  test('canli YOKSA eski startCountdown birebir çağrılır', () => {
    startCountdown(temel);
    expect(mockStartCountdownCanli).not.toHaveBeenCalled();
    expect(mockStartCountdown).toHaveBeenCalledWith(
      temel.id, temel.targetTimeMs, temel.title, temel.bodyTemplate, temel.channelId, '', 'vakit', false
    );
  });

  test('canli VARSA ek yük tek JSON ile startCountdownCanli\'ya gider (hedefteKaybol dahil)', () => {
    const canli = {
      baslangicMs: 1_799_989_200_000,
      bolumler: [{ uzunlukDk: 150, vurgulu: false }, { uzunlukDk: 30, vurgulu: true }],
      kildim: { tarih: '2026-10-13', vakit: 'ikindi' },
    };
    startCountdown({ ...temel, canli, autoDismissAtTarget: true });

    expect(mockStartCountdown).not.toHaveBeenCalled();
    expect(mockStartCountdownCanli).toHaveBeenCalledTimes(1);
    const arg = mockStartCountdownCanli.mock.calls[0];
    expect(arg.slice(0, 7)).toEqual([
      temel.id, temel.targetTimeMs, temel.title, temel.bodyTemplate, temel.channelId, '', 'vakit',
    ]);
    expect(JSON.parse(arg[7] as string)).toEqual({ ...canli, hedefteKaybol: true });
  });

  test('eski native ikili (startCountdownCanli yok): eski yola düşülür, sayaç kaybolmaz', () => {
    mockDurum.canliVar = false;
    startCountdown({ ...temel, canli: { baslangicMs: 0, bolumler: [] } });
    expect(mockStartCountdown).toHaveBeenCalledTimes(1);
  });
});
