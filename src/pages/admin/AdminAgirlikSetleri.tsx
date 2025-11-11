import { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { apiClient } from "@/services/api"; // (API istemcimiz)
import { theme } from "@/config/theme";
import { Link } from "react-router-dom"; // (Gelecekte detay sayfasına link için)

// Backend'den gelen AgirlikSeti objesinin tipi
interface AgirlikSeti {
  id: number;
  ad: string;
  aciklama: string;
}

export default function AdminAgirlikSetleri() {
  const [list, setList] = useState<AgirlikSeti[]>([]);
  const [ad, setAd] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [loading, setLoading] = useState(true);

  // Veriyi çeken fonksiyon
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/agirlik-seti");
      setList(response.data.data);
    } catch (error) {
      alert("Ağırlık Setleri çekilemedi.");
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
      alert("Ağırlık Seti Adı zorunludur.");
      return;
    }
    try {
      // POST /api/admin/agirlik-seti
      await apiClient.post("/admin/agirlik-seti", { ad, aciklama });
      alert("Ağırlık Seti başarıyla oluşturuldu!");
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
        "Bu Ağırlık Setini silmek istediğinize emin misiniz? (Bağlı atamalar ve ağırlıklar da silinecektir)"
      )
    ) {
      try {
        // DELETE /api/admin/agirlik-seti/:id
        await apiClient.delete(`/admin/agirlik-seti/${id}`);
        alert("Ağırlık Seti silindi.");
        fetchList(); // Listeyi yenile
      } catch (error) {
        alert("Silinirken bir hata oluştu.");
      }
    }
  };

  return (
    <PageShell>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Ağırlık Seti Yönetimi</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* --- Sol Taraf: Oluşturma Formu --- */}
        <div className="md:col-span-1">
          <form
            onSubmit={handleCreate}
            className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm space-y-4"
          >
            <div className="text-sm font-semibold">Yeni Ağırlık Seti Ekle</div>
            <div>
              <label className="text-xs text-zinc-600">Ağırlık Seti Adı</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Örn: Yazılımcı Seti"
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
                placeholder="Bu setin hangi unvanlar için kullanılacağı..."
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
              <div className="text-sm font-semibold">
                Mevcut Ağırlık Setleri
              </div>
            </div>
            {loading ? (
              <div className="p-4 text-sm text-zinc-500">Yükleniyor...</div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {list.map((set) => (
                  <li
                    key={set.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <div className="font-semibold">{set.ad}</div>
                      <div className="text-xs text-zinc-500">
                        {set.aciklama}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* YENİ LİNK */}
                      <Link
                        to={`/admin/konu-agirliklari/${set.id}`}
                        className="text-xs text-blue-600 font-medium"
                      >
                        Konu Ağırlıklarını Yönet
                      </Link>
                      <button
                        onClick={() => handleDelete(set.id)}
                        className="text-xs text-red-500"
                      >
                        Sil
                      </button>
                    </div>
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
