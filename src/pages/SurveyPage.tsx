import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import {
  allUsers,
  baseQuestions,
  surveyTypes,
  getUser,
  getQuestionWeight,
  rolCarpani,
  type Rol,
} from "@/features/data";

export default function SurveyPage() {
  const [surveyTypeId, setSurveyTypeId] = useState<number>(1);
  const surveyType = surveyTypes.find((s) => s.id === surveyTypeId)!;

  const hedefKisiler = allUsers.filter((u) => u.rol === surveyType.hedefRol);
  const [evaluateeId, setEvaluateeId] = useState<number>(hedefKisiler[0]?.id ?? allUsers[0].id);
  const evaluatee = getUser(evaluateeId);

  const evaluatorCandidates = allUsers.filter((u) => u.id !== evaluateeId);
  const [evaluatorId, setEvaluatorId] = useState<number>(evaluatorCandidates[0]?.id ?? allUsers[0].id);

  const [puan, setPuan] = useState<Record<number, number>>({});
  const [yorum, setYorum] = useState<Record<number, string>>({});

  const setScore = (qid: number, val: number) =>
    setPuan((s) => ({
      ...s,
      [qid]: val,
    }));

  const setComment = (qid: number, text: string) =>
    setYorum((s) => ({
      ...s,
      [qid]: text,
    }));

  const saveDraft = () => {
    alert("Taslak kaydedildi (mock).");
  };

  const submit = () => {
    alert("Anket gönderildi (mock).");
  };

  const evaluator = getUser(evaluatorId);
  const rolKey = `${evaluator.rol}-${evaluatee.rol}` as `${Rol}-${Rol}`;
  const rolCarpan = rolCarpani[rolKey] ?? 1;

  return (
    <PageShell>
      <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm mb-4">
        <div className="grid lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-zinc-600">Anket Tipi</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
              value={surveyTypeId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSurveyTypeId(id);
                const st = surveyTypes.find((s) => s.id === id)!;
                const hedef = allUsers.find((u) => u.rol === st.hedefRol)!;
                setEvaluateeId(hedef.id);
              }}
            >
              {surveyTypes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-600">Değerlendirilen</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
              value={evaluateeId}
              onChange={(e) => setEvaluateeId(Number(e.target.value))}
            >
              {hedefKisiler.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ad} • {k.unvan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-600">Değerlendirici</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white text-sm"
              value={evaluatorId}
              onChange={(e) => setEvaluatorId(Number(e.target.value))}
            >
              {evaluatorCandidates.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ad} • {k.rol}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-zinc-500">
            <div className="font-semibold mb-1">Kullanım Amacı</div>
            Kağıt ortamda yapılmış bir değerlendirmeyi, ilgili kişiyi ve anket tipini seçip dijital olarak sisteme
            aktarmak için bu ekran kullanılır.
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-sm">{evaluatee.ad}</div>
            <div className="text-xs text-zinc-500">
              {evaluatee.unvan} • {surveyType.ad}
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            Rol çarpanı: {rolCarpan.toFixed(2)}
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-[950px] w-full text-sm">
            <thead className="bg-zinc-50 text-xs">
              <tr>
                <th className="p-2 text-left">Ana Başlık</th>
                <th className="p-2 text-left">Konu</th>
                <th className="p-2 text-left">Soru</th>
                <th className="p-2 text-left">Ağırlık</th>
                <th className="p-2 text-left">Puan (1–5)</th>
                <th className="p-2 text-left">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {baseQuestions.map((q) => {
                const w = getQuestionWeight(q, evaluatee);
                return (
                  <tr key={q.id} className="border-t">
                    <td className="p-2">{q.ana}</td>
                    <td className="p-2">{q.konu}</td>
                    <td className="p-2">{q.metin}</td>
                    <td className="p-2">{w.toFixed(2)}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        className="border rounded px-2 py-1 w-20"
                        value={Number.isFinite(puan[q.id]) ? puan[q.id] : ""}
                        onChange={(e) => setScore(q.id, Number(e.target.value))}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Kısa not (opsiyonel)"
                        value={yorum[q.id] ?? ""}
                        onChange={(e) => setComment(q.id, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={saveDraft} className="px-3 py-2 rounded-lg border bg-white text-sm">
            Taslak Kaydet
          </button>
          <button
            onClick={submit}
            className="px-3 py-2 rounded-lg text-sm text-white bg-blue-600"
          >
            Gönder
          </button>
        </div>
      </div>
    </PageShell>
  );
}
