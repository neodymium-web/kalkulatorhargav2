export function releaseConfiguration(env: Record<string, string | undefined>) {
  const enabled =
    env.VERCEL_ENV === "production" &&
    env.MIGRATION_CUTOVER_APPROVED === "true" &&
    env.SITE_INDEXABLE === "true";
  return {
    enabled,
    origin: enabled
      ? "https://www.kalkulatorharga.com"
      : "https://kalkulatorharga.com",
    includePendingArchives: !enabled,
  };
}
