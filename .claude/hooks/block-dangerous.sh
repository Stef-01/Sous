#!/usr/bin/env bash
set -euo pipefail

hook_input=$(cat)
cmd=$(printf '%s' "$hook_input" | node -e "
let d='';
process.stdin.on('data',c=>d+=c).on('end',()=>{
  try { console.log(JSON.parse(d).tool_input?.command||''); } catch(e) {}
});
")

dangerous_patterns=(
  "rm -rf"
  "git reset --hard"
  "git push.*--force"
  "DROP TABLE"
  "DROP DATABASE"
  "curl.*\|.*sh"
  "wget.*\|.*bash"
)

for pattern in "${dangerous_patterns[@]}"; do
  if echo "$cmd" | grep -qiE "$pattern"; then
    echo "Blocked: '$cmd' matches dangerous pattern '$pattern'. Propose a safer alternative." >&2
    exit 2
  fi
done

exit 0
