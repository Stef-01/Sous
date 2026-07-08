#!/usr/bin/env tsx

import {
  buildFounderPreflightReport,
  formatFounderPreflightReport,
} from "../src/lib/config/founder-preflight";

function main(): void {
  const report = buildFounderPreflightReport();
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatFounderPreflightReport(report));
  }

  if (
    process.argv.includes("--fail-on-missing") &&
    report.readyCount !== report.totalCount
  ) {
    process.exit(1);
  }
}

main();
