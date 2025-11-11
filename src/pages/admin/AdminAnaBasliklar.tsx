import { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { apiClient } from "@/services/api"; // (Daha önce oluşturduğumuz API istemcisi)
import { theme } from "@/config/theme";

// Backend'den gelen AnaBaslik objesinin tipi
interface AnaBaslik {
  id: number;
  ad: string;
  aciklama: string;
}

export default function AdminAnaBasliklar() {
  const [list, setList] = useState<AnaBaslik[]>([]);
  const [ad, setAd] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [loading, setLoading] = useState(true);

  // Veriyi çeken fonksiyon
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/ana-baslik");
      setList(response.data.data);
    } catch (error) {
      alert("Ana Başlıklar çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde listeyi çek
  useEffect(() => {
    fetchList();
  }, []);

  // Yeni oluşturma fonksiyonu
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ad) {
      alert("Ana Başlık Adı zorunludur.");
      return;
    }
    try {
      // POST /api/admin/ana-baslik
      await apiClient.post("/admin/ana-baslik", { ad, aciklama });
      alert("Ana Başlık başarıyla oluşturuldu!");
      setAd("");
      setAciklama("");
      fetchList(); // Listeyi yenile
    } catch (error) {
      alert("Oluşturulurken bir hata oluştu.");
    }
  };

  // Silme fonksiyonu
  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "Bu başlığı silmek istediğinize emin misiniz? (Bağlı konular etkilenebilir)"
      )
    ) {
      try {
        // DELETE /api/admin/ana-baslik/:id
        await apiClient.delete(`/admin/ana-baslik/${id}`);
        alert("Ana Başlık silindi.");
        fetchList(); // Listeyi yenile
      } catch (error) {
        alert("Silinirken bir hata oluştu.");
      }
    }
  };

  return (
    <PageShell>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Ana Başlık Yönetimi</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* --- Sol Taraf: Oluşturma Formu --- */}
        <div className="md:col-span-1">
          <form
            onSubmit={handleCreate}
            className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm space-y-4"
          >
            <div className="text-sm font-semibold">Yeni Ana Başlık Ekle</div>
            <div>
              <label className="text-xs text-zinc-600">Ana Başlık Adı</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Örn: Mesleki Yeterlilik"
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
                placeholder="Bu başlığın neyi ölçtüğü..."
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
              <div className="text-sm font-semibold">Mevcut Ana Başlıklar</div>
            </div>
            {loading ? (
              <div className="p-4 text-sm text-zinc-500">Yükleniyor...</div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {list.map((baslik) => (
                  <li
                    key={baslik.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <div className="font-semibold">{baslik.ad}</div>
                      <div className="text-xs text-zinc-500">
                        {baslik.aciklama}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(baslik.id)}
                      className="text-xs text-red-500"
                    >
                      Sil
                    </button>
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
