#!/usr/bin/env node
/**
 * Emülatör sensör pozu (özellik hattı, `# hazirlik: kible-*`): kameralı kıble karesinde
 * telefon DİK ve tohum konumunun (İstanbul) kıblesine bakıyor olsun diye ivmeölçer ve
 * manyetometre değerleri.
 *
 * Kullanim: node scripts/kible-emulator-pozu.js <kible-kamera|kible-kalibrasyon>
 * Çıktı: "<ivme x:y:z> <manyetik x:y:z>" (adb emu sensor set biçimi; m/s², µT).
 *
 * Eksen sözleşmesi uygulamayla aynıdır (src/core/kible/cihazYonelimi.ts): x sağ, y üst kenar,
 * z ekrandan dışarı. İvmeölçer TEPKİ kuvvetini okur (düzken +z), yani yukarıyı gösterir.
 * Telefon tam dik tutulur (emülatörün varsayılan duruşu): füzyonlu yerçekimi sensörü
 * emülatörün kendi modelinden gelebilir; eğik poz verilirse ikisi çelişirdi.
 *
 * Manyetik yön = kıble (151,6°) − sapma (İstanbul ≈ +6°). Alan: yatay 26 µT kuzey, düşey
 * 39 µT aşağı. `kible-kalibrasyon`: alan 6 kat (≈ 280 µT) → uygulamanın "metal/mıknatıs
 * yakın" teşhisi (kalibrasyon rehberi) tetiklenir.
 */
const tur = process.argv[2] || 'kible-kamera';
const RAD = Math.PI / 180;
const psi = (151.6 - 6) * RAD; // manyetik bakış yönü
const olcek = tur === 'kible-kalibrasyon' ? 6 : 1;

// Dünya: x doğu, y kuzey, z yukarı. Dik telefon ψ'ye bakıyor: kamera (−z) = ileri f,
// üst kenar (y) = yukarı, sağ (x) = y × z.
const f = { x: Math.sin(psi), y: Math.cos(psi), z: 0 };
const yukari = { x: 0, y: 0, z: 1 };
const ez = { x: -f.x, y: -f.y, z: -f.z };
const ey = yukari;
const ex = { x: ey.y * ez.z - ey.z * ez.y, y: ey.z * ez.x - ey.x * ez.z, z: ey.x * ez.y - ey.y * ez.x };
const nokta = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cihazda = (v) => [nokta(v, ex), nokta(v, ey), nokta(v, ez)];

const ivme = cihazda({ x: 0, y: 0, z: 9.81 });
const alan = cihazda({ x: 0, y: 26 * olcek, z: -39 * olcek });
const bicim = (v) => v.map((s) => s.toFixed(3)).join(':');
process.stdout.write(`${bicim(ivme)} ${bicim(alan)}\n`);
