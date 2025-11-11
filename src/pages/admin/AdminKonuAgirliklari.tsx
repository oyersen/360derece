import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell";
import { apiClient } from "@/services/api";
import { theme } from "@/config/theme";

// --- ARAYÜZ TANIMLAMALARI (DÜZELTİLMİŞ) ---

// Backend'den gelen AnaBaslik objesinin tipi
interface AnaBaslik {
  id: number;
  ad: string;
}

// Backend'den gelen KonuBaslik objesinin tipi
interface KonuBaslik {
  id: number;
  ad: string;
  anaBaslik: AnaBaslik | null; // <-- HATA BURADAYDI, EKLENDİ
}

// Bir Ağırlık Setine bağlı KonuAgirligi'nın tipi
interface KonuAgirligi {
  id: number;
  agirlik: number;
  konuBaslik: KonuBaslik; // <-- Bu artık 'anaBaslik' içeren 'KonuBaslik' tipini kullanır
}

// Ağırlık Seti'nin (detay) tipi
interface AgirlikSeti {
  id: number;
  ad: string;
  konuAgirliklari: KonuAgirligi[]; // Sete zaten bağlı olan ağırlıklar
}
// --- BİTTİ ---

export default function AdminKonuAgirliklari() {
  const { setId } = useParams<{ setId: string }>(); // URL'den set ID'sini al

  // State'ler
  const [agirlikSeti, setAgirlikSeti] = useState<AgirlikSeti | null>(null);
  const [tumKonular, setTumKonular] = useState<KonuBaslik[]>([]);
  const [agirlikInputs, setAgirlikInputs] = useState<Record<number, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  // Veri çeken fonksiyon
  const fetchData = async () => {
    if (!setId) return;
    try {
      setLoading(true);
      const [setRes, konularRes] = await Promise.all([
        apiClient.get(`/admin/agirlik-seti/${setId}`), // 1. Bu Seti ve mevcut ağırlıklarını çek
        apiClient.get("/admin/konu"), // 2. Kütüphanedeki tüm konuları çek (anaBaslik ile)
      ]);

      const set: AgirlikSeti = setRes.data.data;
      setAgirlikSeti(set);
      setTumKonular(konularRes.data.data);

      // Mevcut ağırlıkları input'lara doldurmak için bir 'state' oluştur
      const initialInputs: Record<number, string> = {};
      set.konuAgirliklari.forEach((agirlik) => {
        initialInputs[agirlik.konuBaslik.id] = String(agirlik.agirlik);
      });
      setAgirlikInputs(initialInputs);
    } catch (error) {
      alert("Ağırlık Seti veya Konu Başlıkları çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [setId]);

  // Input'taki değeri state'e kaydet
  const handleInputChange = (konuId: number, value: string) => {
    setAgirlikInputs((prev) => ({
      ...prev,
      [konuId]: value,
    }));
  };

  // Tek bir Konu Ağırlığını API'ye kaydetme
  const handleSaveAgirlik = async (konuId: number) => {
    const agirlikStr = agirlikInputs[konuId];
    // Eğer input boş veya 0 ise, ağırlığı "sil" (veya 0 olarak ayarla)
    const agirlik =
      agirlikStr && Number(agirlikStr) > 0 ? Number(agirlikStr) : 0;

    if (agirlik > 1) {
      alert("Ağırlık 1.00'den büyük olamaz (Örn: 0.7 = %70)");
      return;
    }

    try {
      // POST /api/admin/agirlik-seti/konu-agirligi
      await apiClient.post("/admin/agirlik-seti/konu-agirligi", {
        setId: Number(setId),
        konuId: konuId,
        agirlik: agirlik,
      });
      alert(`Ağırlık kaydedildi: ${agirlik}`);
      fetchData(); // Güncel veriyi çek
    } catch (error) {
      alert("Ağırlık kaydedilirken hata oluştu.");
    }
  };

  if (loading || !agirlikSeti) {
    return <PageShell>Yükleniyor...</PageShell>;
  }

  // Toplam ağırlığı hesapla (kullanıcıya göstermek için)
  const toplamAgirlik = Object.values(agirlikInputs).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );

  return (
    <PageShell>
      <Link
        to="/admin/agirlik-setleri"
        className="text-sm text-blue-600 mb-2 block"
      >
        &larr; Tüm Ağırlık Setlerine Dön
      </Link>
      <h1 className="text-xl font-semibold">Konu Ağırlıklandırma</h1>
      <p className="text-sm text-zinc-600 mb-4">
        Set Adı: <span className="font-semibold">{agirlikSeti.ad}</span>
      </p>

      <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="text-sm font-semibold">
            Konu Başlıkları ve Ağırlıkları
          </div>
          <div
            className={`text-sm font-semibold ${
              toplamAgirlik > 1.0 ? "text-red-500" : "text-blue-600"
            }`}
          >
            Toplam Ağırlık: {toplamAgirlik.toFixed(2)} / 1.00
            {toplamAgirlik > 1.0 && " (UYARI: Toplam 1.0'i geçti!)"}
          </div>
        </div>

        <ul className="divide-y divide-zinc-100">
          {tumKonular.map((konu) => (
            <li
              key={konu.id}
              className="p-4 grid grid-cols-3 items-center gap-4"
            >
              {/* Konu Adı */}
              <div className="col-span-1">
                <div className="font-semibold">{konu.ad}</div>
                {/* --- DÜZELTME BURADA --- */}
                <div className="text-xs text-zinc-500">
                  (Ana Başlık:{" "}
                  {konu.anaBaslik ? konu.anaBaslik.ad : "Atanmamış"})
                </div>
              </div>

              {/* Ağırlık Inputu */}
              <div className="col-span-1">
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="0.0 (Örn: 0.7)"
                  value={agirlikInputs[konu.id] || ""}
                  onChange={(e) => handleInputChange(konu.id, e.target.value)}
                />
              </div>

              {/* Kaydet Butonu */}
              <div className="col-span-1">
                <button
                  onClick={() => handleSaveAgirlik(konu.id)}
                  className="px-4 py-2 rounded-lg text-sm text-white"
                  style={{ background: theme.brand.primary }}
                >
                  Kaydet
                </button>
              </div>
            </li>
          ))}
          {tumKonular.length === 0 && (
            <li className="p-4 text-sm text-zinc-500">
              Sistemde henüz 'Konu Başlığı' tanımlanmamış. Lütfen önce konu
              ekleyin.
            </li>
          )}
        </ul>
      </div>
    </PageShell>
  );
}
