const MIN_ANON_KEY_LENGTH = 40;

export function getSupabaseConfigError() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url.includes("your-project-ref")) {
    return "NEXT_PUBLIC_SUPABASE_URL is missing or still uses the placeholder value.";
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname.endsWith(".supabase.co")) {
      return "NEXT_PUBLIC_SUPABASE_URL must be the Supabase Project URL from Settings > API.";
    }
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL is not a valid URL.";
  }

  if (!anonKey || anonKey.includes("your-anon") || anonKey.length < MIN_ANON_KEY_LENGTH) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing, still a placeholder, or too short to be a real anon key.";
  }

  return null;
}
