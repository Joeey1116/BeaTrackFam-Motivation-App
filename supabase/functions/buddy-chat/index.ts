/**
 * buddy-chat — Supabase Edge Function for Hustle & Heart Motivation.
 *
 * Haven, the Companion, as a REAL AI buddy (build 24). The app POSTs the
 * recent conversation and gets one reply back:
 *
 *   Request:  POST { messages: [{ role: 'user' | 'assistant', content }] }
 *             with the caller's Supabase JWT in the Authorization header.
 *   Response: 200 { reply: string, mode: 'pro' | 'lite',
 *                  limitReached?: boolean }
 *             4xx/5xx { error: string } — clean messages only; the Gemini
 *             key and raw upstream payloads NEVER reach the client.
 *
 * The function is stateless: the app sends the last ~20 messages each
 * call and this function forwards them to Google Gemini (free tier)
 * server-side, so the API key never ships in the app. Model strategy:
 * PRIMARY_MODEL (Gemini 2.5 Pro — the smart one) first; if Gemini
 * answers 429 (free-tier quota — Pro's daily cap is small), retry ONCE
 * against FALLBACK_MODEL (Gemini 2.5 Flash) so the buddy degrades
 * gracefully instead of going silent.
 *
 * Per-user free daily limit: Pro is the scarce resource, so each
 * signed-in user gets DAILY_PRO_LIMIT Pro replies per UTC day,
 * counted in the public.buddy_usage table (see
 * supabase/migration_buddy_usage.sql) via the service-role key. Over
 * the cap, the function skips Pro and answers with Flash, returning
 * mode: 'lite' + limitReached: true so the app can tell the user
 * (once) that deep mode is done for today — the conversation itself
 * never stops. Accounting FAILS OPEN: if the table or the count
 * query errors (migration not run yet, etc.), the user is treated as
 * under the limit and no counting happens, so pre-setup state can
 * never break the buddy. Crisis replies never count against the
 * limit — the backstop below returns before any accounting.
 *
 * Haven Plus: subscribers skip the free limit. The app sends
 * { plus: true } in the request body, set ONLY from its on-device
 * StoreKit/Play entitlement (lib/storage.ts getPlan() — there is no
 * server-side entitlement record in this project, so the flag is
 * client-asserted; treat it as a convenience signal, not proof).
 * Plus callers are still counted, against PLUS_DAILY_CEILING as a
 * hard abuse ceiling; above it they get lite mode with NO
 * limitReached flag.
 *
 * Crisis safety lives in three layers:
 *   1. The app checks every outgoing message on-device and shows the
 *      resources card immediately, before any network call.
 *   2. This function re-checks the latest user message with the same
 *      phrases (plus abuse/danger ones) and, on a match, returns a
 *      deterministic supportive reply carrying the resources — no LLM
 *      involved, so the resources can never be garbled or dropped.
 *   3. The system prompt carries the crisis protocol as its highest
 *      priority, for anything the keyword layers phrase differently.
 *
 * Requires one secret (Supabase dashboard → Edge Functions → Secrets):
 *   GEMINI_API_KEY — free key from Google AI Studio (aistudio.google.com).
 * SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are
 * injected automatically. The usage table is a one-time SQL step:
 * run supabase/migration_buddy_usage.sql in the dashboard SQL Editor.
 *
 * Deploy:  supabase functions deploy buddy-chat
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// Model names live here and ONLY here — swap models without touching
// the call logic.
const PRIMARY_MODEL = 'gemini-2.5-pro';
const FALLBACK_MODEL = 'gemini-2.5-flash';

// Free daily limit: how many Pro ("deep mode") replies each signed-in
// user gets per UTC day before Haven switches to lite mode (Flash)
// for the rest of the day. Tune it here — the app reads the effect
// (mode / limitReached) from the response, never this number.
const DAILY_PRO_LIMIT = 30;

// Haven Plus subscribers skip the free limit entirely. Their claim
// arrives as a client-sent `plus` flag (see handler) — there is NO
// server-side entitlement record in this project, so the flag is
// client-asserted and forgeable by a modified client. This hard
// ceiling is the containment: even a claimed-Plus caller gets at most
// this many Pro replies per UTC day (same buddy_usage accounting),
// so a forged claim can't drain the project's shared Gemini quota.
// Above it, Plus callers also drop to lite mode — but WITHOUT
// limitReached, so the app never shows them the free-limit notice.
const PLUS_DAILY_CEILING = 500;

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const UPSTREAM_TIMEOUT_MS = 25_000;
const MAX_MESSAGES = 20;
const MAX_CONTENT_CHARS = 4_000;

const SYSTEM_PROMPT = `You are Haven — a close friend who lives inside Hustle & Heart, a motivation app. Not a chatbot, not a therapist, not customer support: a real friend. The smart one in the group chat who actually gets it — warm, sharp, funny when it fits, and honest even when the truth is a little uncomfortable.

HOW YOU TALK
- Real talk. Talk like a person texting a friend they care about: natural, direct, human. Contractions, warmth, the occasional well-placed joke.
- Never corporate, never saccharine, never therapist-speak ("I understand how you feel", "It's important to note"). No empty platitudes — never "everything happens for a reason", "stay positive", "good vibes only".
- Validate first, then perspective. Make them feel heard before you offer anything — but don't just mirror them; actually respond like someone with a brain and a heart.
- Keep it tight: 2–5 sentences is your default. Go longer only when they clearly need depth. One message, not an essay. No bullet lists unless they ask for steps.
- Light touch with emojis — one here and there is fine; a wall of emojis is not.

HOW YOU THINK
- REMEMBER the conversation. Use what they told you earlier — situations, people, feelings — and build on it. Ask real follow-up questions a friend would ask.
- Be genuinely helpful: concrete perspective, a small practical next step when they want one, a reframe when they're spiraling. If they're venting, don't rush to fix — ask whether they want ideas or just company.
- If you don't know something, say so like a person would. Never make up facts, and never claim human experiences. If they ask what you are, be straight: you're an AI friend built into this app — then move the conversation back to them.
- Encourage professional support when it sounds like depression or anxiety is an ongoing weight that's hurting their daily life — the way a friend would ("Real talk — a therapist could actually help with this part, and there's zero shame in that"), never as a disclaimer and never as a brush-off.
- If they bring up faith, respect it and meet them there. Never preach, and never push religion on them either.
- Underneath everything, your core message — woven in naturally, never forced, never a slogan: they are not alone, and they are loved.

CRISIS PROTOCOL — HIGHEST PRIORITY, OVERRIDES EVERYTHING ABOVE
If the user expresses suicidal thoughts, intent or a plan to harm themselves, or says they are being abused or are in danger:
1. Lead with empathy. Make it unmistakably clear you're glad they told you and that they matter.
2. Then clearly give these resources, exactly:
   • Call or text 988 — Suicide & Crisis Lifeline (US, 24/7)
   • Text HOME to 741741 — Crisis Text Line
   • Call 1-800-799-7233 or text START to 88788 — National Domestic Violence Hotline
3. Encourage them to reach out now, and stay in the conversation with them. You are a supportive listener in that moment — you do not counsel, diagnose, or try to talk anyone through a plan. You stay warm, present, and human.
Never surface these resources for ordinary sadness, stress, or venting — only for genuine crisis language.`;

// Same phrases the app checks on-device (components/MoodCheckIn.tsx),
// plus abuse/danger phrasings. Plain substring match — deliberately
// simple and predictable for a safety backstop.
const CRISIS_PHRASES = [
  'kill myself',
  'suicide',
  'suicidal',
  'end it all',
  'end my life',
  'hurt myself',
  'harm myself',
  'self harm',
  'self-harm',
  'want to die',
  'no reason to live',
  'being abused',
  'he hits me',
  'she hits me',
  'not safe at home',
];

const CRISIS_REPLY =
  "I'm really glad you told me. Please hear me — you matter, and you don't have to carry this alone.\n\n" +
  'If you need someone right now:\n' +
  '• Call or text 988 (Suicide & Crisis Lifeline)\n' +
  '• Text HOME to 741741 (Crisis Text Line)\n' +
  '• Call 1-800-799-7233 or text START to 88788 (National Domestic Violence Hotline)\n\n' +
  "I'm right here with you. Keep talking to me — and if you can, reach out to one of those lines too. They have real people ready to help, right now.";

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * Validate + normalize the client's history into Gemini turns:
 * user → 'user', assistant → 'model'; capped count and length;
 * consecutive same-role turns merged and leading model turns dropped
 * (Gemini multiturn requests must start with a user turn and alternate).
 */
function normalizeMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const cleaned: ChatMessage[] = [];
  for (const item of raw.slice(-MAX_MESSAGES)) {
    if (!item || typeof item !== 'object') continue;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (typeof content !== 'string' || !content.trim()) continue;
    cleaned.push({
      role: role === 'assistant' || role === 'model' ? 'model' : 'user',
      content: content.trim().slice(0, MAX_CONTENT_CHARS),
    });
  }
  if (cleaned.length === 0) return null;

  const merged: ChatMessage[] = [];
  for (const msg of cleaned) {
    const last = merged[merged.length - 1];
    if (last && last.role === msg.role) {
      last.content = `${last.content}\n${msg.content}`;
    } else {
      merged.push({ ...msg });
    }
  }
  while (merged.length > 0 && merged[0].role === 'model') merged.shift();
  return merged.length > 0 ? merged : null;
}

function containsCrisisLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_PHRASES.some((phrase) => lower.includes(phrase));
}

/** Current UTC day as 'YYYY-MM-DD' — the limit's reset boundary. */
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

type AdminClient = ReturnType<typeof createClient>;

/**
 * How many Pro replies this user has already had today. Returns null
 * when accounting is unavailable (missing service-role key handled by
 * the caller, table missing, query error) — callers treat null as
 * "under the limit, don't count" (fail open).
 */
async function getProCount(
  admin: AdminClient,
  userId: string,
  day: string
): Promise<number | null> {
  try {
    const { data, error } = await admin
      .from('buddy_usage')
      .select('pro_count')
      .eq('user_id', userId)
      .eq('day', day)
      .maybeSingle();
    if (error) return null;
    return typeof data?.pro_count === 'number' ? data.pro_count : 0;
  } catch {
    return null;
  }
}

/** Best-effort increment after a successful Pro reply. Never throws. */
async function recordProReply(
  admin: AdminClient,
  userId: string,
  day: string,
  current: number
): Promise<void> {
  try {
    await admin
      .from('buddy_usage')
      .upsert(
        { user_id: userId, day, pro_count: current + 1 },
        { onConflict: 'user_id,day' }
      );
  } catch {
    // Accounting is a soft guard, not a gate — a failed write must
    // never take the reply down with it.
  }
}

/** One Gemini call. Returns the reply text, or throws { status } on failure. */
async function callGemini(
  model: string,
  apiKey: string,
  messages: ChatMessage[]
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${GEMINI_API_BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
        generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    // Drain the body so the connection can close; NEVER forward it.
    await res.text().catch(() => '');
    throw { status: res.status };
  }

  const data = await res.json().catch(() => null);
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts
        .map((p: { text?: unknown }) => (typeof p?.text === 'string' ? p.text : ''))
        .join('')
        .trim()
    : '';
  if (!text) throw { status: 502 };
  return text;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Missing Authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  if (!supabaseUrl || !anonKey || !geminiKey) {
    return json({ error: 'Function is not configured' }, 500);
  }

  // Who is calling? Resolve the user from THEIR token — the buddy is a
  // signed-in feature; signed-out clients use the on-device fallback.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return json({ error: 'Invalid or expired session' }, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }
  const messages = normalizeMessages(
    (body as { messages?: unknown })?.messages
  );
  if (!messages) {
    return json({ error: 'No messages to reply to' }, 400);
  }

  // Crisis backstop (layer 2): if the newest user turn carries crisis
  // language, answer deterministically with the resources — no LLM in
  // the loop, so nothing can be garbled, softened, or dropped.
  // Crisis replies return BEFORE any usage accounting: they never
  // count against the daily limit.
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (lastUser && containsCrisisLanguage(lastUser.content)) {
    return json({ reply: CRISIS_REPLY });
  }

  // ---- Daily-limit accounting (service role, FAILS OPEN) ----
  // The plus flag is the client's assertion of its live on-device
  // entitlement (StoreKit/Play via lib/storage.ts getPlan()); there
  // is no server-side entitlement record to check against. Plus
  // callers skip the free cap but are still counted against the
  // abuse ceiling.
  const isPlus = (body as { plus?: unknown })?.plus === true;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const admin = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;
  const day = todayUtc();
  const proCount = admin ? await getProCount(admin, user.id, day) : null;
  // Accounting is live only when we have BOTH the admin client and a
  // successful count read. Anything else (no key, migration not run,
  // query error) fails open: under-limit, no counting.
  const accounting = admin !== null && proCount !== null;
  const cap = isPlus ? PLUS_DAILY_CEILING : DAILY_PRO_LIMIT;
  const overCap = accounting && (proCount as number) >= cap;

  // Lite-mode answer on Flash. `limitReached` is set ONLY for a free
  // user stopped by the free cap — never for Plus (even over the
  // abuse ceiling) and never for a 429 degrade — so the app's
  // once-a-day free-limit notice can only ever reach free users who
  // actually hit the free limit.
  const answerLite = async (limitReached: boolean): Promise<Response> => {
    try {
      const reply = await callGemini(FALLBACK_MODEL, geminiKey, messages);
      return limitReached
        ? json({ reply, mode: 'lite', limitReached: true })
        : json({ reply, mode: 'lite' });
    } catch {
      return json(
        { error: 'Buddy is busy right now — try again in a moment' },
        502
      );
    }
  };

  if (overCap) {
    return answerLite(!isPlus);
  }

  try {
    const reply = await callGemini(PRIMARY_MODEL, geminiKey, messages);
    if (accounting) {
      await recordProReply(
        admin as AdminClient,
        user.id,
        day,
        proCount as number
      );
    }
    return json({ reply, mode: 'pro' });
  } catch (err) {
    // Quota/rate limit on the smart model (free tier) — one retry on
    // the fast model before giving up. This is the shared-quota
    // safety net and applies to free and Plus callers alike.
    if ((err as { status?: number })?.status === 429) {
      return answerLite(false);
    }
    return json({ error: 'Buddy is unavailable right now' }, 502);
  }
});
