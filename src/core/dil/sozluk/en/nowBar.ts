import type { Sozluk } from '../tr';

export const nowBar: Sozluk['nowBar'] = {
  adlar: { iftar: 'Iftar', sahur: 'Suhoor', seri: 'Streak' },
  aciklama: {
    imsak: 'Time left until sunrise',
    cikis: 'Time left until the prayer time ends',
    imsaka: 'Time left until Fajr',
    iftar: 'Time left until the Maghrib adhan',
    cuma: 'Time left until the khutbah',
    kusluk: 'Time left until it ends',
    evvabin: 'Time left until Isha',
    seri: 'Time left until the end of the day',
  },
  etiket: {
    sayacla: 'With countdown',
    girince: 'When it begins',
    sonDk: 'Last minutes',
    imsaktan: 'From Fajr',
    yatsidan: 'From Isha',
    gunesDogunca: 'At sunrise',
    sonUcteGirince: 'At the last third',
    son2Saat: 'In the last 2 hours',
  },
  gereksinim: {
    vakit: '"With countdown" depends on the prayer countdown (Notifications > Prayer countdown); no countdown appears for prayers the Guardian reminds you about. To always see it, choose "When it begins" or "Last minutes".',
    iftar: 'Works while the iftar countdown is on (Ramadan only).',
    sahur: 'Works while the suhoor countdown is on (Ramadan only).',
    seri: 'Works while the end-of-day reminder is on and the day is incomplete.',
  },
  muhafizNotu:
    'Since the Prayer Guardian reminds you about this prayer, no separate countdown notification appears; the countdown shows only as the featured countdown when it starts.',
  kapaliNotu: 'Prayer countdown is off; prayers set to "With countdown" start when the prayer time begins.',
  politika: "Google doesn't recommend always-on cards; your phone may withdraw the featured countdown.",
};
