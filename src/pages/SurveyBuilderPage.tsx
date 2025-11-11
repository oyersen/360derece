import { useMemo, useState, useEffect } from "react"; // <-- useEffect eklendi
import { Filter } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Field } from "@/components/common/Field";
// import { surveyTypes, type Rol, type AnaKey, BuilderQuestion } from "@/features/data"; // <-- Mock datayı sildik
import { theme } from "@/config/theme";
import { apiClient } from "@/services/api"; // <-- YENİ API İSTEMCİMİZ

// --- ARAYÜZLERİ DOĞRUDAN BURADA (veya /types altında) TANIMLAYALIM ---
// (Backend'deki Entity'lerimize karşılık gelen arayüzler)
interface AnaBaslik {
  id: number;
  ad: string;
}
interface KonuBaslik {
  id: number;
  ad: string;
  anaBaslik: AnaBaslik;
}
interface AnketSablonu {
  id: number;
  ad: string;
}

// Frontend'in soru satırı için kullandığı tip
interface BuilderQuestion {
  id: number | string; // (Yeni eklenenler string ID alabilir)
  anaBaslikId: number | ""; // (Artık AnaBaslik ID'sini tutacağız)
  konuAdi: string; // (Konu adı)
  soruMetni: string;
  soruAgirligi: number | "";
}

// Backend'e göndereceğimiz nihai payload (yeni servislerle)
interface CreateAnketPayload {
  sablonAdi: string;
  konular: {
    anaBaslikId: number;
    konuAdi: string;
    sorular: {
      metin: string;
      agirlik: number;
    }[];
  }[];
}

export default function SurveyBuilderPage() {
  const [sablonAdi, setSablonAdi] = useState("");

  // --- STATE GÜNCELLEMESİ ---
  // Artık Ana Başlıkları backend'den çekeceğiz
  const [anaBasliklar, setAnaBasliklar] = useState<AnaBaslik[]>([]);
  const [questions, setQuestions] = useState<BuilderQuestion[]>([
    { id: 1, anaBaslikId: "", konuAdi: "", soruMetni: "", soruAgirligi: 1.0 },
  ]);

  // --- YENİ: VERİ ÇEKME ---
  // Sayfa yüklendiğinde Ana Başlıkları API'den çek
  useEffect(() => {
    const fetchAnaBasliklar = async () => {
      try {
        // GET /api/admin/ana-baslik
        const response = await apiClient.get("/admin/ana-baslik");
        setAnaBasliklar(response.data.data);
      } catch (error) {
        alert(
          "Ana Başlıklar yüklenemedi. Backend sunucusunun çalıştığından emin olun."
        );
      }
    };
    fetchAnaBasliklar();
  }, []); // [] = Sadece bir kez çalıştır

  // ... (addRow, removeRow, updateQuestion fonksiyonları güncellendi)
  const addRow = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        anaBaslikId: "",
        konuAdi: "",
        soruMetni: "",
        soruAgirligi: 1.0,
      },
    ]);
  };
  const removeRow = (id: number | string) => {
    /* ... */
  };
  const updateQuestion = <K extends keyof BuilderQuestion>(
    id: number | string,
    key: K,
    value: BuilderQuestion[K]
  ) => {
    /* ... */
  };

  // --- GÜNCELLENDİ: handleCreate (Gerçek API Çağrıları) ---
  const handleCreate = async () => {
    if (!sablonAdi) {
      alert("Anket şablonu adı zorunludur.");
      return;
    }

    // 1. Adım: Veriyi grupla ve payload'ı hazırla
    const payload: CreateAnketPayload = {
      sablonAdi: sablonAdi,
      konular: [],
    };

    // Geçici bir Map kullanarak soruları AnaBaşlık ve Konu'ya göre grupla
    const konularMap = new Map<
      string,
      { anaBaslikId: number; sorular: { metin: string; agirlik: number }[] }
    >();

    for (const q of questions) {
      if (q.anaBaslikId && q.konuAdi && q.soruMetni && q.soruAgirligi !== "") {
        const grupKey = `${q.anaBaslikId}-${q.konuAdi}`;

        if (!konularMap.has(grupKey)) {
          konularMap.set(grupKey, {
            anaBaslikId: q.anaBaslikId,
            sorular: [],
          });
        }

        konularMap.get(grupKey)!.sorular.push({
          metin: q.soruMetni,
          agirlik: Number(q.soruAgirligi),
        });
      }
    }

    if (konularMap.size === 0) {
      alert("En az bir tam doldurulmuş soru satırı gereklidir.");
      return;
    }

    // Map'i payload'a aktar
    konularMap.forEach((value, key) => {
      payload.konular.push({
        anaBaslikId: value.anaBaslikId,
        konuAdi: key.split("-")[1], // '1-Teknik Kapasite' key'inden 'Teknik Kapasite'yi al
        sorular: value.sorular,
      });
    });

    console.log(
      "Backend'e gönderilecek Payload:",
      JSON.stringify(payload, null, 2)
    );

    try {
      // 2. Adım: Yeni Anket Şablonunu oluştur
      // POST /api/admin/sablon
      const sablonResponse = await apiClient.post("/admin/sablon", {
        ad: payload.sablonAdi,
        aciklama: "Frontendden oluşturuldu",
      });
      const yeniSablonId = sablonResponse.data.data.id;

      // 3. Adım: Konuları ve Soruları oluştur (Döngü ile)
      for (const konu of payload.konular) {
        // 3a. KonuBaşlığı oluştur (AnaBaşlığa bağla)
        // POST /api/admin/konu
        const konuResponse = await apiClient.post("/admin/konu", {
          ad: konu.konuAdi,
          anaBaslikId: konu.anaBaslikId,
        });
        const yeniKonuId = konuResponse.data.data.id;

        // 3b. Bu konuyu Şablona bağla
        // POST /api/admin/sablon/konu-iliskisi
        await apiClient.post("/admin/sablon/konu-iliskisi", {
          sablonId: yeniSablonId,
          konuId: yeniKonuId,
        });

        // 3c. Soruları oluştur (Konuya bağla)
        for (const soru of konu.sorular) {
          // POST /api/admin/soru
          await apiClient.post("/admin/soru", {
            metin: soru.metin,
            konuId: yeniKonuId,
            // (Soru ağırlığını da göndermemiz gerekiyor - Soru entity'sini güncellediğimizi varsayarak)
            agirlik: soru.agirlik,
          });
        }
      }

      alert(
        `Başarılı! "${payload.sablonAdi}" şablonu ve ${payload.konular.length} konu (sorularıyla birlikte) oluşturuldu.`
      );
      // Formu temizle
      setSablonAdi("");
      setQuestions([
        {
          id: 1,
          anaBaslikId: "",
          konuAdi: "",
          soruMetni: "",
          soruAgirligi: 1.0,
        },
      ]);
    } catch (error) {
      alert(
        "Anket oluşturulurken bir hata oluştu. Lütfen konsolu kontrol edin."
      );
    }
  };

  return (
    <PageShell>
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Sol: Form + sorular */}
        <div className="xl:col-span-2 space-y-4">
          {/* Üst form */}
          <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-zinc-600">
                  Anket Şablonu Adı
                </label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Örn: 2025 Şef -> Personel"
                  value={sablonAdi}
                  onChange={(e) => setSablonAdi(e.target.value)}
                />
              </div>
              {/* Diğer 2 select (Anket Tipi, Hedef Rol) kaldırıldı,
                  çünkü bu mantık artık şablon adı ve ağırlık setleri ile yönetiliyor */}
            </div>
          </div>

          {/* Soru listesi */}
          <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
            {/* ... (Soru Ekle butonu) ... */}
            <div className="overflow-auto rounded-xl border">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-zinc-50 text-xs">
                  <tr>
                    <th className="p-2 text-left w-40">Ana Başlık</th>
                    <th className="p-2 text-left w-48">Konu Adı</th>
                    <th className="p-2 text-left">Soru Metni</th>
                    <th className="p-2 text-left w-32">
                      Soru Ağırlığı (Konu içi)
                    </th>
                    <th className="p-2 text-left w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id} className="border-t">
                      <td className="p-2">
                        {/* --- GÜNCELLEME: Ana Başlıklar artık API'den geliyor --- */}
                        <select
                          className="w-full border rounded px-2 py-1 text-xs bg-white"
                          value={q.anaBaslikId}
                          onChange={(e) =>
                            updateQuestion(
                              q.id,
                              "anaBaslikId",
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                        >
                          <option value="">Seçiniz</option>
                          {anaBasliklar.map((baslik) => (
                            <option key={baslik.id} value={baslik.id}>
                              {baslik.ad}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="Örn: Teknik Kapasite"
                          value={q.konuAdi}
                          onChange={(e) =>
                            updateQuestion(q.id, "konuAdi", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="Örn: Yazılım mimarisi kurma becerisi..."
                          value={q.soruMetni}
                          onChange={(e) =>
                            updateQuestion(q.id, "soruMetni", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="1.0"
                          value={q.soruAgirligi}
                          onChange={(e) =>
                            updateQuestion(
                              q.id,
                              "soruAgirligi",
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeRow(q.id)}
                          className="text-xs text-red-500"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg text-sm text-white"
                style={{ background: theme.brand.primary }}
              >
                Tümünü Oluştur (API'ye Gönder)
              </button>
            </div>
          </div>
        </div>

        {/* Sağ: Özet (Artık gerekli değil, kaldırılabilir veya sadeleştirilebilir) */}
      </div>
    </PageShell>
  );
}
