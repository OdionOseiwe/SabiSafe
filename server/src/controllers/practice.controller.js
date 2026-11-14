import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/errors.js";

export const EXERCISES = [
  {
    key: "find-address",
    title: "Find your wallet address",
    description: "Open your wallet and copy the address. This is the safe thing to share when you want money.",
    steps: [
      "Connect your wallet in SabiSafe.",
      "Open the Receive page.",
      "Copy the address and read the first and last 6 characters aloud.",
    ],
    lessonSlug: "receiving-money",
  },
  {
    key: "scan-qr",
    title: "Practise a receive request",
    description: "Create a receiving request for a family member and open the share link yourself.",
    steps: [
      "Open Receive → Create a request.",
      "Enter a name and an optional amount.",
      "Open the share link and check that the address matches your wallet.",
    ],
    lessonSlug: "receiving-money",
  },
  {
    key: "read-review",
    title: "Read a send review carefully",
    description: "Use the send form with a small amount and stop at the review screen.",
    steps: [
      "Open Send and enter a trusted contact.",
      "Enter a small testnet amount.",
      "Read every warning before you approve. Cancel if anything is unclear.",
    ],
    lessonSlug: "sending-money-safely",
  },
  {
    key: "verify-transaction",
    title: "Check a real transaction on chain",
    description: "Send a tiny testnet payment, then find it in History and open the explorer link.",
    steps: [
      "Send a small testnet payment to your own second wallet or a trusted contact.",
      "Open History and tap Check status.",
      "Compare the hash and status with the Aurora explorer.",
    ],
    lessonSlug: "checking-a-transaction",
  },
  {
    key: "spot-scam-message",
    title: "Check a suspicious message",
    description: "Paste a message you received into the Safety Centre scanner and read the reasons.",
    steps: [
      "Open Safety → Check a message.",
      "Paste the message. Remove any personal details first.",
      "Read each warning and decide what to do next.",
    ],
    lessonSlug: "spotting-scams",
  },
  {
    key: "add-contact",
    title: "Save a trusted contact",
    description: "Save a family member's wallet address so future payments show a familiar name.",
    steps: [
      "Open Contacts → Add contact.",
      "Enter their name and exact Aurora address.",
      "Send them a small test amount and confirm they received it.",
    ],
    lessonSlug: "sending-money-safely",
  },
];

export const getPractice = asyncHandler(async (req, res) => {
  const completed = await prisma.practiceProgress.findMany({
    where: { userId: req.userId },
    select: { exerciseKey: true, completedAt: true },
  });
  const map = new Map(completed.map((item) => [item.exerciseKey, item.completedAt]));

  res.json({
    exercises: EXERCISES.map((exercise) => ({
      ...exercise,
      completed: map.has(exercise.key),
      completedAt: map.get(exercise.key) || null,
    })),
    summary: {
      total: EXERCISES.length,
      completed: completed.filter((item) => EXERCISES.some((ex) => ex.key === item.exerciseKey)).length,
    },
    note: "Practice uses Aurora testnet only. Testnet ETH has no real value.",
  });
});

export const completeExercise = asyncHandler(async (req, res) => {
  const exercise = EXERCISES.find((item) => item.key === req.params.key);
  if (!exercise) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "That exercise does not exist." } });
  }

  await prisma.practiceProgress.upsert({
    where: { userId_exerciseKey: { userId: req.userId, exerciseKey: exercise.key } },
    create: { userId: req.userId, exerciseKey: exercise.key },
    update: {},
  });

  res.json({ ok: true, exerciseKey: exercise.key, completed: true });
});
