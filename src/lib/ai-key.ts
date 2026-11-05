import { createServerClient } from '@supabase/ssr';
import { decryptSecret } from '@/lib/ai-key-crypto';

/** Why a request cannot use an AI key. `code` is what the client reads. */
export class AiKeyError extends Error {
  constructor(
    public code: 'UNAUTHENTICATED' | 'API_KEY_MISSING' | 'KEY_UNREADABLE',
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const aiKeyErrorResponse = (e: AiKeyError) =>
  new Response(JSON.stringify({ error: e.code, message: e.message }), {
    status: e.status,
    headers: { 'Content-Type': 'application/json' },
  });

const parseCookies = (header: string | null) =>
  (header ?? '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const i = part.indexOf('=');
      return { name: part.slice(0, i), value: decodeURIComponent(part.slice(i + 1)) };
    });

/** A Supabase client acting as the person who made this request (their session cookie), so row security applies. */
export function supabaseForRequest(req: Request) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll: () => parseCookies(req.headers.get('cookie')),
        setAll: () => {
          // Route handlers here only read the session; refreshing it is left to the proxy.
        },
      },
    },
  );
}

/**
 * The Gemini key for whoever sent this request: their own saved key, else a shared one from the environment if the
 * site owner set GOOGLE_GENERATIVE_AI_API_KEY, else an error that tells them to add one. Signed-out visitors get 401,
 * so nobody can spend a key without an account.
 */
export async function resolveGeminiKey(req: Request): Promise<string> {
  const supabase = supabaseForRequest(req);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new AiKeyError('UNAUTHENTICATED', 401, 'Sign in to use the assistant.');

  const { data: row } = await supabase.from('ai_keys').select('encrypted_key').eq('user_id', auth.user.id).maybeSingle();
  if (row?.encrypted_key) {
    try {
      return await decryptSecret(row.encrypted_key);
    } catch {
      throw new AiKeyError('KEY_UNREADABLE', 400, 'Your saved key could not be read. Add it again in Profile.');
    }
  }

  const shared = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (shared) return shared;
  throw new AiKeyError('API_KEY_MISSING', 400, 'Add your Gemini API key in Profile to use the assistant.');
}

/**
 * Asks Google whether a key is valid before saving it. Only a clear "this key is wrong" answer rejects it; a network
 * problem or anything unexpected accepts the key, so an outage never stops someone saving.
 */
export async function geminiKeyLooksRejected(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1', {
      headers: { 'x-goog-api-key': apiKey },
    });
    if (res.ok) return false;
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      const body = await res.text();
      return /API_KEY_INVALID|API key not valid|API key expired/i.test(body);
    }
    return false;
  } catch {
    return false;
  }
}
