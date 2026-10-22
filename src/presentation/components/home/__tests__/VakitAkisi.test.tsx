import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { NamazAdi } from '../../../../core/constants/UygulamaSabitleri';
import { bugunuAl, dunuAl, ISOTarihiDateNesnesiNeCevir } from '../../../../core/utils/TarihYardimcisi';
import * as gunNavigasyon from '../../../../core/utils/gunNavigasyonYardimcisi';

// @expo/vector-icons'i sade string'e indir (render sırasında native font yüklemesini engeller)
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
// Kaynak alt yol import'u kullanır (denetim D-20) → kök mock'u alt yola da yansıt.
jest.mock('@expo/vector-icons/FontAwesome5', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').FontAwesome5 }));
jest.mock('@expo/vector-icons/MaterialIcons', () => ({ __esModule: true, default: jest.requireMock('@expo/vector-icons').MaterialIcons }));

jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    arkaplan: '#FAFAFA',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { basarili: '#4CAF50' },
  }),
}));

import { VakitAkisi } from '../VakitAkisi';

/**
 * Sabit tarih YAZILMAZ (AGENTS.md): bugunuAl()/dunuAl() kullanılır. Vakit saatleri
 * ise sabit — test edilen şey saatin hangi TAKVİM GÜNÜNE kurulduğu.
 */
const namazUret = (tarih: string, saatler: Record<string, string>) =>
  ([NamazAdi.Sabah, NamazAdi.Ogle, NamazAdi.Ikindi, NamazAdi.Aksam, NamazAdi.Yatsi] as const).map(
    (namazAdi) => ({ namazAdi, tamamlandi: false, tarih, saat: saatler[namazAdi] })
  );

const SAATLER: Record<string, string> = {
  [NamazAdi.Sabah]: '04:30',
  [NamazAdi.Ogle]: '13:15',
  [NamazAdi.Ikindi]: '17:05',
  [NamazAdi.Aksam]: '20:10',
  [NamazAdi.Yatsi]: '21:45',
};

describe('VakitAkisi Bileşeni', () => {
  const varsayilanProps = {
    tamamlananSayisi: 0,
    toplamSayi: 5,
    onVakitTikla: jest.fn(),
    aktifGunMu: true,
    kilitli: false,
  };

  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  it('NÖBETÇİ (gece yarısı — deterministik): "vakit geçti mi" hesabı GÖSTERİLEN günün tarihiyle yapılır', () => {
    // Aşağıdaki davranış testleri saatin ilerlemesiyle eski kodda da geçebilir
    // (bugünün 04:30'u öğleden sonra zaten geçmiştir). Bu test saatten BAĞIMSIZ:
    // hesabın `new Date()`in takvim gününe değil, gösterilen güne kurulduğunu
    // doğrudan kanıtlar. Eski kod gösterilen günü hiç kullanmıyordu.
    const dun = dunuAl();
    const dunDate = ISOTarihiDateNesnesiNeCevir(dun);
    const casus = jest.spyOn(gunNavigasyon, 'vakitGectiMi');

    render(
      <VakitAkisi
        {...varsayilanProps}
        namazlar={namazUret(dun, SAATLER)}
        suankiVakitAdi={NamazAdi.Yatsi}
        gunTarihiIso={dun}
      />
    );

    expect(casus).toHaveBeenCalled();
    for (const [, gecenGun] of casus.mock.calls) {
      // Prop ISO dizesi; içeride Date'e çevrilir → kimlik değil DEĞER eşitliği.
      // Değer eşitliği yine de doğru GÜNÜN geçtiğini kanıtlar (bugün ≠ dün).
      expect(gecenGun).toEqual(dunDate);
    }
  });

  it('NÖBETÇİ: aktif günde çıkmış ve kılınmamış vakit "Kılınmadı" der, "Vakti geldi" DEMEZ', () => {
    // Saat sahtelenmez: "giriş geçti mi" kararını doğrudan veriyoruz (deterministik).
    jest.spyOn(gunNavigasyon, 'vakitGectiMi').mockImplementation((saat: string) => saat <= '17:05');
    const { getByLabelText } = render(
      <VakitAkisi
        {...varsayilanProps}
        namazlar={namazUret(bugunuAl(), SAATLER)}
        suankiVakitAdi={NamazAdi.Ikindi}
        gunTarihiIso={bugunuAl()}
      />
    );
    expect(getByLabelText(`${NamazAdi.Sabah} vakti, 04:30, kılınmadı`)).toBeTruthy();
    expect(getByLabelText(`${NamazAdi.Ogle} vakti, 13:15, kılınmadı`)).toBeTruthy();
    expect(getByLabelText(`${NamazAdi.Ikindi} vakti, 17:05, vakti geldi`)).toBeTruthy();
    expect(getByLabelText(`${NamazAdi.Aksam} vakti, 20:10, henüz girmedi`)).toBeTruthy();
  });

  it('REGRESYON (gece yarısı): aktif gün DÜN iken dünün tüm vakitleri işaretlenebilir', () => {
    // Yaşanmış bug: gece yarısından sonra yatsı sürerken aktif gün dündür ve ekran
    // dünün saatlerini listeler. "Vakit geçti mi" hesabı saati BUGÜNÜN takvim gününe
    // kuruyordu → şu an örn. 00:30 iken dünün 04:30'u "gelecek" sanılıyor, satır
    // disabled oluyordu. Yalnız yatsı (aktif vakit) tıklanabiliyordu.
    //
    // NOT: bu testin gece yarısı ile SINIRLI olmaması için saatler bilerek geçmiş
    // seçilmedi — dünün tarihi verildiğinde 21:45 bile HER durumda geçmiştir.
    const dun = dunuAl();
    const onVakitTikla = jest.fn();

    const { getByLabelText } = render(
      <VakitAkisi
        {...varsayilanProps}
        onVakitTikla={onVakitTikla}
        namazlar={namazUret(dun, SAATLER)}
        // Aktif vakit yatsı (gece yarısından sonra motorun döndürdüğü vakit)
        suankiVakitAdi={NamazAdi.Yatsi}
        gunTarihiIso={dun}
      />
    );

    // Yatsı DIŞINDAKİ dört vakit de tıklanabilmeli (bug'da hepsi disabled'dı).
    for (const ad of [NamazAdi.Sabah, NamazAdi.Ogle, NamazAdi.Ikindi, NamazAdi.Aksam]) {
      const satir = getByLabelText(`${ad} vakti, ${SAATLER[ad]}, kılınmadı`);
      fireEvent.press(satir);
    }
    expect(onVakitTikla).toHaveBeenCalledTimes(4);
    expect(onVakitTikla).toHaveBeenCalledWith(NamazAdi.Sabah, true);
    expect(onVakitTikla).toHaveBeenCalledWith(NamazAdi.Aksam, true);
  });

  it('bugüne bakarken henüz girmemiş vakit PASİF kalır (kilit korunmalı)', () => {
    // Düzeltmenin kilidi tümden kaldırmadığının nöbetçisi: bugünün 23:59'u
    // (test ne zaman koşarsa koşsun) henüz girmemiştir → tıklanmamalı.
    const bugun = bugunuAl();
    const onVakitTikla = jest.fn();

    const { getByLabelText } = render(
      <VakitAkisi
        {...varsayilanProps}
        onVakitTikla={onVakitTikla}
        namazlar={namazUret(bugun, { ...SAATLER, [NamazAdi.Yatsi]: '23:59' })}
        suankiVakitAdi={NamazAdi.Sabah}
        gunTarihiIso={bugun}
      />
    );

    const yatsi = getByLabelText(`${NamazAdi.Yatsi} vakti, 23:59, henüz girmedi`);
    fireEvent.press(yatsi);
    expect(onVakitTikla).not.toHaveBeenCalled();
  });

  it('geçmiş güne bakarken (aktifGunMu=false) tüm vakitler işaretlenebilir', () => {
    const dun = dunuAl();
    const onVakitTikla = jest.fn();

    const { getByLabelText } = render(
      <VakitAkisi
        {...varsayilanProps}
        aktifGunMu={false}
        onVakitTikla={onVakitTikla}
        namazlar={namazUret(dun, { ...SAATLER, [NamazAdi.Yatsi]: '23:59' })}
        suankiVakitAdi=""
        gunTarihiIso={dun}
      />
    );

    fireEvent.press(getByLabelText(`${NamazAdi.Yatsi} vakti, 23:59, kılınmadı`));
    expect(onVakitTikla).toHaveBeenCalledWith(NamazAdi.Yatsi, true);
  });

  describe('zincir görünümü', () => {
    const YESIL = '#4CAF50';
    const GRI = '#E0E0E0';
    const renk = (el: ReactTestInstance) => (el.props.style as { backgroundColor: string }).backgroundColor;

    it('her satırda vaktin giriş saati yazar ve ekran okuyucu saati okur', () => {
      const dun = dunuAl();
      const { getByText, getByLabelText } = render(
        <VakitAkisi {...varsayilanProps} aktifGunMu={false} namazlar={namazUret(dun, SAATLER)}
          suankiVakitAdi="" gunTarihiIso={dun} />
      );
      for (const saat of Object.values(SAATLER)) {
        expect(getByText(saat)).toBeTruthy();
      }
      expect(getByLabelText(`${NamazAdi.Ogle} vakti, 13:15, kılınmadı`)).toBeTruthy();
    });

    it('saat bilinmiyorsa etikette boş virgül kalmaz', () => {
      const dun = dunuAl();
      const namazlar = namazUret(dun, { ...SAATLER, [NamazAdi.Sabah]: '' });
      const { getByLabelText } = render(
        <VakitAkisi {...varsayilanProps} aktifGunMu={false} namazlar={namazlar}
          suankiVakitAdi="" gunTarihiIso={dun} />
      );
      expect(getByLabelText(`${NamazAdi.Sabah} vakti, kılınmadı`)).toBeTruthy();
    });

    it('bağlantı yalnız kılınan vakitten ulaşılan vakte kadar dolar, iki yarısı aynı renktir', () => {
      const dun = dunuAl();
      // Sabah + Öğle kılındı, İkindi şu anki vakit, Akşam/Yatsı henüz gelmedi.
      const namazlar = namazUret(dun, SAATLER).map((n) => ({
        ...n,
        tamamlandi: n.namazAdi === NamazAdi.Sabah || n.namazAdi === NamazAdi.Ogle,
      }));
      const { getByTestId, queryByTestId } = render(
        <VakitAkisi {...varsayilanProps} aktifGunMu={false} namazlar={namazlar}
          suankiVakitAdi={NamazAdi.Ikindi} gunTarihiIso={dun} />
      );

      // Zincirin uçlarında dışarı taşan çizgi yok
      expect(queryByTestId(`baglanti-ust-${NamazAdi.Sabah}`)).toBeNull();
      expect(queryByTestId(`baglanti-alt-${NamazAdi.Yatsi}`)).toBeNull();

      // Sabah→Öğle ve Öğle→İkindi dolu (her iki yarı da)
      expect(renk(getByTestId(`baglanti-alt-${NamazAdi.Sabah}`))).toBe(YESIL);
      expect(renk(getByTestId(`baglanti-ust-${NamazAdi.Ogle}`))).toBe(YESIL);
      expect(renk(getByTestId(`baglanti-alt-${NamazAdi.Ogle}`))).toBe(YESIL);
      expect(renk(getByTestId(`baglanti-ust-${NamazAdi.Ikindi}`))).toBe(YESIL);
      // İkindi kılınmadı → sonrası gri
      expect(renk(getByTestId(`baglanti-alt-${NamazAdi.Ikindi}`))).toBe(GRI);
      expect(renk(getByTestId(`baglanti-ust-${NamazAdi.Aksam}`))).toBe(GRI);
    });

    it('arada kılınmamış vakit varsa zincir orada kopar', () => {
      const dun = dunuAl();
      // Sabah kılınmadı, Öğle kılındı: Sabah→Öğle bağlantısı dolmaz.
      const namazlar = namazUret(dun, SAATLER).map((n) => ({ ...n, tamamlandi: n.namazAdi === NamazAdi.Ogle }));
      const { getByTestId } = render(
        <VakitAkisi {...varsayilanProps} aktifGunMu={false} namazlar={namazlar}
          suankiVakitAdi="" gunTarihiIso={dun} />
      );
      expect(renk(getByTestId(`baglanti-alt-${NamazAdi.Sabah}`))).toBe(GRI);
      expect(renk(getByTestId(`baglanti-ust-${NamazAdi.Ogle}`))).toBe(GRI);
    });

    it('Güneş listede gösterilmez ve zinciri bölmez', () => {
      const dun = dunuAl();
      const namazlar = namazUret(dun, SAATLER).map((n) => ({ ...n, tamamlandi: true }));
      // Güneş'i Sabah ile Öğle arasına sok
      namazlar.splice(1, 0, { namazAdi: NamazAdi.Gunes as never, tamamlandi: false, tarih: dun, saat: '06:00' });
      const { queryByText, getByTestId } = render(
        <VakitAkisi {...varsayilanProps} aktifGunMu={false} namazlar={namazlar}
          suankiVakitAdi="" gunTarihiIso={dun} />
      );
      expect(queryByText('06:00')).toBeNull();
      expect(renk(getByTestId(`baglanti-alt-${NamazAdi.Sabah}`))).toBe(YESIL);
      expect(renk(getByTestId(`baglanti-ust-${NamazAdi.Ogle}`))).toBe(YESIL);
    });
  });

  describe('Nafile satırları (issue #77)', () => {
    const nafile = (tur: 'kusluk' | 'evvabin' | 'teheccud', ardindan: NamazAdi, durum: 'sirada' | 'aktif' | 'gecti') => ({
      tur,
      ad: { kusluk: 'Kuşluk', evvabin: 'Evvâbîn', teheccud: 'Teheccüd' }[tur],
      ikon: 'sun',
      ardindan,
      saat: { kusluk: '05:20', evvabin: '20:10', teheccud: '02:00' }[tur],
      durum,
      durumMetni: durum === 'aktif' ? 'Vakti girdi · bitiş 13:05' : 'Nafile · 05:20–13:05',
      bilgiBaslik: 'Bilgi',
      bilgiMetni: 'Açıklama',
    });
    const SATIRLAR = [
      nafile('kusluk', NamazAdi.Sabah, 'aktif'),
      nafile('evvabin', NamazAdi.Aksam, 'sirada'),
      nafile('teheccud', NamazAdi.Yatsi, 'sirada'),
    ];

    it('her nafile kendi farzının ARDINA girer (kronolojik sıra)', () => {
      const dun = dunuAl();
      const { UNSAFE_root } = render(
        <VakitAkisi {...varsayilanProps} aktifGunMu={false} namazlar={namazUret(dun, SAATLER)}
          suankiVakitAdi="" gunTarihiIso={dun} nafileSatirlari={SATIRLAR} />
      );
      const sira = UNSAFE_root.findAll(
        (n: ReactTestInstance) => typeof n.props.accessibilityLabel === 'string' && n.props.accessibilityRole === 'button' && typeof n.type !== 'string'
      ).map((n: ReactTestInstance) => (n.props.accessibilityLabel as string).split(/ vakti|, nafile/)[0]);
      const tekil = sira.filter((x: string, i: number) => sira.indexOf(x) === i);
      expect(tekil).toEqual([
        NamazAdi.Sabah, 'Kuşluk', NamazAdi.Ogle, NamazAdi.Ikindi, NamazAdi.Aksam, 'Evvâbîn', NamazAdi.Yatsi, 'Teheccüd',
      ]);
    });

    it('nafile satırı farz kaydını tetiklemez; dokununca ayrıntı açılır', () => {
      const dun = dunuAl();
      const onVakitTikla = jest.fn();
      const { getByTestId, getByText } = render(
        <VakitAkisi {...varsayilanProps} onVakitTikla={onVakitTikla} aktifGunMu={false}
          namazlar={namazUret(dun, SAATLER)} suankiVakitAdi="" gunTarihiIso={dun} nafileSatirlari={SATIRLAR} />
      );
      fireEvent.press(getByTestId('nafile-satir-kusluk'));
      expect(onVakitTikla).not.toHaveBeenCalled();
      expect(getByText('Açıklama')).toBeTruthy();
      expect(getByText('Vakti girdi · bitiş 13:05')).toBeTruthy();
    });

    it('teheccüd yatsının ardına girince yatsının alt çizgisi çizilir; nafile yoksa çizilmez', () => {
      const dun = dunuAl();
      const { getByTestId, rerender, queryByTestId } = render(
        <VakitAkisi {...varsayilanProps} aktifGunMu={false} namazlar={namazUret(dun, SAATLER)}
          suankiVakitAdi="" gunTarihiIso={dun} nafileSatirlari={SATIRLAR} />
      );
      expect(getByTestId(`baglanti-alt-${NamazAdi.Yatsi}`)).toBeTruthy();
      rerender(
        <VakitAkisi {...varsayilanProps} aktifGunMu={false} namazlar={namazUret(dun, SAATLER)}
          suankiVakitAdi="" gunTarihiIso={dun} />
      );
      expect(queryByTestId(`baglanti-alt-${NamazAdi.Yatsi}`)).toBeNull();
      expect(queryByTestId('nafile-satir-kusluk')).toBeNull();
    });
  });
});
