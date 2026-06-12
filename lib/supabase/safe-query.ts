import { getSupabaseConfigError } from "@/lib/supabase/config";

type SupabaseQueryError = {
  message?: string;
};

type SupabaseQueryResult<T> = {
  data: T | null;
  error: SupabaseQueryError | null;
  count?: number | null;
};

function logFailure(label: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as SupabaseQueryError).message)
        : String(error);

  console.warn(`[supabase] ${label} failed: ${message}`);
}

function shouldSkipSupabase(label: string) {
  const configError = getSupabaseConfigError();
  if (!configError) return false;

  console.warn(`[supabase] ${label} skipped: ${configError}`);
  return true;
}

export async function safeData<T>(
  label: string,
  query: PromiseLike<SupabaseQueryResult<T>>,
) {
  if (shouldSkipSupabase(label)) {
    return null;
  }

  try {
    const result = await query;
    if (result.error) {
      logFailure(label, result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    logFailure(label, error);
    return null;
  }
}

export async function safeList<T>(
  label: string,
  query: PromiseLike<SupabaseQueryResult<T[]>>,
) {
  return (await safeData(label, query)) ?? [];
}

export async function safeCount(
  label: string,
  query: PromiseLike<SupabaseQueryResult<unknown>>,
) {
  if (shouldSkipSupabase(label)) {
    return 0;
  }

  try {
    const result = await query;
    if (result.error) {
      logFailure(label, result.error);
      return 0;
    }

    return result.count ?? 0;
  } catch (error) {
    logFailure(label, error);
    return 0;
  }
}
