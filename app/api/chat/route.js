import OpenAI from "openai";
import { cookies } from "next/headers";
import { ALLOWED, costOf } from "../../../lib/models";
import { COOKIE_NAME, verifyToken } from "../../../lib/auth";

export const maxDuration = 300; // Astra can be slow; needs Vercel Fluid Compute (default on new projects)
export const dynamic = "force-dynamic";

const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS || 4000);

export async function POST(req) {
  const jar = await cookies();
  if (!verifyToken(jar.get(COOKIE_NAME)?.value)) {
    return Response.json({ error: "Please log in again." }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OPENAI_API_KEY is not set on the server." }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { model, messages } = body || {};
  if (!ALLOWED.has(model)) {
    return Response.json({ error: "Model not allowed." }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
    return Response.json({ error: "Bad messages." }, { status: 400 });
  }
  const clean = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 20000) }));

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const started = Date.now();
    const res = await client.chat.completions.create({
      model,
      messages: [{ role: "system", content: "You are a helpful assistant." }, ...clean],
      max_completion_tokens: MAX_OUTPUT_TOKENS,
    });
    const usage = res.usage;
    return Response.json({
      reply: res.choices?.[0]?.message?.content ?? "",
      usage,
      cost: costOf(model, usage),
      seconds: (Date.now() - started) / 1000,
    });
  } catch (e) {
    const status = e?.status && Number.isInteger(e.status) ? e.status : 500;
    return Response.json({ error: e?.message || "OpenAI request failed." }, { status });
  }
}
