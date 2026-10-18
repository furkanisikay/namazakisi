/**
 * NOBETCI — GERCEK ALARM (issue #74) cekirdegi.
 *
 * - Alarm yalniz adimin ILK tetiginde (`alarmAniMi`), tekrarlar normal bildirim.
 * - Alarm kanali KAPALI plan BIREBIR eskisi (alan hic yazilmaz).
 * - Native yuk sozlesmesi Kotlin ile AYNI ornek dosyadan dogrulanir.
 * - Defter: Android'de alarm o tetigin bildirimi + anonsunun YERINE tek alarm.
 * - iOS: zamana duyarli + uzun ses; ses dosyasi pakette ve 30 sn altinda.
 */
import * as fs from 'fs';
import * as path from 'path';

import type { MuhafizMatrisi, SeviyeAyari, UyariKanallari, VakitMuhafizAyari } from '../matrisTipleri';
import { MUHAFIZ_VAKITLERI, VARSAYILAN_SES } from '../matrisTipleri';
import { adimKapaliMi } from '../kanalKumesi';
import { alarmAniMi, alarmGerekliMi, vakitUyariPlaniOlustur } from '../motorAdaptoru';
import {
    ALARM_CALMA_SURESI_DK,
    ALARM_KANAL_TABANI,
    alarmKanalIdOlustur,
    alarmKanallariniCikar,
    alarmYukuOlustur,
    type AlarmYukuGirdisi,
} from '../alarmYuku';
import { alarmKurarMi } from '../muhafizTeslimPlani';
import { alarmNotlariniOlustur } from '../alarmNotlari';
import { seviyeOzetiOlustur } from '../seviyeOzeti';
import { IOS_ALARM_SESI, IOS_BILDIRIM_SESI, iosTesliminiCoz } from '../ios/teslimPlani';
import { iosYetenekleri } from '../ios/platformYetenekleri';
import { bildirimDefteriOlustur, defterOzeti } from '../../bildirim/bildirimDefteri';
import { ISTANBUL } from '../../bildirim/__tests__/defterFikstur';
import { TAKVIM_CAKISMA_ID_ONEKI } from '../../bildirim/takvimCakismaPlani';

const PROJE_KOKU = path.resolve(__dirname, '../../../..');
const ORNEK = JSON.parse(
    fs.readFileSync(path.join(PROJE_KOKU, 'android/app/src/test/resources/muhafiz-alarm-ornekleri.json'), 'utf8')
);

const adim = (esikDk: number, kanallar: UyariKanallari, siklik: SeviyeAyari['siklik'] = 'birkez'): SeviyeAyari => ({
    kademe: 'nazik',
    kanallar,
    esikDk,
    siklik,
    bildirimSesi: VARSAYILAN_SES,
    anonsMetni: '',
});

describe('alarmAniMi — yalnız adımın İLK tetiği', () => {
    test('alarm kanalı açık + eşik anı → true; başka dakika → false', () => {
        const s = adim(30, { bildirim: true, alarm: true }, { herDk: 5 });
        expect(alarmAniMi(s, 30)).toBe(true);
        expect(alarmAniMi(s, 25)).toBe(false);
    });
    test('alarm kanalı kapalıysa eşik anında da false', () => {
        expect(alarmAniMi(adim(30, { bildirim: true }), 30)).toBe(false);
        expect(alarmGerekliMi(undefined)).toBe(false);
    });
    test('KAPSAM "hepsi": adımın HER tetiği alarmdır; alan yoksa yalnız ilk (eski davranış)', () => {
        const hepsi = { ...adim(30, { bildirim: true, alarm: true }, { herDk: 5 }), alarmKapsami: 'hepsi' as const };
        expect(alarmAniMi(hepsi, 30)).toBe(true);
        expect(alarmAniMi(hepsi, 25)).toBe(true);
        // Alarm kanalı kapalıysa kapsam bir şey açmaz.
        expect(alarmAniMi({ ...hepsi, kanallar: { bildirim: true } }, 25)).toBe(false);
        expect(alarmAniMi({ ...hepsi, alarmKapsami: 'ilk' }, 25)).toBe(false);
    });
    test('yalnız alarm açık adım KAPALI değildir (tek kapı)', () => {
        expect(adimKapaliMi({ alarm: true })).toBe(false);
    });
});

describe('vakitUyariPlaniOlustur — alarm işareti', () => {
    const cikis: VakitMuhafizAyari = {
        seviyeler: [
            adim(45, { bildirim: true }, { herDk: 15 }),
            adim(20, { bildirim: true, alarm: true }, { herDk: 5 }),
            adim(5, { bildirim: true }, { herDk: 1 }),
        ],
    };

    test('çıkış yönü: alarm yalnız 20. dakikada (tekrarlar 15/10 normal)', () => {
        const plan = vakitUyariPlaniOlustur(cikis, 60);
        const alarmlar = plan.filter((u) => u.alarm === true).map((u) => u.kalanDk);
        expect(alarmlar).toEqual([20]);
        expect(plan.some((u) => u.kalanDk === 15 && u.alarm === undefined)).toBe(true);
    });

    test('kapsam "hepsi": adımın tekrarları da alarm (20/15/10), diğer adımlar etkilenmez', () => {
        const hepsi: VakitMuhafizAyari = {
            seviyeler: cikis.seviyeler.map((s, i) => (i === 1 ? { ...s, alarmKapsami: 'hepsi' as const } : s)),
        };
        const plan = vakitUyariPlaniOlustur(hepsi, 60);
        expect(plan.filter((u) => u.alarm === true).map((u) => u.kalanDk)).toEqual([20, 15, 10]);
        expect(plan.some((u) => u.kalanDk === 45 && u.alarm === true)).toBe(false);
    });

    test('alarm kanalı KAPALI plan alanı HİÇ taşımaz (kayıt-oynat/eşitlik nöbetçisi)', () => {
        const kapali: VakitMuhafizAyari = {
            seviyeler: cikis.seviyeler.map((s) => ({ ...s, kanallar: { bildirim: true } })),
        };
        for (const u of vakitUyariPlaniOlustur(kapali, 60)) expect('alarm' in u).toBe(false);
    });

    test('eşik anı geçmişse (şu an 18 dk kala) alarm planlanmaz — geç alarm yok', () => {
        expect(vakitUyariPlaniOlustur(cikis, 18).some((u) => u.alarm)).toBe(false);
    });

    test('giriş yönü (sabah alarmı): girişten 3 dk sonra bir kez', () => {
        const giris: VakitMuhafizAyari = {
            yon: 'girisindenItibaren',
            seviyeler: [adim(3, { bildirim: true, alarm: true }, { herDk: 10 }), adim(40, { bildirim: true })],
        };
        const plan = vakitUyariPlaniOlustur(giris, 1, { pencereUzunluguDk: 90 });
        const alarmlar = plan.filter((u) => u.alarm);
        expect(alarmlar.map((u) => u.olcuDk)).toEqual([3]);
        expect(alarmlar[0].kalanDk).toBe(87);
        expect(alarmKurarMi({ uyari: alarmlar[0] })).toBe(true);
    });
});

describe('alarm yükü — Kotlin ile ORTAK örnek (sözleşme)', () => {
    test('JS üreticisi örnekteki yükü BİREBİR üretir', () => {
        expect(alarmYukuOlustur(ORNEK.girdi as AlarmYukuGirdisi)).toEqual(ORNEK.yuk);
    });
    test('NAFİLE alarm yükü (standart yetenek): kendi adı + kendi yükü, örnekle BİREBİR', () => {
        expect(alarmYukuOlustur(ORNEK.nafile.girdi as AlarmYukuGirdisi)).toEqual(ORNEK.nafile.yuk);
    });
    test('BİLGİ alarm yükü (cuma/camiye gitme/takvim): tur alanı + örnekle BİREBİR', () => {
        expect(alarmYukuOlustur(ORNEK.bilgi.girdi as AlarmYukuGirdisi)).toEqual(ORNEK.bilgi.yuk);
    });
    test('KILINMIŞLIĞA BAĞLI bilgi yükü (takvim): bayrak + vakit örnekle BİREBİR; diğerlerinde ALAN YOK', () => {
        expect(alarmYukuOlustur(ORNEK.takvim.girdi as AlarmYukuGirdisi)).toEqual(ORNEK.takvim.yuk);
        for (const g of [ORNEK.girdi, ORNEK.nafile.girdi, ORNEK.bilgi.girdi]) {
            expect('kilinmisligaBagli' in alarmYukuOlustur(g as AlarmYukuGirdisi)).toBe(false);
        }
        // Takvim kimliği Kotlin'in susturma önekiyle aynı (JS `TAKVIM_CAKISMA_ID_ONEKI`).
        const kt = fs.readFileSync(
            path.join(PROJE_KOKU, 'android/app/src/main/java/com/furkanisikay/namazakisi/cekirdek/BildirimKildimKurallari.kt'),
            'utf8'
        );
        expect(kt).toContain(`const val TAKVIM_CAKISMA_ONEKI = "${TAKVIM_CAKISMA_ID_ONEKI}"`);
        expect(ORNEK.takvim.yuk.kimlik.startsWith(TAKVIM_CAKISMA_ID_ONEKI)).toBe(true);
    });
    test('tur verilmezse yükte ALAN YOK (muhafız/nafile yükü birebir eskisi)', () => {
        expect('tur' in alarmYukuOlustur(ORNEK.girdi as AlarmYukuGirdisi)).toBe(false);
    });
    test('kanal kimlikleri örnekle aynı ve muhafız GC uzayının DIŞINDA', () => {
        for (const k of ORNEK.kanallar as { ses: string; beklenen: string }[]) {
            expect(alarmKanalIdOlustur(k.ses)).toBe(k.beklenen);
        }
        // `muhafiz_*` olsaydı muhafız kanal çöp toplayıcısı her turda silerdi.
        expect(ALARM_KANAL_TABANI.startsWith('muhafiz')).toBe(false);
    });
    test('varsayılan seste sesUri null (native cihazın ALARM sesini çalar)', () => {
        const yuk = alarmYukuOlustur({ ...(ORNEK.girdi as AlarmYukuGirdisi), bildirimSesi: VARSAYILAN_SES });
        expect(yuk.sesUri).toBeNull();
        expect(yuk.alarmKanalId).toBe(ALARM_KANAL_TABANI);
        expect(yuk.alarmKanalAdi).toBe('Namaz alarmı');
    });
    test('çalma süresi Kotlin CALMA_SURESI_MS ile aynı (2 dk)', () => {
        const kt = fs.readFileSync(
            path.join(PROJE_KOKU, 'android/app/src/main/java/com/furkanisikay/namazakisi/cekirdek/MuhafizAlarmKurallari.kt'),
            'utf8'
        );
        expect(kt).toContain(`CALMA_SURESI_MS = ${ALARM_CALMA_SURESI_DK} * 60_000L`);
        expect(kt).toContain(`KANAL_TABANI = "${ALARM_KANAL_TABANI}"`);
    });
});

describe('alarmKanallariniCikar — korunacak alarm kanalları', () => {
    test('yalnız AÇIK ve alarmlı adımların sesleri, tekil ve sıralı', () => {
        const ozel = 'content://media/external/audio/media/12';
        const m = {} as MuhafizMatrisi;
        for (const v of MUHAFIZ_VAKITLERI) {
            m[v] = {
                seviyeler: [
                    adim(30, { bildirim: true, alarm: true }),
                    { ...adim(10, { bildirim: true, alarm: true }), bildirimSesi: ozel },
                    // Kapalı adımın alarm bayrağı (oncekiKanallar'da değil) sayılmaz.
                    adim(5, { alarm: false }),
                ],
            };
        }
        expect(alarmKanallariniCikar(m)).toEqual([ALARM_KANAL_TABANI, alarmKanalIdOlustur(ozel)].sort());
        expect(alarmKanallariniCikar(undefined)).toEqual([]);
    });
});

describe('bildirim defteri — gerçek alarm', () => {
    const simdi = new Date(2026, 9, 13, 3, 0, 0);
    const matris = (kanallar: UyariKanallari): MuhafizMatrisi => {
        const m = {} as MuhafizMatrisi;
        for (const v of MUHAFIZ_VAKITLERI) {
            m[v] = {
                seviyeler: [
                    { ...adim(30, kanallar, { herDk: 10 }), anonsMetni: '{vakit} vakti' },
                    adim(10, { bildirim: true }),
                ],
            };
        }
        return m;
    };

    test('Android: alarm o tetiğin bildirimi + anonsunun YERİNE tek alarm', () => {
        const sesli = { bildirim: true, sesli: true };
        const once = bildirimDefteriOlustur({ platform: 'android', simdi, koordinat: ISTANBUL, widget: false, muhafiz: { aktif: true, matris: matris(sesli) } });
        const sonra = bildirimDefteriOlustur({ platform: 'android', simdi, koordinat: ISTANBUL, widget: false, muhafiz: { aktif: true, matris: matris({ ...sesli, alarm: true }) } });
        const alarmSayisi = sonra.filter((k) => k.kaynak === 'alarm').length;
        // Vakit başına bir alarm (adımın ilk tetiği); sayı saat dilimine göre 5–6.
        expect(alarmSayisi).toBeGreaterThanOrEqual(5);
        // Her alarm 1 bildirim + 1 anons'un yerine geçti → toplam 5 azalır.
        expect(sonra.length).toBe(once.length - alarmSayisi);
        expect(sonra.filter((k) => k.kaynak === 'alarm').every((k) => k.tur === 'alarm')).toBe(true);
    });

    test('Android: muhafız payı alarmları da sayar', () => {
        const kayitlar = Array.from({ length: 361 }, (_, i) => ({ kaynak: 'alarm' as const, zamanMs: i + 1, tur: 'alarm' as const }));
        expect(defterOzeti(kayitlar, 'android').gelmeyecek).toBe(1);
    });

    test('iOS: alarm ayrı kayıt DEĞİL, muhafız bildirimi olarak sayılır', () => {
        const ios = bildirimDefteriOlustur({ platform: 'ios', simdi, koordinat: ISTANBUL, muhafiz: { aktif: true, matris: matris({ bildirim: true, alarm: true }) } });
        expect(ios.some((k) => k.kaynak === 'alarm')).toBe(false);
        const iosKapali = bildirimDefteriOlustur({ platform: 'ios', simdi, koordinat: ISTANBUL, muhafiz: { aktif: true, matris: matris({ bildirim: true }) } });
        expect(ios.length).toBe(iosKapali.length);
    });
});

describe('iOS teslim — AlarmKit gelene kadar', () => {
    const plan = vakitUyariPlaniOlustur({ seviyeler: [adim(20, { bildirim: true, alarm: true }, { herDk: 5 })] }, 30);

    test('alarm tetiği: zamana duyarlı (nazik tonda bile) + uzun ses', () => {
        const alarm = plan.find((u) => u.alarm)!;
        expect(alarm.seviye).toBe(1);
        const t = iosTesliminiCoz(alarm, iosYetenekleri(false));
        expect(t).toEqual({ tur: 'bildirim', kesintiSeviyesi: 'timeSensitive', ses: IOS_ALARM_SESI });
    });

    test('tekrar tetiği normal: nazik → active + paket sesi', () => {
        const tekrar = plan.find((u) => !u.alarm)!;
        expect(iosTesliminiCoz(tekrar, iosYetenekleri(false))).toEqual({
            tur: 'bildirim',
            kesintiSeviyesi: 'active',
            ses: IOS_BILDIRIM_SESI,
        });
    });

    test('AlarmKit yeteneği gelince tür alarm olur (Faz 3 kancası)', () => {
        expect(iosTesliminiCoz(plan.find((u) => u.alarm)!, iosYetenekleri(true)).tur).toBe('alarm');
    });

    test('alarm sesi app.json listesinde, pakette ve 30 sn altında (iOS uzun sesi ÇALMAZ)', () => {
        const app = JSON.parse(fs.readFileSync(path.join(PROJE_KOKU, 'app.json'), 'utf8'));
        const sesler: string[] = app.expo.plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-notifications')[1].sounds;
        expect(sesler.map((s) => path.basename(s))).toContain(IOS_ALARM_SESI);
        const wav = fs.readFileSync(path.join(PROJE_KOKU, 'assets/sounds', IOS_ALARM_SESI));
        // RIFF/WAVE: bayt hızı 28. bayttan, veri boyutu "data" parçasından.
        const baytHizi = wav.readUInt32LE(28);
        const dataKonum = wav.indexOf('data');
        const veriBoyutu = wav.readUInt32LE(dataKonum + 4);
        const saniye = veriBoyutu / baytHizi;
        expect(saniye).toBeGreaterThan(20);
        expect(saniye).toBeLessThan(30);
    });
});

describe('alarm notları — sessiz sapma yok', () => {
    test('iOS: AlarmKit durumu bilinmiyorsa satır YOK (yanlış bilgi vermektense)', () => {
        expect(alarmNotlariniOlustur({ platform: 'ios', tamEkran: null, tamAlarm: null })).toEqual([]);
        expect(alarmNotlariniOlustur({ platform: 'ios', tamEkran: null, tamAlarm: null, alarmKit: null })).toEqual([]);
    });
    test.each([
        ['desteklenmiyor', 'bilgi', undefined, 'Bu iPhone iOS 18'],
        ['belirsiz', 'bilgi', 'alarmIzni', 'izin'],
        ['reddedildi', 'uyari', 'ayarlar', 'Ayarlar'],
    ] as const)('iOS AlarmKit %s → tek satır (%s, eylem %s)', (alarmKit, tip, eylem, parca) => {
        const n = alarmNotlariniOlustur({ platform: 'ios', tamEkran: null, tamAlarm: null, alarmKit, iosSurum: 18 });
        expect(n).toHaveLength(1);
        expect(n[0].tip).toBe(tip);
        expect(n[0].eylem).toBe(eylem);
        expect(n[0].metin).toContain(parca);
        expect(n[0].metin).not.toMatch(/\b(sen|senin)\b/i);
    });
    test('iOS izinli: varsayılan alarm sesi, kilitli "Kıldım" ve sonradan açılan Odak SÖYLENİR (ayrı satırlarda, iç terim yok)', () => {
        const n = alarmNotlariniOlustur({ platform: 'ios', tamEkran: null, tamAlarm: null, alarmKit: 'izinli' });
        const metin = n.map((x) => x.metin).join(' ');
        expect(n.length).toBeGreaterThan(1);
        expect(metin).toContain('varsayılan alarm sesiyle');
        expect(metin).toContain('seçtiğiniz ses kullanılmaz');
        expect(metin).toContain('kilit açıkken');
        expect(metin).toContain('Odak filtresi');
        expect(metin).not.toContain('plan yenilenene kadar');
    });
    test('iOS desteklenmiyor: "iOS 26" cümlesi YALNIZ sürüm gerçekten eskiyse; 26+ ya da bilinmeyende sürüm iddiasız nötr satır', () => {
        const oku = (iosSurum: number | null | undefined) =>
            alarmNotlariniOlustur({ platform: 'ios', tamEkran: null, tamAlarm: null, alarmKit: 'desteklenmiyor', iosSurum });
        expect(oku(18)[0].metin).toContain('iOS 26 ve üzerinde');
        for (const iosSurum of [26, 27, null, undefined]) {
            const n = oku(iosSurum);
            expect(n).toEqual([{ tip: 'bilgi', metin: 'Bu adım şu an bildirimle gelir.' }]);
            expect(n[0].metin).not.toMatch(/iOS|güncelle/i);
        }
    });
    test('Android: izinler bilinmiyorsa (null) uyarı YOK', () => {
        expect(alarmNotlariniOlustur({ platform: 'android', tamEkran: null, tamAlarm: null })).toEqual([]);
        expect(alarmNotlariniOlustur({ platform: 'android', tamEkran: true, tamAlarm: true })).toEqual([]);
    });
    test('Android: tam ekran izni yoksa eylemli uyarı, tam alarm izni yoksa düşüş uyarısı', () => {
        const n = alarmNotlariniOlustur({ platform: 'android', tamEkran: false, tamAlarm: false });
        expect(n.map((x) => x.eylem)).toEqual(['tamAlarm', 'tamEkranIzni']);
        expect(n.every((x) => x.tip === 'uyari')).toBe(true);
        // Kullanıcıya "sen" dili yok.
        for (const x of n) expect(x.metin).not.toMatch(/\b(sen|senin)\b/i);
    });
});

describe('seviye özeti', () => {
    test('alarm açık adımda "alarm" yüzü görünür', () => {
        expect(seviyeOzetiOlustur(adim(10, { bildirim: true, alarm: true }))).toBe('10 dk kala · bildirim · Uygulama sesi · alarm');
    });
});
