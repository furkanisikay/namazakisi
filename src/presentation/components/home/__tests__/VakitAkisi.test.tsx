import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NamazAdi } from '../../../../core/constants/UygulamaSabitleri';
import { bugunuAl, dunuAl, ISOTarihiDateNesnesiNeCevir } from '../../../../core/utils/TarihYardimcisi';
import * as gunNavigasyon from '../../../../core/utils/gunNavigasyonYardimcisi';

// @expo/vector-icons'i sade string'e indir (render sırasında native font yüklemesini engeller)
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));

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
    // doğrudan kanıtlar. Eski kod `gunTarihi`'ni hiç kullanmıyordu.
    const dun = dunuAl();
    const dunDate = ISOTarihiDateNesnesiNeCevir(dun);
    const casus = jest.spyOn(gunNavigasyon, 'vakitGectiMi');

    render(
      <VakitAkisi
        {...varsayilanProps}
        namazlar={namazUret(dun, SAATLER)}
        suankiVakitAdi={NamazAdi.Yatsi}
        gunTarihi={dunDate}
      />
    );

    expect(casus).toHaveBeenCalled();
    for (const [, gecenGun] of casus.mock.calls) {
      expect(gecenGun).toBe(dunDate);
    }
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
        gunTarihi={ISOTarihiDateNesnesiNeCevir(dun)}
      />
    );

    // Yatsı DIŞINDAKİ dört vakit de tıklanabilmeli (bug'da hepsi disabled'dı).
    for (const ad of [NamazAdi.Sabah, NamazAdi.Ogle, NamazAdi.Ikindi, NamazAdi.Aksam]) {
      const satir = getByLabelText(`${ad} vakti, vakti bekleniyor`);
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
        gunTarihi={ISOTarihiDateNesnesiNeCevir(bugun)}
      />
    );

    const yatsi = getByLabelText(`${NamazAdi.Yatsi} vakti, vakit girmedi`);
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
        gunTarihi={ISOTarihiDateNesnesiNeCevir(dun)}
      />
    );

    fireEvent.press(getByLabelText(`${NamazAdi.Yatsi} vakti, vakti bekleniyor`));
    expect(onVakitTikla).toHaveBeenCalledWith(NamazAdi.Yatsi, true);
  });
});
