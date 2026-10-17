import ornek from '../../../../android/app/src/test/resources/teslim-sahipligi-ornekleri.json';
import {
    NATIVE_SAHIP,
    nativeSahipAdi,
    nativeSahipEslesir,
    onekSahipligi,
    sahipligiEslestir,
} from '../teslimSahipligi';
import { yatisKimligiMi } from '../../yatis/yatisPlani';

describe('teslimSahipligi — Kotlin ikiziyle ortak örnek', () => {
    it.each(ornek.ornekler)('$kimlik', (o) => {
        expect(nativeSahipEslesir(NATIVE_SAHIP.MUHAFIZ_PLAN, o.kimlik)).toBe(o.muhafiz_plan);
        expect(nativeSahipEslesir(NATIVE_SAHIP.MUHAFIZ_TUMU, o.kimlik)).toBe(o.muhafiz_tumu);
        expect(nativeSahipEslesir(NATIVE_SAHIP.YATIS, o.kimlik)).toBe(o.yatis);
    });

    it('bilinmeyen sahip hiçbir şeyle eşleşmez', () => {
        expect(ornek.ornekler.some((o) => nativeSahipEslesir(ornek.bilinmeyenSahip, o.kimlik))).toBe(false);
    });

    it('yatış yüklemi yatış servisinin kendi yüklemiyle AYNI (tek kural)', () => {
        for (const o of ornek.ornekler) expect(yatisKimligiMi(o.kimlik)).toBe(o.yatis);
    });

    it('muhafız: açıkken plan, kapalıyken muhafız sahipli her şey (yatış HARİÇ)', () => {
        expect(nativeSahipAdi({ tur: 'muhafiz' })).toBe('muhafiz_plan');
        expect(nativeSahipAdi({ tur: 'muhafiz' }, false)).toBe('muhafiz_tumu');
        expect(nativeSahipAdi(onekSahipligi('nafile_'))).toBeNull();
        const kapali = sahipligiEslestir({ tur: 'muhafiz' }, false);
        expect(kapali('muhafiz_2026-10-13_vakit_ogle_ertele')).toBe(true);
        expect(kapali('muhafiz_2026-10-13_vakit_yatsi_yatis')).toBe(false);
    });

    it('önekli sahiplik: boş önek hiçbir şeyle eşleşmez', () => {
        expect(sahipligiEslestir(onekSahipligi(''))('cuma_hatirlatma_x')).toBe(false);
        expect(sahipligiEslestir(onekSahipligi('cuma_hatirlatma_'))('cuma_hatirlatma_x')).toBe(true);
    });
});
