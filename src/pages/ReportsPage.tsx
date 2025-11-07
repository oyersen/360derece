import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, PieChart, Pie } from "recharts";
import { Search } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Field } from "@/components/common/Field";
import { allUsers, competencyGuide, getUser } from "@/features/data";
import { theme } from "@/config/theme";

export default function ReportsPage() {
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

        <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm lg:col-span-2 space-y-4">
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
                      <Cell fill="#111111" />
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
