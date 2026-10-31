import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Tôi đã hành lễ', kazayaEkle: 'Thêm vào Salah bù', inceleyin: 'Xem lại' },
  kanal: {
    genel: 'Thông báo chung',
    muhafiz: 'Bảo vệ Salah',
    muhafizAciklama: 'Lời nhắc giờ Salah',
    acil: 'Lời nhắc Salah khẩn',
    acilAciklama: 'Giờ Salah sắp kết thúc - lời nhắc khẩn',
    vakit: 'Giờ Salah',
    vakitAciklama: 'Lời nhắc gửi khi giờ Salah bắt đầu',
    muhafizSes: 'Bảo vệ Salah · {ses}',
    acilSes: 'Lời nhắc khẩn · {ses}',
    acilSesAciklama: 'Giờ Salah sắp kết thúc — lời nhắc khẩn',
    titresimli: '{kanal} · Rung',
    alarm: 'Báo thức Salah',
    alarmSes: 'Báo thức Salah · {ses}',
    uygulamaSesi: 'Âm thanh ứng dụng',
    seciliSes: 'Âm thanh bạn đã chọn',
  },
  cuma: {
    baslik: 'Jumu’ah · còn {sure} · Salah sắp đến',
    govdeIlk: 'Còn {sure} nữa đến Zhuhr. Hãy chuẩn bị và đến Masjid.',
    govde: 'Còn {sure} nữa đến Zhuhr. Hãy đến Masjid.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} phút nữa Azan · chuẩn bị đi Masjid',
    hazirlanGovde: 'Hãy chuẩn bị để kịp {ad} tại Masjid; lên đường sau {sonra} phút — Azan sau {dk} phút.',
    yolaCikBaslik: '{ad} · {dk} phút nữa Azan · hãy đến Masjid',
    yolaCikGovde: 'Hãy đến Masjid để kịp {ad} — Azan sau {dk} phút.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ other: '{n} sự kiện liên tiếp trong lịch của bạn' }),
    etkinlikBir: 'Một sự kiện trong lịch của bạn',
    sonAnIkindi: 'thời điểm phù hợp cuối cùng cho ‘Asr là {saat} (sau đó là thời điểm cấm)',
    sonAnVakit: 'giờ {kucuk} kết thúc lúc {saat}',
    onceBaslik: '{ad} · sự kiện lúc {saat} · hãy hành lễ trước',
    onceGovde: '{etkinlik} diễn ra {aralik}; {sonAn}. Hãy hành lễ {kucuk} trước khi sự kiện bắt đầu.',
    kaplarBaslik: '{ad} · một sự kiện trùng giờ Salah',
    kaplarGovde:
      '{etkinlik} diễn ra {aralik} và trùng giờ {kucuk} ({giris}–{son}). Hãy lên kế hoạch ngay để tạm nghỉ và hành lễ {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · hãy hành lễ trước khi ngủ 🌙',
    yatsiGovde: 'Vẫn đang trong giờ {ad}; hãy hành lễ trước khi ngủ.',
    ozet: 'Hôm nay {kilinan}/5 · {liste} chưa đánh dấu',
    tekOto: 'Nếu đã hành lễ, hãy đánh dấu. {oto}',
    tekKaza: 'Nếu đã hành lễ, hãy đánh dấu; nếu chưa thể, hãy thêm vào Sổ Salah bù.',
    tekSuruyor: 'Nếu đã hành lễ, hãy đánh dấu. Vẫn đang trong giờ Salah.',
    cokluOto: 'Mở ứng dụng để xem lại và đánh dấu các lần Salah bạn đã hành lễ. {oto}',
    coklu: 'Mở ứng dụng để xem lại và đánh dấu các lần Salah bạn đã hành lễ.',
    otoSor: 'Nếu bạn không đánh dấu, Sổ Salah bù sẽ hỏi bạn về ngày này.',
    otoEkle: 'Nếu bạn không đánh dấu, chúng sẽ được thêm vào Salah bù khi ngày Salah kết thúc.',
  },
  gunSonu: {
    baslik: 'Hôm nay chưa đủ · chuỗi ngày',
    govde: 'Nếu bạn đánh dấu các lần Salah đã hành lễ trước khi ngày kết thúc, chuỗi ngày sẽ tiếp tục.',
  },
};
