import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'ฎุฮา', evvabin: 'เอาวาบีน', teheccud: 'ตะฮัจญุด' },
  kucuk: { kusluk: 'ฎุฮา', evvabin: 'เอาวาบีน', teheccud: 'ตะฮัจญุด' },
  aciklamalar: {
    kusluk:
      'เริ่มประมาณ 45 นาทีหลังซูรูกและดำเนินไปจนถึง 10 นาทีก่อนดุฮ์ริ ช่วงแรกสุดคืออิชร็อก ช่วงที่ประเสริฐที่สุดคือหลังจากผ่านไปหนึ่งในสี่ของวัน',
    evvabin: 'ละหมาดหลังมักริบจนถึงเวลาอีซา',
    teheccud: 'ละหมาดหลังจากนอนแล้วตื่นขึ้นหลังอีซา จนถึงเวลาซุบฮ์ ช่วงที่ประเสริฐที่สุดคือหนึ่งในสามสุดท้ายของคืน',
  },
  bilgiBugun: '{aciklama}\n\nวันนี้: {bas} – {son}',
  enFaziletli: ' · ประเสริฐที่สุดหลัง {saat}',
  sonUcteBir: ' · หนึ่งในสามสุดท้าย {saat}',
  durumAktif: 'เข้าเวลาแล้ว · สิ้นสุด {saat}',
  durumNafile: 'สุนัต · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'เวลาฎุฮา',
    kuslukSuruyor: 'อยู่ในเวลาฎุฮา ละหมาดได้จนถึง {son}',
    kuslukGirdi: 'เข้าเวลาฎุฮาแล้ว เป็นช่วงที่ดีสำหรับละหมาดสองร็อกอะฮ์ ดำเนินไปจนถึง {son}',
    kuslukBitiyor: cogul({
      other: 'เวลาฎุฮาเหลืออีก {n} นาที เป็นช่วงที่ดีสำหรับละหมาดสองร็อกอะฮ์ ดำเนินไปจนถึง {son}',
    }),
    evvabinBaslik: 'เอาวาบีน',
    evvabinSuruyor: 'ยังมีเวลาสำหรับเอาวาบีน อีซาเข้าเวลา {son}',
    evvabinGirdi: 'หลังมักริบ เป็นช่วงที่ดีสำหรับเอาวาบีน อีซาเข้าเวลา {son}',
    evvabinKalan: cogul({ other: 'เวลาเอาวาบีนเหลืออีก {n} นาที อีซาเข้าเวลา {son}' }),
    teheccudBaslik: 'เวลาตะฮัจญุด',
    uyandirSonUcte: 'ตื่นเถิด หนึ่งในสามสุดท้ายของคืนเริ่มแล้ว ซุบฮ์เข้าเวลา {son}',
    uyandirKalan: cogul({ other: 'ตื่นเถิด อีก {n} นาทีจะถึงซุบฮ์ ซุบฮ์เข้าเวลา {son}' }),
    sonUcteBaslik: 'หนึ่งในสามสุดท้ายของคืน',
    sonUcteGovde: 'ช่วงเวลาที่จำเริญที่สุดสำหรับตะฮัจญุด ซุบฮ์เข้าเวลา {son}',
    teheccudKalan: cogul({ other: 'อีก {n} นาทีจะถึงซุบฮ์ เป็นเวลาที่ดีสำหรับตะฮัจญุด' }),
  },
  uyandirmaKanali: 'ปลุกละหมาดตะฮัจญุด',
  uyandirmaKanaliAciklama: 'ปลุกคุณเพื่อละหมาดกลางคืน ดังแม้อยู่ในโหมดเงียบ',
};
