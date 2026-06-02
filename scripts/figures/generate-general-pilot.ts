/**
 * Phase 1 pilot — Critical Path Analysis (modelling-rich tier).
 *
 * Validates:
 *   - networkGraph + criticalPathDiagram + matrixTable helpers
 *   - Data-URI SVG embedding in question content
 *   - seed-exam-set JSON schema end-to-end
 *
 * Target: ~23 items (10 MCQ + 5 SHORT + 4 EXT_ANS + 4 EXT_RESP).
 */
import * as fs from "fs";
import * as path from "path";
import {
  svg,
  toDataUri,
  criticalPathDiagram,
  networkGraph,
} from "./svg";

const OUT_DIR = path.resolve(__dirname, "../output");
const QUESTION_SET_ID = "cmpkc57xo0007ofk0uo58ws59";
const SUBJECT_SLUG = "vce-general";
const TOPIC_SLUG = "discrete-mathematics";
const SUBTOPIC_SLUG = "critical-path-analysis";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type Tech = "TECH_FREE" | "CAS_ALLOWED" | "CAS_REQUIRED";

interface ItemPart {
  label: string;
  marks: number;
  content: string;
  solution: string;
  subParts?: { label: string; marks: number; content: string; solution: string }[];
}

interface Item {
  type: "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";
  topic_slug: string;
  subtopic_slugs: string[];
  difficulty: Difficulty;
  tech: Tech;
  marks: number;
  order: number;
  content: string;
  solutionContent: string;
  preamble: string | null;
  parts: ItemPart[] | null;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
}

const items: Item[] = [];
let order = 0;

const img = (s: string) => `![diagram](${toDataUri(s)})`;

// ─── Shared diagram fixtures ───────────────────────────────────────────

const projectAlphaNodes = [
  { id: "1", x: 0, y: 0 },
  { id: "2", x: 1.5, y: 1 },
  { id: "3", x: 1.5, y: -1 },
  { id: "4", x: 3, y: 0 },
  { id: "5", x: 4.5, y: 0 },
];
const projectAlphaActivities = [
  { id: "A", from: "1", to: "2", duration: 4, onCriticalPath: true },
  { id: "B", from: "1", to: "3", duration: 3 },
  { id: "C", from: "2", to: "4", duration: 6, onCriticalPath: true },
  { id: "D", from: "3", to: "4", duration: 5 },
  { id: "E", from: "4", to: "5", duration: 2, onCriticalPath: true },
];
const projectAlphaSvg = criticalPathDiagram({
  nodes: projectAlphaNodes,
  activities: projectAlphaActivities.map((a) => ({ ...a, onCriticalPath: false })),
});
// Forward pass: ES(1)=0; ES(2)=4; ES(3)=3; ES(4)=max(4+6, 3+5)=10; ES(5)=10+2=12
// Backward: LS(5)=12; LS(4)=10; LS(2)=10-6=4 (float 0); LS(3)=10-5=5 (float 2); LS(1)=0
// Critical path: 1→2→4→5 via A-C-E, length 12

const renovationNodes = [
  { id: "1", x: 0, y: 0 },
  { id: "2", x: 1.5, y: 1.5 },
  { id: "3", x: 1.5, y: 0 },
  { id: "4", x: 1.5, y: -1.5 },
  { id: "5", x: 3, y: 1 },
  { id: "6", x: 3, y: -1 },
  { id: "7", x: 4.5, y: 0 },
];
const renovationActivities = [
  { id: "A", from: "1", to: "2", duration: 5 },
  { id: "B", from: "1", to: "3", duration: 3 },
  { id: "C", from: "1", to: "4", duration: 4 },
  { id: "D", from: "2", to: "5", duration: 6 },
  { id: "E", from: "3", to: "5", duration: 4 },
  { id: "F", from: "3", to: "6", duration: 5 },
  { id: "G", from: "4", to: "6", duration: 7 },
  { id: "H", from: "5", to: "7", duration: 3 },
  { id: "I", from: "6", to: "7", duration: 2 },
];
const renovationSvg = criticalPathDiagram({ nodes: renovationNodes, activities: renovationActivities });

// ─── MCQ (10) ──────────────────────────────────────────────────────────

const mcq = (
  content: string,
  options: [string, string, string, string],
  correct: "A" | "B" | "C" | "D",
  difficulty: Difficulty,
  solution: string,
) => {
  items.push({
    type: "MCQ",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [SUBTOPIC_SLUG],
    difficulty,
    tech: "TECH_FREE",
    marks: 1,
    order: order++,
    content,
    solutionContent: solution,
    preamble: null,
    parts: null,
    optionA: options[0],
    optionB: options[1],
    optionC: options[2],
    optionD: options[3],
    correctOption: correct,
  });
};

mcq(
  `In a directed activity network, the earliest starting time (EST) of an activity is determined by\n\n`,
  [
    "the latest finishing time of all activities that immediately follow it",
    "the largest of the earliest finishing times of all activities that immediately precede it",
    "the smallest of the earliest finishing times of all activities that immediately precede it",
    "the sum of the durations of every activity on the network",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nThe EST of an activity equals the latest (largest) EFT among its immediate predecessors — every predecessor must be complete before the activity can start, so we take the maximum.",
);

mcq(
  `The critical path of a project is best described as\n\n`,
  [
    "the longest path in terms of total duration through the activity network from start to finish",
    "the shortest path through the activity network",
    "the path with the most activities",
    "any path on which all activities have float = 0",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nThe critical path is the longest path (by total duration) from start to finish. Any delay on this path delays the entire project. Option D is *close* but not equivalent — a network may have a single critical path even if other zero-float activities exist on a shorter parallel branch.",
);

mcq(
  `The float (slack) time of an activity is\n\n`,
  [
    "EFT − EST",
    "LST − EST",
    "LFT − LST",
    "duration of the activity",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nFloat = LST − EST = LFT − EFT. It represents how long the activity can be delayed without delaying the project.",
);

mcq(
  `${img(projectAlphaSvg)}\n\nFor the activity network above, the earliest starting time of activity *E* is\n\n`,
  ["6", "8", "10", "12"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nForward pass: ES(2) = 4, ES(3) = 3. EFT for activity *C* (2→4) = 4 + 6 = 10; EFT for *D* (3→4) = 3 + 5 = 8. The EST of activity *E* (which starts at node 4) is max(10, 8) = 10.",
);

mcq(
  `${img(projectAlphaSvg)}\n\nFor the activity network above, the critical path is\n\n`,
  [
    "*A − C − E* with duration 12",
    "*B − D − E* with duration 10",
    "*A − D − E* with duration 11",
    "*B − C − E* with duration 11",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nForward pass gives project length 12 (path *A − C − E*: 4 + 6 + 2). Path *B − D − E* totals 3 + 5 + 2 = 10. Paths *A − D* and *B − C* are not valid (network structure: *A* ends at node 2, *D* starts at node 3).",
);

mcq(
  `${img(projectAlphaSvg)}\n\nIn the activity network above, the float time of activity *B* is\n\n`,
  ["0 days", "1 day", "2 days", "3 days"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nForward pass: EST(*B*) = 0, EFT(*B*) = 0 + 3 = 3.\n\nBackward pass: Project length = 12, so LF(node 5) = 12, LS(*E*) = 10, hence LF(node 4) = 10. Activity *D* must finish by 10, so LS(*D*) = 10 − 5 = 5, giving LF(node 3) = 5. Therefore LFT(*B*) = 5.\n\nFloat(*B*) = LFT − EFT = 5 − 3 = **2 days**.",
);

mcq(
  `Which of the following statements about the critical path of a project network is **false**?\n\n`,
  [
    "Every activity on the critical path has zero float",
    "The critical path determines the minimum project completion time",
    "A delay in any critical-path activity delays the whole project",
    "There can only ever be one critical path in any network",
  ],
  "D",
  "EASY",
  "**Answer: D**\n\nA network can have multiple critical paths if two or more paths share the maximum total duration. The first three statements are all true.",
);

mcq(
  `If activity *X* has EST = 7, duration = 4, LFT = 13, then its float is\n\n`,
  ["0", "2", "4", "6"],
  "B",
  "EASY",
  "**Answer: B**\n\nEFT = 7 + 4 = 11. Float = LFT − EFT = 13 − 11 = 2.",
);

mcq(
  `${img(renovationSvg)}\n\nFor the renovation project network above, the earliest finishing time of activity *G* is\n\n`,
  ["7", "11", "12", "14"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nActivity *G* runs 4→6 with duration 7. EST(*G*) = EFT of *C* = 4 (since *C* is the only predecessor of node 4). EFT(*G*) = 4 + 7 = 11.",
);

mcq(
  `${img(renovationSvg)}\n\nFor the renovation network above, the minimum project completion time is\n\n`,
  ["12 days", "13 days", "14 days", "16 days"],
  "C",
  "HARD",
  "**Answer: C**\n\nForward pass: ES(2)=5, ES(3)=3, ES(4)=4. EFTs into node 5: from *D* (2→5): 5+6=11; from *E* (3→5): 3+4=7 → ES(5)=11. EFTs into node 6: from *F* (3→6): 3+5=8; from *G* (4→6): 4+7=11 → ES(6)=11. EFTs into node 7: from *H* (5→7): 11+3=14; from *I* (6→7): 11+2=13 → ES(7)=14. Minimum project completion = 14 days.",
);

// ─── SHORT_ANSWER (5) ──────────────────────────────────────────────────

const short = (
  content: string,
  marks: number,
  difficulty: Difficulty,
  solution: string,
  tech: Tech = "TECH_FREE",
) => {
  items.push({
    type: "SHORT_ANSWER",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [SUBTOPIC_SLUG],
    difficulty,
    tech,
    marks,
    order: order++,
    content,
    solutionContent: solution,
    preamble: null,
    parts: null,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

short(
  `Define each of the following terms in the context of critical path analysis:\n\n**a.** Earliest starting time (EST)\n\n**b.** Latest finishing time (LFT)\n\n**c.** Float time\n\n**d.** Critical activity (3 marks)`,
  3,
  "EASY",
  "**a.** EST = the earliest time at which an activity can begin, determined by the longest path from the start node to the activity's start node.\n\n**b.** LFT = the latest time at which an activity can finish without delaying the overall project.\n\n**c.** Float = LFT − EFT (equivalently LST − EST); the slack time by which an activity can be delayed without delaying the project.\n\n**d.** Critical activity = an activity with float = 0; any delay on it delays the entire project.\n\nMarks: 3 — one mark for any two correct definitions across (a)-(d), full 3 marks for all four correct.",
);

short(
  `An activity *P* has EST = 8 days, LFT = 18 days, and duration = 6 days.\n\n**a.** Find the earliest finishing time of *P*. (1 mark)\n\n**b.** Find the latest starting time of *P*. (1 mark)\n\n**c.** Find the float time of *P*. (1 mark) (3 marks)`,
  3,
  "EASY",
  "**a.** EFT = EST + duration = 8 + 6 = **14 days**.\n\n**b.** LST = LFT − duration = 18 − 6 = **12 days**.\n\n**c.** Float = LST − EST = 12 − 8 = **4 days** (or equivalently LFT − EFT = 18 − 14 = 4).",
);

short(
  `${img(projectAlphaSvg)}\n\nUsing the activity network above:\n\n**a.** Identify the critical path. (1 mark)\n\n**b.** State the minimum project completion time. (1 mark)\n\n**c.** Determine the float time of activity *B*. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Critical path: **A − C − E** (1→2→4→5).\n\n**b.** Project completion = 4 + 6 + 2 = **12 days**.\n\n**c.** Forward: EST(*B*)=0, EFT(*B*)=3. Backward: LF(4)=10, so LS(*D*)=5, so LF(3)=5, so LFT(*B*)=5. Float(*B*) = 5 − 3 = **2 days**.",
);

short(
  `A project has 6 activities. The critical path is *A − C − F* with total duration 15 days. If activity *C* is delayed by 3 days due to a supply issue, but *F* can be crashed (shortened) by 2 days at a cost of \\$500 per day, find:\n\n**a.** The new project completion time without crashing. (2 marks)\n\n**b.** The new project completion time with *F* crashed by the full 2 days. (2 marks)\n\n**c.** The cost of crashing *F* by 2 days. (1 mark) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Original critical path duration = 15 days. Delaying *C* by 3 days adds 3 to the critical path. New duration = 15 + 3 = **18 days** (assuming no other path becomes critical).\n\n**b.** With *F* crashed by 2 days, the critical path shortens by 2. New duration = 18 − 2 = **16 days**.\n\n**c.** Crash cost = 2 days × \\$500/day = **\\$1,000**.",
);

short(
  `For a project with activities $A, B, C, D, E$, the precedence table is:\n\n| Activity | Duration (days) | Immediate predecessors |\n|----------|------------------|------------------------|\n| A | 5 | — |\n| B | 4 | — |\n| C | 6 | A |\n| D | 3 | B |\n| E | 2 | C, D |\n\n**a.** Find EST and EFT for every activity. (3 marks)\n\n**b.** Identify the critical path. (1 mark)\n\n**c.** State the float of activity *B*. (1 mark) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** EST(A)=0, EFT(A)=5. EST(B)=0, EFT(B)=4. EST(C)=5, EFT(C)=11. EST(D)=4, EFT(D)=7. EST(E)=max(11,7)=11, EFT(E)=13.\n\n**b.** Critical path: **A − C − E** (5 + 6 + 2 = 13 days).\n\n**c.** Backward: LF(E)=13, LS(E)=11. LF(D)=11, LS(D)=8. LF(B)=8. Float(B) = LF(B) − EFT(B) = 8 − 4 = **4 days**.",
);

// ─── EXTENDED_ANSWER (4) ───────────────────────────────────────────────

const extAns = (
  parts: ItemPart[],
  difficulty: Difficulty,
  preamble: string | null = null,
  tech: Tech = "TECH_FREE",
) => {
  const marks = parts.reduce(
    (s, p) =>
      s + (p.subParts && p.subParts.length > 0 ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0) : p.marks),
    0,
  );
  items.push({
    type: "EXTENDED_ANSWER",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [SUBTOPIC_SLUG],
    difficulty,
    tech,
    marks,
    order: order++,
    content: "",
    solutionContent: "",
    preamble,
    parts,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Using the network below, complete a forward pass to find the EST of every activity.\n\n${img(projectAlphaSvg)}`,
      solution: "EST(A)=0, EST(B)=0, EST(C)=4, EST(D)=3, EST(E)=max(4+6, 3+5)=10. EFT values: A=4, B=3, C=10, D=8, E=12.",
    },
    {
      label: "b",
      marks: 2,
      content: `Complete the backward pass to find the LFT of every activity.`,
      solution: "Starting from finish: LFT(E)=12, so LST(E)=10. LF(4)=10, so LFT(C)=10, LST(C)=4; LFT(D)=10, LST(D)=5. LF(2)=4, so LFT(A)=4, LST(A)=0. LF(3)=5, so LFT(B)=5, LST(B)=2.",
    },
    {
      label: "c",
      marks: 1,
      content: `State the critical path and the project completion time.`,
      solution: "Critical path: **A − C − E**, project completion = **12 days**.",
    },
  ],
  "MEDIUM",
  `A small landscaping project consists of five activities, *A* to *E*, with durations and precedences shown in the network below. The completion times are in days.`,
);

extAns(
  [
    {
      label: "a",
      marks: 3,
      content: `Construct a precedence table from the network.\n\n${img(renovationSvg)}`,
      solution: "| Activity | Duration | Predecessors |\n|---|---|---|\n| A | 5 | — |\n| B | 3 | — |\n| C | 4 | — |\n| D | 6 | A |\n| E | 4 | B |\n| F | 5 | B |\n| G | 7 | C |\n| H | 3 | D, E |\n| I | 2 | F, G |",
    },
    {
      label: "b",
      marks: 2,
      content: `Perform a forward pass to determine EST and EFT for every activity.`,
      solution: "ES(A)=0, EF(A)=5. ES(B)=0, EF(B)=3. ES(C)=0, EF(C)=4. ES(D)=5, EF(D)=11. ES(E)=3, EF(E)=7. ES(F)=3, EF(F)=8. ES(G)=4, EF(G)=11. ES(H)=max(11,7)=11, EF(H)=14. ES(I)=max(8,11)=11, EF(I)=13.",
    },
    {
      label: "c",
      marks: 2,
      content: `Determine the minimum project completion time and identify the critical path.`,
      solution: "Project completion = max(EF(H), EF(I)) = max(14, 13) = **14 days**. Critical path: **A − D − H** (5 + 6 + 3 = 14).",
    },
    {
      label: "d",
      marks: 1,
      content: `Find the float time of activity *F*.`,
      solution: "Backward: LF(I)=14, LS(I)=12. LF(F)=12, so LST(F)=12−5=7. EST(F)=3 ⇒ Float = 7 − 3 = **4 days**.",
    },
  ],
  "MEDIUM",
  `A renovation project has nine activities, *A* to *I*. The directed network below shows the precedence relations and durations in days.`,
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Draw an activity network for the project.\n\n| Activity | Duration (hours) | Predecessors |\n|---|---|---|\n| A | 2 | — |\n| B | 3 | — |\n| C | 4 | A |\n| D | 5 | A, B |\n| E | 2 | C |\n| F | 3 | D, E |`,
      solution: "Network: start → A (2) → split to C and D; start → B (3) → D. C → E (2). E and D both feed F (3). F → finish. (Diagram drawn freehand on student answer paper.)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the earliest project completion time.`,
      solution: "EF(A)=2, EF(B)=3, EF(C)=6, EF(D)=max(2,3)+5=8, EF(E)=8, EF(F)=max(8,8)+3=11. Earliest completion = **11 hours**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Identify the critical path.`,
      solution: "Two paths achieve 11: A→C→E→F (2+4+2+3=11) and B→D→F (3+5+3=11). Both are **critical** — A→D→F gives 2+5+3=10 (not critical).",
    },
  ],
  "MEDIUM",
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Activity *X* has EST = 10 and LFT = 22, with a duration of 7 days. Find the float time of *X* and state whether *X* is on the critical path. Justify your answer.`,
      solution: "EFT = 10 + 7 = 17; LST = 22 − 7 = 15. Float = 22 − 17 = 5 (or LST − EST = 15 − 10 = 5). Since float ≠ 0, *X* is **not** on the critical path.",
    },
    {
      label: "b",
      marks: 3,
      content: `For the same project as part **a**, the original critical path has duration 22 days. If activity *X* is delayed by 8 days due to weather, will the project finish on time? By how many days will the project be delayed, if at all? Justify.`,
      solution: "Original float of *X* = 5 days. Delay of 8 days = 5 days absorbed by float + 3 days extra. Net effect: project is delayed by **3 days**, finishing in 22 + 3 = 25 days.",
    },
    {
      label: "c",
      marks: 3,
      content: `Suppose the project manager can crash *X* at a cost of \\$400/day and the critical-path activity *Y* at \\$700/day. Find the cheapest way to recover the 3-day delay caused by the weather. State the cost.`,
      solution: "Once *X* is delayed by 8 days it becomes critical (delay − float = 3 ⇒ now on the critical path with 3 days extra). Cheapest recovery: crash *X* by 3 days at \\$400/day ⇒ cost = 3 × \\$400 = **\\$1,200**. Crashing *Y* would cost 3 × \\$700 = \\$2,100, more expensive.",
    },
  ],
  "HARD",
);

// ─── EXTENDED_RESPONSE (4) ─────────────────────────────────────────────

const extResp = (
  parts: ItemPart[],
  difficulty: Difficulty,
  preamble: string,
  tech: Tech = "TECH_FREE",
) => {
  const marks = parts.reduce(
    (s, p) =>
      s + (p.subParts && p.subParts.length > 0 ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0) : p.marks),
    0,
  );
  items.push({
    type: "EXTENDED_RESPONSE",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [SUBTOPIC_SLUG],
    difficulty,
    tech,
    marks,
    order: order++,
    content: "",
    solutionContent: "",
    preamble,
    parts,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `Construct an activity network from the precedence table.\n\n| Activity | Duration (days) | Predecessors |\n|---|---|---|\n| A | 6 | — |\n| B | 4 | — |\n| C | 5 | A |\n| D | 7 | B |\n| E | 3 | C |\n| F | 2 | C, D |\n| G | 4 | E, F |`,
      solution: "Nodes 1 (start), 2 (end of A), 3 (end of B), 4 (end of C), 5 (end of D), 6 (end of E and F), 7 (finish). Edges: 1→2 (A), 1→3 (B), 2→4 (C), 3→5 (D), 4→ a node feeding E and F (E to merge node, D feeds same), eventually feeds G to finish.",
    },
    {
      label: "b",
      marks: 3,
      content: `Perform a forward pass and find the earliest starting and finishing times of every activity.`,
      solution: "EF(A)=6, EF(B)=4. EF(C) = 6 + 5 = 11. EF(D) = 4 + 7 = 11. EF(E) = 11 + 3 = 14. EF(F) = max(11, 11) + 2 = 13. EF(G) = max(14, 13) + 4 = 18.",
    },
    {
      label: "c",
      marks: 2,
      content: `State the minimum project duration and identify the critical path.`,
      solution: "Minimum duration = **18 days**. Critical path: **A − C − E − G** (6 + 5 + 3 + 4 = 18).",
    },
    {
      label: "d",
      marks: 3,
      content: `Find the float time of activity *F*, and explain what this means in the context of the project.`,
      solution: "Backward: LF(G)=18, LS(G)=14. LF(F)=14, LS(F)=12. EF(F) = 13, so float(F) = LF − EF = 14 − 13 = **1 day**. Interpretation: activity *F* can be delayed by up to 1 day without delaying the overall project; beyond 1 day's delay, *F* becomes critical and the project finishes late.",
    },
  ],
  "MEDIUM",
  `**Question — Project scheduling**\n\nA small construction project consists of seven activities, *A* to *G*, with durations and immediate predecessors given in the table below. The project manager needs a complete schedule to commit to a finish date.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `Determine the earliest starting time of every activity using a forward pass.\n\n${img(renovationSvg)}`,
      solution: "ES(A)=0, ES(B)=0, ES(C)=0. ES(D)=EF(A)=5. ES(E)=EF(B)=3. ES(F)=EF(B)=3. ES(G)=EF(C)=4. ES(H)=max(EF(D), EF(E)) = max(11, 7)=11. ES(I)=max(EF(F), EF(G)) = max(8, 11) = 11.",
    },
    {
      label: "b",
      marks: 2,
      content: `Determine the latest finishing time of every activity using a backward pass.`,
      solution: "Project length = max(EF(H), EF(I)) = 14. LF(H)=14, LS(H)=11. LF(I)=14, LS(I)=12. LF(D)=LS(H)=11. LF(E)=LS(H)=11. LF(F)=LS(I)=12. LF(G)=LS(I)=12. LF(A)=LS(D)=5. LF(B)=min(LS(E), LS(F))=min(7, 7)=7 (LS(E)=11−4=7, LS(F)=12−5=7). LF(C)=LS(G)=12−7=5.",
    },
    {
      label: "c",
      marks: 2,
      content: `Identify the critical path and minimum project completion time.`,
      solution: "Project completion = **14 days**. Critical path: **A − D − H** (5 + 6 + 3 = 14). All three activities have float = 0.",
    },
    {
      label: "d",
      marks: 3,
      content: `Compute the float time of each non-critical activity and state which two activities have the **smallest** float greater than zero.`,
      solution: "Float = LF − EF. Float(B) = 7 − 3 = 4. Float(C) = 5 − 4 = 1. Float(E) = 11 − 7 = 4. Float(F) = 12 − 8 = 4. Float(G) = 12 − 11 = 1. Float(I) = 14 − 13 = 1. Smallest non-zero float = 1 day; activities with float = 1 are **C, G, I**. (Two of the three is acceptable as 'the two with smallest'.)",
    },
    {
      label: "e",
      marks: 3,
      content: `The project manager wants to bring the project forward by 2 days. Activity *D* can be crashed at \\$300/day to a minimum duration of 4 days (a 2-day reduction). Will crashing *D* by 2 days shorten the project by 2 days? Justify by recalculating the critical path.`,
      solution: "If *D* is crashed from 6 to 4 days: EF(D) becomes 5 + 4 = 9. EF(H) = max(9, 7) + 3 = 12. EF(I) is unchanged at max(8, 11) + 2 = 13. New project length = max(12, 13) = **13 days**. Crashing *D* by 2 days shortens the project by **only 1 day** because the critical path shifts to C − G − I (path length 13 days). Crashing *D* further is no longer effective — cost-effective only at the first day of crashing.",
    },
  ],
  "HARD",
  `**Question — Renovation project scheduling**\n\nA renovation project involves nine activities, *A* to *I*. The directed network shows the precedence relations and activity durations in days.`,
);

extResp(
  [
    {
      label: "a",
      marks: 3,
      content: `Construct a precedence table for the activities and indicate which activities must be completed before each activity can start.\n\n${img(projectAlphaSvg)}`,
      solution: "| Activity | Duration | Predecessors |\n|---|---|---|\n| A | 4 | — |\n| B | 3 | — |\n| C | 6 | A |\n| D | 5 | B |\n| E | 2 | C, D |",
    },
    {
      label: "b",
      marks: 3,
      content: `Determine the earliest project completion time using a forward pass.`,
      solution: "EF(A) = 4, EF(B) = 3. EF(C) = 4 + 6 = 10. EF(D) = 3 + 5 = 8. EF(E) = max(10, 8) + 2 = 12. **Earliest completion = 12 days.**",
    },
    {
      label: "c",
      marks: 2,
      content: `Identify the critical path.`,
      solution: "Path *A − C − E*: 4 + 6 + 2 = 12. Path *B − D − E*: 3 + 5 + 2 = 10. **Critical path = A − C − E.**",
    },
    {
      label: "d",
      marks: 2,
      content: `Compute the float time of activity *B*.`,
      solution: "Backward: LF(E)=12, LS(E)=10. LF(D)=10, LS(D)=5. LF(B)=LS(D)=5. EF(B)=3 ⇒ Float(B) = 5 − 3 = **2 days**.",
    },
    {
      label: "e",
      marks: 2,
      content: `If activity *D* is delayed by 3 days, by how much (if at all) will the project be delayed?`,
      solution: "Float(D) = LS(D) − ES(D) = 5 − 3 = 2 days. Delay of 3 = 2 absorbed + 1 extra. Project is delayed by **1 day** (new completion = 13 days).",
    },
  ],
  "MEDIUM",
  `**Question — Landscaping project planning**\n\nA small landscaping project consists of five activities, *A* to *E*. The directed network and durations (in days) are shown.`,
);

extResp(
  [
    {
      label: "a",
      marks: 3,
      content: `Determine the EST, EFT, LST and LFT of each activity in the project below.\n\n| Activity | Duration (days) | Predecessors |\n|---|---|---|\n| A | 3 | — |\n| B | 5 | — |\n| C | 4 | A |\n| D | 6 | A |\n| E | 3 | B, C |\n| F | 2 | D, E |`,
      solution: "Forward: EF(A)=3, EF(B)=5, EF(C)=3+4=7, EF(D)=3+6=9, EF(E)=max(5,7)+3=10, EF(F)=max(9,10)+2=12.\nBackward: LF(F)=12, LS(F)=10. LF(D)=10, LS(D)=4. LF(E)=10, LS(E)=7. LF(B)=7, LS(B)=2. LF(C)=7, LS(C)=3. LF(A)=min(LS(C), LS(D))=min(3,4)=3, LS(A)=0.\n\n| Act | EST | EFT | LST | LFT |\n|---|---|---|---|---|\n| A | 0 | 3 | 0 | 3 |\n| B | 0 | 5 | 2 | 7 |\n| C | 3 | 7 | 3 | 7 |\n| D | 3 | 9 | 4 | 10 |\n| E | 7 | 10 | 7 | 10 |\n| F | 10 | 12 | 10 | 12 |",
    },
    {
      label: "b",
      marks: 1,
      content: `State the project duration.`,
      solution: "**12 days.**",
    },
    {
      label: "c",
      marks: 2,
      content: `List all critical activities (those with float = 0).`,
      solution: "Float = LFT − EFT. From the table: A (0), C (0), E (0), F (0) — critical activities are **A, C, E, F**. Float(B)=2, Float(D)=1 — non-critical.",
    },
    {
      label: "d",
      marks: 3,
      content: `Activity *D* can be crashed at \\$150/day and activity *B* at \\$100/day. The manager wants to shorten the project by 1 day. Which activity should be crashed and at what cost? Explain.`,
      solution: "Project duration is governed by the critical path *A−C−E−F*, which does **not** include *B* or *D*. Crashing *B* or *D* does not shorten the project (they have positive float). The manager must crash a critical activity instead. If only *B* or *D* are crashable, then **no crashing strategy will reduce the project below 12 days** at the stated costs.",
    },
    {
      label: "e",
      marks: 3,
      content: `If activity *C* can additionally be crashed at \\$200/day, find the cheapest strategy to bring the project down by 1 day.`,
      solution: "*C* is on the critical path. Crashing *C* by 1 day reduces the critical path *A−C−E−F* from 12 to 11. Check no parallel path overtakes: alternative path *A−D−F* = 3+6+2 = 11 — same! Both paths now critical at 11. Project shortened by 1 day. Cost = **\\$200**.",
    },
  ],
  "HARD",
  `**Question — Workflow optimisation**\n\nA process improvement team is scheduling six activities, *A* to *F*. They want a complete picture of EST/EFT/LST/LFT, the critical path, and cost-effective crashing.`,
);

// ─── Write output ──────────────────────────────────────────────────────

const spec = {
  subject_slug: SUBJECT_SLUG,
  question_set_id: QUESTION_SET_ID,
  items,
};

const outPath = path.join(OUT_DIR, "qset-general-pilot-cpa.json");
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log(`✓ Wrote ${items.length} items to ${outPath}`);
console.log(`  MCQ:            ${items.filter((i) => i.type === "MCQ").length}`);
console.log(`  SHORT:          ${items.filter((i) => i.type === "SHORT_ANSWER").length}`);
console.log(`  EXTENDED_ANSWER:   ${items.filter((i) => i.type === "EXTENDED_ANSWER").length}`);
console.log(`  EXTENDED_RESPONSE: ${items.filter((i) => i.type === "EXTENDED_RESPONSE").length}`);
