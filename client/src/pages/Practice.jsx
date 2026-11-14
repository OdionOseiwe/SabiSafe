import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  RefreshCw,
  Target,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Alert, Badge, Button, Card, PageLoader, ProgressBar } from "../components/ui";
import { endpoints, errorMessage } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function Practice() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: payload } = await endpoints.practice();
      setData(payload);
    } catch (err) {
      setError(errorMessage(err, "Practice tasks could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function complete(key) {
    setSavingKey(key);
    try {
      await endpoints.completeExercise(key);
      setData((current) => {
        if (!current) return current;
        const exercises = current.exercises.map((exercise) =>
          exercise.key === key ? { ...exercise, completed: true, completedAt: new Date().toISOString() } : exercise,
        );
        return {
          ...current,
          exercises,
          summary: { ...current.summary, completed: exercises.filter((item) => item.completed).length },
        };
      });
      toast("Marked as practised. Honesty makes this useful.", "success");
    } catch (err) {
      toast(errorMessage(err, "We could not save that."), "error");
    } finally {
      setSavingKey(null);
    }
  }

  if (loading && !data) return <PageLoader label="Loading practice tasks…" />;

  const exercises = data?.exercises || [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Practice, not pressure"
        title="Small tasks that build real confidence"
        description="Every task uses Aurora testnet. Testnet ETH has no real value, so you can make a mistake and learn from it safely."
        actions={
          <Button variant="secondary" size="sm" onClick={load} loading={loading} icon={RefreshCw}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <Alert tone="danger" title="We could not load the practice list">
          {error}{" "}
          <button type="button" onClick={load} className="font-semibold underline">
            Try again
          </button>
        </Alert>
      ) : null}

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge tone="gold">Testnet only</Badge>
            <h2 className="mt-2 text-[1.25rem] font-semibold text-ink">
              {data?.summary?.completed || 0} of {data?.summary?.total || 6} practised
            </h2>
            <p className="mt-1 text-[0.9rem] leading-relaxed text-muted">{data?.note}</p>
          </div>
          <div className="w-full max-w-xs">
            <ProgressBar
              value={data?.summary?.completed || 0}
              max={data?.summary?.total || 6}
              label="Practice progress"
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {exercises.map((exercise) => (
          <Card key={exercise.key} className={`p-5 ${exercise.completed ? "border-leaf/30 bg-mint/30" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  exercise.completed ? "bg-leaf text-white" : "bg-cream text-leaf"
                }`}
              >
                {exercise.completed ? <CheckCircle2 className="h-5 w-5" /> : <Target className="h-5 w-5" />}
              </span>
              <Badge tone={exercise.completed ? "green" : "neutral"}>
                {exercise.completed ? "Practised" : "Not yet"}
              </Badge>
            </div>
            <h3 className="mt-3 text-[1.05rem] font-semibold text-ink">{exercise.title}</h3>
            <p className="mt-1 text-[0.88rem] leading-relaxed text-muted">{exercise.description}</p>

            <ol className="mt-3 space-y-2">
              {exercise.steps.map((step, index) => (
                <li key={step} className="flex items-start gap-2.5 text-[0.86rem] leading-relaxed text-ink/85">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream text-[0.7rem] font-bold text-leaf">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                to={`/learn/${exercise.lessonSlug}`}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-3 py-1.5 text-[0.8rem] font-semibold text-ink hover:border-leaf"
              >
                Related lesson <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {!exercise.completed ? (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={savingKey === exercise.key}
                  onClick={() => complete(exercise.key)}
                  icon={ClipboardCheck}
                >
                  I practised this
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-leaf">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Done
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-line bg-cream/70 p-5">
        <p className="flex items-center gap-2 text-[0.9rem] font-semibold text-ink">
          <Circle className="h-4 w-4 text-leaf" /> Honest practice
        </p>
        <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted">
          These buttons only record what you say you practised. They do not prove a payment happened and they never
          create a fake transaction. Real chain results appear only in History, after Aurora confirms them.
        </p>
      </div>
    </div>
  );
}
