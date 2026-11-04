import { sagdanSolaMi, yonuYalit } from '../yon';

describe('yon', () => {
  it('sağdan sola dilleri tanır', () => {
    expect(sagdanSolaMi('pa')).toBe(true);
    expect(sagdanSolaMi('tr')).toBe(false);
    expect(sagdanSolaMi('bilinmeyen')).toBe(false);
  });

  it('yonuYalit metni FSI…PDI arasına alır, metne dokunmaz', () => {
    expect(yonuYalit('İstanbul')).toBe('⁨İstanbul⁩');
    expect(yonuYalit('İstanbul').slice(1, -1)).toBe('İstanbul');
  });
});
