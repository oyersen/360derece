import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell";
import { apiClient } from "@/services/api";
import { theme } from "@/config/theme";

// Backend'den gelen tipler
interface KonuBaslik {
  id: number;
  ad: string;
}
interface AnketSablonu {
  id: number;
  ad: string;
  konuBasliklari: KonuBaslik[]; // Şablona zaten bağlı olan konular
}

export default function AdminSablonDetay() {
  const { id } = useParams<{ id: string }>(); // URL'den şablonun ID'sini al
  const [sablon, setSablon] = useState<AnketSablonu | null>(null);
  const [tumKonular, setTumKonular] = useState<KonuBaslik[]>([]);
  const [loading, setLoading] = useState(true);

  // Şablonu ve Kütüphanedeki tüm konuları çeken fonksiyon
  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // İki API isteğini aynı anda yap
      const [sablonRes, konularRes] = await Promise.all([
        apiClient.get(`/admin/sablon/${id}`), // 1. Bu şablonu ve bağlı konuları çek
        apiClient.get("/admin/konu"), // 2. Kütüphanedeki tüm konuları çek
      ]);
      setSablon(sablonRes.data.data);
      setTumKonular(konularRes.data.data);
    } catch (error) {
      alert("Şablon veya Konu verisi çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]); // ID değiştiğinde veriyi yeniden çek

  // Bir konuyu şablona ekleme fonksiyonu
  const handleAddKonu = async (konuId: number) => {
    try {
      // POST /api/admin/sablon/konu-iliskisi
      await apiClient.post("/admin/sablon/konu-iliskisi", {
        sablonId: Number(id),
        konuId: konuId,
      });
      // Başarıdan sonra listeyi yenile
      fetchData();
    } catch (error) {
      alert("Konu eklenirken hata oluştu.");
    }
  };

  // Bir konuyu şablondan çıkarma fonksiyonu
  const handleRemoveKonu = async (konuId: number) => {
    try {
      // DELETE /api/admin/sablon/:sablonId/konu/:konuId
      await apiClient.delete(`/admin/sablon/${id}/konu/${konuId}`);
      // Başarıdan sonra listeyi yenile
      fetchData();
    } catch (error) {
      alert("Konu kaldırılırken hata oluştu.");
    }
  };

  if (loading) {
    return <PageShell>Yükleniyor...</PageShell>;
  }

  if (!sablon) {
    return <PageShell>Şablon bulunamadı.</PageShell>;
  }

  // Şablona henüz eklenmemiş olan, "kütüphanedeki" konuları filtrele
  const eklenmemisKonular = tumKonular.filter(
    (konu) => !sablon.konuBasliklari.some((ekliKonu) => ekliKonu.id === konu.id)
  );

  return (
    <PageShell>
      <Link to="/admin/sablonlar" className="text-sm text-blue-600 mb-2 block">
        &larr; Tüm Şablonlara Dön
      </Link>
      <h1 className="text-xl font-semibold mb-4">
        Şablonu Düzenle: "{sablon.ad}"
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* --- Sol Taraf: Şablona Ekli Konular --- */}
        <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm">
          <div className="p-4 border-b">
            <div className="text-sm font-semibold">
              Şablondaki Konu Başlıkları ({sablon.konuBasliklari.length})
            </div>
          </div>
          <ul className="divide-y divide-zinc-100">
            {sablon.konuBasliklari.map((konu) => (
              <li
                key={konu.id}
                className="flex items-center justify-between p-4"
              >
                <div className="font-semibold">{konu.ad}</div>
                <button
                  onClick={() => handleRemoveKonu(konu.id)}
                  className="text-xs text-red-500"
                >
                  Kaldır
                </button>
              </li>
            ))}
            {sablon.konuBasliklari.length === 0 && (
              <li className="p-4 text-sm text-zinc-500">
                Bu şablonda henüz konu başlığı yok.
              </li>
            )}
          </ul>
        </div>

        {/* --- Sağ Taraf: Kütüphanedeki Eklenmemiş Konular --- */}
        <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm">
          <div className="p-4 border-b">
            <div className="text-sm font-semibold">
              Kütüphaneden Konu Ekle ({eklenmemisKonular.length})
            </div>
          </div>
          <ul className="divide-y divide-zinc-100">
            {eklenmemisKonular.map((konu) => (
              <li
                key={konu.id}
                className="flex items-center justify-between p-4"
              >
                <div className="font-semibold">{konu.ad}</div>
                <button
                  onClick={() => handleAddKonu(konu.id)}
                  className="text-xs text-green-600"
                >
                  Ekle +
                </button>
              </li>
            ))}
            {eklenmemisKonular.length === 0 && (
              <li className="p-4 text-sm text-zinc-500">
                Kütüphanedeki tüm konular bu şablona eklenmiş.
              </li>
            )}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
