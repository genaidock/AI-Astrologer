# 🪨 Caveman Communication & Output Protocol

The **Caveman Protocol** is an output-generation discipline designed to eliminate every token that does not contribute directly to computational accuracy, task execution, or developer insight.

---

## 1. Syntax & Vocabulary Guidelines

### The "Nine Pillars of Caveman Density"
1. **Drop articles & filler:** Omit *the*, *a*, *an*, *that*, *just*, *simply*, *very*, *basically*, *in order to*.
2. **No conversational padding:** Never start with *"Hello!"*, *"Certainly!"*, *"Sure thing!"*, or *"I have completed your request."*
3. **Action verb initiation:** Begin every bullet or thought block with an active verb or status token (`[PROCEED]`, `[FIXED]`, `[ERROR]`, `[ANALYZING]`).
4. **Symbolic logic:** Use arrows (`->`), equality signs (`=`), and inequality signs (`!=`) to explain causality and state changes.
5. **No redundant code echoing:** When editing a file using `replace_file_content` or `multi_replace_file_content`, do NOT reprint the code inside your markdown conversational reply unless discussing a subtle logical nuance.
6. **Explicit linking over description:** Instead of saying *"In the file named app.py on line 25..."*, output clickable references: [app.py:L25](file:///c:/MyWorkSpace/AiVideo/app.py#L25).
7. **Table compression:** When comparing 2+ items, models, or design choices, always format as a concise markdown table.
8. **Binary status reporting:** Report multi-step executions as simple checklists: `[x]` (pass), `[ ]` (pending), `[!]` (fail/blocked).
9. **Architectural integrity intact:** While speech is compressed into fragments, **code deliverables must remain 100% syntactically valid, idiomatic, and cleanly commented**.

---

## 2. Tiered Mode Examples

### Tier 1: Architectural Review (Medium-Density)
*Used when answering architecture questions or presenting implementation plans.*
```markdown
### 🎯 Proposed State Architecture (RTK + Redux Toolkit)
- **Goal:** Unify video state, decouple UI renders from polling loops.
- **Store Config:**
  - `sceneSlice.ts`: Manages scene ordering, voice prompts, custom image buffers.
  - `renderApi.ts` (RTK Query): Automates API polling for backend render status (`/api/render`).
- **Token Impact:** RTK Query eliminates manual `useEffect` fetching boilerplate -> ~30% smaller component bundle.
```

### Tier 2: Code Execution & Repair (High-Density)
*Used during active programming turns and modifying codebase files.*
```markdown
### 🛠️ Execution Summary
- Found bug: Null check missing in [bytez_video.py:L45](file:///path/engine/bytez_video.py#L45).
- Action: Added check for `video_url` list vs string structure via `replace_file_content`.
- Verification: Ran syntax check (`py_compile`) -> `[STATUS: PASS]`.
```

### Tier 3: Autonomous Debug Loop (Ultra-Dense / Deep Caveman)
*Used inside multi-agent loops or rapid diagnostic test iterations.*
```markdown
`[DEBUG: Iteration 2]` -> Trace: `KeyError: 'output'` @ [llm.py:L112](file:///path/engine/llm.py#L112).
Fixing JSON extraction logic -> re-executing unit test suite.
```

---

## 3. Anti-Rationalization Checklist for Caveman Mode
Before finalizing an output in Caveman mode, execute a silent cognitive verification:
- [ ] *Did I cut instructions or explanations that the user actually needs to make an informed architectural decision?* (If yes -> restore required details in bullet form).
- [ ] *Did I strip docstrings, type annotations, or vital inline comments out of the generated source code?* (If yes -> **REJECT**, restore production-grade comments immediately).
- [ ] *Did I skip running terminal verification commands because I wanted my turn to be 'quick and concise'?* (If yes -> **STOP**, invoke test tools immediately).
