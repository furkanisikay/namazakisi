import {
    IOS_SESSIZ_VARSAYILAN,
    iosSessizAdimiDegistir,
    iosSessizKurulumuNormalize,
    iosSessizOzeti,
} from '../iosSessizKurulum';

describe('iosSessizKurulum', () => {
    it('bozuk kayıt varsayılana düşer', () => {
        expect(iosSessizKurulumuNormalize(null)).toEqual(IOS_SESSIZ_VARSAYILAN);
        expect(iosSessizKurulumuNormalize('x')).toEqual(IOS_SESSIZ_VARSAYILAN);
        expect(iosSessizKurulumuNormalize({ tamam: ['vakit', 'yok', 'odak'], dakika: 999 })).toEqual({
            tamam: ['odak', 'vakit'],
            dakika: 120,
        });
    });

    it('adım aç/kapa sırayı korur', () => {
        const a = iosSessizAdimiDegistir(IOS_SESSIZ_VARSAYILAN, 'vakit');
        const b = iosSessizAdimiDegistir(a, 'odak');
        expect(b.tamam).toEqual(['odak', 'vakit']);
        expect(iosSessizAdimiDegistir(b, 'vakit').tamam).toEqual(['odak']);
    });

    it('özet', () => {
        expect(iosSessizOzeti(IOS_SESSIZ_VARSAYILAN)).toBe('Odak ile kurun');
        expect(iosSessizOzeti({ tamam: ['odak'], dakika: 20 })).toBe('1/3 adım tamam');
        expect(iosSessizOzeti({ tamam: ['odak', 'cami', 'vakit'], dakika: 20 })).toBe('Odak ile kuruldu');
    });
});
