import React, { useEffect, useState } from "react";
import { useQuiz, LessonQuiz } from "../hooks/useQuiz";
import QuizPanel from "./QuizPanel";

type Props = {
  lessonId: number;
  userId: string;
};

const LessonQuizWidget: React.FC<Props> = ({ lessonId, userId }) => {
  const { loading, error, generateQuiz, fetchLessonQuiz, submitQuiz } = useQuiz();
  const [quiz, setQuiz] = useState<LessonQuiz | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const q = await fetchLessonQuiz(lessonId);
      if (mounted) setQuiz(q);
    };
    init();
    return () => {
      mounted = false;
    };
  }, [lessonId, fetchLessonQuiz]);

  const handleGenerate = async () => {
    setBusy(true);
    const q = await generateQuiz(lessonId, 70);
    if (q) setQuiz(q);
    setBusy(false);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!quiz && (
        <button
          onClick={handleGenerate}
          disabled={busy || loading}
          style={{
            background: "#F59E0B",
            color: "#111827",
            border: "none",
            borderRadius: 8,
            padding: "10px 14px",
            cursor: busy || loading ? "not-allowed" : "pointer",
            opacity: busy || loading ? 0.7 : 1
          }}
        >
          {busy || loading ? "Generating..." : "Generate Quiz with AI"}
        </button>
      )}

      {error && <div style={{ color: "#EF4444" }}>{error}</div>}

      {quiz && (
        <QuizPanel
          title={quiz.title}
          activityId={quiz.activity_id}
          userId={userId}
          questions={quiz.quiz_questions}
          onSubmit={async (answers) => {
            const res = await submitQuiz(userId, quiz.activity_id, answers);
            return res;
          }}
        />
      )}
    </div>
  );
};

export default LessonQuizWidget;
