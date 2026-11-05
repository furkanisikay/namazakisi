import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Çoğul: one yalın tekil, few yalın çoğul, other ilgi çoğul ("10 maldų"), many kesirli ilgi tekil ("1,5 maldos"). */
export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Pažanga',
  kilma: {
    baslik: 'Atliktų maldų dalis',
    haftalik: 'Savaitės',
    aylik: 'Mėnesio',
    donemErisim: 'Atliktų maldų dalies laikotarpis',
    hesaplaniyor: 'Skaičiuojama atliktų maldų dalis',
    bosBaslik: 'Įrašų dar nėra',
    bosAciklama: 'Čia matysite, kai pradėsite žymėti maldas.',
    yuzde: '{n} %',
    kilinan: 'Atlikta',
    oran: 'Dalis',
    enIyiGun: 'Geriausia diena',
    haftaHedefi: 'Šios savaitės tikslas',
    hedefAlt: cogul({ one: 'Pagal serijos tikslą: {n} malda per dieną', few: 'Pagal serijos tikslą: {n} maldos per dieną', many: 'Pagal serijos tikslą: {n} maldos per dieną', other: 'Pagal serijos tikslą: {n} maldų per dieną' }),
    kilinanNamaz: 'Atliktos maldos',
    hedefeUlasan: 'Dienos, kai pasiektas tikslas',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Dienos su malda',
    vakitVakit: 'Pagal maldą',
    yuzdeErisim: '{ad}: {n} %',
  },
  rozetler: {
    baslik: 'Lygis ir ženkleliai',
    seviye: '{n} lygis',
    puan: 'Taškai',
    kalanErisim: cogul({ one: '{rank} lygis: liko {n} taškas', few: '{rank} lygis: liko {n} taškai', many: '{rank} lygis: liko {n} taško', other: '{rank} lygis: liko {n} taškų' }),
    enYuksek: 'Pasiekėte aukščiausią lygį',
    kalan: cogul({ one: '{rank}: liko {n} taškas', few: '{rank}: liko {n} taškai', many: '{rank}: liko {n} taško', other: '{rank}: liko {n} taškų' }),
    kilinanErisim: cogul({ one: 'Atlikta {n} malda', few: 'Atliktos {n} maldos', many: 'Atlikta {n} maldos', other: 'Atlikta {n} maldų' }),
    namaz: cogul({ one: 'malda', few: 'maldos', many: 'maldos', other: 'maldų' }),
    rozetErisim: 'Gauta ženklelių: {n} iš {toplam}',
    rozet: cogul({ one: 'ženklelis', few: 'ženkleliai', many: 'ženklelio', other: 'ženklelių' }),
  },
};
