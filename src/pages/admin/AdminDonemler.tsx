import { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { apiClient } from "@/services/api"; // (API istemcimiz)
import { theme } from "@/config/theme";

// Backend'den gelen AnketDonemi objesinin tipi
interface AnketDonemi {
  id: number;
  ad: string;
  baslangicTarihi: string; // (Tarihleri string olarak alıp göstermek daha kolaydır)
  bitisTarihi: string;
}

// Tarihi YYYY-MM-DD formatına çeviren yardımcı fonksiyon
const formatDateForInput = (dateStr: string | Date): string => {
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

export default function AdminDonemler() {
  const [list, setList] = useState<AnketDonemi[]>([]);

  // Form state'leri
  const [ad, setAd] = useState("");
  const [baslangicTarihi, setBaslangicTarihi] = useState(
    formatDateForInput(new Date())
  );
  const [bitisTarihi, setBitisTarihi] = useState(
    formatDateForInput(new Date())
  );

  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null); // Güncelleme modu için

  // Veriyi çeken fonksiyon
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/donem");
      setList(response.data.data);
    } catch (error) {
      alert("Anket Dönemleri çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Formu temizle
  const resetForm = () => {
    setAd("");
    setBaslangicTarihi(formatDateForInput(new Date()));
    setBitisTarihi(formatDateForInput(new Date()));
    setEditId(null);
  };

  // Oluşturma veya Güncelleme fonksiyonu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ad || !baslangicTarihi || !bitisTarihi) {
      alert("Tüm alanlar zorunludur.");
      return;
    }

    const payload = { ad, baslangicTarihi, bitisTarihi };

    try {
      if (editId) {
        // --- GÜNCELLEME (PUT) ---
        // PUT /api/admin/donem/:id
        await apiClient.put(`/admin/donem/${editId}`, payload);
        alert("Dönem başarıyla güncellendi!");
      } else {
        // --- OLUŞTURMA (POST) ---
        // POST /api/admin/donem
        await apiClient.post("/admin/donem", payload);
        alert("Dönem başarıyla oluşturuldu!");
      }
      resetForm();
      fetchList(); // Listeyi yenile
    } catch (error) {
      alert("İşlem sırasında bir hata oluştu.");
    }
  };

  // Silme fonksiyonu
  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "Bu Anket Dönemini silmek istediğinize emin misiniz? (Bağlı cevaplar da silinebilir!)"
      )
    ) {
      try {
        // DELETE /api/admin/donem/:id
        await apiClient.delete(`/admin/donem/${id}`);
        alert("Dönem silindi.");
        fetchList(); // Listeyi yenile
      } catch (error) {
        alert("Silinirken bir hata oluştu.");
      }
    }
  };

  // Güncelleme modunu açan fonksiyon
  const handleEditClick = (donem: AnketDonemi) => {
    setEditId(donem.id);
    setAd(donem.ad);
    setBaslangicTarihi(formatDateForInput(donem.baslangicTarihi));
    setBitisTarihi(formatDateForInput(donem.bitisTarihi));
  };

  return (
    <PageShell>
      <h1 className="text-xl font-semibold mb-4">Anket Dönemi Yönetimi</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* --- Sol Taraf: Oluşturma/Güncelleme Formu --- */}
        <div className="md:col-span-1">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm space-y-4"
          >
            <div className="text-sm font-semibold">
              {editId ? "Dönemi Düzenle" : "Yeni Anket Dönemi Ekle"}
            </div>
            <div>
              <label className="text-xs text-zinc-600">Dönem Adı</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Örn: 2025 1. Dönem"
                value={ad}
                onChange={(e) => setAd(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600">Başlangıç Tarihi</label>
              <input
                type="date"
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={baslangicTarihi}
                onChange={(e) => setBaslangicTarihi(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600">Bitiş Tarihi</label>
              <input
                type="date"
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={bitisTarihi}
                onChange={(e) => setBitisTarihi(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm text-white w-full"
              style={{ background: theme.brand.primary }}
            >
              {editId ? "Güncelle" : "Oluştur"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg text-sm text-zinc-700 w-full border"
              >
                İptal
              </button>
            )}
          </form>
        </div>

        {/* --- Sağ Taraf: Mevcut Liste --- */}
        <div className="md:col-span-2">
          <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <div className="p-4 border-b">
              <div className="text-sm font-semibold">
                Mevcut Anket Dönemleri
              </div>
            </div>
            {loading ? (
              <div className="p-4 text-sm text-zinc-500">Yükleniyor...</div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {list.map((donem) => (
                  <li
                    key={donem.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <div className="font-semibold">{donem.ad}</div>
                      <div className="text-xs text-zinc-500">
                        {formatDateForInput(donem.baslangicTarihi)} -{" "}
                        {formatDateForInput(donem.bitisTarihi)}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditClick(donem)}
                        className="text-xs text-blue-600"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(donem.id)}
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
