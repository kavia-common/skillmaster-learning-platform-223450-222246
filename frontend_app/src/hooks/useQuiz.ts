import { useCallback, useState } from "react";

const API_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_BASE || "";

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
};

export type LessonQuiz = {
  activity_id: number;
  lesson_id: number;
  title: string;
  quiz_pass_score: number;
  quiz_questions: QuizQuestion[];
};

export function useQuiz() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = useCallback(async (lessonId: number, passScore = 70) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/ai/quiz/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, pass_score: passScore, difficulty: "Beginner" }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || "Failed to generate quiz");
      }
      const data = await resp.json();
      return data as LessonQuiz;
    } catch (e: any) {
      setError(e.message || "Error generating quiz");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLessonQuiz = useCallback(async (lessonId: number) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/ai/quiz/lesson/${lessonId}`);
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || "No quiz found");
      }
      const data = await resp.json();
      const activity = data.activity;
      const converted: LessonQuiz = {
        activity_id: activity.id,
        lesson_id: activity.lesson_id,
        title: activity.title,
        quiz_pass_score: activity.quiz_pass_score ?? 70,
        quiz_questions: activity.quiz_questions ?? [],
      };
      return converted;
    } catch (e: any) {
      setError(e.message || "Error fetching quiz");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitQuiz = useCallback(async (userId: string, activityId: number, answers: number[]) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/ai/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, activity_id: activityId, answers }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || "Failed to submit quiz");
      }
      return await resp.json();
    } catch (e: any) {
      setError(e.message || "Error submitting quiz");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, generateQuiz, fetchLessonQuiz, submitQuiz };
}
