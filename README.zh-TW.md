# looprails(繁體中文)

一份跨工具的**閉環開發(closed-loop development)** boilerplate:AI agent 產生程式碼 → 跑 verifier
→ 修正失敗 → 記錄學到的東西 → 重複,直到達成目標,或卡住停下來請人介入。

> **native `/goal` 給你引擎;這份模板給你燃料、護欄、記憶。**

到 2026 年,各大 agent CLI 都已內建迴圈(`/goal`、`/batch`、Ralph loop),迴圈本身不再是難點。這份模板
走 **native-first**:把迴圈交給你工具的 `/goal`,補上 native 給不了的三件事。

## Why(為什麼還需要它)

1. **驗收品質**:native 迴圈的可靠度,完全取決於你餵的 verifier。這裡「完成」是**雙閘** —— 確定性測試
   **加上**獨立的審查者;「做得好」是可調權重、帶錨點的 **rubric**(你的 personal benchmark),讓質化工作
   (UI、文案)是被「評」出來的,而不是用猜的。
2. **跨 session 記憶**:native 迴圈不會讓**下一個** goal 更聰明;結構化的學習庫會 —— 每個解掉的坑都記錄
   下來,依 tag 取回。
3. **跨工具可攜**:同一套 rules、rubrics、記憶可跑在 Claude Code、Codex、Antigravity、本地模型上,不被
   單一 vendor 綁死。

## 需求

Node ≥18,以及一個 bash shell 來跑 hooks(macOS/Linux 內建;Windows 用 Git Bash 或 WSL —— 沒有的話
`.sh` hooks 會靜默失效,你會在不自知的情況下失去護欄)。

## 快速開始

在 GitHub 用 "Use this template" 開你的 repo、clone 下來,然後**讓你的 agent 幫你設定**。在資料夾裡
開你的 agent CLI(例如 `claude`),直接用講的:

```text
「幫我設定這個模板:跑 scripts/setup.sh,讀 AGENTS.md 和 DECISIONS.md,然後 /calibrate。」
        ↳ agent 會 bootstrap、訪談你、回填 AGENTS.md 與 rubric 權重 —— 你確認。

「/plan 一個 phase 做 <你想做的東西>」
        ↳ agent 多輪問清楚,然後寫進 PHASES.md,等你點頭。

「/loop phase-1」
        ↳ 跑閉環直到雙閘全綠,或停下來請人介入。
```

你完全不用手寫設定 —— agent 會回填 `AGENTS.md`、草擬 rubric 權重、把對話整理進 `PHASES.md`。想走手動?
全都還在:直接編輯檔案,跑 `node scripts/loop.mjs phase-1 --tool claude`。CI 和進階使用者也走這條。

## 運作方式

你用自然語言驅動 —— `/calibrate` 設定、`/plan` 把對話變成 phases、`/loop` 執行。底層:

```
PHASES.md ──expand-phase──▶ tasks/*.md(嚴格)
  每個 task(平行 worktree):
    builder ─▶ harness.mjs(gate1 測試 + gate2 checklist|rubric)
       ├─ 失敗 ─▶ diagnose-failure ─▶ builder       (迭代,跑在 native /goal)
       └─ 通過 ─▶ record-learning + CHANGELOG
    卡 N 次 ─▶ human review
```

- **雙閘(二元)**:gate 1 = 確定性測試;gate 2 = checklist(量化)或 rubric 評分(質化)。兩個都綠才算完成。
- **質化評判**:rubric 評「render 出的 screenshot」,並用 **pairwise**(比上一版最佳)—— 比絕對打分穩定得多。
- **確定性護欄(hooks)**:越界編輯被擋;測試沒綠不准收尾。這些是模型繞不過去的規則。

## Seams(只有 script 路徑才需要接)

純對話式 `/loop`(native `/goal`)完全不需要這些。只有當你走 `node scripts/loop.mjs` 路徑跑平行
worktree 時才需要接實:

- **Worktree 隔離** —— `scripts/loop.mjs:113`(`ensureWorktree`;接實前回傳 ROOT)。
- **native-goal CLI flags** —— `scripts/adapters/claude.mjs:15`(請對照你工具當前的 CLI 驗證)。
- **質化評分的截圖 render** —— `eval/score.mjs:46`。

## 目錄結構

```
AGENTS.md             唯一真相來源(CLAUDE.md 只是 `@AGENTS.md`)
PHASES.md             你的階段藍圖(人寫的 Markdown)
DECISIONS.md          架構決策記錄(ADR)
.agents/              引擎室:rules / skills / agents / rubrics / hooks
.claude/settings.json 唯一工具專屬檔(hooks 設定)
.agent-learnings*     結構化跨 session 記憶(索引 + 依 tag 分檔)
eval/                 harness.mjs(verifier)+ score.mjs(rubric 評分)
scripts/              loop.mjs + adapters/ + bootstrap
```

## 設計原則

薄勝於巧。native-first —— 不重造迴圈。單一真相 —— 不漂移。每條 rule 都要掙得位置;錯的指令比沒有指令更糟。
理由見 `DECISIONS.md`。

## 語言

引擎室檔案用英文以最大化模型相容;你自己的內容(填入 `AGENTS.md` 的欄位、phases、learnings)可用任何語言。

English → **[README.md](./README.md)**
