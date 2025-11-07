import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";
import { Users, ClipboardList, Star, CalendarClock, FileText } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { competencyGuide, allUsers, surveyTypes } from "@/features/data";
import { theme } from "@/config/theme";

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
  const toplam = allUsers.length;
  const aktifAnket = surveyTypes.length;
  const tamamlanma = 64;
  const gecikmeli = 7;

  const anaBaslikOrt = [
    { ana: "Mesleki", skor: 78 },
    { ana: "Davranışsal", skor: 84 },
    { ana: "Bireysel", skor: 81 },
  ];

  return (
    <PageShell>
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
