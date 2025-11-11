import { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { apiClient } from "@/services/api";
import { theme } from "@/config/theme";
import { Link } from "react-router-dom"; // <-- Navigasyon için

// Backend'den gelen AnketSablonu objesinin tipi
interface AnketSablonu {
  id: number;
  ad: string;
  aciklama: string;
}

export default function AdminSablonlar() {
  const [list, setList] = useState<AnketSablonu[]>([]);
  const [ad, setAd] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [loading, setLoading] = useState(true);

  // Veriyi çeken fonksiyon
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/sablon");
      setList(response.data.data);
    } catch (error) {
      alert("Anket Şablonları çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Yeni oluşturma fonksiyonu
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ad) {
      alert("Şablon Adı zorunludur.");
      return;
    }
    try {
      // POST /api/admin/sablon
      await apiClient.post("/admin/sablon", { ad, aciklama });
      alert("Anket Şablonu başarıyla oluşturuldu!");
      setAd("");
      setAciklama("");
      fetchList(); // Listeyi yenile
    } catch (error) {
      alert("Oluşturulurken bir hata oluştu.");
    }
  };

  return (
    <PageShell>
      <h1 className="text-xl font-semibold mb-4">Anket Şablonu Yönetimi</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* --- Sol Taraf: Oluşturma Formu --- */}
        <div className="md:col-span-1">
          <form
            onSubmit={handleCreate}
            className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm space-y-4"
          >
            <div className="text-sm font-semibold">Yeni Şablon Ekle</div>
            <div>
              <label className="text-xs text-zinc-600">Şablon Adı</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Örn: Şef -> Personel Değerlendirmesi"
                value={ad}
                onChange={(e) => setAd(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600">
                Açıklama (Opsiyonel)
              </label>
              <textarea
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                rows={3}
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm text-white w-full"
              style={{ background: theme.brand.primary }}
            >
              Oluştur
            </button>
          </form>
        </div>

        {/* --- Sağ Taraf: Mevcut Liste --- */}
        <div className="md:col-span-2">
          <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <div className="p-4 border-b">
              <div className="text-sm font-semibold">Mevcut Şablonlar</div>
            </div>
            {loading ? (
              <div className="p-4 text-sm text-zinc-500">Yükleniyor...</div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {list.map((sablon) => (
                  <li
                    key={sablon.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <div className="font-semibold">{sablon.ad}</div>
                      <div className="text-xs text-zinc-500">
                        {sablon.aciklama}
                      </div>
                    </div>
                    {/* YENİ: Konuları yönetmek için detay sayfasına link */}
                    <Link
                      to={`/admin/sablon/${sablon.id}`}
                      className="text-xs text-blue-600 font-medium"
                    >
                      Konuları Yönet
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
