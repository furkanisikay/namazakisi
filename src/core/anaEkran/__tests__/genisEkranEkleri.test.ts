import { yarinVakitleriniHesapla } from '../genisEkranEkleri';
import { gunVakitleriniHesapla } from '../../nafile/gunVakitleri';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };

describe('genisEkranEkleri — yarının vakitleri', () => {
    it('gösterilen günün ERTESİ günüdür ve uygulamanın hesabıyla aynıdır', () => {
        const y = yarinVakitleriniHesapla(ISTANBUL, '2026-12-31')!;
        expect(y.tarihMetni).toBe('1 Ocak 2027');
        expect(y.satirlar.map((s) => s.ad)).toEqual(['İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı']);
        const v = gunVakitleriniHesapla(ISTANBUL, '2027-01-01');
        const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        expect(y.satirlar[2].saat).toBe(hhmm(v.ogle));
    });

    it('konum yoksa (ya da {0,0}) hiçbir şey üretmez', () => {
        expect(yarinVakitleriniHesapla(null, '2026-10-20')).toBeNull();
        expect(yarinVakitleriniHesapla({ lat: 0, lng: 0 }, '2026-10-20')).toBeNull();
    });
});
