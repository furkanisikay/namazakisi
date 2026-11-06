import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Trên điện thoại',
    telefonAciklama: 'Báo thức Fajr và đánh thức Tahajjud đổ chuông trên điện thoại của bạn.',
    saatBaslik: 'Trên đồng hồ, không tiếng',
    saatAciklama:
      'Chỉ cổ tay bạn rung, nên người ngủ bên cạnh không bị đánh thức. Nếu bạn không tắt trên đồng hồ, điện thoại sẽ đổ chuông dự phòng sau {dk} phút. Nếu đồng hồ chưa có Namaz Akışı hoặc chưa được cập nhật, điện thoại sẽ đổ chuông trễ {dk} phút mỗi sáng.',
    saatAciklamaIos:
      'Chỉ cổ tay bạn rung, nên người ngủ bên cạnh không bị đánh thức. Nếu bạn không tắt trên đồng hồ, iPhone sẽ đổ chuông dự phòng sau {dk} phút.',
    ikisiBaslik: 'Trên cả hai',
    ikisiAciklama: 'Đồng hồ và điện thoại đổ chuông cùng lúc; tắt trên đồng hồ cũng tắt tiếng điện thoại.',
    ikisiAciklamaIos: 'Đồng hồ và iPhone đổ chuông cùng lúc; tắt trên đồng hồ cũng tắt tiếng iPhone.',
  },
  anons: {
    otomatikBaslik: 'Trên điện thoại, trên đồng hồ khi điện thoại ở xa',
    otomatikAciklama:
      'Khi điện thoại ở bên bạn, điện thoại đọc to và đồng hồ cố ý im lặng (để hai thiết bị không đọc cùng một câu). Khi điện thoại ở xa, đồng hồ sẽ đọc to.',
    saatBaslik: 'Chỉ trên đồng hồ',
    saatAciklama:
      'Đồng hồ luôn đọc to và điện thoại im lặng. Khi đồng hồ đang sạc, không kết nối với điện thoại hoặc không có Namaz Akışı, sẽ không có gì được đọc to; nếu không muốn vậy, hãy dùng lựa chọn đầu tiên.',
    telefonBaslik: 'Chỉ trên điện thoại',
    telefonAciklama: 'Đồng hồ không bao giờ phát tiếng.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Nếu Namaz Akışı được cài trên Apple Watch, đồng hồ sẽ chia sẻ công việc với iPhone. Tại đây bạn chọn nơi đổ chuông đánh thức.',
    giris:
      'Nếu Namaz Akışı được cài trên đồng hồ, đồng hồ sẽ chia sẻ công việc với điện thoại. Tại đây bạn chọn nơi đổ chuông đánh thức và nơi đọc to thông báo.',
    uyandirmaBaslik: 'Đánh thức đổ chuông ở đâu?',
    uyandirmaNotu:
      'Đánh thức là báo thức thật bạn bật cho Fajr trong lời nhắc “Trước khi hết giờ” và đánh thức Tahajjud bạn bật trong Salah tự nguyện.',
    uyandirmaNotuIos:
      'watchOS chỉ đặt được báo thức im lặng khi ứng dụng trên đồng hồ đang mở: mỗi ngày hãy mở Namaz Akışı trên đồng hồ một lần và lần đánh thức tiếp theo sẽ được đặt lúc đó. Khi đồng hồ đang sạc hoặc ứng dụng chưa được mở, iPhone sẽ đổ chuông dự phòng.',
    uyandirmaNotuAndroid: 'Đồng hồ không đổ chuông khi đang sạc; điện thoại sẽ đổ chuông thay.',
    muhafizAyarlari: 'Mở cài đặt “Trước khi hết giờ”',
    nafileAyarlari: 'Mở cài đặt Salah tự nguyện',
    bilektenBaslik: 'Những gì bạn làm được từ cổ tay',
    bilektenIos: [
      'Khi iPhone ở xa, lời nhắc đổ chuông trên đồng hồ; không đổ chuông trên cả hai.',
      'Bạn đánh dấu các lần Salah đã hành lễ từ cổ tay; iPhone sẽ ghi lại.',
      'Bạn đếm Tasbih bằng Digital Crown và tìm Qiblah trên đồng hồ.',
    ],
    anonsBaslik: 'Đọc to ở đâu?',
    anonsNotu:
      'Chỉ những lời nhắc đã bật đọc to mới được đọc. Hai thiết bị không đọc cùng một câu. Đồng hồ cũng im lặng khi bạn ở Masjid hoặc khi Chế độ Salah đang bật. Nếu đồng hồ không có loa, công cụ chuyển văn bản thành giọng nói hoặc giọng đọc ở ngôn ngữ của ứng dụng, đồng hồ chỉ rung. Bạn có thể thử âm thanh của đồng hồ ngay bằng “Thử âm thanh” trong ứng dụng Namaz Akışı trên đồng hồ.',
    bilekten: [
      'Bạn có thể bật và tắt Chế độ Salah bằng nút trên đồng hồ (đến hết giờ Salah, tối đa 30 phút).',
      'Tại Masjid, đồng hồ hiển thị trạng thái; bạn trả lời “Đây không phải Masjid” và “Bạn đang ở Masjid?” từ cổ tay.',
      'Các màn hình không vừa đồng hồ (Sổ Salah bù, Tại Masjid, cài đặt) sẽ mở trên điện thoại bằng “Mở trên điện thoại”.',
    ],
    namazModuNotu: 'Để bật Chế độ Salah từ đồng hồ, trước hết hãy bật một lần trên điện thoại.',
    namazModuAyarlari: 'Mở cài đặt Chế độ Salah',
  },
  sayfa: {
    akilliSaat: 'Đồng hồ thông minh',
    appleWatchOzet: 'Nơi đổ chuông đánh thức',
    saatOzet: 'Nơi đổ chuông đánh thức và đọc to',
    canliEtkinlikler: 'Hoạt động trực tiếp',
    canliSayaclar: 'Đếm ngược trực tiếp',
    geriSayim: 'Đếm ngược',
    gelismisErisim: 'Nâng cao. Tự động hóa và ứng dụng đánh dấu Tôi đã hành lễ',
    gelismis: 'Nâng cao',
    otomasyonlar: 'Tự động hóa',
    otomasyonBaslik: 'Dùng với tự động hóa',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Ứng dụng đánh dấu Tôi đã hành lễ',
    kildimOzet: 'Các ứng dụng bạn đã cho phép',
  },
};
