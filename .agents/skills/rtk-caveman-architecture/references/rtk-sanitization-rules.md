# 🛡️ RTK (Rust Token Killer) Stream Sanitization Rules

The **RTK Protocol** focuses on maximizing signal-to-noise ratio in the input context buffer. Unbounded terminal output, giant JSON payloads, and uncompressed compilation logs are the primary causes of context pollution, reasoning degradation, and token burn in autonomous coding agents.

---

## 1. Command-Line Execution Proxy Standards

When issuing shell commands (via `run_command` or equivalent), adhere to the following input-pruning rules:

### ❌ Anti-Patterns (Never Execute)
```bash
# Bad: Floods context window with 10,000+ lines of raw build log
npm run build 

# Bad: Catches entire massive file into context buffer just to find one function
cat src/engine/video.py | grep "def generate"

# Bad: Runs full test suite when debugging a single failing unit test
pytest -v
```

### ✅ RTK Architect Practices (Always Execute)
```bash
# Good: Suppress decorative progress spinners, output only errors/warnings
npm run build --silent || true

# Good: Use specific search tools (grep_search) or targeted line extraction
# In terminal fallback: use concise head/tail or specific flag selection
git status -s && git log -n 3 --oneline

# Good: Isolate exact test target and disable verbose traceback clutter
pytest tests/test_engine.py -k "test_render" --tb=short -q
```

---

## 2. Tool Output Compression Matrix

When invoking system tools, automatically apply these compression configurations:

| Tool Category | Standard Noisy Behavior | RTK Compressed Alternative | Token Reduction |
| :--- | :--- | :--- | :--- |
| **File Reading (`view_file`)** | Reading entire 500-line script to inspect 1 helper function. | Pass `StartLine` and `EndLine` parameters (e.g., lines 110–145). | **~85%** |
| **Code Searching (`grep_search`)** | Searching generic terms (`def`, `import`) without path restrictions. | Use exact regular expressions & restrict `SearchPath` to specific directories (`src/engine`). | **~90%** |
| **Git Operations** | `git status`, `git log`, `git diff` on massive changelogs. | `git status -s`, `git log -n 5 --oneline`, `git diff --stat`. | **~75%** |
| **Python Testing / Build** | Full stack traces for syntax errors or dependency installation. | `pip install --quiet`, `python -m py_compile <file>` for syntax checks. | **~80%** |

---

## 3. Handling Unavoidable Verbose Streams

If a command *must* generate massive output (e.g., compiling a large native library or running a deep database migration), route the output away from the direct context loop:

1. **Log Redirection:** Redirect stdout to a temporary scratch file and only print the exit code or trailing lines:
   ```powershell
   # Windows PowerShell example
   .\run_heavy_task.bat > temp\build.log 2>&1
   Get-Content temp\build.log -Tail 15
   ```
2. **Post-Hoc Grep Inspection:** If a build fails with log redirection, query the error log file using exact keyword matches (`ERROR:`, `Exception`, `FAIL`) rather than dumping the entire file back into memory.
