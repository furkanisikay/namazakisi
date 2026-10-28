import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'پێشکەوتن',
  kilma: {
    baslik: 'ڕێژەی نوێژکردن',
    haftalik: 'ھەفتانە',
    aylik: 'مانگانە',
    donemErisim: 'ماوەی ڕێژەی نوێژکردن',
    hesaplaniyor: 'ڕێژەی نوێژکردنتان ھەژمار دەکرێت',
    bosBaslik: 'ھێشتا تۆمار نییە',
    bosAciklama: 'کاتێک نوێژەکانتان نیشانە دەکەن، لێرە دەردەکەوێت.',
    yuzde: '{n}%',
    kilinan: 'کراو',
    oran: 'ڕێژە',
    enIyiGun: 'باشترین ڕۆژ',
    haftaHedefi: 'ئامانجی ئەم ھەفتەیە',
    hedefAlt: cogul({ one: 'بەپێی ئامانجی زنجیرەکەتان: ڕۆژانە {n} نوێژ', other: 'بەپێی ئامانجی زنجیرەکەتان: ڕۆژانە {n} نوێژ' }),
    kilinanNamaz: 'نوێژی کراو',
    hedefeUlasan: 'ڕۆژی گەیشتن بە ئامانج',
    ayYil: '{ay}ی {yil}',
    namazKilinanGun: 'ڕۆژی نوێژکردن',
    vakitVakit: 'بەپێی نوێژ',
    yuzdeErisim: '{ad}: {n} لە سەد',
  },
  rozetler: {
    baslik: 'ئاست و مەدالیاکان',
    seviye: 'ئاستی {n}',
    puan: 'خاڵ',
    kalanErisim: cogul({ one: '{n} خاڵ ماوە بۆ ئاستی {rank}', other: '{n} خاڵ ماوە بۆ ئاستی {rank}' }),
    enYuksek: 'لە بەرزترین ئاستدان',
    kalan: cogul({ one: '{n} خاڵ ماوە بۆ {rank}', other: '{n} خاڵ ماوە بۆ {rank}' }),
    kilinanErisim: cogul({ one: '{n} نوێژ کراوە', other: '{n} نوێژ کراوە' }),
    namaz: cogul({ one: 'نوێژ', other: 'نوێژ' }),
    rozetErisim: '{n} لە {toplam} مەدالیا بەدەست ھاتووە',
    rozet: cogul({ one: 'مەدالیا', other: 'مەدالیا' }),
  },
};
