import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'វឌ្ឍនភាព',
  kilma: {
    baslik: 'អត្រាសឡាត',
    haftalik: 'ប្រចាំសប្ដាហ៍',
    aylik: 'ប្រចាំខែ',
    donemErisim: 'រយៈពេលនៃអត្រាសឡាត',
    hesaplaniyor: 'កំពុងគណនាអត្រាសឡាតរបស់អ្នក',
    bosBaslik: 'មិនទាន់មានកំណត់ត្រា',
    bosAciklama: 'នឹងបង្ហាញនៅទីនេះ នៅពេលអ្នកសម្គាល់សឡាតរបស់អ្នក។',
    yuzde: '{n}%',
    kilinan: 'បានសឡាត',
    oran: 'អត្រា',
    enIyiGun: 'ថ្ងៃល្អបំផុត',
    haftaHedefi: 'គោលដៅសប្ដាហ៍នេះ',
    hedefAlt: cogul({ other: 'ផ្អែកលើគោលដៅនិរន្តរភាព៖ {n} ពេលក្នុងមួយថ្ងៃ' }),
    kilinanNamaz: 'សឡាតដែលបានធ្វើ',
    hedefeUlasan: 'ថ្ងៃដែលដល់គោលដៅ',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'ថ្ងៃដែលបានសឡាត',
    vakitVakit: 'តាមពេលសឡាត',
    yuzdeErisim: '{ad}៖ {n} ភាគរយ',
  },
  rozetler: {
    baslik: 'កម្រិត និងផ្លាកសញ្ញា',
    seviye: 'កម្រិត {n}',
    puan: 'ពិន្ទុ',
    kalanErisim: cogul({ other: 'នៅសល់ {n} ពិន្ទុទៀតដល់កម្រិត{rank}' }),
    enYuksek: 'អ្នកនៅកម្រិតខ្ពស់បំផុត',
    kalan: cogul({ other: '{n} ពិន្ទុទៀតដល់{rank}' }),
    kilinanErisim: cogul({ other: 'បានសឡាត {n} ពេល' }),
    namaz: cogul({ other: 'សឡាត' }),
    rozetErisim: 'ទទួលបានផ្លាកសញ្ញា {n} ក្នុងចំណោម {toplam}',
    rozet: cogul({ other: 'ផ្លាកសញ្ញា' }),
  },
};
