import { encryptSecret, isEncryptionConfigured } from '@/lib/ai-key-crypto';
import { geminiKeyLooksRejected, supabaseForRequest } from '@/lib/ai-key';

export const runtime = 'edge';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Whether this person has saved a key (never the key itself: only its last four characters). */
export async function GET(req: Request) {
  const supabase = supabaseForRequest(req);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return json({ message: 'Sign in first.' }, 401);

  const { data: row } = await supabase.from('ai_keys').select('key_hint, updated_at').eq('user_id', auth.user.id).maybeSingle();
  return json({
    hasKey: Boolean(row),
    hint: row?.key_hint ?? null,
    sharedKey: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    canSave: isEncryptionConfigured(),
  });
}

/** Save or replace the key. It is checked with Google first, then stored encrypted. */
export async function PUT(req: Request) {
  const supabase = supabaseForRequest(req);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return json({ message: 'Sign in first.' }, 401);
  if (!isEncryptionConfigured()) return json({ message: 'Saving keys is not set up on this server.' }, 503);

  const body = (await req.json().catch(() => ({}))) as { apiKey?: unknown };
  const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
  if (apiKey.length < 20 || apiKey.length > 200 || /\s/.test(apiKey)) {
    return json({ message: 'That does not look like an API key. Paste it without spaces.' }, 400);
  }
  if (!apiKey.startsWith('AIza')) {
    return json({ message: 'Gemini keys start with "AIza". Check you copied the right one.' }, 400);
  }
  if (await geminiKeyLooksRejected(apiKey)) {
    return json({ message: 'Google rejected that key. Check it and try again.' }, 400);
  }

  const hint = apiKey.slice(-4);
  const { error } = await supabase.from('ai_keys').upsert({
    user_id: auth.user.id,
    provider: 'gemini',
    encrypted_key: await encryptSecret(apiKey),
    key_hint: hint,
    updated_at: new Date().toISOString(),
  });
  if (error) return json({ message: 'Could not save the key. Try again.' }, 500);
  return json({ hasKey: true, hint });
}

export async function DELETE(req: Request) {
  const supabase = supabaseForRequest(req);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return json({ message: 'Sign in first.' }, 401);

  const { error } = await supabase.from('ai_keys').delete().eq('user_id', auth.user.id);
  if (error) return json({ message: 'Could not remove the key. Try again.' }, 500);
  return json({ hasKey: false });
}
