import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'ප්‍රගතිය',
  kilma: {
    baslik: 'සලාත් ඉටු කිරීමේ අනුපාතය',
    haftalik: 'සතිපතා',
    aylik: 'මාසිකව',
    donemErisim: 'සලාත් අනුපාත කාල සීමාව',
    hesaplaniyor: 'ඔබගේ සලාත් අනුපාතය ගණනය කරමින්',
    bosBaslik: 'තවම වාර්තා නැත',
    bosAciklama: 'ඔබ සලාත් සලකුණු කරන විට මෙහි දිස් වේ.',
    yuzde: '{n}%',
    kilinan: 'ඉටු කළ',
    oran: 'අනුපාතය',
    enIyiGun: 'හොඳම දිනය',
    haftaHedefi: 'මෙම සතියේ ඉලක්කය',
    hedefAlt: cogul({ one: 'ඔබගේ අඛණ්ඩතා ඉලක්කය අනුව: දිනකට සලාත {n}', other: 'ඔබගේ අඛණ්ඩතා ඉලක්කය අනුව: දිනකට සලාත {n}' }),
    kilinanNamaz: 'ඉටු කළ සලාත',
    hedefeUlasan: 'ඉලක්කය සපුරා ගත් දින',
    ayYil: '{yil} {ay}',
    namazKilinanGun: 'සලාත් ඉටු කළ දින',
    vakitVakit: 'සලාතය අනුව',
    yuzdeErisim: '{ad}: සියයට {n}',
  },
  rozetler: {
    baslik: 'මට්ටම සහ ලාංඡන',
    seviye: 'මට්ටම {n}',
    puan: 'ලකුණු',
    kalanErisim: cogul({ one: '{rank} මට්ටමට ලකුණු {n}', other: '{rank} මට්ටමට ලකුණු {n}' }),
    enYuksek: 'ඔබ ඉහළම මට්ටමේ සිටී',
    kalan: cogul({ one: '{rank} දක්වා ලකුණු {n}', other: '{rank} දක්වා ලකුණු {n}' }),
    kilinanErisim: cogul({ one: 'ඉටු කළ සලාත {n}', other: 'ඉටු කළ සලාත {n}' }),
    namaz: cogul({ one: 'සලාතය', other: 'සලාත' }),
    rozetErisim: 'ලාංඡන {toplam}න් {n}ක් ලබා ඇත',
    rozet: cogul({ one: 'ලාංඡනය', other: 'ලාංඡන' }),
  },
};
