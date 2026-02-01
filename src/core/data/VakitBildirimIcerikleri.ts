/**
 * Vakit Bildirim İçerikleri
 * Namaz vakti girdiğinde gösterilecek teşvik edici ayet ve hadisler
 */

export type VakitBildirimIcerigi = {
    metin: string;
    kaynak?: string;
};

// Vakit tipleri (Güneş hariç)
export type VakitBildirimTipi = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

export const VAKIT_BILDIRIM_ICERIKLERI: Record<VakitBildirimTipi, VakitBildirimIcerigi[]> = {
    imsak: [
        { metin: "Sabah namazını kılan kimse, Allah'ın himayesindedir.", kaynak: "Hadis-i Şerif (Müslim)" },
        { metin: "Sizi gece ve gündüz ardarda takip eden melekler vardır. Sabah ve İkindi namazında toplanırlar.", kaynak: "Hadis-i Şerif (Buhari)" },
        { metin: "Güneş doğmadan ve batmadan önce namaz kılan kimse Cehenneme girmez.", kaynak: "Hadis-i Şerif (Müslim)" },
        { metin: "Sabah namazının iki rekat sünneti, dünyadan ve dünyadaki her şeyden daha hayırlıdır.", kaynak: "Hadis-i Şerif (Müslim)" },
        { metin: "Namaz uykudan hayırlıdır. Haydi kurtuluşa!", kaynak: "" },
    ],
    ogle: [
        { metin: "Ey iman edenler! Sabır ve namaz ile Allah'tan yardım isteyin.", kaynak: "Bakara Suresi, 153. Ayet" },
        { metin: "Namazı dosdoğru kılın. Çünkü namaz, müminler üzerine vakitleri belirli bir farzdır.", kaynak: "Nisa Suresi, 103. Ayet" },
        { metin: "Kim öğle namazını devamlı kılarsa, Allah ona Cehennem ateşini haram kılar.", kaynak: "Hadis-i Şerif" },
        { metin: "Gök kapıları öğle vaktinde açılır. O saatte hayırlı bir amelimin yükselmesini isterim.", kaynak: "Hadis-i Şerif (Tirmizi)" },
        { metin: "Dünya işlerine kısa bir ara ver, Rabbinin huzuruna dur.", kaynak: "" },
    ],
    ikindi: [
        { metin: "Kim ikindi namazını terk ederse, ameli boşa gitmiş olur.", kaynak: "Hadis-i Şerif (Buhari)" },
        { metin: "Orta namaza (ikindi namazına) ve diğer namazlara devam edin.", kaynak: "Bakara Suresi, 238. Ayet" },
        { metin: "İkindi namazını kaçıran kimse, sanki ailesini ve malını kaybetmiş gibidir.", kaynak: "Hadis-i Şerif (Buhari)" },
        { metin: "Melekler ikindi vakti toplanır ve Rablerine kullarının namaz kıldığını bildirirler.", kaynak: "Hadis-i Şerif" },
        { metin: "Günün yorgunluğunu atmak ve huzur bulmak için İkindi namazı seni bekliyor.", kaynak: "" },
    ],
    aksam: [
        { metin: "Akşam namazı, günün şükrüdür. Rabbinin huzuruna varmakta acele et.", kaynak: "" },
        { metin: "Kıyamet günü kulun ilk hesaba çekileceği şey namazdır.", kaynak: "Hadis-i Şerif (Tirmizi)" },
        { metin: "Namaz dinin direğidir.", kaynak: "Hadis-i Şerif" },
        { metin: "Günün bereketi akşam namazındadır. Vakit girmeden hazır ol.", kaynak: "" },
        { metin: "Allah'ı anmak, elbette en büyük ibadettir.", kaynak: "Ankebut Suresi, 45. Ayet" },
    ],
    yatsi: [
        { metin: "Yatsı namazını cemaatle kılan kimse, gecenin yarısını ihya etmiş gibidir.", kaynak: "Hadis-i Şerif (Müslim)" },
        { metin: "Münafıklara en ağır gelen namaz, yatsı ve sabah namazlarıdır.", kaynak: "Hadis-i Şerif (Buhari)" },
        { metin: "Gecenin karanlığında Rabbinle baş başa kal. Yatsı namazı ruhun ilacıdır.", kaynak: "" },
        { metin: "İman edenler ancak o kimselerdir ki, Allah anıldığı zaman kalpleri ürperir.", kaynak: "Enfal Suresi, 2. Ayet" },
        { metin: "Günü Allah'ın rızasıyla bitirmek için Yatsı namazına davetlisin.", kaynak: "" },
    ],
};
