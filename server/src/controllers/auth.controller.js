import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/errors.js";
import { badRequest, conflict, unauthorized } from "../utils/errors.js";
import { AUTH_COOKIE, authCookieOptions, signSessionToken } from "../lib/session.js";
import { publicUser } from "./serializers.js";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Please enter your first name.").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(160),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(128, "That password is too long.")
    .regex(/[a-zA-Z]/, "Include at least one letter.")
    .regex(/[0-9]/, "Include at least one number."),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password.").max(128),
});

function startSession(res, user) {
  const token = signSessionToken(user);
  res.cookie(AUTH_COOKIE, token, authCookieOptions());
  return token;
}

export const register = asyncHandler(async (req, res) => {
  const { firstName, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict("An account with that email already exists. Try signing in instead.");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { firstName, email, passwordHash },
  });

  startSession(res, user);
  res.status(201).json({ user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw unauthorized("The email or password is not correct.");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw unauthorized("The email or password is not correct.");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  startSession(res, updated);
  res.json({ user: publicUser(updated) });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...authCookieOptions(), maxAge: undefined });
  res.json({ ok: true });
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw unauthorized("Your account could not be found. Please sign in again.");
  res.json({ user: publicUser(user) });
});

const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80).optional(),
    preferredLanguage: z.enum(["ENGLISH", "PIDGIN"]).optional(),
    experienceLevel: z.enum(["COMPLETE_BEGINNER", "LITTLE_EXPERIENCE", "EXPERIENCED"]).optional(),
    assistanceMode: z.enum(["TEXT", "VOICE"]).optional(),
    saveAiHistory: z.boolean().optional(),
    completeOnboarding: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "Nothing to update." });

export const updateProfile = asyncHandler(async (req, res) => {
  const input = req.body;
  const data = {};
  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.preferredLanguage !== undefined) data.preferredLanguage = input.preferredLanguage;
  if (input.experienceLevel !== undefined) data.experienceLevel = input.experienceLevel;
  if (input.assistanceMode !== undefined) data.assistanceMode = input.assistanceMode;
  if (input.saveAiHistory !== undefined) data.saveAiHistory = input.saveAiHistory;
  if (input.completeOnboarding) data.onboardedAt = new Date();

  const user = await prisma.user.update({ where: { id: req.userId }, data });
  res.json({ user: publicUser(user) });
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128).regex(/[0-9]/, "Include at least one number."),
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw unauthorized();

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw badRequest("Your current password is not correct.");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  res.json({ ok: true });
});

export const schemas = { registerSchema, loginSchema, updateProfileSchema, passwordSchema };
