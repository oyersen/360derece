import { useState, useEffect } from "react"; // <-- Hook'ları import et
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts";
import {
  Users,
  ClipboardList,
  Star,
  CalendarClock,
  FileText,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
// import { competencyGuide, allUsers, surveyTypes } from "@/features/data"; // <-- Mock datayı sildik
import { theme } from "@/config/theme";
import { apiClient } from "@/services/api"; // <-- API istemcimizi import et

// --- TİP TANIMLAMALARI ---
// Backend'den gelen AnaBaslik ve KonuBaslik tipleri (Yeterlilik Rehberi için)
interface KonuBaslik {
  id: number;
  ad: string;
}
interface AnaBaslik {
  id: number;
  ad: string;
  aciklama: string;
  konuBasliklari: KonuBaslik[];
}
// Backend'den gelen 'genel-skor' yanıtının tipi
interface GenelSkorData {
  ortalamaSkor: number;
  personelSayisi: number;
  degerlendirilenSayisi: number;
}

interface AnaBaslikSkor {
  ana: string;
  skor: number;
}
// --- BİTTİ ---

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

export default function DashboardPage() {
  // --- STATE TANIMLAMALARI ---
  const [toplamPersonel, setToplamPersonel] = useState(0);
  const [aktifSablon, setAktifSablon] = useState(0);
  const [genelSkor, setGenelSkor] = useState(0);
  const [anaBaslikOrt, setAnaBaslikOrt] = useState<AnaBaslikSkor[]>([]); // TODO: Bu API henüz yok
  const [yeterlilikRehberi, setYeterlilikRehberi] = useState<AnaBaslik[]>([]);
  const [loading, setLoading] = useState(true);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // TODO: 'donemId' ve 'sablonId'yi dinamik hale getir (örn: bir dropdown'dan seç)
        const DONEM_ID = 1; // Varsayılan olarak 1. dönemi al
        const SABLON_ID = 1; // Varsayılan olarak 1. şablonu al

        const [personelRes, sablonRes, genelSkorRes, anaBaslikRes] =
          await Promise.all([
            apiClient.get("/personel/all"), // 1. Toplam Çalışan
            apiClient.get("/admin/sablon"), // 2. Aktif Anket Tipi (Şablon sayısı)
            apiClient.get(`/analiz/genel-skoru/${DONEM_ID}/${SABLON_ID}`), // 3. Genel Ortalama
            apiClient.get("/admin/ana-baslik"), // 4. Yeterlilik Rehberi için Ana Başlıklar
          ]);

        // Verileri state'e ata
        setToplamPersonel(personelRes.data.data.length);
        setAktifSablon(sablonRes.data.data.length);

        // Bizim skorlarımız 1-4 arası, 0-100 ölçeğine çevir
        const skor_1_4 = genelSkorRes.data.data.ortalamaSkor;
        const skor_0_100 = ((skor_1_4 - 1) / 3) * 100; // (örn: 3.5 -> 83.3)
        setGenelSkor(skor_0_100);

        setYeterlilikRehberi(anaBaslikRes.data.data);

        // TODO: "Ana Başlık Ortalamaları" için backend'de yeni bir API yazmamız gerekecek
        // 'genel-skoru' API'si bu dökümü (breakdown) henüz sağlamıyor.
        // Şimdilik sahte veriyi kullanalım
        setAnaBaslikOrt([
          { ana: "Mesleki", skor: skor_0_100 * 0.95 }, // Mock veriyi genel skora göre türetelim
          { ana: "Davranışsal", skor: skor_0_100 * 1.05 },
        ]);
      } catch (error) {
        console.error("Dashboard verisi çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <PageShell>Dashboard yükleniyor...</PageShell>;
  }

  return (
    <PageShell>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* API'den gelen verileri kullan */}
        <KpiCard icon={Users} title="Toplam Çalışan" value={toplamPersonel} />
        <KpiCard
          icon={ClipboardList}
          title="Aktif Anket Tipi"
          value={aktifSablon}
        />
        <KpiCard
          icon={Star}
          title="Genel Ortalama"
          value={genelSkor.toFixed(1)}
          sub="0–100 ölçeği"
        />
        <KpiCard
          icon={CalendarClock}
          title="Tamamlama / Gecikme"
          value={`-%`} // TODO: Bu veri için yeni API lazım
          sub={`- değerlendirme gecikmede`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">
              Ana Başlık Ortalamaları (Mock Veri)
            </div>
            <div className="text-xs text-zinc-500">Dönem 1 / Şablon 1</div>
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

        {/* Yeterlilik Rehberi (Artık API'den geliyor) */}
        <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={18} className="text-zinc-600" />
            <div className="text-sm font-semibold">Yeterlilik Rehberi</div>
          </div>
          <p className="text-xs text-zinc-500">
            Aşağıdaki ana başlıklar ve konular, anket sistemimizin
            kütüphanesinden (veritabanından) dinamik olarak çekilmektedir.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-2">
            {yeterlilikRehberi.map((c, i) => (
              <div
                key={c.id}
                className="rounded-xl border bg-zinc-50 p-3 space-y-1"
              >
                <div className="text-xs font-semibold flex items-center gap-1">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: theme.chart[i % theme.chart.length] }}
                  />
                  {c.ad} {/* API'den gelen 'ad' */}
                </div>
                <div className="text-[11px] text-zinc-600">{c.aciklama}</div>
                <ul className="mt-1 text-[11px] text-zinc-500 list-disc list-inside space-y-0.5">
                  {c.konuBasliklari.map((t) => (
                    <li key={t.id}>{t.ad}</li> // API'den gelen 'konuBasliklari'
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
