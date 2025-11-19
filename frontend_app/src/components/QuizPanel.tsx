import React, { useMemo, useState } from "react";
import { QuizQuestion } from "../hooks/useQuiz";

type Props = {
  title: string;
  activityId: number;
  userId: string;
  questions: QuizQuestion[];
  onSubmit: (answers: number[]) => Promise<{
    score: number;
    passed: boolean;
    unlocked_next_lesson_id?: number | null;
  } | null>;
};

const QuizPanel: React.FC<Props> = ({ title, activityId, userId, questions, onSubmit }) => {
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; unlocked?: number | null } | null>(null);

  const allAnswered = useMemo(() => answers.every((a) => a >= 0 && a <= 3), [answers]);

  const handleSelect = (qIdx: number, optIdx: number) => {
    const next = [...answers];
    next[qIdx] = optIdx;
    setAnswers(next);
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    const resp = await onSubmit(answers);
    if (resp) {
      setResult({ score: resp.score, passed: resp.passed, unlocked: resp.unlocked_next_lesson_id ?? null });
    }
    setSubmitting(false);
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: 12, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
      <h3 style={{ marginTop: 0, color: "#111827" }}>{title}</h3>
      {questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{qi + 1}. {q.question}</div>
          <div style={{ display: "grid", gap: 8 }}>
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => handleSelect(qi, oi)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: selected ? "2px solid #2563EB" : "1px solid #e5e7eb",
                    background: selected ? "linear-gradient(to right, rgba(37,99,235,0.08), #f9fafb)" : "#fff",
                    color: "#111827",
                    cursor: "pointer"
                  }}
                >
                  {String.fromCharCode(65 + oi)}. {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          disabled={!allAnswered || submitting}
          onClick={handleSubmit}
          style={{
            background: "#2563EB",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 14px",
            cursor: allAnswered && !submitting ? "pointer" : "not-allowed",
            opacity: allAnswered && !submitting ? 1 : 0.6
          }}
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
        {result && (
          <div>
            <strong>Score:</strong> {result.score}% — {result.passed ? "Passed" : "Try again"}
            {result.unlocked ? (
              <span style={{ marginLeft: 8, color: "#F59E0B" }}>Next lesson unlocked (ID: {result.unlocked})</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPanel;
