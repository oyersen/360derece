import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { baseQuestions, assignments, cycles, surveyTypes, getUser, getQuestionWeight } from "@/features/data";

export default function AssignmentsPage() {
  const [cycleId, setCycleId] = useState<number>(cycles[0].id);
  const [surveyTypeId, setSurveyTypeId] = useState<number>(surveyTypes[0].id);
  const [search, setSearch] = useState("");

  const filteredAssignments = useMemo(
    () =>
      assignments.filter(
        (a) =>
          a.cycleId === cycleId &&
          a.surveyTypeId === surveyTypeId &&
          getUser(a.evaluateeId).ad.toLowerCase().includes(search.toLowerCase())
      ),
    [cycleId, surveyTypeId, search]
  );

  const [openId, setOpenId] = useState<number | null>(null);

  const surveyType = surveyTypes.find((s) => s.id === surveyTypeId)!;
  const cycle = cycles.find((c) => c.id === cycleId)!;

  return (
    <PageShell>
      <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm mb-4">
        <div className="grid md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-zinc-600">Dönem</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
              value={cycleId}
              onChange={(e) => setCycleId(Number(e.target.value))}
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.ad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-600">Anket Tipi</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
              value={surveyTypeId}
              onChange={(e) => setSurveyTypeId(Number(e.target.value))}
            >
              {surveyTypes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-600">Değerlendirilen Kişi</label>
            <div className="relative mt-1">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                className="pl-7 pr-3 py-2 w-full border rounded-lg text-sm"
                placeholder="İsim ara…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="text-[11px] text-zinc-500">
            <div className="font-semibold mb-1">Kural Özeti</div>
            <div>• Personel + Müdür → Şef</div>
            <div>• Şef + Müdür → Personel</div>
            <div>• Personel + Şef → Müdür</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAssignments.map((a) => {
          const evaluatee = getUser(a.evaluateeId);
          const evaluators = a.evaluatorIds.map(getUser);
          const open = openId === a.id;

          return (
            <div key={a.id} className="rounded-2xl bg-white border border-zinc-200 shadow-sm">
              <button
                onClick={() => setOpenId((s) => (s === a.id ? null : a.id))}
                className="w-full px-5 py-3 flex items-center gap-3"
              >
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold">{evaluatee.ad}</div>
                  <div className="text-xs text-zinc-500">
                    {evaluatee.unvan} • {evaluatee.departman}
                  </div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-zinc-100 border">
                  {cycle.ad} • {surveyType.ad}
                </div>
                <div className="text-xs text-zinc-500">
                  {evaluators.length} değerlendirici
                </div>
                <div className="text-zinc-500">
                  {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {open && (
                <div className="px-5 pb-5 space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Değerlendiriciler</div>
                      <div className="flex flex-wrap gap-2">
                        {evaluators.map((u) => (
                          <span
                            key={u.id}
                            className="px-2 py-1 border rounded-full text-xs bg-zinc-50"
                          >
                            {u.ad} • {u.rol}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      Bu değerlendirmede soru ağırlıkları, {evaluatee.unvan} / {evaluatee.rol} için tanımlanan
                      kurallara göre otomatik hesaplanır.
                    </div>
                  </div>

                  <div className="rounded-xl border overflow-auto">
                    <table className="min-w-[900px] w-full text-sm">
                      <thead className="bg-zinc-50 text-xs">
                        <tr>
                          <th className="text-left p-2">Ana Başlık</th>
                          <th className="text-left p-2">Konu</th>
                          <th className="text-left p-2">Soru</th>
                          <th className="text-left p-2">Ağırlık</th>
                        </tr>
                      </thead>
                      <tbody>
                        {baseQuestions.map((q) => (
                          <tr key={q.id} className="border-t">
                            <td className="p-2">{q.ana}</td>
                            <td className="p-2">{q.konu}</td>
                            <td className="p-2">{q.metin}</td>
                            <td className="p-2">
                              {getQuestionWeight(q, evaluatee).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredAssignments.length === 0 && (
          <div className="text-xs text-zinc-500 border border-dashed rounded-xl p-4 bg-white/60">
            Seçilen dönem ve anket tipine ait atama bulunamadı.
          </div>
        )}
      </div>
    </PageShell>
  );
}
