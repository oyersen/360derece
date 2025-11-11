import { useMemo, useState, useEffect } from "react"; // <-- useEffect eklendi
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Search } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Field } from "@/components/common/Field";
// import { allUsers, competencyGuide, getUser } from "@/features/data"; // <-- Mock datayı sildik
import { theme } from "@/config/theme";
import { apiClient } from "@/services/api"; // <-- API istemcimizi import et

interface IPersonel {
  id: string;
  isim: string;
  soyisim: string;
  gorev: string;
  mudurluk: string;
  seflik: string;
  unvan: string;
  email?: string;
  rol: "Personel" | "Şef" | "Müdür" | "Yönetici" | "Diğer";
}

// Backend'deki analiz.service.ts'den gelen tiplerin kopyası
interface IAğırlıklıKonuSkoru {
  konuAdi: string;
  konuOrtalamasi: number;
  konuGenelAgirligi: number;
}

interface INihaiAnalizSonucu {
  personel: IPersonel;
  agirlikSeti: { id: number; ad: string } | null;
  nihaiSkor: number;
  konuSkorlari: IAğırlıklıKonuSkoru[];
}

// (Bu tipleri global bir 'types.ts' dosyasına taşımak daha iyi olacaktır)
interface Donem {
  id: number;
  ad: string;
}
interface Sablon {
  id: number;
  ad: string;
}

export default function ReportsPage() {
  const [q, setQ] = useState("");
  const [personelListesi, setPersonelListesi] = useState<IPersonel[]>([]);
  const [seciliPersonelId, setSeciliPersonelId] = useState<string>("");
  const [seciliDonemId, setSeciliDonemId] = useState<number>(1);
  const [seciliSablonId, setSeciliSablonId] = useState<number>(1);

  const [rapor, setRapor] = useState<INihaiAnalizSonucu | null>(null);
  const [loading, setLoading] = useState(true);

  const [donemler, setDonemler] = useState<Donem[]>([]);
  const [sablonlar, setSablonlar] = useState<Sablon[]>([]);

  // --- VERİ ÇEKME (Sayfa Yüklenince) ---
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        // Tüm personeli, dönemleri ve şablonları çek
        const [personelRes, donemRes, sablonRes] = await Promise.all([
          apiClient.get("/personel/all"),
          apiClient.get("/admin/donem"),
          apiClient.get("/admin/sablon"),
        ]);

        const personelData = personelRes.data.data;
        setPersonelListesi(personelData);
        setDonemler(donemRes.data.data);
        setSablonlar(sablonRes.data.data);

        // Listeden ilk kişiyi otomatik seç
        if (personelData.length > 0) {
          setSeciliPersonelId(personelData[0].id);
        }
      } catch (e) {
        alert("Sayfa verileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, []);

  // --- VERİ ÇEKME (Rapor için) ---
  // Seçili ID'ler (personel, dönem, şablon) değiştiğinde raporu yeniden çek
  useEffect(() => {
    const fetchReport = async () => {
      if (!seciliPersonelId || !seciliDonemId || !seciliSablonId) {
        setRapor(null);
        return;
      }
      try {
        setLoading(true);
        // GET /api/analiz/skor/:personelId/:donemId/:sablonId
        const response = await apiClient.get(
          `/analiz/skor/${seciliPersonelId}/${seciliDonemId}/${seciliSablonId}`
        );
        setRapor(response.data.data);
      } catch (error) {
        console.error("Rapor verisi çekilemedi:", error);
        setRapor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [seciliPersonelId, seciliDonemId, seciliSablonId]);

  // Personel listesini filtreleme (Arayüzde)
  const filtrelenmisPersonel = useMemo(
    () =>
      personelListesi.filter((u) =>
        (u.isim + " " + u.soyisim).toLowerCase().includes(q.toLowerCase())
      ),
    [q, personelListesi]
  );

  // Grafik verilerini hazırla
  const anaBaslikSkorlari =
    rapor?.konuSkorlari.map((k) => ({
      anaBaslik: k.konuAdi,
      skor: ((k.konuOrtalamasi - 1) / 3) * 100, // 1-4'ü 0-100'e çevir
    })) || [];

  const nihaiSkor_0_100 = rapor ? ((rapor.nihaiSkor - 1) / 3) * 100 : 0;

  const pieData = [
    { name: "Puan", value: nihaiSkor_0_100 },
    { name: "Kalan", value: 100 - nihaiSkor_0_100 },
  ];

  return (
    <PageShell>
      <div className="grid lg:grid-cols-3 gap-4">
        {/* --- Sol Taraf: Filtreler ve Personel Listesi --- */}
        <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
          <div className="text-sm font-semibold mb-2">Filtreler</div>
          {/* --- YENİ DROPDOWN'LAR --- */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              value={seciliDonemId}
              onChange={(e) => setSeciliDonemId(Number(e.target.value))}
            >
              {donemler.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.ad}
                </option>
              ))}
            </select>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              value={seciliSablonId}
              onChange={(e) => setSeciliSablonId(Number(e.target.value))}
            >
              {sablonlar.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ad}
                </option>
              ))}
            </select>
          </div>
          {/* --- BİTTİ --- */}

          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              className="pl-7 pr-3 py-2 w-full border rounded-lg text-sm"
              placeholder="İsim filtrele…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="max-h-[520px] overflow-auto divide-y">
            {filtrelenmisPersonel.map((p) => (
              <button
                key={p.id}
                onClick={() => setSeciliPersonelId(p.id)}
                className={`w-full text-left py-2 flex items-center gap-2 text-sm ${
                  seciliPersonelId === p.id ? "bg-zinc-50" : ""
                }`}
              >
                <span className="font-medium w-32 truncate">
                  {p.isim} {p.soyisim}
                </span>
                <span className="text-xs text-zinc-600">{p.unvan}</span>
              </button>
            ))}
          </div>
        </div>

        {/* --- Sağ Taraf: Rapor Detayı (Karne) --- */}
        <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm lg:col-span-2 space-y-4">
          {loading && <div>Rapor yükleniyor...</div>}

          {!loading && !rapor && (
            <div>Bu seçim için rapor verisi bulunamadı.</div>
          )}

          {rapor && (
            <>
              {/* Personel Bilgi Kartı */}
              <div className="rounded-xl border p-4 flex items-start gap-4 bg-zinc-50/60">
                {/* ... (Field component'leri 'rapor.personel' objesinden doldurulacak) ... */}
                <div className="grid md:grid-cols-3 gap-3 w-full text-sm">
                  <Field
                    label="Ad Soyad"
                    value={`${rapor.personel.isim} ${rapor.personel.soyisim}`}
                  />
                  <Field
                    label="Rol / Ünvan"
                    value={`${rapor.personel.rol} • ${rapor.personel.unvan}`}
                  />
                  <Field
                    label="Birim"
                    value={`${rapor.personel.mudurluk} / ${rapor.personel.seflik}`}
                  />
                  <Field label="Sicil (ID)" value={rapor.personel.id} />
                  <Field label="E-posta" value={rapor.personel.email || "-"} />
                  <Field
                    label="Ağırlık Seti"
                    value={rapor.agirlikSeti?.ad || "Varsayılan (Atanmamış)"}
                  />
                </div>
              </div>

              {/* Grafikler */}
              <div className="grid xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                  <div className="text-sm font-semibold mb-2">
                    Ana Başlık Skorları
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={anaBaslikSkorlari}
                        layout="vertical"
                        margin={{ left: 40 }}
                      >
                        {/* ... (BarChart kodları aynı) ... */}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="relative">
                  <div className="text-sm font-semibold mb-2">
                    Genel Ortalama
                  </div>
                  <div className="h-72 relative">
                    <ResponsiveContainer>
                      <PieChart>
                        {/* ... (PieChart kodları aynı) ... */}
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {nihaiSkor_0_100.toFixed(1)}
                        </div>
                        <div className="text-xs text-zinc-500">/100</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
