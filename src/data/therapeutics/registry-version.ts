/**
 * Evidence registry version + changelog.
 *
 * The registry is a LIVING system (report §"Recursive appraisal"). Bump the
 * version and append a changelog entry on any re-appraisal: new guideline, new
 * meta-analysis crossing a clinical threshold, new safety signal, or a record
 * whose `interventionClass` changes (e.g. an extract effect becoming
 * recipe-native). A version bump should trigger clinician re-review (G1)
 * before any user-facing change.
 */

import type { RegistryVersion } from "@/types/therapeutics";

export const REGISTRY_VERSION: RegistryVersion = {
  version: "0.1.0-unreviewed",
  updatedAt: "2026-06-03",
  changelog: [
    {
      version: "0.1.0-unreviewed",
      date: "2026-06-03",
      note: "Initial encoding of the culinary-therapeutics evidence matrix (Tier A engines + Tier B adjuncts + bounded entries). All records unreviewed/educational pending clinician sign-off (G1) and legal review (G5).",
    },
  ],
};
