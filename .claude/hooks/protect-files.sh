#!/usr/bin/env bash
set -euo pipefail

hook_input=$(cat)
file=$(printf '%s' "$hook_input" | node -e "
let d='';
process.stdin.on('data',c=>d+=c).on('end',()=>{
  try {
    const o=JSON.parse(d);
    console.log(o.tool_input?.file_path||o.tool_input?.path||'');
  } catch(e) {}
});
")

protected=(
  "\.env"
  "\.git/"
  "package-lock\.json"
  "yarn\.lock"
  ".*\.pem"
  ".*\.key"
  "secrets/"
)

for pattern in "${protected[@]}"; do
  if echo "$file" | grep -qiE "$pattern"; then
    echo "Blocked: '$file' matches protected file pattern '$pattern'. Explain why this edit is necessary." >&2
    exit 2
  fi
done

exit 0
