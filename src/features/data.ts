import type { ReactNode } from "react";

export type Rol = "MÜDÜR" | "ŞEF" | "PERSONEL";
export type AnaKey = "MESLEKI" | "DAVRANISSAL" | "BIREYSEL";

export type Kisi = {
  id: number;
  ad: string;
  rol: Rol;
  unvan: string;
  departman: string;
  pozisyon?: string;
  sicil: string;
  email: string;
  yoneticiId?: number;
};

export type BaseQuestion = {
  id: number;
  anaKey: AnaKey;
  ana: string;
  konu: string;
  metin: string;
  defaultWeight: number;
  weightByTitle?: Record<string, number>;
  weightByRol?: Partial<Record<Rol, number>>;
};

export type SurveyType = {
  id: number;
  ad: string;
  hedefRol: Rol;
};

export type Cycle = {
  id: number;
  ad: string;
  yil: number;
};

export type Assignment = {
  id: number;
  cycleId: number;
  surveyTypeId: number;
  evaluateeId: number;
  evaluatorIds: number[];
};

export type SavedSurvey = {
  id: number;
  cycleId: number;
  surveyTypeId: number;
  evaluateeId: number;
  evaluatorId: number;
  tarih: string;
  durum: "Taslak" | "Tamamlandı";
  ortSkor: number;
};

export type BuilderQuestion = {
  id: number;
  anaKey: AnaKey | "";
  konu: string;
  metin: string;
  defaultWeight: number | "";
};
/* --------------------------------------------------------------------- */
/*  MOCK VERİ                                                           */
/* --------------------------------------------------------------------- */

export const managers: Kisi[] = [
  {
    id: 1,
    ad: "CBS Müdürü",
    rol: "MÜDÜR",
    unvan: "CBS Müdürü",
    departman: "CBS",
    sicil: "M-100",
    email: "cbs.mudur@firma.com",
  },
  {
    id: 2,
    ad: "İdari Müdür",
    rol: "MÜDÜR",
    unvan: "İdari Müdür",
    departman: "İdari İşler",
    sicil: "M-101",
    email: "idari.mudur@firma.com",
  },
  {
    id: 3,
    ad: "Tasarım Müdürü",
    rol: "MÜDÜR",
    unvan: "Tasarım Müdürü",
    departman: "Tasarım",
    sicil: "M-102",
    email: "tasarim.mudur@firma.com",
  },
];

export const chiefs: Kisi[] = [
  {
    id: 11,
    ad: "Tasarım Şefi",
    rol: "ŞEF",
    unvan: "Tasarım Şefi",
    departman: "Tasarım",
    sicil: "S-200",
    email: "tasarim.sef@firma.com",
    yoneticiId: 3,
  },
  {
    id: 12,
    ad: "Mimari Şef",
    rol: "ŞEF",
    unvan: "Mimari Şef",
    departman: "Tasarım",
    sicil: "S-201",
    email: "mimari.sef@firma.com",
    yoneticiId: 3,
  },
  {
    id: 13,
    ad: "Emlak Şefi",
    rol: "ŞEF",
    unvan: "Emlak Şefi",
    departman: "Emlak",
    sicil: "S-202",
    email: "emlak.sef@firma.com",
    yoneticiId: 2,
  },
  {
    id: 14,
    ad: "Değerleme Şefi",
    rol: "ŞEF",
    unvan: "Değerleme Şefi",
    departman: "Emlak",
    sicil: "S-203",
    email: "degerleme.sef@firma.com",
    yoneticiId: 2,
  },
  {
    id: 15,
    ad: "Harita Şefi",
    rol: "ŞEF",
    unvan: "Harita Şefi",
    departman: "CBS",
    sicil: "S-204",
    email: "harita.sef@firma.com",
    yoneticiId: 1,
  },
  {
    id: 16,
    ad: "Muhasebe Şefi",
    rol: "ŞEF",
    unvan: "Muhasebe Şefi",
    departman: "Finans",
    sicil: "S-205",
    email: "muhasebe.sef@firma.com",
    yoneticiId: 2,
  },
  {
    id: 17,
    ad: "İK Şefi",
    rol: "ŞEF",
    unvan: "İK Şefi",
    departman: "İnsan Kaynakları",
    sicil: "S-206",
    email: "ik.sef@firma.com",
    yoneticiId: 2,
  },
];

export const staff: Kisi[] = (() => {
  const pozisyonlar = [
    "Harita Mühendisi",
    "CBS Uzmanı",
    "İK Personeli",
    "Muhasebe Uzmanı",
    "Tasarım Uzmanı",
    "Mimar",
  ];
  const baglanti: number[] = [15, 15, 17, 16, 11, 12];

  return Array.from({ length: 24 }).map((_, i) => {
    const idx = i % pozisyonlar.length;
    const pozisyon = pozisyonlar[idx];
    const sefId = baglanti[idx];
    return {
      id: 100 + i,
      ad: `P${i + 1}`,
      rol: "PERSONEL" as Rol,
      unvan: pozisyon,
      departman: chiefs.find((c) => c.id === sefId)?.departman || "Genel",
      pozisyon,
      sicil: `P-${300 + i}`,
      email: `p${i + 1}@firma.com`,
      yoneticiId: sefId,
    };
  });
})();

export const allUsers: Kisi[] = [...managers, ...chiefs, ...staff];

export const rolCarpani: Record<`${Rol}-${Rol}`, number> = {
  "MÜDÜR-MÜDÜR": 1,
  "MÜDÜR-ŞEF": 0.9,
  "MÜDÜR-PERSONEL": 1,
  "ŞEF-MÜDÜR": 0.7,
  "ŞEF-ŞEF": 0.8,
  "ŞEF-PERSONEL": 0.8,
  "PERSONEL-MÜDÜR": 0.6,
  "PERSONEL-ŞEF": 0.6,
  "PERSONEL-PERSONEL": 0.5,
};

export const competencyGuide = [
  {
    key: "MESLEKI" as AnaKey,
    title: "Mesleki Yeterlilik",
    desc: "Pozisyona özgü teknik bilgi, çıktı kalitesi ve sorumluluk alma düzeyi.",
    topics: [
      "İş bilgisi",
      "Verimlilik",
      "İş kalitesi",
      "Sorumluluk",
      "Problem çözme ve üretkenlik",
    ],
  },
  {
    key: "DAVRANISSAL" as AnaKey,
    title: "Davranışsal Yeterlilik",
    desc: "İşbirliği, iletişim, ekip çalışması ve liderlik davranışları.",
    topics: [
      "İnsan ilişkileri",
      "Organizasyon becerisi",
      "Öğrenmeye yatkınlık",
      "Takım çalışması",
      "Liderlik",
      "İletişim becerisi",
    ],
  },
  {
    key: "BIREYSEL" as AnaKey,
    title: "Bireysel Yeterlilik",
    desc: "Kişisel disiplin, inisiyatif, zaman yönetimi ve işe bağlılık.",
    topics: [
      "Karar verebilme",
      "Planlı çalışma",
      "İşe bağlılık",
      "İnisiyatif alma",
      "Zamanı yönetebilme",
    ],
  },
];

export const baseQuestions: BaseQuestion[] = [
  {
    id: 1,
    anaKey: "MESLEKI",
    ana: "Mesleki Yeterlilik",
    konu: "İş bilgisi",
    metin: "Görev alanına ilişkin güncel teknik bilgilere hakimdir.",
    defaultWeight: 0.6,
    weightByTitle: {
      "İK Personeli": 0.4,
      "Harita Mühendisi": 0.8,
      "CBS Uzmanı": 0.8,
    },
  },
  {
    id: 2,
    anaKey: "MESLEKI",
    ana: "Mesleki Yeterlilik",
    konu: "İş bilgisi",
    metin: "Yeni yöntem ve teknolojileri takip ederek işine uygular.",
    defaultWeight: 0.6,
  },
  {
    id: 3,
    anaKey: "MESLEKI",
    ana: "Mesleki Yeterlilik",
    konu: "Verimlilik",
    metin: "Kaynakları (zaman, ekipman vb.) verimli kullanır.",
    defaultWeight: 0.5,
  },
  {
    id: 4,
    anaKey: "MESLEKI",
    ana: "Mesleki Yeterlilik",
    konu: "Verimlilik",
    metin: "İşleri planlanan süreler içinde tamamlar.",
    defaultWeight: 0.5,
  },
  {
    id: 5,
    anaKey: "MESLEKI",
    ana: "Mesleki Yeterlilik",
    konu: "İş kalitesi",
    metin: "Ürettiği işin doğruluk ve detay kalitesi yüksektir.",
    defaultWeight: 0.7,
  },
  {
    id: 6,
    anaKey: "MESLEKI",
    ana: "Mesleki Yeterlilik",
    konu: "Sorumluluk",
    metin: "Hatalarını sahiplenir, düzeltmek için inisiyatif alır.",
    defaultWeight: 0.5,
  },
  {
    id: 7,
    anaKey: "MESLEKI",
    ana: "Mesleki Yeterlilik",
    konu: "Problem çözme ve üretkenlik",
    metin: "Karşılaştığı sorunlara pratik ve uygulanabilir çözümler üretir.",
    defaultWeight: 0.7,
  },
  {
    id: 8,
    anaKey: "DAVRANISSAL",
    ana: "Davranışsal Yeterlilik",
    konu: "İnsan ilişkileri",
    metin: "Çalışma arkadaşlarıyla saygılı ve yapıcı ilişki kurar.",
    defaultWeight: 0.6,
  },
  {
    id: 9,
    anaKey: "DAVRANISSAL",
    ana: "Davranışsal Yeterlilik",
    konu: "Organizasyon becerisi",
    metin: "İşi organize eder, önceliklendirme yapar.",
    defaultWeight: 0.6,
  },
  {
    id: 10,
    anaKey: "DAVRANISSAL",
    ana: "Davranışsal Yeterlilik",
    konu: "Öğrenmeye yatkınlık",
    metin: "Yeni bilgilere açıktır, geri bildirimden öğrenir.",
    defaultWeight: 0.5,
  },
  {
    id: 11,
    anaKey: "DAVRANISSAL",
    ana: "Davranışsal Yeterlilik",
    konu: "Takım çalışması",
    metin: "Ekip hedeflerine katkı sağlamak için işbirliği yapar.",
    defaultWeight: 0.6,
  },
  {
    id: 12,
    anaKey: "DAVRANISSAL",
    ana: "Davranışsal Yeterlilik",
    konu: "Liderlik",
    metin: "Ekip arkadaşlarını hedefe yönlendirebilir.",
    defaultWeight: 0.6,
    weightByRol: { MÜDÜR: 0.9, ŞEF: 0.8 },
  },
  {
    id: 13,
    anaKey: "DAVRANISSAL",
    ana: "Davranışsal Yeterlilik",
    konu: "Liderlik",
    metin: "Karar süreçlerinde ekibi sürece dahil eder.",
    defaultWeight: 0.5,
    weightByRol: { MÜDÜR: 0.8, ŞEF: 0.7 },
  },
  {
    id: 14,
    anaKey: "DAVRANISSAL",
    ana: "Davranışsal Yeterlilik",
    konu: "İletişim becerisi",
    metin: "Bilgiyi açık, anlaşılır ve zamanında paylaşır.",
    defaultWeight: 0.7,
    weightByRol: { MÜDÜR: 1.0, ŞEF: 0.8 },
  },
  {
    id: 15,
    anaKey: "BIREYSEL",
    ana: "Bireysel Yeterlilik",
    konu: "Karar verebilme",
    metin: "Bilgi ve veriler ışığında zamanında karar alır.",
    defaultWeight: 0.5,
  },
  {
    id: 16,
    anaKey: "BIREYSEL",
    ana: "Bireysel Yeterlilik",
    konu: "Planlı çalışma",
    metin: "İş planı oluşturur, taahhüt ettiği işleri takip eder.",
    defaultWeight: 0.6,
  },
  {
    id: 17,
    anaKey: "BIREYSEL",
    ana: "Bireysel Yeterlilik",
    konu: "İşe bağlılık",
    metin: "Kurum hedeflerine ve değerlere bağlılık gösterir.",
    defaultWeight: 0.5,
  },
  {
    id: 18,
    anaKey: "BIREYSEL",
    ana: "Bireysel Yeterlilik",
    konu: "İnisiyatif alma",
    metin: "Gerekli durumlarda yönlendirme beklemeden harekete geçer.",
    defaultWeight: 0.6,
  },
  {
    id: 19,
    anaKey: "BIREYSEL",
    ana: "Bireysel Yeterlilik",
    konu: "Zamanı yönetebilme",
    metin: "Önceliklerine göre zamanını dengeli kullanır.",
    defaultWeight: 0.6,
    weightByRol: { MÜDÜR: 1.0, ŞEF: 0.8 },
  },
  {
    id: 20,
    anaKey: "BIREYSEL",
    ana: "Bireysel Yeterlilik",
    konu: "Zamanı yönetebilme",
    metin: "Yoğun dönemlerde teslim tarihlerini korur.",
    defaultWeight: 0.5,
  },
];

export const surveyTypes: SurveyType[] = [
  { id: 1, ad: "Personel 360°", hedefRol: "PERSONEL" },
  { id: 2, ad: "Şef 360°", hedefRol: "ŞEF" },
  { id: 3, ad: "Müdür 360°", hedefRol: "MÜDÜR" },
];

export const cycles: Cycle[] = [
  { id: 1, ad: "2024 Yıllık 360°", yil: 2024 },
  { id: 2, ad: "2025 Yıllık 360°", yil: 2025 },
];

export const assignments: Assignment[] = [
  { id: 1, cycleId: 1, surveyTypeId: 3, evaluateeId: 1, evaluatorIds: [11, 15, 100, 101, 102] },
  { id: 2, cycleId: 1, surveyTypeId: 2, evaluateeId: 11, evaluatorIds: [1, 100, 101, 102, 103] },
  { id: 3, cycleId: 1, surveyTypeId: 1, evaluateeId: 100, evaluatorIds: [11, 1] },
  { id: 4, cycleId: 2, surveyTypeId: 3, evaluateeId: 2, evaluatorIds: [13, 16, 104, 105, 106] },
  { id: 5, cycleId: 2, surveyTypeId: 2, evaluateeId: 15, evaluatorIds: [1, 100, 101, 107, 108] },
  { id: 6, cycleId: 2, surveyTypeId: 1, evaluateeId: 105, evaluatorIds: [15, 1] },
];

export const savedSurveys: SavedSurvey[] = [
  { id: 1, cycleId: 1, surveyTypeId: 1, evaluateeId: 100, evaluatorId: 11, tarih: "2024-03-10", durum: "Tamamlandı", ortSkor: 82 },
  { id: 2, cycleId: 1, surveyTypeId: 2, evaluateeId: 11, evaluatorId: 1, tarih: "2024-03-11", durum: "Taslak", ortSkor: 79 },
  { id: 3, cycleId: 2, surveyTypeId: 3, evaluateeId: 2, evaluatorId: 13, tarih: "2025-04-02", durum: "Tamamlandı", ortSkor: 88 },
  { id: 4, cycleId: 2, surveyTypeId: 1, evaluateeId: 105, evaluatorId: 15, tarih: "2025-04-05", durum: "Taslak", ortSkor: 75 },
];

/* --------------------------------------------------------------------- */
/*  YARDIMCI FONKSİYONLAR                                               */
/* --------------------------------------------------------------------- */

export function getUser(id: number): Kisi {
  const u = allUsers.find((x) => x.id === id);
  if (!u) throw new Error("User not found: " + id);
  return u;
}

export function getQuestionWeight(q: BaseQuestion, kisi?: Kisi): number {
  if (!kisi) return q.defaultWeight;
  if (q.weightByTitle) {
    if (kisi.unvan && q.weightByTitle[kisi.unvan] != null) return q.weightByTitle[kisi.unvan]!;
    if (kisi.pozisyon && q.weightByTitle[kisi.pozisyon] != null) return q.weightByTitle[kisi.pozisyon]!;
  }
  if (q.weightByRol && q.weightByRol[kisi.rol] != null) return q.weightByRol[kisi.rol]!;
  return q.defaultWeight;
}
