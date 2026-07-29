/**
 * Tesbih — sıradaki rozet hedefine ilerlemeyi gösterir.
 *
 * Bu, projenin `src/` içindeki İLK `react-native-svg` kullanımıdır (bkz.
 * `.superpowers/sdd/2026-07-29-seri-faz1/global-constraints.md`). Bilerek en
 * küçük yüzeyde tutuldu: tek bir `Svg`, animasyon yok, gök paneli yok.
 *
 * Görsel referans BAĞLAYICIDIR:
 * `docs/tasarim/2026-07-29-seri-sekmesi-takimyildizi-referans.html` (`tesbihCiz`).
 * Üç öğe eksikse tesbih "tesbih" olarak okunmuyor (referans yorumu):
 *   1. İp, boncukların İÇİNDEN geçen TEK sürekli çizgidir (aralarına parça konmaz).
 *   2. Durak diskleri — ince dikey elipsler.
 *   3. İmame + püskül — imame ipin ucundaki HEDEFTİR (rozetin kendisi).
 *
 * Boncuk sayısı/durak aralığı kuralı referansta YOK, tasarım spec §1'de
 * kapatıldı (60/90 günlük hedefler 21 boncuklu şeride sığmaz):
 *   boncukSayisi = hedefGun === null ? 33 : min(hedefGun, 33)
 *   gunPerBoncuk = hedefGun === null ? 1 : ceil(hedefGun / boncukSayisi)
 *   durakAraligi = boncukSayisi > 21 ? 11 : 7
 */
import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Line, Ellipse, Circle, Rect } from 'react-native-svg';
import { useRenkler } from '../../../core/theme';
import { turkceIyelikEki } from '../../../core/utils/turkceSayiEki';

/** `hedefAdi` boş/eksik geldiğinde kullanılan yedek etiket (bkz. Task 4 incelemesi:
 * boş string " rozeti: ..." gibi bozuk bir etiket üretiyordu). */
const VARSAYILAN_HEDEF_ADI = 'Sıradaki hedef';

export interface TesbihProps {
  /** Mevcut kesintisiz seri (gün sayısı). */
  mevcutSeri: number;
  /**
   * Sıradaki rozet hedefi (gün) — `SeriHesaplayiciServisi.sonrakiHedefiBul`
   * çıktısı (7 | 21 | 60 | 90). Kullanıcı tüm rozetleri kazandıysa `null`.
   */
  hedefGun: number | null;
  /**
   * Sıradaki hedefin ekranda gösterilecek adı, sentence case
   * (ör. "Alışkanlık ustası"). `hedefGun` `null` iken kullanılmaz/verilmez.
   */
  hedefAdi?: string;
}

// ── Geometri sabitleri (referanstaki tesbihCiz'den BİREBİR) ─────────────────
const YUKSEKLIK = 30;
const CY = 13;
const BASLANGIC_X = 9;
const BONCUK_ARALIK = 10.4;
const BONCUK_YARICAP = 4.6;
const ISIK_NOKTASI_YARICAP = 1.4;
const ISIK_NOKTASI_OFSET_X = -1.5;
const ISIK_NOKTASI_OFSET_Y = -1.6;
const DURAK_ONCESI_BOSLUK = 0.6;
const DURAK_SONRASI_BOSLUK = 7.2;
const DURAK_RX = 1.8;
const DURAK_RY = 5.6;
const IMAME_BOSLUK = 5.5;
const IMAME_GOVDE_YARI_GENISLIK = 3.8;
const IMAME_GOVDE_YUKSEKLIK = 18;
const IMAME_GOVDE_RX = 3.8;
const IMAME_DUGME_YARICAP = 2;
const IMAME_DUGME_Y_OFSET = -11.5;
const VIEWBOX_SAG_PAY = 6;
const MAKS_BONCUK = 33; // geleneksel tesbih sayısı — üst sınır
const DURAK_ARALIGI_ESIGI = 21; // bu sayının USTUNDE durak her 11'de, ALTINDA/EŞİTİNDE her 7'de

interface TesbihGeometrisi {
  merkezler: number[];
  duraklar: number[];
  imameX: number;
}

/**
 * Boncuk ve durak merkezlerini hesaplar. Referanstaki döngüyle birebir aynı
 * mantık, yalnızca boncuk sayısı ve durak aralığı parametrik.
 */
function tesbihGeometrisiHesapla(boncukSayisi: number, durakAraligi: number): TesbihGeometrisi {
  const merkezler: number[] = [];
  const duraklar: number[] = [];
  let x = BASLANGIC_X;

  for (let i = 0; i < boncukSayisi; i++) {
    merkezler.push(x);
    x += BONCUK_ARALIK;

    const pozisyon = i + 1; // 1-tabanli sira
    const sonBoncukMu = i === boncukSayisi - 1;
    if (pozisyon % durakAraligi === 0 && !sonBoncukMu) {
      duraklar.push(x + DURAK_ONCESI_BOSLUK);
      x += DURAK_SONRASI_BOSLUK;
    }
  }

  return { merkezler, duraklar, imameX: x + IMAME_BOSLUK };
}

export const Tesbih: React.FC<TesbihProps> = ({ mevcutSeri, hedefGun, hedefAdi }) => {
  const renkler = useRenkler();

  const boncukSayisi = hedefGun === null ? MAKS_BONCUK : Math.min(hedefGun, MAKS_BONCUK);
  const gunPerBoncuk = hedefGun === null ? 1 : Math.ceil(hedefGun / boncukSayisi);
  const durakAraligi = boncukSayisi > DURAK_ARALIGI_ESIGI ? 11 : 7;
  const doluBoncukSayisi =
    hedefGun === null ? boncukSayisi : Math.min(boncukSayisi, Math.floor(mevcutSeri / gunPerBoncuk));

  const { merkezler, duraklar, imameX } = useMemo(
    () => tesbihGeometrisiHesapla(boncukSayisi, durakAraligi),
    [boncukSayisi, durakAraligi]
  );

  const genislik = imameX + VIEWBOX_SAG_PAY;

  // Boş/yalnız-boşluk hedefAdi de VARSAYILAN'a düşer — aksi halde " rozeti: ..."
  // gibi bozuk bir etiket üretilir (Task 4 incelemesinde yakalandı).
  const gosterilenHedefAdi = hedefAdi?.trim() ? hedefAdi.trim() : VARSAYILAN_HEDEF_ADI;

  const tamamlananSayisi = hedefGun === null ? 0 : Math.min(mevcutSeri, hedefGun);

  const altYazi =
    hedefGun === null
      ? 'Tüm rozetleri tamamladınız'
      : `${gosterilenHedefAdi} rozetine ${Math.max(0, hedefGun - mevcutSeri)} gün kaldı`;

  // Ek Türkçe ünlü uyumuna göre seçilir (turkceIyelikEki) — sabit "'i" eki
  // yalnızca "on beş" gibi okunuşlarda doğruydu; "3'ü", "40'ı", "20'si" gibi
  // durumlarda yanlış sonuç üretiyordu (Task 4 incelemesi).
  const erisimEtiketi =
    hedefGun === null
      ? 'Tüm rozetleri tamamladınız: tesbih tamamen dolu.'
      : `${gosterilenHedefAdi} rozeti: ${hedefGun} günün ${tamamlananSayisi}'${turkceIyelikEki(tamamlananSayisi)} tamamlandı.`;

  // TalkBack progressbar rolü için min/max/now bekler (accessibilityLabel
  // tek başına yeterli değil — inceleme bulgusu). hedefGun null iken (tüm
  // rozetler kazanılmış) tesbih tamamen dolu görünür: max/now boncukSayisi'na
  // eşitlenir; aksi halde erişim etiketiyle AYNI sayılar kullanılır
  // (max=hedefGun, now=tamamlananSayisi).
  const accessibilityMax = hedefGun === null ? boncukSayisi : hedefGun;
  const accessibilityNow = hedefGun === null ? boncukSayisi : tamamlananSayisi;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={erisimEtiketi}
      accessibilityValue={{ min: 0, max: accessibilityMax, now: accessibilityNow }}
    >
      <Svg width="100%" height={YUKSEKLIK} viewBox={`0 0 ${genislik} ${YUKSEKLIK}`}>
        {/* İp — boncukların İÇİNDEN geçen TEK sürekli hat */}
        <Line
          x1={4}
          y1={CY}
          x2={imameX + 1}
          y2={CY}
          stroke={renkler.metinIkincil}
          strokeWidth={1.1}
          opacity={0.45}
          strokeLinecap="round"
        />

        {/* Durak diskleri */}
        {duraklar.map((dx, i) => (
          <Ellipse
            key={`durak-${i}`}
            cx={dx}
            cy={CY}
            rx={DURAK_RX}
            ry={DURAK_RY}
            fill={renkler.metinIkincil}
            opacity={0.55}
          />
        ))}

        {/* Boncuklar — küre hissi icin govde + dolu olanlarda ust-sol isik noktasi */}
        {merkezler.map((cx, i) => {
          const dolu = i < doluBoncukSayisi;
          return (
            <React.Fragment key={`boncuk-${i}`}>
              <Circle
                cx={cx}
                cy={CY}
                r={BONCUK_YARICAP}
                fill={dolu ? renkler.birincil : 'none'}
                stroke={dolu ? renkler.birincil : renkler.metinIkincil}
                strokeWidth={dolu ? 0 : 1.1}
                opacity={dolu ? 1 : 0.4}
              />
              {dolu && (
                <Circle
                  cx={cx + ISIK_NOKTASI_OFSET_X}
                  cy={CY + ISIK_NOKTASI_OFSET_Y}
                  r={ISIK_NOKTASI_YARICAP}
                  fill={renkler.birincilMetin}
                  opacity={0.45}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* İmame + püskül — İMAME HEDEFTİR: ipin ucundaki varış noktası */}
        <Rect
          x={imameX - IMAME_GOVDE_YARI_GENISLIK}
          y={CY - IMAME_GOVDE_YUKSEKLIK / 2}
          width={IMAME_GOVDE_YARI_GENISLIK * 2}
          height={IMAME_GOVDE_YUKSEKLIK}
          rx={IMAME_GOVDE_RX}
          fill="none"
          stroke={renkler.metinIkincil}
          strokeWidth={1.5}
          opacity={0.65}
        />
        <Circle
          cx={imameX}
          cy={CY + IMAME_DUGME_Y_OFSET}
          r={IMAME_DUGME_YARICAP}
          fill="none"
          stroke={renkler.metinIkincil}
          strokeWidth={1.3}
          opacity={0.65}
        />
        {[-1, 0, 1].map((i) => (
          <Line
            key={`puskul-${i}`}
            x1={imameX + i * 1.6}
            y1={CY + 9}
            x2={imameX + i * 3}
            y2={CY + 15}
            stroke={renkler.metinIkincil}
            strokeWidth={1.1}
            opacity={0.5}
            strokeLinecap="round"
          />
        ))}
      </Svg>
      <Text style={{ fontSize: 11.5, color: renkler.metinIkincil, marginTop: 4 }}>{altYazi}</Text>
    </View>
  );
};
