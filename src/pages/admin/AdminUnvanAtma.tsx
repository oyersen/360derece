import { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { apiClient } from "@/services/api";
import { theme } from "@/config/theme";

// Backend'den gelen tipler
interface AgirlikSeti {
  id: number;
  ad: string;
}
interface UnvanAtamasi {
  id: number;
  unvan: string;
  agirlikSeti: AgirlikSeti;
}

export default function AdminUnvanAtama() {
  // Veri listeleri
  const [mevcutAtamalar, setMevcutAtamalar] = useState<UnvanAtamasi[]>([]);
  const [unvanListesi, setUnvanListesi] = useState<string[]>([]);
  const [agirlikSetleri, setAgirlikSetleri] = useState<AgirlikSeti[]>([]);

  // Form state'leri
  const [selectedUnvan, setSelectedUnvan] = useState<string>("");
  const [selectedSetId, setSelectedSetId] = useState<number | "">("");

  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde 3 API'yi de çağır
  const fetchData = async () => {
    try {
      setLoading(true);
      const [atamalarRes, unvanlarRes, setlerRes] = await Promise.all([
        apiClient.get("/admin/agirlik-seti/unvan-atama"), // Mevcut atamalar
        apiClient.get("/personel/unvanlar"), // Excel/LDAP'taki tüm unvanlar
        apiClient.get("/admin/agirlik-seti"), // Oluşturulan setler
      ]);

      setMevcutAtamalar(atamalarRes.data.data);
      setUnvanListesi(unvanlarRes.data.data);
      setAgirlikSetleri(setlerRes.data.data);
    } catch (error) {
      alert("Veriler çekilemedi. (Unvanlar, Setler veya Atamalar)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Yeni atama/güncelleme fonksiyonu
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnvan || !selectedSetId) {
      alert("Unvan ve Ağırlık Seti seçimi zorunludur.");
      return;
    }
    try {
      // POST /api/admin/agirlik-seti/unvan-atama
      await apiClient.post("/admin/agirlik-seti/unvan-atama", {
        unvan: selectedUnvan,
        setId: selectedSetId,
      });
      alert(`"${selectedUnvan}" unvanı başarıyla atandı!`);
      setSelectedUnvan("");
      setSelectedSetId("");
      fetchData(); // Listeyi yenile
    } catch (error) {
      alert("Atama yapılırken bir hata oluştu.");
    }
  };

  // Atama kaldırma fonksiyonu
  const handleRemove = async (unvan: string) => {
    if (
      window.confirm(
        `"${unvan}" unvanına ait atamayı kaldırmak istediğinize emin misiniz?`
      )
    ) {
      try {
        // DELETE /api/admin/agirlik-seti/unvan-atama/:unvan
        await apiClient.delete(
          `/admin/agirlik-seti/unvan-atama/${encodeURIComponent(unvan)}`
        );
        alert("Atama kaldırıldı.");
        fetchData(); // Listeyi yenile
      } catch (error) {
        alert("Atama kaldırılırken bir hata oluştu.");
      }
    }
  };

  // Atanmamış unvanları filtrele (dropdown için)
  const atanmamisUnvanlar = unvanListesi.filter(
    (unvan) => !mevcutAtamalar.some((atama) => atama.unvan === unvan)
  );

  return (
    <PageShell>
      <h1 className="text-xl font-semibold mb-4">
        Unvan - Ağırlık Seti Ataması
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* --- Sol Taraf: Oluşturma Formu --- */}
        <div className="md:col-span-1">
          <form
            onSubmit={handleAssign}
            className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm space-y-4"
          >
            <div className="text-sm font-semibold">Yeni Unvan Ataması Yap</div>

            <div>
              <label className="text-xs text-zinc-600">
                Unvan (Excel/LDAP'tan gelen)
              </label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedUnvan}
                onChange={(e) => setSelectedUnvan(e.target.value)}
              >
                <option value="">Seçiniz...</option>
                {atanmamisUnvanlar.map((unvan) => (
                  <option key={unvan} value={unvan}>
                    {unvan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-600">
                Atanacak Ağırlık Seti
              </label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedSetId}
                onChange={(e) =>
                  setSelectedSetId(e.target.value ? Number(e.target.value) : "")
                }
              >
                <option value="">Seçiniz...</option>
                {agirlikSetleri.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.ad}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm text-white w-full"
              style={{ background: theme.brand.primary }}
            >
              Unvanı Sete Ata
            </button>
          </form>
        </div>

        {/* --- Sağ Taraf: Mevcut Atamalar --- */}
        <div className="md:col-span-2">
          <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <div className="p-4 border-b">
              <div className="text-sm font-semibold">
                Mevcut Unvan Atamaları
              </div>
            </div>
            {loading ? (
              <div className="p-4 text-sm text-zinc-500">Yükleniyor...</div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {mevcutAtamalar.map((atama) => (
                  <li
                    key={atama.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <div className="font-semibold">{atama.unvan}</div>
                      <div className="text-xs text-blue-600">
                        &rarr; {atama.agirlikSeti.ad}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(atama.unvan)}
                      className="text-xs text-red-500"
                    >
                      Kaldır
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
