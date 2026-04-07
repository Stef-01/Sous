#!/usr/bin/env bash
set -euo pipefail

hook_input=$(cat)
cmd=$(printf '%s' "$hook_input" | node -e "
let d='';
process.stdin.on('data',c=>d+=c).on('end',()=>{
  try { console.log(JSON.parse(d).tool_input?.command||''); } catch(e) {}
});
")

printf '%s %s\n' "$(date "+%Y-%m-%dT%H:%M:%S")" "$cmd" >> .claude/command-log.txt
exit 0
