import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: '在手机上',
    telefonAciklama: '晨礼闹钟和夜间拜唤醒在您的手机上响铃。',
    saatBaslik: '在手表上静音',
    saatAciklama:
      '只有手腕振动，不会吵醒睡在您身边的人。如果您没有在手表上关闭，{dk}分钟后手机会作为备用响铃。如果您的手表上没有 Namaz Akışı 或版本不是最新，手机每天早上会晚{dk}分钟响铃。',
    saatAciklamaIos: '只有手腕振动，不会吵醒睡在您身边的人。如果您没有在手表上关闭，{dk}分钟后 iPhone 会作为备用响铃。',
    ikisiBaslik: '两者都响',
    ikisiAciklama: '手表和手机一起响铃；在手表上关闭也会让手机静音。',
    ikisiAciklamaIos: '手表和 iPhone 一起响铃；在手表上关闭也会让 iPhone 静音。',
  },
  anons: {
    otomatikBaslik: '在手机上，手机不在身边时在手表上',
    otomatikAciklama: '手机在您身边时，由手机朗读，手表有意保持安静（避免两台设备朗读同一句话）。手机不在身边时，由手表朗读。',
    saatBaslik: '仅在手表上',
    saatAciklama:
      '手表始终朗读，手机保持安静。手表充电、未连接手机或没有安装 Namaz Akışı 时，不会朗读任何内容；如果您不希望这样，使用第一个选项。',
    telefonBaslik: '仅在手机上',
    telefonAciklama: '手表从不发声。',
  },
  ayarlar: {
    secenekErisim: '{baslik}。{aciklama}',
    girisIos: '如果您的 Apple Watch 上安装了 Namaz Akışı，它会与 iPhone 分担工作。您可以在这里选择唤醒在哪里响铃。',
    giris: '如果您的手表上安装了 Namaz Akışı，它会与手机分担工作。您可以在这里选择唤醒在哪里响铃、提醒在哪里朗读。',
    uyandirmaBaslik: '唤醒应在哪里响铃？',
    uyandirmaNotu: '唤醒是指您在“时间结束前”提醒中为晨礼开启的真实闹钟，以及在副功拜中开启的夜间拜唤醒。',
    uyandirmaNotuIos:
      'watchOS 只能在手表应用打开时设置静音闹钟: 每天在手表上打开一次 Namaz Akışı，下一次唤醒就会在那时设置。手表充电时或未打开应用时，由 iPhone 的备用闹钟响铃。',
    uyandirmaNotuAndroid: '手表充电时不会响铃；改由手机响铃。',
    muhafizAyarlari: '打开“时间结束前”设置',
    nafileAyarlari: '打开副功拜设置',
    bilektenBaslik: '您可以在手腕上做什么',
    bilektenIos: [
      'iPhone 不在身边时，提醒在手表上响起；不会两处同时响起。',
      '您可以在手腕上标记已礼的拜；iPhone 会记录下来。',
      '您可以用数码表冠计数赞念，并在手表上找到礼拜朝向。',
    ],
    anonsBaslik: '应在哪里朗读？',
    anonsNotu:
      '只朗读开启了朗读的提醒。两台设备不会同时朗读同一句话。您在清真寺时或开启礼拜模式时，手表也会保持安静。如果手表没有扬声器、语音合成引擎或应用语言的语音，只会振动。您可以在 Namaz Akışı 手表应用中用“测试声音”立即测试手表的声音。',
    bilekten: [
      '您可以用手表上的按钮开启和关闭礼拜模式（直到礼拜时间结束，最长30分钟）。',
      '在清真寺时，手表会显示状态；您可以在手腕上回答“这里不是清真寺”和“您在清真寺吗？”。',
      '手表上放不下的页面（还补记录、在清真寺、设置）可以用“在手机上打开”在手机上打开。',
    ],
    namazModuNotu: '要从手表开启礼拜模式，先在手机上开启一次。',
    namazModuAyarlari: '打开礼拜模式设置',
  },
  sayfa: {
    akilliSaat: '智能手表',
    appleWatchOzet: '唤醒在哪里响铃',
    saatOzet: '唤醒在哪里响铃和朗读',
    canliEtkinlikler: '实时活动',
    canliSayaclar: '实时倒计时',
    geriSayim: '倒计时',
    gelismisErisim: '高级。可标记“我礼了”的自动化和应用',
    gelismis: '高级',
    otomasyonlar: '自动化',
    otomasyonBaslik: '与自动化一起使用',
    otomasyonOzet: 'Samsung Routines、Tasker、MacroDroid',
    kildimBaslik: '可标记“我礼了”的应用',
    kildimOzet: '您已允许的应用',
  },
};
