import { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { apiClient } from "@/services/api";
import { theme } from "@/config/theme";

// --- Arayüz Tanımlamaları ---
// Dropdown'ları doldurmak için API'lerden gelen tipler
interface Donem {
  id: number;
  ad: string;
}
interface Sablon {
  id: number;
  ad: string;
}
interface Personel {
  id: string;
  isim: string;
  soyisim: string;
  rol: string;
  unvan: string;
}

// Bir şablonun detayını (sorularını) getirdiğimizde gelen tip
interface Soru {
  id: number;
  metin: string;
  agirlik: number;
}
interface KonuBaslik {
  id: number;
  ad: string;
  sorular: Soru[];
}
interface SablonDetay {
  id: number;
  ad: string;
  konuBasliklari: KonuBaslik[]; // Şablona bağlı konular ve o konulara bağlı sorular
}

// Backend'e POST /api/admin/cevap için göndereceğimiz nihai format
interface TopluCevapInput {
  donemId: number;
  sablonId: number;
  degerlendirenPersonelId: string | null; // 'isimsiz' anketler için null
  degerlendirilenPersonelId: string;
  cevaplar: {
    soruId: number;
    puan: number;
  }[];
}

export default function AdminCevapGiris() {
  // --- State Tanımlamaları ---

  // 1. Dropdown verileri
  const [donemler, setDonemler] = useState<Donem[]>([]);
  const [sablonlar, setSablonlar] = useState<Sablon[]>([]);
  const [personeller, setPersoneller] = useState<Personel[]>([]);

  // 2. Form Seçimleri
  const [selectedDonemId, setSelectedDonemId] = useState<number | "">("");
  const [selectedSablonId, setSelectedSablonId] = useState<number | "">("");
  const [selectedDegerlendirilenId, setSelectedDegerlendirilenId] =
    useState<string>("");
  const [selectedDegerlendirenId, setSelectedDegerlendirenId] =
    useState<string>(""); // (isimsiz için 'anonim' string'i)

  // 3. Dinamik Soru Listesi
  const [sablonDetay, setSablonDetay] = useState<SablonDetay | null>(null);

  // 4. Cevapların tutulduğu yer (Soru ID -> Puan)
  const [cevaplarMap, setCevaplarMap] = useState<Map<number, number>>(
    new Map()
  );

  const [loading, setLoading] = useState(true);

  // --- Veri Çekme (Data Fetching) ---

  // 1. Sayfa yüklendiğinde 3 ana dropdown'ı doldur
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true);
        const [donemRes, sablonRes, personelRes] = await Promise.all([
          apiClient.get("/admin/donem"),
          apiClient.get("/admin/sablon"),
          apiClient.get("/personel/all"), // Düz personel listesi
        ]);
        setDonemler(donemRes.data.data);
        setSablonlar(sablonRes.data.data);
        setPersoneller(personelRes.data.data);
      } catch (error) {
        alert(
          "Gerekli veriler (Dönem, Şablon, Personel) çekilemedi. Backend çalışıyor mu?"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDropdownData();
  }, []);

  // 2. Kullanıcı 'Anket Şablonu' seçtiğinde, o şablonun sorularını çek
  useEffect(() => {
    const fetchSorular = async () => {
      if (!selectedSablonId) {
        setSablonDetay(null);
        return;
      }
      try {
        setLoading(true);
        // GET /api/admin/sablon/:id
        const response = await apiClient.get(
          `/admin/sablon/${selectedSablonId}`
        );
        setSablonDetay(response.data.data);
        setCevaplarMap(new Map()); // Şablon değiştiğinde eski cevapları temizle
      } catch (error) {
        alert("Seçilen şablonun soruları getirilemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchSorular();
  }, [selectedSablonId]); // Bu 'useEffect' selectedSablonId her değiştiğinde çalışır

  // --- Form Fonksiyonları ---

  // Bir soruya puan verildiğinde (1-4)
  const handlePuanChange = (soruId: number, puan: number) => {
    setCevaplarMap((prevMap) => new Map(prevMap).set(soruId, puan));
  };

  // Formu temizle
  const resetForm = () => {
    setSelectedDonemId("");
    setSelectedSablonId("");
    setSelectedDegerlendirilenId("");
    setSelectedDegerlendirenId("");
    setSablonDetay(null);
    setCevaplarMap(new Map());
  };

  // Formu Kaydet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDonemId || !selectedSablonId || !selectedDegerlendirilenId) {
      alert("Dönem, Şablon ve Değerlendirilen Personel alanları zorunludur.");
      return;
    }

    const tumSorular =
      sablonDetay?.konuBasliklari.flatMap((k) => k.sorular) || [];
    if (cevaplarMap.size < tumSorular.length) {
      if (
        !window.confirm(
          "Tüm soruları cevaplamadınız. Yine de devam etmek istiyor musunuz?"
        )
      ) {
        return;
      }
    }

    // 1. Backend'e gönderilecek JSON payload'ını oluştur
    const payload: TopluCevapInput = {
      donemId: selectedDonemId,
      sablonId: selectedSablonId,
      degerlendirilenPersonelId: selectedDegerlendirilenId,
      // 'anonim' seçildiyse 'null' gönder, değilse personel ID'sini gönder
      degerlendirenPersonelId:
        selectedDegerlendirenId === "anonim" ? null : selectedDegerlendirenId,
      cevaplar: Array.from(cevaplarMap.entries()).map(([soruId, puan]) => ({
        soruId: soruId,
        puan: puan,
      })),
    };

    try {
      setLoading(true);
      // 2. API'ye POST isteği at
      // POST /api/admin/cevap
      await apiClient.post("/admin/cevap", payload);

      alert("Cevaplar başarıyla kaydedildi!");
      resetForm(); // Formu sıfırla
    } catch (error) {
      alert("Cevaplar kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const puanSecenekleri = [1, 2, 3, 4]; // (Veya 1-5 ise burayı değiştirin)

  return (
    <PageShell>
      <h1 className="text-xl font-semibold mb-4">Anket Cevap Girişi</h1>

      {loading && !sablonDetay && (
        <div className="p-4 text-sm text-zinc-500">
          Form verileri yükleniyor...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* --- 1. Bölüm: Üst Bilgiler --- */}
        <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm mb-6">
          <div className="text-sm font-semibold mb-4">
            Değerlendirme Bilgileri
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Dönem Seçimi */}
            <div>
              <label className="text-xs text-zinc-600">1. Anket Dönemi</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedDonemId}
                onChange={(e) =>
                  setSelectedDonemId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              >
                <option value="">Seçiniz...</option>
                {donemler.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.ad}
                  </option>
                ))}
              </select>
            </div>

            {/* Şablon Seçimi */}
            <div>
              <label className="text-xs text-zinc-600">
                2. Anket Şablonu (Test Tipi)
              </label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedSablonId}
                onChange={(e) =>
                  setSelectedSablonId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              >
                <option value="">Seçiniz...</option>
                {sablonlar.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ad}
                  </option>
                ))}
              </select>
            </div>

            {/* Değerlendirilen Kişi Seçimi */}
            <div>
              <label className="text-xs text-zinc-600">
                3. Değerlendirilen Personel (Kimin için?)
              </label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedDegerlendirilenId}
                onChange={(e) => setSelectedDegerlendirilenId(e.target.value)}
              >
                <option value="">Seçiniz...</option>
                {personeller.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.isim} {p.soyisim} ({p.unvan})
                  </option>
                ))}
              </select>
            </div>

            {/* Değerlendiren Kişi Seçimi */}
            <div>
              <label className="text-xs text-zinc-600">
                4. Değerlendiren Kişi (Kim doldurdu?)
              </label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={selectedDegerlendirenId}
                onChange={(e) => setSelectedDegerlendirenId(e.target.value)}
              >
                <option value="">Seçiniz...</option>
                <option value="anonim">(İsimsiz / Anonim Değerlendirme)</option>
                {personeller.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.isim} {p.soyisim} ({p.unvan})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- 2. Bölüm: Sorular --- */}
        {loading && selectedSablonId && (
          <div className="p-4 text-sm text-zinc-500">Sorular yükleniyor...</div>
        )}

        {sablonDetay && (
          <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">
              "{sablonDetay.ad}" Soruları
            </h2>

            <div className="space-y-6">
              {sablonDetay.konuBasliklari.map((konu) => (
                <div key={konu.id}>
                  <h3 className="text-md font-semibold text-blue-700 border-b pb-2 mb-3">
                    {konu.ad}
                  </h3>
                  <div className="space-y-4">
                    {konu.sorular.map((soru) => (
                      <div
                        key={soru.id}
                        className="grid grid-cols-4 gap-4 items-center"
                      >
                        <div className="col-span-3 text-sm">{soru.metin}</div>
                        <div className="col-span-1">
                          <select
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                            value={cevaplarMap.get(soru.id) || ""}
                            onChange={(e) =>
                              handlePuanChange(soru.id, Number(e.target.value))
                            }
                          >
                            <option value="">Puan Seçin</option>
                            {puanSecenekleri.map((puan) => (
                              <option key={puan} value={puan}>
                                {puan}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-6" />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ background: theme.brand.primary }}
              >
                {loading ? "Kaydediliyor..." : "Tüm Cevapları Kaydet"}
              </button>
            </div>
          </div>
        )}
      </form>
    </PageShell>
  );
}
