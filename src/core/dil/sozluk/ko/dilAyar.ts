import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: '언어 · Language',
  aciklama: '앱 언어를 선택하세요. 알림과 소리 내어 읽기에도 사용됩니다.',
  grup: '앱 언어',
  dilAdlari: { tr: '튀르키예어', en: '영어', id: '인도네시아어', de: '독일어', fr: '프랑스어', bs: '보스니아어', ru: '러시아어', ms: '말레이어', ar: '아랍어', ur: '우르두어', es: '스페인어', nl: '네덜란드어', sq: '알바니아어', hi: '힌디어', bn: '벵골어', fa: '페르시아어', ps: '파슈토어', ckb: '소라니 쿠르드어', ug: '위구르어', az: '아제르바이잔어', uz: '우즈베크어', kk: '카자흐어', ky: '키르기스어', tg: '타지크어', sw: '스와힐리어', ha: '하우사어', am: '암하라어', om: '오로모어', so: '소말리아어', ff: '풀라어', yo: '요루바어', zh: '중국어(간체)', ta: '타밀어', ml: '말라얄람어', th: '태국어', ko: '한국어', vi: '베트남어' },
  cihazDili: '기기 언어',
  cihazDiliKullaniliyor: '현재 {ad}',
  cihazDiliDesteklenmiyor: '기기 언어는 아직 지원되지 않아 튀르키예어를 사용합니다.',
  beta: '베타',
  betaAciklama: '{ad} · 베타',
  notlar: {
    beta: '베타 번역은 검토 중이며 일부 문구가 정확하지 않을 수 있습니다.',
    vakit: '언어는 예배 시간 계산 방식을 바꾸지 않습니다.',
    nass: '튀르키예어 외의 언어에서는 꾸란 번역만 표시합니다. 하디스 본문은 튀르키예어 자료에서 가져오므로 표시하지 않습니다.',
  },
  ozelAnons: {
    baslik: '직접 작성한 소리 내어 읽기 문구',
    govde: cogul({
      other: '직접 작성한 소리 내어 읽기 문구 {n}개가 아직 이전 언어로 되어 있습니다. 새 언어의 기본 문구로 바꿀까요?',
    }),
    degistir: '기본 문구로 바꾸기',
    koru: '그대로 두기',
    degisti: cogul({ other: '문구 {n}개를 바꿨습니다.' }),
  },
  vakitAdlari: {
    baslik: '예배 이름',
    aciklama: '예배 시간을 부르는 이름을 선택하세요.',
    otomatik: '국가에 따라',
    otomatikAciklama: '현재 위치한 국가에서 흔히 쓰는 이름을 사용합니다.',
    takimlar: { temel: '아랍어 이름', diyanetDe: 'Diyanet(독일어)', turkce: '튀르키예어 이름', magrip: '마그레브식 표기', cezayir: '알제리식 표기', afgan: '아프가니스탄 이름' },
  },
  yazi: {
    baslik: '문자',
    aciklama: '글을 쓸 문자를 선택하세요.',
    otomatik: '국가에 따라',
    otomatikAciklama: '현재 위치한 국가에서 흔히 쓰는 문자를 사용합니다.',
    latin: '라틴 문자',
    kiril: '키릴 문자',
  },
  kaydedilemedi: '언어를 저장할 수 없습니다. 다시 시도하세요.',
  sihirbazBaglantisi: '언어 · Language',
  sihirbazBaglantisiAciklama: '앱 언어 바꾸기',
};
