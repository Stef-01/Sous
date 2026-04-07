#!/usr/bin/env bash
set -euo pipefail

hook_input=$(cat)
file=$(printf '%s' "$hook_input" | node -e "
let d='';
process.stdin.on('data',c=>d+=c).on('end',()=>{
  try { console.log(JSON.parse(d).tool_input?.file_path||''); } catch(e) {}
});
")

# Skip empty paths or non-source files
if [[ -z "$file" ]]; then
  exit 0
fi

# Run prettier (best-effort: ignore unknown file types)
npx prettier --write "$file" --log-level silent 2>/dev/null || true

# Run eslint --fix only on JS/TS files
if echo "$file" | grep -qE "\.(js|jsx|ts|tsx|mjs|cjs)$"; then
  npx eslint --fix "$file" 2>&1 | tail -5 || true
fi

exit 0
