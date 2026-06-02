/**
 * Foundation generator: project-scheduling
 *
 * Core-drill + extended-fit. 14 MCQ + 11 SHORT + 3 EXTENDED_ANSWER = 28 items.
 * Foundation scheduling: identify earliest start/finish from a small task
 * table with predecessors, identify critical (longest) path informally, no
 * formal CPM method. Real-world contexts: party setup, renovation, event run.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/project-scheduling.json");

const TOPIC = "discrete-mathematics";
const SUB = "project-scheduling";

type Diff = "EASY" | "MEDIUM" | "HARD";
type ItemType = "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";

interface Item {
  type: ItemType;
  marks: number;
  difficulty: Diff;
  topicSlug: string;
  subtopicSlugs: string[];
  content: string;
  preamble?: string | null;
  parts?: Array<{ label: string; marks: number; content: string; solution: string }> | null;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: "A" | "B" | "C" | "D";
  solutionContent?: string | null;
}

const mcq = (
  content: string,
  options: [string, string, string, string],
  correct: "A" | "B" | "C" | "D",
  difficulty: Diff,
  solution: string,
): Item => ({
  type: "MCQ",
  marks: 1,
  difficulty,
  topicSlug: TOPIC,
  subtopicSlugs: [SUB],
  content,
  optionA: options[0],
  optionB: options[1],
  optionC: options[2],
  optionD: options[3],
  correctOption: correct,
  solutionContent: solution,
});

const sa = (content: string, marks: number, difficulty: Diff, solution: string): Item => ({
  type: "SHORT_ANSWER",
  marks,
  difficulty,
  topicSlug: TOPIC,
  subtopicSlugs: [SUB],
  content,
  solutionContent: solution,
});

const ea = (
  preamble: string,
  difficulty: Diff,
  parts: Array<{ label: string; marks: number; content: string; solution: string }>,
): Item => ({
  type: "EXTENDED_ANSWER",
  marks: parts.reduce((s, p) => s + p.marks, 0),
  difficulty,
  topicSlug: TOPIC,
  subtopicSlugs: [SUB],
  preamble,
  parts,
  content: "",
});

const items: Item[] = [
  // ── MCQ (14) ─────────────────────────────────────────────────────────
  mcq(
    "A project has $5$ tasks done strictly one after the other. The durations are $2, 3, 4, 1, 5$ hours. The total time to complete the project is:",
    ["$5$ hours", "$10$ hours", "$15$ hours", "$20$ hours"],
    "C",
    "EASY",
    "Done strictly in sequence: $2 + 3 + 4 + 1 + 5 = 15$ hours.\n\n**Answer: C**",
  ),
  mcq(
    "A baking project: task $A$ (mix) takes $10$ min, task $B$ (bake) takes $25$ min, and task $B$ can only start after $A$ finishes. The earliest finish time is:",
    ["$10$ min", "$25$ min", "$30$ min", "$35$ min"],
    "D",
    "EASY",
    "Task $A$ finishes at $10$, then task $B$ takes another $25$. Total: $10 + 25 = 35$ min.\n\n**Answer: D**",
  ),
  mcq(
    "If task $X$ takes $4$ hours and task $Y$ takes $3$ hours, and the two tasks can be done at the same time (in parallel), the minimum time to finish both is:",
    ["$3$ hours", "$4$ hours", "$7$ hours", "$12$ hours"],
    "B",
    "EASY",
    "Done in parallel, the minimum time is the longer of the two: $4$ hours.\n\n**Answer: B**",
  ),
  mcq(
    "A project has tasks $P$ ($5$ days), $Q$ ($3$ days) and $R$ ($4$ days). $P$ and $Q$ start at day $0$ and run in parallel. $R$ starts only when both $P$ and $Q$ are finished. The total project duration is:",
    ["$8$ days", "$9$ days", "$12$ days", "$5$ days"],
    "B",
    "EASY",
    "$P$ and $Q$ both start at day $0$; the later of them (P) finishes at day $5$. $R$ then takes $4$ days, finishing at $5 + 4 = 9$ days.\n\n**Answer: B**",
  ),
  mcq(
    "In a project, the critical path is the:",
    ["shortest sequence of tasks", "longest sequence of tasks", "set of tasks with the most workers", "set of tasks that cost the most"],
    "B",
    "EASY",
    "The critical path is the longest sequence of dependent tasks; it determines the minimum project duration.\n\n**Answer: B**",
  ),
  mcq(
    "A small project has tasks and predecessors:\n\n| Task | Duration (hr) | Predecessors |\n|---|---|---|\n| $A$ | $3$ | – |\n| $B$ | $2$ | $A$ |\n| $C$ | $4$ | $A$ |\n| $D$ | $1$ | $B, C$ |\n\nThe earliest finish time for the whole project is:",
    ["$7$ hr", "$8$ hr", "$9$ hr", "$10$ hr"],
    "B",
    "MEDIUM",
    "Path $A$–$B$–$D$: $3 + 2 + 1 = 6$. Path $A$–$C$–$D$: $3 + 4 + 1 = 8$. Longest (critical) path: $8$ hours.\n\n**Answer: B**",
  ),
  mcq(
    "Using the project from the previous question:\n\n| Task | Duration (hr) | Predecessors |\n|---|---|---|\n| $A$ | $3$ | – |\n| $B$ | $2$ | $A$ |\n| $C$ | $4$ | $A$ |\n| $D$ | $1$ | $B, C$ |\n\nThe critical path is:",
    ["$A$–$B$–$D$", "$A$–$C$–$D$", "$A$–$B$–$C$", "$B$–$C$–$D$"],
    "B",
    "MEDIUM",
    "The critical path is the longest sequence. $A$–$C$–$D$ totals $8$ hours, which is longer than $A$–$B$–$D$ at $6$ hours.\n\n**Answer: B**",
  ),
  mcq(
    "A renovation project has these tasks:\n\n| Task | Duration (days) | Predecessors |\n|---|---|---|\n| $P$ (demo) | $2$ | – |\n| $Q$ (electrical) | $3$ | $P$ |\n| $R$ (plumbing) | $4$ | $P$ |\n| $S$ (drywall) | $2$ | $Q, R$ |\n\nThe minimum number of days to complete the project is:",
    ["$8$", "$9$", "$11$", "$12$"],
    "A",
    "MEDIUM",
    "Critical path: $P$–$R$–$S$ $= 2 + 4 + 2 = 8$ days. The other path $P$–$Q$–$S$ $= 2 + 3 + 2 = 7$ days. Minimum is $8$ days.\n\n**Answer: A**",
  ),
  mcq(
    "A wedding setup has tasks:\n\n| Task | Duration (min) | Predecessors |\n|---|---|---|\n| $A$ (arrange chairs) | $30$ | – |\n| $B$ (set tables) | $40$ | – |\n| $C$ (decorate) | $20$ | $A, B$ |\n\nThe minimum total setup time is:",
    ["$60$ min", "$70$ min", "$90$ min", "$30$ min"],
    "A",
    "MEDIUM",
    "$A$ and $B$ start in parallel. Latest finish: $\\max(30, 40) = 40$. Then $C$ takes $20$. Total: $40 + 20 = 60$ min.\n\n**Answer: A**",
  ),
  mcq(
    "A project task $T$ has an earliest start time of day $4$ and a duration of $6$ days. Its earliest finish time is:",
    ["day $6$", "day $10$", "day $12$", "day $24$"],
    "B",
    "MEDIUM",
    "Earliest finish = earliest start + duration $= 4 + 6 = 10$.\n\n**Answer: B**",
  ),
  mcq(
    "If a task on the critical path is delayed by $2$ days, the project completion is delayed by:",
    ["$0$ days", "$1$ day", "$2$ days", "$4$ days"],
    "C",
    "MEDIUM",
    "Critical-path tasks have no slack: any delay propagates one-for-one. Hence the project is delayed by $2$ days.\n\n**Answer: C**",
  ),
  mcq(
    "In a Gantt-style schedule, a task has a 'float' (or slack) of $3$ days. This means:",
    ["the task must be done in $3$ days", "the task can be delayed by up to $3$ days without delaying the project", "the task starts $3$ days after the project starts", "the task takes $3$ days"],
    "B",
    "MEDIUM",
    "Float is the amount a task can be delayed without affecting the project end. Here float $= 3$ days.\n\n**Answer: B**",
  ),
  mcq(
    "A school musical setup project:\n\n| Task | Duration (hr) | Predecessors |\n|---|---|---|\n| $A$ (build stage) | $4$ | – |\n| $B$ (sound check) | $2$ | $A$ |\n| $C$ (lighting setup) | $3$ | $A$ |\n| $D$ (rehearse) | $5$ | $B, C$ |\n\nThe minimum total time to complete is:",
    ["$10$ hr", "$11$ hr", "$12$ hr", "$14$ hr"],
    "C",
    "HARD",
    "Path $A$–$B$–$D$: $4 + 2 + 5 = 11$. Path $A$–$C$–$D$: $4 + 3 + 5 = 12$. Longest is $12$ hours.\n\n**Answer: C**",
  ),
  mcq(
    "A project's minimum completion time is $20$ days along the critical path. Task $T$ is NOT on the critical path and has a float of $4$ days. If task $T$ is delayed by $6$ days (and no other delays occur), the new project completion time is:",
    ["$20$ days", "$22$ days", "$24$ days", "$26$ days"],
    "B",
    "HARD",
    "Float is $4$ days, so a delay up to $4$ days has no effect. A delay of $6$ days uses all $4$ of float and exceeds the slack by $2$ days, which is added to the project completion: $20 + 2 = 22$ days.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A project has $4$ tasks done strictly in sequence with durations $2, 5, 3, 4$ hours. State the minimum time to complete all tasks.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Sum the durations: $2 + 5 + 3 + 4 = 14$ hours.",
  ),
  sa(
    "Two tasks $X$ ($30$ min) and $Y$ ($45$ min) can be done at the same time (in parallel). State the minimum time to finish both.",
    1,
    "EASY",
    "**Step 1 (1 mark):** When parallel, the minimum is the longer of the two: $45$ minutes.",
  ),
  sa(
    "A task has an earliest start time of day $3$ and a duration of $5$ days. Calculate its earliest finish time.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Earliest finish $= 3 + 5 = $ day $8$.",
  ),
  sa(
    "A project has tasks $A$ (duration $4$ hr) and $B$ (duration $6$ hr) that can start at the same time. Task $C$ (duration $3$ hr) can only start after both $A$ and $B$ are finished. Find the minimum total time to complete the project.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $A$ and $B$ finish at $\\max(4, 6) = 6$ hr.\n\n**Step 2 (1 mark):** $C$ then takes $3$ hr, finishing at $6 + 3 = 9$ hr.",
  ),
  sa(
    "In a project plan, task $D$ is on the critical path. Explain in one sentence what happens to the project end date if $D$ is delayed by $1$ day.",
    2,
    "EASY",
    "**Step 1 (1 mark):** A task on the critical path has zero float.\n\n**Step 2 (1 mark):** Any delay (e.g. $1$ day) on a critical-path task delays the whole project by the same amount, so the project ends $1$ day later.",
  ),
  sa(
    "A school project has tasks with durations and predecessors:\n\n| Task | Duration (hr) | Predecessors |\n|---|---|---|\n| $A$ | $2$ | – |\n| $B$ | $3$ | $A$ |\n| $C$ | $5$ | $A$ |\n| $D$ | $1$ | $B, C$ |\n\nFind the minimum project completion time and state the critical path.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Path $A$–$B$–$D$: $2 + 3 + 1 = 6$ hr. Path $A$–$C$–$D$: $2 + 5 + 1 = 8$ hr.\n\n**Step 2 (1 mark):** Critical path: $A$–$C$–$D$. Minimum project completion: $8$ hours.",
  ),
  sa(
    "A project has $3$ activities, each able to start at the same time (day $0$): $X$ ($4$ days), $Y$ ($2$ days) and $Z$ ($6$ days). All must finish before the project is complete. Calculate the project duration and explain.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** All three start at day $0$; their finishes are $4$, $2$, $6$.\n\n**Step 2 (1 mark):** The project ends only when the latest task ends, so the duration is $6$ days.",
  ),
  sa(
    "A renovation project:\n\n| Task | Duration (days) | Predecessors |\n|---|---|---|\n| $P$ | $3$ | – |\n| $Q$ | $4$ | $P$ |\n| $R$ | $2$ | $P$ |\n| $S$ | $5$ | $Q$ |\n| $T$ | $3$ | $R, S$ |\n\nFind the critical path and the minimum project duration.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Path $P$–$Q$–$S$–$T$: $3 + 4 + 5 + 3 = 15$ days.\n\n**Step 2 (1 mark):** Path $P$–$R$–$T$: $3 + 2 + 3 = 8$ days.\n\n**Step 3 (1 mark):** Critical path is $P$–$Q$–$S$–$T$; minimum project duration is $15$ days.",
  ),
  sa(
    "A task has an earliest finish time of $12$ days and is on the critical path. The latest finish time for any critical-path task equals its earliest finish time. State the latest finish time, and explain what 'float' means for this task.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Latest finish $= $ earliest finish $= 12$ days.\n\n**Step 2 (1 mark):** Float is the difference between latest and earliest finish. For this critical-path task the float is $0$, meaning any delay extends the project.",
  ),
  sa(
    "A small park-cleanup project has tasks:\n\n| Task | Duration (hr) | Predecessors |\n|---|---|---|\n| $A$ (collect rubbish) | $2$ | – |\n| $B$ (mow grass) | $3$ | – |\n| $C$ (plant flowers) | $1$ | $A$ |\n| $D$ (finishing) | $2$ | $B, C$ |\n\nFind the minimum time to complete the project.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Earliest finish of $A$: $2$ hr. Earliest finish of $C$: $2 + 1 = 3$ hr.\n\n**Step 2 (1 mark):** Earliest finish of $B$: $3$ hr. $D$ starts after both $B$ and $C$ end, so its start is $\\max(3, 3) = 3$.\n\n**Step 3 (1 mark):** Earliest finish of $D$: $3 + 2 = 5$ hr. Minimum project time: $5$ hr.",
  ),
  sa(
    "A project's critical path has total duration $25$ days. A non-critical task $W$ has float $3$ days. If $W$ is delayed by $5$ days (and no other delays occur), calculate the new project completion time and explain.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Float $= 3$ days means $W$ can be delayed up to $3$ days without affecting the project.\n\n**Step 2 (1 mark):** A delay of $5$ days exceeds the float by $5 - 3 = 2$ days.\n\n**Step 3 (1 mark):** The project is now delayed by $2$ days: new completion $= 25 + 2 = 27$ days.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A small catering project has the following tasks and predecessors:\n\n| Task | Duration (hr) | Predecessors |\n|---|---|---|\n| $A$ (shop for ingredients) | $1$ | – |\n| $B$ (prepare salads) | $2$ | $A$ |\n| $C$ (cook mains) | $3$ | $A$ |\n| $D$ (plate up) | $1$ | $B, C$ |",
    "EASY",
    [
      {
        label: "a",
        marks: 1,
        content: "List the two complete paths from $A$ to $D$ and the duration of each.",
        solution: "**Step 1 (1 mark):** Path $A$–$B$–$D$: $1 + 2 + 1 = 4$ hr. Path $A$–$C$–$D$: $1 + 3 + 1 = 5$ hr.",
      },
      {
        label: "b",
        marks: 1,
        content: "Identify the critical path.",
        solution: "**Step 1 (1 mark):** Critical path is the longest: $A$–$C$–$D$ (5 hours).",
      },
      {
        label: "c",
        marks: 2,
        content: "Find the float (slack) for task $B$.",
        solution: "**Step 1 (1 mark):** $B$ can start at time $1$ (after $A$). To finish by the time $D$ needs $B$ done (time $4$, since $C$ finishes at $4$), $B$ must finish by time $4$.\n\n**Step 2 (1 mark):** Latest start of $B$: $4 - 2 = 2$. Earliest start: $1$. Float $= 2 - 1 = 1$ hour.",
      },
    ],
  ),
  ea(
    "A school sports day setup project:\n\n| Task | Duration (hr) | Predecessors |\n|---|---|---|\n| $P$ (mark lanes) | $2$ | – |\n| $Q$ (set up equipment) | $3$ | $P$ |\n| $R$ (prepare drinks station) | $2$ | – |\n| $S$ (rehearse with students) | $1$ | $Q, R$ |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Find the earliest finish time for task $Q$.",
        solution: "**Step 1 (1 mark):** $Q$ starts after $P$. Earliest start: $2$. Earliest finish: $2 + 3 = 5$ hr.",
      },
      {
        label: "b",
        marks: 2,
        content: "Find the earliest start time for task $S$, and the project's minimum completion time.",
        solution: "**Step 1 (1 mark):** $S$ needs both $Q$ (finishes at $5$) and $R$ (starts at $0$, finishes at $2$) done. So $S$ earliest start $= \\max(5, 2) = 5$.\n\n**Step 2 (1 mark):** Project finishes at $5 + 1 = 6$ hr.",
      },
      {
        label: "c",
        marks: 2,
        content: "Identify the critical path of the project. Explain in one sentence why $R$ is not on the critical path.",
        solution: "**Step 1 (1 mark):** Critical (longest) path: $P$–$Q$–$S$ with total $2 + 3 + 1 = 6$ hr.\n\n**Step 2 (1 mark):** $R$ is not on the critical path because it finishes (at $2$) well before its successor $S$ needs it (at $5$); $R$ has float of $5 - 2 = 3$ hours.",
      },
    ],
  ),
  ea(
    "A community event has the following setup tasks:\n\n| Task | Duration (hr) | Predecessors |\n|---|---|---|\n| $A$ (deliver chairs) | $1$ | – |\n| $B$ (set up stage) | $3$ | – |\n| $C$ (arrange chairs) | $2$ | $A$ |\n| $D$ (sound check) | $2$ | $B$ |\n| $E$ (final rehearsal) | $1$ | $C, D$ |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Find the earliest finish time for each of tasks $C$ and $D$.",
        solution: "**Step 1 (1 mark):** $C$ starts after $A$ at time $1$. Earliest finish $C$: $1 + 2 = 3$ hr.\n\n**Step 2 (1 mark):** $D$ starts after $B$ at time $3$. Earliest finish $D$: $3 + 2 = 5$ hr.",
      },
      {
        label: "b",
        marks: 2,
        content: "Find the earliest start time and earliest finish time for task $E$.",
        solution: "**Step 1 (1 mark):** $E$ needs both $C$ (done at $3$) and $D$ (done at $5$). Earliest start $E$: $\\max(3, 5) = 5$ hr.\n\n**Step 2 (1 mark):** Earliest finish $E$: $5 + 1 = 6$ hr.",
      },
      {
        label: "c",
        marks: 3,
        content: "State the critical path and calculate the float (slack) for task $A$. Explain whether $A$ is on the critical path.",
        solution: "**Step 1 (1 mark):** Path $A$–$C$–$E$: $1 + 2 + 1 = 4$ hr. Path $B$–$D$–$E$: $3 + 2 + 1 = 6$ hr.\n\n**Step 2 (1 mark):** Critical path is $B$–$D$–$E$ ($6$ hr). $A$ has latest start $= 5 - 2 - 1 = 2$ and earliest start $= 0$, so float of $A$ $= 2 - 0 = 2$ hr.\n\n**Step 3 (1 mark):** $A$ is NOT on the critical path because its float is greater than zero ($2$ hours).",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`project-scheduling: wrote ${items.length} items to ${OUT}`);
