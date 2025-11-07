import { useMemo, useState } from "react";
import { History, FileText } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Field } from "@/components/common/Field";
import { savedSurveys, cycles, surveyTypes, getUser } from "@/features/data";

export default function SavedSurveysPage() {
  const [cycleId, setCycleId] = useState<number | "all">("all");
  const [durum, setDurum] = useState<"all" | "Taslak" | "Tamamlandı">("all");
  const [selectedId, setSelectedId] = useState<number | null>(savedSurveys[0]?.id ?? null);

  const filtered = useMemo(
    () =>
      savedSurveys.filter(
        (s) =>
          (cycleId === "all" || s.cycleId === cycleId) &&
          (durum === "all" || s.durum === durum)
      ),
    [cycleId, durum]
  );

  const selected = selectedId != null ? savedSurveys.find((s) => s.id === selectedId) ?? null : null;

  return (
    <PageShell>
      <div className="grid xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <History size={18} />
              Kayıtlı Anketler
            </div>
            <div className="text-xs text-zinc-500">
              Önceden kaydedilmiş anketleri açıp güncelleyebilirsiniz.
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-zinc-600">Dönem</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
                value={cycleId}
                onChange={(e) =>
                  setCycleId(e.target.value === "all" ? "all" : Number(e.target.value))
                }
              >
                <option value="all">Tümü</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.ad}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-600">Durum</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
                value={durum}
                onChange={(e) => setDurum(e.target.value as any)}
              >
                <option value="all">Tümü</option>
                <option value="Taslak">Taslak</option>
                <option value="Tamamlandı">Tamamlandı</option>
              </select>
            </div>
          </div>

          <div className="overflow-auto rounded-xl border">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-zinc-50 text-xs">
                <tr>
                  <th className="p-2 text-left">Tarih</th>
                  <th className="p-2 text-left">Dönem</th>
                  <th className="p-2 text-left">Anket</th>
                  <th className="p-2 text-left">Değerlendirilen</th>
                  <th className="p-2 text-left">Değerlendirici</th>
                  <th className="p-2 text-left">Durum</th>
                  <th className="p-2 text-left">Ort. Skor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const cyc = cycles.find((c) => c.id === s.cycleId)!;
                  const st = surveyTypes.find((t) => t.id === s.surveyTypeId)!;
                  const evale = getUser(s.evaluateeId);
                  const evalr = getUser(s.evaluatorId);
                  const selectedRow = s.id === selectedId;
                  return (
                    <tr
                      key={s.id}
                      className={`border-t cursor-pointer ${
                        selectedRow ? "bg-zinc-50" : "hover:bg-zinc-50/70"
                      }`}
                      onClick={() => setSelectedId(s.id)}
                    >
                      <td className="p-2 text-xs">{s.tarih}</td>
                      <td className="p-2 text-xs">{cyc.ad}</td>
                      <td className="p-2 text-xs">{st.ad}</td>
                      <td className="p-2 text-xs">
                        {evale.ad} • {evale.unvan}
                      </td>
                      <td className="p-2 text-xs">
                        {evalr.ad} • {evalr.rol}
                      </td>
                      <td className="p-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[11px] ${
                            s.durum === "Tamamlandı"
                              ? "border-emerald-400 text-emerald-700 bg-emerald-50"
                              : "border-amber-400 text-amber-700 bg-amber-50"
                          }`}
                        >
                          {s.durum}
                        </span>
                      </td>
                      <td className="p-2 text-xs">{s.ortSkor}</td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td className="p-3 text-xs text-zinc-500" colSpan={7}>
                      Filtrelere uyan kayıtlı anket bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} />
            <div className="text-sm font-semibold">Seçili Anket Özeti</div>
          </div>

          {selected && (
            <>
              {(() => {
                const cyc = cycles.find((c) => c.id === selected.cycleId)!;
                const st = surveyTypes.find((t) => t.id === selected.surveyTypeId)!;
                const evale = getUser(selected.evaluateeId);
                const evalr = getUser(selected.evaluatorId);
                return (
                  <>
                    <div className="grid gap-3 text-sm mb-3">
                      <Field label="Değerlendirilen" value={`${evale.ad} • ${evale.unvan}`} />
                      <Field label="Değerlendirici" value={`${evalr.ad} • ${evalr.rol}`} />
                      <Field label="Dönem" value={cyc.ad} />
                      <Field label="Anket" value={st.ad} />
                      <Field label="Tarih" value={selected.tarih} />
                      <Field label="Durum" value={selected.durum} />
                      <Field label="Ortalama Skor" value={`${selected.ortSkor} / 100`} />
                    </div>
                    <div className="text-[11px] text-zinc-500 mb-3">
                      <p>
                        <b>Düzenleme:</b> Gerçek uygulamada bu alandan ilgili anket tekrar açılıp puanlar güncellenir.
                        Şu an arayüz mock amaçlıdır.
                      </p>
                    </div>
                    <button
                      className="w-full px-3 py-2 rounded-lg text-sm text-white bg-blue-600"
                    >
                      Anketi Düzenlemek İçin Aç
                    </button>
                  </>
                );
              })()}
            </>
          )}

          {!selected && (
            <div className="text-xs text-zinc-500">
              Soldan bir kayıt seçerek detayları görüntüleyebilir ve düzenlemek üzere açabilirsiniz.
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
