// src/pages/Kurumsal360.tsx
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ClipboardList,
  Users,
  BarChart3,
  Shield,
  LogOut,
  LogIn,
  Building2,
  CalendarClock,
  Star,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  FileText,
  History,
} from "lucide-react";

/* =========================================================================
   TEMA
   ========================================================================= */

const theme = {
  brand: {
    primary: "#0B5FFF",
    primaryDark: "#0A4ED9",
    accent: "#22C55E",
    warning: "#F59E0B",
    bg: "#F5F5F7",
    text: "#0B1220",
    muted: "#6B7280",
  },
  chart: ["#0B5FFF", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899"],
} as const;

/* =========================================================================
   TİPLER
   ========================================================================= */

type Rol = "MÜDÜR" | "ŞEF" | "PERSONEL";
type AnaKey = "MESLEKI" | "DAVRANISSAL" | "BIREYSEL";

type Kisi = {
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

type BaseQuestion = {
  id: number;
  anaKey: AnaKey;
  ana: string;
  konu: string;
  metin: string;
  defaultWeight: number;
  weightByTitle?: Record<string, number>;
  weightByRol?: Partial<Record<Rol, number>>;
};

type SurveyType = {
  id: number;
  ad: string;
  hedefRol: Rol;
};

type Cycle = {
  id: number;
  ad: string;
  yil: number;
};

type Assignment = {
  id: number;
  cycleId: number;
  surveyTypeId: number;
  evaluateeId: number;
  evaluatorIds: number[];
};

type SavedSurvey = {
  id: number;
  cycleId: number;
  surveyTypeId: number;
  evaluateeId: number;
  evaluatorId: number;
  tarih: string;
  durum: "Taslak" | "Tamamlandı";
  ortSkor: number;
};

/* =========================================================================
   MOCK VERİ
   ========================================================================= */

// Müdürler
const managers: Kisi[] = [
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

// Şefler
const chiefs: Kisi[] = [
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

// Personeller (pozisyonlara göre karışık)
const staff: Kisi[] = (() => {
  const pozisyonlar = [
    "Harita Mühendisi",
    "CBS Uzmanı",
    "İK Personeli",
    "Muhasebe Uzmanı",
    "Tasarım Uzmanı",
    "Mimar",
  ];
  const baglanti: number[] = [15, 15, 17, 16, 11, 12]; // şef id'leri

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

const allUsers: Kisi[] = [...managers, ...chiefs, ...staff];

// Rol çarpanları
const rolCarpani: Record<`${Rol}-${Rol}`, number> = {
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

// Yeterlilik Rehberi
const competencyGuide = [
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

// 20 soruluk havuz
const baseQuestions: BaseQuestion[] = [
  // Mesleki
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

  // Davranışsal
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

  // Bireysel
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

// Anket tipleri
const surveyTypes: SurveyType[] = [
  { id: 1, ad: "Personel 360°", hedefRol: "PERSONEL" },
  { id: 2, ad: "Şef 360°", hedefRol: "ŞEF" },
  { id: 3, ad: "Müdür 360°", hedefRol: "MÜDÜR" },
];

// Döngüler
const cycles: Cycle[] = [
  { id: 1, ad: "2024 Yıllık 360°", yil: 2024 },
  { id: 2, ad: "2025 Yıllık 360°", yil: 2025 },
];

// Atamalar
const assignments: Assignment[] = [
  // 2024
  { id: 1, cycleId: 1, surveyTypeId: 3, evaluateeId: 1, evaluatorIds: [11, 15, 100, 101, 102] }, // CBS Müdürü
  { id: 2, cycleId: 1, surveyTypeId: 2, evaluateeId: 11, evaluatorIds: [1, 100, 101, 102, 103] }, // Tasarım Şefi
  { id: 3, cycleId: 1, surveyTypeId: 1, evaluateeId: 100, evaluatorIds: [11, 1] }, // Personel
  // 2025
  { id: 4, cycleId: 2, surveyTypeId: 3, evaluateeId: 2, evaluatorIds: [13, 16, 104, 105, 106] }, // İdari Müdür
  { id: 5, cycleId: 2, surveyTypeId: 2, evaluateeId: 15, evaluatorIds: [1, 100, 101, 107, 108] }, // Harita Şefi
  { id: 6, cycleId: 2, surveyTypeId: 1, evaluateeId: 105, evaluatorIds: [15, 1] }, // Harita Mühendisi
];

// Kayıtlı anketler
const savedSurveys: SavedSurvey[] = [
  { id: 1, cycleId: 1, surveyTypeId: 1, evaluateeId: 100, evaluatorId: 11, tarih: "2024-03-10", durum: "Tamamlandı", ortSkor: 82 },
  { id: 2, cycleId: 1, surveyTypeId: 2, evaluateeId: 11, evaluatorId: 1, tarih: "2024-03-11", durum: "Taslak", ortSkor: 79 },
  { id: 3, cycleId: 2, surveyTypeId: 3, evaluateeId: 2, evaluatorId: 13, tarih: "2025-04-02", durum: "Tamamlandı", ortSkor: 88 },
  { id: 4, cycleId: 2, surveyTypeId: 1, evaluateeId: 105, evaluatorId: 15, tarih: "2025-04-05", durum: "Taslak", ortSkor: 75 },
];

/* =========================================================================
   YARDIMCI FONKSİYONLAR
   ========================================================================= */

function getUser(id: number): Kisi {
  const u = allUsers.find((x) => x.id === id);
  if (!u) throw new Error("User not found: " + id);
  return u;
}

function getQuestionWeight(q: BaseQuestion, kisi?: Kisi): number {
  if (!kisi) return q.defaultWeight;
  if (q.weightByTitle) {
    if (kisi.unvan && q.weightByTitle[kisi.unvan] != null) return q.weightByTitle[kisi.unvan]!;
    if (kisi.pozisyon && q.weightByTitle[kisi.pozisyon] != null) return q.weightByTitle[kisi.pozisyon]!;
  }
  if (q.weightByRol && q.weightByRol[kisi.rol] != null) return q.weightByRol[kisi.rol]!;
  return q.defaultWeight;
}

/* =========================================================================
   ORTAK LAYOUT BİLEŞENLERİ
   ========================================================================= */

function TopNav({
  current,
  setCurrent,
  onLogout,
  isLoggedIn,
}: {
  current: string;
  setCurrent: (k: string) => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}) {
  const items = [
    { key: "dashboard", label: "Panel", icon: Shield },
    { key: "assign", label: "Atamalar", icon: Users },
    { key: "survey", label: "Anket", icon: ClipboardList },
    { key: "saved", label: "Kayıtlı Anketler", icon: History },
    { key: "reports", label: "Raporlar", icon: BarChart3 },
  ];
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200">
      <div className="w-full px-8 h-16 flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-[15px]">
          <div className="p-1.5 rounded-lg" style={{ background: theme.brand.primary }}>
            <Building2 size={18} color="white" />
          </div>
          Kurumsal 360° Değerlendirme
        </div>
        <div className="flex gap-1">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setCurrent(it.key)}
              className={`px-3 py-2 rounded-xl text-sm flex items-center gap-2 border transition ${
                current === it.key
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                  : "bg-white hover:bg-zinc-50"
              }`}
            >
              <it.icon size={16} />
              {it.label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          {isLoggedIn && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg border bg-white hover:bg-zinc-50 flex items-center gap-2 text-sm"
            >
              <LogOut size={16} />
              Çıkış
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: theme.brand.bg }} className="min-h-[calc(100vh-4rem)] w-full">
      <div className="px-8 py-6 space-y-6">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

/* =========================================================================
   PANEL
   ========================================================================= */

function Dashboard() {
  const toplam = allUsers.length;
  const aktifAnket = surveyTypes.length;
  const tamamlanma = 64; // mock
  const gecikmeli = 7;

  const anaBaslikOrt = [
    { ana: "Mesleki", skor: 78 },
    { ana: "Davranışsal", skor: 84 },
    { ana: "Bireysel", skor: 81 },
  ];

  return (
    <PageShell>
      {/* KPI satırı */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard icon={Users} title="Toplam Çalışan" value={toplam} />
        <KpiCard icon={ClipboardList} title="Aktif Anket Tipi" value={aktifAnket} />
        <KpiCard icon={Star} title="Genel Ortalama" value="82.4" sub="0–100 ölçeği" />
        <KpiCard
          icon={CalendarClock}
          title="Tamamlama / Gecikme"
          value={`${tamamlanma}%`}
          sub={`${gecikmeli} değerlendirme gecikmede`}
        />
      </div>

      {/* Grafik + Rehber */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Ana Başlık Ortalamaları</div>
            <div className="text-xs text-zinc-500">Örnek mock skorlar</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={anaBaslikOrt}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ana" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="skor" radius={[6, 6, 6, 6]}>
                  {anaBaslikOrt.map((_, i) => (
                    <Cell key={i} fill={theme.chart[i % theme.chart.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yeterlilik Rehberi */}
        <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={18} className="text-zinc-600" />
            <div className="text-sm font-semibold">Yeterlilik Rehberi</div>
          </div>
          <p className="text-xs text-zinc-500">
            Aşağıdaki ana başlıklar, 360° anketlerinde kullanılan temel yeterlilik alanlarını tanımlar. Yöneticilerin
            puanlama yaparken aynı dili kullanmasını sağlar.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-2">
            {competencyGuide.map((c, i) => (
              <div key={c.key} className="rounded-xl border bg-zinc-50 p-3 space-y-1">
                <div className="text-xs font-semibold flex items-center gap-1">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: theme.chart[i % theme.chart.length] }}
                  />
                  {c.title}
                </div>
                <div className="text-[11px] text-zinc-600">{c.desc}</div>
                <ul className="mt-1 text-[11px] text-zinc-500 list-disc list-inside space-y-0.5">
                  {c.topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function KpiCard({
  icon: Icon,
  title,
  value,
  sub,
}: {
  icon: any;
  title: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-zinc-200 p-4 flex items-center gap-3 shadow-sm">
      <div className="p-2 rounded-xl bg-zinc-100">
        <Icon size={18} color={theme.brand.primary} />
      </div>
      <div className="flex-1">
        <div className="text-xs text-zinc-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {sub && <div className="text-[11px] text-zinc-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

/* =========================================================================
   ATAMALAR
   ========================================================================= */

function AssignmentsPage() {
  const [cycleId, setCycleId] = useState<number>(cycles[0].id);
  const [surveyTypeId, setSurveyTypeId] = useState<number>(surveyTypes[0].id);
  const [search, setSearch] = useState("");

  const filteredAssignments = useMemo(
    () =>
      assignments.filter(
        (a) =>
          a.cycleId === cycleId &&
          a.surveyTypeId === surveyTypeId &&
          getUser(a.evaluateeId).ad.toLowerCase().includes(search.toLowerCase())
      ),
    [cycleId, surveyTypeId, search]
  );

  const [openId, setOpenId] = useState<number | null>(null);

  const surveyType = surveyTypes.find((s) => s.id === surveyTypeId)!;
  const cycle = cycles.find((c) => c.id === cycleId)!;

  return (
    <PageShell>
      {/* Filtre alanı */}
      <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm mb-4">
        <div className="grid md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-zinc-600">Dönem</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
              value={cycleId}
              onChange={(e) => setCycleId(Number(e.target.value))}
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-600">Anket Tipi</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
              value={surveyTypeId}
              onChange={(e) => setSurveyTypeId(Number(e.target.value))}
            >
              {surveyTypes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-600">Değerlendirilen Kişi</label>
            <div className="relative mt-1">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                className="pl-7 pr-3 py-2 w-full border rounded-lg text-sm"
                placeholder="İsim ara…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="text-[11px] text-zinc-500">
            <div className="font-semibold mb-1">Kural Özeti</div>
            <div>• Personel + Müdür → Şef</div>
            <div>• Şef + Müdür → Personel</div>
            <div>• Personel + Şef → Müdür</div>
          </div>
        </div>
      </div>

      {/* Atama listesi */}
      <div className="space-y-3">
        {filteredAssignments.map((a) => {
          const evaluatee = getUser(a.evaluateeId);
          const evaluators = a.evaluatorIds.map(getUser);
          const open = openId === a.id;

          return (
            <div key={a.id} className="rounded-2xl bg-white border border-zinc-200 shadow-sm">
              <button
                onClick={() => setOpenId((s) => (s === a.id ? null : a.id))}
                className="w-full px-5 py-3 flex items-center gap-3"
              >
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold">{evaluatee.ad}</div>
                  <div className="text-xs text-zinc-500">
                    {evaluatee.unvan} • {evaluatee.departman}
                  </div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-zinc-100 border">
                  {cycle.ad} • {surveyType.ad}
                </div>
                <div className="text-xs text-zinc-500">
                  {evaluators.length} değerlendirici
                </div>
                <div className="text-zinc-500">{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
              </button>

              {open && (
                <div className="px-5 pb-5 space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Değerlendiriciler</div>
                      <div className="flex flex-wrap gap-2">
                        {evaluators.map((u) => (
                          <span
                            key={u.id}
                            className="px-2 py-1 border rounded-full text-xs bg-zinc-50"
                          >
                            {u.ad} • {u.rol}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      Bu değerlendirmede soru ağırlıkları, {evaluatee.unvan} / {evaluatee.rol} için tanımlanan
                      kurallara göre otomatik hesaplanır.
                    </div>
                  </div>

                  {/* Sorular + ağırlık tablosu */}
                  <div className="rounded-xl border overflow-auto">
                    <table className="min-w-[900px] w-full text-sm">
                      <thead className="bg-zinc-50 text-xs">
                        <tr>
                          <th className="text-left p-2">Ana Başlık</th>
                          <th className="text-left p-2">Konu</th>
                          <th className="text-left p-2">Soru</th>
                          <th className="text-left p-2">Ağırlık</th>
                        </tr>
                      </thead>
                      <tbody>
                        {baseQuestions.map((q) => (
                          <tr key={q.id} className="border-t">
                            <td className="p-2">{q.ana}</td>
                            <td className="p-2">{q.konu}</td>
                            <td className="p-2">{q.metin}</td>
                            <td className="p-2">
                              {getQuestionWeight(q, evaluatee).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
          );
        })}

        {filteredAssignments.length === 0 && (
          <div className="text-xs text-zinc-500 border border-dashed rounded-xl p-4 bg-white/60">
            Seçilen dönem ve anket tipine ait atama bulunamadı.
          </div>
        )}
      </div>
    </PageShell>
  );
}

/* =========================================================================
   ANKET – DİJİTAL GİRİŞ
   ========================================================================= */

function SurveyPage() {
  const [surveyTypeId, setSurveyTypeId] = useState<number>(1);
  const surveyType = surveyTypes.find((s) => s.id === surveyTypeId)!;

  const hedefKisiler = allUsers.filter((u) => u.rol === surveyType.hedefRol);
  const [evaluateeId, setEvaluateeId] = useState<number>(hedefKisiler[0]?.id ?? allUsers[0].id);
  const evaluatee = getUser(evaluateeId);

  const evaluatorCandidates = allUsers.filter((u) => u.id !== evaluateeId);
  const [evaluatorId, setEvaluatorId] = useState<number>(evaluatorCandidates[0]?.id ?? allUsers[0].id);

  const [puan, setPuan] = useState<Record<number, number>>({});
  const [yorum, setYorum] = useState<Record<number, string>>({});

  const setScore = (qid: number, val: number) =>
    setPuan((s) => ({
      ...s,
      [qid]: val,
    }));

  const setComment = (qid: number, text: string) =>
    setYorum((s) => ({
      ...s,
      [qid]: text,
    }));

  const saveDraft = () => {
    alert("Taslak kaydedildi (mock).");
  };

  const submit = () => {
    // Burada API'ye gönderilebilir.
    alert("Anket gönderildi (mock).");
  };

  return (
    <PageShell>
      {/* Seçim alanı */}
      <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm mb-4">
        <div className="grid lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-zinc-600">Anket Tipi</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
              value={surveyTypeId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSurveyTypeId(id);
                const st = surveyTypes.find((s) => s.id === id)!;
                const hedef = allUsers.find((u) => u.rol === st.hedefRol)!;
                setEvaluateeId(hedef.id);
              }}
            >
              {surveyTypes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-600">Değerlendirilen</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
              value={evaluateeId}
              onChange={(e) => setEvaluateeId(Number(e.target.value))}
            >
              {hedefKisiler.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ad} • {k.unvan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-600">Değerlendirici</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
              value={evaluatorId}
              onChange={(e) => setEvaluatorId(Number(e.target.value))}
            >
              {evaluatorCandidates.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ad} • {k.rol}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-zinc-500">
            <div className="font-semibold mb-1">Kullanım Amacı</div>
            Kağıt ortamda yapılmış bir değerlendirmeyi, ilgili kişiyi ve anket tipini seçip dijital olarak sisteme
            aktarmak için bu ekran kullanılır.
          </div>
        </div>
      </div>

      {/* Dijital form */}
      <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-sm">{evaluatee.ad}</div>
            <div className="text-xs text-zinc-500">
              {evaluatee.unvan} • {surveyType.ad}
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            Rol çarpanı:{" "}
            {(
              rolCarpani[`${getUser(evaluatorId).rol}-${evaluatee.rol}` as `${Rol}-${Rol}`] ?? 1
            ).toFixed(2)}
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-[950px] w-full text-sm">
            <thead className="bg-zinc-50 text-xs">
              <tr>
                <th className="p-2 text-left">Ana Başlık</th>
                <th className="p-2 text-left">Konu</th>
                <th className="p-2 text-left">Soru</th>
                <th className="p-2 text-left">Ağırlık</th>
                <th className="p-2 text-left">Puan (1–5)</th>
                <th className="p-2 text-left">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {baseQuestions.map((q) => {
                const w = getQuestionWeight(q, evaluatee);
                return (
                  <tr key={q.id} className="border-t">
                    <td className="p-2">{q.ana}</td>
                    <td className="p-2">{q.konu}</td>
                    <td className="p-2">{q.metin}</td>
                    <td className="p-2">{w.toFixed(2)}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        className="border rounded px-2 py-1 w-20"
                        value={Number.isFinite(puan[q.id]) ? puan[q.id] : ""}
                        onChange={(e) => setScore(q.id, Number(e.target.value))}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Kısa not (opsiyonel)"
                        value={yorum[q.id] ?? ""}
                        onChange={(e) => setComment(q.id, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={saveDraft} className="px-3 py-2 rounded-lg border bg-white text-sm">
            Taslak Kaydet
          </button>
          <button
            onClick={submit}
            className="px-3 py-2 rounded-lg text-sm text-white"
            style={{ background: theme.brand.primary }}
          >
            Gönder
          </button>
        </div>
      </div>
    </PageShell>
  );
}

/* =========================================================================
   KAYITLI ANKETLER
   ========================================================================= */

function SavedSurveysPage() {
  const [cycleId, setCycleId] = useState<number | "all">("all");
  const [durum, setDurum] = useState<"all" | "Taslak" | "Tamamlandı">("all");
  const [selectedId, setSelectedId] = useState<number | null>(savedSurveys[0]?.id ?? null);

  const filtered = useMemo(
    () =>
      savedSurveys.filter(
        (s) =>
          (cycleId === "all" || s.cycleId === cycleId) &&
          (durum === "all" || s.durum === durum)
      ),
    [cycleId, durum]
  );

  const selected = selectedId != null ? savedSurveys.find((s) => s.id === selectedId) ?? null : null;

  return (
    <PageShell>
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Liste */}
        <div className="xl:col-span-2 rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <History size={18} />
              Kayıtlı Anketler
            </div>
            <div className="text-xs text-zinc-500">
              Önceden kaydedilmiş anketleri açıp güncelleyebilirsiniz.
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-zinc-600">Dönem</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
                value={cycleId}
                onChange={(e) =>
                  setCycleId(e.target.value === "all" ? "all" : Number(e.target.value))
                }
              >
                <option value="all">Tümü</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.ad}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-600">Durum</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
                value={durum}
                onChange={(e) => setDurum(e.target.value as any)}
              >
                <option value="all">Tümü</option>
                <option value="Taslak">Taslak</option>
                <option value="Tamamlandı">Tamamlandı</option>
              </select>
            </div>
          </div>

          <div className="overflow-auto rounded-xl border">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-zinc-50 text-xs">
                <tr>
                  <th className="p-2 text-left">Tarih</th>
                  <th className="p-2 text-left">Dönem</th>
                  <th className="p-2 text-left">Anket</th>
                  <th className="p-2 text-left">Değerlendirilen</th>
                  <th className="p-2 text-left">Değerlendirici</th>
                  <th className="p-2 text-left">Durum</th>
                  <th className="p-2 text-left">Ort. Skor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const cyc = cycles.find((c) => c.id === s.cycleId)!;
                  const st = surveyTypes.find((t) => t.id === s.surveyTypeId)!;
                  const evale = getUser(s.evaluateeId);
                  const evalr = getUser(s.evaluatorId);
                  const selectedRow = s.id === selectedId;
                  return (
                    <tr
                      key={s.id}
                      className={`border-t cursor-pointer ${
                        selectedRow ? "bg-zinc-50" : "hover:bg-zinc-50/70"
                      }`}
                      onClick={() => setSelectedId(s.id)}
                    >
                      <td className="p-2 text-xs">{s.tarih}</td>
                      <td className="p-2 text-xs">{cyc.ad}</td>
                      <td className="p-2 text-xs">{st.ad}</td>
                      <td className="p-2 text-xs">
                        {evale.ad} • {evale.unvan}
                      </td>
                      <td className="p-2 text-xs">
                        {evalr.ad} • {evalr.rol}
                      </td>
                      <td className="p-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[11px] ${
                            s.durum === "Tamamlandı"
                              ? "border-emerald-400 text-emerald-700 bg-emerald-50"
                              : "border-amber-400 text-amber-700 bg-amber-50"
                          }`}
                        >
                          {s.durum}
                        </span>
                      </td>
                      <td className="p-2 text-xs">{s.ortSkor}</td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td className="p-3 text-xs text-zinc-500" colSpan={7}>
                      Filtrelere uyan kayıtlı anket bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detay kartı */}
        <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} />
            <div className="text-sm font-semibold">Seçili Anket Özeti</div>
          </div>

          {selected && (
            <>
              {(() => {
                const cyc = cycles.find((c) => c.id === selected.cycleId)!;
                const st = surveyTypes.find((t) => t.id === selected.surveyTypeId)!;
                const evale = getUser(selected.evaluateeId);
                const evalr = getUser(selected.evaluatorId);
                return (
                  <>
                    <div className="grid gap-3 text-sm mb-3">
                      <Field label="Değerlendirilen" value={`${evale.ad} • ${evale.unvan}`} />
                      <Field label="Değerlendirici" value={`${evalr.ad} • ${evalr.rol}`} />
                      <Field label="Dönem" value={cyc.ad} />
                      <Field label="Anket" value={st.ad} />
                      <Field label="Tarih" value={selected.tarih} />
                      <Field label="Durum" value={selected.durum} />
                      <Field label="Ortalama Skor" value={`${selected.ortSkor} / 100`} />
                    </div>
                    <div className="text-[11px] text-zinc-500 mb-3">
                      <p>
                        <b>Düzenleme:</b> Gerçek uygulamada bu alandan ilgili anket tekrar açılıp puanlar güncellenir.
                        Şu an arayüz mock amaçlıdır.
                      </p>
                    </div>
                    <button
                      className="w-full px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: theme.brand.primary }}
                    >
                      Anketi Düzenlemek İçin Aç
                    </button>
                  </>
                );
              })()}
            </>
          )}

          {!selected && (
            <div className="text-xs text-zinc-500">
              Soldan bir kayıt seçerek detayları görüntüleyebilir ve düzenlemek üzere açabilirsiniz.
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

/* =========================================================================
   RAPORLAR
   ========================================================================= */

function ReportsPage() {
  const [q, setQ] = useState("");
  const people = useMemo(
    () => allUsers.filter((u) => u.ad.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  const [seciliId, setSeciliId] = useState<number>(people[0]?.id ?? allUsers[0].id);
  const kisi = getUser(seciliId);

  const topicData = useMemo(() => {
    const base = seciliId;
    const anaKeys = competencyGuide;
    return anaKeys.map((c, i) => ({
      anaBaslik: c.title,
      skor: Math.min(100, Math.max(60, 65 + ((base + i * 7) % 30))),
    }));
  }, [seciliId]);

  const overall = useMemo(
    () => Number((topicData.reduce((a, c) => a + c.skor, 0) / topicData.length).toFixed(1)),
    [topicData]
  );

  const pieData = [
    { name: "Puan", value: overall },
    { name: "Kalan", value: 100 - overall },
  ];

  return (
    <PageShell>
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Sol: kişi listesi */}
        <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
          <div className="text-sm font-semibold mb-2">Çalışanlar</div>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              className="pl-7 pr-3 py-2 w-full border rounded-lg text-sm"
              placeholder="İsim filtrele…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="max-h-[520px] overflow-auto divide-y">
            {people.map((p) => (
              <button
                key={p.id}
                onClick={() => setSeciliId(p.id)}
                className={`w-full text-left py-2 flex items-center gap-2 text-sm ${
                  seciliId === p.id ? "bg-zinc-50" : ""
                }`}
              >
                <span className="font-medium w-32 truncate">{p.ad}</span>
                <span className="text-xs text-zinc-600">{p.unvan}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sağ: kişi kartı + grafikler */}
        <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm lg:col-span-2 space-y-4">
          {/* Personel kartı */}
          <div className="rounded-xl border p-4 flex items-start gap-4 bg-zinc-50/60">
            <div className="h-12 w-12 rounded-full bg-zinc-200 grid place-items-center text-sm font-semibold">
              {kisi.ad.substring(0, 2).toUpperCase()}
            </div>
            <div className="grid md:grid-cols-3 gap-3 w-full text-sm">
              <Field label="Ad Soyad" value={kisi.ad} />
              <Field label="Rol / Ünvan" value={`${kisi.rol} • ${kisi.unvan}`} />
              <Field label="Departman" value={kisi.departman} />
              <Field label="Sicil" value={kisi.sicil} />
              <Field label="E-posta" value={kisi.email} />
              <Field
                label="Yönetici"
                value={kisi.yoneticiId ? getUser(kisi.yoneticiId).ad : "-"}
              />
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <div className="text-sm font-semibold mb-2">Ana Başlık Skorları</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="anaBaslik" />
                    <Tooltip />
                    <Bar dataKey="skor" radius={[6, 6, 6, 6]}>
                      {topicData.map((_, idx) => (
                        <Cell key={idx} fill={theme.chart[idx % theme.chart.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="relative">
              <div className="text-sm font-semibold mb-2">Genel Ortalama</div>
              <div className="h-72 relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={80}
                      outerRadius={100}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      <Cell fill={theme.brand.primary} />
                      <Cell fill="#111" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{overall}</div>
                    <div className="text-xs text-zinc-500">/100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* =========================================================================
   LOGIN
   ========================================================================= */

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!email || !pass) {
      setErr("Lütfen e-posta ve şifre giriniz.");
      return;
    }
    onSuccess(); // 🔧 LDAP / SSO entegrasyonu burada devreye girebilir
  };

  return (
    <div className="min-h-screen grid place-items-center" style={{ background: theme.brand.bg }}>
      <div className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg" style={{ background: theme.brand.primary }}>
            <Building2 size={18} color="white" />
          </div>
          <div className="text-lg font-semibold">Kurumsal 360° Giriş</div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-zinc-600">E-posta</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="ad.soyad@firma.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-zinc-600">Şifre</label>
            <input
              type="password"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button
            onClick={submit}
            className="w-full flex items-center justify-center gap-2 text-white rounded-lg py-2 text-sm"
            style={{ background: theme.brand.primary }}
          >
            <LogIn size={16} />
            Giriş Yap
          </button>
        </div>
        <div className="mt-4 text-xs text-zinc-500">
          Kurum SSO / LDAP entegrasyonu için ek butonlar bu alana eklenebilir.
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   ROOT
   ========================================================================= */

export default function Kurumsal360() {
  const [page, setPage] = useState<"dashboard" | "assign" | "survey" | "saved" | "reports">(
    "dashboard"
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // demo için true

  if (!isLoggedIn) return <Login onSuccess={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen flex flex-col" style={{ color: theme.brand.text }}>
      <TopNav
        current={page}
        setCurrent={(k) => setPage(k as any)}
        onLogout={() => setIsLoggedIn(false)}
        isLoggedIn={isLoggedIn}
      />

      {page === "dashboard" && <Dashboard />}
      {page === "assign" && <AssignmentsPage />}
      {page === "survey" && <SurveyPage />}
      {page === "saved" && <SavedSurveysPage />}
      {page === "reports" && <ReportsPage />}

      <footer className="border-t border-zinc-200 bg-white/60">
        <div className="px-8 py-3 text-xs text-zinc-500 flex items-center justify-between">
          <span>© 2025 Kurum A.Ş.</span>
          <span>Gizlilik • Kullanım Koşulları</span>
        </div>
      </footer>
    </div>
  );
}
