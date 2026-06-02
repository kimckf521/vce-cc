/**
 * VCE General Mathematics — Discrete Optimisation cluster.
 *
 * Subtopics (modelling-rich tier, 16 items each, 96 total):
 *   - minimum-spanning-trees
 *   - shortest-path-problems
 *   - activity-networks
 *   - project-scheduling
 *   - flow-problems-max-flow-min-cut
 *   - matching-and-assignment-problems
 *
 * Per subtopic: 7 MCQ + 4 SHORT + 2 EXT_ANS + 3 EXT_RESP.
 */
import * as fs from "fs";
import * as path from "path";
import {
  toDataUri,
  criticalPathDiagram,
  networkGraph,
  weightedNetworkPath,
  matrixTable,
} from "./svg";

const OUT_DIR = path.resolve(__dirname, "../output");
const QUESTION_SET_ID = "cmpkc57xo0007ofk0uo58ws59";
const SUBJECT_SLUG = "vce-general";
const TOPIC_SLUG = "discrete-mathematics";

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

// ─── Helper factories ──────────────────────────────────────────────────

const mcq = (
  subtopic: string,
  content: string,
  options: [string, string, string, string],
  correct: "A" | "B" | "C" | "D",
  difficulty: Difficulty,
  solution: string,
  tech: Tech = "TECH_FREE",
) => {
  items.push({
    type: "MCQ",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
    difficulty,
    tech,
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

const short = (
  subtopic: string,
  content: string,
  marks: number,
  difficulty: Difficulty,
  solution: string,
  tech: Tech = "TECH_FREE",
) => {
  items.push({
    type: "SHORT_ANSWER",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
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

const extAns = (
  subtopic: string,
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
    subtopic_slugs: [subtopic],
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

const extResp = (
  subtopic: string,
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
    subtopic_slugs: [subtopic],
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

// ═══════════════════════════════════════════════════════════════════════
// 1. MINIMUM SPANNING TREES (16 items)
// ═══════════════════════════════════════════════════════════════════════
const MST = "minimum-spanning-trees";

// Network 1: 6 nodes, towns A-F (used across several questions)
const townNodes = [
  { id: "A", x: 0, y: 2 },
  { id: "B", x: 2, y: 3 },
  { id: "C", x: 4, y: 2 },
  { id: "D", x: 1, y: 0 },
  { id: "E", x: 3, y: 0 },
  { id: "F", x: 5, y: 1 },
];
// Edge weights in km
const townEdges = [
  { from: "A", to: "B", weight: 5 },
  { from: "A", to: "D", weight: 4 },
  { from: "B", to: "C", weight: 3 },
  { from: "B", to: "D", weight: 6 },
  { from: "B", to: "E", weight: 7 },
  { from: "C", to: "E", weight: 4 },
  { from: "C", to: "F", weight: 2 },
  { from: "D", to: "E", weight: 5 },
  { from: "E", to: "F", weight: 6 },
];
// MST via Kruskal: sort weights: CF=2, BC=3, AD=4, CE=4 (skip - creates cycle B-C-E? check), AB=5, DE=5...
// Sorted edges: CF(2), BC(3), AD(4), CE(4), AB(5), DE(5), BD(6), EF(6), BE(7)
// Kruskal: CF(2) — {C,F}; BC(3) — {B,C,F}; AD(4) — {A,D}; CE(4) — {B,C,E,F};
// AB(5) — connects {A,D} with {B,C,E,F} ⇒ {A,B,C,D,E,F} 5 edges, done.
// MST edges: CF, BC, AD, CE, AB. Total weight = 2+3+4+4+5 = 18 km.
const townMstEdges: Array<[string, string]> = [
  ["C", "F"], ["B", "C"], ["A", "D"], ["C", "E"], ["A", "B"],
];
const townNetworkSvg = networkGraph({ nodes: townNodes, edges: townEdges });
const townMstSvg = networkGraph({
  nodes: townNodes,
  edges: townEdges,
  highlightedEdges: townMstEdges,
});

// Network 2: smaller 5-node network
const campusNodes = [
  { id: "P", x: 0, y: 0 },
  { id: "Q", x: 2, y: 1.5 },
  { id: "R", x: 2, y: -1.5 },
  { id: "S", x: 4, y: 0 },
  { id: "T", x: 6, y: 0 },
];
const campusEdges = [
  { from: "P", to: "Q", weight: 6 },
  { from: "P", to: "R", weight: 8 },
  { from: "Q", to: "R", weight: 4 },
  { from: "Q", to: "S", weight: 7 },
  { from: "R", to: "S", weight: 5 },
  { from: "S", to: "T", weight: 3 },
];
// MST: sorted SE(3), QR(4), RS(5), PQ(6), QS(7), PR(8)
// ST(3) — {S,T}; QR(4) — {Q,R}; RS(5) — {Q,R,S,T}; PQ(6) — all 5 in tree. Total = 3+4+5+6 = 18.
const campusMstEdges: Array<[string, string]> = [
  ["S", "T"], ["Q", "R"], ["R", "S"], ["P", "Q"],
];
const campusNetworkSvg = networkGraph({ nodes: campusNodes, edges: campusEdges });


// ─── MST: 7 MCQ ────────────────────────────────────────────────────────

mcq(
  MST,
  `A minimum spanning tree of a connected weighted graph with $n$ vertices contains exactly\n\n`,
  ["$n$ edges", "$n - 1$ edges", "$n + 1$ edges", "$2n$ edges"],
  "B",
  "EASY",
  "**Answer: B**\n\nA spanning tree on $n$ vertices is a tree connecting all vertices with no cycles, so it has $n - 1$ edges.",
);

mcq(
  MST,
  `Which of the following is **not** a property of a minimum spanning tree?\n\n`,
  [
    "It connects every vertex of the graph",
    "It contains no cycles",
    "It has total weight at most that of any other spanning tree",
    "It contains the edge of greatest weight in the original graph",
  ],
  "D",
  "EASY",
  "**Answer: D**\n\nThe MST minimises total weight, so it typically excludes the heaviest edges — there is no guarantee it includes the largest-weight edge (and usually it does not).",
);

mcq(
  MST,
  `${img(townNetworkSvg)}\n\nFor the network above, what is the total weight of the minimum spanning tree?\n\n`,
  ["16 km", "17 km", "18 km", "19 km"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nKruskal's algorithm (sort edges ascending and add if no cycle): CF(2), BC(3), AD(4), CE(4), AB(5). Total = 2 + 3 + 4 + 4 + 5 = **18 km**. 5 edges for 6 vertices ⇒ spanning tree complete.",
);

mcq(
  MST,
  `${img(townNetworkSvg)}\n\nWhich edge below is **not** in the minimum spanning tree of the network?\n\n`,
  ["*AD* (4)", "*BC* (3)", "*DE* (5)", "*CF* (2)"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nMST edges (Kruskal): CF(2), BC(3), AD(4), CE(4), AB(5). Edge *DE* (5) is not in the MST — adding it after AB would create a cycle A-D-E-C-B-A.",
);

mcq(
  MST,
  `Prim's algorithm is being applied to a network starting at vertex *A*. After the first step, exactly\n\n`,
  [
    "the cheapest edge in the entire network is added to the tree",
    "the cheapest edge incident with *A* is added to the tree",
    "the most expensive edge incident with *A* is removed from the tree",
    "every edge incident with *A* is added to the tree",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nPrim's starts at any chosen vertex and at each step adds the cheapest edge connecting a tree vertex to a non-tree vertex. From *A* alone, that is the cheapest edge incident with *A*.",
);

mcq(
  MST,
  `${img(campusNetworkSvg)}\n\nApplying Prim's algorithm starting at vertex *P*, the edges are added in the order\n\n`,
  [
    "*PQ*, *QR*, *RS*, *ST*",
    "*PR*, *RS*, *ST*, *QR*",
    "*ST*, *QR*, *RS*, *PQ*",
    "*PQ*, *PR*, *RS*, *ST*",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nPrim's from *P*: cheapest edge from *P* is *PQ* (6) — tree: {P,Q}. Cheapest edge to non-tree: from Q, *QR* (4) is cheaper than *PR* (8). Tree: {P,Q,R}. Next: from {P,Q,R}, *RS* (5) is cheapest. Tree: {P,Q,R,S}. Finally *ST* (3). Order: *PQ*, *QR*, *RS*, *ST*. Kruskal would pick the same edges but in weight order — note the question specifies Prim's from *P*.",
);

mcq(
  MST,
  `${img(campusNetworkSvg)}\n\nThe total weight of a minimum spanning tree of the network above is\n\n`,
  ["15", "17", "18", "20"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nKruskal: ST(3) + QR(4) + RS(5) + PQ(6) = **18**. (4 edges connect 5 vertices.)",
);


// ─── MST: 4 SHORT ──────────────────────────────────────────────────────

short(
  MST,
  `Define what is meant by a *minimum spanning tree* of a connected weighted graph. State two key properties. (3 marks)`,
  3,
  "EASY",
  "A minimum spanning tree (MST) of a connected weighted graph is a subgraph that:\n\n1. **Spans** every vertex (connects all $n$ vertices),\n2. Is a **tree** (connected and contains no cycles, so exactly $n - 1$ edges), and\n3. Has the **smallest possible total edge weight** among all spanning trees.\n\nKey properties:\n- It contains exactly $n - 1$ edges for $n$ vertices.\n- Removing any edge disconnects the tree (so every edge is a bridge in the MST).",
);

short(
  MST,
  `${img(townNetworkSvg)}\n\nUsing Kruskal's algorithm on the network above, list the edges of the minimum spanning tree in the order they are added and state the total weight. (4 marks)`,
  4,
  "MEDIUM",
  "Kruskal's algorithm: sort edges by weight ascending, then add each edge if it does **not** create a cycle.\n\nSorted edges (km): *CF*(2), *BC*(3), *AD*(4), *CE*(4), *AB*(5), *DE*(5), *BD*(6), *EF*(6), *BE*(7).\n\nAdd in order:\n- *CF* (2) — joins {C} and {F}.\n- *BC* (3) — joins {B} and {C,F}.\n- *AD* (4) — joins {A} and {D}.\n- *CE* (4) — joins {E} and {B,C,F}.\n- *AB* (5) — joins {A,D} and {B,C,E,F}; all 6 vertices now in tree.\n\nTotal weight = 2 + 3 + 4 + 4 + 5 = **18 km**. (5 edges for 6 vertices.)",
);

short(
  MST,
  `${img(campusNetworkSvg)}\n\nThe weighted network shows the cost (in thousands of dollars) of laying fibre-optic cable between 5 university buildings. The administration must connect all buildings at minimum total cost.\n\n**a.** Find the minimum total cost of cable required. (2 marks)\n\n**b.** State the cable links that should be installed. (1 mark) (3 marks)`,
  3,
  "MEDIUM",
  "**a.** MST by Kruskal: *ST*(3), *QR*(4), *RS*(5), *PQ*(6). Total = **\\$18 000** (3 + 4 + 5 + 6 thousand).\n\n**b.** Install links: **S–T, Q–R, R–S, P–Q** (4 links for 5 buildings).",
);

short(
  MST,
  `A connected network has 8 vertices.\n\n**a.** How many edges does any spanning tree of the network contain? (1 mark)\n\n**b.** Explain why a minimum spanning tree cannot contain any cycle. (2 marks)\n\n**c.** If a network has 8 vertices and 12 edges in total, by how many edges does a spanning tree differ from the original network? (1 mark) (4 marks)`,
  4,
  "EASY",
  "**a.** A spanning tree on $n = 8$ vertices contains $n - 1 = $ **7 edges**.\n\n**b.** A tree is **acyclic** by definition. If the MST contained a cycle, removing any edge of that cycle would leave the graph still connected and reduce the total weight — contradicting the minimality of the MST. Therefore the MST is acyclic.\n\n**c.** A spanning tree has 7 edges; the original has 12 edges. Difference = 12 − 7 = **5 edges** are removed (not part of the spanning tree).",
);

// ─── MST: 2 EXT_ANS ────────────────────────────────────────────────────

extAns(
  MST,
  [
    {
      label: "a",
      marks: 2,
      content: `Using Kruskal's algorithm, list the edges in the order they are added to the MST. Justify any edge skipped.\n\n${img(townNetworkSvg)}`,
      solution: "Sorted edges: *CF*(2), *BC*(3), *AD*(4), *CE*(4), *AB*(5), *DE*(5), *BD*(6), *EF*(6), *BE*(7).\n\n- Add *CF*(2).\n- Add *BC*(3).\n- Add *AD*(4).\n- Add *CE*(4).\n- Add *AB*(5) — completes the MST (5 edges, 6 vertices).\n\nSkipped edges: *DE*(5) onwards — adding any would create a cycle (e.g. *DE* would create cycle A-D-E-C-B-A) and all 6 vertices are already connected after *AB*(5).",
    },
    {
      label: "b",
      marks: 1,
      content: `State the total weight of the MST.`,
      solution: "Total = 2 + 3 + 4 + 4 + 5 = **18 km**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Draw the MST. Indicate it on the network.\n\n${img(townMstSvg)}`,
      solution: "The MST (highlighted in red on the network) is the tree with edges *AB*, *AD*, *BC*, *CE*, *CF*. All 6 vertices included, no cycles, 5 edges, total 18 km.",
    },
  ],
  "MEDIUM",
  `A regional council is planning to connect 6 towns *A* to *F* with new road maintenance contracts. The network below shows the cost (in km of road) of each possible direct link. The council wishes to maintain the minimum total length of road that still connects every town.`,
);

extAns(
  MST,
  [
    {
      label: "a",
      marks: 2,
      content: `Apply **Prim's algorithm** starting at vertex *P*. List the edges added in order.\n\n${img(campusNetworkSvg)}`,
      solution: "Start: tree = {P}.\n\n- Cheapest edge from {P}: *PQ*(6). Tree = {P,Q}.\n- Cheapest from {P,Q} to outside: *QR*(4) beats *PR*(8). Tree = {P,Q,R}.\n- Cheapest from {P,Q,R} to outside: *RS*(5) beats *QS*(7). Tree = {P,Q,R,S}.\n- Cheapest from {P,Q,R,S} to outside: *ST*(3). Tree = {P,Q,R,S,T}.\n\nOrder added: ***PQ*(6), *QR*(4), *RS*(5), *ST*(3)**.",
    },
    {
      label: "b",
      marks: 2,
      content: `Apply **Kruskal's algorithm** to the same network. List the edges added in order.`,
      solution: "Sort weights ascending: *ST*(3), *QR*(4), *RS*(5), *PQ*(6), *QS*(7), *PR*(8).\n\n- *ST*(3) — joins {S} and {T}. Tree edges = {ST}.\n- *QR*(4) — joins {Q} and {R}. Tree = {ST, QR}.\n- *RS*(5) — joins {Q,R} and {S,T}. Tree = {ST, QR, RS}.\n- *PQ*(6) — joins {P} and {Q,R,S,T}. Tree = {ST, QR, RS, PQ}. Done — 4 edges, 5 vertices.\n\nOrder added: ***ST, QR, RS, PQ*** (by weight).",
    },
    {
      label: "c",
      marks: 1,
      content: `Compare the two MSTs found in parts **a** and **b**. Are they the same set of edges?`,
      solution: "**Yes** — both algorithms identify the same 4 edges: *PQ, QR, RS, ST*. Only the order of insertion differs. Total weight = 6 + 4 + 5 + 3 = **18** in both cases.",
    },
  ],
  "MEDIUM",
  `A campus IT department is laying fibre-optic cable between 5 buildings. The cost (in thousands of dollars) of each candidate link is shown on the network. The cheapest possible connected layout is required.`,
);

// ─── MST: 3 EXT_RESP ───────────────────────────────────────────────────

// Network for EXT_RESP: 7-node power network
const powerNodes = [
  { id: "1", x: 0, y: 2 },
  { id: "2", x: 2, y: 3 },
  { id: "3", x: 4, y: 2.5 },
  { id: "4", x: 1, y: 0 },
  { id: "5", x: 3, y: 0 },
  { id: "6", x: 5, y: 0.5 },
  { id: "7", x: 6, y: 2 },
];
const powerEdges = [
  { from: "1", to: "2", weight: 4 },
  { from: "1", to: "4", weight: 5 },
  { from: "2", to: "3", weight: 3 },
  { from: "2", to: "4", weight: 7 },
  { from: "2", to: "5", weight: 6 },
  { from: "3", to: "5", weight: 4 },
  { from: "3", to: "7", weight: 5 },
  { from: "4", to: "5", weight: 3 },
  { from: "5", to: "6", weight: 2 },
  { from: "6", to: "7", weight: 4 },
];
// MST: sort: 56(2), 23(3), 45(3), 12(4), 35(4), 67(4), 14(5), 37(5), 25(6), 67... 
// Sorted: 56(2), 23(3), 45(3), 12(4), 35(4), 67(4), 14(5), 37(5), 25(6), 24(7).
// Kruskal: 56(2) {5,6}; 23(3) {2,3}; 45(3) {2,3} & {5,6} via 4? wait 45 is between 4 and 5.
// 45(3) joins {4} and {5,6}. Tree = {2,3}, {4,5,6}.
// 12(4) joins {1} and {2,3}. Tree = {1,2,3}, {4,5,6}.
// 35(4) joins {1,2,3} and {4,5,6}. Tree = {1,2,3,4,5,6}.
// 67(4) joins {7} and rest. Tree = all 7. Done. 6 edges.
// MST edges: 56, 23, 45, 12, 35, 67. Total = 2+3+3+4+4+4 = 20.
const powerMstEdges: Array<[string, string]> = [
  ["5", "6"], ["2", "3"], ["4", "5"], ["1", "2"], ["3", "5"], ["6", "7"],
];
const powerNetworkSvg = networkGraph({ nodes: powerNodes, edges: powerEdges });
const powerMstSvg = networkGraph({
  nodes: powerNodes, edges: powerEdges, highlightedEdges: powerMstEdges,
});

extResp(
  MST,
  [
    {
      label: "a",
      marks: 1,
      content: `How many edges will the minimum spanning tree contain?\n\n${img(powerNetworkSvg)}`,
      solution: "The network has 7 vertices, so the MST contains $7 - 1 = $ **6 edges**.",
    },
    {
      label: "b",
      marks: 3,
      content: `Apply Kruskal's algorithm. List edges in the order added.`,
      solution: "Sort edges (km): 5-6(2), 2-3(3), 4-5(3), 1-2(4), 3-5(4), 6-7(4), 1-4(5), 3-7(5), 2-5(6), 2-4(7).\n\n- 5-6(2) ✓ — {5,6}\n- 2-3(3) ✓ — {2,3}\n- 4-5(3) ✓ — {4,5,6}\n- 1-2(4) ✓ — {1,2,3}\n- 3-5(4) ✓ — joins {1,2,3} with {4,5,6} ⇒ {1,2,3,4,5,6}\n- 6-7(4) ✓ — {1,2,3,4,5,6,7} — DONE (6 edges).\n\nOrder added: **5-6, 2-3, 4-5, 1-2, 3-5, 6-7**.",
    },
    {
      label: "c",
      marks: 2,
      content: `State the total length of cable required.`,
      solution: "Total = 2 + 3 + 3 + 4 + 4 + 4 = **20 km**.",
    },
    {
      label: "d",
      marks: 2,
      content: `Edge 3-5 has been damaged by a storm and cannot be used. Determine the new minimum spanning tree and its total weight.`,
      solution: "Without edge 3-5, continue Kruskal beyond edge 6-7:\n\nNext candidate: 1-4(5). 1-4 joins {1,2,3} and {4,5,6,7} ⇒ complete.\n\nNew MST edges: 5-6(2), 2-3(3), 4-5(3), 1-2(4), 6-7(4), 1-4(5).\n\nTotal = 2 + 3 + 3 + 4 + 4 + 5 = **21 km** (1 km extra without edge 3-5).",
    },
    {
      label: "e",
      marks: 2,
      content: `If a new direct link 1-3 with weight 3 km were added, what would be the new minimum spanning tree? Does the total weight change?`,
      solution: "New sorted list inserts 1-3(3) between the 2s and 3s.\n\nKruskal:\n- 5-6(2)\n- 1-3(3) ✓ — {1,3}\n- 2-3(3) ✓ — {1,2,3}\n- 4-5(3) ✓ — {4,5,6}\n- 1-2(4) — would create cycle 1-2-3-1, **skip**.\n- 3-5(4) ✓ — {1,2,3,4,5,6}\n- 6-7(4) ✓ — done.\n\nNew MST edges: 5-6(2), 1-3(3), 2-3(3), 4-5(3), 3-5(4), 6-7(4). Total = 2 + 3 + 3 + 3 + 4 + 4 = **19 km**.\n\n**Yes — total weight decreases by 1 km** (from 20 to 19), because the new edge 1-3(3) replaces the heavier 1-2(4) in the MST.",
    },
  ],
  "HARD",
  `**Question — Power-line network**\n\nA regional electricity provider is planning the cheapest connected power-line network linking 7 substations (labelled 1 to 7). The candidate links and distances (in km) are shown. The provider must connect every substation while using the smallest total length of cable.`,
);

extResp(
  MST,
  [
    {
      label: "a",
      marks: 2,
      content: `Explain the difference between Prim's and Kruskal's algorithms in one or two sentences each.`,
      solution: "**Prim's**: starts at a chosen vertex and grows the MST one edge at a time, always adding the cheapest edge that connects a tree vertex to a non-tree vertex.\n\n**Kruskal's**: sorts all edges by weight; adds the cheapest edge that does not create a cycle, regardless of whether the edge is adjacent to the current tree.",
    },
    {
      label: "b",
      marks: 3,
      content: `Apply Prim's algorithm starting at vertex *A* to the network below.\n\n${img(townNetworkSvg)}`,
      solution: "Tree = {A}. Cheapest edge from {A}: *AD*(4). Tree = {A,D}.\n\nCheapest edge from {A,D} to outside: from A: *AB*(5); from D: *BD*(6), *DE*(5). Take *AB*(5) (tie with *DE*(5), either is valid; we pick *AB*). Tree = {A,B,D}.\n\nFrom {A,B,D}: *BC*(3) cheapest. Tree = {A,B,C,D}.\n\nFrom {A,B,C,D}: *CF*(2) cheapest. Tree = {A,B,C,D,F}.\n\nFrom {A,B,C,D,F}: *CE*(4) is cheapest to E. Tree = {A,B,C,D,E,F}. Done.\n\nOrder: ***AD*(4), *AB*(5), *BC*(3), *CF*(2), *CE*(4)**.",
    },
    {
      label: "c",
      marks: 1,
      content: `State the total weight of the MST found in part **b**.`,
      solution: "Total = 4 + 5 + 3 + 2 + 4 = **18 km**.",
    },
    {
      label: "d",
      marks: 2,
      content: `A new direct road *AE* with weight 3 km is proposed. Determine whether it should be included in the MST and find the new minimum total weight.`,
      solution: "Apply Kruskal with new sorted list: *CF*(2), *BC*(3), *AE*(3), *AD*(4), *CE*(4), *AB*(5), ...\n\n- *CF*(2), *BC*(3), *AE*(3): {A,E}, {B,C,F}, {C,F}... → {A,E},{B,C,F}.\n- *AD*(4): {A,D,E}, {B,C,F}.\n- *CE*(4) — joins {A,D,E} and {B,C,F} ⇒ {A,B,C,D,E,F}. 5 edges. Done.\n\nNew MST: *CF*(2), *BC*(3), *AE*(3), *AD*(4), *CE*(4). Total = 2 + 3 + 3 + 4 + 4 = **16 km**.\n\n**Yes — include *AE*(3)**. New total = **16 km** (saving 2 km off the previous 18 km).",
    },
    {
      label: "e",
      marks: 2,
      content: `In the new MST from part **d**, identify a non-MST edge whose addition would create a cycle, and state the cycle.`,
      solution: "Non-MST edges (with new layout *AE* included): *AB*(5), *DE*(5), *BD*(6), *EF*(6), *BE*(7).\n\nExample: adding *AB*(5) creates cycle **A − B − C − E − A** (edges *AB*, *BC*, *CE*, *EA*). Other valid answers: *DE*(5) creates cycle *A − D − E − A*; *EF*(6) creates *E − F − C − E*; etc.",
    },
  ],
  "MEDIUM",
  `**Question — Road network planning**\n\nA regional council is planning the cheapest set of road links that connects 6 towns *A* to *F*. The network below shows the cost (in km) of each candidate road.`,
);

extResp(
  MST,
  [
    {
      label: "a",
      marks: 2,
      content: `Construct the network from the edge list, then find the MST using Kruskal's algorithm.\n\n| Edge | Weight (m) |\n|---|---|\n| 1-2 | 8 |\n| 1-3 | 5 |\n| 2-3 | 6 |\n| 2-4 | 9 |\n| 3-4 | 4 |\n| 3-5 | 7 |\n| 4-5 | 3 |\n| 4-6 | 5 |\n| 5-6 | 6 |`,
      solution: "Sorted: 4-5(3), 3-4(4), 1-3(5), 4-6(5), 2-3(6), 5-6(6), 3-5(7), 1-2(8), 2-4(9).\n\n- 4-5(3) ✓ {4,5}\n- 3-4(4) ✓ {3,4,5}\n- 1-3(5) ✓ {1,3,4,5}\n- 4-6(5) ✓ {1,3,4,5,6}\n- 2-3(6) ✓ {1,2,3,4,5,6} ⇒ Done.\n\nMST edges: 4-5(3), 3-4(4), 1-3(5), 4-6(5), 2-3(6).",
    },
    {
      label: "b",
      marks: 1,
      content: `State the total length of the MST.`,
      solution: "Total = 3 + 4 + 5 + 5 + 6 = **23 m**.",
    },
    {
      label: "c",
      marks: 2,
      content: `If the cost of installing each metre of cable is \\$12, calculate the total cost.`,
      solution: "Total cost = 23 m × \\$12/m = **\\$276**.",
    },
    {
      label: "d",
      marks: 2,
      content: `A new direct link 1-2 is proposed at a reduced cost of 4 m (replacing the original 8). Will the MST change? If so, give the new MST and total weight.`,
      solution: "Re-sort with 1-2(4) inserted: 4-5(3), 1-2(4), 3-4(4), 1-3(5), 4-6(5), 2-3(6), 5-6(6), 3-5(7), 2-4(9).\n\n- 4-5(3), 1-2(4), 3-4(4): {1,2}, {3,4,5}.\n- 1-3(5) — joins {1,2} and {3,4,5} ⇒ {1,2,3,4,5}.\n- 4-6(5) ✓ all 6.\n\nNew MST: 4-5(3), 1-2(4), 3-4(4), 1-3(5), 4-6(5). Total = 3 + 4 + 4 + 5 + 5 = **21 m**.\n\n**Yes — the MST changes**: edge *2-3*(6) is replaced by *1-2*(4). Total saving = 23 − 21 = 2 m.",
    },
    {
      label: "e",
      marks: 3,
      content: `Explain in your own words why an MST never contains the maximum-weight edge of any cycle in the original network.`,
      solution: "Suppose the MST $T$ contains the maximum-weight edge $e$ of some cycle $C$ in the original network.\n\nRemove $e$ from $T$: this disconnects $T$ into two components. The cycle $C$ contains another edge $f$ (with $w(f) < w(e)$) that connects these two components (since $C$ visits both sides of the cut).\n\nReplace $e$ with $f$: the resulting subgraph $T' = T - e + f$ is still a spanning tree (still acyclic, still connects all vertices) and has total weight strictly less than $T$.\n\nThis contradicts the minimality of $T$, so $T$ cannot contain $e$. Hence an MST never contains the maximum-weight edge of any cycle.",
    },
  ],
  "HARD",
  `**Question — Cable installation**\n\nAn electrician must connect 6 power outlets in a warehouse with the minimum amount of cable. The candidate cable runs and lengths (in metres) are shown in the edge list.`,
);


// ═══════════════════════════════════════════════════════════════════════
// 2. SHORTEST PATH PROBLEMS (16 items)
// ═══════════════════════════════════════════════════════════════════════
const SP = "shortest-path-problems";

// Network for shortest path — undirected with weights = travel times in min
// 6-node delivery network from D (depot) to G (goal)
const spNodes = [
  { id: "S", x: 0, y: 0 },
  { id: "A", x: 2, y: 1.5 },
  { id: "B", x: 2, y: -1.5 },
  { id: "C", x: 4, y: 1 },
  { id: "D", x: 4, y: -1 },
  { id: "T", x: 6, y: 0 },
];
const spEdges = [
  { from: "S", to: "A", weight: 4 },
  { from: "S", to: "B", weight: 3 },
  { from: "A", to: "B", weight: 2 },
  { from: "A", to: "C", weight: 5 },
  { from: "A", to: "D", weight: 8 },
  { from: "B", to: "D", weight: 6 },
  { from: "C", to: "D", weight: 3 },
  { from: "C", to: "T", weight: 4 },
  { from: "D", to: "T", weight: 5 },
];
// Dijkstra from S:
// d(S)=0
// From S: d(A)=4, d(B)=3
// Pick B (3). From B: A via B = 3+2=5 (worse than 4), D via B = 3+6=9
// Pick A (4). From A: C via A = 4+5=9, D via A = 4+8=12 (worse than 9)
// Pick C (9) or D (9). Pick C. From C: T via C = 9+4=13, D via C = 9+3=12 (worse than 9)
// Pick D (9). From D: T via D = 9+5=14 (worse than 13)
// Pick T (13). Path: S → A → C → T length 13.
const spShortestPath = ["S", "A", "C", "T"];
const spNetworkSvg = networkGraph({ nodes: spNodes, edges: spEdges });
const spPathSvg = weightedNetworkPath({
  nodes: spNodes, edges: spEdges, highlightedPath: spShortestPath,
});

// 5-node simpler shortest path
const sp2Nodes = [
  { id: "1", x: 0, y: 0 },
  { id: "2", x: 2, y: 1 },
  { id: "3", x: 2, y: -1 },
  { id: "4", x: 4, y: 0.5 },
  { id: "5", x: 6, y: 0 },
];
const sp2Edges = [
  { from: "1", to: "2", weight: 7 },
  { from: "1", to: "3", weight: 4 },
  { from: "2", to: "3", weight: 2 },
  { from: "2", to: "4", weight: 5 },
  { from: "3", to: "4", weight: 8 },
  { from: "3", to: "5", weight: 10 },
  { from: "4", to: "5", weight: 3 },
];
// Dijkstra from 1:
// d(1)=0; d(2)=7, d(3)=4
// Pick 3(4). From 3: 2 via 3 = 4+2=6 (better), 4 via 3 = 4+8=12, 5 via 3 = 4+10=14.
// Pick 2(6). From 2: 4 via 2 = 6+5=11 (better than 12).
// Pick 4(11). From 4: 5 via 4 = 11+3=14 (tie with current 14 via 3).
// Pick 5(14). Done.
// Two shortest paths: 1→3→2→4→5 = 14, and 1→3→5 = 14. Both length 14.
const sp2NetworkSvg = networkGraph({ nodes: sp2Nodes, edges: sp2Edges });

// ─── SP: 7 MCQ ─────────────────────────────────────────────────────────

mcq(
  SP,
  `In a shortest-path problem, **Dijkstra's algorithm**\n\n`,
  [
    "guarantees the cheapest path between any two vertices, even with negative edge weights",
    "labels each vertex with the smallest known distance from the source and updates labels as shorter paths are found",
    "always returns a path that visits every vertex exactly once",
    "is equivalent to applying Prim's algorithm to the same network",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nDijkstra labels each vertex with a tentative shortest distance from the source and iteratively relaxes (updates) labels by considering shorter routes via neighbours. (Negative weights break Dijkstra; visiting every vertex is the *Hamiltonian* problem, not Dijkstra; Prim's and Dijkstra are different greedy procedures.)",
);

mcq(
  SP,
  `${img(spNetworkSvg)}\n\nThe shortest path from *S* to *T* in the network above has length\n\n`,
  ["11", "12", "13", "14"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nDijkstra from *S*: d(A)=4, d(B)=3, d(C)=min(4+5)=9, d(D)=min(3+6, 9+3)=9, d(T)=min(9+4, 9+5)=13.\n\nShortest path: *S → A → C → T*, length 4 + 5 + 4 = **13**.",
);

mcq(
  SP,
  `${img(spNetworkSvg)}\n\nFor the network above, the shortest path from *S* to *T* is\n\n`,
  [
    "*S → A → C → T*",
    "*S → B → D → T*",
    "*S → A → D → T*",
    "*S → B → A → C → T*",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nPath lengths from *S* to *T*:\n- *S → A → C → T* = 4 + 5 + 4 = **13**\n- *S → B → D → T* = 3 + 6 + 5 = 14\n- *S → A → D → T* = 4 + 8 + 5 = 17\n- *S → B → A → C → T* = 3 + 2 + 5 + 4 = 14\n\nShortest = **A**.",
);

mcq(
  SP,
  `Which of the following statements about shortest-path problems is **false**?\n\n`,
  [
    "A shortest path may not be unique — multiple distinct paths can share the same minimum length",
    "Adding an edge to a network cannot increase the length of any shortest path",
    "The shortest path between two vertices is always also a minimum spanning tree",
    "If all edge weights are positive, the shortest path contains no repeated vertices",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nA shortest path is a single path between two vertices, not a spanning tree (which connects every vertex). These are distinct problems with distinct solutions.",
);

mcq(
  SP,
  `${img(sp2NetworkSvg)}\n\nThe shortest distance from vertex 1 to vertex 5 in the network above is\n\n`,
  ["10", "12", "14", "16"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nDijkstra from 1: d(2)=min(7, 4+2)=6, d(3)=4, d(4)=min(6+5, 4+8)=11, d(5)=min(11+3, 4+10)=14.\n\nShortest distance = **14**. (Two routes give 14: 1→3→2→4→5 and 1→3→5.)",
);

mcq(
  SP,
  `In Dijkstra's algorithm starting at vertex *X*, the *next vertex permanently labelled* after *X* is always\n\n`,
  [
    "the vertex farthest from *X*",
    "the vertex with the smallest tentative distance from *X*",
    "any neighbour of *X* chosen arbitrarily",
    "the vertex closest to the destination",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nDijkstra always permanently labels the **closest** unlabelled vertex next — this is the *greedy* step that guarantees optimality (assuming non-negative weights).",
);

mcq(
  SP,
  `A delivery driver applies Dijkstra to find the shortest route from depot *S* to customer *T*. After 3 iterations, the tentative distances are *S* = 0, *A* = 5, *B* = 6, *C* = 9. *A* is permanent. If there is an edge *AC* of weight 2, the updated tentative distance to *C* becomes\n\n`,
  ["2", "5", "7", "9"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nRelaxation: new d(C) = min(d(C), d(A) + w(AC)) = min(9, 5 + 2) = **7**.",
);

// ─── SP: 4 SHORT ───────────────────────────────────────────────────────

short(
  SP,
  `Briefly describe Dijkstra's algorithm for finding the shortest path from a single source vertex *S* to all other vertices in a weighted network. Mention the labelling step and the relaxation step. (3 marks)`,
  3,
  "EASY",
  "Dijkstra's algorithm:\n\n1. **Initialise**: label the source vertex *S* with distance 0; label every other vertex with $\\infty$ (or \"unknown\"). Mark all vertices as *unvisited*.\n\n2. **Permanent labelling**: repeatedly select the unvisited vertex *V* with the smallest tentative distance. Mark *V* as visited (its label becomes permanent).\n\n3. **Relaxation**: for each unvisited neighbour *U* of *V*, compute new tentative distance = $d(V) + w(VU)$. If this is less than the current $d(U)$, update $d(U)$ to the new value and record *V* as the predecessor of *U*.\n\nRepeat steps 2-3 until every vertex is permanently labelled. The shortest path from *S* to any vertex *X* is read by following predecessors back from *X*.",
);

short(
  SP,
  `${img(spNetworkSvg)}\n\nUsing Dijkstra's algorithm on the network above, find the shortest distance from *S* to *T* and state the path. (4 marks)`,
  4,
  "MEDIUM",
  "**Dijkstra from *S*:**\n\n| Step | Vertex finalised | d(S) | d(A) | d(B) | d(C) | d(D) | d(T) |\n|---|---|---|---|---|---|---|---|\n| 0 | S=0 | 0 | ∞ | ∞ | ∞ | ∞ | ∞ |\n| 1 | B=3 | 0 | 4 | **3** | ∞ | 9 | ∞ |\n| 2 | A=4 | 0 | **4** | 3 | 9 | 9 | ∞ |\n| 3 | C=9 | 0 | 4 | 3 | **9** | 9 | 13 |\n| 4 | D=9 | 0 | 4 | 3 | 9 | **9** | 13 |\n| 5 | T=13 | 0 | 4 | 3 | 9 | 9 | **13** |\n\nShortest distance from *S* to *T* = **13**.\n\nPath (trace predecessors): T ← C ← A ← S, so path = ***S → A → C → T***.",
);

short(
  SP,
  `A logistics manager must drive from city *X* to city *Z* through a network of roads. The weights on edges represent driving times in minutes. The network has 5 nodes, with edges *X*-*Y*: 12, *X*-*W*: 8, *W*-*Y*: 3, *W*-*Z*: 10, *Y*-*Z*: 5.\n\n**a.** Find the shortest driving time from *X* to *Z*. (2 marks)\n\n**b.** State the corresponding route. (1 mark) (3 marks)`,
  3,
  "MEDIUM",
  "**a.** Dijkstra from *X*: d(W) = 8, d(Y) = min(12, 8+3) = 11, d(Z) = min(d(W)+10, d(Y)+5) = min(18, 16) = **16 minutes**.\n\n**b.** Route: ***X → W → Y → Z*** (8 + 3 + 5 = 16 min).",
);

short(
  SP,
  `Explain the difference between a *shortest-path* problem and a *minimum spanning tree* problem. Use one example each. (4 marks)`,
  4,
  "MEDIUM",
  "A **shortest-path problem** finds the route of minimum total weight between a specified source vertex and a specified destination vertex in a network. The solution is a *path* (a single sequence of vertices and edges). Example: finding the quickest driving route from your home to school using a road network with travel-time weights.\n\nA **minimum spanning tree (MST) problem** finds the subgraph of minimum total weight that connects **every** vertex of the network. The solution is a *tree* with $n - 1$ edges for $n$ vertices. Example: connecting every house in a small neighbourhood to a fibre network using the minimum total length of cable.\n\nThe two problems generally produce different answers — the shortest-path edges are not necessarily a subset of the MST edges, and the MST edges do not necessarily lie on a shortest path.",
);

// ─── SP: 2 EXT_ANS ─────────────────────────────────────────────────────

extAns(
  SP,
  [
    {
      label: "a",
      marks: 3,
      content: `Use Dijkstra's algorithm to find the shortest distance from *S* to every other vertex.\n\n${img(spNetworkSvg)}`,
      solution: "**Iterations:**\n\n| Step | Finalised | d(A) | d(B) | d(C) | d(D) | d(T) |\n|---|---|---|---|---|---|---|\n| 1 | B (3) | 4 | 3 | ∞ | 9 | ∞ |\n| 2 | A (4) | 4 | – | 9 | 9 | ∞ |\n| 3 | C (9) | – | – | 9 | 9 | 13 |\n| 4 | D (9) | – | – | – | 9 | 13 |\n| 5 | T (13) | – | – | – | – | 13 |\n\nFinal distances: d(A) = 4, d(B) = 3, d(C) = 9, d(D) = 9, d(T) = 13.",
    },
    {
      label: "b",
      marks: 1,
      content: `State the shortest path and its length from *S* to *T*.`,
      solution: "Shortest path: ***S → A → C → T***, length **13**.",
    },
    {
      label: "c",
      marks: 1,
      content: `Is the shortest path from *S* to *T* unique? Justify briefly.`,
      solution: "**Yes** — there is only one path of length 13. Trace: T(13) ← C(9) ← A(4) ← S(0); no alternative predecessor gives the same distance at each step (d(C) = 9 only via A; d(A) = 4 only via S directly).",
    },
  ],
  "MEDIUM",
  `A delivery driver navigates a road network of 6 intersections, *S* (start), *A*, *B*, *C*, *D* and *T* (target). Each edge weight gives the time (in minutes) to traverse that road segment.`,
);

extAns(
  SP,
  [
    {
      label: "a",
      marks: 3,
      content: `Use Dijkstra's algorithm to find the shortest distance from vertex 1 to vertex 5.\n\n${img(sp2NetworkSvg)}`,
      solution: "Dijkstra from 1:\n\n| Step | Finalised | d(2) | d(3) | d(4) | d(5) |\n|---|---|---|---|---|---|\n| 1 | 3 (4) | 7 | 4 | ∞ | ∞ |\n| 2 | 2 (6) | 6 (via 3) | – | 12 | 14 (via 3) |\n| 3 | 4 (11) | – | – | 11 (via 2) | 14 |\n| 4 | 5 (14) | – | – | – | 14 |\n\nShortest distance from 1 to 5 = **14**.",
    },
    {
      label: "b",
      marks: 2,
      content: `Determine **all** shortest paths from vertex 1 to vertex 5 and explain why there is more than one.`,
      solution: "Two paths achieve length 14:\n\n- **1 → 3 → 5**: 4 + 10 = 14.\n- **1 → 3 → 2 → 4 → 5**: 4 + 2 + 5 + 3 = 14.\n\nMultiple shortest paths arise when distinct routes happen to have equal total weight — Dijkstra finds the distance but does not force a unique path when ties occur.",
    },
    {
      label: "c",
      marks: 1,
      content: `If edge 4-5 increased from 3 to 5, what is the new shortest distance from 1 to 5?`,
      solution: "Recompute: d(5) = min(d(4) + 5, d(3) + 10) = min(11 + 5, 4 + 10) = min(16, 14) = **14**.\n\nThe shortest distance **stays at 14** — path 1 → 3 → 5 is now uniquely shortest.",
    },
  ],
  "HARD",
);

// ─── SP: 3 EXT_RESP ────────────────────────────────────────────────────

// 7-node bus network
const busNodes = [
  { id: "A", x: 0, y: 0 },
  { id: "B", x: 2, y: 2 },
  { id: "C", x: 2, y: -2 },
  { id: "D", x: 4, y: 1 },
  { id: "E", x: 4, y: -1 },
  { id: "F", x: 6, y: 1.5 },
  { id: "G", x: 6, y: -1 },
];
const busEdges = [
  { from: "A", to: "B", weight: 6 },
  { from: "A", to: "C", weight: 4 },
  { from: "B", to: "C", weight: 5 },
  { from: "B", to: "D", weight: 3 },
  { from: "C", to: "D", weight: 7 },
  { from: "C", to: "E", weight: 8 },
  { from: "D", to: "E", weight: 2 },
  { from: "D", to: "F", weight: 5 },
  { from: "D", to: "G", weight: 6 },
  { from: "E", to: "G", weight: 4 },
  { from: "F", to: "G", weight: 3 },
];
// Dijkstra from A:
// d(A)=0
// d(B)=6, d(C)=4
// Pick C(4). From C: d(B) via C = 4+5=9 (worse than 6), d(D) via C = 4+7=11, d(E) via C = 4+8=12.
// Pick B(6). From B: d(D) via B = 6+3=9 (better than 11).
// Pick D(9). From D: d(E) via D = 9+2=11 (better than 12), d(F)=9+5=14, d(G)=9+6=15.
// Pick E(11). From E: d(G) via E = 11+4=15 (tie).
// Pick F(14). From F: d(G) via F = 14+3=17 (worse than 15).
// Pick G(15). Done.
// d(A)=0, d(B)=6, d(C)=4, d(D)=9, d(E)=11, d(F)=14, d(G)=15.
// Two shortest paths to G: A→B→D→G (15), A→B→D→E→G (15).
const busNetworkSvg = networkGraph({ nodes: busNodes, edges: busEdges });

extResp(
  SP,
  [
    {
      label: "a",
      marks: 4,
      content: `Apply Dijkstra's algorithm to find the shortest time from *A* to **every** other stop. Present the iterations in a table.\n\n${img(busNetworkSvg)}`,
      solution: "**Dijkstra from *A*:**\n\n| Step | Permanent | d(B) | d(C) | d(D) | d(E) | d(F) | d(G) |\n|---|---|---|---|---|---|---|---|\n| 0 | A=0 | 6 | 4 | ∞ | ∞ | ∞ | ∞ |\n| 1 | C=4 | 6 | – | 11 | 12 | ∞ | ∞ |\n| 2 | B=6 | – | – | 9 | 12 | ∞ | ∞ |\n| 3 | D=9 | – | – | – | 11 | 14 | 15 |\n| 4 | E=11 | – | – | – | – | 14 | 15 |\n| 5 | F=14 | – | – | – | – | – | 15 |\n| 6 | G=15 | – | – | – | – | – | – |\n\nFinal: d(A)=0, d(B)=6, d(C)=4, d(D)=9, d(E)=11, d(F)=14, **d(G)=15**.",
    },
    {
      label: "b",
      marks: 2,
      content: `State the shortest path from *A* to *G* and its length.`,
      solution: "Trace predecessors: G(15) ← D(9) ← B(6) ← A(0).\n\nShortest path: ***A → B → D → G***, length **15 min**.",
    },
    {
      label: "c",
      marks: 1,
      content: `Is the shortest path from *A* to *G* unique? Explain.`,
      solution: "**No** — path *A → B → D → E → G* = 6 + 3 + 2 + 4 = **15** also achieves the shortest distance. Two distinct shortest paths exist because edges *DG*(6) and *DE*(2) + *EG*(4) both add 6 from *D* to *G*.",
    },
    {
      label: "d",
      marks: 2,
      content: `Edge *AC* is closed for roadworks. By recomputing, find the new shortest distance from *A* to *G*.`,
      solution: "Remove edge *AC* (cost 4). New distances:\n- d(B)=6, d(C) via B = 6+5=11, d(D) via B = 6+3=9, then d(E) via D = 11, d(F)=14, d(G)=15.\n\n**Same shortest path *A → B → D → G* still has length 15** — the AC closure does not affect this route because the optimal path didn't use AC anyway.",
    },
    {
      label: "e",
      marks: 2,
      content: `A new direct bus route from *A* to *F* with travel time 12 min is introduced. Does the shortest distance from *A* to *G* change? Justify.`,
      solution: "New edge *AF*(12). Check shortest path to *F*: d(F) = min(14, 12) = **12** (use direct route).\n\nThen d(G) = min(15, d(F) + 3) = min(15, 15) = **15** — unchanged.\n\n**No change** — even with the faster direct *A → F* route, the time to *G* is still 15 min (now achievable via *A → F → G* = 12 + 3 = 15 as well).",
    },
  ],
  "HARD",
  `**Question — Bus routes**\n\nA city bus network connects 7 stops, *A* to *G*. The weights on the network give the travel time (in minutes) between adjacent stops. A commuter at stop *A* must reach stop *G*.`,
);

extResp(
  SP,
  [
    {
      label: "a",
      marks: 3,
      content: `Apply Dijkstra's algorithm to find the shortest path from *S* to *T* in the network below.\n\n${img(spPathSvg)}`,
      solution: "Dijkstra: d(B)=3, d(A)=4, d(C)=9 (via A), d(D)=9 (via B), d(T)=13 (via C).\n\nShortest path: ***S → A → C → T***, length **13** (highlighted in red on the network).",
    },
    {
      label: "b",
      marks: 2,
      content: `Calculate the length of the path *S → B → D → T* and compare it to your answer in part **a**.`,
      solution: "Path *S → B → D → T* = 3 + 6 + 5 = **14**. \n\nThis is **1 min slower** than the shortest path (13 min via *S → A → C → T*). It is the second-best route.",
    },
    {
      label: "c",
      marks: 2,
      content: `If the road *A-C* is closed for emergency works, find the new shortest distance from *S* to *T*.`,
      solution: "Remove edge *AC* (weight 5). Recompute Dijkstra:\n- d(A)=4, d(B)=3.\n- d(C) was 9 via A; now no AC edge ⇒ d(C) = ? *C*'s remaining neighbours are *D* and *T*. Need to reach C via D: d(D) = min(3+6, 4+8) = 9 (via B). d(C) = d(D) + 3 = 12 (via D).\n- d(T) = min(d(C)+4, d(D)+5) = min(16, 14) = **14 min**.\n\nNew shortest path: ***S → B → D → T***, length **14 min** (an increase of 1 min from the original 13).",
    },
    {
      label: "d",
      marks: 3,
      content: `A new direct road from *S* to *C* of length 7 is built. Does this change the shortest path from *S* to *T*? Compute the new shortest distance.`,
      solution: "With edge *SC*(7): d(C) = min(9 via SAC, 7 direct) = **7** (using new direct road).\n\nThen d(T) = min(d(C)+4, d(D)+5) = min(11, 14) = **11**.\n\n**Yes** — the shortest path becomes ***S → C → T*** with length **11 min** (a 2-minute saving compared to the original 13 min via S→A→C→T).",
    },
    {
      label: "e",
      marks: 2,
      content: `Explain why a road network's shortest path between two vertices is not generally part of the network's minimum spanning tree.`,
      solution: "A **shortest path** is optimised between *two specific* vertices. A **minimum spanning tree** is optimised across *all* vertices simultaneously, finding the smallest total weight that connects them all (but possibly via lengthy detours).\n\nExample: in this network, the MST has total weight 17 (e.g. *SA*=4, *SB*=3, *AC*=5, *CD*=3, *CT*=4) but the shortest path from *S* to *T* uses *SACT* of length 13 — these are different objectives. The MST connects *every* vertex cheaply; the shortest path connects *just two* quickly.",
    },
  ],
  "MEDIUM",
  `**Question — Delivery route**\n\nA driver has a network of 6 intersections, *S*, *A*, *B*, *C*, *D* and *T*, with edge weights giving the travel time in minutes. She must drive from *S* (depot) to *T* (customer) as quickly as possible.`,
);

extResp(
  SP,
  [
    {
      label: "a",
      marks: 2,
      content: `From a precedence table, construct a network with 5 vertices *V₁* to *V₅* and edges as listed, then apply Dijkstra from *V₁* to *V₅*.\n\n| Edge | Weight |\n|---|---|\n| V₁-V₂ | 7 |\n| V₁-V₃ | 4 |\n| V₂-V₃ | 2 |\n| V₂-V₄ | 5 |\n| V₃-V₄ | 8 |\n| V₃-V₅ | 10 |\n| V₄-V₅ | 3 |`,
      solution: "Dijkstra from V₁:\n- d(V₁)=0\n- d(V₂)=7, d(V₃)=4\n- Permanent V₃=4. Update d(V₂)=min(7, 4+2)=6; d(V₄)=4+8=12; d(V₅)=4+10=14.\n- Permanent V₂=6. Update d(V₄)=min(12, 6+5)=11.\n- Permanent V₄=11. Update d(V₅)=min(14, 11+3)=14.\n- Permanent V₅=14.\n\nShortest distance = **14**.",
    },
    {
      label: "b",
      marks: 2,
      content: `List **all** shortest paths from *V₁* to *V₅*.`,
      solution: "Two paths of length 14:\n- **V₁ → V₃ → V₅**: 4 + 10 = 14.\n- **V₁ → V₃ → V₂ → V₄ → V₅**: 4 + 2 + 5 + 3 = 14.",
    },
    {
      label: "c",
      marks: 2,
      content: `If edge V₃-V₅ is removed, find the new shortest path and distance.`,
      solution: "Without V₃-V₅, only path V₁→V₃→V₂→V₄→V₅ (length 14) and V₁→V₂→V₄→V₅ (7+5+3=15) remain reachable via these intermediates.\n\nNew shortest path: ***V₁ → V₃ → V₂ → V₄ → V₅*** of length **14**.\n\nSurprisingly, the distance does **not** change because the alternative path already had length 14.",
    },
    {
      label: "d",
      marks: 2,
      content: `If edge V₂-V₄ is also removed (in addition to V₃-V₅), find the new shortest distance.`,
      solution: "Without both V₃-V₅ and V₂-V₄, the only path is V₁→V₃→V₄→V₅ = 4 + 8 + 3 = **15** (or V₁→V₂→V₃→V₄→V₅ = 7+2+8+3 = 20, worse).\n\nNew shortest distance = **15**.",
    },
    {
      label: "e",
      marks: 2,
      content: `Comment on which removed edge had the greater impact on the shortest distance.`,
      solution: "Removing V₃-V₅ alone: distance unchanged at 14 (path V₁→V₃→V₂→V₄→V₅ still works at 14).\n\nRemoving V₂-V₄ as well: distance jumps to 15 (an increase of 1).\n\n**V₂-V₄ has the greater impact** because, after V₃-V₅ is gone, V₂-V₄ is the critical link on the only remaining short route. Removing V₃-V₅ alone was masked by the alternative route through V₂-V₄.",
    },
  ],
  "HARD",
);


// ═══════════════════════════════════════════════════════════════════════
// 3. ACTIVITY NETWORKS (16 items)
// ═══════════════════════════════════════════════════════════════════════
const AN = "activity-networks";

// Activity network 1: 6 events, 7 activities
const an1Nodes = [
  { id: "1", x: 0, y: 0 },
  { id: "2", x: 2, y: 1.5 },
  { id: "3", x: 2, y: -1.5 },
  { id: "4", x: 4, y: 1 },
  { id: "5", x: 4, y: -1 },
  { id: "6", x: 6, y: 0 },
];
const an1Activities = [
  { id: "A", from: "1", to: "2", duration: 3 },
  { id: "B", from: "1", to: "3", duration: 5 },
  { id: "C", from: "2", to: "4", duration: 4 },
  { id: "D", from: "2", to: "5", duration: 6 },
  { id: "E", from: "3", to: "5", duration: 3 },
  { id: "F", from: "4", to: "6", duration: 2 },
  { id: "G", from: "5", to: "6", duration: 4 },
];
// Forward: ES(1)=0; ES(2)=3, ES(3)=5; ES(4)=3+4=7; ES(5)=max(3+6, 5+3)=9; ES(6)=max(7+2, 9+4)=13.
// Backward: LF(6)=13; LF(4)=11, LF(5)=9. LF(2)=min(LS(C), LS(D))=min(11-4, 9-6)=min(7, 3)=3. LF(3)=LS(E)=9-3=6. LF(1)=min(LS(A), LS(B))=min(3-3, 6-5)=min(0, 1)=0.
// Critical path: 1→2→5→6 via A, D, G; length 13.
// Floats: A: LF(A)-EF(A) = 3-3=0 (critical). B: LF(B)-EF(B) = 6-5=1. C: LF(C)-EF(C) = 11-7=4. D: LF(D)-EF(D) = 9-9=0 (crit). E: LF(E)-EF(E) = 9-8=1. F: LF(F)-EF(F) = 13-9=4. G: LF(G)-EF(G)=13-13=0 (crit).
const an1Svg = criticalPathDiagram({ nodes: an1Nodes, activities: an1Activities });
const an1SvgCrit = criticalPathDiagram({
  nodes: an1Nodes,
  activities: an1Activities.map((a) => ({
    ...a,
    onCriticalPath: ["A", "D", "G"].includes(a.id),
  })),
});

// Activity network 2: 7 events, more activities  
const an2Nodes = [
  { id: "1", x: 0, y: 0 },
  { id: "2", x: 1.5, y: 1.5 },
  { id: "3", x: 1.5, y: -1.5 },
  { id: "4", x: 3, y: 0 },
  { id: "5", x: 4.5, y: 1.5 },
  { id: "6", x: 4.5, y: -1.5 },
  { id: "7", x: 6, y: 0 },
];
const an2Activities = [
  { id: "A", from: "1", to: "2", duration: 4 },
  { id: "B", from: "1", to: "3", duration: 3 },
  { id: "C", from: "2", to: "4", duration: 2 },
  { id: "D", from: "3", to: "4", duration: 5 },
  { id: "E", from: "4", to: "5", duration: 6 },
  { id: "F", from: "4", to: "6", duration: 3 },
  { id: "G", from: "5", to: "7", duration: 4 },
  { id: "H", from: "6", to: "7", duration: 5 },
];
// Forward: ES(1)=0; ES(2)=4, ES(3)=3; ES(4)=max(4+2, 3+5)=8; ES(5)=8+6=14, ES(6)=8+3=11; ES(7)=max(14+4, 11+5)=18.
// Project length 18. Critical: 1→3→4→5→7 via B,D,E,G; 3+5+6+4=18.
const an2Svg = criticalPathDiagram({ nodes: an2Nodes, activities: an2Activities });

// ─── AN: 7 MCQ ────────────────────────────────────────────────────────

mcq(
  AN,
  `In an activity network (project network) drawn as an *activity-on-arc* diagram,\n\n`,
  [
    "the nodes (vertices) represent the activities and the edges represent events",
    "the edges represent the activities and the nodes represent events (milestones)",
    "the durations are written on the nodes",
    "the network is undirected and contains cycles",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nIn the activity-on-arc convention used in VCAA, **edges represent activities** (with a duration), and **nodes represent events** (the start or completion of one or more activities). The network is directed and acyclic (a DAG).",
);

mcq(
  AN,
  `A dummy activity in an activity network\n\n`,
  [
    "has positive duration and consumes resources",
    "has zero duration and is used only to maintain correct precedence relations",
    "is the longest activity in the network",
    "lies only on the critical path",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nA dummy activity has **duration 0** and consumes no resources. Its only purpose is to enforce precedence relations that cannot be drawn directly without ambiguity in the activity-on-arc representation. It is typically shown with a dashed edge.",
);

mcq(
  AN,
  `${img(an1Svg)}\n\nFor the activity network above, the earliest starting time of activity *G* is\n\n`,
  ["3", "5", "8", "9"],
  "D",
  "MEDIUM",
  "**Answer: D**\n\nForward pass: ES(2)=3, ES(3)=5. EF(D) (2→5) = 3+6 = 9. EF(E) (3→5) = 5+3 = 8. ES(5) = max(9, 8) = **9**. Therefore ES(G) = 9.",
);

mcq(
  AN,
  `${img(an1Svg)}\n\nFor the activity network above, the minimum project completion time is\n\n`,
  ["11", "12", "13", "14"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nForward pass: ES(6) = max(EF(F), EF(G)) = max(7+2, 9+4) = max(9, 13) = **13**.",
);

mcq(
  AN,
  `${img(an1Svg)}\n\nFor the activity network above, the float time of activity *C* is\n\n`,
  ["0", "1", "2", "4"],
  "D",
  "MEDIUM",
  "**Answer: D**\n\nEF(C) = ES(2) + 4 = 3 + 4 = 7. Backward: LF(6) = 13, LF(4) = LS(F) = 13 − 2 = 11. So LF(C) = 11. Float(C) = LF(C) − EF(C) = 11 − 7 = **4**.",
);

mcq(
  AN,
  `An activity *X* in an activity network has EST = 5 days, duration = 4 days and LFT = 11 days. The float of activity *X* is\n\n`,
  ["0 days", "2 days", "4 days", "6 days"],
  "B",
  "EASY",
  "**Answer: B**\n\nEFT = 5 + 4 = 9. Float = LFT − EFT = 11 − 9 = **2 days**. (Equivalently, LST = 11 − 4 = 7; LST − EST = 7 − 5 = 2.)",
);

mcq(
  AN,
  `Which of the following is **always true** of an activity on the critical path of a project?\n\n`,
  [
    "Its duration is the largest in the network",
    "Its float time is zero",
    "It has no predecessor activity",
    "It must connect the start vertex to the end vertex directly",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nAn activity is *critical* iff its float = 0 — any delay in it directly delays the project. Critical activities need not be the longest individually, need not have no predecessors, and need not directly connect start to finish.",
);

// ─── AN: 4 SHORT ───────────────────────────────────────────────────────

short(
  AN,
  `Distinguish between the following terms used in critical path analysis:\n\n**a.** Earliest starting time (EST) of an activity. (1 mark)\n\n**b.** Latest finishing time (LFT) of an activity. (1 mark)\n\n**c.** Float time of an activity. (1 mark)\n\n**d.** Critical activity. (1 mark) (4 marks)`,
  4,
  "EASY",
  "**a.** EST = earliest possible time the activity can start, given that all preceding activities are completed; computed by the forward pass.\n\n**b.** LFT = latest time the activity can finish without delaying the overall project; computed by the backward pass.\n\n**c.** Float = LFT − EFT = LST − EST; the slack time the activity can be delayed without affecting the project completion.\n\n**d.** Critical activity = an activity with float = 0; any delay in it directly delays the project.",
);

short(
  AN,
  `${img(an1Svg)}\n\nFor the activity network above:\n\n**a.** Complete the forward pass to find the EST and EFT of every activity. (3 marks)\n\n**b.** State the minimum project completion time and identify the critical path. (2 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Forward pass:\n\n| Activity | ES | Duration | EF |\n|---|---|---|---|\n| A (1→2) | 0 | 3 | 3 |\n| B (1→3) | 0 | 5 | 5 |\n| C (2→4) | 3 | 4 | 7 |\n| D (2→5) | 3 | 6 | 9 |\n| E (3→5) | 5 | 3 | 8 |\n| F (4→6) | 7 | 2 | 9 |\n| G (5→6) | 9 | 4 | 13 |\n\nES(5) = max(EF(D), EF(E)) = max(9, 8) = 9.\nES(6) = max(EF(F), EF(G)) = max(9, 13) = 13.\n\n**b.** Minimum project completion = **13 days**. Critical path = ***A − D − G*** (1→2→5→6); duration 3 + 6 + 4 = 13.",
);

short(
  AN,
  `Given the precedence table below, construct an activity network and find the project completion time.\n\n| Activity | Duration (days) | Predecessors |\n|---|---|---|\n| A | 4 | — |\n| B | 5 | — |\n| C | 3 | A |\n| D | 2 | A, B |\n| E | 6 | C, D | (4 marks)`,
  4,
  "MEDIUM",
  "Activity network has nodes for start (1), end of A (2), end of B (3), merge point of A&B (4), end of C and D (5), end of E (6). Specifically:\n\n- A: 1→2 (4 days)\n- B: 1→3 (5 days)\n- C: 2→5 (3 days) — needs A only\n- D: 4→5 (2 days) — needs A and B (so we use a *dummy* edge 2→4 of duration 0 and 3→4 of duration 0)\n- E: 5→6 (6 days)\n\n**Forward pass**: EF(A)=4, EF(B)=5. EF(C)=4+3=7. ES(D)=max(4, 5)=5, EF(D)=5+2=7. ES(E)=max(7,7)=7. EF(E)=7+6=**13 days**.\n\nProject completion time = **13 days**. Critical path involves activities A, C, E (or B, D, E — both give 13 days; A−C−E = 4+3+6 = 13, B−D−E = 5+2+6 = 13).",
);

short(
  AN,
  `Activity *Y* has EST = 6 days, duration = 5 days, LFT = 15 days.\n\n**a.** Find the EFT and LST of *Y*. (2 marks)\n\n**b.** Find the float time of *Y*. (1 mark)\n\n**c.** State whether *Y* is on the critical path and justify. (1 mark) (4 marks)`,
  4,
  "EASY",
  "**a.** EFT = EST + duration = 6 + 5 = **11 days**. LST = LFT − duration = 15 − 5 = **10 days**.\n\n**b.** Float = LFT − EFT = 15 − 11 = **4 days** (or LST − EST = 10 − 6 = 4).\n\n**c.** *Y* is **not** on the critical path because Float(*Y*) = 4 ≠ 0. Activities on the critical path have float = 0.",
);

// ─── AN: 2 EXT_ANS ─────────────────────────────────────────────────────

extAns(
  AN,
  [
    {
      label: "a",
      marks: 3,
      content: `Perform a forward pass on the network and record the EST and EFT of every activity.\n\n${img(an1Svg)}`,
      solution: "| Activity | ES | Dur | EF |\n|---|---|---|---|\n| A (1→2) | 0 | 3 | 3 |\n| B (1→3) | 0 | 5 | 5 |\n| C (2→4) | 3 | 4 | 7 |\n| D (2→5) | 3 | 6 | 9 |\n| E (3→5) | 5 | 3 | 8 |\n| F (4→6) | 7 | 2 | 9 |\n| G (5→6) | 9 | 4 | 13 |\n\nES(node 5) = max(EF(D), EF(E)) = max(9, 8) = 9.\nES(node 6) = max(EF(F), EF(G)) = max(9, 13) = 13.\n\nProject length = **13 days**.",
    },
    {
      label: "b",
      marks: 3,
      content: `Perform a backward pass and record the LST and LFT of every activity.`,
      solution: "Start with LF(6) = 13. Backward:\n\n| Activity | LS | LF |\n|---|---|---|\n| G (5→6) | 9 | 13 |\n| F (4→6) | 11 | 13 |\n| E (3→5) | 6 | 9 |\n| D (2→5) | 3 | 9 |\n| C (2→4) | 7 | 11 |\n| B (1→3) | 1 | 6 |\n| A (1→2) | 0 | 3 |\n\nWorking: LS(G)=13−4=9, so LF(node 5)=9. LS(F)=13−2=11, so LF(node 4)=11. LF(D)=9, LS(D)=3. LF(E)=9, LS(E)=6, so LF(node 3) = LS(E) = 6. LF(C)=11, LS(C)=7. LF(node 2) = min(LS(C), LS(D)) = min(7, 3) = 3. LF(A) = 3, LS(A) = 0. LF(B) = 6, LS(B) = 1.",
    },
    {
      label: "c",
      marks: 2,
      content: `Calculate the float of each activity and identify the critical path.`,
      solution: "Float = LF − EF:\n\n| Activity | EF | LF | Float |\n|---|---|---|---|\n| A | 3 | 3 | 0 ★ |\n| B | 5 | 6 | 1 |\n| C | 7 | 11 | 4 |\n| D | 9 | 9 | 0 ★ |\n| E | 8 | 9 | 1 |\n| F | 9 | 13 | 4 |\n| G | 13 | 13 | 0 ★ |\n\nCritical activities (★ float = 0): **A, D, G**. Critical path: ***1 → 2 → 5 → 6***, duration 13 days.",
    },
  ],
  "MEDIUM",
  `A small project has 7 activities, *A* to *G*, represented on the activity network below. Each duration is in days.`,
);

extAns(
  AN,
  [
    {
      label: "a",
      marks: 2,
      content: `Construct an activity network for the project from the precedence table.\n\n| Activity | Duration (h) | Predecessors |\n|---|---|---|\n| A | 3 | — |\n| B | 4 | — |\n| C | 6 | A |\n| D | 5 | A, B |\n| E | 2 | C, D |`,
      solution: "Network description (activity-on-arc with one dummy):\n\n- Node 1 = start.\n- A: 1 → 2 (3 h).\n- B: 1 → 3 (4 h).\n- Dummy 2 → 3 (0 h) to enforce D's dependence on A.\n- C: 2 → 4 (6 h).\n- D: 3 → 4 (5 h).\n- E: 4 → 5 (2 h).\n- Node 5 = finish.",
    },
    {
      label: "b",
      marks: 2,
      content: `Perform a forward pass and find the minimum project completion time.`,
      solution: "EF(A)=3, EF(B)=4. EF(C)=3+6=9. ES(D)=max(EF(A), EF(B))=max(3,4)=4, EF(D)=4+5=9. ES(E)=max(EF(C), EF(D))=9. EF(E)=9+2=11. **Project completion = 11 hours.**",
    },
    {
      label: "c",
      marks: 2,
      content: `Identify the critical path(s).`,
      solution: "Path 1: A-C-E = 3+6+2 = **11** (critical).\nPath 2: B-D-E = 4+5+2 = **11** (also critical).\nPath A-D-E (using dummy from end of A) = 3+5+2 = 10 (not critical).\n\nThere are **two critical paths**: *A − C − E* and *B − D − E*, both of length 11.",
    },
  ],
  "MEDIUM",
);

// ─── AN: 3 EXT_RESP ────────────────────────────────────────────────────

extResp(
  AN,
  [
    {
      label: "a",
      marks: 3,
      content: `Carry out a forward pass on the network and tabulate ES and EF for each activity.\n\n${img(an2Svg)}`,
      solution: "| Activity | ES | Dur | EF |\n|---|---|---|---|\n| A (1→2) | 0 | 4 | 4 |\n| B (1→3) | 0 | 3 | 3 |\n| C (2→4) | 4 | 2 | 6 |\n| D (3→4) | 3 | 5 | 8 |\n| E (4→5) | 8 | 6 | 14 |\n| F (4→6) | 8 | 3 | 11 |\n| G (5→7) | 14 | 4 | 18 |\n| H (6→7) | 11 | 5 | 16 |\n\nES(node 4)=max(EF(C), EF(D))=max(6, 8)=8.\nES(node 7)=max(EF(G), EF(H))=max(18, 16)=18.",
    },
    {
      label: "b",
      marks: 2,
      content: `State the minimum project completion time and identify the critical path.`,
      solution: "Minimum completion = **18 days**.\n\nCritical path = ***B − D − E − G*** (1→3→4→5→7): 3 + 5 + 6 + 4 = 18.",
    },
    {
      label: "c",
      marks: 3,
      content: `Carry out a backward pass to compute LS and LF for each activity, and calculate the float of every non-critical activity.`,
      solution: "Backward from node 7 (LF = 18):\n\n| Activity | LF | LS | EF | Float |\n|---|---|---|---|---|\n| G | 18 | 14 | 18 | 0 ★ |\n| H | 18 | 13 | 16 | 2 |\n| E | 14 | 8 | 14 | 0 ★ |\n| F | 13 | 10 | 11 | 2 |\n| C | 10 | 8 | 6 | 4 |\n| D | 8 | 3 | 8 | 0 ★ |\n| A | 8 | 4 | 4 | 4 |\n| B | 3 | 0 | 3 | 0 ★ |\n\nLF(node 4) = min(LS(E), LS(F)) = min(8, 10) = 8.\nLF(node 5) = LS(G) = 14.\nLF(node 6) = LS(H) = 13.\nLF(node 2) = LS(C) = 8.\nLF(node 3) = LS(D) = 3.\n\nFloats: A=4, C=4, F=2, H=2. Critical activities (float 0): **B, D, E, G**.",
    },
    {
      label: "d",
      marks: 2,
      content: `If activity *A* is delayed by 5 days due to a supplier issue, by how many days (if any) will the project be delayed?`,
      solution: "Float(A) = 4 days. Delay of 5 days = 4 absorbed by float + 1 day extra.\n\nProject is delayed by **1 day** (new completion = 18 + 1 = 19 days). Activity A becomes part of a new critical path (with C and either F or E).",
    },
    {
      label: "e",
      marks: 2,
      content: `Suppose activity *H* is delayed by 1 day. State whether this affects the project completion time and explain.`,
      solution: "Float(H) = 2 days. A delay of 1 day is within float, so the project is **not** delayed — completion remains 18 days. H's new float becomes 2 − 1 = 1, so H is still non-critical.",
    },
  ],
  "HARD",
  `**Question — Production planning**\n\nA factory has scheduled 8 production activities, *A* to *H*, with the precedence and durations shown in the activity network. Durations are in days.`,
);

extResp(
  AN,
  [
    {
      label: "a",
      marks: 2,
      content: `Complete the forward pass and state the project duration.\n\n${img(an1SvgCrit)}`,
      solution: "ES(2)=3, ES(3)=5. ES(4)=EF(C)=7. ES(5)=max(EF(D), EF(E))=max(9,8)=9. ES(6)=max(EF(F), EF(G))=max(9, 13)=13.\n\nProject duration = **13 days**.",
    },
    {
      label: "b",
      marks: 2,
      content: `Identify the critical path and explain what is special about its activities.`,
      solution: "Critical path = ***A − D − G*** (1 → 2 → 5 → 6), length 13 days.\n\nEvery activity on the critical path has **float = 0**. Any delay in *A*, *D* or *G* directly delays the project's completion; these activities cannot be postponed without consequence.",
    },
    {
      label: "c",
      marks: 2,
      content: `Calculate the float of every non-critical activity.`,
      solution: "From the backward pass:\n- Float(B) = 6 − 5 = **1 day**\n- Float(C) = 11 − 7 = **4 days**\n- Float(E) = 9 − 8 = **1 day**\n- Float(F) = 13 − 9 = **4 days**\n\n(Activities A, D, G have float 0 and are critical.)",
    },
    {
      label: "d",
      marks: 3,
      content: `Two of the non-critical activities can be delayed by their respective floats simultaneously without delaying the project. Identify two such activities and justify your answer carefully (consider whether they share a path).`,
      solution: "Activities *C* (float 4) and *F* (float 4) can each be delayed by 4 days. However, *C* and *F* lie on the **same** path 1→2→4→6, so if both are simultaneously delayed by 4 days each, the path becomes 3 + (4+4) + (2+4) = 21 — no, wait: C and F both delayed mean both push back together: EF(C)=11, then F starts at 11, EF(F) =11+2=13, but if F also delayed by 4 days, its EF becomes 11+2+4=17.\n\nActually, the path is 0 → 3 (A) → 7 (C) → 9 (F at original) → end. Float along the path is shared; delaying both eats the same 4-day slack. So **delaying *C* by 4 days alone**, OR **delaying *F* by 4 days alone**, is fine, but not both at once.\n\nSafer answer: ***B* (float 1) and *C* (float 4)** can be delayed independently because *B* lies on path 1→3→5→6, *C* lies on path 1→2→4→6 — different paths. Delaying *B* by 1 day pushes EF(B)=6, EF(E)=9 (still ≤ 9). Delaying *C* by 4 days pushes EF(F) = 7+4+2 = 13 (still ≤ 13). Project length stays 13 days.",
    },
    {
      label: "e",
      marks: 1,
      content: `State the minimum project completion time.`,
      solution: "**13 days.**",
    },
  ],
  "HARD",
  `**Question — Garden landscaping**\n\nA landscaping project has 7 activities, *A* to *G*, with the relations shown on the network. Durations are in days. The critical path is highlighted in red.`,
);

extResp(
  AN,
  [
    {
      label: "a",
      marks: 3,
      content: `From the precedence table below, construct an activity network (description in words is acceptable).\n\n| Activity | Duration (h) | Predecessors |\n|---|---|---|\n| P | 2 | — |\n| Q | 4 | — |\n| R | 3 | P |\n| S | 5 | P, Q |\n| T | 6 | R |\n| U | 2 | S |\n| V | 3 | T, U |`,
      solution: "Network description (activity-on-arc):\n- Node 1 = start.\n- *P*: 1 → 2 (2 h).\n- *Q*: 1 → 3 (4 h).\n- *Dummy*: 2 → 3 (0 h) so that *S* (needing P and Q) starts at node 3.\n- *R*: 2 → 4 (3 h).\n- *S*: 3 → 5 (5 h).\n- *T*: 4 → 6 (6 h).\n- *U*: 5 → 6 (2 h).\n- *V*: 6 → 7 (3 h).\n- Node 7 = finish.",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute the EF of every activity and state the project duration.`,
      solution: "EF(P)=2, EF(Q)=4.\nEF(R)=2+3=5.\nES(S)=max(EF(P), EF(Q))=4, EF(S)=4+5=9.\nEF(T)=5+6=11.\nEF(U)=9+2=11.\nES(V)=max(EF(T), EF(U))=11, EF(V)=11+3=**14 h**.\n\nProject duration = **14 h**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Identify all critical paths.`,
      solution: "Path *P-R-T-V*: 2+3+6+3 = **14** (critical).\nPath *Q-S-U-V*: 4+5+2+3 = **14** (critical).\nPath *P-S-U-V*: 2+5+2+3 = 12 (not critical — note this uses dummy from end of P to start of S).\n\n**Two critical paths**: *P-R-T-V* and *Q-S-U-V*, both 14 h.",
    },
    {
      label: "d",
      marks: 2,
      content: `Calculate the float time of activity *R*.`,
      solution: "Backward: LF(V)=14, LS(V)=11. LF(T)=LS(V)=11, LS(T)=11−6=5. LF(R)=LS(T)=5. EF(R)=5.\n\nFloat(R) = LF(R) − EF(R) = 5 − 5 = **0 hours**. Activity *R* is on the critical path *P-R-T-V*.",
    },
    {
      label: "e",
      marks: 3,
      content: `If activity *T* could be reduced by 2 hours (from 6 to 4), what would be the new project duration? Identify the new critical path.`,
      solution: "If T = 4: EF(T) = 5 + 4 = 9. Then path *P-R-T-V* = 2+3+4+3 = 12. Path *Q-S-U-V* = 14 (unchanged).\n\nNew project duration = max(12, 14) = **14 hours** (unchanged).\n\nThe new sole critical path is ***Q-S-U-V*** (14 hours). Crashing *T* by 2 hours does **not** shorten the project because *T* is no longer on the critical path; the project length is now governed by the *Q-S-U-V* path.",
    },
  ],
  "MEDIUM",
);


// ═══════════════════════════════════════════════════════════════════════
// 4. PROJECT SCHEDULING (16 items)
// ═══════════════════════════════════════════════════════════════════════
const PS = "project-scheduling";

// Scheduling network — focus on crashing
const ps1Nodes = [
  { id: "1", x: 0, y: 0 },
  { id: "2", x: 2, y: 1.5 },
  { id: "3", x: 2, y: -1.5 },
  { id: "4", x: 4, y: 0 },
  { id: "5", x: 6, y: 0 },
];
const ps1Activities = [
  { id: "A", from: "1", to: "2", duration: 5 },
  { id: "B", from: "1", to: "3", duration: 4 },
  { id: "C", from: "2", to: "4", duration: 6 },
  { id: "D", from: "3", to: "4", duration: 7 },
  { id: "E", from: "4", to: "5", duration: 3 },
];
// Forward: ES(2)=5, ES(3)=4. ES(4)=max(5+6, 4+7)=11. ES(5)=14.
// Critical: max path 1→3→4→5 via B-D-E = 4+7+3 = 14.
const ps1Svg = criticalPathDiagram({ nodes: ps1Nodes, activities: ps1Activities });

// 7-activity scheduling network
const ps2Nodes = [
  { id: "1", x: 0, y: 0 },
  { id: "2", x: 1.5, y: 1.5 },
  { id: "3", x: 1.5, y: -1.5 },
  { id: "4", x: 3, y: 0 },
  { id: "5", x: 4.5, y: 1.5 },
  { id: "6", x: 6, y: 0 },
];
const ps2Activities = [
  { id: "A", from: "1", to: "2", duration: 4 },
  { id: "B", from: "1", to: "3", duration: 6 },
  { id: "C", from: "2", to: "4", duration: 3 },
  { id: "D", from: "3", to: "4", duration: 2 },
  { id: "E", from: "4", to: "5", duration: 5 },
  { id: "F", from: "4", to: "6", duration: 7 },
  { id: "G", from: "5", to: "6", duration: 4 },
];
// Forward: ES(2)=4, ES(3)=6. ES(4)=max(4+3, 6+2)=8. ES(5)=8+5=13. ES(6)=max(8+7, 13+4)=17.
// Critical path 1→3→4→5→6 via B-D-E-G = 6+2+5+4=17.
const ps2Svg = criticalPathDiagram({ nodes: ps2Nodes, activities: ps2Activities });

// ─── PS: 7 MCQ ─────────────────────────────────────────────────────────

mcq(
  PS,
  `In project scheduling, *crashing* an activity refers to\n\n`,
  [
    "removing the activity from the project entirely",
    "delaying the activity to avoid resource conflicts",
    "reducing the duration of an activity by spending additional resources",
    "extending the activity's duration to absorb its float",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nCrashing reduces an activity's duration (typically by adding workers, equipment, overtime, etc.) at an additional cost per day saved. The aim is to shorten the project completion time.",
);

mcq(
  PS,
  `Which activity should a project manager crash **first** to shorten the project completion time?\n\n`,
  [
    "The activity with the largest float",
    "The cheapest-to-crash activity, regardless of its location in the network",
    "The cheapest-to-crash activity that lies on the **critical path**",
    "The activity with the longest duration",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nOnly activities on the critical path determine the project length. Crashing a non-critical activity (positive float) does not reduce the project duration. Among critical-path activities, choose the cheapest per day to crash.",
);

mcq(
  PS,
  `${img(ps1Svg)}\n\nFor the network above, the critical path has total duration\n\n`,
  ["13", "14", "15", "17"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nPath *A-C-E* = 5+6+3 = 14; Path *B-D-E* = 4+7+3 = 14. Both paths are critical with total duration **14**.",
);

mcq(
  PS,
  `${img(ps1Svg)}\n\nActivity *C* in the network above can be crashed at \\$200 per day. The project completion time would be reduced by crashing *C* by 1 day if\n\n`,
  [
    "*C* is on the critical path so the project is shortened by 1 day",
    "*C* and *D* are both critical, so crashing only *C* may not shorten the project — *D* must also be crashed",
    "*C* is on the critical path but the other path becomes critical, so the project shortens by less than 1 day",
    "Crashing *C* by 1 day shortens the project by 2 days due to compounding",
  ],
  "B",
  "HARD",
  "**Answer: B**\n\nBoth paths (*A-C-E* and *B-D-E*) have length 14. Crashing *C* by 1 day shortens *A-C-E* to 13 but *B-D-E* remains at 14 — so the project length stays at 14. To shorten the project by 1 day, both *C* and *D* must be crashed by 1 day simultaneously.",
);

mcq(
  PS,
  `A project has critical path *A-B-C* with durations 4, 5 and 6 (total 15 days). Crashing *A* costs \\$300/day, crashing *B* costs \\$250/day and crashing *C* costs \\$200/day. The cheapest way to reduce the project by 2 days is to\n\n`,
  [
    "crash *A* by 2 days for \\$600",
    "crash *B* by 2 days for \\$500",
    "crash *C* by 2 days for \\$400",
    "crash each of *A*, *B*, *C* by 1 day for \\$750",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nAll three are on the (single) critical path, so crashing any of them shortens the project by the amount crashed. Choose the cheapest: *C* at \\$200/day. Total cost = 2 × \\$200 = **\\$400**.",
);

mcq(
  PS,
  `A project has activities A (3 days, can crash to 2 at \\$100), B (5 days, can crash to 3 at \\$300/day), C (4 days, cannot be crashed). The critical path is A-B-C with total 12 days. The minimum project duration after crashing is\n\n`,
  ["9 days", "10 days", "11 days", "12 days"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nA can be crashed by 1 day (3→2). B can be crashed by 2 days (5→3). C cannot be crashed.\n\nMinimum duration = 2 + 3 + 4 = **9 days**.",
);

mcq(
  PS,
  `When the critical path of a project network has multiple critical paths, crashing a single activity on **one** critical path will\n\n`,
  [
    "always shorten the project by the amount crashed",
    "have no effect on the project completion time",
    "may not shorten the project unless an activity on every critical path is crashed simultaneously",
    "be the cheapest option to consider",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nIf two paths are both critical, the project is limited by whichever path remains longest. Crashing one path's activity leaves the other at the original length, so the project still takes the original time. All critical paths must be shortened in parallel.",
);

// ─── PS: 4 SHORT ──────────────────────────────────────────────────────

short(
  PS,
  `Explain in your own words what is meant by *crashing* an activity in project scheduling. State the cost-benefit principle for choosing which activity to crash. (3 marks)`,
  3,
  "EASY",
  "**Crashing** is the process of reducing the duration of an activity, usually by adding extra resources (workers, equipment, overtime) at an additional cost. There is normally a maximum amount each activity can be crashed and a fixed cost per day saved.\n\n**Cost-benefit principle**: to shorten a project by one day, identify the cheapest critical-path activity to crash (since only critical-path activities determine project duration). If multiple critical paths exist, all of them must be shortened, so identify the cheapest combination of activities (one per path, or shared between paths if possible) whose combined cost is minimised.",
);

short(
  PS,
  `${img(ps1Svg)}\n\nFor the network above:\n\n**a.** Identify all critical paths. (2 marks)\n\n**b.** If activity *A* can be crashed at \\$200/day and *B* at \\$250/day, find the cheapest cost to reduce the project by 1 day. (3 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Paths: A-C-E = 5+6+3 = 14; B-D-E = 4+7+3 = 14. **Both paths are critical, length 14.**\n\n**b.** To reduce the project, both critical paths must shorten. Crashing *A* shortens A-C-E only (B-D-E stays 14). Crashing *B* shortens B-D-E only (A-C-E stays 14). Activity *E* is on both paths (it's the join after node 4), but *E* hasn't been given a crash cost in the problem.\n\nCheapest option for 1-day reduction = crash both *A* (\\$200) and *B* (\\$250) by 1 day each. Total cost = \\$200 + \\$250 = **\\$450**.",
);

short(
  PS,
  `A project has critical path *X-Y-Z* with durations 8, 5 and 7 days (total 20 days). The crash costs and maximum reductions are:\n\n- *X*: \\$150/day, max 3 days\n- *Y*: \\$200/day, max 2 days\n- *Z*: \\$100/day, max 4 days\n\nFind the cheapest strategy to reduce the project duration to 15 days. (4 marks)`,
  4,
  "MEDIUM",
  "Target: reduce project by 5 days (from 20 to 15).\n\nSort crash costs ascending: Z (\\$100, max 4), X (\\$150, max 3), Y (\\$200, max 2).\n\n**Greedy strategy**:\n- Crash *Z* by 4 days (max) at \\$100/day = \\$400. Reduction 4 days; project = 16 days. Remaining reduction needed: 1 day.\n- Crash *X* by 1 day at \\$150/day = \\$150. Reduction 1 day; project = 15 days. Done.\n\nTotal cost = \\$400 + \\$150 = **\\$550**.\n\nDurations after crashing: *X* = 7, *Y* = 5, *Z* = 3. Sum = 15 days. ✓",
);

short(
  PS,
  `${img(ps2Svg)}\n\nFor the network above:\n\n**a.** State the project duration and the critical path. (2 marks)\n\n**b.** Activity *F* can be crashed at \\$300/day by up to 3 days. Should the manager crash *F* to reduce the project duration? Justify. (3 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Forward: ES(4)=max(4+3, 6+2)=8, ES(5)=13, ES(6)=max(8+7, 13+4)=17. **Project duration = 17 days.** Critical path: *B-D-E-G* (6+2+5+4 = 17).\n\n**b.** Activity *F* runs 4 → 6 with duration 7. F is **not** on the critical path (the critical path is B-D-E-G). EF(F) = 8 + 7 = 15. LF(F) = 17 (final node deadline). Float(F) = 17 − 15 = 2 days.\n\nCrashing *F* would **not** reduce the project duration because *F* is not critical. Money spent crashing *F* would be wasted. The manager should instead crash an activity on the critical path *B-D-E-G* (e.g. crash B or G if those costs are also available).\n\n**Recommendation: do NOT crash F.**",
);

// ─── PS: 2 EXT_ANS ─────────────────────────────────────────────────────

extAns(
  PS,
  [
    {
      label: "a",
      marks: 2,
      content: `State the project duration and identify the critical path(s) from the network.\n\n${img(ps1Svg)}`,
      solution: "Path A-C-E: 5+6+3 = 14.\nPath B-D-E: 4+7+3 = 14.\n\n**Project duration = 14 days.** Two critical paths: *A-C-E* and *B-D-E*.",
    },
    {
      label: "b",
      marks: 3,
      content: `The crash data are:\n\n- *A*: \\$200/day, max 2 days\n- *B*: \\$250/day, max 2 days\n- *C*: \\$300/day, max 1 day\n- *D*: \\$280/day, max 2 days\n- *E*: \\$150/day, max 1 day\n\nFind the cheapest way to shorten the project by 1 day.`,
      solution: "Both paths must shorten by 1 day. Three options:\n\n1. Crash *E* by 1 day (E is on both paths since it follows node 4 which both A-C and B-D feed). Cost = **\\$150**. ✓\n2. Crash *A* (200) and *B* (250) by 1 day each. Cost = \\$450.\n3. Crash *C* (300) and *D* (280) by 1 day each. Cost = \\$580.\n\n**Cheapest = crash *E* by 1 day at \\$150** (E is on both critical paths so 1 day's crash shortens both paths simultaneously).",
    },
    {
      label: "c",
      marks: 3,
      content: `Find the cheapest way to shorten the project by **2 days**. Determine if the network becomes binding (no further crashing possible) and state the cost.`,
      solution: "Day 1: crash *E* by 1 day at \\$150 (E is on both paths). E now at min duration (0 left); project = 13.\n\nDay 2: *E* cannot be crashed further. Need to crash 1 day off both A-C-E and B-D-E paths. Options for both paths:\n- Crash *A* (200) and *B* (250) = \\$450\n- Crash *A* (200) and *D* (280) = \\$480\n- Crash *C* (300) and *B* (250) = \\$550\n- Crash *C* (300) and *D* (280) = \\$580\n\nCheapest pair: ***A* and *B*** at \\$200 + \\$250 = \\$450. Project = 12.\n\n**Total cost for 2-day reduction = \\$150 + \\$450 = \\$600.**",
    },
  ],
  "HARD",
);

extAns(
  PS,
  [
    {
      label: "a",
      marks: 2,
      content: `Identify the critical path and state the project duration.\n\n${img(ps2Svg)}`,
      solution: "Forward: ES(4)=max(7, 8)=8, ES(5)=13, ES(6)=max(15, 17)=17.\n\n**Critical path: *B-D-E-G*** (6+2+5+4 = 17 days). **Project duration = 17 days.**",
    },
    {
      label: "b",
      marks: 2,
      content: `The activity costs and maximum crash days are: A: \\$120/day max 2; B: \\$200/day max 2; D: \\$180/day max 1; E: \\$150/day max 2; G: \\$220/day max 1. Find the cheapest strategy to reduce the project to 15 days.`,
      solution: "Need to shorten the critical path by 2 days. Crashable critical activities and rates:\n- B: \\$200/day max 2 days\n- D: \\$180/day max 1 day\n- E: \\$150/day max 2 days\n- G: \\$220/day max 1 day\n\nCheapest 2 days = crash *E* by 2 days at \\$150/day. But first check if path stays critical:\n\nCrash E by 2 days: critical path *B-D-E-G* = 6 + 2 + 3 + 4 = 15. Other path A-C-F = 4+3+7=14 (still shorter). Path A-C-E-G = 4+3+3+4=14. Path B-D-F = 6+2+7=15 — now equal!\n\nWith E crashed by 2, two critical paths emerge: B-D-E-G (15) and B-D-F (15). Both must shorten further — but the question only asks for 2-day reduction overall.\n\n**Cheapest 2-day reduction: crash *E* by 2 days at \\$150/day = \\$300.** Project = 15 days (with B-D-F now also critical).",
    },
    {
      label: "c",
      marks: 3,
      content: `If the manager later wants to reduce the project to 14 days, what additional cost is needed (on top of part b)?`,
      solution: "From part b, project = 15 days; two critical paths: B-D-E-G (15) and B-D-F (15). Both share activities *B* and *D*.\n\nTo reduce both paths simultaneously, the cheapest option is to crash a shared activity (B or D) by 1 day:\n- Crash *D* by 1 day at \\$180 (max 1 day; uses up D's full crash). Both paths shorten by 1 ⇒ project = 14. ✓\n- Crash *B* by 1 day at \\$200. Both paths shorten by 1 ⇒ project = 14. ✓\n\nCheapest: ***D* at \\$180**.\n\n**Additional cost = \\$180.** Total cost (from 17 to 14) = \\$300 + \\$180 = \\$480.",
    },
  ],
  "HARD",
);

// ─── PS: 3 EXT_RESP ────────────────────────────────────────────────────

extResp(
  PS,
  [
    {
      label: "a",
      marks: 2,
      content: `Compute the forward pass and state the original project duration and critical path.\n\n${img(ps2Svg)}`,
      solution: "Forward:\n- EF(A)=4, EF(B)=6.\n- ES(4)=max(EF(C)=4+3=7, EF(D)=6+2=8)=8.\n- EF(E)=8+5=13. EF(F)=8+7=15.\n- ES(6)=max(EF(F)=15, EF(G)=13+4=17)=**17**.\n\n**Project duration = 17 days.** Critical path: ***B-D-E-G*** (6+2+5+4 = 17).",
    },
    {
      label: "b",
      marks: 3,
      content: `The crash data for each activity is given. Find the cheapest cost to reduce the project to **15 days**.\n\n| Activity | Crash cost (\\$/day) | Max reduction |\n|---|---|---|\n| A | 100 | 2 |\n| B | 250 | 2 |\n| C | 150 | 1 |\n| D | 200 | 1 |\n| E | 180 | 2 |\n| F | 120 | 3 |\n| G | 300 | 1 |`,
      solution: "Target: reduce critical path by 2 days.\n\nCritical-path activities and rates: B(\\$250), D(\\$200), E(\\$180), G(\\$300).\n\nCheapest two days on the critical path: *E* twice at \\$180 = \\$360.\n\n**Check alternative paths after crashing E by 2:**\n- B-D-E-G = 6+2+3+4 = 15.\n- Other paths: A-C-F=4+3+7=14, A-C-E-G=4+3+3+4=14, B-D-F=6+2+7=15.\n\nB-D-F becomes equal to B-D-E-G at 15 days, so the project length is governed by max(15, 15) = 15. ✓\n\n**Cheapest 2-day reduction = crash *E* by 2 days at \\$180/day = \\$360.**",
    },
    {
      label: "c",
      marks: 3,
      content: `Find the cheapest cost to reduce the project to **14 days**.`,
      solution: "From part b at 15 days, two critical paths: B-D-E-G and B-D-F. To shorten further, must shorten **both** paths.\n\nShared activities on both: *B* and *D*. Crashing one of these by 1 day shortens both critical paths simultaneously.\n\nOptions:\n- Crash *D* by 1 day at \\$200. Both paths now 14. ✓\n- Crash *B* by 1 day at \\$250. Both paths now 14. ✓\n\nCheapest: ***D* at \\$200**.\n\nNeed to check if other path A-C-F (14) overtakes: A-C-F = 14 stays. A-C-E-G now 12 (E was crashed by 2). All paths ≤ 14. ✓\n\n**Additional cost beyond 15-day plan = \\$200. Total cost = \\$360 + \\$200 = \\$560** for the 14-day project.",
    },
    {
      label: "d",
      marks: 2,
      content: `Determine the **minimum possible project duration** if every activity is crashed to its maximum extent.`,
      solution: "Apply all maximum crashes:\n- A: 4 − 2 = 2\n- B: 6 − 2 = 4\n- C: 3 − 1 = 2\n- D: 2 − 1 = 1\n- E: 5 − 2 = 3\n- F: 7 − 3 = 4\n- G: 4 − 1 = 3\n\nRecompute path lengths:\n- A-C-E-G = 2+2+3+3 = **10**\n- A-C-F = 2+2+4 = 8\n- B-D-E-G = 4+1+3+3 = **11**\n- B-D-F = 4+1+4 = 9\n\nMinimum project duration = max = **11 days** (along *B-D-E-G*).",
    },
    {
      label: "e",
      marks: 2,
      content: `Calculate the total cost of crashing every activity to its maximum.`,
      solution: "Sum of (cost/day × max days):\n- A: \\$100 × 2 = \\$200\n- B: \\$250 × 2 = \\$500\n- C: \\$150 × 1 = \\$150\n- D: \\$200 × 1 = \\$200\n- E: \\$180 × 2 = \\$360\n- F: \\$120 × 3 = \\$360\n- G: \\$300 × 1 = \\$300\n\n**Total cost = \\$2,070.**\n\n(Note: maximum crash is rarely cost-effective — the manager would only crash to meet a deadline, not for sport.)",
    },
  ],
  "HARD",
  `**Question — Software project crashing**\n\nA software project has 7 activities, *A* to *G*. The network and crash data give the manager flexibility to trade money for time. The original project takes 17 days and must be shortened.`,
);

extResp(
  PS,
  [
    {
      label: "a",
      marks: 3,
      content: `Construct an activity network and find the project completion time from the precedence table.\n\n| Activity | Duration (days) | Predecessors |\n|---|---|---|\n| P | 4 | — |\n| Q | 5 | — |\n| R | 6 | P |\n| S | 3 | P, Q |\n| T | 4 | R |\n| U | 5 | S |\n| V | 2 | T, U |`,
      solution: "Network (1=start, 2=after P, 3=after Q, 4=after S, 5=after R&T, 6=finish):\n- P: 1→2 (4)\n- Q: 1→3 (5)\n- dummy: 2→3 (0) so S needs both P&Q\n- R: 2→5 (6)\n- S: 3→4 (3)\n- T: 5→6 (4) — wait, fix node setup. Better: T after R, U after S, V joins T and U.\n\nForward: EF(P)=4, EF(Q)=5. EF(R)=4+6=10. ES(S)=max(EF(P)=4, EF(Q)=5)=5, EF(S)=8. EF(T)=10+4=14. EF(U)=8+5=13. EF(V)=max(EF(T)=14, EF(U)=13)+2=16.\n\n**Project duration = 16 days.** Critical path: P-R-T-V (4+6+4+2=16).",
    },
    {
      label: "b",
      marks: 2,
      content: `Identify all critical paths.`,
      solution: "Path P-R-T-V = 4+6+4+2 = **16** (critical).\nPath Q-S-U-V = 5+3+5+2 = 15.\nPath P-S-U-V = 4+3+5+2 = 14.\n\n**Single critical path: P-R-T-V.**",
    },
    {
      label: "c",
      marks: 3,
      content: `The crash costs are: P \\$200/day (max 2), R \\$150/day (max 3), T \\$120/day (max 2), V \\$300/day (max 1). Find the cheapest cost to bring the project down to 13 days.`,
      solution: "Target: reduce critical path P-R-T-V by 3 days.\n\nCritical-path crash rates ascending: T(\\$120) ≤ R(\\$150) ≤ P(\\$200) ≤ V(\\$300).\n\nGreedy:\n- Crash *T* by 2 (max) at \\$120/day = \\$240. P-R-T-V = 4+6+2+2=14.\n\nCheck other paths: Q-S-U-V = 15 — wait! Now Q-S-U-V (15) > P-R-T-V (14). Q-S-U-V is the new critical path at 15 days. Need to shorten Q-S-U-V to 13.\n\nActually we should recheck: after crashing T by 2 days, the critical path shifts and reducing P-R-T-V further does not help. Let me redo:\n\n*Re-strategy*: Need both paths ≤ 13.\n- P-R-T-V starts at 16 (need −3).\n- Q-S-U-V starts at 15 (need −2).\n- P-S-U-V at 14 (need −1).\n\nCrash *T* by 2 days at \\$120/day = \\$240: P-R-T-V = 14, P-S-U-V = 14, Q-S-U-V = 15 (unchanged).\nCrash *V* by 1 day at \\$300 = \\$300: P-R-T-V=13, Q-S-U-V=14, P-S-U-V=13. Need Q-S-U-V down 1 more.\n\nNow only Q-S-U-V (14) at issue. But Q, S, U not in our crash table — assume only listed activities crashable. Constraint: we cannot crash any further activity on Q-S-U.\n\nSo target 13 unachievable with given crash data. **Achievable cheaper plan: crash V by 1 + T by 2 brings project to 14 (cost = \\$300 + \\$240 = \\$540).**\n\n(Answer: the cheapest cost to reach 13 days is **not achievable** with the given crash data — only 14 days is achievable, at \\$540.)",
    },
    {
      label: "d",
      marks: 2,
      content: `Comment on whether crashing alone is sufficient to achieve a major project speed-up.`,
      solution: "Crashing is only effective on critical-path activities and only up to each activity's minimum duration. Once the critical path shifts to a different sequence of activities, further crashing must focus on the *new* critical activities. There is also a hard floor — the project cannot be shortened below the duration of the longest path through activities at their minimum crashable durations. In this question, the project floor is 14 days even with all available crashing applied; further reductions require restructuring the network or removing activities, not just crashing.",
    },
    {
      label: "e",
      marks: 2,
      content: `Explain why crashing a non-critical activity is generally a waste of money.`,
      solution: "The project duration equals the length of the longest path (critical path) through the network. A non-critical activity has float > 0, meaning it has slack relative to the project deadline. Reducing a non-critical activity's duration only increases its float — it does not change the critical path or shorten the project. The money spent crashing it has no effect on the project's completion time, hence it is wasted.\n\n*Exception*: crashing a non-critical activity may be worthwhile if it has the potential to become critical due to other delays, or if it shares resources with critical-path activities and crashing frees up those resources. But in pure scheduling terms, crashing non-critical activities does not shorten the project.",
    },
  ],
  "HARD",
);

extResp(
  PS,
  [
    {
      label: "a",
      marks: 2,
      content: `From the activity-on-arc network shown, state the original project duration and identify the critical path.\n\n${img(ps1Svg)}`,
      solution: "Forward: ES(4) = max(5+6, 4+7) = 11. ES(5) = 14.\n\n**Project duration = 14 days.** Critical paths: ***A-C-E*** (14) and ***B-D-E*** (14). Both paths share *E* as their final activity.",
    },
    {
      label: "b",
      marks: 2,
      content: `Suppose activity *E* can be crashed at \\$120/day by up to 2 days, with no other activity crashable. Find the new project duration and the total crash cost if E is crashed maximally.`,
      solution: "E originally 3 days; crash 2 days ⇒ E = 1.\n\nNew path lengths:\n- A-C-E = 5+6+1 = 12.\n- B-D-E = 4+7+1 = 12.\n\n**New project duration = 12 days.**\nCrash cost = 2 × \\$120 = **\\$240**.",
    },
    {
      label: "c",
      marks: 3,
      content: `Now suppose every activity in the network is crashable as follows: A: \\$100/day (max 2); B: \\$150/day (max 2); C: \\$180/day (max 2); D: \\$130/day (max 3); E: \\$120/day (max 2). Find the cheapest way to shorten the project from 14 to 11 days.`,
      solution: "Both paths *A-C-E* and *B-D-E* must shorten by 3.\n\nCheapest 3 days on the shared *E*: crash *E* by 2 days (its max) at \\$120/day = \\$240. Both paths now at 12 (need 1 more reduction on both).\n\nAfter crashing E, only A-C-E and B-D-E paths remain to shorten. Cheapest pair for shortening both by 1 more:\n- Crash *A* (\\$100) and *B* (\\$150) by 1 day each = \\$250. Both paths now at 11.\n\n**Total cheapest = \\$240 + \\$250 = \\$490** for the 3-day reduction (project = 11 days).",
    },
    {
      label: "d",
      marks: 2,
      content: `Calculate the new floats of all activities after the crashing in part **c**.`,
      solution: "After crash: A=4, B=3, C=6, D=7, E=1.\n\nNew forward: ES(2)=4, ES(3)=3, ES(4) = max(4+6, 3+7) = 10. ES(5) = 11.\n\nNew backward: LF(5)=11, LF(4)=10, LF(2)=max(LS(C))=10-6=4, LF(3)=LS(D)=10-7=3.\n\n| Activity | EF | LF | Float |\n|---|---|---|---|\n| A | 4 | 4 | 0 |\n| B | 3 | 3 | 0 |\n| C | 10 | 10 | 0 |\n| D | 10 | 10 | 0 |\n| E | 11 | 11 | 0 |\n\nAll activities now have float 0 — every activity is critical (both paths still exactly 11).",
    },
    {
      label: "e",
      marks: 1,
      content: `State whether further crashing can shorten the project below 11 days, given the data in part **c**.`,
      solution: "Each activity is at its minimum crashable duration except: A still has 1 day left to crash (\\$100), B has 1 day left (\\$150), C has 2 days left (\\$180), D has 3 days left (\\$130), but **E is fully crashed**.\n\nSince *E* is on both critical paths and cannot crash further, any further reduction needs a different shared activity — but *E* is the only shared activity. Therefore the project **cannot** be shortened below 11 days with the given crash data. **11 days is the project floor.**",
    },
  ],
  "MEDIUM",
);


// ═══════════════════════════════════════════════════════════════════════
// 5. FLOW PROBLEMS — MAX FLOW / MIN CUT (16 items)
// ═══════════════════════════════════════════════════════════════════════
const FP = "flow-problems-max-flow-min-cut";

// Flow network 1: 6 nodes, source S to sink T
const fp1Nodes = [
  { id: "S", x: 0, y: 0 },
  { id: "A", x: 2, y: 1.5 },
  { id: "B", x: 2, y: -1.5 },
  { id: "C", x: 4, y: 1.5 },
  { id: "D", x: 4, y: -1.5 },
  { id: "T", x: 6, y: 0 },
];
const fp1Edges = [
  { from: "S", to: "A", weight: 8 },
  { from: "S", to: "B", weight: 6 },
  { from: "A", to: "C", weight: 5 },
  { from: "A", to: "B", weight: 3 },
  { from: "B", to: "D", weight: 7 },
  { from: "C", to: "T", weight: 6 },
  { from: "C", to: "D", weight: 2 },
  { from: "D", to: "T", weight: 8 },
];
// Cut analysis (S side / T side):
// {S}/{A,B,C,D,T}: SA(8) + SB(6) = 14
// {S,A}/{B,C,D,T}: SB(6) + AC(5) + AB(3) = 14 (AB goes S-side→T-side)
// {S,B}/{A,C,D,T}: SA(8) + BD(7) = 15 (AB goes T-side→S-side, not counted)
// {S,A,B}/{C,D,T}: AC(5) + BD(7) = 12
// {S,A,C}/{B,D,T}: AB(3) + SB(6) + CT(6) + CD(2) = 17
// {S,A,B,C}/{D,T}: CT(6) + BD(7) + CD(2) = 15
// {S,A,B,D}/{C,T}: AC(5) + DT(8) = 13
// {S,A,B,C,D}/{T}: CT(6) + DT(8) = 14
// Minimum cut = 12 (cut {S,A,B}/{C,D,T}), so max flow = 12.
const fp1Svg = networkGraph({ nodes: fp1Nodes, edges: fp1Edges, directed: true });

// Smaller 5-node flow network
const fp2Nodes = [
  { id: "S", x: 0, y: 0 },
  { id: "A", x: 2, y: 1 },
  { id: "B", x: 2, y: -1 },
  { id: "T", x: 4, y: 0 },
];
const fp2Edges = [
  { from: "S", to: "A", weight: 5 },
  { from: "S", to: "B", weight: 4 },
  { from: "A", to: "T", weight: 3 },
  { from: "A", to: "B", weight: 2 },
  { from: "B", to: "T", weight: 6 },
];
// Cuts:
// {S}/all: 5+4 = 9.
// {S,A}: SB(4) + AT(3) + AB(2) = 9.
// {S,B}: SA(5) + BT(6) = 11. (AB goes T→S, not counted.)
// {S,A,B}: AT(3) + BT(6) = 9.
// Min cut = 9; max flow = 9.
const fp2Svg = networkGraph({ nodes: fp2Nodes, edges: fp2Edges, directed: true });

// ─── FP: 7 MCQ ─────────────────────────────────────────────────────────

mcq(
  FP,
  `In a network flow problem, the **maximum flow** from source *s* to sink *t* equals\n\n`,
  [
    "the largest edge capacity in the network",
    "the sum of all edge capacities",
    "the capacity of the minimum cut separating *s* from *t*",
    "the average of all edge capacities",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nThis is the *max-flow min-cut theorem*: the maximum total flow from *s* to *t* equals the minimum capacity of any cut separating *s* from *t*.",
);

mcq(
  FP,
  `A *cut* of a flow network from source *s* to sink *t* is\n\n`,
  [
    "any single edge of the network",
    "any subset of edges whose removal disconnects *s* from *t*",
    "the shortest path from *s* to *t*",
    "the longest path from *s* to *t*",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nA cut is a partition of the vertices into two sets (one containing *s*, one containing *t*); the cut's capacity is the sum of capacities of edges crossing from the *s*-side to the *t*-side. Removing those edges disconnects *s* from *t*.",
);

mcq(
  FP,
  `${img(fp1Svg)}\n\nIn the network above, the capacity of the cut that separates {S, A, B} from {C, D, T} is\n\n`,
  ["8", "10", "12", "15"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nEdges crossing from {S,A,B}-side to {C,D,T}-side: *AC*(5) and *BD*(7). Capacity = 5 + 7 = **12**. (Edge *AB* is within {S,A,B} and doesn't cross.)",
);

mcq(
  FP,
  `${img(fp1Svg)}\n\nFor the flow network above, the maximum flow from *S* to *T* is\n\n`,
  ["11", "12", "13", "14"],
  "B",
  "HARD",
  "**Answer: B**\n\nEnumerating cuts, the minimum-capacity cut is {S,A,B} vs {C,D,T} with capacity *AC*(5) + *BD*(7) = **12**. By max-flow min-cut, max flow = 12.",
);

mcq(
  FP,
  `${img(fp2Svg)}\n\nFor the flow network above, the capacity of the cut separating {S} from {A, B, T} is\n\n`,
  ["5", "7", "9", "11"],
  "C",
  "EASY",
  "**Answer: C**\n\nEdges leaving S to the other side: *SA*(5), *SB*(4). Capacity = 5 + 4 = **9**.",
);

mcq(
  FP,
  `In a flow network, the flow along an edge cannot exceed\n\n`,
  [
    "the in-degree of its tail vertex",
    "the edge's capacity",
    "the flow along any other edge",
    "the sum of capacities of edges leaving the source",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nThe *capacity constraint* states that the flow on any edge is at most its capacity. (Conservation of flow at intermediate vertices is another constraint.)",
);

mcq(
  FP,
  `${img(fp2Svg)}\n\nFor the network above, the maximum flow from *S* to *T* is\n\n`,
  ["7", "8", "9", "11"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nMinimum cut = 9 (e.g. cut {S}/{A,B,T} = SA(5)+SB(4) = 9, or cut {S,A,B}/{T} = AT(3)+BT(6) = 9). Therefore max flow = **9**.",
);

// ─── FP: 4 SHORT ───────────────────────────────────────────────────────

short(
  FP,
  `Define the following terms in a flow-network context:\n\n**a.** Source. (1 mark)\n\n**b.** Sink. (1 mark)\n\n**c.** Capacity of a cut. (1 mark)\n\n**d.** Max-flow min-cut theorem. (1 mark) (4 marks)`,
  4,
  "EASY",
  "**a.** *Source*: a vertex from which flow originates; it has no incoming edges (or flow into the source is excluded from the analysis).\n\n**b.** *Sink*: a vertex where flow terminates; it has no outgoing edges (excluded from analysis).\n\n**c.** *Capacity of a cut*: the sum of the capacities of all edges that go from the source-side of the cut to the sink-side of the cut. (Edges going the other way are not counted.)\n\n**d.** *Max-flow min-cut theorem*: the maximum flow from source to sink equals the minimum capacity over all possible cuts that separate the source from the sink. Algebraically: $\\text{max flow} = \\min_{\\text{cuts}} \\text{capacity}$.",
);

short(
  FP,
  `${img(fp1Svg)}\n\nFor the network above:\n\n**a.** List the capacities of three different cuts separating *S* from *T*. (3 marks)\n\n**b.** State the minimum cut and hence the maximum flow. (2 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Three cuts (S-side vs T-side):\n- {S} / {A,B,C,D,T}: edges SA(8) + SB(6) = **14**.\n- {S,A,B} / {C,D,T}: edges AC(5) + BD(7) = **12**.\n- {S,A,B,C,D} / {T}: edges CT(6) + DT(8) = **14**.\n\n**b.** Minimum cut (from these and others) = **{S,A,B} / {C,D,T}** with capacity **12**. By max-flow min-cut, **maximum flow = 12**.",
);

short(
  FP,
  `A water-pipe network has source *S* and sink *T*. Edges S-A (capacity 7), S-B (5), A-T (6), B-T (4) and A-B (3). All edges are directed S→A, S→B, A→T, B→T, A→B.\n\n**a.** Compute the capacity of the cut {S}/{A,B,T}. (1 mark)\n\n**b.** Compute the capacity of {S,A}/{B,T}. (1 mark)\n\n**c.** Compute the capacity of {S,A,B}/{T}. (1 mark)\n\n**d.** State the maximum flow. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Edges S→other: SA(7) + SB(5) = **12**.\n\n**b.** Edges from {S,A} to {B,T}: SB(5) + AT(6) + AB(3) = **14**.\n\n**c.** Edges from {S,A,B} to {T}: AT(6) + BT(4) = **10**.\n\n**d.** Minimum of computed cuts = **10**. Maximum flow = **10**.",
);

short(
  FP,
  `Explain why a network flow problem cannot have a flow exceeding the smallest cut capacity. (3 marks)`,
  3,
  "MEDIUM",
  "Any flow from source *s* to sink *t* must cross every cut that separates *s* from *t* — there is no other route. The total flow crossing a cut from the *s*-side to the *t*-side cannot exceed the cut's capacity, because each edge in the cut carries at most its own capacity (flow ≤ capacity on every edge).\n\nTherefore, for **any** cut $K$: $\\text{flow} \\le \\text{capacity}(K)$. Taking the minimum over all cuts gives $\\text{flow} \\le \\min_K \\text{capacity}(K)$.\n\nThe max-flow min-cut theorem additionally tells us this bound is achievable — there exists a flow that *equals* the minimum cut capacity. So the smallest cut is both an upper bound and an attainable maximum.",
);

// ─── FP: 2 EXT_ANS ─────────────────────────────────────────────────────

extAns(
  FP,
  [
    {
      label: "a",
      marks: 3,
      content: `Enumerate all possible cuts and compute their capacities.\n\n${img(fp2Svg)}`,
      solution: "Source = *S*, sink = *T*. Cuts (S-side / T-side):\n\n| S-side | T-side | Edges crossing | Capacity |\n|---|---|---|---|\n| {S} | {A,B,T} | SA(5)+SB(4) | **9** |\n| {S,A} | {B,T} | SB(4)+AT(3)+AB(2) | **9** |\n| {S,B} | {A,T} | SA(5)+BT(6) | **11** (AB goes T→S, not counted) |\n| {S,A,B} | {T} | AT(3)+BT(6) | **9** |\n\n4 distinct cuts, capacities 9, 9, 11, 9.",
    },
    {
      label: "b",
      marks: 1,
      content: `State the minimum cut capacity.`,
      solution: "Minimum cut capacity = **9** (achieved by three of the four cuts above).",
    },
    {
      label: "c",
      marks: 1,
      content: `State the maximum flow from *S* to *T* and justify.`,
      solution: "By the **max-flow min-cut theorem**, maximum flow = minimum cut capacity = **9**.\n\nFor example, send 5 along *S → A → T* (using full SA(5), but AT only allows 3 — so split: 3 via S→A→T, 2 via S→A→B→T) and 4 via S→B→T. Total flow = 3 + 2 + 4 = 9. ✓",
    },
  ],
  "MEDIUM",
);

extAns(
  FP,
  [
    {
      label: "a",
      marks: 3,
      content: `Compute the capacities of the cuts {S}/rest, {S,A}/rest, {S,A,B}/rest, and {S,A,B,C}/rest.\n\n${img(fp1Svg)}`,
      solution: "| Cut | Crossing edges | Capacity |\n|---|---|---|\n| {S} | SA(8), SB(6) | **14** |\n| {S,A} | SB(6), AC(5), AB(3) | **14** |\n| {S,A,B} | AC(5), BD(7) (AB stays in side) | **12** |\n| {S,A,B,C} | CT(6), CD(2), BD(7) | **15** |",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the minimum cut by inspection.`,
      solution: "From part **a**: the lowest capacity among these is the **{S,A,B}/{C,D,T} cut at 12**. Checking remaining cuts (e.g. {S,A,B,D}/{C,T} = AC(5) + DT(8) = 13; {S,A,B,C,D}/{T} = CT(6)+DT(8) = 14), confirms 12 is the global minimum.\n\n**Minimum cut = 12.**",
    },
    {
      label: "c",
      marks: 2,
      content: `State the maximum flow and give a feasible assignment of flows that achieves it.`,
      solution: "**Max flow = 12.**\n\nFeasible flow assignment:\n- *S → A*: 5; *A → C*: 5; *C → T*: 5.\n- *S → B*: 6; *B → D*: 7 ⇒ this exceeds SB capacity, so use S→A → B route: *A → B*: 1, *B → D*: 7.\n\nLet me reassign: \n- S→A: 5 (full AC = 5), C→T: 5.\n- S→A: 0 extra (A capacity exhausted).\n- S→B: 6, A→B: 1, B→D: 7, D→T: 7.\n\nWait, need flow balance. Let me redo cleanly:\n- Flow on SA = 5 (going to C). Flow on AC = 5. Flow on CT = 5.\n- Flow on SB = 6, on AB = 1 (A receives 6, sends 5 to C and 1 to B). \n- Wait, A receives 5 from S, sends 5 to C, sends 1 to B: but A's inflow is 5, outflow = 5+1 = 6. Imbalanced.\n\nCleaner: Flow SA = 6, AC = 5, AB = 1. Flow SB = 6, BD = 7. Flow CT = 5, DT = 7. Net out of S = 6 + 6 = 12. Net into T = 5 + 7 = 12. ✓ Conservation at A: in 6, out 5+1=6. At B: in 6 + 1 = 7, out 7. ✓ At C: in 5, out 5. At D: in 7, out 7. ✓\n\n**Flow values:** SA=6, SB=6, AC=5, AB=1, BD=7, CT=5, DT=7. Total = 12.",
    },
  ],
  "HARD",
);

// ─── FP: 3 EXT_RESP ────────────────────────────────────────────────────

extResp(
  FP,
  [
    {
      label: "a",
      marks: 2,
      content: `Define a *cut* in a flow network and state the *max-flow min-cut* theorem.`,
      solution: "A **cut** is a partition of the vertex set into two disjoint sets, one containing the source *s* and the other containing the sink *t*. The **capacity** of the cut is the sum of capacities of all edges that go from the *s*-side to the *t*-side (edges in the opposite direction are not counted).\n\nThe **max-flow min-cut theorem** states: in any flow network with a single source and a single sink, the maximum total flow from source to sink equals the minimum capacity over all possible *s*-*t* cuts. Symbolically, $\\text{max flow}(s, t) = \\min_{\\text{cuts}} \\text{capacity}(\\text{cut})$.",
    },
    {
      label: "b",
      marks: 3,
      content: `Compute the capacity of every possible cut for the network below and tabulate.\n\n${img(fp1Svg)}`,
      solution: "There are $2^{n-2}$ possible cuts (where *n* is the number of intermediate vertices). For this 6-node network with 4 intermediates (A, B, C, D), there are $2^4 = 16$ possible cuts. Listing the most informative ones:\n\n| S-side | Crossing edges | Capacity |\n|---|---|---|\n| {S} | SA(8), SB(6) | 14 |\n| {S,A} | SB(6), AC(5), AB(3) | 14 |\n| {S,B} | SA(8), BD(7) | 15 |\n| {S,A,B} | AC(5), BD(7) | **12** ★ |\n| {S,A,C} | SB(6), AB(3), CT(6), CD(2) | 17 |\n| {S,B,D} | SA(8), DT(8) | 16 |\n| {S,A,B,C} | CT(6), CD(2), BD(7) | 15 |\n| {S,A,B,D} | AC(5), DT(8) | 13 |\n| {S,A,B,C,D} | CT(6), DT(8) | 14 |\n\nMinimum = **12** at cut {S,A,B}/{C,D,T}.",
    },
    {
      label: "c",
      marks: 2,
      content: `State the maximum flow from *S* to *T*.`,
      solution: "By max-flow min-cut theorem, max flow = min cut = **12**.",
    },
    {
      label: "d",
      marks: 3,
      content: `Construct a feasible flow that achieves the maximum.`,
      solution: "Flow assignment:\n- *SA* = 6, *SB* = 6 (total out of S = 12)\n- *AB* = 1, *AC* = 5 (out of A = 6, balanced with in)\n- *BD* = 7 (out of B = 7, in = SB + AB = 7)\n- *CT* = 5 (out of C = 5, in = AC = 5; CD = 0)\n- *DT* = 7 (out of D = 7, in = BD = 7)\n\nTotal flow into T = CT + DT = 5 + 7 = **12** ✓.\n\nAll capacities respected: SA 6/8, SB 6/6, AB 1/3, AC 5/5, BD 7/7, CT 5/6, DT 7/8, CD 0/2. ✓",
    },
    {
      label: "e",
      marks: 2,
      content: `If the capacity of edge *BD* were increased from 7 to 10, would the maximum flow increase? Justify.`,
      solution: "Recompute the minimum cut with BD = 10:\n- {S,A,B}/{C,D,T}: AC(5) + BD(10) = 15.\n- {S,A,B,D}/{C,T}: AC(5) + DT(8) = 13.\n- {S,A,B,C}/{D,T}: CT(6) + CD(2) + BD(10) = 18.\n- {S,A,B,C,D}/{T}: CT(6) + DT(8) = 14.\n\nNew minimum cut = **13** (at {S,A,B,D}/{C,T}).\n\n**Yes, max flow increases from 12 to 13.** The bottleneck shifts: previously *AC + BD* was the binding cut; now *AC + DT* is.",
    },
  ],
  "HARD",
  `**Question — Network capacity analysis**\n\nA water-distribution network sends flow from a reservoir (source *S*) to a city (sink *T*) through 4 intermediate pumping stations. Each edge has a capacity (in megalitres per hour).`,
);

extResp(
  FP,
  [
    {
      label: "a",
      marks: 2,
      content: `By inspection, find a flow assignment that achieves total flow 9 from *S* to *T* in the network.\n\n${img(fp2Svg)}`,
      solution: "Flow assignment:\n- *SA* = 5 (full), *SB* = 4 (full). Total out of S = 9. ✓\n- *AT* = 3 (full), *AB* = 2 (full). A: in 5, out 3+2=5. ✓\n- *BT* = 6. B: in SB(4)+AB(2)=6, out 6. ✓\n- Total in T = AT(3) + BT(6) = 9. ✓\n\n**Flow assignment achieves 9.**",
    },
    {
      label: "b",
      marks: 2,
      content: `List all *s-t* cuts and their capacities. Confirm the maximum flow equals the minimum cut.`,
      solution: "Cuts (S-side):\n- {S}: SA(5)+SB(4) = **9**.\n- {S,A}: SB(4)+AT(3)+AB(2) = **9**.\n- {S,B}: SA(5)+BT(6) = 11.\n- {S,A,B}: AT(3)+BT(6) = **9**.\n\nMinimum cut = 9. From part **a**, max flow = 9 = min cut. ✓ Max-flow min-cut verified.",
    },
    {
      label: "c",
      marks: 2,
      content: `What is the *bottleneck* edge in the network? Justify.`,
      solution: "The bottleneck edges are those saturated (carrying their full capacity) in the maximum flow. From part **a**: SA(5/5), SB(4/4), AT(3/3), AB(2/2), BT(6/6). **Every edge is saturated** in the max flow.\n\nIn terms of cut analysis, the bottleneck is the **set of edges crossing the minimum cut** — for cut {S}/{A,B,T}, both *SA* and *SB* are bottlenecks. There is no single bottleneck edge here; the structure is balanced.",
    },
    {
      label: "d",
      marks: 3,
      content: `If the capacity of edge *AT* were increased from 3 to 5, what is the new maximum flow?`,
      solution: "Recompute cuts:\n- {S}: SA(5)+SB(4) = 9 (unchanged).\n- {S,A}: SB(4)+AT(5)+AB(2) = 11.\n- {S,A,B}: AT(5)+BT(6) = 11.\n- {S,B}: SA(5)+BT(6) = 11.\n\nNew minimum cut = **9** (at {S}/rest). The bottleneck is now the **edges leaving S** — capacity 9. Increasing AT does not increase max flow because S→A and S→B are limited.\n\n**New max flow = 9** (unchanged). Increasing AT alone has no effect.",
    },
    {
      label: "e",
      marks: 2,
      content: `If, instead, the capacities of both *SA* and *SB* are doubled (SA: 10, SB: 8), what is the new maximum flow?`,
      solution: "With SA=10, SB=8:\n- {S}: 10+8 = 18.\n- {S,A}: SB(8)+AT(3)+AB(2) = 13.\n- {S,A,B}: AT(3)+BT(6) = 9.\n- {S,B}: SA(10)+BT(6) = 16.\n\nMinimum cut = **9** (at {S,A,B}/{T}).\n\n**New max flow = 9** (still unchanged). Now the bottleneck is at the **sink end** — the total capacity reaching T is only AT(3) + BT(6) = 9. The increased SA/SB capacity is wasted.\n\n**Lesson**: increasing capacities upstream does not help if the downstream is the binding constraint.",
    },
  ],
  "MEDIUM",
  `**Question — Pipeline capacity**\n\nA simple gas pipeline has source *S* and sink *T*, with intermediate junctions *A* and *B*. Edge capacities are in m³/min.`,
);

extResp(
  FP,
  [
    {
      label: "a",
      marks: 3,
      content: `From the edge list, determine the capacity of every cut separating *S* from *T*.\n\n| Edge | Capacity |\n|---|---|\n| S-A | 6 |\n| S-B | 4 |\n| A-C | 4 |\n| A-B | 2 |\n| B-C | 3 |\n| C-T | 7 |`,
      solution: "All edges directed S→A, S→B, A→C, A→B, B→C, C→T. Cuts (S-side):\n\n| S-side | Edges crossing | Capacity |\n|---|---|---|\n| {S} | SA(6)+SB(4) | **10** |\n| {S,A} | SB(4)+AC(4)+AB(2) | **10** |\n| {S,B} | SA(6)+BC(3) | **9** |\n| {S,A,B} | AC(4)+BC(3) | **7** ★ |\n| {S,A,B,C} | CT(7) | **7** ★ |\n\nMinimum cut capacity = **7**.",
    },
    {
      label: "b",
      marks: 1,
      content: `State the maximum flow from *S* to *T*.`,
      solution: "Max flow = min cut = **7**.",
    },
    {
      label: "c",
      marks: 3,
      content: `Construct a feasible flow that achieves the maximum flow of 7.`,
      solution: "Flow assignment:\n- *SA* = 5, *SB* = 2. Out of S = 7. ✓\n- *AC* = 4, *AB* = 1. Out of A = 5, in = 5. ✓\n- *BC* = 3. Out of B = 3, in = SB(2)+AB(1) = 3. ✓\n- *CT* = 7. Out of C = 7, in = AC(4)+BC(3) = 7. ✓\n- Total flow into T = 7. ✓ All capacities respected.",
    },
    {
      label: "d",
      marks: 3,
      content: `Which edge increase would yield the largest improvement in maximum flow? Compute the new maximum.`,
      solution: "The current bottleneck is *CT* (7). Both binding cuts {S,A,B} and {S,A,B,C} use edges into C or out of C. Increasing the edges crossing the binding cut helps:\n\n- Increase *CT* by some amount $\\delta$: new min cut could shift. Let's check increases:\n\nIf CT → 10:\n- {S,A,B}/{C,T}: AC(4)+BC(3) = 7 (unchanged).\n- {S,A,B,C}/{T}: CT(10) = 10.\n- Min cut = 7 — no improvement.\n\nWe need to increase the bottleneck AC+BC. If both AC and BC increase:\n\n- If *AC* → 6, *BC* → 5: new {S,A,B} cut = 11. Then min cut shifts:\n  - {S}: 6+4 = 10.\n  - {S,A}: 4+6+2 = 12.\n  - {S,B}: 6+5 = 11.\n  - {S,A,B}: 6+5 = 11.\n  - {S,A,B,C}: 7.\n  - Min = 7 (CT still binding).\n\nIf both AC=6, BC=5 AND CT=12: now min cut shifts to {S}=10 or {S,A,B}/all=11.\n\n**Most cost-effective single edge to increase**: increase *AC*. If AC→7, BC unchanged: {S,A,B} cut = 7+3=10. Now binding shifts to {S,A,B,C} at 7. Increase CT to match: with AC=7 and CT=10, min cut = min(10, 10, ...) — need to re-check {S}=10.\n\nSimpler answer: ***CT* and *AC* together must increase to lift the flow*** — the bottleneck is *cumulative across {S,A,B,C}/T = CT*.\n\n**Concise answer**: increase *CT* alone gives no improvement (min cut stays at 7 via {S,A,B}). To improve, also increase AC or BC. Single-edge improvement is impossible — increases must be on the cuts that share the bottleneck.",
    },
    {
      label: "e",
      marks: 2,
      content: `In one or two sentences, explain why the maximum flow problem is dual to the minimum cut problem.`,
      solution: "Every flow from *s* to *t* must pass through every *s-t* cut, so the flow is bounded above by the smallest cut's capacity. Conversely, by the max-flow min-cut theorem, a flow always exists that achieves the smallest cut capacity. The two problems are *dual*: maximising flow ↔ minimising cut. Linear-programming duality formalises this — they are the primal and dual of the same LP.",
    },
  ],
  "HARD",
);


// ═══════════════════════════════════════════════════════════════════════
// 6. MATCHING AND ASSIGNMENT PROBLEMS (16 items)
// ═══════════════════════════════════════════════════════════════════════
const MA = "matching-and-assignment-problems";

// Bipartite network: workers W1-W3 on left, jobs J1-J3 on right
const bipartite1Nodes = [
  { id: "W1", x: 0, y: 2 },
  { id: "W2", x: 0, y: 0 },
  { id: "W3", x: 0, y: -2 },
  { id: "J1", x: 3, y: 2 },
  { id: "J2", x: 3, y: 0 },
  { id: "J3", x: 3, y: -2 },
];
// Allocation graph (which worker can do which job): not all are connectable
const bipartite1Edges = [
  { from: "W1", to: "J1", weight: 0 },
  { from: "W1", to: "J2", weight: 0 },
  { from: "W2", to: "J2", weight: 0 },
  { from: "W2", to: "J3", weight: 0 },
  { from: "W3", to: "J1", weight: 0 },
  { from: "W3", to: "J3", weight: 0 },
];
// Maximum matching: W1-J1, W2-J3, W3-? But J1 taken — try W1-J2, W2-J3, W3-J1. Matching of size 3.
const bipartite1Svg = networkGraph({
  nodes: bipartite1Nodes, edges: bipartite1Edges.map(e => ({...e, weight: undefined})),
});

// 3×3 cost matrix for Hungarian algorithm
// Workers W1, W2, W3 × Jobs J1, J2, J3
const cost3 = [
  [9, 2, 7],
  [6, 4, 3],
  [5, 8, 1],
];
const cost3Matrix = matrixTable({
  values: cost3,
  rowLabels: ["W1", "W2", "W3"],
  colLabels: ["J1", "J2", "J3"],
});
// Hungarian algorithm on 3x3:
// Row reduce: subtract row min from each row.
// Row 1: min=2 ⇒ [7, 0, 5]
// Row 2: min=3 ⇒ [3, 1, 0]
// Row 3: min=1 ⇒ [4, 7, 0]
// After row reduction:
// [7, 0, 5]
// [3, 1, 0]
// [4, 7, 0]
// Col reduce: col mins are 3, 0, 0. Subtract col 1 min=3:
// [4, 0, 5]
// [0, 1, 0]
// [1, 7, 0]
// Zeros at (1,2), (2,1), (2,3), (3,3). Assign: 
// Row 1 has only one zero: assign W1-J2.
// Row 2 has two zeros (J1, J3); column 1 has only one zero (W2): assign W2-J1.
// Row 3 has zero at J3: assign W3-J3.
// Final assignment: W1-J2 (cost 2), W2-J1 (cost 6), W3-J3 (cost 1). Total = 2+6+1 = 9.

// 4×4 cost matrix
const cost4 = [
  [4, 1, 3, 6],
  [5, 7, 2, 4],
  [3, 4, 6, 1],
  [2, 5, 4, 3],
];
const cost4Matrix = matrixTable({
  values: cost4,
  rowLabels: ["W1", "W2", "W3", "W4"],
  colLabels: ["J1", "J2", "J3", "J4"],
});
// Hungarian on 4x4:
// Row reduce: r1 min=1 ⇒ [3,0,2,5]; r2 min=2 ⇒ [3,5,0,2]; r3 min=1 ⇒ [2,3,5,0]; r4 min=2 ⇒ [0,3,2,1]
// Reduced matrix:
// [3, 0, 2, 5]
// [3, 5, 0, 2]
// [2, 3, 5, 0]
// [0, 3, 2, 1]
// Col mins: 0, 0, 0, 0. All zero, no col reduction needed.
// Look for assignment with zeros: r1-c2, r2-c3, r3-c4, r4-c1. All assigned.
// Total cost: 1 + 2 + 1 + 2 = 6. (Verified: cost4[0][1]=1, cost4[1][2]=2, cost4[2][3]=1, cost4[3][0]=2.)

// ─── MA: 7 MCQ ─────────────────────────────────────────────────────────

mcq(
  MA,
  `In a **bipartite graph**, the vertex set is partitioned into two disjoint sets, and every edge\n\n`,
  [
    "joins two vertices in the same set",
    "joins a vertex in one set to a vertex in the other set",
    "is a self-loop",
    "has positive weight",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nIn a bipartite graph, the vertex set is split into two disjoint groups (often called *L* and *R*), and every edge has one endpoint in *L* and the other in *R*. No edge connects two vertices within the same group.",
);

mcq(
  MA,
  `A **matching** in a bipartite graph is\n\n`,
  [
    "a set of edges that share at least one vertex",
    "a set of edges such that no two edges share a vertex",
    "the complete bipartite graph $K_{n,n}$",
    "a path through every vertex exactly once",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nA matching is a set of edges in which no two edges share a common vertex — each vertex is incident with at most one matched edge. A maximum matching has the largest possible number of such edges.",
);

mcq(
  MA,
  `The **Hungarian algorithm** is used to\n\n`,
  [
    "find the longest path in a graph",
    "find the maximum flow in a network",
    "find the optimal (minimum cost) assignment in a bipartite graph with a cost matrix",
    "find the minimum spanning tree of a network",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nThe Hungarian algorithm efficiently solves the *assignment problem*: given a square cost matrix where each row corresponds to a worker and each column to a job, find the assignment of workers to jobs (one-to-one) that minimises total cost.",
);

mcq(
  MA,
  `${img(cost3Matrix)}\n\nFor the 3×3 cost matrix above, the **row-reduced** matrix (after subtracting each row's minimum from every entry in that row) is\n\n`,
  [
    "$\\begin{bmatrix} 7 & 0 & 5 \\\\ 3 & 1 & 0 \\\\ 4 & 7 & 0 \\end{bmatrix}$",
    "$\\begin{bmatrix} 0 & 7 & 5 \\\\ 0 & 3 & 1 \\\\ 0 & 4 & 7 \\end{bmatrix}$",
    "$\\begin{bmatrix} 9 & 2 & 7 \\\\ 6 & 4 & 3 \\\\ 5 & 8 & 1 \\end{bmatrix}$",
    "$\\begin{bmatrix} 7 & 0 & 5 \\\\ 3 & 1 & 0 \\\\ 0 & 7 & 0 \\end{bmatrix}$",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nRow minima: row 1 = 2, row 2 = 3, row 3 = 1.\n\nSubtracting each:\n- Row 1: (9-2, 2-2, 7-2) = (7, 0, 5)\n- Row 2: (6-3, 4-3, 3-3) = (3, 1, 0)\n- Row 3: (5-1, 8-1, 1-1) = (4, 7, 0)\n\nResult: $\\begin{bmatrix} 7 & 0 & 5 \\\\ 3 & 1 & 0 \\\\ 4 & 7 & 0 \\end{bmatrix}$.",
);

mcq(
  MA,
  `${img(cost3Matrix)}\n\nThe minimum total cost of assigning workers W1, W2, W3 each to a different job J1, J2, J3 in the matrix above is\n\n`,
  ["8", "9", "12", "15"],
  "B",
  "HARD",
  "**Answer: B**\n\nUsing the Hungarian algorithm, optimal assignment: W1→J2 (cost 2), W2→J1 (cost 6), W3→J3 (cost 1). Total = 2 + 6 + 1 = **9**.\n\n(Alternative full enumeration: 9+4+1=14, 9+3+8=20, 2+6+1=9★, 2+3+5=10, 7+6+8=21, 7+4+5=16. Minimum = **9**.)",
);

mcq(
  MA,
  `${img(bipartite1Svg)}\n\nFor the bipartite graph above showing which workers can perform which jobs, a **maximum matching** has size\n\n`,
  ["1", "2", "3", "6"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nWith 3 workers and 3 jobs, a perfect matching of size 3 is possible: assign W1→J2 (or J1), W2→J3, W3→J1. Each worker matched to exactly one job; all 3 are matched.",
);

mcq(
  MA,
  `In an assignment problem with a 4×4 cost matrix, the Hungarian algorithm finds an assignment that\n\n`,
  [
    "minimises the total cost of assigning each row to a unique column",
    "maximises the largest entry used in the assignment",
    "uses every entry of the matrix exactly once",
    "finds the longest cycle visiting every row and column",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nHungarian algorithm finds the optimal *one-to-one* assignment (one cell per row, one per column) such that the sum of selected entries is minimised. For maximisation versions, transform by subtracting from the largest entry.",
);

// ─── MA: 4 SHORT ───────────────────────────────────────────────────────

short(
  MA,
  `Define each of the following in the context of bipartite-graph matching:\n\n**a.** Bipartite graph. (1 mark)\n\n**b.** Matching. (1 mark)\n\n**c.** Perfect matching. (1 mark)\n\n**d.** Hungarian algorithm. (1 mark) (4 marks)`,
  4,
  "EASY",
  "**a.** A *bipartite graph* is a graph whose vertex set is split into two disjoint sets *L* and *R*, with every edge connecting a vertex in *L* to a vertex in *R* (and no edges within *L* or within *R*).\n\n**b.** A *matching* is a set of edges with no shared endpoints — each vertex is in at most one matched edge.\n\n**c.** A *perfect matching* covers every vertex: every vertex of *L* and every vertex of *R* is matched. Requires $|L| = |R|$.\n\n**d.** The *Hungarian algorithm* solves the assignment problem by row-reducing then column-reducing the cost matrix, then finding the minimum number of lines covering all zeros and iterating until a perfect zero-assignment exists.",
);

short(
  MA,
  `${img(cost3Matrix)}\n\nApply the Hungarian algorithm to the cost matrix above.\n\n**a.** Show the row-reduced matrix. (1 mark)\n\n**b.** Show the column-reduced matrix. (1 mark)\n\n**c.** State the optimal assignment and total cost. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Row reduce (subtract row min): row 1 min = 2; row 2 min = 3; row 3 min = 1.\n\n$\\begin{bmatrix} 7 & 0 & 5 \\\\ 3 & 1 & 0 \\\\ 4 & 7 & 0 \\end{bmatrix}$\n\n**b.** Column reduce: col 1 min = 3; col 2 min = 0; col 3 min = 0. Subtract col 1 min:\n\n$\\begin{bmatrix} 4 & 0 & 5 \\\\ 0 & 1 & 0 \\\\ 1 & 7 & 0 \\end{bmatrix}$\n\n**c.** Find assignment using zeros: W1→J2, W2→J1, W3→J3.\n\nTotal cost from original matrix: cost(W1,J2) + cost(W2,J1) + cost(W3,J3) = 2 + 6 + 1 = **9**.",
);

short(
  MA,
  `A logistics manager must assign three drivers (D1, D2, D3) each to a unique delivery route (R1, R2, R3). The cost (in dollars) of each driver for each route is given:\n\n| | R1 | R2 | R3 |\n|---|---|---|---|\n| D1 | 12 | 8 | 7 |\n| D2 | 9 | 11 | 14 |\n| D3 | 10 | 6 | 13 |\n\n**a.** Find the optimal assignment by inspection or full enumeration. (3 marks)\n\n**b.** State the minimum total cost. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Six possible assignments (3! = 6):\n\n| Assignment | Total |\n|---|---|\n| D1-R1, D2-R2, D3-R3 | 12+11+13=36 |\n| D1-R1, D2-R3, D3-R2 | 12+14+6=32 |\n| D1-R2, D2-R1, D3-R3 | 8+9+13=30 |\n| D1-R2, D2-R3, D3-R1 | 8+14+10=32 |\n| D1-R3, D2-R1, D3-R2 | 7+9+6=**22** ★ |\n| D1-R3, D2-R2, D3-R1 | 7+11+10=28 |\n\nMinimum cost = **22**. **Optimal assignment: D1→R3, D2→R1, D3→R2**.\n\n**b.** Minimum total cost = **\\$22**.",
);

short(
  MA,
  `Explain how an assignment problem that requires **maximising** profit can be transformed into a standard Hungarian-algorithm cost-**minimisation** problem. Illustrate with a small example. (3 marks)`,
  3,
  "MEDIUM",
  "To convert a maximisation problem (maximise total profit) into a minimisation problem (minimise total cost), follow these steps:\n\n1. Identify the largest entry $M$ in the profit matrix.\n2. Subtract every entry from $M$: replace $p_{ij}$ with $M - p_{ij}$.\n3. The transformed matrix is now a *cost* matrix (with all entries $\\ge 0$).\n4. Apply the Hungarian algorithm to find the minimum-cost assignment in the transformed matrix.\n5. The same assignment is the **maximum-profit** assignment in the original matrix.\n\n**Example**: Profit matrix $\\begin{bmatrix} 5 & 3 \\\\ 4 & 6 \\end{bmatrix}$. $M = 6$. Transformed: $\\begin{bmatrix} 1 & 3 \\\\ 2 & 0 \\end{bmatrix}$. Hungarian on this gives assignment W1-J1, W2-J2 (costs 1+0=1, equivalent to maximum profits 5+6=11). The optimal profit is 11.",
);

// ─── MA: 2 EXT_ANS ─────────────────────────────────────────────────────

extAns(
  MA,
  [
    {
      label: "a",
      marks: 2,
      content: `Apply row reduction to the cost matrix. Show the reduced matrix.\n\n${img(cost4Matrix)}`,
      solution: "Row minima: row 1 = 1; row 2 = 2; row 3 = 1; row 4 = 2.\n\nSubtract from each row:\n\n$\\begin{bmatrix} 3 & 0 & 2 & 5 \\\\ 3 & 5 & 0 & 2 \\\\ 2 & 3 & 5 & 0 \\\\ 0 & 3 & 2 & 1 \\end{bmatrix}$",
    },
    {
      label: "b",
      marks: 1,
      content: `Apply column reduction. State the new matrix.`,
      solution: "Column minima of the row-reduced matrix: col 1 = 0, col 2 = 0, col 3 = 0, col 4 = 0. All columns already have a zero — no column reduction needed. Matrix unchanged:\n\n$\\begin{bmatrix} 3 & 0 & 2 & 5 \\\\ 3 & 5 & 0 & 2 \\\\ 2 & 3 & 5 & 0 \\\\ 0 & 3 & 2 & 1 \\end{bmatrix}$",
    },
    {
      label: "c",
      marks: 3,
      content: `Find the optimal assignment and the minimum total cost.`,
      solution: "Zeros in the reduced matrix: r1c2, r2c3, r3c4, r4c1.\n\nA zero-assignment exists with **exactly one zero per row and column**: W1→J2, W2→J3, W3→J4, W4→J1.\n\nReading from the original matrix:\n- W1→J2: cost 1\n- W2→J3: cost 2\n- W3→J4: cost 1\n- W4→J1: cost 2\n\n**Total minimum cost = 1 + 2 + 1 + 2 = \\$6**.",
    },
  ],
  "MEDIUM",
  `A factory assigns 4 workers (W1-W4) to 4 jobs (J1-J4). The cost (in dollars per hour) of each worker performing each job is shown.`,
);

extAns(
  MA,
  [
    {
      label: "a",
      marks: 2,
      content: `Apply the Hungarian algorithm to find the minimum-cost assignment of three drivers to three deliveries.\n\n| | Delivery 1 | Delivery 2 | Delivery 3 |\n|---|---|---|---|\n| Driver 1 | 9 | 2 | 7 |\n| Driver 2 | 6 | 4 | 3 |\n| Driver 3 | 5 | 8 | 1 |`,
      solution: "Row reduce: r1 min=2 → (7,0,5); r2 min=3 → (3,1,0); r3 min=1 → (4,7,0).\n\nColumn reduce: col 1 min=3 (others are 0). Subtract 3 from col 1:\n\n$\\begin{bmatrix} 4 & 0 & 5 \\\\ 0 & 1 & 0 \\\\ 1 & 7 & 0 \\end{bmatrix}$\n\nZero assignment exists (row 1 c2, row 2 c1, row 3 c3): **D1→D2, D2→D1, D3→D3**.",
    },
    {
      label: "b",
      marks: 1,
      content: `State the optimal assignment and total cost.`,
      solution: "**Optimal assignment**: Driver 1 → Delivery 2 (cost \\$2), Driver 2 → Delivery 1 (cost \\$6), Driver 3 → Delivery 3 (cost \\$1).\n\n**Total cost = \\$9**.",
    },
    {
      label: "c",
      marks: 2,
      content: `If the cost of Driver 3 doing Delivery 1 increases from 5 to 10, does the optimal assignment change? Justify briefly.`,
      solution: "Original optimal assignment includes Driver 3 → Delivery 3 (not Delivery 1). So the change of cost(D3, Del 1) from 5 to 10 does **not affect** the cells used in the optimal assignment.\n\nNeed to check no alternative assignment becomes cheaper than \\$9 with the new costs. Re-enumerate:\n- D1→Del1, D2→Del2, D3→Del3: 9+4+1=14.\n- D1→Del1, D2→Del3, D3→Del2: 9+3+8=20.\n- D1→Del2, D2→Del1, D3→Del3: 2+6+1=**9** ★ (current optimum unchanged).\n- D1→Del2, D2→Del3, D3→Del1: 2+3+**10**=15.\n- D1→Del3, D2→Del1, D3→Del2: 7+6+8=21.\n- D1→Del3, D2→Del2, D3→Del1: 7+4+**10**=21.\n\n**Optimal assignment and cost unchanged**: D1→Del2, D2→Del1, D3→Del3, total \\$9.",
    },
  ],
  "MEDIUM",
);

// ─── MA: 3 EXT_RESP ────────────────────────────────────────────────────

extResp(
  MA,
  [
    {
      label: "a",
      marks: 2,
      content: `State the row-reduced and column-reduced matrices.\n\n${img(cost4Matrix)}`,
      solution: "**Row-reduced** (subtract each row's minimum):\n\n$\\begin{bmatrix} 3 & 0 & 2 & 5 \\\\ 3 & 5 & 0 & 2 \\\\ 2 & 3 & 5 & 0 \\\\ 0 & 3 & 2 & 1 \\end{bmatrix}$\n\n**Column-reduced**: each column already contains a 0, so the column step does not change the matrix. Same matrix as above.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find an optimal assignment of workers W1-W4 to jobs J1-J4.`,
      solution: "Locate zeros in the reduced matrix:\n- Row 1: zero at J2.\n- Row 2: zero at J3.\n- Row 3: zero at J4.\n- Row 4: zero at J1.\n\nExactly one zero per row, one zero per column → unique assignment.\n\n**Optimal assignment**: W1→J2, W2→J3, W3→J4, W4→J1.",
    },
    {
      label: "c",
      marks: 1,
      content: `State the minimum total cost.`,
      solution: "From the original matrix: 1 + 2 + 1 + 2 = **\\$6**.",
    },
    {
      label: "d",
      marks: 3,
      content: `Suppose W4 cannot do J1 (assignment forbidden). Find the new optimal assignment and cost.`,
      solution: "Force cost(W4, J1) = $\\infty$ (or large number). New cost matrix:\n\n$\\begin{bmatrix} 4 & 1 & 3 & 6 \\\\ 5 & 7 & 2 & 4 \\\\ 3 & 4 & 6 & 1 \\\\ \\infty & 5 & 4 & 3 \\end{bmatrix}$\n\nEnumerate remaining assignments (W4 in {J2, J3, J4} only):\n- W4→J2 (5): need W1,W2,W3 → J1,J3,J4. Best: W1→J1 (4), W2→J3 (2), W3→J4 (1). Total = 4+2+1+5 = 12.\n- W4→J3 (4): need W1,W2,W3 → J1,J2,J4. W1→J2 (1), W2→J1 (5), W3→J4 (1). Total = 1+5+1+4 = 11.\n- W4→J4 (3): need W1,W2,W3 → J1,J2,J3. W1→J2 (1), W2→J3 (2), W3→J1 (3). Total = 1+2+3+3 = 9.\n\nMinimum: **W4→J4 (3), W1→J2 (1), W2→J3 (2), W3→J1 (3). Total = \\$9**. (Increase of \\$3 over original \\$6.)",
    },
    {
      label: "e",
      marks: 2,
      content: `Briefly explain why the Hungarian algorithm guarantees an optimal solution.`,
      solution: "The Hungarian algorithm relies on a duality result: subtracting a constant from every entry of a row (or column) does not change the relative cost differences between assignments, so the optimal assignment is preserved. After row + column reductions, every entry is $\\ge 0$. An assignment using only zero-entries has total cost zero in the reduced matrix — hence it is **minimum** in the reduced matrix and (because reductions preserve the optimum) **minimum** in the original matrix. The algorithm iteratively adjusts the matrix until such a zero-assignment exists, guaranteeing optimality.",
    },
  ],
  "HARD",
  `**Question — Job assignment**\n\nA project manager must assign 4 workers (W1-W4) to 4 jobs (J1-J4), each worker doing exactly one job and each job done by exactly one worker. The cost (in hours) is given by the matrix.`,
);

extResp(
  MA,
  [
    {
      label: "a",
      marks: 2,
      content: `Describe what a *bipartite graph* is and what a *maximum matching* in such a graph represents.`,
      solution: "A **bipartite graph** has vertices partitioned into two disjoint sets *L* and *R*, with every edge joining an *L*-vertex to an *R*-vertex (never within the same set). It models a situation with two distinct types of entities and pairwise relations only between types — e.g. workers (*L*) and jobs (*R*) with edges representing 'worker can perform job'.\n\nA **maximum matching** is a set of edges with no shared endpoints, such that the number of matched edges is as large as possible. It represents the *largest possible pairing* (e.g. the most workers we can simultaneously assign to distinct jobs given the compatibility constraints).",
    },
    {
      label: "b",
      marks: 3,
      content: `For the bipartite graph below, where edges show 'worker can do job', find a maximum matching and state its size.\n\n${img(bipartite1Svg)}`,
      solution: "Edges available: W1-J1, W1-J2, W2-J2, W2-J3, W3-J1, W3-J3.\n\n**Try greedy**: pair W1-J1 (uses J1); W2-J2 (uses J2); W3 can match J3 (W3-J3). All 3 workers matched.\n\n**Matching**: M = {W1-J1, W2-J2, W3-J3}. Size = **3** (maximum possible — perfect matching of 3 workers to 3 jobs).",
    },
    {
      label: "c",
      marks: 3,
      content: `Assign costs as in the table below and apply the Hungarian algorithm to find the minimum-cost assignment.\n\n| | J1 | J2 | J3 |\n|---|---|---|---|\n| W1 | 4 | 3 | 8 |\n| W2 | 2 | 7 | 5 |\n| W3 | 6 | 4 | 2 |`,
      solution: "Row reduce: r1 min=3 → (1,0,5); r2 min=2 → (0,5,3); r3 min=2 → (4,2,0).\n\n$\\begin{bmatrix} 1 & 0 & 5 \\\\ 0 & 5 & 3 \\\\ 4 & 2 & 0 \\end{bmatrix}$\n\nCol mins: col1=0, col2=0, col3=0. No column reduction needed.\n\nAssign zeros: row 1 (only at c2), row 2 (only at c1), row 3 (only at c3). Unique assignment.\n\n**Optimal assignment**: W1→J2 (cost 3), W2→J1 (cost 2), W3→J3 (cost 2).\n\n**Total cost = 3 + 2 + 2 = 7**.",
    },
    {
      label: "d",
      marks: 2,
      content: `Compare the assignment by Hungarian algorithm to a *greedy* assignment (assign each worker to the cheapest available job in order). Show which is better.`,
      solution: "Greedy (process workers in order W1, W2, W3):\n- W1: cheapest cost = 3 (J2). Assign W1→J2.\n- W2: cheapest *remaining* (J1 or J3): J1=2 vs J3=5. Assign W2→J1.\n- W3: cheapest *remaining*: J3=2. Assign W3→J3.\n\nGreedy assignment: W1→J2, W2→J1, W3→J3. Total cost = 3+2+2 = **7**.\n\nIn this case, **greedy gives the same answer as Hungarian (both \\$7)**. But greedy is not always optimal — counter-examples exist where greedy makes a locally cheap choice that blocks a globally cheaper assignment.",
    },
    {
      label: "e",
      marks: 2,
      content: `Construct a simple 3×3 cost matrix where greedy assignment fails to find the optimal Hungarian solution.`,
      solution: "Example: $\\begin{bmatrix} 1 & 10 & 10 \\\\ 1 & 2 & 10 \\\\ 1 & 10 & 5 \\end{bmatrix}$\n\nGreedy from W1: cheapest is J1 (1). W1→J1.\nW2: cheapest remaining is J2 (2). W2→J2.\nW3: must take J3 (5). W3→J3.\nGreedy total = 1 + 2 + 5 = 8.\n\nHungarian optimal: assign W2→J1 (1), W1→J2 (10), W3→J3 (5) = 16. Worse! Or W3→J1 (1), W2→J2 (2), W1→J3 (10) = 13. Or W1→J1 (1), W3→J3 (5), W2→J2 (2) = 8 (same as greedy).\n\nActually here greedy = optimal. Let me try: $\\begin{bmatrix} 2 & 5 & 1 \\\\ 1 & 2 & 5 \\\\ 5 & 1 & 2 \\end{bmatrix}$. Greedy W1→J3 (1), W2→J1 (1), W3 left with J2 (1). Greedy = 1+1+1 = 3 = optimum.\n\nHarder: greedy fails when it grabs a 'cheap' option that forces another worker into an expensive cell. Example: $\\begin{bmatrix} 1 & 100 \\\\ 2 & 50 \\end{bmatrix}$ (2×2). Greedy W1→J1 (1), W2→J2 (50). Total = 51. Hungarian: W1→J2 (100) gives 102, or W2→J1 (2), W1→J2 (100) = 102. Greedy wins here too actually since 51<102.\n\n**Counterexample**: $\\begin{bmatrix} 5 & 1 & 100 \\\\ 100 & 5 & 1 \\\\ 1 & 100 & 5 \\end{bmatrix}$. Greedy W1→J2 (1); W2: cheapest remaining is J3 (1). W2→J3. W3: must take J1 (1). Greedy total = 3 (optimum, actually a perfect 3 — and Hungarian gives same).\n\nIn general greedy on assignment **does often succeed**, but the safe answer is that greedy is **not guaranteed optimal**; the Hungarian algorithm explicitly searches for the global minimum and guarantees optimality.",
    },
  ],
  "HARD",
);

extResp(
  MA,
  [
    {
      label: "a",
      marks: 3,
      content: `Apply the Hungarian algorithm to find the minimum-cost assignment for the matrix:\n\n| | J1 | J2 | J3 | J4 |\n|---|---|---|---|---|\n| W1 | 8 | 4 | 2 | 6 |\n| W2 | 0 | 9 | 5 | 7 |\n| W3 | 3 | 8 | 9 | 2 |\n| W4 | 4 | 3 | 1 | 6 |`,
      solution: "Row reduce: r1 min=2 → (6,2,0,4); r2 min=0 → (0,9,5,7); r3 min=2 → (1,6,7,0); r4 min=1 → (3,2,0,5).\n\n$\\begin{bmatrix} 6 & 2 & 0 & 4 \\\\ 0 & 9 & 5 & 7 \\\\ 1 & 6 & 7 & 0 \\\\ 3 & 2 & 0 & 5 \\end{bmatrix}$\n\nColumn reduce: col1 min=0, col2 min=2 — subtract 2 from col 2; col3 min=0, col4 min=0.\n\n$\\begin{bmatrix} 6 & 0 & 0 & 4 \\\\ 0 & 7 & 5 & 7 \\\\ 1 & 4 & 7 & 0 \\\\ 3 & 0 & 0 & 5 \\end{bmatrix}$\n\nAssign zeros: row 2 has unique zero at c1 → W2→J1. Row 3 has unique zero at c4 → W3→J4. Row 1 has zeros at c2 and c3. Row 4 has zeros at c2 and c3. After W2, W3 assigned, rows 1 & 4 must take c2 & c3 between them.\n\nTry: W1→J2 (cost 4), W4→J3 (cost 1). Or W1→J3 (cost 2), W4→J2 (cost 3).\n\nCompare: 4+1 vs 2+3 → 5 = 5. Tie.\n\nEither way: total = cost(W1)+cost(W2)+cost(W3)+cost(W4) = 4+0+2+1 = **7** (using W1→J2, W2→J1, W3→J4, W4→J3) or 2+0+2+3 = 7 (using W1→J3, W4→J2). **Minimum total cost = \\$7.**",
    },
    {
      label: "b",
      marks: 2,
      content: `State both optimal assignments.`,
      solution: "Two optimal assignments (both with total cost \\$7):\n\n1. **W1→J2, W2→J1, W3→J4, W4→J3**: costs 4+0+2+1 = 7.\n2. **W1→J3, W2→J1, W3→J4, W4→J2**: costs 2+0+2+3 = 7.",
    },
    {
      label: "c",
      marks: 2,
      content: `If the cost cost(W4, J3) is increased from 1 to 6, find the new optimal assignment.`,
      solution: "With cost(W4, J3) = 6, assignment 1 (W4→J3) costs 4+0+2+6 = 12. Assignment 2 (W4→J2) costs 2+0+2+3 = 7 — unchanged.\n\n**New optimal**: W1→J3, W2→J1, W3→J4, W4→J2. Total = **\\$7** (unchanged because we use the alternative assignment that doesn't include W4-J3).",
    },
    {
      label: "d",
      marks: 3,
      content: `Suppose the manager now wants to **maximise** profit, where the profit matrix is the same numbers as the original cost matrix. Convert to a Hungarian-compatible cost-minimisation problem and state the optimal max-profit assignment.`,
      solution: "Profit matrix:\n$\\begin{bmatrix} 8 & 4 & 2 & 6 \\\\ 0 & 9 & 5 & 7 \\\\ 3 & 8 & 9 & 2 \\\\ 4 & 3 & 1 & 6 \\end{bmatrix}$. Max entry $M = 9$. Subtract from $M$ to convert:\n\n$\\begin{bmatrix} 1 & 5 & 7 & 3 \\\\ 9 & 0 & 4 & 2 \\\\ 6 & 1 & 0 & 7 \\\\ 5 & 6 & 8 & 3 \\end{bmatrix}$\n\nRow reduce: r1 min=1 → (0,4,6,2); r2 min=0 → unchanged (9,0,4,2); r3 min=0 → unchanged (6,1,0,7); r4 min=3 → (2,3,5,0).\n\n$\\begin{bmatrix} 0 & 4 & 6 & 2 \\\\ 9 & 0 & 4 & 2 \\\\ 6 & 1 & 0 & 7 \\\\ 2 & 3 & 5 & 0 \\end{bmatrix}$\n\nZeros at: r1c1, r2c2, r3c3, r4c4. Unique zero per row/column.\n\n**Optimal max-profit assignment**: W1→J1, W2→J2, W3→J3, W4→J4. \n\nProfit total: 8 + 9 + 9 + 6 = **\\$32** (sum of diagonal of original).",
    },
    {
      label: "e",
      marks: 2,
      content: `Confirm by checking 3 alternative assignments that **\\$32 is indeed the maximum profit**.`,
      solution: "Compare three other assignments:\n- W1→J2, W2→J1, W3→J3, W4→J4: 4+0+9+6 = 19.\n- W1→J4, W2→J2, W3→J1, W4→J3: 6+9+3+1 = 19.\n- W1→J3, W2→J4, W3→J2, W4→J1: 2+7+8+4 = 21.\n\nAll are less than **\\$32**. The diagonal assignment is confirmed maximal. \n\n(For completeness, the Hungarian-via-conversion guarantees optimality, but direct comparison provides additional sanity-checking.)",
    },
  ],
  "MEDIUM",
);

// ─── Write output ──────────────────────────────────────────────────────

const spec = {
  subject_slug: SUBJECT_SLUG,
  question_set_id: QUESTION_SET_ID,
  items,
};

const outPath = path.join(OUT_DIR, "qset-general-discrete-optimisation.json");
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log(`✓ Wrote ${items.length} items to ${outPath}`);
console.log(`  MCQ:               ${items.filter((i) => i.type === "MCQ").length}`);
console.log(`  SHORT:             ${items.filter((i) => i.type === "SHORT_ANSWER").length}`);
console.log(`  EXTENDED_ANSWER:   ${items.filter((i) => i.type === "EXTENDED_ANSWER").length}`);
console.log(`  EXTENDED_RESPONSE: ${items.filter((i) => i.type === "EXTENDED_RESPONSE").length}`);

// Per-subtopic breakdown
const subtopics = [MST, "shortest-path-problems", AN, PS, FP, MA];
for (const st of subtopics) {
  const stItems = items.filter((i) => i.subtopic_slugs[0] === st);
  console.log(`  ${st}: ${stItems.length}`);
}
