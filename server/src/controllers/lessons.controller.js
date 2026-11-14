import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/errors.js";
import { notFound, badRequest } from "../utils/errors.js";

function quizForStudent(quiz) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  return {
    questions: questions.map((question) => ({
      question: question.question,
      options: question.options,
    })),
  };
}

function lessonPayload(lesson, progress) {
  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    visual: lesson.visual,
    difficulty: lesson.difficulty,
    estimatedMinutes: lesson.estimatedMinutes,
    order: lesson.order,
    content: lesson.content,
    quiz: quizForStudent(lesson.quiz),
    progress: progress
      ? {
          completed: progress.completed,
          quizScore: progress.quizScore,
          completedAt: progress.completedAt,
        }
      : { completed: false, quizScore: null, completedAt: null },
  };
}

export const listLessons = asyncHandler(async (req, res) => {
  const [lessons, progress] = await Promise.all([
    prisma.learningLesson.findMany({ orderBy: { order: "asc" } }),
    prisma.userLearningProgress.findMany({ where: { userId: req.userId } }),
  ]);
  const byLesson = new Map(progress.map((item) => [item.lessonId, item]));

  const items = lessons.map((lesson) => {
    const entry = byLesson.get(lesson.id);
    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      visual: lesson.visual,
      difficulty: lesson.difficulty,
      estimatedMinutes: lesson.estimatedMinutes,
      order: lesson.order,
      completed: Boolean(entry?.completed),
      quizScore: entry?.quizScore ?? null,
    };
  });

  res.json({
    lessons: items,
    summary: {
      total: items.length,
      completed: items.filter((item) => item.completed).length,
    },
  });
});

export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await prisma.learningLesson.findUnique({ where: { slug: req.params.slug } });
  if (!lesson) throw notFound("That lesson could not be found.");

  const progress = await prisma.userLearningProgress.findUnique({
    where: { userId_lessonId: { userId: req.userId, lessonId: lesson.id } },
  });

  res.json({ lesson: lessonPayload(lesson, progress) });
});

const submitSchema = z.object({
  answers: z.array(z.number().int().min(0).max(9)).min(1).max(20),
});

export const schemas = { submitSchema };

export const submitQuiz = asyncHandler(async (req, res) => {
  const lesson = await prisma.learningLesson.findUnique({ where: { slug: req.params.slug } });
  if (!lesson) throw notFound("That lesson could not be found.");

  const questions = Array.isArray(lesson.quiz?.questions) ? lesson.quiz.questions : [];
  if (!questions.length) throw badRequest("This lesson does not have a quiz yet.");
  if (req.body.answers.length !== questions.length) {
    throw badRequest("Please answer every question before checking your result.");
  }

  const results = questions.map((question, index) => {
    const chosen = req.body.answers[index];
    const correct = chosen === question.answerIndex;
    return {
      index,
      chosen,
      correct,
      correctIndex: question.answerIndex,
      explanation: question.explanation,
    };
  });

  const correctCount = results.filter((item) => item.correct).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const completed = score >= 60;

  const existing = await prisma.userLearningProgress.findUnique({
    where: { userId_lessonId: { userId: req.userId, lessonId: lesson.id } },
  });

  const bestScore = Math.max(existing?.quizScore ?? 0, score);
  const progress = await prisma.userLearningProgress.upsert({
    where: { userId_lessonId: { userId: req.userId, lessonId: lesson.id } },
    create: {
      userId: req.userId,
      lessonId: lesson.id,
      completed,
      quizScore: score,
      answers: req.body.answers,
      completedAt: completed ? new Date() : null,
    },
    update: {
      completed: Boolean(existing?.completed) || completed,
      quizScore: bestScore,
      answers: req.body.answers,
      completedAt: existing?.completedAt || (completed ? new Date() : null),
    },
  });

  res.json({
    score,
    correctCount,
    total: questions.length,
    passed: completed,
    results,
    progress: {
      completed: progress.completed,
      quizScore: progress.quizScore,
      completedAt: progress.completedAt,
    },
    encouragement:
      completed
        ? "Well done. You can move to the next lesson, or try again for a perfect score."
        : "Not quite yet. Read the explanations below and try again — there is no rush.",
  });
});
