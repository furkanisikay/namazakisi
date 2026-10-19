/**
 * Vakit Bildirim İçerikleri
 * Namaz vakti GİRDİĞİNDE gösterilecek teşvik edici ayet ve hadisler.
 *
 * KURALLAR (persona çalışması 2026-10-19 + AGENTS.md fıkıh kuralı):
 * • Vakit DAHA YENİ GİRDİ: ortada terk de gecikme de yok. "Terk eden… ameli boşa"
 *   ve "münafıklara en ağır gelen" gibi suçlayıcı nasslar bu kişiye YANLIŞ
 *   HEDEFTİR (namaza yeni başlayanı caydırıyordu) → havuza GİRMEZ. Ton TEŞVİK.
 * • Künye yalnız "Hadis-i Şerif" olamaz: kitap adı gerekir. Doğrulanmış künye
 *   `SeytanlaMucadeleIcerigi.ts` ile ortaktır (aynı nass iki havuzda aynı künye).
 *   Doğrulanamayan maddeler ÇIKARILDI (yanlış oldukları değil, künyeleri
 *   doğrulanamadığı için): "Kim öğle namazını devamlı kılarsa… Cehennem ateşini
 *   haram kılar" (bilinen rivayet öğlenin SÜNNETLERİ hakkındadır), "Melekler
 *   ikindi vakti toplanır…", "Namaz dinin direğidir".
 * • Vakte özgü nass yalnız kendi vaktinin listesinde.
 * Nöbetçi: `__tests__/VakitBildirimIcerikleri.test.ts` (yasaklı ifade + künye).
 */

export type VakitBildirimIcerigi = {
    metin: string;
    kaynak?: string;
};

// Vakit tipleri (Güneş hariç)
export type VakitBildirimTipi = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

const BERDEYN: VakitBildirimIcerigi = {
    metin: 'İki serinliği — sabahı ve ikindiyi — kılan cennete girer.',
    kaynak: "Buhârî, Mevâkîtü's-salât 26; Müslim, Mesâcid 215",
};

export const VAKIT_BILDIRIM_ICERIKLERI: Record<VakitBildirimTipi, VakitBildirimIcerigi[]> = {
    imsak: [
        { metin: "Sabah namazını kılan, Allah'ın koruması altındadır.", kaynak: 'Müslim, Mesâcid 262' },
        { metin: "Sizi gece ve gündüz ardarda takip eden melekler vardır. Sabah ve İkindi namazında toplanırlar.", kaynak: "Hadis-i Şerif (Buhari)" },
        BERDEYN,
        { metin: "Sabah namazının iki rekat sünneti, dünyadan ve dünyadaki her şeyden daha hayırlıdır.", kaynak: "Hadis-i Şerif (Müslim)" },
        { metin: "Namaz uykudan hayırlıdır. Haydi kurtuluşa!", kaynak: "" },
    ],
    ogle: [
        { metin: "Ey iman edenler! Sabır ve namaz ile Allah'tan yardım isteyin.", kaynak: "Bakara Suresi, 153. Ayet" },
        { metin: "Namazı dosdoğru kılın. Çünkü namaz, müminler üzerine vakitleri belirli bir farzdır.", kaynak: "Nisa Suresi, 103. Ayet" },
        { metin: "Gök kapıları öğle vaktinde açılır. O saatte hayırlı bir amelimin yükselmesini isterim.", kaynak: "Hadis-i Şerif (Tirmizi)" },
        { metin: "Dünya işlerine kısa bir ara ver, Rabbinin huzuruna dur.", kaynak: "" },
    ],
    ikindi: [
        { metin: "Orta namaza (ikindi namazına) ve diğer namazlara devam edin.", kaynak: "Bakara Suresi, 238. Ayet" },
        BERDEYN,
        { metin: "Günün yorgunluğunu atmak ve huzur bulmak için İkindi namazı seni bekliyor.", kaynak: "" },
    ],
    aksam: [
        { metin: "Akşam namazı, günün şükrüdür. Rabbinin huzuruna varmakta acele et.", kaynak: "" },
        { metin: "Kıyamet günü kulun ilk hesaba çekileceği şey namazdır.", kaynak: "Hadis-i Şerif (Tirmizi)" },
        // Eskiden "Vakit girmeden hazır ol" diyordu — vakit girdikten SONRA gönderiliyordu.
        { metin: "Akşamın vakti kısadır; vakit girdi, geciktirmeden kıl.", kaynak: "" },
        { metin: "Allah'ı anmak, elbette en büyük ibadettir.", kaynak: "Ankebut Suresi, 45. Ayet" },
    ],
    yatsi: [
        { metin: "Yatsı namazını cemaatle kılan kimse, gecenin yarısını ihya etmiş gibidir.", kaynak: "Hadis-i Şerif (Müslim)" },
        { metin: "Gecenin karanlığında Rabbinle baş başa kal. Yatsı namazı ruhun ilacıdır.", kaynak: "" },
        { metin: "İman edenler ancak o kimselerdir ki, Allah anıldığı zaman kalpleri ürperir.", kaynak: "Enfal Suresi, 2. Ayet" },
        { metin: "Günü Allah'ın rızasıyla bitirmek için Yatsı namazına davetlisin.", kaynak: "" },
    ],
};
