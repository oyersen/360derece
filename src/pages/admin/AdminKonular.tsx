import { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { apiClient } from "@/services/api";
import { theme } from "@/config/theme";

// Backend'den gelen tipler
interface AnaBaslik {
  id: number;
  ad: string;
}
interface KonuBaslik {
  id: number;
  ad: string;
  aciklama: string;
  anaBaslik: AnaBaslik; // İlişkiyi de getiriyoruz
}

export default function AdminKonular() {
  const [konuList, setKonuList] = useState<KonuBaslik[]>([]);
  const [anaBasliklar, setAnaBasliklar] = useState<AnaBaslik[]>([]);

  // Form state'leri
  const [ad, setAd] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [selectedAnaBaslikId, setSelectedAnaBaslikId] = useState<number | "">(
    ""
  );

  const [loading, setLoading] = useState(true);

  // Veriyi çeken fonksiyon (Hem Konuları hem de Ana Başlıkları)
  const fetchList = async () => {
    try {
      setLoading(true);
      // İki API isteğini aynı anda yap
      const [konuRes, anaBaslikRes] = await Promise.all([
        apiClient.get("/admin/konu"),
        apiClient.get("/admin/ana-baslik"),
      ]);
      setKonuList(konuRes.data.data);
      setAnaBasliklar(anaBaslikRes.data.data);
    } catch (error) {
      alert("Veriler çekilemedi.");
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
    if (!ad || !selectedAnaBaslikId) {
      alert("Konu Adı ve Ana Başlık seçimi zorunludur.");
      return;
    }
    try {
      // POST /api/admin/konu
      await apiClient.post("/admin/konu", {
        ad,
        aciklama,
        anaBaslikId: selectedAnaBaslikId,
      });
      alert("Konu Başlığı başarıyla oluşturuldu!");
      setAd("");
      setAciklama("");
      setSelectedAnaBaslikId("");
      fetchList(); // Listeyi yenile
    } catch (error) {
      alert("Oluşturulurken bir hata oluştu.");
    }
  };

  // Silme fonksiyonu
  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "Bu konuyu silmek istediğinize emin misiniz? (Bağlı sorular da silinebilir)"
      )
    ) {
      try {
        await apiClient.delete(`/admin/konu/${id}`);
        alert("Konu Başlığı silindi.");
        fetchList();
      } catch (error) {
        alert("Silinirken bir hata oluştu.");
      }
    }
  };

  return (
    <PageShell>
      <h1 className="text-xl font-semibold mb-4">Konu Başlığı Yönetimi</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* --- Sol Taraf: Oluşturma Formu --- */}
        <div className="md:col-span-1">
          <form
            onSubmit={handleCreate}
            className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm space-y-4"
          >
            <div className="text-sm font-semibold">Yeni Konu Başlığı Ekle</div>

            <div>
              <label className="text-xs text-zinc-600">
                Bağlı Olduğu Ana Başlık
              </label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedAnaBaslikId}
                onChange={(e) =>
                  setSelectedAnaBaslikId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              >
                <option value="">Seçiniz...</option>
                {anaBasliklar.map((baslik) => (
                  <option key={baslik.id} value={baslik.id}>
                    {baslik.ad}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-600">Konu Başlığı Adı</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Örn: Teknik Kapasite"
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
              <div className="text-sm font-semibold">
                Mevcut Konu Başlıkları
              </div>
            </div>
            {loading ? (
              <div className="p-4 text-sm text-zinc-500">Yükleniyor...</div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {konuList.map((konu) => (
                  <li
                    key={konu.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <div className="font-semibold">{konu.ad}</div>
                      <div className="text-xs text-blue-600">
                        (Ana Başlık:{" "}
                        {konu.anaBaslik ? konu.anaBaslik.ad : "Yok"})
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(konu.id)}
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
