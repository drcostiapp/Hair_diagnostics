import { ScoreCard } from "./ScoreCard";
import { ViolationTag } from "./ViolationTag";
import type { Evaluation } from "@/types/database";

export function EvaluationPanel({
  evaluation,
  coachFeedback,
}: {
  evaluation: Evaluation;
  coachFeedback?: string | null;
}) {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <ScoreCard label="Tone & Elegance" value={evaluation.tone_score} max={25} />
        <ScoreCard label="SOP Accuracy" value={evaluation.sop_score} max={25} />
        <ScoreCard label="Brevity & Control" value={evaluation.brevity_score} max={20} />
        <ScoreCard label="Emotional Intelligence" value={evaluation.emotional_score} max={20} />
        <ScoreCard label="Luxury Discipline" value={evaluation.discipline_score} max={10} />
      </section>

      {evaluation.luxury_violations.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-anchor mb-3">Luxury Violations</h3>
          <div className="flex flex-wrap gap-2">
            {evaluation.luxury_violations.map((v, i) => (
              <ViolationTag key={i} label={v} />
            ))}
          </div>
        </section>
      )}

      {(evaluation.best_response || evaluation.weakest_response) && (
        <section className="grid md:grid-cols-2 gap-4">
          {evaluation.best_response && (
            <div className="rounded-luxe border border-champagne/40 bg-ivory-warm p-5">
              <div className="text-[11px] tracking-luxe uppercase text-champagne mb-2">
                Best Response
              </div>
              <p className="text-sm text-anchor leading-relaxed italic">
                &ldquo;{evaluation.best_response}&rdquo;
              </p>
            </div>
          )}
          {evaluation.weakest_response && (
            <div className="rounded-luxe border border-bronze/30 bg-ivory-warm p-5">
              <div className="text-[11px] tracking-luxe uppercase text-bronze mb-2">
                Weakest Response
              </div>
              <p className="text-sm text-anchor leading-relaxed italic">
                &ldquo;{evaluation.weakest_response}&rdquo;
              </p>
            </div>
          )}
        </section>
      )}

      {evaluation.corrected_responses.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-anchor mb-3">Corrected Gold-Standard</h3>
          <div className="space-y-4">
            {evaluation.corrected_responses.map((c, i) => (
              <div
                key={i}
                className="rounded-luxe border border-anchor/10 bg-white p-5 shadow-quiet"
              >
                <div className="text-[11px] tracking-luxe uppercase text-bronze mb-1">
                  You said
                </div>
                <p className="text-sm text-anchor/80 italic">&ldquo;{c.original}&rdquo;</p>
                <div className="divider my-4" />
                <div className="text-[11px] tracking-luxe uppercase text-champagne mb-1">
                  Gold Standard
                </div>
                <p className="text-sm text-anchor leading-relaxed">&ldquo;{c.corrected}&rdquo;</p>
                {c.why && <p className="text-xs text-bronze mt-3">Why: {c.why}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {coachFeedback && (
        <section>
          <h3 className="font-display text-xl text-anchor mb-3">Coach&apos;s Notes</h3>
          <div className="rounded-luxe border border-anchor/10 bg-white p-6 shadow-quiet whitespace-pre-wrap text-sm leading-relaxed text-anchor">
            {coachFeedback}
          </div>
        </section>
      )}

      {evaluation.recommendation && (
        <section className="rounded-luxe border border-champagne/50 bg-champagne/10 p-5">
          <div className="text-[11px] tracking-luxe uppercase text-anchor mb-1">
            Recommended Next Step
          </div>
          <p className="text-sm text-anchor">{evaluation.recommendation}</p>
        </section>
      )}
    </div>
  );
}
