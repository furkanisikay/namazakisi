import { performance } from 'perf_hooks';

// Mocks to simulate React Native bridge latencies
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const notifeeMock = {
  getDisplayedNotifications: async () => {
    await delay(5);
    return Array.from({ length: 20 }, (_, i) => ({ id: `prefix_test_${i}` }));
  },
  cancelNotification: async (id: string) => {
    await delay(10); // simulate bridge latency
  },
  getTriggerNotificationIds: async () => {
    await delay(5);
    return Array.from({ length: 20 }, (_, i) => `prefix_test_trigger_${i}`);
  },
  cancelTriggerNotification: async (id: string) => {
    await delay(10); // simulate bridge latency
  }
};

const stopCountdownMock = (id: string) => {
  // synchronous native module call mock
};

class SayacBildirimTemeliOld {
  konfig = { idOneki: 'prefix_' };
  public async tumBildirimleriniTemizle(): Promise<void> {
    try {
      const gosterilenler = await notifeeMock.getDisplayedNotifications();
      for (const bildirim of gosterilenler) {
        if (bildirim.id && bildirim.id.startsWith(this.konfig.idOneki)) {
          try { stopCountdownMock(bildirim.id); } catch (_) { /* yok sayilabilir */ }
          await notifeeMock.cancelNotification(bildirim.id);
        }
      }

      const triggerIds = await notifeeMock.getTriggerNotificationIds();
      for (const id of triggerIds) {
        if (id.startsWith(this.konfig.idOneki)) {
          await notifeeMock.cancelTriggerNotification(id);
        }
      }
    } catch (_) { /* temizleme hatasi sessizce gecilir */ }
  }
}

class SayacBildirimTemeliNew {
  konfig = { idOneki: 'prefix_' };
  public async tumBildirimleriniTemizle(): Promise<void> {
    try {
      // Optimizasyon: Bildirim okuma islemlerini paralel yap
      const [gosterilenler, triggerIds] = await Promise.all([
        notifeeMock.getDisplayedNotifications().catch(() => []),
        notifeeMock.getTriggerNotificationIds().catch(() => [])
      ]);

      const iptalIslemleri: Promise<void>[] = [];

      for (const bildirim of gosterilenler as any[]) {
        if (bildirim && bildirim.id && bildirim.id.startsWith(this.konfig.idOneki)) {
          try { stopCountdownMock(bildirim.id); } catch (_) {}
          iptalIslemleri.push(notifeeMock.cancelNotification(bildirim.id).catch(() => {}));
        }
      }

      for (const id of triggerIds as string[]) {
        if (id && id.startsWith(this.konfig.idOneki)) {
          iptalIslemleri.push(notifeeMock.cancelTriggerNotification(id).catch(() => {}));
        }
      }

      // Tum iptal islemlerini paralel olarak gerceklestir
      await Promise.all(iptalIslemleri);
    } catch (_) { /* temizleme hatasi sessizce gecilir */ }
  }
}

async function runBenchmark() {
  const oldInstance = new SayacBildirimTemeliOld();
  const newInstance = new SayacBildirimTemeliNew();

  console.log("Measuring old (sequential) implementation...");
  const startOld = performance.now();
  await oldInstance.tumBildirimleriniTemizle();
  const endOld = performance.now();
  const oldTime = endOld - startOld;
  console.log(`Old time: ${oldTime.toFixed(2)} ms`);

  console.log("Measuring new (Promise.all) implementation...");
  const startNew = performance.now();
  await newInstance.tumBildirimleriniTemizle();
  const endNew = performance.now();
  const newTime = endNew - startNew;
  console.log(`New time: ${newTime.toFixed(2)} ms`);

  console.log(`\nImprovement: ${((oldTime - newTime) / oldTime * 100).toFixed(2)}% faster`);
}

runBenchmark();