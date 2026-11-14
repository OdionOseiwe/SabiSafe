import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { SpeakButton } from "../components/VoiceControls";
import { Alert, Badge, Button, Card, PageLoader, ProgressBar } from "../components/ui";
import { endpoints, errorMessage } from "../lib/api";
import { useToast } from "../context/ToastContext";

function Quiz({ lesson, onSubmitted }) {
  const { toast } = useToast();
  const questions = lesson.quiz?.questions || [];
  const [answers, setAnswers] = useState(() => questions.map(() => null));
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const answeredCount = answers.filter((answer) => answer !== null).length;

  async function submit() {
    if (answeredCount !== questions.length) {
      setError("Please answer every question before checking your result.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const { data } = await endpoints.submitQuiz(lesson.slug, answers);
      setResult(data);
      onSubmitted?.(data);
      toast(data.passed ? "Well done — lesson complete." : "Quiz checked. Read the explanations and try again.", data.passed ? "success" : "info");
    } catch (err) {
      setError(errorMessage(err, "The quiz could not be checked."));
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setAnswers(questions.map(() => null));
    setResult(null);
    setError("");
  }

  if (!questions.length) {
    return (
      <Alert tone="info" title="No quiz for this lesson">
        This lesson does not have a quiz yet. You can still mark your reading progress by opening the next lesson.
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      {questions.map((question, questionIndex) => {
        const outcome = result?.results?.[questionIndex];
        return (
          <fieldset key={question.question} className="rounded-2xl border border-line bg-paper p-4">
            <legend className="px-1 text-[0.95rem] font-semibold text-ink">
              {questionIndex + 1}. {question.question}
            </legend>
            <div className="mt-3 space-y-2">
              {question.options.map((option, optionIndex) => {
                const selected = answers[questionIndex] === optionIndex;
                const isCorrect = outcome && optionIndex === outcome.correctIndex;
                const isWrongChoice = outcome && selected && !outcome.correct;
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-[0.9rem] transition-colors ${
                      isCorrect
                        ? "border-leaf bg-mint"
                        : isWrongChoice
                          ? "border-clay/40 bg-clay-soft"
                          : selected
                            ? "border-leaf bg-cream"
                            : "border-line bg-cream/60 hover:border-leaf/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${questionIndex}`}
                      className="mt-0.5 h-4 w-4 text-leaf focus:ring-leaf"
                      checked={selected}
                      disabled={Boolean(result)}
                      onChange={() =>
                        setAnswers((current) => current.map((value, index) => (index === questionIndex ? optionIndex : value)))
                      }
                    />
                    <span className="flex-1">{option}</span>
                    {isCorrect ? <CheckCircle2 className="h-4 w-4 text-leaf" /> : null}
                    {isWrongChoice ? <X className="h-4 w-4 text-clay" /> : null}
                  </label>
                );
              })}
            </div>
            {outcome ? (
              <p className={`mt-2.5 rounded-lg px-3 py-2 text-[0.82rem] leading-relaxed ${outcome.correct ? "bg-mint text-forest" : "bg-clay-soft text-[#7a2f16]"}`}>
                {outcome.correct ? "Correct. " : "Not quite. "}
                {outcome.explanation}
              </p>
            ) : null}
          </fieldset>
        );
      })}

      {error ? <Alert tone="danger">{error}</Alert> : null}

      {result ? (
        <Card className={`p-5 ${result.passed ? "border-leaf/30 bg-mint/50" : "border-gold/50 bg-gold-soft/50"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-clay">Your result</p>
              <h3 className="mt-1 text-[1.4rem] font-semibold text-ink">
                {result.score}% · {result.correctCount} of {result.total} correct
              </h3>
              <p className="mt-1 text-[0.88rem] leading-relaxed text-muted">{result.encouragement}</p>
            </div>
            <Badge tone={result.passed ? "green" : "gold"}>{result.passed ? "Passed" : "Try again"}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={reset} icon={RefreshCw}>
              Try the quiz again
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-4">
          <p className="text-[0.85rem] text-muted">
            {answeredCount} of {questions.length} answered
          </p>
          <Button onClick={submit} loading={submitting} disabled={answeredCount !== questions.length} icon={Check}>
            Check my answers
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Lesson() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [neighbours, setNeighbours] = useState({ previous: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [{ data }, listResponse] = await Promise.all([endpoints.lesson(slug), endpoints.lessons().catch(() => null)]);
      setLesson(data.lesson);
      setProgress(data.lesson.progress);

      if (listResponse) {
        const list = listResponse.data.lessons;
        const index = list.findIndex((item) => item.slug === slug);
        setNeighbours({
          previous: index > 0 ? list[index - 1] : null,
          next: index >= 0 && index < list.length - 1 ? list[index + 1] : null,
        });
      }
    } catch (err) {
      setError(errorMessage(err, "That lesson could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !lesson) return <PageLoader label="Opening the lesson…" />;

  if (error || !lesson) {
    return (
      <div className="space-y-4">
        <PageHeader title="Lesson not found" backTo="/learn" backLabel="Back to lessons" />
        <Alert tone="danger" title="We could not open that lesson">
          {error || "It may have been moved."}{" "}
          <Link to="/learn" className="font-semibold underline">
            Return to the Learning Centre
          </Link>
        </Alert>
      </div>
    );
  }

  const sections = lesson.content?.sections || [];
  const takeaways = lesson.content?.takeaways || [];
  const readingText = [lesson.content?.intro, ...sections.map((section) => `${section.heading}. ${section.body}`)].join(" ");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`Lesson ${lesson.order} · ${lesson.difficulty}`}
        title={lesson.title}
        description={lesson.description}
        backTo="/learn"
        backLabel="All lessons"
        actions={
          <>
            <SpeakButton text={readingText} />
            <Badge tone="neutral" icon={Clock}>
              {lesson.estimatedMinutes} min
            </Badge>
          </>
        }
      />

      {progress?.completed ? (
        <Alert tone="success" title="You have completed this lesson">
          Best quiz score: {progress.quizScore ?? "—"}%. You can read it again or move to the next topic.
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_0.5fr]">
        <div className="space-y-5">
          <Card className="p-5 md:p-6">
            {lesson.content?.intro ? (
              <p className="text-[1.02rem] leading-relaxed text-ink">{lesson.content.intro}</p>
            ) : null}

            <div className="prose-sabi mt-5 space-y-5">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-[1.15rem] font-semibold text-ink">{section.heading}</h2>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink/85">{section.body}</p>
                  {Array.isArray(section.bullets) && section.bullets.length ? (
                    <ul className="mt-2 space-y-1.5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-[0.9rem] leading-relaxed text-ink/85">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" aria-hidden="true" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            {takeaways.length ? (
              <div className="mt-6 rounded-2xl border border-leaf/20 bg-mint/60 p-4">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-forest">Remember these three things</p>
                <ul className="mt-2 space-y-1.5">
                  {takeaways.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[0.9rem] leading-relaxed text-forest">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>

          <Card className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-clay">Check your understanding</p>
                <h2 className="mt-1 text-[1.25rem] font-semibold text-ink">A short quiz</h2>
              </div>
              <BookOpen className="h-6 w-6 text-leaf" aria-hidden="true" />
            </div>
            <p className="mt-1 text-[0.88rem] leading-relaxed text-muted">
              You need 60% to complete the lesson. Wrong answers show an explanation, so a mistake is still useful.
            </p>
            <div className="mt-4">
              <Quiz
                lesson={lesson}
                onSubmitted={(data) => setProgress(data.progress)}
              />
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {neighbours.previous ? (
              <Link
                to={`/learn/${neighbours.previous.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-[0.85rem] font-semibold text-ink hover:border-leaf"
              >
                <ChevronLeft className="h-4 w-4" /> {neighbours.previous.title}
              </Link>
            ) : (
              <span />
            )}
            {neighbours.next ? (
              <Link
                to={`/learn/${neighbours.next.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-[0.85rem] font-semibold text-cream hover:bg-leaf"
              >
                {neighbours.next.title} <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/practice"
                className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-[0.85rem] font-semibold text-cream hover:bg-leaf"
              >
                Go to practice <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">Lesson progress</p>
            <div className="mt-2">
              <ProgressBar value={progress?.completed ? 1 : 0} max={1} label={progress?.completed ? "Complete" : "In progress"} />
            </div>
            {progress?.quizScore !== null && progress?.quizScore !== undefined ? (
              <p className="mt-2 text-[0.8rem] text-muted">Best quiz score: {progress.quizScore}%</p>
            ) : null}
            <Link
              to="/learn"
              className="mt-3 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-leaf hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All lessons
            </Link>
          </Card>

          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-leaf" /> Ask about this lesson
            </p>
            <p className="mt-1 text-[0.82rem] leading-relaxed text-muted">
              SabiGuide can explain any part in simpler words or in Pidgin.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3 w-full"
              onClick={() => navigate("/assistant")}
            >
              Open Ask Sabi
            </Button>
          </Card>

          <p className="px-1 text-[0.75rem] leading-relaxed text-muted">
            This lesson is general education. It is not financial advice. SabiSafe uses Aurora testnet only.
          </p>
        </div>
      </div>
    </div>
  );
}
