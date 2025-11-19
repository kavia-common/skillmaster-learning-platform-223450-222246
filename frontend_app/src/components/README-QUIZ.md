# Lesson Quiz Widget

Usage:

```tsx
import LessonQuizWidget from "./LessonQuizWidget";

export default function LessonDetailPage() {
  const lessonId = 123; // from router/props
  const userId = "user-123"; // from auth context/state

  return (
    <div>
      {/* ... lesson content ... */}
      <LessonQuizWidget lessonId={lessonId} userId={userId} />
    </div>
  );
}
```

Environment:
- Set REACT_APP_BACKEND_URL pointing to the FastAPI backend base URL (e.g., http://localhost:3001).
