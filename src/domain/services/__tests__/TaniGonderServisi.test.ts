jest.mock('react-native', () => ({ Platform: { OS: 'android', Version: 34, constants: { Model: 'X', Release: '16' } } }));
jest.mock('../../../core/utils/Logger', () => ({ Logger: { exportLogs: () => 'log', error: jest.fn() } }));
const mockYaz = jest.fn();
jest.mock('expo-file-system/next', () => ({
  Paths: { cache: '/cache' },
  File: class { uri = 'file:///cache/tani.txt'; constructor() {} create() {} write(v: string) { mockYaz(v); } },
}));
const mockCompose = jest.fn();
const mockMailAvail = jest.fn();
jest.mock('expo-mail-composer', () => ({
  isAvailableAsync: () => mockMailAvail(),
  composeAsync: (o: unknown) => mockCompose(o),
}));
const mockShareAvail = jest.fn(() => Promise.resolve(true));
const mockShare = jest.fn();
jest.mock('expo-sharing', () => ({ isAvailableAsync: () => mockShareAvail(), shareAsync: (u: string) => mockShare(u) }));

import { taniEpostasiniAc } from '../TaniGonderServisi';

describe('taniEpostasiniAc', () => {
  beforeEach(() => jest.clearAllMocks());

  test('mail varsa composeAsync ile açar, gönderilince "gonderildi"', async () => {
    mockMailAvail.mockResolvedValue(true);
    mockCompose.mockResolvedValue({ status: 'sent' });
    const r = await taniEpostasiniAc({ konumDahil: false });
    expect(mockCompose).toHaveBeenCalled();
    expect(r).toBe('gonderildi');
  });

  test('mail yoksa share-sheet fallback → "paylasildi"', async () => {
    mockMailAvail.mockResolvedValue(false);
    const r = await taniEpostasiniAc({ konumDahil: false });
    expect(mockShare).toHaveBeenCalled();
    expect(r).toBe('paylasildi');
  });
});
