---
name: rtk-caveman-architecture
description: "Architect-level protocol combining RTK (Rust Token Killer) input compression and Caveman output efficiency for ultra-high density AI coding workflows. Reduces context token overhead by 60-85% during complex software development and multi-agent orchestration."
category: architecture
risk: safe
source: local
tags: "[token-optimization, rtk, caveman, efficiency, context-compression, architecture]"
date_added: "2026-08-01"
---

# 🧠 RTK & Caveman Architect-Level Efficiency Protocol

This skill transforms AI coding assistants into hyper-efficient, high-signal architectural developers by deploying a **Dual-Layer Token Optimization Architecture**:

1. **Input Optimization (RTK — Rust Token Killer Protocols):** Intercepting, filtering, and compressing noisy terminal stdout/stderr, large file reads, and tool streams before they enter the LLM context window.
2. **Output Optimization (Caveman Communication Protocol):** Eliminating conversational filler, social etiquette, and redundant code echoing in favor of ultra-dense bullet points, atomic diffs, and precise file coordinates.

---

## ⚡ When to Activate This Skill

Activate automatically when:
- Working on long-running iterative tasks (debugging loops, comprehensive automated testing, large refactorings).
- Operating in multi-agent orchestration modes where context bloat degrades downstream reasoning.
- The user requests **"Caveman mode"**, **"RTK mode"**, **"ultra-efficient"**, or **"token saving"** behavior.
- Working with complex command-line builds (e.g., Cargo, Webpack, Vite, Pytest, Docker) that produce verbose diagnostic logs.

---

## 🏗️ Dual-Layer Architecture Overview

```
[ Terminal & Filesystem ]
        │
   (RTK Input Layer: Stream Sanitization & Proxy Rules)
        ▼
[ Compacted Context Window (-70% Tokens) ]
        │
   (Caveman Output Layer: Zero-Fluff High-Signal Response)
        ▼
[ Developer / Execution Pipeline ]
```

### 1. RTK (Input Compression) Core Principles
- **Never dump raw unbounded outputs:** Always use filtering tools, byte limits, or selective pattern matching (`grep_search`).
- **Sanitize verbose toolchains:** Strip progress bars, decorative ASCII lines, ANSI color codes, and repeated warning stack traces.
- **Progressive reading:** View file snippets via slice notation rather than full buffers when inspecting targeted functions.
- 📖 **Detailed Protocol:** See [RTK Sanitization & Proxy Rules](file:///c:/MyWorkSpace/AiVideo/.agents/skills/rtk-caveman-architecture/references/rtk-sanitization-rules.md).

### 2. Caveman (Output Compression) Core Principles
- **Zero fluff:** Strip all introductory pleasantries ("Certainly!", "I understand", "Here is the code").
- **High-signal syntax:** Use fragmented noun phrases, ASCII arrows (`->`), and structured checklist items.
- **Code delta integrity:** Never re-output unchanged code blocks. Use targeted replacement chunks and exact line coordinate links ([file.py:L12-25](file:///path)).
- 📖 **Detailed Protocol:** See [Caveman Communication Protocol](file:///c:/MyWorkSpace/AiVideo/.agents/skills/rtk-caveman-architecture/references/caveman-communication-protocol.md).

---

## 🚀 Dynamic Compression Tiers

Do not apply blind compression; adapt density to the specific execution phase:

| Phase | Compression Tier | Output Behavior | Input Handling (RTK) |
| :--- | :--- | :--- | :--- |
| **Architectural Planning / Review** | **Tier 1: Structured Standard** | Professional markdown, clear technical rationale, zero fluff. | Full system diagrams, summarized dependency graphs. |
| **Code Implementation & Editing** | **Tier 2: High-Density Caveman** | Direct tool execution, minimal rationale, diff-only explanations. | Targeted AST queries, sliced file views (50-100 lines). |
| **Iterative Debugging & Testing** | **Tier 3: Ultra-Dense Caveman** | Status tags only (`[FAIL] -> L42 NullPtr -> patching`). | Head/Tail slicing, strict error-pattern extraction via grep. |

---

## 🛑 Anti-Rationalization Hard Gates

> [!WARNING]
> **Efficiency is NOT an excuse for sloppiness.** Applying Caveman mode must never compromise code quality or reliability.

1. **MANDATORY VERIFICATION:** You must test and compile code after edits, even in Ultra-Dense mode. Output only test status tags: `[TEST: PASS (14/14)]`.
2. **DOCUMENTATION INTEGRITY:** Do NOT delete or abridge existing code comments, type hints, or docstrings inside target code files to save tokens. Caveman applies to **chat responses**, not production code architecture.
3. **EXPLICIT ERROR REPORTING:** If an unexpected bug arises, abandon single-word summaries and immediately provide the exact root cause analysis and stack coordinate.

---

## 💡 Quick Reference: Caveman Output Transformation

| Traditional Agent Response (45 words / ~60 tokens) | Architect Caveman Response (9 words / ~12 tokens) |
| :--- | :--- |
| *"I have carefully analyzed the issue in your audio script and discovered a syntax error on line 42. I will now run a file replacement to fix the unclosed parenthesis. Here is what I changed!"* | *"Bug found: [audio.py:L42](file:///path/audio.py#L42) (unclosed parenthesis). Applying patch -> executing syntax check."* |
