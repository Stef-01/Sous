---
name: permission-monitor
description: "Proactively monitors repeated permission approval patterns during coding sessions and suggests adding frequently-approved tools to the allow list. Trigger this skill whenever a user mentions permissions being annoying, when you notice repeated permission prompts for the same tool, when the user says 'stop asking for permission', 'auto-approve', 'allow all', or when setting up a new project's Claude Code configuration. Also trigger when reviewing .claude/settings.json or settings.local.json files."
---

# Permission Monitor

## Purpose

This skill detects when the user is repeatedly approving the same permission requests during Claude Code sessions and proactively suggests adding those tools to the project's allow list. The goal is to eliminate friction so coding flows smoothly without constant interruptions.

## How It Works

### Detection Triggers

Monitor for these patterns during any coding session:

1. **Repeated same-tool approvals** — If the user approves the same tool (e.g., `Bash(npm test)`, `Write(src/*)`) more than twice in a session, flag it.
2. **Cluster approvals** — If the user approves 3+ permissions in rapid succession, they're likely just clicking through. Suggest bulk-adding those tools.
3. **Session start friction** — If the first 3-5 interactions of a session are all permission approvals, the allow list is too restrictive.
4. **Cross-session patterns** — If the same tools keep getting approved across multiple sessions (check memory for past patterns), they should definitely be in the allow list.

### Response Protocol

When a pattern is detected:

1. **Identify the tools** — List the specific tool patterns being repeatedly approved (e.g., `Bash(npm *)`, `Edit(src/**)`).

2. **Suggest the fix** — Propose the exact JSON to add to `.claude/settings.json` or `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm *)",
      "Edit(src/**)",
      "Write(src/**)"
    ]
  }
}
```

3. **Explain scope options:**
   - `settings.json` — project-level, committed to git, shared with team
   - `settings.local.json` — local only, not committed, personal preferences
   - `~/.claude/settings.json` — global, applies to all projects

4. **Offer to apply** — Ask "Want me to add these to your allow list so you don't get asked again?" and apply immediately if confirmed.

### Common Tool Patterns Worth Auto-Allowing

For a typical web development project:

```json
{
  "permissions": {
    "allow": [
      "Bash(*)",
      "Read(*)",
      "Write(*)",
      "Edit(*)",
      "Glob(*)",
      "Grep(*)",
      "WebFetch(*)",
      "WebSearch(*)",
      "NotebookEdit(*)",
      "TodoWrite(*)",
      "Agent(*)",
      "Task(*)",
      "ToolSearch(*)",
      "mcp__*"
    ]
  }
}
```

For more conservative setups, suggest scoped patterns:
- `Bash(npm *)` — allow all npm commands
- `Bash(git *)` — allow all git commands
- `Bash(pnpm *)` — allow pnpm
- `Write(src/**)` — allow writing to source files
- `Edit(src/**)` — allow editing source files

### Proactive Monitoring

Even when not explicitly triggered, this skill should inform behavior during coding sessions:

- After applying permissions, verify they work by checking if the next tool call goes through without a prompt
- If a new tool type starts getting approved repeatedly (e.g., user adds a new MCP), proactively suggest adding it
- Keep the allow list clean — use wildcards where patterns are broad enough (e.g., `Bash(*)` instead of 20 specific bash patterns)

### Memory Integration

When updating allow lists, save to memory:
- Which projects have been configured
- User's preference for scope (project vs local vs global)
- Any tools the user explicitly wants to keep gated (rare but possible)
