import ornek from '../../../../android/app/src/test/resources/teslim-sahipligi-ornekleri.json';
import {
    NATIVE_SAHIP,
    nativeSahipAdi,
    nativeSahipEslesir,
    onekSahipligi,
    sahipligiEslestir,
    gosterimGrubu,
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

    it('GÖÇ: kaldırılan Ertele artığı muhafız AÇIKKEN de muhafıza ait (planlama turu siler)', () => {
        const acik = sahipligiEslestir({ tur: 'muhafiz' });
        expect(acik('muhafiz_2026-10-13_vakit_ogle_ertele')).toBe(true);
        expect(acik('muhafiz_2026-10-13_vakit_yatsi_yatis')).toBe(false);
        expect(acik('muhafiz_2026-10-13_vakit_ogle_muhasebe')).toBe(false);
    });

    it('önekli sahiplik: boş önek hiçbir şeyle eşleşmez', () => {
        expect(sahipligiEslestir(onekSahipligi(''))('cuma_hatirlatma_x')).toBe(false);
        expect(sahipligiEslestir(onekSahipligi('cuma_hatirlatma_'))('cuma_hatirlatma_x')).toBe(true);
    });
});

describe('gosterimGrubu — bildirim merkezi gruplaması (plan §4.5)', () => {
    it('muhafız planı (ve eski erteleme artığı) vakit önekinde birleşir', () => {
        expect(gosterimGrubu('muhafiz_2026-10-13_vakit_yatsi_seviye_1_dk_45')).toBe('muhafiz_2026-10-13_vakit_yatsi');
        expect(gosterimGrubu('muhafiz_2026-10-13_vakit_yatsi_ertele')).toBe('muhafiz_2026-10-13_vakit_yatsi');
    });

    it('yatış/muhasebe KENDİ grubunda; tekrar eki soyulur, muhafız grubuna KARIŞMAZ', () => {
        const yatis = gosterimGrubu('muhafiz_2026-10-13_vakit_yatsi_yatis');
        expect(gosterimGrubu('muhafiz_2026-10-13_vakit_yatsi_yatis_20')).toBe(yatis);
        expect(yatis).not.toBe(gosterimGrubu('muhafiz_2026-10-13_vakit_yatsi_seviye_1_dk_45'));
        expect(gosterimGrubu('muhasebe_2026-10-13_10')).toBe(gosterimGrubu('muhasebe_2026-10-13'));
        expect(gosterimGrubu('muhafiz_2026-10-13_vakit_ogle_muhasebe_5')).toBe(gosterimGrubu('muhafiz_2026-10-13_vakit_ogle_muhasebe'));
    });

    it('gruplanmayanlar null', () => {
        expect(gosterimGrubu('cuma_hatirlatma_2026-10-16')).toBeNull();
        expect(gosterimGrubu('vakit_sayac_v2_2026-10-13_ogle')).toBeNull();
    });
});
