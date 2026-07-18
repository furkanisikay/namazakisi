import { eskiAlarmSesiniGoc, eskidenMatriseGoc } from '../muhafizGoc';
import { MUHAFIZ_VAKITLERI } from '../matrisTipleri';

const eski = {
  esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
  sikliklar: { seviye1: 20, seviye2: 10, seviye3: 5, seviye4: 2 },
};

describe('eskidenMatriseGoc', () => {
  test('5 vaktin hepsini üretir', () => {
    const m = eskidenMatriseGoc(eski);
    expect(Object.keys(m).sort()).toEqual([...MUHAFIZ_VAKITLERI].sort());
  });
  test('eşik/sıklık seviye sırasına doğru dağılır', () => {
    const m = eskidenMatriseGoc(eski);
    const s = m.ikindi.seviyeler;
    expect(s.map((x) => x.esikDk)).toEqual([45, 25, 10, 3]);
    expect(s.map((x) => (x.siklik as { herDk: number }).herDk)).toEqual([20, 10, 5, 2]);
  });
  test('mod=bildirim, ses varsayılan, anons boş (TTS opt-in)', () => {
    const s = eskidenMatriseGoc(eski).ogle.seviyeler[0];
    expect(s.mod).toBe('bildirim');
    expect(s.bildirimSesi).toBe('varsayilan');
    expect(s.anonsMetni).toBe('');
  });
  test('idempotent: iki kez çağırmak aynı sonucu verir', () => {
    expect(eskidenMatriseGoc(eski)).toEqual(eskidenMatriseGoc(eski));
  });
});

describe('eskiAlarmSesiniGoc', () => {
  const alarmliMatris = () => {
    const m = eskidenMatriseGoc(eski);
    m.ogle.seviyeler[3].bildirimSesi = 'alarm';
    m.ogle.seviyeler[3].sesAdi = 'Alarm';
    return m;
  };

  test("'alarm' → varsayılan ses + acilKanal:true (aciliyet GÖRÜNÜR alana taşınır)", () => {
    // Eski şemada aciliyet ses id'siyle taşınıyordu. Göç olmasaydı kullanıcı yeni
    // bir ses seçtiği an aciliyet SESSİZCE kaybolurdu (UI'da izi de yoktu).
    const s = eskiAlarmSesiniGoc(alarmliMatris()).ogle.seviyeler[3];
    expect(s.bildirimSesi).toBe('varsayilan');
    expect(s.acilKanal).toBe(true);
    expect(s.sesAdi).toBeUndefined();
  });

  test('AÇIKÇA yazılmış acilKanal EZİLMEZ (kullanıcı tercihi öncelikli)', () => {
    const m = alarmliMatris();
    m.ogle.seviyeler[3].acilKanal = false;
    expect(eskiAlarmSesiniGoc(m).ogle.seviyeler[3].acilKanal).toBe(false);
  });

  test("'alarm' yoksa AYNI referans döner (gereksiz kopya/diske yazma yok)", () => {
    const m = eskidenMatriseGoc(eski);
    expect(eskiAlarmSesiniGoc(m)).toBe(m);
  });

  test('idempotent: ikinci çağrı hiçbir şey değiştirmez', () => {
    const bir = eskiAlarmSesiniGoc(alarmliMatris());
    expect(eskiAlarmSesiniGoc(bir)).toBe(bir);
  });

  test('dokunulmayan vakitler AYNI referansı korur', () => {
    const m = alarmliMatris();
    expect(eskiAlarmSesiniGoc(m).ikindi).toBe(m.ikindi);
  });
});
