import { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { apiClient } from "@/services/api";
import { theme } from "@/config/theme";

// Backend'den gelen tipler
interface KonuBaslik {
  id: number;
  ad: string;
}
// (Soru tipini de tanımlayabiliriz, ancak şimdilik liste göstermeyeceğiz)

export default function AdminSorular() {
  const [konuList, setKonuList] = useState<KonuBaslik[]>([]);

  // Form state'leri
  const [metin, setMetin] = useState("");
  const [agirlik, setAgirlik] = useState(1.0);
  const [selectedKonuId, setSelectedKonuId] = useState<number | "">("");

  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde Konu listesini çek (dropdown için)
  const fetchKonular = async () => {
    try {
      setLoading(true);
      const konuRes = await apiClient.get("/admin/konu");
      setKonuList(konuRes.data.data);
    } catch (error) {
      alert("Konu başlıkları çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKonular();
  }, []);

  // Yeni soru oluşturma
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metin || !selectedKonuId) {
      alert("Soru Metni ve Konu Başlığı seçimi zorunludur.");
      return;
    }
    try {
      // POST /api/admin/soru
      await apiClient.post("/admin/soru", {
        metin,
        agirlik,
        konuId: selectedKonuId,
      });
      alert("Soru başarıyla oluşturuldu!");
      setMetin("");
      setAgirlik(1.0);
      setSelectedKonuId("");
      // (Liste yenileme şimdilik yok, ama eklenebilir)
    } catch (error) {
      alert("Oluşturulurken bir hata oluştu.");
    }
  };

  return (
    <PageShell>
      <h1 className="text-xl font-semibold mb-4">Soru Yönetimi</h1>

      {/* Soru listesi bu sayfaya eklenebilir, 
          şimdilik sadece oluşturma formunu ekliyoruz */}

      <div className="max-w-md">
        <form
          onSubmit={handleCreate}
          className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm space-y-4"
        >
          <div className="text-sm font-semibold">Yeni Soru Ekle</div>

          <div>
            <label className="text-xs text-zinc-600">
              Bağlı Olduğu Konu Başlığı
            </label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
              value={selectedKonuId}
              onChange={(e) =>
                setSelectedKonuId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">Seçiniz...</option>
              {loading ? (
                <option disabled>Yükleniyor...</option>
              ) : (
                konuList.map((konu) => (
                  <option key={konu.id} value={konu.id}>
                    {konu.ad}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-600">Soru Metni</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              rows={4}
              placeholder="Örn: Algoritma kurma ve uygulama becerisi..."
              value={metin}
              onChange={(e) => setMetin(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-zinc-600">
              Soru Ağırlığı (Varsayılan: 1.0)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={agirlik}
              onChange={(e) => setAgirlik(Number(e.target.value))}
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm text-white w-full"
            style={{ background: theme.brand.primary }}
          >
            Soruyu Oluştur
          </button>
        </form>
      </div>
    </PageShell>
  );
}
