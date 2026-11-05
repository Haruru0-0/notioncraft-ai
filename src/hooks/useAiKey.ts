import { useCallback, useEffect, useState } from 'react';

export interface AiKeyStatus {
  hasKey: boolean;
  /** Last four characters of the saved key. */
  hint: string | null;
  /** The site owner configured a shared key, so the assistant works without one of your own. */
  sharedKey: boolean;
  /** The server can store keys (KEY_ENCRYPTION_SECRET is set). */
  canSave: boolean;
}

/**
 * Whether the signed-in person has an AI key. `needsKey` is true only once the answer is known and neither they nor
 * the site has a key, so nothing warns while loading.
 */
export function useAiKey() {
  const [status, setStatus] = useState<AiKeyStatus | null>(null);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/key');
      if (!res.ok) throw new Error('status');
      setStatus((await res.json()) as AiKeyStatus);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    status,
    failed,
    refresh,
    needsKey: status !== null && !status.hasKey && !status.sharedKey,
  };
}
