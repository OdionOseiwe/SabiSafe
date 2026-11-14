import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Alert, Badge, Button, Card, EmptyState, PageLoader, ProgressBar } from "../components/ui";
import { endpoints, errorMessage } from "../lib/api";

const VISUALS = {
  phone: "📱",
  wallet: "👛",
  shield: "🛡️",
  network: "🌐",
  download: "⬇️",
  send: "⬆️",
  fee: "🪙",
  alert: "⚠️",
  key: "🔑",
  check: "✅",
  coins: "💰",
  family: "👨‍👩‍👧",
};

export default function Learn() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: payload } = await endpoints.lessons();
      setData(payload);
    } catch (err) {
      setError(errorMessage(err, "The lessons could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) return <PageLoader label="Opening the Learning Centre…" />;

  const lessons = data?.lessons || [];
  const summary = data?.summary || { total: lessons.length, completed: 0 };
  const next = lessons.find((lesson) => !lesson.completed);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Learning Centre"
        title="Short lessons, plain words"
        description="Each lesson takes about five minutes and ends with a gentle quiz. There is no timer and no shame in repeating one."
        actions={
          <Button variant="secondary" size="sm" onClick={load} icon={RefreshCw} loading={loading}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <Alert tone="danger" title="We could not load the lessons">
          {error}{" "}
          <button type="button" onClick={load} className="font-semibold underline">
            Try again
          </button>
        </Alert>
      ) : null}

      {summary.total === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No lessons loaded yet"
          description="The database is connected but the lesson seed has not run. An administrator can run npm run db:seed in the server workspace."
          action={
            <Button variant="secondary" onClick={load} icon={RefreshCw}>
              Check again
            </Button>
          }
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="grid gap-5 p-5 md:grid-cols-[1.4fr_0.6fr] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="green" icon={GraduationCap}>
                    {summary.completed} of {summary.total} complete
                  </Badge>
                  <Badge tone="gold">Testnet practice</Badge>
                </div>
                <h2 className="mt-2 text-[1.3rem] font-semibold text-ink">
                  {summary.completed === 0
                    ? "Start with “Money that lives in your phone”."
                    : next
                      ? `Next: ${next.title}`
                      : "You have finished every lesson."}
                </h2>
                <p className="mt-1 text-[0.9rem] leading-relaxed text-muted">
                  {next
                    ? next.description
                    : "Revisit any lesson whenever you want. Repetition is how confidence grows."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={next ? `/learn/${next.slug}` : lessons[0] ? `/learn/${lessons[0].slug}` : "/learn"}
                    className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-[0.88rem] font-semibold text-cream hover:bg-leaf"
                  >
                    {summary.completed === 0 ? "Start learning" : next ? "Continue" : "Review a lesson"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/practice"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-[0.88rem] font-semibold text-ink hover:border-leaf"
                  >
                    Practice tasks
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-cream p-4">
                <ProgressBar value={summary.completed} max={summary.total || 1} label="Your progress" />
                <p className="mt-3 flex items-start gap-1.5 text-[0.78rem] leading-relaxed text-muted">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" />
                  You can ask SabiGuide about any lesson in your own words.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                to={`/learn/${lesson.slug}`}
                className="group flex flex-col rounded-card border border-line bg-paper p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-leaf hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream text-[1.3rem]" aria-hidden="true">
                    {VISUALS[lesson.visual] || "📘"}
                  </span>
                  {lesson.completed ? (
                    <Badge tone="green" icon={CheckCircle2}>
                      Done
                    </Badge>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-muted">
                      <Circle className="h-3 w-3" /> Not yet
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-clay">
                  Lesson {lesson.order}
                </p>
                <h3 className="mt-1 text-[1.05rem] font-semibold leading-snug text-ink group-hover:text-leaf">
                  {lesson.title}
                </h3>
                <p className="mt-1.5 flex-1 text-[0.85rem] leading-relaxed text-muted">{lesson.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.74rem] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {lesson.estimatedMinutes} min
                  </span>
                  <span>·</span>
                  <span>{lesson.difficulty}</span>
                  {lesson.quizScore !== null && lesson.quizScore !== undefined ? (
                    <>
                      <span>·</span>
                      <span className="font-semibold text-leaf">Quiz {lesson.quizScore}%</span>
                    </>
                  ) : null}
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-leaf">
                  {lesson.completed ? "Review lesson" : "Open lesson"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
