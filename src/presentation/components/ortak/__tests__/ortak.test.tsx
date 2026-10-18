import React from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (p: { name: string }) => <Text>{`ikon:${p.name}`}</Text>;
});
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        arkaplan: '#FAFAFA',
        kartArkaplan: '#FFFFFF',
        metin: '#212121',
        metinIkincil: '#757575',
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        birincilAcik: '#C8E6C9',
        birincilMetin: '#FFFFFF',
        basarili: '#4CAF50',
        bilgi: '#2196F3',
        dikkat: '#E65100',
        hata: '#F44336',
    }),
}));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
const mockKisa = jest.fn();
jest.mock('../../common/KisaBildirim', () => ({ kisaBildirimGoster: (...a: unknown[]) => mockKisa(...a) }));
const mockEylem = jest.fn(async (..._a: unknown[]) => true);
jest.mock('../../../../domain/services/DurumEylemleri', () => ({ durumEylemiUygula: (...a: unknown[]) => mockEylem(...a) }));

import { useDonanimGeriTusu } from '../../../hooks/useDonanimGeriTusu';
import {
    AnahtarSatiri,
    BolumBasligi,
    BosDurum,
    DurumRozeti,
    DurumSatiri,
    IkonCipi,
    KaydedildiIsareti,
    NotSatiri,
    RizaModali,
    SecenekListesi,
    Yukleniyor,
} from '..';

beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    mockKisa.mockReset();
    mockEylem.mockClear();
});
afterEach(() => jest.restoreAllMocks());

describe('BolumBasligi', () => {
    it('Türkçe büyük harf (i → İ) ve başlık rolü; ekran okuyucu normal metni okur', () => {
        const { getByText, getByRole } = render(<BolumBasligi metin="Bildirim sesi" />);
        expect(getByText('BİLDİRİM SESİ')).toBeTruthy();
        expect(getByRole('header').props.accessibilityLabel).toBe('Bildirim sesi');
    });
});

describe('NotSatiri ve IkonCipi', () => {
    it('tipe göre ikon; metin tek düğüm', () => {
        const { getByText, getByLabelText } = render(<NotSatiri tip="uyari" metin="Pil kısıtlı" />);
        expect(getByText('ikon:exclamation-triangle')).toBeTruthy();
        expect(getByLabelText('Pil kısıtlı')).toBeTruthy();
    });
    it('ikon çipi dekoratif', () => {
        const { toJSON } = render(<IkonCipi ikon="bell" boyut="buyuk" />);
        expect(JSON.stringify(toJSON())).toContain('"width":56');
    });
});

describe('AnahtarSatiri', () => {
    it('anahtar Touchable\'ın KARDEŞİ: metne basmak geçer, anahtar ayrı değişir', () => {
        const onPress = jest.fn();
        const onDegistir = jest.fn();
        const { getByRole, getByLabelText } = render(
            <AnahtarSatiri ikon="bell" kapaliIkon="bell-slash" baslik="Vakit bildirimi" ozet="5 vakit" deger={false} onDegistir={onDegistir} onPress={onPress} />,
        );
        fireEvent.press(getByLabelText('Vakit bildirimi. 5 vakit'));
        expect(onPress).toHaveBeenCalled();
        fireEvent(getByRole('switch'), 'valueChange', true);
        expect(onDegistir).toHaveBeenCalledWith(true);
    });
    it('kapalıyken -slash ikonu (renk tek başına durum taşımaz)', () => {
        const { getByText } = render(<AnahtarSatiri ikon="bell" kapaliIkon="bell-slash" baslik="B" deger={false} onDegistir={jest.fn()} />);
        expect(getByText('ikon:bell-slash', { includeHiddenElements: true })).toBeTruthy();
    });
});

describe('SecenekListesi', () => {
    const secenekler = [
        { deger: 'hafif', etiket: 'Hafif' },
        { deger: 'normal', etiket: 'Normal', aciklama: 'Önerilen' },
        { deger: 'canli', etiket: 'Canlı', kullanilamaz: true, kullanilamazNedeni: 'Bu telefonda yok' },
    ] as const;
    it('radyo grubu, seçim durumu ve seçme', () => {
        const onSec = jest.fn();
        const { getByLabelText, getAllByRole } = render(
            <SecenekListesi secenekler={secenekler} secili="hafif" onSec={onSec} erisimEtiketi="Düzey" />,
        );
        expect(getAllByRole('radio')[0].props.accessibilityState.selected).toBe(true);
        fireEvent.press(getByLabelText('Normal. Önerilen'));
        expect(onSec).toHaveBeenCalledWith('normal');
    });
    it('bu cihazda yok: seçilmez, kısa açıklama gösterilir', () => {
        const onSec = jest.fn();
        const { getByLabelText } = render(<SecenekListesi secenekler={secenekler} secili="hafif" onSec={onSec} erisimEtiketi="Düzey" gorunum="cip" />);
        fireEvent.press(getByLabelText('Canlı'));
        expect(onSec).not.toHaveBeenCalled();
        expect(mockKisa).toHaveBeenCalledWith('Bu telefonda yok', true);
    });
});

describe('DurumSatiri — üç hâl', () => {
    it('null → hiçbir şey çizilmez', () => {
        const { toJSON } = render(<DurumSatiri durum={null} />);
        expect(toJSON()).toBeNull();
    });
    it('düzeltilebilir → sebep + tek düğme; düğme eylemi uygular ve tazeler', async () => {
        const onSonra = jest.fn();
        const { getByText, getByLabelText } = render(
            <DurumSatiri durum={{ tip: 'uyari', metin: 'Tam saatinde alarm izni kapalı.', eylem: 'tamAlarm' }} onSonra={onSonra} />,
        );
        expect(getByText('Tam saatinde alarm izni kapalı.')).toBeTruthy();
        await act(async () => {
            fireEvent.press(getByLabelText('Açın'));
        });
        expect(mockEylem).toHaveBeenCalledWith('tamAlarm');
        expect(onSonra).toHaveBeenCalled();
    });
    it('bu cihazda yok → soluk, dokununca açıklama', () => {
        const { getByLabelText } = render(<DurumSatiri durum={{ yok: true, metin: 'Canlı sayaç yok', aciklama: 'Android 16 ile gelir' }} />);
        fireEvent.press(getByLabelText('Canlı sayaç yok. Android 16 ile gelir'));
        expect(mockKisa).toHaveBeenCalledWith('Android 16 ile gelir', true);
    });
});

describe('RizaModali', () => {
    it('geri tuşu = vazgeç; onay ayrı', () => {
        const onOnayla = jest.fn();
        const onVazgec = jest.fn();
        const { getByLabelText } = render(
            <RizaModali
                gorunur
                ikon="volume-up"
                baslik="Sesli okuma açılsın mı?"
                maddeler={[{ ikon: 'bell', metin: 'Bildirim de gelir' }]}
                onaylaEtiketi="Sesli okumayı açın"
                onOnayla={onOnayla}
                onVazgec={onVazgec}
            />,
        );
        expect((useDonanimGeriTusu as jest.Mock).mock.calls.at(-1)).toEqual([true, onVazgec]);
        fireEvent.press(getByLabelText('Sesli okumayı açın'));
        expect(onOnayla).toHaveBeenCalled();
        fireEvent.press(getByLabelText('Vazgeç'));
        expect(onVazgec).toHaveBeenCalled();
    });
});

describe('DurumRozeti, BosDurum, Yukleniyor, Kaydedildi', () => {
    it('rozet tek sözlükten', () => {
        const { getByText, getByLabelText } = render(<DurumRozeti durum="girmedi" />);
        expect(getByText('Henüz girmedi')).toBeTruthy();
        expect(getByLabelText('Henüz girmedi')).toBeTruthy();
    });
    it('boş durum: neden + tek düğme', () => {
        const onEylem = jest.fn();
        const { getByLabelText } = render(<BosDurum ikon="calendar" baslik="Henüz kayıt yok" eylemEtiketi="Ekleyin" onEylem={onEylem} />);
        fireEvent.press(getByLabelText('Ekleyin'));
        expect(onEylem).toHaveBeenCalled();
    });
    it('yükleniyor: gecikmeden önce flaş etmez', async () => {
        const { queryByLabelText } = render(<Yukleniyor metin="Konum alınıyor" gecikmeMs={30} />);
        expect(queryByLabelText('Konum alınıyor')).toBeNull();
        await waitFor(() => expect(queryByLabelText('Konum alınıyor')).toBeTruthy());
    });
    it('kaydedildi işareti dekoratif (duyuru kancadan)', () => {
        const { getByText } = render(<KaydedildiIsareti gorunur />);
        expect(getByText('Kaydedildi', { includeHiddenElements: true })).toBeTruthy();
    });
});

describe('platform bağımsız', () => {
    it('Android\'de de çizilir', () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        const { getByText } = render(<NotSatiri metin="x" />);
        expect(getByText('x')).toBeTruthy();
    });
});
