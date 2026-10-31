import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ 예배 드렸어요', kazayaEkle: '보충 예배에 추가', inceleyin: '확인하기' },
  kanal: {
    genel: '일반 알림',
    muhafiz: '예배 지킴이',
    muhafizAciklama: '예배 시간 알림',
    acil: '긴급 예배 알림',
    acilAciklama: '예배 시간이 곧 끝납니다 - 긴급 알림',
    vakit: '예배 시간',
    vakitAciklama: '예배 시간이 시작될 때 보내는 알림',
    muhafizSes: '예배 지킴이 · {ses}',
    acilSes: '긴급 알림 · {ses}',
    acilSesAciklama: '예배 시간이 곧 끝납니다 — 긴급 알림',
    titresimli: '{kanal} · 진동',
    alarm: '예배 알람',
    alarmSes: '예배 알람 · {ses}',
    uygulamaSesi: '앱 소리',
    seciliSes: '선택한 소리',
  },
  cuma: {
    baslik: '금요예배 · {sure} 남음 · 예배가 가까워졌습니다',
    govdeIlk: '정오 예배까지 {sure} 남았습니다. 준비하고 성원으로 가세요.',
    govde: '정오 예배까지 {sure} 남았습니다. 성원으로 가세요.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · 아잔까지 {dk}분 · 성원 갈 준비를 하세요',
    hazirlanGovde: '성원에서 {ad} 예배를 드리도록 준비하세요. {sonra}분 뒤에 출발하세요. 아잔까지 {dk}분 남았습니다.',
    yolaCikBaslik: '{ad} · 아잔까지 {dk}분 · 성원으로 가세요',
    yolaCikGovde: '{ad} 예배에 맞춰 성원으로 가세요. 아잔까지 {dk}분 남았습니다.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ other: '캘린더의 연이은 일정 {n}개' }),
    etkinlikBir: '캘린더의 일정',
    sonAnIkindi: '오후 예배를 드리기 알맞은 마지막 때는 {saat}입니다(그 뒤는 예배를 삼가는 시간)',
    sonAnVakit: '{kucuk} 예배 시간은 {saat}에 끝납니다',
    onceBaslik: '{ad} · {saat} 일정 · 먼저 예배를 드리세요',
    onceGovde: '{etkinlik}: {aralik}. {sonAn}. 일정이 시작되기 전에 {kucuk} 예배를 드리세요.',
    kaplarBaslik: '{ad} · 일정이 예배 시간과 겹칩니다',
    kaplarGovde:
      '{etkinlik}: {aralik}, {kucuk} 예배 시간({giris}–{son})과 겹칩니다. 잠시 멈추고 {kucuk} 예배를 드릴 계획을 지금 세우세요.',
  },
  yatis: {
    yatsiBaslik: '{ad} · 잠들기 전에 예배를 드리세요 🌙',
    yatsiGovde: '아직 {ad} 예배 시간입니다. 잠들기 전에 예배하러 일어서세요.',
    ozet: '오늘 {kilinan}/5 · {liste} 미표시',
    tekOto: '예배를 드렸다면 표시하세요. {oto}',
    tekKaza: '예배를 드렸다면 표시하고, 드리지 못했다면 보충 예배 기록에 추가하세요.',
    tekSuruyor: '예배를 드렸다면 표시하세요. 예배 시간이 아직 남아 있습니다.',
    cokluOto: '앱을 열어 드린 예배를 확인하고 표시하세요. {oto}',
    coklu: '앱을 열어 드린 예배를 확인하고 표시하세요.',
    otoSor: '표시하지 않으면 보충 예배 기록에서 이날에 대해 묻습니다.',
    otoEkle: '표시하지 않으면 예배일이 끝날 때 보충 예배에 추가됩니다.',
  },
  gunSonu: {
    baslik: '오늘 예배를 다 표시하지 않았습니다 · 연속 기록',
    govde: '하루가 끝나기 전에 드린 예배를 표시하면 연속 기록이 이어집니다.',
  },
};
