# Claude Code Instructions

> Claude-specific instructions for working on this project. For universal project context (tech stack, schema, structure), see **@AGENTS.md**.

---

## Quick Reference

- **Project Context:** See `AGENTS.md` for tech stack, database schema, project structure, and skill system
- **Frontend Skills:** `frontend-agent/frontend-skills/`
- **Backend Skills:** `backend-agent/backend-skills/`
- **Backend Architecture:** `backend-agent/supabase-backend-architect.md`

---

## Claude Code Tool Usage

### Sub-Agent Orchestration

For complex multi-step tasks, use the Task tool with specialized agents:

```
Task tool → subagent_type: "general-purpose"
Prompt: "Read [skill-path]/SKILL.md and apply it to [task]"
```

### When to Spawn Sub-Agents

- **Frontend tasks:** Read relevant skills from `frontend-agent/frontend-skills/` first
- **Backend tasks:** Read relevant skills from `backend-agent/backend-skills/` first
- **Complex tasks:** Spawn sub-agents for parallel work

---

## Frontend Agent Orchestration

**Trigger:** User says "Activate frontend-ui-expert" or requests UI work

### Execution Pattern

1. **Read ALL relevant skills** for the task from `frontend-agent/frontend-skills/`
2. **Combine knowledge** from multiple skills
3. **Apply patterns** consistently across components
4. **Ensure TypeScript error-free** code
5. **Test responsive behavior** (mobile-first)

### Available Frontend Skills

| Skill | When to Use |
|-------|-------------|
| `ui-ux-designer` | Any UI design task |
| `tailwind-css-mastery` | Complex layouts, responsive design |
| `teal-accenting` | Adding teal color accents |
| `vibrant-gradient-mastery` | Gradient backgrounds |
| `two-tone-layout` | Two-color page layouts |
| `premium-typography` | Font styling, text hierarchy |
| `lucide-icons` | Icon usage |
| `nextjs-14-expert` | Next.js App Router patterns |
| `typescript-error-free` | Type safety |
| `navbar-guard` | Protected navigation |
| `auth-ui-integration` | Auth UI components |
| `password-visibility` | Password toggle |
| `toaster-feedback` | Toast notifications |
| `zero-margin-design` | Edge-to-edge layouts |

---

## Backend Agent Orchestration

**Trigger:** User says "Activate backend-expert" or requests backend/Supabase work

### Execution Pattern

1. **Read relevant backend skills** from `backend-agent/backend-skills/`
2. **Follow Supabase best practices**
3. **Implement proper RLS policies**
4. **Handle errors gracefully**
5. **Validate all user inputs**

### Available Backend Skills

| Skill | When to Use |
|-------|-------------|
| `supabase-auth-manager` | Authentication flows |
| `google-oauth-setup` | Google OAuth integration |
| `auth-callback-redirect` | OAuth callback handling |
| `user-metadata-handler` | User profile/metadata |
| `row-level-security` | RLS policies |
| `database-policies` | Database access policies |
| `event-schema-design` | Event table schema |
| `data-validation` | Input validation |
| `storage-policies` | File storage policies |
| `advanced-sql-queries` | Complex SQL queries |
| `middleware-protection` | API route protection |
| `server-error-handling` | Error handling patterns |
| `Backend-Logic` | General backend patterns |

---

## Claude Code Workflow Guidelines

### Before Any Frontend Task
1. Read relevant skill file(s) from `frontend-agent/frontend-skills/`
2. Apply patterns from the skill's Instructions section
3. Follow execution steps defined in the skill

### Before Any Backend Task
1. Read `backend-agent/supabase-backend-architect.md` for architecture guidance
2. Read relevant skill file(s) from `backend-agent/backend-skills/`
3. Apply patterns and follow execution steps

### Code Quality Checklist
- [ ] TypeScript types are correct (no `any` unless absolutely necessary)
- [ ] Components follow existing patterns in `src/components/`
- [ ] Supabase queries use proper error handling
- [ ] Tailwind classes follow mobile-first approach
- [ ] No console.log statements left in code

---

## File References

When referencing code, use the pattern `file_path:line_number` for easy navigation:

```
Example: src/components/EventCard.tsx:42
```

---

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email
```
