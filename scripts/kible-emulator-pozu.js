#!/usr/bin/env node
/**
 * Emülatör sensör pozu (özellik hattı, `# hazirlik: kible-*`): kameralı kıble karesinde
 * telefon DİK ve tohum konumunun (İstanbul) kıblesine bakıyor olsun diye ivmeölçer ve
 * manyetometre değerleri.
 *
 * Kullanim: node scripts/kible-emulator-pozu.js <kible-kamera[-<egim>]|kible-kalibrasyon>
 *   `kible-kamera-25`: kamera 25° aşağı bakar (yer düzlemi ekranda daha çok yer kaplar).
 * Çıktı: "<ivme x:y:z> <manyetik x:y:z>" (adb emu sensor set biçimi; m/s², µT).
 *
 * Eksen sözleşmesi uygulamayla aynıdır (src/core/kible/cihazYonelimi.ts): x sağ, y üst kenar,
 * z ekrandan dışarı. İvmeölçer TEPKİ kuvvetini okur (düzken +z), yani yukarıyı gösterir.
 * Eğik pozda füzyonlu yerçekimi (TYPE_GRAVITY) Android'in yazılım füzyonundan gelir ve
 * ezilen ivmeölçere birkaç saniyede oturur (jiroskop 0).
 *
 * Manyetik yön = kıble (151,6°) − sapma (İstanbul ≈ +6°). Alan: yatay 26 µT kuzey, düşey
 * 39 µT aşağı. `kible-kalibrasyon`: alan 6 kat (≈ 280 µT) → uygulamanın "metal/mıknatıs
 * yakın" teşhisi (kalibrasyon rehberi) tetiklenir.
 */
const tur = process.argv[2] || 'kible-kamera';
const RAD = Math.PI / 180;
const psi = (151.6 - 6) * RAD; // manyetik bakış yönü
const olcek = tur === 'kible-kalibrasyon' ? 6 : 1;
const egimEslesme = /^kible-kamera-(\d+)$/.exec(tur);
const asagi = (egimEslesme ? Number(egimEslesme[1]) : 0) * RAD; // kameranın aşağı bakış açısı

// Dünya: x doğu, y kuzey, z yukarı. Dik telefon ψ'ye bakıyor: kamera (−z) = ileri f,
// üst kenar (y) = yukarı, sağ (x) = y × z.
const f = { x: Math.sin(psi), y: Math.cos(psi), z: 0 };
// Kamera (−z) = cos(p)·f − sin(p)·yukarı; üst kenar (y) = cos(p)·yukarı + sin(p)·f.
const ez = { x: -Math.cos(asagi) * f.x, y: -Math.cos(asagi) * f.y, z: Math.sin(asagi) };
const ey = { x: Math.sin(asagi) * f.x, y: Math.sin(asagi) * f.y, z: Math.cos(asagi) };
const ex = { x: ey.y * ez.z - ey.z * ez.y, y: ey.z * ez.x - ey.x * ez.z, z: ey.x * ez.y - ey.y * ez.x };
const nokta = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cihazda = (v) => [nokta(v, ex), nokta(v, ey), nokta(v, ez)];

const ivme = cihazda({ x: 0, y: 0, z: 9.81 });
const alan = cihazda({ x: 0, y: 26 * olcek, z: -39 * olcek });
const bicim = (v) => v.map((s) => s.toFixed(3)).join(':');
process.stdout.write(`${bicim(ivme)} ${bicim(alan)}\n`);
