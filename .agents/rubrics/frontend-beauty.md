# Rubric: frontend-beauty

> A living benchmark for "is this UI good." The validator scores each dimension 1–5 against the
> anchors, multiplies by its weight, and sums to a 0–100 composite. **Tune the weights to match your
> taste — that is what makes this *your* benchmark.** Judge the rendered **screenshot**, not the code,
> and prefer **pairwise** (is this better than the best prior attempt?).

## Scale
Each dimension is scored 1–5. Anchors describe 5 (excellent), 3 (acceptable), 1 (poor); interpolate 2/4.

## Dimensions

### 1. Design quality — weight 30
Coherent visual mood: color, type, and layout feel like one intentional system.
- **5** — One clear mood; palette and type pairing feel deliberate and harmonious; nothing clashes.
- **3** — Mostly coherent; one or two off notes (a stray color, an inconsistent radius).
- **1** — Grab-bag look; colors/fonts fight each other; no discernible mood.

### 2. Originality — weight 20
Looks designed for THIS product, not a stock template.
- **5** — A distinctive idea executed with restraint; memorable without gimmicks.
- **3** — Competent but generic; could be any SaaS starter.
- **1** — Obvious unmodified template / default-component dump.

### 3. Technical execution — weight 30
Type hierarchy, spacing rhythm, alignment, and contrast are consistent and correct.
- **5** — Clear hierarchy; consistent spacing scale; crisp alignment; contrast passes WCAG AA.
- **3** — Generally consistent; minor spacing/alignment drift; contrast mostly fine.
- **1** — Muddled hierarchy; arbitrary spacing; misalignment; low-contrast text.

### 4. Usability — weight 20
A first-time user understands it, finds what they need, and can finish the task.
- **5** — Self-evident; primary action obvious; no instructions needed; responsive at target widths.
- **3** — Usable after a brief look; one minor confusion; mostly responsive.
- **1** — Confusing; primary action buried; layout breaks at common widths.

## Threshold (pass)
- Composite **≥ 80**, AND no single dimension **< 3**.

## Notes
- Weights must sum to 100. Change them freely; keep the sum at 100.
- **Pairwise**: when a best-prior screenshot is provided, pass only if the current attempt is at least
  as good on every dimension AND has a higher composite.
- Score what is visible in the screenshot. Do not credit intentions that are not on screen.
