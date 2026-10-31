import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'ความก้าวหน้า',
  kilma: {
    baslik: 'อัตราการละหมาด',
    haftalik: 'รายสัปดาห์',
    aylik: 'รายเดือน',
    donemErisim: 'ช่วงเวลาของอัตราการละหมาด',
    hesaplaniyor: 'กำลังคำนวณอัตราการละหมาดของคุณ',
    bosBaslik: 'ยังไม่มีบันทึก',
    bosAciklama: 'จะปรากฏที่นี่เมื่อคุณทำเครื่องหมายการละหมาด',
    yuzde: '{n}%',
    kilinan: 'ละหมาดแล้ว',
    oran: 'อัตรา',
    enIyiGun: 'วันที่ดีที่สุด',
    haftaHedefi: 'เป้าหมายสัปดาห์นี้',
    hedefAlt: cogul({ other: 'อิงตามเป้าหมายความต่อเนื่อง: วันละ {n} เวลา' }),
    kilinanNamaz: 'ละหมาดที่ทำแล้ว',
    hedefeUlasan: 'วันที่ถึงเป้าหมาย',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'วันที่มีการละหมาด',
    vakitVakit: 'แยกตามเวลาละหมาด',
    yuzdeErisim: '{ad}: {n} เปอร์เซ็นต์',
  },
  rozetler: {
    baslik: 'ระดับและเหรียญตรา',
    seviye: 'ระดับ {n}',
    puan: 'คะแนน',
    kalanErisim: cogul({ other: 'อีก {n} คะแนนจะถึงระดับ{rank}' }),
    enYuksek: 'คุณอยู่ในระดับสูงสุดแล้ว',
    kalan: cogul({ other: 'อีก {n} คะแนนถึง{rank}' }),
    kilinanErisim: cogul({ other: 'ละหมาดแล้ว {n} เวลา' }),
    namaz: cogul({ other: 'เวลา' }),
    rozetErisim: 'ได้รับเหรียญตรา {n} จาก {toplam}',
    rozet: cogul({ other: 'เหรียญตรา' }),
  },
};
