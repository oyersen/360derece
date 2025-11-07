import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Field } from "@/components/common/Field";
import {
  surveyTypes,
  type Rol,
  type AnaKey,
  BuilderQuestion,
} from "@/features/data";
import { theme } from "@/config/theme";

export default function SurveyBuilderPage() {
  const [ad, setAd] = useState("");
  const [surveyTypeId, setSurveyTypeId] = useState<number | "">("");
  const [hedefRol, setHedefRol] = useState<Rol | "">("");

  const [questions, setQuestions] = useState<BuilderQuestion[]>([
    { id: 1, anaKey: "", konu: "", metin: "", defaultWeight: "" },
  ]);

  const addRow = () => {
    setQuestions((prev) => [
      ...prev,
      { id: Date.now(), anaKey: "", konu: "", metin: "", defaultWeight: "" },
    ]);
  };

  const removeRow = (id: number) => {
    setQuestions((prev) =>
      prev.length === 1 ? prev : prev.filter((q) => q.id !== id)
    );
  };

  const updateQuestion = <K extends keyof BuilderQuestion>(
    id: number,
    key: K,
    value: BuilderQuestion[K]
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [key]: value } : q))
    );
  };

  const toplamAgirlik = useMemo(
    () =>
      questions.reduce(
        (acc, q) =>
          acc + (typeof q.defaultWeight === "number" ? q.defaultWeight : 0),
        0
      ),
    [questions]
  );

  const soruSayisi = questions.filter(
    (q) => q.anaKey && q.konu && q.metin && q.defaultWeight !== ""
  ).length;

  const handleCreate = () => {
    if (!ad || !surveyTypeId || !hedefRol) {
      alert("Anket adı, anket tipi ve hedef rol zorunludur.");
      return;
    }

    const doluSorular = questions.filter(
      (q) => q.anaKey && q.konu && q.metin && q.defaultWeight !== ""
    );

    if (doluSorular.length === 0) {
      alert("En az bir soru tanımlamalısınız.");
      return;
    }

    const payload = {
      ad,
      surveyTypeId,
      hedefRol,
      sorular: doluSorular.map((q) => ({
        anaKey: q.anaKey as AnaKey,
        konu: q.konu,
        metin: q.metin,
        defaultWeight: Number(q.defaultWeight),
      })),
    };

    console.log("Yeni anket şablonu (mock payload):", payload);
    alert("Anket şablonu oluşturuldu (mock). Konsolda JSON görebilirsin.");
  };

  return (
    <PageShell>
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Sol: Form + sorular */}
        <div className="xl:col-span-2 space-y-4">
          {/* Üst form */}
          <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <div className="text-sm font-semibold">Anket Oluştur</div>
              </div>
              <div className="text-xs text-zinc-500">
                Anketin temel bilgilerini girin, ardından soru listesini
                doldurun.
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-zinc-600">Anket Adı</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Örn: 2025 Personel 360°"
                  value={ad}
                  onChange={(e) => setAd(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-600">Anket Tipi</label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
                  value={surveyTypeId}
                  onChange={(e) =>
                    setSurveyTypeId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                >
                  <option value="">Seçiniz</option>
                  {surveyTypes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.ad}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-600">Hedef Rol</label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
                  value={hedefRol}
                  onChange={(e) => setHedefRol(e.target.value as Rol | "")}
                >
                  <option value="">Seçiniz</option>
                  <option value="PERSONEL">Personel</option>
                  <option value="ŞEF">Şef</option>
                  <option value="MÜDÜR">Müdür</option>
                </select>
              </div>
            </div>
          </div>

          {/* Soru listesi */}
          <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Anket Soruları</div>
              <button
                type="button"
                onClick={addRow}
                className="px-3 py-1.5 rounded-lg border bg-white text-xs"
              >
                + Soru Satırı Ekle
              </button>
            </div>

            <div className="overflow-auto rounded-xl border">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-zinc-50 text-xs">
                  <tr>
                    <th className="p-2 text-left w-40">Ana Başlık</th>
                    <th className="p-2 text-left w-48">Konu</th>
                    <th className="p-2 text-left">Soru</th>
                    <th className="p-2 text-left w-32">Vars. Ağırlık</th>
                    <th className="p-2 text-left w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id} className="border-t">
                      <td className="p-2">
                        <select
                          className="w-full border rounded px-2 py-1 text-xs bg-white"
                          value={q.anaKey}
                          onChange={(e) =>
                            updateQuestion(
                              q.id,
                              "anaKey",
                              e.target.value as AnaKey | ""
                            )
                          }
                        >
                          <option value="">Seçiniz</option>
                          <option value="MESLEKI">Mesleki Yeterlilik</option>
                          <option value="DAVRANISSAL">
                            Davranışsal Yeterlilik
                          </option>
                          <option value="BIREYSEL">Bireysel Yeterlilik</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="Konu"
                          value={q.konu}
                          onChange={(e) =>
                            updateQuestion(q.id, "konu", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="Soru metni"
                          value={q.metin}
                          onChange={(e) =>
                            updateQuestion(q.id, "metin", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          className="w-full border rounded px-2 py-1 text-xs"
                          placeholder="0.0"
                          value={q.defaultWeight === "" ? "" : q.defaultWeight}
                          onChange={(e) =>
                            updateQuestion(
                              q.id,
                              "defaultWeight",
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

                  {questions.length === 0 && (
                    <tr>
                      <td className="p-3 text-xs text-zinc-500" colSpan={5}>
                        Henüz soru satırı yok. “Soru Satırı Ekle” butonunu
                        kullanın.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg text-sm text-white"
                style={{ background: theme.brand.primary }}
              >
                Anketi Oluştur
              </button>
            </div>
          </div>
        </div>

        {/* Sağ: Özet */}
        <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm space-y-4">
          <div className="text-sm font-semibold">Anket Özeti</div>
          <div className="grid gap-3 text-sm">
            <Field label="Anket Adı" value={ad || "-"} />
            <Field
              label="Anket Tipi"
              value={
                surveyTypeId
                  ? surveyTypes.find((s) => s.id === surveyTypeId)?.ad ?? "-"
                  : "-"
              }
            />
            <Field label="Hedef Rol" value={hedefRol || "-"} />
            <Field label="Tanımlanan Soru Sayısı" value={soruSayisi} />
            <Field
              label="Toplam Varsayılan Ağırlık"
              value={toplamAgirlik.toFixed(2)}
            />
          </div>
          <div className="text-[11px] text-zinc-500">
            <p>
              Bu özet, oluşturduğunuz anket şablonunun temel parametrelerini
              gösterir. Gerçek sistemde bu veriler, API ile sunucuya
              kaydedilecektir.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
