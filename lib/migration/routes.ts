// Supplemental migration tools; never duplicate the 100 canonical inventory IDs.
export const migrationPaths = [
  "/kalkulator/saham/average",
  "/kalkulator/tiktok/benchmark",
] as const;
export const migrationTools = [
  {
    id: "migration-stock-average",
    path: migrationPaths[0],
    scope:
      "Manual exact cash simulation; BEI order admissibility withheld when unverified",
  },
  {
    id: "migration-tiktok-analysis",
    path: migrationPaths[1],
    scope:
      "Manual comparison, no licensed industry benchmark or legacy dataset parity",
  },
] as const;
