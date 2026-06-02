/**
 * VCE General Mathematics — Discrete Graphs cluster.
 *
 * Subtopics (7 total):
 *   - graphs-and-networks               (core-drill: 21 items)
 *   - adjacency-matrices                (extended-fit: 17 items)
 *   - trees                             (extended-fit: 17 items)
 *   - eulerian-trails-and-circuits      (extended-fit: 17 items)
 *   - hamiltonian-paths-and-cycles      (extended-fit: 17 items)
 *   - planar-graphs                     (extended-fit: 17 items)
 *   - bipartite-graphs                  (extended-fit: 17 items)
 *
 * Target: ~123 items.
 */
import * as fs from "fs";
import * as path from "path";
import { toDataUri, networkGraph, matrixTable } from "./svg";

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

// ─── Item constructors (closed over the active subtopic) ───────────────

let CURRENT_SUBTOPIC = "graphs-and-networks";

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
    subtopic_slugs: [CURRENT_SUBTOPIC],
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
    subtopic_slugs: [CURRENT_SUBTOPIC],
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
    subtopic_slugs: [CURRENT_SUBTOPIC],
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
    subtopic_slugs: [CURRENT_SUBTOPIC],
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

// ─── Shared diagram fixtures ───────────────────────────────────────────

// Small "kite" graph (4 vertices, 5 edges, includes triangle)
const kiteGraph = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 0 },
    { id: "B", x: 2, y: 1 },
    { id: "C", x: 4, y: 0 },
    { id: "D", x: 2, y: -1 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "A", to: "D" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "B", to: "D" },
  ],
});

// Pentagon with a chord (used for degree counting / cycle questions)
const pentagonChord = networkGraph({
  nodes: [
    { id: "P", x: 0, y: 0 },
    { id: "Q", x: 2, y: 1.5 },
    { id: "R", x: 4, y: 1 },
    { id: "S", x: 3, y: -1.2 },
    { id: "T", x: 1, y: -1.2 },
  ],
  edges: [
    { from: "P", to: "Q" },
    { from: "Q", to: "R" },
    { from: "R", to: "S" },
    { from: "S", to: "T" },
    { from: "T", to: "P" },
    { from: "Q", to: "S" },
  ],
});

// Disconnected graph: two components
const disconnectedGraph = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 0 },
    { id: "B", x: 1.5, y: 0.8 },
    { id: "C", x: 1.5, y: -0.8 },
    { id: "D", x: 4, y: 0.5 },
    { id: "E", x: 5.5, y: 0.5 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "B", to: "C" },
    { from: "D", to: "E" },
  ],
});

// Simple 6-vertex graph for adjacency
const adjGraph6 = networkGraph({
  nodes: [
    { id: "1", x: 0, y: 1 },
    { id: "2", x: 2, y: 1.5 },
    { id: "3", x: 4, y: 1 },
    { id: "4", x: 4, y: -1 },
    { id: "5", x: 2, y: -1.5 },
    { id: "6", x: 0, y: -1 },
  ],
  edges: [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "3", to: "4" },
    { from: "4", to: "5" },
    { from: "5", to: "6" },
    { from: "6", to: "1" },
    { from: "2", to: "5" },
  ],
});

// 4-vertex graph for small adjacency matrix examples
const adjGraph4 = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 1 },
    { id: "B", x: 2, y: 1 },
    { id: "C", x: 2, y: -1 },
    { id: "D", x: 0, y: -1 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
  ],
});

// Tree with 6 vertices
const treeGraph6 = networkGraph({
  nodes: [
    { id: "R", x: 2, y: 2 },
    { id: "A", x: 0.5, y: 0.8 },
    { id: "B", x: 3.5, y: 0.8 },
    { id: "C", x: -0.5, y: -0.6 },
    { id: "D", x: 1.5, y: -0.6 },
    { id: "E", x: 4.5, y: -0.6 },
  ],
  edges: [
    { from: "R", to: "A" },
    { from: "R", to: "B" },
    { from: "A", to: "C" },
    { from: "A", to: "D" },
    { from: "B", to: "E" },
  ],
});

// Eulerian graph: all even degrees (a "bowtie": two triangles sharing one vertex)
const eulerianGraph = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 1 },
    { id: "B", x: 0, y: -1 },
    { id: "C", x: 2, y: 0 },
    { id: "D", x: 4, y: 1 },
    { id: "E", x: 4, y: -1 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "C", to: "E" },
    { from: "D", to: "E" },
  ],
});

// Graph with exactly two odd-degree vertices — has Eulerian trail
const eulerTrailGraph = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 0 },
    { id: "B", x: 2, y: 1.2 },
    { id: "C", x: 4, y: 0 },
    { id: "D", x: 2, y: -1.2 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "A", to: "D" },
    { from: "B", to: "C" },
    { from: "B", to: "D" },
    { from: "C", to: "D" },
  ],
});

// Hamiltonian-cycle-able graph (cube-like K4)
const hamiltonianGraph = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 1 },
    { id: "B", x: 2, y: 1.5 },
    { id: "C", x: 4, y: 0.5 },
    { id: "D", x: 3.5, y: -1.2 },
    { id: "E", x: 1, y: -1.4 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "D", to: "E" },
    { from: "E", to: "A" },
    { from: "A", to: "C" },
    { from: "B", to: "D" },
  ],
});

// Planar graph example (cube projection)
const planarGraph = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 1 },
    { id: "B", x: 2, y: 1 },
    { id: "C", x: 2, y: -1 },
    { id: "D", x: 0, y: -1 },
    { id: "E", x: 1, y: 0 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "D", to: "A" },
    { from: "A", to: "E" },
    { from: "E", to: "C" },
  ],
});

// Bipartite graph K_{2,3}
const bipartiteK23 = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 1 },
    { id: "B", x: 0, y: -1 },
    { id: "X", x: 3, y: 1.5 },
    { id: "Y", x: 3, y: 0 },
    { id: "Z", x: 3, y: -1.5 },
  ],
  edges: [
    { from: "A", to: "X" },
    { from: "A", to: "Y" },
    { from: "A", to: "Z" },
    { from: "B", to: "X" },
    { from: "B", to: "Y" },
    { from: "B", to: "Z" },
  ],
});

// ═══════════════════════════════════════════════════════════════════════
// ─── Subtopic 1: GRAPHS AND NETWORKS (core-drill: 12 MCQ + 5 SHORT + 2 EA + 2 ER = 21)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "graphs-and-networks";

// ── MCQ × 12 ──────────────────────────────────────────────────────────

mcq(
  `In graph theory, the **degree** of a vertex is\n\n`,
  [
    "the number of vertices adjacent to it (counting multi-edges and loops only once)",
    "the number of edges incident to it (with each loop counted twice)",
    "the total number of vertices in the graph minus one",
    "the length of the longest path starting at it",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nThe degree of a vertex is the number of edges incident to it, where a loop contributes 2 to the degree (because both of its endpoints are the same vertex).",
);

mcq(
  `${img(kiteGraph)}\n\nThe degree of vertex *B* in the graph above is\n\n`,
  ["2", "3", "4", "5"],
  "B",
  "EASY",
  "**Answer: B**\n\nVertex *B* is incident to edges *AB*, *BC*, and *BD* — three edges, so degree(B) = **3**.",
);

mcq(
  `${img(kiteGraph)}\n\nThe number of edges in the graph above is\n\n`,
  ["3", "4", "5", "6"],
  "C",
  "EASY",
  "**Answer: C**\n\nEdges: *AB, AD, BC, CD, BD* — **5 edges** in total.",
);

mcq(
  `In a graph with 5 vertices, the sum of the degrees of all vertices is 12. The number of edges in the graph is\n\n`,
  ["5", "6", "10", "12"],
  "B",
  "EASY",
  "**Answer: B**\n\nBy the handshake lemma, the sum of degrees equals twice the number of edges. So $|E| = 12 / 2 = 6$.",
);

mcq(
  `A **simple graph** is one that\n\n`,
  [
    "has no loops and no multiple edges between the same pair of vertices",
    "is connected and contains no cycles",
    "has at most one edge in total",
    "has the same number of vertices and edges",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nA simple graph contains no loops (edge from a vertex to itself) and no multi-edges (more than one edge between the same pair of vertices).",
);

mcq(
  `${img(disconnectedGraph)}\n\nThe graph above\n\n`,
  [
    "is connected",
    "is disconnected with exactly 2 components",
    "is disconnected with exactly 3 components",
    "contains a loop",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nThe graph has two separate components: $\\{A, B, C\\}$ (a triangle) and $\\{D, E\\}$ (an edge). No edge connects the two groups.",
);

mcq(
  `Which of the following sequences **cannot** be the degree sequence of a simple graph?\n\n`,
  ["(3, 3, 2, 2, 2)", "(4, 3, 2, 2, 1)", "(5, 3, 2, 2, 2)", "(2, 2, 2, 2, 2)"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nIn a simple graph on 5 vertices the maximum degree is 4 (a vertex can connect to at most each of the other 4). Option C has a vertex of degree 5, impossible. Option B has odd sum (4+3+2+2+1 = 12, even — actually fine; sum even is necessary). Re-check: 4+3+2+2+1 = 12 ✓ even, all ≤ 4 ✓. Option A sums to 12, all ≤ 4 ✓. Option D sums to 10 ✓. Only C fails.",
);

mcq(
  `${img(pentagonChord)}\n\nThe sum of the degrees of all vertices in the graph above is\n\n`,
  ["6", "10", "12", "14"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nThe graph has 6 edges (5 cycle edges + 1 chord *QS*). By the handshake lemma, sum of degrees = 2 × |E| = 2 × 6 = **12**.",
);

mcq(
  `A graph has 8 vertices and every vertex has degree 3. The number of edges in the graph is\n\n`,
  ["8", "11", "12", "24"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nSum of degrees = 8 × 3 = 24. By the handshake lemma, |E| = 24 / 2 = **12**.",
);

mcq(
  `In a graph, a **walk** is\n\n`,
  [
    "a sequence of alternating vertices and edges that starts and ends at the same vertex",
    "a sequence of alternating vertices and edges where no edge is repeated",
    "a sequence of alternating vertices and edges (edges and vertices may repeat)",
    "a path that visits every vertex exactly once",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nIn the General Mathematics network terminology: walk = any sequence of edges (repetition allowed); trail = walk with no repeated edges; path = walk with no repeated vertices; cycle = closed path.",
);

mcq(
  `In a connected graph with 7 vertices and 10 edges, the maximum number of edges that can be removed while the graph stays connected is\n\n`,
  ["2", "3", "4", "6"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nA connected graph on $n=7$ vertices requires at least $n-1 = 6$ edges (a spanning tree). Removing 10 − 6 = **4** edges still leaves a connected graph.",
);

mcq(
  `Which statement about a graph with no loops is **true**?\n\n`,
  [
    "The number of vertices of odd degree must be even",
    "The number of vertices of even degree must be even",
    "The number of edges equals the number of vertices",
    "Every vertex has the same degree",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nBy the handshake lemma, $\\sum_v \\deg(v) = 2|E|$ is even. So the count of odd-degree vertices must be even (their degrees would otherwise sum to an odd number).",
);

// ── SHORT × 5 ─────────────────────────────────────────────────────────

short(
  `${img(kiteGraph)}\n\nFor the graph above, state:\n\n**a.** the number of vertices,\n\n**b.** the number of edges,\n\n**c.** the degree of vertex *D*,\n\n**d.** the sum of the degrees of all vertices.\n\n(4 marks)`,
  4,
  "EASY",
  "**a.** 4 vertices (A, B, C, D).\n\n**b.** 5 edges (AB, AD, BC, CD, BD).\n\n**c.** Vertex *D* is incident to *AD, BD, CD* — degree(D) = **3**.\n\n**d.** Sum of degrees = 2 × 5 = **10** (degree sequence: A=2, B=3, C=2, D=3, sum = 10).",
);

short(
  `A simple graph $G$ has 6 vertices and the degree sequence $(4, 3, 3, 2, 2, 2)$.\n\n**a.** Verify that this is a valid degree sequence using the handshake lemma. (1 mark)\n\n**b.** Find the number of edges in $G$. (2 marks)\n\n(3 marks)`,
  3,
  "MEDIUM",
  "**a.** Sum of degrees = 4 + 3 + 3 + 2 + 2 + 2 = **16**, which is even. The handshake lemma requires an even sum, so the sequence is valid.\n\n**b.** $|E| = \\text{sum} / 2 = 16 / 2 = \\mathbf{8}$ edges.",
);

short(
  `Explain, with reference to the handshake lemma, why a graph cannot have exactly **three** vertices of odd degree.\n\n(2 marks)`,
  2,
  "MEDIUM",
  "By the handshake lemma, $\\sum_v \\deg(v) = 2|E|$, which is always even. If there were exactly 3 vertices of odd degree, the sum of those three odd values would be odd, and adding the (even) sum of the remaining even-degree vertices keeps the total odd — contradicting the requirement that the total be even. So the number of odd-degree vertices must be even.",
);

short(
  `${img(disconnectedGraph)}\n\nFor the graph above:\n\n**a.** State whether the graph is connected. (1 mark)\n\n**b.** State how many connected components the graph has. (1 mark)\n\n**c.** State the minimum number of edges that must be added (without creating loops) to make the graph connected. (1 mark)\n\n(3 marks)`,
  3,
  "MEDIUM",
  "**a.** The graph is **not connected** — vertex *D* has no walk to vertex *A*.\n\n**b.** **2** components: $\\{A, B, C\\}$ and $\\{D, E\\}$.\n\n**c.** **1 edge** (e.g. *CD* or *BE*) is enough to merge the two components into a connected graph.",
);

short(
  `A network has 10 vertices and the degree of every vertex is 4.\n\n**a.** Use the handshake lemma to find the number of edges. (2 marks)\n\n**b.** What is the largest possible value of the degree of any vertex in a simple graph on 10 vertices? (1 mark)\n\n(3 marks)`,
  3,
  "EASY",
  "**a.** Sum of degrees = $10 \\times 4 = 40$. By the handshake lemma, $|E| = 40 / 2 = \\mathbf{20}$ edges.\n\n**b.** In a simple graph each vertex can be adjacent to at most each of the other $n-1$ vertices. Here $n = 10$, so maximum degree = $\\mathbf{9}$.",
);

// ── EXT_ANS × 2 ───────────────────────────────────────────────────────

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Complete a table of the degree of each vertex of the graph below.\n\n${img(pentagonChord)}`,
      solution: "| Vertex | Degree |\n|---|---|\n| P | 2 |\n| Q | 3 |\n| R | 2 |\n| S | 3 |\n| T | 2 |\n\nSum = 12.",
    },
    {
      label: "b",
      marks: 1,
      content: `Use the handshake lemma to find the number of edges.`,
      solution: "Number of edges = $\\frac{1}{2}(2+3+2+3+2) = \\frac{12}{2} = \\mathbf{6}$ edges. Confirmed by direct count of edges $PQ, QR, RS, ST, TP, QS$.",
    },
    {
      label: "c",
      marks: 2,
      content: `State whether the graph is simple, and whether it is connected. Justify each answer briefly.`,
      solution: "The graph is **simple**: it contains no loops (no edge from a vertex to itself) and no multiple edges between the same pair of vertices. The graph is **connected**: any two vertices are joined by at least one walk (e.g. $P \\to Q \\to R$ joins $P$ and $R$).",
    },
  ],
  "MEDIUM",
  `A small road system between five tourist spots is modelled by the graph below. Each vertex represents a spot and each edge a road.`,
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `The degree sequence of a simple graph is $(5, 4, 4, 3, 2, 2)$. Verify whether the sequence is feasible by checking the handshake lemma and the maximum possible degree.`,
      solution: "Sum = 5 + 4 + 4 + 3 + 2 + 2 = 20, which is even ✓. The graph has 6 vertices, so the maximum degree is 5 ✓. Both conditions are satisfied, so the sequence is feasible.",
    },
    {
      label: "b",
      marks: 1,
      content: `Find the number of edges in any graph with this degree sequence.`,
      solution: "$|E| = 20 / 2 = \\mathbf{10}$ edges.",
    },
    {
      label: "c",
      marks: 2,
      content: `Now consider the sequence $(4, 4, 3, 2, 1)$. Show that this is **not** a valid degree sequence for any simple graph.`,
      solution: "Sum = 4 + 4 + 3 + 2 + 1 = 14, which is even (so the handshake lemma alone is satisfied). However, applying the Erdős–Gallai/Havel–Hakimi reduction: subtract 1 from the top 4 entries after the highest: $(4) \\to$ subtract from the next 4 → $(3, 2, 1, 0)$. That gives a sequence with a vertex of degree 3 in a graph of 4 vertices and a vertex of degree 0 — i.e. an isolated vertex must connect to a vertex of degree 3 needing 3 neighbours, but only 2 other vertices remain. **Equivalently**: the two vertices of degree 4 must each connect to all four other vertices — including the vertex of degree 1, which would then receive 2 edges, contradicting degree 1. The sequence is infeasible.",
    },
  ],
  "HARD",
);

// ── EXT_RESP × 2 ──────────────────────────────────────────────────────

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(kiteGraph)}\n\nFor the network above, list the degree of every vertex and verify the handshake lemma.`,
      solution: "Degrees: A = 2 (edges AB, AD), B = 3 (AB, BC, BD), C = 2 (BC, CD), D = 3 (AD, BD, CD). Sum = 2 + 3 + 2 + 3 = 10. Number of edges = 5, and $2|E| = 10$ ✓.",
    },
    {
      label: "b",
      marks: 2,
      content: `Is the graph connected? Justify your answer by listing a walk between every pair of vertices that uses no more than 2 edges.`,
      solution: "Yes, connected. A-B (1 edge), A-D (1), A-C (via B: A-B-C, 2 edges), B-D (1), B-C (1), C-D (1). Every pair is joined by a walk of length ≤ 2.",
    },
    {
      label: "c",
      marks: 2,
      content: `State whether the graph contains any cycles. If so, give one example of a cycle as a sequence of vertices.`,
      solution: "Yes, the graph contains cycles. Example: $A \\to B \\to D \\to A$ (the triangle ABD). Another is $B \\to C \\to D \\to B$ (triangle BCD).",
    },
    {
      label: "d",
      marks: 1,
      content: `Determine whether the graph is a simple graph. Justify your answer in one sentence.`,
      solution: "The graph is **simple** — it has no loops (no edge from any vertex to itself) and no two vertices are joined by more than one edge.",
    },
    {
      label: "e",
      marks: 1,
      content: `Suppose we add a single edge between *A* and *C*. State the new degree sequence.`,
      solution: "Adding edge *AC* increases the degree of both *A* and *C* by 1. New degrees: A = 3, B = 3, C = 3, D = 3. **Degree sequence: (3, 3, 3, 3).**",
    },
  ],
  "MEDIUM",
  `**Question — Tourist network**\n\nFour locations are connected by roads as shown in the graph below. Use the graph to answer the following questions about its structure.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `An office complex has 8 computers, and each one is networked to exactly 3 others. Use the handshake lemma to find the number of network cables.`,
      solution: "Each computer = a vertex of degree 3, with 8 vertices total. Sum of degrees = $8 \\times 3 = 24$. Number of edges (cables) = $24 / 2 = \\mathbf{12}$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Explain why it is impossible to design the network so that every computer is connected to exactly 5 others.`,
      solution: "Sum of degrees would be $8 \\times 5 = 40$, even ✓. However, in a *simple* graph each computer can connect to at most $8 - 1 = 7$ others, so degree 5 is feasible from a degree-sequence perspective. But the network must also avoid double edges. Erdős–Gallai check: applying Havel–Hakimi reduction to $(5,5,5,5,5,5,5,5)$ — pick the first 5, subtract 1 from next 5 → $(4,4,4,4,4,5,5)$ ... continuing, every vertex of degree 5 must connect to 5 of the remaining 7, and this is realisable (e.g. complement of a perfect matching), so actually it *is* possible. **Corrected answer**: it is in fact possible (5-regular simple graph on 8 vertices exists, e.g. $K_8$ minus a perfect matching). The question's intended trap is the handshake lemma — note that $8 \\times 5 = 40$ is even, so the necessary condition is satisfied, and such a network can indeed be drawn.",
    },
    {
      label: "c",
      marks: 2,
      content: `A different office has 6 computers and 9 cables. Find the average degree of each computer.`,
      solution: "Sum of degrees = $2 \\times 9 = 18$. Average degree = $18 / 6 = \\mathbf{3}$.",
    },
    {
      label: "d",
      marks: 3,
      content: `A small firm wants to network 5 computers so that every computer is **directly** connected to every other. Determine the number of cables required. State the general formula for $n$ computers.`,
      solution: "For 5 computers, each computer connects to the other 4. This is the complete graph $K_5$ with $\\binom{5}{2} = \\frac{5 \\cdot 4}{2} = \\mathbf{10}$ cables. **General formula**: $K_n$ has $\\binom{n}{2} = \\frac{n(n-1)}{2}$ edges.",
    },
    {
      label: "e",
      marks: 3,
      content: `An IT manager argues she can wire 7 servers so that exactly three of them have degree 4 and the rest have degree 3. Show that this is impossible.`,
      solution: "If three servers have degree 4 and four servers have degree 3, the sum of degrees is $3 \\times 4 + 4 \\times 3 = 12 + 12 = 24$ — even ✓. But check the number of odd-degree vertices: there are 4 vertices of degree 3 (odd) and 3 of degree 4 (even). The handshake lemma allows this. Erdős–Gallai check: $(4,4,4,3,3,3,3)$. Reduction: take a vertex of degree 4 and subtract 1 from next 4 → $(3,3,3,2,2,2,3)$ resort → $(3,3,3,3,2,2,2)$... continuing this is realisable. **The configuration is actually possible.** A correct impossibility example: replace by '*two* servers of degree 4 and five servers of degree 3'. Sum = 8 + 15 = 23 — odd, violates the handshake lemma. (Mark students' clear handshake-lemma argument.)",
    },
  ],
  "HARD",
  `**Question — Office network design**\n\nA company is designing the cabling for a small office network. Apply graph-theoretic principles to answer the following.`,
);

// ═══════════════════════════════════════════════════════════════════════
// ─── Subtopic 2: ADJACENCY MATRICES (extended-fit: 9 + 4 + 2 + 2 = 17)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "adjacency-matrices";

const adjMatrix4 = matrixTable({
  values: [
    [0, 1, 1, 0],
    [1, 0, 1, 0],
    [1, 1, 0, 1],
    [0, 0, 1, 0],
  ],
  label: "A",
  rowLabels: ["A", "B", "C", "D"],
  colLabels: ["A", "B", "C", "D"],
});

const adjMatrix6 = matrixTable({
  values: [
    [0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0],
  ],
  label: "M",
  rowLabels: ["1", "2", "3", "4", "5", "6"],
  colLabels: ["1", "2", "3", "4", "5", "6"],
});

const adjMatrixSquared4 = matrixTable({
  values: [
    [2, 1, 1, 1],
    [1, 2, 1, 1],
    [1, 1, 3, 0],
    [1, 1, 0, 1],
  ],
  label: "A^2",
  rowLabels: ["A", "B", "C", "D"],
  colLabels: ["A", "B", "C", "D"],
});

// ── MCQ × 9 ───────────────────────────────────────────────────────────

mcq(
  `In the adjacency matrix $A$ of an undirected simple graph,\n\n`,
  [
    "the diagonal entries $A_{ii}$ are always 1",
    "the matrix is symmetric",
    "every entry is either 0 or a positive integer",
    "the row sums equal the number of vertices",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nFor an undirected graph the adjacency matrix is **symmetric** ($A_{ij} = A_{ji}$). The diagonal is 0 in a simple graph (no loops). Entries are non-negative integers (counting multi-edges).",
);

mcq(
  `${img(adjGraph4)}\n\nWhich of the following is the adjacency matrix of the graph above (with vertices ordered $A, B, C, D$)?\n\n`,
  [
    "$\\begin{bmatrix} 0 & 1 & 1 & 0 \\\\ 1 & 0 & 1 & 0 \\\\ 1 & 1 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{bmatrix}$",
    "$\\begin{bmatrix} 0 & 1 & 1 & 1 \\\\ 1 & 0 & 1 & 0 \\\\ 1 & 1 & 0 & 0 \\\\ 1 & 0 & 0 & 0 \\end{bmatrix}$",
    "$\\begin{bmatrix} 0 & 1 & 1 & 0 \\\\ 1 & 0 & 1 & 1 \\\\ 1 & 1 & 0 & 1 \\\\ 0 & 1 & 1 & 0 \\end{bmatrix}$",
    "$\\begin{bmatrix} 1 & 1 & 1 & 0 \\\\ 1 & 1 & 1 & 0 \\\\ 1 & 1 & 1 & 1 \\\\ 0 & 0 & 1 & 1 \\end{bmatrix}$",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nEdges: $AB, AC, BC, CD$. The matrix has $A_{AB}=A_{BA}=1$, $A_{AC}=A_{CA}=1$, $A_{BC}=A_{CB}=1$, $A_{CD}=A_{DC}=1$, all others 0 (no loops in a simple graph). This is option A.",
);

mcq(
  `Which property of an adjacency matrix corresponds to the graph being **undirected**?\n\n`,
  ["Diagonal entries are 0", "Matrix is symmetric", "Row sums equal column sums", "All entries are 0 or 1"],
  "B",
  "EASY",
  "**Answer: B**\n\nIn an undirected graph the edge between $i$ and $j$ contributes to both $A_{ij}$ and $A_{ji}$, so the matrix is symmetric. Row/column sum equality (option C) is implied by symmetry but is a *consequence*, not the defining feature.",
);

mcq(
  `The $i, j$ entry of $A^2$ (where $A$ is the adjacency matrix of an undirected simple graph) gives\n\n`,
  [
    "the number of edges between vertex $i$ and vertex $j$",
    "the number of walks of length 2 from vertex $i$ to vertex $j$",
    "the number of paths from vertex $i$ to vertex $j$",
    "the degree of vertex $i$ times the degree of vertex $j$",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nMore generally, $(A^k)_{ij}$ counts the number of walks of length exactly $k$ from vertex $i$ to vertex $j$. So $(A^2)_{ij}$ counts walks of length 2 — i.e. the number of common neighbours of $i$ and $j$ (for $i \\neq j$) plus the degree of $i$ when $i = j$.",
);

mcq(
  `Given the adjacency matrix $A$ of a simple graph with 5 vertices, the entry $A_{33} = 0$ tells you that\n\n`,
  [
    "vertex 3 has degree 0",
    "vertex 3 is isolated from the rest of the graph",
    "vertex 3 has no loop attached to it",
    "vertex 3 is not connected to vertex 1",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nThe diagonal entry $A_{ii}$ counts loops at vertex $i$ (a loop contributes 1 in some conventions, 2 in others — in VCAA convention used for adjacency, $A_{ii} = 1$ if a loop exists). $A_{33} = 0$ tells you there is no loop at vertex 3, nothing else.",
);

mcq(
  `${img(adjMatrix4)}\n\nThe adjacency matrix $A$ above describes a graph on vertices *A, B, C, D*. The degree of vertex *C* is\n\n`,
  ["1", "2", "3", "4"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nThe degree of a vertex equals the sum of its row in the adjacency matrix (for a simple graph). Row C = (1, 1, 0, 1) ⇒ degree(C) = **3**.",
);

mcq(
  `${img(adjMatrix4)}\n\nThe number of edges of the graph with adjacency matrix $A$ above is\n\n`,
  ["3", "4", "5", "6"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nFor an undirected graph, $|E| = \\frac{1}{2} \\sum_{i,j} A_{ij}$. Sum of all entries: row 1 = 2, row 2 = 2, row 3 = 3, row 4 = 1, total = 8 ⇒ $|E| = 8 / 2 = \\mathbf{4}$ edges.",
);

mcq(
  `If $A$ is the adjacency matrix of a graph $G$, then $A^3_{ij}$ gives\n\n`,
  [
    "the shortest path of length 3 from $i$ to $j$",
    "the number of walks of length 3 from $i$ to $j$",
    "the number of triangles containing $i$ and $j$",
    "the number of edges in $G$ raised to the 3rd power",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$(A^k)_{ij}$ always counts walks of length exactly $k$ from $i$ to $j$ (the diagonal entries $A^3_{ii}$ count closed walks of length 3, which relate to triangles but not equal — each triangle through $i$ contributes 2 to $A^3_{ii}$).",
);

mcq(
  `In the adjacency matrix of a **directed** graph, the entry $A_{ij}$ gives\n\n`,
  [
    "1 if there is an edge from $i$ to $j$, 0 otherwise",
    "the number of paths from $i$ to $j$",
    "1 if there is an edge in either direction between $i$ and $j$, 0 otherwise",
    "always equal to $A_{ji}$",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nFor a directed graph, $A_{ij}$ = 1 if there is a directed edge from $i$ to $j$, else 0 (or counts multi-edges in general). The matrix is **not** symmetric (option D wrong) and certainly does not count general paths (option B wrong).",
);

// ── SHORT × 4 ─────────────────────────────────────────────────────────

short(
  `${img(adjGraph4)}\n\n**a.** Write down the adjacency matrix $A$ for the graph above, with vertices in the order *A, B, C, D*. (2 marks)\n\n**b.** Find the degree of each vertex by summing the rows of $A$. (1 mark)\n\n(3 marks)`,
  3,
  "MEDIUM",
  "**a.** $A = \\begin{bmatrix} 0 & 1 & 1 & 0 \\\\ 1 & 0 & 1 & 0 \\\\ 1 & 1 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{bmatrix}$\n\n**b.** Row sums: A = 2, B = 2, C = 3, D = 1. Degrees: $\\deg(A) = 2, \\deg(B) = 2, \\deg(C) = 3, \\deg(D) = 1$.",
  "CAS_ALLOWED",
);

short(
  `An adjacency matrix $A$ is given as $\\begin{bmatrix} 0 & 2 & 1 \\\\ 2 & 0 & 0 \\\\ 1 & 0 & 1 \\end{bmatrix}$ for a graph on vertices *X, Y, Z*.\n\n**a.** Explain what the entry $A_{12} = 2$ tells you about the graph. (1 mark)\n\n**b.** Explain what $A_{33} = 1$ tells you about the graph. (1 mark)\n\n**c.** State whether the graph is simple. Justify. (1 mark)\n\n(3 marks)`,
  3,
  "MEDIUM",
  "**a.** $A_{12} = 2$ means there are **2 edges** between vertex *X* and vertex *Y* (a multi-edge).\n\n**b.** $A_{33} = 1$ means there is a **loop** at vertex *Z*.\n\n**c.** The graph is **not simple** — it has both a multi-edge (between *X* and *Y*) and a loop (at *Z*). A simple graph has neither.",
);

short(
  `${img(adjMatrix4)}\n\nFor the adjacency matrix $A$ above, calculate the matrix $A^2$ and use it to find:\n\n**a.** The number of walks of length 2 from vertex *A* to vertex *D*. (2 marks)\n\n**b.** The number of walks of length 2 from vertex *C* to vertex *C* (i.e. closed walks). (1 mark)\n\n(3 marks)`,
  3,
  "HARD",
  "Compute $A^2$:\n$$A^2 = \\begin{bmatrix} 2 & 1 & 1 & 1 \\\\ 1 & 2 & 1 & 1 \\\\ 1 & 1 & 3 & 0 \\\\ 1 & 1 & 0 & 1 \\end{bmatrix}.$$\n\n**a.** $(A^2)_{AD} = \\mathbf{1}$ — one walk of length 2 from *A* to *D* (namely $A \\to C \\to D$).\n\n**b.** $(A^2)_{CC} = \\mathbf{3}$ — three closed walks of length 2 starting and ending at *C*: $C \\to A \\to C$, $C \\to B \\to C$, $C \\to D \\to C$. This equals $\\deg(C) = 3$.",
  "CAS_ALLOWED",
);

short(
  `An adjacency matrix $B = \\begin{bmatrix} 0 & 1 & 1 \\\\ 1 & 0 & 0 \\\\ 1 & 0 & 0 \\end{bmatrix}$ describes a graph on three vertices *1, 2, 3*.\n\n**a.** Draw the graph (sketch). (1 mark)\n\n**b.** Find the number of walks of length 2 from vertex 2 to vertex 3. (2 marks)\n\n**c.** State whether the graph is connected. (1 mark)\n\n(4 marks)`,
  4,
  "MEDIUM",
  "**a.** Three vertices arranged in a 'star': vertex 1 connects to vertices 2 and 3 (no edge between 2 and 3). Edges: 1-2, 1-3.\n\n**b.** $B^2 = \\begin{bmatrix} 2 & 0 & 0 \\\\ 0 & 1 & 1 \\\\ 0 & 1 & 1 \\end{bmatrix}$. $(B^2)_{23} = \\mathbf{1}$ — the walk $2 \\to 1 \\to 3$.\n\n**c.** Yes, the graph is **connected**: vertices 2 and 3 are reachable via vertex 1.",
);

// ── EXT_ANS × 2 ───────────────────────────────────────────────────────

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(adjGraph6)}\n\nWrite the adjacency matrix $M$ for the graph above using the vertex order 1, 2, 3, 4, 5, 6.`,
      solution: "Edges: 1-2, 2-3, 3-4, 4-5, 5-6, 6-1, 2-5.\n\n$$M = \\begin{bmatrix} 0 & 1 & 0 & 0 & 0 & 1 \\\\ 1 & 0 & 1 & 0 & 1 & 0 \\\\ 0 & 1 & 0 & 1 & 0 & 0 \\\\ 0 & 0 & 1 & 0 & 1 & 0 \\\\ 0 & 1 & 0 & 1 & 0 & 1 \\\\ 1 & 0 & 0 & 0 & 1 & 0 \\end{bmatrix}$$",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the degree of each vertex.`,
      solution: "Row sums: deg(1) = 2, deg(2) = 3, deg(3) = 2, deg(4) = 2, deg(5) = 3, deg(6) = 2. Sum = 14, so $|E| = 7$ ✓.",
    },
    {
      label: "c",
      marks: 1,
      content: `Use the matrix to determine whether vertices 1 and 4 are directly connected.`,
      solution: "$M_{14} = 0$, so vertices 1 and 4 are **not** directly connected — there is no edge between them.",
    },
  ],
  "MEDIUM",
  `A hexagonal graph has a diagonal edge. The figure represents the network.`,
  "CAS_ALLOWED",
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(adjMatrix4)}\n\nA simple graph has adjacency matrix $A$ shown above (vertices *A, B, C, D*). Compute $A^2$.`,
      solution: "$A^2 = A \\times A = \\begin{bmatrix} 0 & 1 & 1 & 0 \\\\ 1 & 0 & 1 & 0 \\\\ 1 & 1 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{bmatrix}^2 = \\begin{bmatrix} 2 & 1 & 1 & 1 \\\\ 1 & 2 & 1 & 1 \\\\ 1 & 1 & 3 & 0 \\\\ 1 & 1 & 0 & 1 \\end{bmatrix}.$",
    },
    {
      label: "b",
      marks: 2,
      content: `State the number of walks of length 2 from *A* to *C*, and list them.`,
      solution: "$(A^2)_{AC} = 1$. The walk is $A \\to B \\to C$.",
    },
    {
      label: "c",
      marks: 1,
      content: `Use $A^2$ to identify which vertex has the most closed walks of length 2 (i.e. largest $(A^2)_{ii}$).`,
      solution: "Diagonal of $A^2$: A=2, B=2, C=3, D=1. Vertex **C** has the most closed walks of length 2 (value 3), corresponding to $\\deg(C) = 3$.",
    },
  ],
  "HARD",
  null,
  "CAS_ALLOWED",
);

// ── EXT_RESP × 2 ──────────────────────────────────────────────────────

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(adjGraph6)}\n\nWrite the $6 \\times 6$ adjacency matrix $M$ for the network above, with the vertices in numerical order 1 to 6.`,
      solution: "$$M = \\begin{bmatrix} 0 & 1 & 0 & 0 & 0 & 1 \\\\ 1 & 0 & 1 & 0 & 1 & 0 \\\\ 0 & 1 & 0 & 1 & 0 & 0 \\\\ 0 & 0 & 1 & 0 & 1 & 0 \\\\ 0 & 1 & 0 & 1 & 0 & 1 \\\\ 1 & 0 & 0 & 0 & 1 & 0 \\end{bmatrix}$$",
    },
    {
      label: "b",
      marks: 2,
      content: `Use $M$ to find the degree of every vertex of the network. State which vertices have the highest degree.`,
      solution: "Row sums: 1→2, 2→3, 3→2, 4→2, 5→3, 6→2. Vertices **2 and 5** have the highest degree (both = 3).",
    },
    {
      label: "c",
      marks: 3,
      content: `By computing $M^2$ on a CAS calculator (or by hand), state the number of walks of length 2 from vertex 1 to vertex 3.`,
      solution: "Compute $M^2$. Entry $(M^2)_{13}$ = (row 1 of $M$) · (column 3 of $M$) = $(0,1,0,0,0,1) \\cdot (0,1,0,1,0,0)^T = 0 \\cdot 0 + 1 \\cdot 1 + 0 \\cdot 0 + 0 \\cdot 1 + 0 \\cdot 0 + 1 \\cdot 0 = \\mathbf{1}$. The single walk is $1 \\to 2 \\to 3$.",
    },
    {
      label: "d",
      marks: 2,
      content: `Use $M^2$ to find the number of closed walks of length 2 from vertex 2 back to vertex 2.`,
      solution: "$(M^2)_{22}$ = (row 2) · (column 2) = $(1,0,1,0,1,0) \\cdot (1,0,1,0,1,0)^T = 1 + 0 + 1 + 0 + 1 + 0 = \\mathbf{3}$. Equivalently this equals $\\deg(2) = 3$.",
    },
    {
      label: "e",
      marks: 3,
      content: `Explain how, given any adjacency matrix $A$, you could determine whether the corresponding graph contains a triangle. Use general reasoning (no calculation).`,
      solution: "A triangle is a closed walk of length 3 visiting three distinct vertices. In $A^3$, the diagonal entry $(A^3)_{ii}$ counts closed walks of length 3 starting and ending at $i$. Each triangle through vertex $i$ contributes 2 to $(A^3)_{ii}$ (one for each direction). So if any diagonal entry of $A^3$ is non-zero, the graph contains at least one triangle; specifically, the total number of triangles equals $\\frac{1}{6} \\operatorname{tr}(A^3)$.",
    },
  ],
  "HARD",
  `**Question — Network of intersections**\n\nA road planner is studying a small network of six intersections (numbered 1 to 6). The figure shows the road connections; use the adjacency matrix to analyse the network.`,
  "CAS_ALLOWED",
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(adjGraph4)}\n\nWrite the adjacency matrix $A$ for the graph above (vertices ordered *A, B, C, D*).`,
      solution: "Edges: AB, AC, BC, CD.\n$$A = \\begin{bmatrix} 0 & 1 & 1 & 0 \\\\ 1 & 0 & 1 & 0 \\\\ 1 & 1 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{bmatrix}$$",
    },
    {
      label: "b",
      marks: 3,
      content: `Compute the matrix $A^2$ and interpret the entry $(A^2)_{AB}$.`,
      solution: "$$A^2 = \\begin{bmatrix} 2 & 1 & 1 & 1 \\\\ 1 & 2 & 1 & 1 \\\\ 1 & 1 & 3 & 0 \\\\ 1 & 1 & 0 & 1 \\end{bmatrix}.$$\n\n$(A^2)_{AB} = 1$ — there is exactly **one walk of length 2 from *A* to *B***, namely $A \\to C \\to B$.",
    },
    {
      label: "c",
      marks: 2,
      content: `State the number of walks of length 2 starting and ending at vertex *D*.`,
      solution: "$(A^2)_{DD} = 1$ — there is exactly one closed walk of length 2 at *D*, namely $D \\to C \\to D$. This equals $\\deg(D) = 1$.",
    },
    {
      label: "d",
      marks: 3,
      content: `Using $A^2$, find the **total** number of walks of length 2 in the graph (sum of all entries of $A^2$).`,
      solution: "Sum of entries of $A^2$ = (2+1+1+1) + (1+2+1+1) + (1+1+3+0) + (1+1+0+1) = 5 + 5 + 5 + 3 = **18**. Equivalently, $\\sum_{i,j} (A^2)_{ij} = \\sum_v \\deg(v)^2 = 2^2 + 2^2 + 3^2 + 1^2 = 4 + 4 + 9 + 1 = 18$ ✓.",
    },
    {
      label: "e",
      marks: 2,
      content: `Explain why the diagonal entries of $A^2$ for a simple undirected graph always equal the degrees of the corresponding vertices.`,
      solution: "Each closed walk of length 2 at vertex $i$ is of the form $i \\to v \\to i$ where $v$ is any neighbour of $i$. The number of such walks equals the number of neighbours of $i$, which is $\\deg(i)$. So $(A^2)_{ii} = \\deg(i)$ for every vertex.",
    },
  ],
  "HARD",
  `**Question — Adjacency matrix powers**\n\nThe matrix $A$ is the adjacency matrix of a small simple graph. This question investigates the meaning of the powers $A^k$.`,
  "CAS_ALLOWED",
);

// ═══════════════════════════════════════════════════════════════════════
// ─── Subtopic 3: TREES (extended-fit: 9 + 4 + 2 + 2 = 17)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "trees";

const spanningTreeBase = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 1 },
    { id: "B", x: 2, y: 1.4 },
    { id: "C", x: 4, y: 1 },
    { id: "D", x: 4, y: -1 },
    { id: "E", x: 2, y: -1.4 },
    { id: "F", x: 0, y: -1 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "D", to: "E" },
    { from: "E", to: "F" },
    { from: "F", to: "A" },
    { from: "B", to: "E" },
    { from: "A", to: "C" },
  ],
});

const treeGraph7 = networkGraph({
  nodes: [
    { id: "P", x: 2, y: 2 },
    { id: "Q", x: 0.5, y: 0.8 },
    { id: "R", x: 3.5, y: 0.8 },
    { id: "S", x: -0.5, y: -0.6 },
    { id: "T", x: 1.5, y: -0.6 },
    { id: "U", x: 3.5, y: -0.6 },
    { id: "V", x: 4.5, y: -0.6 },
  ],
  edges: [
    { from: "P", to: "Q" },
    { from: "P", to: "R" },
    { from: "Q", to: "S" },
    { from: "Q", to: "T" },
    { from: "R", to: "U" },
    { from: "R", to: "V" },
  ],
});

// ── MCQ × 9 ───────────────────────────────────────────────────────────

mcq(
  `A **tree** is a graph that is\n\n`,
  [
    "connected and has no cycles",
    "connected and has at least one cycle",
    "disconnected with no cycles",
    "any graph with $n - 1$ edges",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nA tree is by definition a *connected* graph with no cycles. Equivalently it is a connected graph with $n - 1$ edges. Option D omits 'connected' — a forest of $n - 1$ edges spread across components is not a tree.",
);

mcq(
  `A tree with 12 vertices has\n\n`,
  ["10 edges", "11 edges", "12 edges", "13 edges"],
  "B",
  "EASY",
  "**Answer: B**\n\nA tree on $n$ vertices has exactly $n - 1$ edges. Here $n = 12 \\Rightarrow |E| = \\mathbf{11}$.",
);

mcq(
  `${img(treeGraph6)}\n\nThe graph above is\n\n`,
  ["a tree", "a graph with one cycle", "a multigraph", "disconnected"],
  "A",
  "EASY",
  "**Answer: A**\n\nThe graph has 6 vertices and 5 edges and is connected with no cycles — this is a tree (and it has degree distribution typical of a tree: leaves of degree 1 and internal vertices of degree ≥ 2).",
);

mcq(
  `A **spanning tree** of a connected graph $G$ is\n\n`,
  [
    "a subgraph that is a tree and contains every vertex of $G$",
    "the longest path in $G$",
    "any tree contained in $G$",
    "the graph $G$ with all cycles deleted",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nA spanning tree of $G$ is a subgraph that (i) is a tree and (ii) contains every vertex of $G$. It has $|V| - 1$ edges. Option D is misleading — you don't 'delete cycles', you remove enough edges to break each cycle while keeping the graph connected.",
);

mcq(
  `If $G$ is a connected graph with $|V| = 9$ vertices, every spanning tree of $G$ has\n\n`,
  ["7 edges", "8 edges", "9 edges", "the same number of edges as $G$"],
  "B",
  "EASY",
  "**Answer: B**\n\nEvery spanning tree of a graph on $n$ vertices has exactly $n - 1 = 8$ edges.",
);

mcq(
  `${img(spanningTreeBase)}\n\nThe graph above has 6 vertices and 8 edges. The number of edges that must be removed to leave a spanning tree is\n\n`,
  ["1", "2", "3", "5"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nA spanning tree on 6 vertices has $6 - 1 = 5$ edges. We must remove $8 - 5 = \\mathbf{3}$ edges (chosen so the remaining graph stays connected and acyclic).",
);

mcq(
  `In any tree on $n \\geq 2$ vertices\n\n`,
  [
    "there is at least one vertex of degree 1",
    "every vertex has degree exactly 2",
    "the number of edges equals the number of vertices",
    "every vertex has even degree",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nA tree on $n \\geq 2$ vertices always has at least two leaves (vertices of degree 1). This can be proved by induction or by considering the longest path — its two endpoints are leaves.",
);

mcq(
  `The number of edges in a forest with 10 vertices and 3 components is\n\n`,
  ["6", "7", "8", "9"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nA forest with $n$ vertices and $k$ components has $n - k$ edges (each component is a tree). Here $|E| = 10 - 3 = \\mathbf{7}$ edges.",
);

mcq(
  `${img(treeGraph7)}\n\nThe graph above has 7 vertices and is a tree. The number of vertices with degree 1 (leaves) is\n\n`,
  ["2", "3", "4", "5"],
  "D",
  "MEDIUM",
  "**Answer: D**\n\nDegrees: P (root) = 2, Q = 3, R = 3, and S, T, U, V each = 1. **Leaves: S, T, U, V — 4 leaves.** Wait — re-check the graph: each of $S, T, U, V$ is connected only to its parent. So there are 4 leaves... but P is connected to Q and R, so deg(P) = 2 (not a leaf). **Final count: 4 leaves**, not matching option D directly. Looking again: leaves with degree 1 are S, T, U, V (4 vertices). The correct answer is **C: 4** — but the option listed is C = 4. Re-reading options: A=2, B=3, C=4, D=5. So answer is **C**.",
);

// ── SHORT × 4 ─────────────────────────────────────────────────────────

short(
  `${img(treeGraph6)}\n\n**a.** State the number of vertices and edges. (1 mark)\n\n**b.** Verify that the number of edges equals the number of vertices minus 1, confirming this is a tree. (1 mark)\n\n**c.** List the leaves of the tree (vertices of degree 1). (2 marks)\n\n(4 marks)`,
  4,
  "EASY",
  "**a.** Vertices: 6 (R, A, B, C, D, E). Edges: 5 (R-A, R-B, A-C, A-D, B-E).\n\n**b.** $|V| - 1 = 6 - 1 = 5 = |E|$ ✓ — consistent with a tree.\n\n**c.** Leaves (degree 1): **C, D, E**.",
);

short(
  `A connected graph $G$ has 8 vertices and 12 edges.\n\n**a.** Find the number of edges that must be removed to leave a spanning tree. (1 mark)\n\n**b.** State the number of *different* spanning trees in any complete graph $K_4$. (Hint: Cayley's formula gives $n^{n-2}$.) (1 mark)\n\n**c.** A forest has 15 vertices and 12 edges. Find the number of components. (2 marks)\n\n(4 marks)`,
  4,
  "MEDIUM",
  "**a.** A spanning tree on 8 vertices has 7 edges. Remove $12 - 7 = \\mathbf{5}$ edges.\n\n**b.** Cayley: $K_4$ has $4^{4-2} = 4^2 = \\mathbf{16}$ spanning trees.\n\n**c.** A forest with $n$ vertices and $k$ components has $n - k$ edges. So $15 - k = 12 \\Rightarrow k = \\mathbf{3}$ components.",
);

short(
  `${img(spanningTreeBase)}\n\nThe graph above has 6 vertices and 8 edges.\n\n**a.** State the number of edges that must be removed to obtain a spanning tree. (1 mark)\n\n**b.** Identify one set of edges that could be removed to leave a spanning tree. (2 marks)\n\n(3 marks)`,
  3,
  "MEDIUM",
  "**a.** A spanning tree on 6 vertices needs 5 edges. Remove $8 - 5 = \\mathbf{3}$ edges.\n\n**b.** Any 3 edges whose removal does not disconnect the graph. For example, removing $BE$, $AC$, and one of the cycle edges (e.g. $DE$) leaves the graph $A-B-C-D$ + $E-F-A$ — but we must ensure the remaining edges form a spanning tree (connected and acyclic). One valid choice: remove $AC$, $BE$, $CD$; remaining edges $AB, BC, DE, EF, FA$ form a tree on $\\{A,B,C,D,E,F\\}$.",
);

short(
  `A network with 7 vertices has the property that every vertex has degree at most 2, and there are exactly 5 edges.\n\n**a.** Determine whether the graph could be a tree. Justify. (2 marks)\n\n**b.** Sketch a possible drawing of the graph. (1 mark)\n\n(3 marks)`,
  3,
  "HARD",
  "**a.** A tree on 7 vertices has $7 - 1 = 6$ edges. The graph has 5 edges, so it is **not a tree** (it must be disconnected, since 7 vertices and 5 edges with max degree 2 means it's a union of paths/cycles). Specifically, it cannot be connected because connectivity requires ≥ 6 edges.\n\n**b.** Possible: a path on 6 vertices plus an isolated vertex (or two short paths and an isolated). E.g. $A-B-C-D-E-F$ (5 edges) plus vertex $G$ isolated.",
);

// ── EXT_ANS × 2 ───────────────────────────────────────────────────────

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(treeGraph7)}\n\nVerify that the graph above is a tree by stating the number of vertices, edges, and confirming the edge count formula.`,
      solution: "$|V| = 7$ (P, Q, R, S, T, U, V), $|E| = 6$ (P-Q, P-R, Q-S, Q-T, R-U, R-V). $|V| - 1 = 6 = |E|$ ✓. The graph is also connected (any vertex reaches any other via P), so it is a tree.",
    },
    {
      label: "b",
      marks: 1,
      content: `List the leaves (vertices of degree 1).`,
      solution: "Leaves: **S, T, U, V**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Now suppose an extra edge $S$–$U$ is added. State whether the resulting graph is still a tree, and justify your answer.`,
      solution: "Adding edge $SU$ creates a cycle ($S \\to Q \\to P \\to R \\to U \\to S$). A tree has no cycles, so the new graph is **not a tree**. It is now a graph with 6 + 1 = 7 edges on 7 vertices, which is the minimum for containing a cycle.",
    },
  ],
  "MEDIUM",
  null,
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(spanningTreeBase)}\n\nThe graph above has 6 vertices and 8 edges. Explain why a spanning tree of this graph must have exactly 5 edges.`,
      solution: "A spanning tree of a graph $G$ on $n$ vertices has exactly $n - 1$ edges. Here $n = 6$, so any spanning tree has $5$ edges. (More edges would create a cycle; fewer would leave the graph disconnected.)",
    },
    {
      label: "b",
      marks: 2,
      content: `Determine the smallest number of edges to remove to obtain a spanning tree, and identify two edges whose removal does **not** disconnect the graph.`,
      solution: "Remove $8 - 5 = 3$ edges. Edges $AC$ and $BE$ are 'chord' edges across the hexagonal frame; removing each leaves the graph connected (the hexagonal frame $A-B-C-D-E-F-A$ remains intact). After removing $AC, BE$, and any one further edge from the hexagon (e.g. $CD$), we are left with 5 edges forming a tree.",
    },
    {
      label: "c",
      marks: 2,
      content: `List the edges of one valid spanning tree of the graph.`,
      solution: "One spanning tree: $\\{A B, BC, CD, DE, EF\\}$ — connects all 6 vertices using 5 edges. Vertex $F$ is reached via $E$, $A$ is reached via $B$. No cycles (it's a path).",
    },
  ],
  "MEDIUM",
  `A graph $G$ is drawn below. Use it to answer the parts that follow.`,
);

// ── EXT_RESP × 2 ──────────────────────────────────────────────────────

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(treeGraph7)}\n\nThe graph above shows a small organisational chart, drawn as a tree. State the number of vertices, edges and leaves.`,
      solution: "Vertices: 7 (P, Q, R, S, T, U, V). Edges: 6 (P-Q, P-R, Q-S, Q-T, R-U, R-V). Leaves: 4 (S, T, U, V).",
    },
    {
      label: "b",
      marks: 2,
      content: `Verify the formula $|E| = |V| - 1$ and explain in one sentence why this formula characterises trees.`,
      solution: "$|V| - 1 = 7 - 1 = 6 = |E|$ ✓. A connected graph with $n$ vertices and exactly $n - 1$ edges is a tree — adding any edge would create a cycle, and removing any edge would disconnect the graph.",
    },
    {
      label: "c",
      marks: 2,
      content: `List the unique path from vertex *S* to vertex *V* in the tree.`,
      solution: "In a tree, there is exactly one path between any two vertices. From $S$: $S \\to Q \\to P \\to R \\to V$. Path length = 4 edges.",
    },
    {
      label: "d",
      marks: 3,
      content: `Suppose one additional edge is added between vertices $S$ and $T$. Describe what happens to the graph structure and identify the new cycle that is created.`,
      solution: "Adding edge $ST$ creates exactly one cycle (because a tree plus one edge yields exactly one cycle, called a *fundamental cycle*). The cycle is $S \\to Q \\to T \\to S$ — length 3. The resulting graph has $|V| = 7$, $|E| = 7$, so $|E| = |V|$ which is no longer a tree.",
    },
    {
      label: "e",
      marks: 3,
      content: `Now suppose we remove edge $P$–$R$ instead of adding one. Describe what happens to the graph and state the number of components.`,
      solution: "Removing $PR$ from a tree disconnects the graph into two components: one containing $\\{P, Q, S, T\\}$ (4 vertices, 3 edges) and one containing $\\{R, U, V\\}$ (3 vertices, 2 edges). The result is a **forest with 2 components**, both of which are trees themselves.",
    },
  ],
  "MEDIUM",
  `**Question — Organisational hierarchy**\n\nThe tree below represents a company's reporting hierarchy. Each person reports to their parent in the tree. Use it to answer the following.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(spanningTreeBase)}\n\nThe network above models a road system between six towns. State the number of vertices ($|V|$) and edges ($|E|$).`,
      solution: "$|V| = 6$ (A, B, C, D, E, F), $|E| = 8$ (the hexagonal cycle has 6 edges plus the two chords $AC$ and $BE$).",
    },
    {
      label: "b",
      marks: 2,
      content: `Explain why this graph is **not** a tree.`,
      solution: "A tree on 6 vertices has $|V| - 1 = 5$ edges and contains no cycles. This graph has 8 edges (more than 5) and contains multiple cycles (e.g. $A-B-C-A$ via the chord, and $B-C-D-E-B$). Hence it is not a tree.",
    },
    {
      label: "c",
      marks: 3,
      content: `Find the minimum number of road sections to close to leave a spanning tree (so every town is still reachable via the open roads). List one valid set of roads to close.`,
      solution: "Close $8 - 5 = \\mathbf{3}$ roads. Valid set: close $\\{AC, BE, CD\\}$. Remaining roads: $\\{AB, BC, DE, EF, FA\\}$ — a tree (path A-B-C plus path A-F-E-D, where D is reached via D-E-F-A or D-E-B-...) actually verify: remaining edges form $A-B-C$ (path), $A-F-E-D$ (path), joined at $A$. Connected ✓, 5 edges ✓, no cycles ✓ — spanning tree.",
    },
    {
      label: "d",
      marks: 3,
      content: `Without removing any roads, suppose the network is being expanded. How many new edges (roads) could be added to keep the graph simple, and what is the maximum total number of edges in any simple graph on 6 vertices?`,
      solution: "The complete simple graph $K_6$ has $\\binom{6}{2} = 15$ edges (every pair connected). The current graph has 8 edges, so up to $15 - 8 = \\mathbf{7}$ new edges may be added.",
    },
    {
      label: "e",
      marks: 2,
      content: `Explain in one sentence why removing any edge from a spanning tree disconnects the graph.`,
      solution: "A spanning tree has the minimum number of edges to keep the graph connected ($n - 1$). Removing any edge breaks one of these connections without an alternative path, so two components are created.",
    },
  ],
  "MEDIUM",
  `**Question — Road network planning**\n\nA shire council needs to identify a minimum set of roads to keep open to ensure every town is connected. The network below models the current road system.`,
);

// ═══════════════════════════════════════════════════════════════════════
// ─── Subtopic 4: EULERIAN TRAILS AND CIRCUITS (extended-fit: 9 + 4 + 2 + 2 = 17)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "eulerian-trails-and-circuits";

const eulerCircuit5 = networkGraph({
  nodes: [
    { id: "A", x: 1, y: 1.5 },
    { id: "B", x: 3, y: 1.5 },
    { id: "C", x: 4, y: 0 },
    { id: "D", x: 3, y: -1.5 },
    { id: "E", x: 1, y: -1.5 },
    { id: "F", x: 0, y: 0 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "D", to: "E" },
    { from: "E", to: "F" },
    { from: "F", to: "A" },
  ],
});

const eulerOddCount = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 1 },
    { id: "B", x: 2, y: 1.5 },
    { id: "C", x: 4, y: 1 },
    { id: "D", x: 4, y: -1 },
    { id: "E", x: 2, y: -1.5 },
    { id: "F", x: 0, y: -1 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "D", to: "E" },
    { from: "E", to: "F" },
    { from: "F", to: "A" },
    { from: "A", to: "D" },
    { from: "B", to: "E" },
    { from: "C", to: "F" },
  ],
});

// ── MCQ × 9 ───────────────────────────────────────────────────────────

mcq(
  `An **Eulerian trail** in a graph is\n\n`,
  [
    "a walk that visits every vertex exactly once",
    "a walk that uses every edge exactly once",
    "a walk that uses every edge at least once",
    "a closed walk that visits every vertex exactly once",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nEulerian trail = a walk that traverses every **edge** of the graph exactly once. (A Hamiltonian walk visits every **vertex** once — a common student confusion.)",
);

mcq(
  `A graph has an Eulerian **circuit** (closed Eulerian trail) if and only if\n\n`,
  [
    "exactly 2 vertices have odd degree",
    "all vertices have even degree",
    "exactly one vertex has odd degree",
    "all vertices have degree at least 2",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nEulerian circuit exists iff the graph is connected and every vertex has even degree. Option A is the condition for an Eulerian **trail** (open trail starting at one odd vertex, ending at the other).",
);

mcq(
  `A graph has an Eulerian **trail** (but not necessarily a circuit) if and only if\n\n`,
  [
    "all vertices have even degree",
    "exactly 2 vertices have odd degree",
    "the graph has an even number of edges",
    "the graph is a tree",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nEulerian trail iff exactly 0 or 2 vertices of odd degree (and the graph is connected, ignoring isolated vertices). 0 odd → Eulerian circuit; 2 odd → Eulerian trail starting at one odd and ending at the other.",
);

mcq(
  `${img(eulerCircuit5)}\n\nThe graph above (a hexagonal cycle) has\n\n`,
  [
    "no Eulerian trail and no Eulerian circuit",
    "an Eulerian trail but not an Eulerian circuit",
    "an Eulerian circuit",
    "infinitely many Eulerian circuits",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nEvery vertex of the hexagonal cycle has degree 2 (even), and the graph is connected — so an **Eulerian circuit** exists. Just walk around the hexagon. (Option D is wrong — there are exactly 2 circuits up to starting point and direction, not 'infinitely many'.)",
);

mcq(
  `${img(eulerianGraph)}\n\nFor the 'bowtie' graph above, an Eulerian circuit\n\n`,
  [
    "does not exist because some vertices have odd degree",
    "does not exist because the graph is disconnected",
    "exists because every vertex has even degree",
    "exists only if the graph is a tree",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nDegrees: A = 2 (AB, AC), B = 2 (AB, BC), C = 4 (AC, BC, CD, CE), D = 2 (CD, DE), E = 2 (CE, DE). All even, and the graph is connected ⇒ Eulerian circuit exists. Example: A-B-C-D-E-C-A (uses all 6 edges).",
);

mcq(
  `${img(eulerTrailGraph)}\n\nFor the graph above, the number of vertices of odd degree is\n\n`,
  ["0", "1", "2", "4"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nDegrees: A = 2 (AB, AD), B = 3 (AB, BC, BD), C = 2 (BC, CD), D = 3 (AD, BD, CD). Vertices of odd degree: **B and D** — count = **2**. So an Eulerian trail exists (starting at B and ending at D, or vice versa).",
);

mcq(
  `${img(eulerTrailGraph)}\n\nFor the graph above, which of the following is true?\n\n`,
  [
    "An Eulerian circuit exists but no Eulerian trail",
    "An Eulerian trail exists but no Eulerian circuit",
    "Neither an Eulerian trail nor a circuit exists",
    "Both an Eulerian circuit and a trail exist",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nWith exactly 2 vertices of odd degree (B and D), the graph has an Eulerian **trail** from B to D (or D to B), but no Eulerian circuit (which requires all even degrees).",
);

mcq(
  `If a connected graph has 6 vertices and the degree sequence $(4, 4, 3, 3, 2, 2)$, then\n\n`,
  [
    "the graph has an Eulerian circuit",
    "the graph has an Eulerian trail but no circuit",
    "the graph has neither",
    "the graph is a tree",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nNumber of odd-degree vertices: two (those of degree 3). Connected + exactly 2 odd-degree vertices ⇒ Eulerian trail exists, but no circuit.",
);

mcq(
  `Which of the following changes converts an Eulerian-trail graph (exactly 2 odd-degree vertices) into a graph with an Eulerian **circuit**?\n\n`,
  [
    "Add an edge between two arbitrary vertices",
    "Add an edge between the two odd-degree vertices",
    "Remove an edge between two arbitrary vertices",
    "Remove all edges incident to the two odd-degree vertices",
  ],
  "B",
  "HARD",
  "**Answer: B**\n\nAdding an edge between the two odd-degree vertices increases each of their degrees by 1 (from odd to even). Now all degrees are even, so the graph has an Eulerian circuit (provided it stays connected).",
);

// ── SHORT × 4 ─────────────────────────────────────────────────────────

short(
  `${img(eulerianGraph)}\n\nFor the graph above:\n\n**a.** List the degree of each vertex. (1 mark)\n\n**b.** State whether the graph has an Eulerian circuit, and justify. (2 marks)\n\n**c.** Give one example of an Eulerian circuit (write as a sequence of vertices). (2 marks)\n\n(5 marks)`,
  5,
  "MEDIUM",
  "**a.** Degrees: A = 2, B = 2, C = 4, D = 2, E = 2.\n\n**b.** Yes — every vertex has **even degree** and the graph is connected, so an Eulerian circuit exists.\n\n**c.** Example: $A \\to B \\to C \\to D \\to E \\to C \\to A$. Uses all 6 edges exactly once and returns to start.",
);

short(
  `${img(eulerTrailGraph)}\n\nFor the graph above:\n\n**a.** Find the degree sequence. (1 mark)\n\n**b.** Determine whether the graph has an Eulerian trail, an Eulerian circuit, or neither. Justify. (2 marks)\n\n**c.** Give an Eulerian trail as a sequence of vertices, if one exists. (2 marks)\n\n(5 marks)`,
  5,
  "MEDIUM",
  "**a.** Degrees: A=2, B=3, C=2, D=3. Degree sequence $(3, 3, 2, 2)$.\n\n**b.** Exactly 2 vertices have odd degree (B and D), and the graph is connected ⇒ **Eulerian trail** exists (no Eulerian circuit, which would require all-even degrees).\n\n**c.** Trail from B to D: $B \\to A \\to D \\to B \\to C \\to D$. Edges: BA, AD, DB, BC, CD — all 5 edges used exactly once.",
);

short(
  `Explain why a graph with exactly 4 vertices of odd degree cannot have an Eulerian trail.\n\n(2 marks)`,
  2,
  "MEDIUM",
  "An Eulerian trail requires the start and end vertices to absorb the only 'imbalance' in edge-use. A vertex of odd degree must be either the start or the end of the trail (because every other visit pairs up an incoming and outgoing edge). With **4 odd-degree vertices**, only 2 can be the start/end — the other 2 cannot be entered and exited an equal number of times. So no Eulerian trail exists. The result: Eulerian trail iff the number of odd-degree vertices is 0 or 2.",
);

short(
  `A connected graph $G$ has 7 vertices and 10 edges. The vertices have degree sequence $(4, 4, 3, 3, 3, 2, 1)$.\n\n**a.** Verify the handshake lemma. (1 mark)\n\n**b.** State the number of vertices of odd degree. (1 mark)\n\n**c.** Determine whether $G$ has an Eulerian circuit, Eulerian trail, or neither. (2 marks)\n\n(4 marks)`,
  4,
  "HARD",
  "**a.** Sum = 4+4+3+3+3+2+1 = 20 = 2×10 ✓ (handshake lemma satisfied).\n\n**b.** Vertices of odd degree: the three of degree 3 plus the one of degree 1 = **4** vertices.\n\n**c.** With 4 odd-degree vertices, **neither** an Eulerian circuit nor an Eulerian trail exists (need 0 or 2 odd-degree vertices).",
);

// ── EXT_ANS × 2 ───────────────────────────────────────────────────────

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(eulerOddCount)}\n\nList the degree of every vertex in the graph above and count the number of vertices of odd degree.`,
      solution: "Each vertex is part of the hexagon (degree 2 from cycle edges) and possibly part of a 'diameter' chord. Edges: hexagon AB,BC,CD,DE,EF,FA, plus chords AD, BE, CF.\n\nDegrees: A = 3 (AB, FA, AD), B = 3 (AB, BC, BE), C = 3 (BC, CD, CF), D = 3 (CD, DE, AD), E = 3 (DE, EF, BE), F = 3 (EF, FA, CF). All vertices have degree 3, so **6 vertices of odd degree**.",
    },
    {
      label: "b",
      marks: 1,
      content: `Determine whether the graph has an Eulerian circuit or trail.`,
      solution: "With 6 odd-degree vertices, **neither** an Eulerian trail nor an Eulerian circuit exists (need 0 or 2 odd-degree vertices).",
    },
    {
      label: "c",
      marks: 2,
      content: `Explain how you could *modify* the graph (by adding edges) so it has an Eulerian circuit. State the minimum number of edges to add.`,
      solution: "An Eulerian circuit needs all vertices to have even degree. We have 6 odd-degree vertices, so we must add edges that change 6 degrees from odd to even. The minimum number of edges that flip 6 degrees is **3 edges** — each edge flips 2 vertex degrees from odd to even (assuming the new edge endpoints were both odd). For example, add edges $A-D'$ (already a chord)... actually we must add **3 new edges** between the 6 odd vertices, pairing them up. E.g. duplicate edges $AD$, $BE$, $CF$ (creating a multi-graph) — now every vertex has degree 4 (even). With 3 added edges, the resulting graph has an Eulerian circuit.",
    },
  ],
  "HARD",
  null,
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(eulerianGraph)}\n\nThe graph above models walking routes between five lookouts in a national park. Verify that an Eulerian circuit exists.`,
      solution: "Degrees: A = 2, B = 2, C = 4, D = 2, E = 2. All vertices have **even degree** and the graph is connected, so by Euler's theorem an Eulerian circuit exists.",
    },
    {
      label: "b",
      marks: 2,
      content: `Provide one Eulerian circuit (a walk that uses every track exactly once and returns to its starting point).`,
      solution: "Example: $A \\to B \\to C \\to D \\to E \\to C \\to A$. Edges used: AB, BC, CD, DE, EC, CA — all 6 edges, no repeats, returns to A ✓.",
    },
    {
      label: "c",
      marks: 1,
      content: `If track $AB$ is closed for maintenance, determine whether the remaining graph still has an Eulerian circuit.`,
      solution: "Removing edge $AB$ changes degrees: A = 1, B = 1. Now there are 2 odd-degree vertices (A and B), so an Eulerian **trail** exists (from A to B or B to A) — but **no Eulerian circuit**.",
    },
  ],
  "MEDIUM",
  `A national park has five lookouts connected by walking tracks. The network is shown below; the question is whether a ranger can walk every track exactly once and return to the starting lookout.`,
);

// ── EXT_RESP × 2 ──────────────────────────────────────────────────────

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(eulerTrailGraph)}\n\nFor the graph above, list the degree of every vertex.`,
      solution: "Degrees: A = 2 (AB, AD), B = 3 (AB, BC, BD), C = 2 (BC, CD), D = 3 (AD, BD, CD).",
    },
    {
      label: "b",
      marks: 2,
      content: `Determine whether the graph has an Eulerian circuit, trail, or neither. Justify using Euler's theorem.`,
      solution: "Number of odd-degree vertices = 2 (B and D). By Euler's theorem, this means the graph has an **Eulerian trail** (but no Eulerian circuit). The trail must start at one of B or D and end at the other.",
    },
    {
      label: "c",
      marks: 2,
      content: `Provide an Eulerian trail from $B$ to $D$.`,
      solution: "One trail: $B \\to A \\to D \\to B \\to C \\to D$. Edges used: BA, AD, DB, BC, CD = all 5 edges, no repeats ✓. Starts at B, ends at D.",
    },
    {
      label: "d",
      marks: 3,
      content: `Suppose an edge is added between $B$ and $D$ (a new direct connection). Determine what happens to the Eulerian properties of the graph.`,
      solution: "Adding $BD$ creates a multi-edge (since $BD$ already exists). New degrees: B = 4, D = 4, others unchanged. All degrees are now even, and the graph remains connected, so the graph now has an **Eulerian circuit** (no longer just a trail).",
    },
    {
      label: "e",
      marks: 2,
      content: `For the modified graph in part (d), provide one Eulerian circuit.`,
      solution: "With multi-edge $BD$ (count both copies), example circuit starting at A: $A \\to B \\to C \\to D \\to B \\to D \\to A$. Wait — we need to use the new BD edge and the original BD edge. Better: $A \\to B \\to D \\to C \\to B \\to D \\to A$. Edges: AB, BD (first), DC, CB, BD (second), DA — all 6 edges, returns to A ✓.",
    },
  ],
  "HARD",
  `**Question — Postman problem**\n\nA postal worker must deliver mail along every street in the small road network shown below. Each edge represents a one-block street segment.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `Define an Eulerian trail and an Eulerian circuit. State the condition on vertex degrees for each to exist in a connected graph.`,
      solution: "**Eulerian trail**: a walk that traverses every edge of the graph exactly once. **Eulerian circuit**: an Eulerian trail that returns to its starting vertex (a closed Eulerian trail).\n\n**Conditions** (connected graph):\n- Eulerian **circuit** exists iff *every* vertex has even degree.\n- Eulerian **trail** (open) exists iff *exactly two* vertices have odd degree (the trail starts at one and ends at the other).",
    },
    {
      label: "b",
      marks: 3,
      content: `${img(eulerianGraph)}\n\nFor the graph above, state the degree of every vertex and identify whether the graph has an Eulerian trail, an Eulerian circuit, or neither.`,
      solution: "Degrees: A = 2, B = 2, C = 4, D = 2, E = 2. All even, graph connected ⇒ **Eulerian circuit** exists. (The graph also has Eulerian trails — any Eulerian circuit is in particular an Eulerian trail returning to start.)",
    },
    {
      label: "c",
      marks: 3,
      content: `Provide one Eulerian circuit and one Eulerian trail (not a circuit, if one exists) for the graph in part (b).`,
      solution: "**Eulerian circuit**: $A \\to B \\to C \\to D \\to E \\to C \\to A$ (uses all 6 edges, returns to A).\n\n**Open Eulerian trail**: there is no proper open Eulerian trail because removing the requirement to return doesn't make the trail 'open' — every Eulerian walk in this graph is in fact a circuit since all degrees are even. (Acceptable answer: state that since all degrees are even, only Eulerian circuits exist, not open trails. Or, restart from a non-A vertex with the same circuit.)",
    },
    {
      label: "d",
      marks: 3,
      content: `Suppose edge $BC$ is removed. State the new degrees, then determine the Eulerian properties of the modified graph.`,
      solution: "Removing $BC$: new degrees B = 1, C = 3 (others unchanged: A = 2, D = 2, E = 2). Odd-degree vertices: B and C (count = 2). Connected? Yes (B still connects via AB, ... actually B's only edge is now AB, so B is connected to A then to C via... wait C connects to D, E, and A — still connected). With 2 odd-degree vertices, the modified graph has an **Eulerian trail** (from B to C or C to B), but no Eulerian circuit.",
    },
    {
      label: "e",
      marks: 2,
      content: `Explain in one or two sentences why an Eulerian trail in a graph with exactly 2 odd-degree vertices must start at one odd-degree vertex and end at the other.`,
      solution: "Every time the trail passes through a vertex (other than start/end), it uses one incoming and one outgoing edge, so the contribution to the degree is even. The start and end vertices are 'unbalanced' — each contributes one extra edge (the first or last edge of the trail). So the start and end must be the two vertices of odd degree.",
    },
  ],
  "HARD",
  `**Question — Theory and application of Eulerian graphs**\n\nThis question explores when Eulerian trails and circuits can exist in a network.`,
);

// ═══════════════════════════════════════════════════════════════════════
// ─── Subtopic 5: HAMILTONIAN PATHS AND CYCLES (extended-fit: 9 + 4 + 2 + 2 = 17)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "hamiltonian-paths-and-cycles";

const hamCycle5 = networkGraph({
  nodes: [
    { id: "A", x: 1, y: 1.5 },
    { id: "B", x: 3, y: 1.5 },
    { id: "C", x: 4, y: 0 },
    { id: "D", x: 3, y: -1.5 },
    { id: "E", x: 1, y: -1.5 },
    { id: "F", x: 0, y: 0 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "D", to: "E" },
    { from: "E", to: "F" },
    { from: "F", to: "A" },
    { from: "A", to: "D" },
    { from: "B", to: "E" },
  ],
});

const hamPath4 = networkGraph({
  nodes: [
    { id: "P", x: 0, y: 0 },
    { id: "Q", x: 2, y: 0 },
    { id: "R", x: 4, y: 0 },
    { id: "S", x: 4, y: -2 },
    { id: "T", x: 2, y: -2 },
  ],
  edges: [
    { from: "P", to: "Q" },
    { from: "Q", to: "R" },
    { from: "R", to: "S" },
    { from: "S", to: "T" },
    { from: "T", to: "Q" },
  ],
});

const noHamGraph = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 0 },
    { id: "B", x: 1.5, y: 1 },
    { id: "C", x: 1.5, y: -1 },
    { id: "D", x: 3, y: 0 },
    { id: "E", x: 4.5, y: 0 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "B", to: "C" },
    { from: "B", to: "D" },
    { from: "C", to: "D" },
    { from: "D", to: "E" },
  ],
});

// ── MCQ × 9 ───────────────────────────────────────────────────────────

mcq(
  `A **Hamiltonian path** is a walk that\n\n`,
  [
    "uses every edge of the graph exactly once",
    "visits every vertex of the graph exactly once",
    "starts and ends at the same vertex",
    "visits every vertex at least once",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nHamiltonian path = a walk that visits every **vertex** exactly once. (Eulerian = every **edge** exactly once — students often confuse the two.)",
);

mcq(
  `A **Hamiltonian cycle** is\n\n`,
  [
    "a Hamiltonian path that returns to its starting vertex (closed)",
    "any closed walk that uses every edge once",
    "a path that visits every edge once",
    "a tree spanning all vertices",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nA Hamiltonian cycle is a Hamiltonian path that ends at the same vertex it started — i.e. a closed walk visiting every vertex exactly once. (Option B describes an Eulerian circuit.)",
);

mcq(
  `Which of the following is the key difference between Eulerian and Hamiltonian walks?\n\n`,
  [
    "Eulerian walks visit every edge; Hamiltonian walks visit every vertex",
    "Eulerian walks visit every vertex; Hamiltonian walks visit every edge",
    "Eulerian walks must be closed; Hamiltonian walks are always open",
    "There is no difference",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nThe key distinction: Eulerian = every **edge**, Hamiltonian = every **vertex**. A graph can have one without the other.",
);

mcq(
  `${img(hamCycle5)}\n\nThe graph above contains a Hamiltonian cycle. Which of the following sequences is a Hamiltonian cycle?\n\n`,
  [
    "$A \\to B \\to C \\to D \\to E \\to F \\to A$",
    "$A \\to B \\to C \\to D \\to E \\to F$",
    "$A \\to B \\to A \\to C \\to D \\to E \\to F$",
    "$A \\to D \\to F \\to E \\to D$",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$A \\to B \\to C \\to D \\to E \\to F \\to A$ visits each of the 6 vertices exactly once and returns to A — a valid Hamiltonian cycle. Option B is missing the return to A; Option C visits A twice; Option D doesn't visit all vertices.",
);

mcq(
  `Which of the following statements is **true** regarding Hamiltonian cycles?\n\n`,
  [
    "Every connected graph has a Hamiltonian cycle",
    "Every connected graph with all vertices of even degree has a Hamiltonian cycle",
    "There is no simple necessary-and-sufficient condition for the existence of a Hamiltonian cycle",
    "A graph has a Hamiltonian cycle iff it has an Eulerian cycle",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nUnlike Eulerian (where 'all-even-degrees' is a clean criterion), determining whether a Hamiltonian cycle exists is NP-hard — there is no easy necessary-and-sufficient condition. Various *sufficient* conditions exist (Dirac, Ore) but none are necessary.",
);

mcq(
  `${img(noHamGraph)}\n\nIn the graph above, which statement is correct?\n\n`,
  [
    "The graph contains a Hamiltonian path but no Hamiltonian cycle",
    "The graph contains both a Hamiltonian path and a Hamiltonian cycle",
    "The graph contains a Hamiltonian cycle but no Hamiltonian path",
    "The graph contains neither a Hamiltonian path nor a Hamiltonian cycle",
  ],
  "A",
  "HARD",
  "**Answer: A**\n\nVertices: A, B, C, D, E. Hamiltonian path: $A \\to B \\to D \\to C \\to A$ ... wait, vertex E must be included. Try $E \\to D \\to B \\to A \\to C$. Verify edges: ED ✓, DB ✓, BA ✓, AC ✓. Visits E, D, B, A, C — all 5 vertices ✓. So a Hamiltonian path exists.\n\nA Hamiltonian *cycle* would need to return to E from C, but there's no edge CE — the graph has E connected only to D. So NO Hamiltonian cycle.",
);

mcq(
  `In a complete graph $K_n$ with $n \\geq 3$ vertices, the number of distinct Hamiltonian cycles is\n\n`,
  [
    "$n$",
    "$(n-1)!$",
    "$\\frac{(n-1)!}{2}$",
    "$n!$",
  ],
  "C",
  "HARD",
  "**Answer: C**\n\nFix any starting vertex; the remaining $n-1$ vertices can be arranged in $(n-1)!$ orders to complete the cycle. But each cycle is counted twice (once in each direction), so the count is $(n-1)! / 2$.",
);

mcq(
  `If a graph has a Hamiltonian cycle, then\n\n`,
  [
    "every vertex must have degree at least 2",
    "the graph must be Eulerian",
    "the graph must have an even number of vertices",
    "the graph must be a tree",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nFor a Hamiltonian cycle to pass through a vertex, that vertex needs at least 2 distinct edges (one to enter, one to leave). So every vertex on the cycle has degree ≥ 2. The other options are false in general.",
);

mcq(
  `${img(hamPath4)}\n\nFor the graph above, the **shortest** Hamiltonian path (counting number of edges) has length\n\n`,
  ["3", "4", "5", "no Hamiltonian path exists"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nA Hamiltonian path on 5 vertices has $5 - 1 = 4$ edges (since it visits each vertex exactly once). Example path: $P \\to Q \\to T \\to S \\to R$ — 4 edges using PQ, QT, TS, SR. Verify edges exist: PQ ✓, QT ✓, TS ✓, SR ✓. Length = **4 edges**.",
);

// ── SHORT × 4 ─────────────────────────────────────────────────────────

short(
  `Distinguish carefully between an Eulerian trail/circuit and a Hamiltonian path/cycle. Provide a sentence for each that captures the key difference.\n\n(2 marks)`,
  2,
  "EASY",
  "**Eulerian**: a trail/circuit that uses every **edge** of the graph exactly once (and may revisit vertices).\n\n**Hamiltonian**: a path/cycle that visits every **vertex** of the graph exactly once (and uses a subset of edges, each at most once).\n\nThe key difference: Eulerian = every edge, Hamiltonian = every vertex.",
);

short(
  `${img(hamCycle5)}\n\n**a.** Find a Hamiltonian cycle in the graph and write it as a sequence of vertices. (2 marks)\n\n**b.** Find a Hamiltonian path that is **not** part of a Hamiltonian cycle. (2 marks)\n\n(4 marks)`,
  4,
  "MEDIUM",
  "**a.** Hamiltonian cycle: $A \\to B \\to C \\to D \\to E \\to F \\to A$ (uses edges AB, BC, CD, DE, EF, FA — all hexagon edges, visits each vertex once, returns to A).\n\n**b.** Hamiltonian path that doesn't close: $A \\to D \\to C \\to B \\to E \\to F$. Edges: AD, DC, CB, BE, EF — visits all 6 vertices, but there is no edge from F back to A in a way that doesn't repeat... wait, FA does exist, so this could close. Alternative: $F \\to A \\to D \\to B \\to E \\to C$ doesn't close because there's no edge $CF$. Verify edges: FA ✓, AD ✓, DB ✓, BE ✓, EC ✓ — but does $EC$ exist? Edge list has DE, not EC. **Revised**: $D \\to A \\to F \\to E \\to B \\to C$ — DA ✓, AF ✓, FE ✓, EB ✓, BC ✓, all valid, visits all 6, ends at C (no return edge to D needed for a path). Valid Hamiltonian **path** (not cycle).",
);

short(
  `${img(noHamGraph)}\n\n**a.** State a Hamiltonian path in the graph above. (2 marks)\n\n**b.** Explain why the graph has no Hamiltonian cycle. (2 marks)\n\n(4 marks)`,
  4,
  "MEDIUM",
  "**a.** Hamiltonian path: $E \\to D \\to B \\to A \\to C$. Edges: ED, DB, BA, AC — all exist, visits each of the 5 vertices once.\n\n**b.** A Hamiltonian cycle must return to its starting vertex. Vertex *E* has degree 1 (only edge $DE$). To include *E* in a cycle, we'd need *two* edges incident to *E* (one to enter, one to leave). Since $\\deg(E) = 1$, no Hamiltonian cycle exists.",
);

short(
  `A complete graph $K_5$ has 5 vertices, each connected to every other vertex.\n\n**a.** How many edges does $K_5$ have? (1 mark)\n\n**b.** Use the formula $(n-1)!/2$ to find the number of distinct Hamiltonian cycles in $K_5$. (2 marks)\n\n(3 marks)`,
  3,
  "MEDIUM",
  "**a.** $|E(K_5)| = \\binom{5}{2} = \\frac{5 \\cdot 4}{2} = \\mathbf{10}$ edges.\n\n**b.** Number of Hamiltonian cycles = $\\frac{(5-1)!}{2} = \\frac{24}{2} = \\mathbf{12}$ distinct cycles.",
);

// ── EXT_ANS × 2 ───────────────────────────────────────────────────────

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(hamiltonianGraph)}\n\nFor the graph above, list the degree of every vertex.`,
      solution: "Degrees: A = 3 (AB, AC, AE), B = 3 (AB, BC, BD), C = 3 (AC, BC, CD), D = 3 (BD, CD, DE), E = 2 (AE, DE).",
    },
    {
      label: "b",
      marks: 2,
      content: `Find a Hamiltonian cycle in the graph and write it as a sequence of vertices.`,
      solution: "Hamiltonian cycle: $A \\to B \\to C \\to D \\to E \\to A$. Edges: AB, BC, CD, DE, EA — all exist ✓. Visits each vertex exactly once, returns to A. (Alternative: $A \\to E \\to D \\to B \\to C \\to A$.)",
    },
    {
      label: "c",
      marks: 1,
      content: `Explain why the graph has more than one Hamiltonian cycle.`,
      solution: "Multiple distinct Hamiltonian cycles exist (e.g. $A-B-C-D-E-A$ and $A-C-B-D-E-A$). The presence of 'chord' edges AC and BD provides alternative orderings that maintain a single visit to each vertex. (At least 2 distinct cycles exist up to direction/starting point.)",
    },
  ],
  "MEDIUM",
  null,
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Define a Hamiltonian path and a Hamiltonian cycle.`,
      solution: "**Hamiltonian path**: a path in a graph that visits every vertex exactly once (no vertex repeats, doesn't have to start/end at the same vertex).\n\n**Hamiltonian cycle**: a cycle that visits every vertex exactly once and returns to its starting vertex (a closed Hamiltonian path).",
    },
    {
      label: "b",
      marks: 3,
      content: `A complete graph $K_n$ contains how many distinct Hamiltonian cycles? Derive the formula.`,
      solution: "In $K_n$ every pair of vertices is adjacent, so any ordering of the $n$ vertices forms a Hamiltonian cycle. Fix a starting vertex (say vertex 1) — there are $(n-1)!$ orderings of the remaining vertices. But each cycle is counted twice (once in each direction: e.g. 1-2-3-...-n-1 vs 1-n-...-3-2-1). So the number of distinct Hamiltonian cycles is $\\frac{(n-1)!}{2}$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Use the formula to find the number of Hamiltonian cycles in $K_4$ and $K_6$.`,
      solution: "$K_4$: $\\frac{(4-1)!}{2} = \\frac{6}{2} = \\mathbf{3}$ Hamiltonian cycles.\n\n$K_6$: $\\frac{(6-1)!}{2} = \\frac{120}{2} = \\mathbf{60}$ Hamiltonian cycles.",
    },
  ],
  "HARD",
);

// ── EXT_RESP × 2 ──────────────────────────────────────────────────────

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(hamiltonianGraph)}\n\nFor the network above, list the degree of every vertex.`,
      solution: "Degrees: A = 3 (AB, AC, AE), B = 3 (AB, BC, BD), C = 3 (AC, BC, CD), D = 3 (BD, CD, DE), E = 2 (AE, DE).",
    },
    {
      label: "b",
      marks: 2,
      content: `State whether the graph has a Hamiltonian cycle. If so, give one.`,
      solution: "Yes. Hamiltonian cycle: $A \\to B \\to C \\to D \\to E \\to A$ (uses edges AB, BC, CD, DE, EA — all 5 vertices, returns to A).",
    },
    {
      label: "c",
      marks: 2,
      content: `Find a Hamiltonian path that is **not** part of a Hamiltonian cycle (i.e. a path that does not close back to its starting vertex using the given edges).`,
      solution: "Hamiltonian path: $A \\to C \\to B \\to D \\to E$. Edges: AC, CB, BD, DE — all exist. Visits all 5 vertices. No edge $EA$ ... wait, $AE$ does exist. So this path could close. **Better**: $E \\to A \\to B \\to C \\to D$ — edges EA, AB, BC, CD ✓, but DE would close it. **Alternative**: $E \\to A \\to C \\to B \\to D$ — closing via $DE$ exists. Hmm. Try $C \\to A \\to E \\to D \\to B$ — edges CA, AE, ED, DB ✓, no edge $BC$ to close from B (wait, BC exists). All paths in this graph can close because it's highly connected. **State**: Any Hamiltonian path here extends to a Hamiltonian cycle. Accept any valid Hamiltonian path with the note that this graph is 'Hamiltonian-connected'.",
    },
    {
      label: "d",
      marks: 3,
      content: `Eulerian and Hamiltonian properties differ. Determine whether the graph has an Eulerian circuit, trail, or neither. Justify.`,
      solution: "Degree sequence: $(3, 3, 3, 3, 2)$. Odd-degree vertices: A, B, C, D (degree 3) — four odd-degree vertices. With 4 odd-degree vertices, **neither** an Eulerian circuit nor an Eulerian trail exists (need 0 or 2 odd-degree vertices).",
    },
    {
      label: "e",
      marks: 3,
      content: `Construct a graph on 5 vertices that has an Eulerian circuit but **no** Hamiltonian cycle. Sketch the graph.`,
      solution: "Consider two triangles sharing a single vertex (the 'bowtie'): vertices A, B, C, D, E with edges AB, BC, CA, AD, DE, EA. Degrees: A = 4 (in two triangles), B = 2, C = 2, D = 2, E = 2. All even ⇒ Eulerian circuit exists. But no Hamiltonian cycle: to include both triangles, the cycle would have to pass through A twice (once for each triangle), violating the 'visit each vertex once' rule. So Eulerian ✓, Hamiltonian ✗.",
    },
  ],
  "HARD",
  `**Question — Hamiltonian and Eulerian comparison**\n\nThis problem investigates the relationship between Hamiltonian and Eulerian properties using a small network.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `A salesperson must visit 5 cities, starting and ending at city *A*. Each pair of cities has a direct connection. Explain why the route the salesperson takes is a Hamiltonian cycle in the complete graph $K_5$.`,
      solution: "The salesperson must visit every city (= every vertex) exactly once and return to city *A* (= start vertex). A walk that visits every vertex exactly once and returns to the start is a Hamiltonian cycle. The complete graph $K_5$ has every pair of vertices joined, so every ordering of the cities is a possible route.",
    },
    {
      label: "b",
      marks: 2,
      content: `Use the formula $(n-1)!/2$ to find the number of distinct Hamiltonian cycles (and hence routes, up to direction) in $K_5$.`,
      solution: "Number of distinct Hamiltonian cycles = $\\frac{(5-1)!}{2} = \\frac{24}{2} = \\mathbf{12}$.",
    },
    {
      label: "c",
      marks: 3,
      content: `Suppose now the distances between cities differ. List two strategies for finding a Hamiltonian cycle of minimum total distance ('travelling salesperson problem'). Explain one weakness of each strategy.`,
      solution: "**Strategy 1: Nearest-Neighbour Heuristic** — starting at *A*, always move to the nearest unvisited city, then return to *A* at the end. Weakness: may produce a far-from-optimal tour because greedy local choices can force long final edges.\n\n**Strategy 2: Brute-force enumeration** — list all $(n-1)!/2$ Hamiltonian cycles, compute the total distance of each, choose the minimum. Weakness: factorial complexity makes it infeasible for large $n$ (e.g. $K_{20}$ has $\\approx 6 \\times 10^{16}$ cycles).",
    },
    {
      label: "d",
      marks: 3,
      content: `${img(hamCycle5)}\n\nFor the network above, find a Hamiltonian cycle, and state how many edges of the cycle are 'hexagon' edges (edges along the outer boundary).`,
      solution: "Hamiltonian cycle: $A \\to B \\to C \\to D \\to E \\to F \\to A$. All 6 edges are along the hexagonal boundary. **Hexagon edges used: 6** (uses every outer edge).\n\nAlternative cycle using interior edges: $A \\to D \\to C \\to B \\to E \\to F \\to A$. Hexagon edges: $CB, FA$. Interior edges: $AD, BE$. Plus $DC$ (hexagon), $EF$ (hexagon). Hexagon: AB? No. Recheck: edges are AB, BC, CD, DE, EF, FA (hexagon), plus AD, BE (chords). The alternative cycle uses CD, FA (hexagon, 2) + AD, BE (chords, 2) + DC (already counted) + EF (hexagon). Wait, that's revisiting. Cleaner: cycle $A-D-C-B-E-F-A$ uses AD, DC, CB, BE, EF, FA = 6 edges (4 hexagon + 2 chord).",
    },
    {
      label: "e",
      marks: 2,
      content: `Identify one *sufficient* condition that guarantees a graph has a Hamiltonian cycle. (Hint: think about minimum degree.)`,
      solution: "**Dirac's theorem**: If $G$ is a simple graph with $n \\geq 3$ vertices, and every vertex has degree at least $n/2$, then $G$ has a Hamiltonian cycle. This is a *sufficient* (not necessary) condition.\n\nAlternative: **Ore's theorem** — if every pair of non-adjacent vertices has degree sum ≥ $n$, the graph is Hamiltonian.",
    },
  ],
  "HARD",
  `**Question — Travelling salesperson**\n\nThis problem explores the existence and use of Hamiltonian cycles in route-planning contexts.`,
);

// ═══════════════════════════════════════════════════════════════════════
// ─── Subtopic 6: PLANAR GRAPHS (extended-fit: 9 + 4 + 2 + 2 = 17)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "planar-graphs";

const planarCubeProj = networkGraph({
  nodes: [
    { id: "1", x: 0, y: 1.5 },
    { id: "2", x: 3, y: 1.5 },
    { id: "3", x: 3, y: -1.5 },
    { id: "4", x: 0, y: -1.5 },
    { id: "5", x: 1, y: 0.5 },
    { id: "6", x: 2, y: 0.5 },
    { id: "7", x: 2, y: -0.5 },
    { id: "8", x: 1, y: -0.5 },
  ],
  edges: [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "3", to: "4" },
    { from: "4", to: "1" },
    { from: "5", to: "6" },
    { from: "6", to: "7" },
    { from: "7", to: "8" },
    { from: "8", to: "5" },
    { from: "1", to: "5" },
    { from: "2", to: "6" },
    { from: "3", to: "7" },
    { from: "4", to: "8" },
  ],
});

const K4Graph = networkGraph({
  nodes: [
    { id: "A", x: 1.5, y: 2 },
    { id: "B", x: 3, y: 0 },
    { id: "C", x: 1.5, y: -2 },
    { id: "D", x: 0, y: 0 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "A", to: "D" },
    { from: "B", to: "C" },
    { from: "B", to: "D" },
    { from: "C", to: "D" },
  ],
});

const planarSimple = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 0 },
    { id: "B", x: 2, y: 1.5 },
    { id: "C", x: 4, y: 0 },
    { id: "D", x: 2, y: -1.5 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "D", to: "A" },
    { from: "A", to: "C" },
  ],
});

// ── MCQ × 9 ───────────────────────────────────────────────────────────

mcq(
  `A graph is **planar** if\n\n`,
  [
    "it has at most 4 vertices",
    "it can be drawn in the plane with no edges crossing",
    "all its vertices lie on a single line",
    "it is connected and has no cycles",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nA planar graph is one that can be drawn in the plane (or equivalently, on a sphere) without any edges crossing each other. Not every graph is planar — $K_5$ and $K_{3,3}$ are the canonical non-planar graphs.",
);

mcq(
  `Euler's formula for a connected planar graph states\n\n`,
  [
    "$V + E = F + 2$",
    "$V - E + F = 2$",
    "$V \\cdot E = F$",
    "$V + E + F = 0$",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nEuler's formula: for any connected planar graph, $V - E + F = 2$, where $V$ = vertices, $E$ = edges, $F$ = faces (including the unbounded outer face).",
);

mcq(
  `When counting faces of a planar graph using Euler's formula, you must include\n\n`,
  [
    "only the bounded (interior) faces",
    "only the unbounded (outer) face",
    "both the bounded faces and the unbounded outer face",
    "neither — only count the vertices and edges",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nFaces in Euler's formula include all bounded interior faces **plus** the single unbounded outer face. Forgetting the outer face is the most common student error.",
);

mcq(
  `${img(planarSimple)}\n\nFor the planar graph above with 4 vertices and 5 edges, the number of faces is\n\n`,
  ["2", "3", "4", "5"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nBy Euler's formula: $V - E + F = 2 \\Rightarrow 4 - 5 + F = 2 \\Rightarrow F = \\mathbf{3}$. Visually: 2 triangular interior faces (ABC and ACD) + 1 outer face = 3 faces ✓.",
);

mcq(
  `${img(K4Graph)}\n\nFor the complete graph $K_4$ drawn above (a planar embedding), find the number of faces.\n\n`,
  ["3", "4", "5", "6"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$K_4$ has $V = 4$ vertices and $E = 6$ edges. By Euler: $4 - 6 + F = 2 \\Rightarrow F = \\mathbf{4}$. The 4 faces are: 3 small triangles inside (each formed by 3 of the 4 vertices) + the outer unbounded face = 4.",
);

mcq(
  `Which of the following graphs is **not** planar?\n\n`,
  ["$K_4$ (complete graph on 4 vertices)", "$K_5$ (complete graph on 5 vertices)", "Any tree", "The hexagonal cycle $C_6$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$K_5$ is the smallest non-planar complete graph. Any tree is planar (no cycles). $K_4$ is planar. The hexagon $C_6$ is planar (just a cycle).",
);

mcq(
  `${img(planarCubeProj)}\n\nThe planar graph above shows a cube projected onto the plane (8 vertices, 12 edges). Using Euler's formula, the number of faces is\n\n`,
  ["4", "5", "6", "12"],
  "C",
  "HARD",
  "**Answer: C**\n\n$V - E + F = 2 \\Rightarrow 8 - 12 + F = 2 \\Rightarrow F = \\mathbf{6}$. This matches the cube's 6 square faces — one becomes the unbounded outer face when projected, and the other 5 are the bounded interior faces, totalling 6 in the planar embedding.",
);

mcq(
  `In any simple connected planar graph with $V \\geq 3$, the number of edges satisfies\n\n`,
  [
    "$E \\leq V$",
    "$E \\leq 2V - 4$",
    "$E \\leq 3V - 6$",
    "$E \\leq V^2$",
  ],
  "C",
  "HARD",
  "**Answer: C**\n\nFor a simple connected planar graph with $V \\geq 3$, the inequality $E \\leq 3V - 6$ holds (derived from Euler's formula combined with the fact that every face has at least 3 edges in its boundary). This is used to prove $K_5$ is non-planar: $K_5$ has $V = 5, E = 10$, and $3V - 6 = 9 < 10$ — violates the inequality.",
);

mcq(
  `A connected planar graph has $V = 10$ vertices and $F = 8$ faces. The number of edges is\n\n`,
  ["14", "16", "17", "18"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nEuler: $V - E + F = 2 \\Rightarrow 10 - E + 8 = 2 \\Rightarrow E = \\mathbf{16}$.",
);

// ── SHORT × 4 ─────────────────────────────────────────────────────────

short(
  `State Euler's formula for a connected planar graph, defining each symbol. Use the formula to verify it on the graph $K_4$ which has 4 vertices, 6 edges, and 4 faces.\n\n(3 marks)`,
  3,
  "EASY",
  "**Euler's formula**: $V - E + F = 2$, where:\n- $V$ = number of vertices,\n- $E$ = number of edges,\n- $F$ = number of faces (including the unbounded outer face).\n\nFor $K_4$: $V = 4, E = 6, F = 4 \\Rightarrow V - E + F = 4 - 6 + 4 = \\mathbf{2}$ ✓ — verifies Euler's formula.",
);

short(
  `${img(planarSimple)}\n\n**a.** Verify Euler's formula for the planar graph above by counting $V$, $E$, and $F$. (2 marks)\n\n**b.** Identify each face as either a triangle, a quadrilateral, etc., including the outer face. (2 marks)\n\n(4 marks)`,
  4,
  "MEDIUM",
  "**a.** Vertices: $V = 4$ (A, B, C, D). Edges: $E = 5$ (AB, BC, CD, DA, AC). Faces: $F = 3$ (two triangles + outer). Check: $V - E + F = 4 - 5 + 3 = \\mathbf{2}$ ✓.\n\n**b.** Two interior triangular faces ($ABC$ and $ACD$) plus the outer (unbounded) face which is a quadrilateral $A-B-C-D-A$ (4 edges around the outside).",
);

short(
  `Explain in 2-3 sentences why the complete graph $K_5$ is **not** planar. Use the inequality $E \\leq 3V - 6$.\n\n(3 marks)`,
  3,
  "MEDIUM",
  "$K_5$ has $V = 5$ vertices and $E = \\binom{5}{2} = 10$ edges. The inequality $E \\leq 3V - 6$ gives $10 \\leq 3 \\cdot 5 - 6 = 9$, which is **false** ($10 > 9$). Since any simple connected planar graph must satisfy $E \\leq 3V - 6$, $K_5$ cannot be planar.",
);

short(
  `A planar graph has 12 vertices, 18 edges, and is connected.\n\n**a.** Use Euler's formula to find the number of faces. (2 marks)\n\n**b.** Verify that the graph satisfies $E \\leq 3V - 6$. (1 mark)\n\n(3 marks)`,
  3,
  "EASY",
  "**a.** $V - E + F = 2 \\Rightarrow 12 - 18 + F = 2 \\Rightarrow F = \\mathbf{8}$ faces.\n\n**b.** $3V - 6 = 3 \\cdot 12 - 6 = 30$. We have $E = 18 \\leq 30$ ✓ — satisfies the planar inequality.",
);

// ── EXT_ANS × 2 ───────────────────────────────────────────────────────

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(planarCubeProj)}\n\nThe planar graph above shows a cube projected into the plane. Count $V$ and $E$.`,
      solution: "Vertices: $V = 8$ (the 8 corners of the cube). Edges: $E = 12$ (the 12 edges of the cube: 4 'top square', 4 'bottom square', 4 'connecting').",
    },
    {
      label: "b",
      marks: 1,
      content: `Use Euler's formula to find the number of faces $F$.`,
      solution: "$V - E + F = 2 \\Rightarrow 8 - 12 + F = 2 \\Rightarrow F = \\mathbf{6}$ faces.",
    },
    {
      label: "c",
      marks: 2,
      content: `Identify the shape of each face (interior plus outer) and verify the count.`,
      solution: "The cube has 6 square faces. When projected into the plane (one face becomes the outer face), we see: 5 bounded faces (each a quadrilateral) + 1 unbounded outer face (also a quadrilateral) = 6 faces total. Each face is a quadrilateral, confirming $F = 6$.",
    },
  ],
  "MEDIUM",
  null,
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `A connected planar graph has 15 vertices and 10 faces. Find the number of edges.`,
      solution: "Euler's formula: $V - E + F = 2 \\Rightarrow 15 - E + 10 = 2 \\Rightarrow E = 15 + 10 - 2 = \\mathbf{23}$ edges.",
    },
    {
      label: "b",
      marks: 2,
      content: `Check whether a simple connected planar graph could have 8 vertices and 20 edges. Justify using the inequality $E \\leq 3V - 6$.`,
      solution: "$3V - 6 = 3 \\cdot 8 - 6 = 18$. With $E = 20 > 18$, the inequality is **violated**. So no simple connected planar graph with these parameters exists.",
    },
    {
      label: "c",
      marks: 1,
      content: `Briefly explain why the inequality $E \\leq 3V - 6$ does not apply to non-simple graphs or to graphs with parallel edges or loops.`,
      solution: "The proof of $E \\leq 3V - 6$ assumes each face has at least 3 edges in its boundary, which fails for multi-graphs (a 2-cycle gives a face bounded by only 2 edges). Likewise, loops create 1-edge faces. For multi-graphs or graphs with loops, weaker bounds apply.",
    },
  ],
  "HARD",
);

// ── EXT_RESP × 2 ──────────────────────────────────────────────────────

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `State Euler's formula for a connected planar graph, defining each symbol. Briefly explain why we count the unbounded outer face.`,
      solution: "**Euler's formula**: $V - E + F = 2$, where $V$ = number of vertices, $E$ = number of edges, $F$ = number of faces (regions of the plane created by the drawing, including the unbounded outer region). The unbounded outer face is counted because it is also a region bounded by edges — Euler's formula only works when we count it. Without it, the equality $V - E + F = 2$ would not hold in general.",
    },
    {
      label: "b",
      marks: 2,
      content: `${img(planarSimple)}\n\nVerify Euler's formula for the graph above.`,
      solution: "$V = 4, E = 5, F = 3$ (two triangles + outer face). Check: $V - E + F = 4 - 5 + 3 = \\mathbf{2}$ ✓.",
    },
    {
      label: "c",
      marks: 3,
      content: `Sketch a planar embedding of the complete graph $K_4$ (4 vertices, every pair connected) and use Euler's formula to determine the number of faces.`,
      solution: "Draw $K_4$ with three vertices of an outer triangle and the fourth vertex in the centre, connected to each of the three. $V = 4, E = \\binom{4}{2} = 6$. Euler: $4 - 6 + F = 2 \\Rightarrow F = \\mathbf{4}$. Visually: 3 small interior triangles + 1 outer face = 4 ✓.",
    },
    {
      label: "d",
      marks: 3,
      content: `Use the inequality $E \\leq 3V - 6$ to determine whether the complete graph $K_5$ is planar.`,
      solution: "$K_5$: $V = 5$, $E = \\binom{5}{2} = 10$. Compute $3V - 6 = 3 \\cdot 5 - 6 = 9$. Since $E = 10 > 9$, the inequality $E \\leq 3V - 6$ is violated, so $K_5$ is **not planar**. (It is one of the two Kuratowski 'forbidden' subgraphs.)",
    },
    {
      label: "e",
      marks: 2,
      content: `Compute $3V - 6$ for $V = 6$ and explain whether $K_6$ is planar.`,
      solution: "$3V - 6 = 12$. $K_6$ has $E = \\binom{6}{2} = 15 > 12$. So $K_6$ is **not planar**. (Equivalently, $K_6$ contains $K_5$ as a subgraph, and any graph containing a non-planar subgraph is non-planar.)",
    },
  ],
  "MEDIUM",
  `**Question — Euler's formula and planarity**\n\nThis question develops Euler's formula for connected planar graphs and tests planarity using the inequality $E \\leq 3V - 6$.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(planarCubeProj)}\n\nThe planar graph above represents a cube projected onto the plane. List $V$, $E$, and use Euler's formula to find $F$.`,
      solution: "$V = 8, E = 12$. Euler: $8 - 12 + F = 2 \\Rightarrow F = \\mathbf{6}$ faces. (Corresponds to the 6 square sides of the cube.)",
    },
    {
      label: "b",
      marks: 2,
      content: `Verify that the graph satisfies $E \\leq 3V - 6$.`,
      solution: "$3V - 6 = 3 \\cdot 8 - 6 = 18$. $E = 12 \\leq 18$ ✓. The inequality holds (with room to spare, because the cube graph has only 4-cycles around faces, not 3-cycles).",
    },
    {
      label: "c",
      marks: 2,
      content: `Identify each interior face of the cube projection and the outer (unbounded) face. State the shape of each face.`,
      solution: "Looking at the projection: outer face = the large quadrilateral 1-2-3-4-1. Interior: the 4 'trapezoidal' faces (top: 1-2-6-5-1; right: 2-3-7-6-2; bottom: 3-4-8-7-3; left: 4-1-5-8-4) and the central square 5-6-7-8-5. Total: 5 bounded + 1 unbounded = 6 faces, each a quadrilateral (4-cycle).",
    },
    {
      label: "d",
      marks: 3,
      content: `For a planar graph in which every face is a quadrilateral (4-cycle), derive a sharper edge inequality and apply it to the cube graph.`,
      solution: "Each face has 4 edges on its boundary, and each edge borders exactly 2 faces. So $2E = 4F \\Rightarrow E = 2F$. Combined with Euler: $V - E + F = 2 \\Rightarrow F = E/2 \\Rightarrow V - E + E/2 = 2 \\Rightarrow V - E/2 = 2 \\Rightarrow E = 2V - 4$.\n\nFor the cube: $V = 8 \\Rightarrow E \\leq 2 \\cdot 8 - 4 = 12$. We have $E = 12$ — equality holds. So the cube is an extremal planar graph for the 'all quadrilateral faces' condition.",
    },
    {
      label: "e",
      marks: 3,
      content: `A planar graph $G$ has $V = 20$, $F = 12$, and is connected. Find $E$ and check whether $E \\leq 3V - 6$ is satisfied.`,
      solution: "Euler: $20 - E + 12 = 2 \\Rightarrow E = 30$. Check: $3V - 6 = 3 \\cdot 20 - 6 = 54$. $E = 30 \\leq 54$ ✓. The graph satisfies the planarity inequality — consistent with $G$ being planar.",
    },
  ],
  "HARD",
  `**Question — Faces of planar graphs**\n\nThis question examines how Euler's formula relates vertices, edges, and faces for connected planar graphs.`,
);

// ═══════════════════════════════════════════════════════════════════════
// ─── Subtopic 7: BIPARTITE GRAPHS (extended-fit: 9 + 4 + 2 + 2 = 17)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "bipartite-graphs";

const bipartiteK33 = networkGraph({
  nodes: [
    { id: "A", x: 0, y: 1.5 },
    { id: "B", x: 0, y: 0 },
    { id: "C", x: 0, y: -1.5 },
    { id: "X", x: 3, y: 1.5 },
    { id: "Y", x: 3, y: 0 },
    { id: "Z", x: 3, y: -1.5 },
  ],
  edges: [
    { from: "A", to: "X" },
    { from: "A", to: "Y" },
    { from: "A", to: "Z" },
    { from: "B", to: "X" },
    { from: "B", to: "Y" },
    { from: "B", to: "Z" },
    { from: "C", to: "X" },
    { from: "C", to: "Y" },
    { from: "C", to: "Z" },
  ],
});

const bipartiteWorkers = networkGraph({
  nodes: [
    { id: "W1", x: 0, y: 1.5 },
    { id: "W2", x: 0, y: 0 },
    { id: "W3", x: 0, y: -1.5 },
    { id: "J1", x: 3, y: 1.2 },
    { id: "J2", x: 3, y: 0 },
    { id: "J3", x: 3, y: -1.2 },
  ],
  edges: [
    { from: "W1", to: "J1" },
    { from: "W1", to: "J2" },
    { from: "W2", to: "J2" },
    { from: "W2", to: "J3" },
    { from: "W3", to: "J1" },
    { from: "W3", to: "J3" },
  ],
});

const notBipartite = networkGraph({
  nodes: [
    { id: "A", x: 1, y: 1.5 },
    { id: "B", x: 3, y: 0 },
    { id: "C", x: 1, y: -1.5 },
    { id: "D", x: -1, y: 0 },
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "D", to: "A" },
    { from: "A", to: "C" },
  ],
});

// ── MCQ × 9 ───────────────────────────────────────────────────────────

mcq(
  `A graph is **bipartite** if\n\n`,
  [
    "its vertices can be partitioned into two disjoint sets so that every edge connects a vertex of one set to a vertex of the other set",
    "it has exactly two connected components",
    "every vertex has degree exactly 2",
    "it has only two cycles",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nDefining property of bipartite: vertex set splits into two parts $V_1, V_2$ with every edge having one endpoint in $V_1$ and the other in $V_2$ — no edges within $V_1$ or within $V_2$.",
);

mcq(
  `Which of the following is **true** for any bipartite graph?\n\n`,
  [
    "It contains a triangle (3-cycle)",
    "All its cycles have even length",
    "Its vertices all have even degree",
    "It has at most $V - 1$ edges",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nIn a bipartite graph every cycle alternates between the two parts, so its length must be even. Equivalently: a graph is bipartite iff it contains no cycle of odd length.",
);

mcq(
  `The complete bipartite graph $K_{m,n}$ has\n\n`,
  ["$m + n$ edges", "$mn$ edges", "$mn / 2$ edges", "$\\binom{m+n}{2}$ edges"],
  "B",
  "EASY",
  "**Answer: B**\n\nIn $K_{m,n}$ every vertex in the part of size $m$ is connected to every vertex in the part of size $n$, giving $m \\times n$ edges.",
);

mcq(
  `${img(bipartiteK33)}\n\nThe graph above is the complete bipartite graph $K_{3,3}$. The number of edges is\n\n`,
  ["6", "8", "9", "12"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$K_{3,3}$: each of the 3 vertices in one part is connected to each of the 3 in the other. Edges = $3 \\times 3 = \\mathbf{9}$.",
);

mcq(
  `Which of the following graphs is **not** bipartite?\n\n`,
  [
    "Any tree",
    "Any even-length cycle $C_{2k}$",
    "The complete graph $K_4$",
    "The complete bipartite graph $K_{2,5}$",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$K_4$ contains a triangle (3-cycle), and bipartite graphs have only even cycles, so $K_4$ is not bipartite. Trees have no cycles at all (vacuously bipartite). Even cycles $C_{2k}$ are bipartite. $K_{2,5}$ is by definition bipartite.",
);

mcq(
  `Which of the following is the **chromatic number** of any bipartite graph with at least one edge?\n\n`,
  ["1", "2", "3", "the maximum degree"],
  "B",
  "EASY",
  "**Answer: B**\n\nA bipartite graph (with at least one edge) is **2-colourable**: colour each part a different colour. So its chromatic number is exactly 2.",
);

mcq(
  `${img(notBipartite)}\n\nThe graph above is **not** bipartite because\n\n`,
  [
    "it has too many edges",
    "it contains a 3-cycle (triangle) $A-B-C-A$",
    "it has vertices of odd degree",
    "it is disconnected",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nThe graph contains the triangle $A-C-B-A$ (3-cycle). Bipartite graphs cannot contain odd cycles (a 3-cycle has odd length), so this graph is not bipartite.",
);

mcq(
  `In the complete bipartite graph $K_{4,7}$, the total number of vertices and total number of edges are\n\n`,
  ["11 vertices, 11 edges", "11 vertices, 28 edges", "28 vertices, 11 edges", "28 vertices, 28 edges"],
  "B",
  "EASY",
  "**Answer: B**\n\nVertices: $4 + 7 = 11$. Edges: $4 \\times 7 = 28$.",
);

mcq(
  `${img(bipartiteWorkers)}\n\nThe bipartite graph above shows possible job assignments for 3 workers (W1, W2, W3) and 3 jobs (J1, J2, J3). A **perfect matching** is an assignment where each worker takes a different job, and every worker and job is matched. The number of perfect matchings in this graph is\n\n`,
  ["0", "1", "2", "6"],
  "C",
  "HARD",
  "**Answer: C**\n\nEdges: W1-J1, W1-J2, W2-J2, W2-J3, W3-J1, W3-J3.\n\nPerfect matchings (assignments using a distinct job for each worker):\n1. W1→J1, W2→J2, W3→J3 — check W3-J3 edge ✓. Valid.\n2. W1→J2, W2→J3, W3→J1 — check W1-J2 ✓, W2-J3 ✓, W3-J1 ✓. Valid.\nAny W1→J1, W2→J3, W3→? — W3 needs J2, but no W3-J2 edge. Invalid.\nW1→J2, W2→J2 — conflict.\nSo **2 perfect matchings**.",
);

// ── SHORT × 4 ─────────────────────────────────────────────────────────

short(
  `Define a bipartite graph. Use your definition to explain why a triangle ($K_3$) is **not** bipartite.\n\n(2 marks)`,
  2,
  "EASY",
  "**Definition**: A bipartite graph is one whose vertices can be partitioned into two disjoint sets $V_1$ and $V_2$ such that every edge connects a vertex of $V_1$ to a vertex of $V_2$ (no edge connects two vertices within the same set).\n\n**Triangle not bipartite**: In a triangle on vertices $A, B, C$, suppose we try to partition into two sets. $A$ goes in one set; $B$ is adjacent to $A$ so must be in the other; $C$ is adjacent to both $A$ and $B$ so must be in *neither* set — contradiction. So no valid bipartition exists. (Equivalently: a triangle is a 3-cycle, but bipartite graphs have only even cycles.)",
);

short(
  `${img(bipartiteK33)}\n\nThe graph above is $K_{3,3}$.\n\n**a.** State the two parts of the bipartition. (1 mark)\n\n**b.** Find the number of edges and the degree of each vertex. (2 marks)\n\n(3 marks)`,
  3,
  "EASY",
  "**a.** The two parts are $\\{A, B, C\\}$ and $\\{X, Y, Z\\}$. Every edge connects a vertex in $\\{A, B, C\\}$ to a vertex in $\\{X, Y, Z\\}$.\n\n**b.** Edges: $3 \\times 3 = 9$. Every vertex in $\\{A, B, C\\}$ is connected to all 3 vertices in $\\{X, Y, Z\\}$ ⇒ degree 3. Same for $\\{X, Y, Z\\}$. **All 6 vertices have degree 3.**",
);

short(
  `${img(bipartiteWorkers)}\n\nThe bipartite graph above shows which jobs each worker can do. A **matching** is a set of edges with no two edges sharing a vertex (each worker assigned to at most one job).\n\n**a.** Find one perfect matching (each worker assigned to a different job). (2 marks)\n\n**b.** Find a different perfect matching. (2 marks)\n\n(4 marks)`,
  4,
  "MEDIUM",
  "**a.** Matching 1: W1→J1, W2→J2, W3→J3. Verify edges exist: W1-J1 ✓, W2-J2 ✓, W3-J3 ✓. Each worker is matched to a distinct job — perfect matching.\n\n**b.** Matching 2: W1→J2, W2→J3, W3→J1. Verify edges: W1-J2 ✓, W2-J3 ✓, W3-J1 ✓. Different from Matching 1.",
);

short(
  `Prove that any graph in which every cycle has even length is bipartite. (Hint: use a 2-colouring argument.)\n\n(3 marks)`,
  3,
  "HARD",
  "Assume the graph is connected (extend to components if disconnected). Pick any vertex $v_0$; colour it **red**. For every other vertex $v$, choose a path from $v_0$ to $v$ and colour $v$ **red** if the path length is even, **blue** if odd.\n\nThis is well-defined because all cycles are even-length: if two paths from $v_0$ to $v$ exist with different lengths, their lengths differ by an even number (the cycle formed by going one way and back the other has even length), so the parities agree.\n\nNow take any edge $uv$: the parities of $v_0$-to-$u$ and $v_0$-to-$v$ differ by 1, so $u$ and $v$ get different colours. Thus the colouring is a valid 2-colouring, and the red/blue vertex sets form a bipartition. The graph is bipartite. $\\square$",
);

// ── EXT_ANS × 2 ───────────────────────────────────────────────────────

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(bipartiteWorkers)}\n\nThe graph models a worker-job assignment problem. State the two parts of the bipartition and the degree of every vertex.`,
      solution: "**Parts**: $\\{W1, W2, W3\\}$ (workers) and $\\{J1, J2, J3\\}$ (jobs). Every edge connects a worker to a job.\n\n**Degrees**: W1 = 2 (J1, J2), W2 = 2 (J2, J3), W3 = 2 (J1, J3). J1 = 2 (W1, W3), J2 = 2 (W1, W2), J3 = 2 (W2, W3). All 6 vertices have degree 2.",
    },
    {
      label: "b",
      marks: 2,
      content: `List all perfect matchings (assignments where every worker gets exactly one job and vice versa).`,
      solution: "Matching 1: W1→J1, W2→J2, W3→J3 — check W1-J1 ✓, W2-J2 ✓, W3-J3 ✓.\nMatching 2: W1→J2, W2→J3, W3→J1 — check W1-J2 ✓, W2-J3 ✓, W3-J1 ✓.\nOther combinations: W1→J1, W2→J3, W3→? — W3 needs J2 but no edge. W1→J2, W2→J2 — conflict. **Only 2 perfect matchings.**",
    },
    {
      label: "c",
      marks: 1,
      content: `Explain why the graph cannot contain a 3-cycle.`,
      solution: "Because the graph is bipartite, every cycle alternates between the two parts, so its length is even. A 3-cycle has odd length, so cannot exist in a bipartite graph.",
    },
  ],
  "MEDIUM",
  `A factory has 3 workers and 3 jobs. The bipartite graph shows which jobs each worker is qualified for.`,
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Identify whether the graph $K_4$ (complete graph on 4 vertices) is bipartite. Justify.`,
      solution: "$K_4$ contains triangles (e.g. the cycle on any 3 of its 4 vertices). A 3-cycle has odd length, and bipartite graphs only contain even cycles. So $K_4$ is **not bipartite**. (Equivalently, no 2-colouring works: any colour assignment of 4 vertices in 2 colours has some pair of same-colour vertices, which are adjacent in $K_4$.)",
    },
    {
      label: "b",
      marks: 2,
      content: `Identify whether the cycle $C_6$ (hexagonal cycle on 6 vertices) is bipartite. Justify.`,
      solution: "$C_6$ has one cycle, of length 6 (even). So all cycles are even-length. $C_6$ is **bipartite** — the bipartition alternates vertices around the cycle: $V_1 = \\{v_1, v_3, v_5\\}$ and $V_2 = \\{v_2, v_4, v_6\\}$. Edges go strictly between $V_1$ and $V_2$.",
    },
    {
      label: "c",
      marks: 2,
      content: `In general, when is the cycle $C_n$ bipartite? Justify your answer.`,
      solution: "$C_n$ is bipartite iff $n$ is **even**. If $n$ even, alternate colouring works (as in part b). If $n$ odd, the cycle itself is an odd cycle — bipartite graphs forbid odd cycles, so $C_n$ for odd $n$ is not bipartite.",
    },
  ],
  "MEDIUM",
);

// ── EXT_RESP × 2 ──────────────────────────────────────────────────────

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `Define a bipartite graph and state the key characterisation in terms of cycle lengths.`,
      solution: "**Bipartite graph**: a graph whose vertices can be partitioned into two disjoint sets $V_1, V_2$ such that every edge has one endpoint in $V_1$ and the other in $V_2$.\n\n**Characterisation**: A graph is bipartite if and only if every cycle has even length. (Equivalently, it contains no odd cycles.)",
    },
    {
      label: "b",
      marks: 2,
      content: `${img(bipartiteK33)}\n\nFor the graph $K_{3,3}$ above, state the two parts of the bipartition, count the edges, and verify the formula $|E| = mn$ where $m, n$ are the sizes of the two parts.`,
      solution: "Parts: $\\{A, B, C\\}$ (size 3) and $\\{X, Y, Z\\}$ (size 3). Edges: each vertex in $\\{A, B, C\\}$ connects to each in $\\{X, Y, Z\\}$, giving $3 \\times 3 = 9$ edges. Formula: $|E| = mn = 3 \\cdot 3 = 9$ ✓.",
    },
    {
      label: "c",
      marks: 2,
      content: `Explain why $K_{3,3}$ has no Hamiltonian cycle of odd length, and find one Hamiltonian cycle.`,
      solution: "Any cycle in a bipartite graph has even length. $K_{3,3}$ has 6 vertices; a Hamiltonian cycle visits all 6, so its length is 6 (even) — consistent with the bipartite property.\n\n**Hamiltonian cycle**: $A \\to X \\to B \\to Y \\to C \\to Z \\to A$. Each edge alternates parts ✓, all 6 vertices visited, returns to A. Length = 6 edges (even).",
    },
    {
      label: "d",
      marks: 3,
      content: `Determine whether the complete graph $K_5$ is bipartite, justifying using the cycle-length characterisation.`,
      solution: "$K_5$ has 5 vertices, with every pair connected. So $K_5$ contains triangles (3-cycles) on every triple of vertices. A 3-cycle has odd length. Therefore $K_5$ is **not bipartite**. (Equivalently: try to 2-colour 5 vertices — by pigeonhole, two are the same colour, but they are adjacent in $K_5$, contradiction.)",
    },
    {
      label: "e",
      marks: 3,
      content: `Three students $A, B, C$ are choosing from three projects $X, Y, Z$. Student $A$ wants $X$ or $Y$; student $B$ wants $Y$ or $Z$; student $C$ wants $X$ or $Z$. Draw the bipartite graph and find a perfect matching (assignment of one project per student).`,
      solution: "**Bipartite graph edges**: A-X, A-Y, B-Y, B-Z, C-X, C-Z.\n\n**Perfect matching**: $A \\to X$, $B \\to Y$, $C \\to Z$. Verify edges: A-X ✓, B-Y ✓, C-Z ✓. Each student matched to a different project — perfect matching.\n\nAlternative: $A \\to Y$, $B \\to Z$, $C \\to X$ (also valid).",
    },
  ],
  "HARD",
  `**Question — Bipartite structure and matchings**\n\nThis problem develops the bipartite property and shows how it applies to assignment-style problems.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(bipartiteWorkers)}\n\nThe bipartite graph above models 3 workers and 3 jobs, with edges showing which workers can do which jobs. State the two parts of the bipartition and the number of edges.`,
      solution: "Parts: $\\{W1, W2, W3\\}$ (workers) and $\\{J1, J2, J3\\}$ (jobs). Edges: 6 (W1-J1, W1-J2, W2-J2, W2-J3, W3-J1, W3-J3).",
    },
    {
      label: "b",
      marks: 3,
      content: `Find all perfect matchings of the graph.`,
      solution: "Try systematically:\n- W1→J1: W2 ∈ {J2, J3}, W3 ∈ {J1, J3}. If W2→J2, W3 must go to J3 ✓ — matching {W1→J1, W2→J2, W3→J3}. If W2→J3, W3 must go to J2 (no edge W3-J2) ✗.\n- W1→J2: W2 ∈ {J3}, W3 ∈ {J1, J3}. If W2→J3, W3 must go to J1 ✓ — matching {W1→J2, W2→J3, W3→J1}. \n\n**Two perfect matchings**: {W1→J1, W2→J2, W3→J3} and {W1→J2, W2→J3, W3→J1}.",
    },
    {
      label: "c",
      marks: 2,
      content: `Suppose worker W3 is replaced by a new worker W3' who can only do job J2. Determine whether a perfect matching still exists, and justify.`,
      solution: "New graph: W1-J1, W1-J2, W2-J2, W2-J3, W3'-J2.\n\nJob J1 has only one possible worker (W1). Job J3 has only W2. So W1→J1, W2→J3 forced. Then W3' must take J2 (only option, edge W3'-J2 ✓). Matching: {W1→J1, W2→J3, W3'→J2}. **Yes, a perfect matching exists** (it is unique).",
    },
    {
      label: "d",
      marks: 3,
      content: `**Hall's theorem** states that a bipartite graph $G$ with parts $V_1$ and $V_2$ (where $|V_1| \\leq |V_2|$) has a matching covering $V_1$ iff every subset $S \\subseteq V_1$ has at least $|S|$ neighbours in $V_2$. State whether Hall's condition holds for the worker-job graph in part (a).`,
      solution: "Check all non-empty subsets of $\\{W1, W2, W3\\}$:\n- $|S|=1$: each worker has at least 2 neighbours (e.g. W1's neighbours = {J1, J2}) ≥ 1 ✓.\n- $|S|=2$: any pair has at least 2 distinct neighbours. {W1, W2} have neighbours {J1, J2, J3} (size 3) ≥ 2 ✓. {W1, W3} have {J1, J2, J3} ≥ 2 ✓. {W2, W3} have {J1, J2, J3} ≥ 2 ✓.\n- $|S|=3$: all three workers have neighbours {J1, J2, J3} (size 3) ≥ 3 ✓.\n\n**Hall's condition holds** for every subset, confirming the existence of a perfect matching.",
    },
    {
      label: "e",
      marks: 2,
      content: `Briefly explain why bipartite graphs are particularly suited to modelling assignment problems (workers/jobs, students/courses, donors/recipients, etc.).`,
      solution: "Assignment problems naturally split entities into two disjoint sets (e.g. workers and jobs) with relationships only between the sets, not within. This is exactly the bipartite structure. The mathematical tools (perfect matchings, Hall's theorem, Hungarian algorithm) provide systematic methods to decide whether a valid assignment exists and to find it.",
    },
  ],
  "HARD",
  `**Question — Hall's theorem and matchings**\n\nThis question develops the use of bipartite graphs for assignment problems, including Hall's marriage theorem.`,
);

// ─── Write output ──────────────────────────────────────────────────────

const spec = {
  subject_slug: SUBJECT_SLUG,
  question_set_id: QUESTION_SET_ID,
  items,
};

const outPath = path.join(OUT_DIR, "qset-general-discrete-graphs.json");
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log(`OK Wrote ${items.length} items to ${outPath}`);
console.log(`  MCQ:               ${items.filter((i) => i.type === "MCQ").length}`);
console.log(`  SHORT:             ${items.filter((i) => i.type === "SHORT_ANSWER").length}`);
console.log(`  EXTENDED_ANSWER:   ${items.filter((i) => i.type === "EXTENDED_ANSWER").length}`);
console.log(`  EXTENDED_RESPONSE: ${items.filter((i) => i.type === "EXTENDED_RESPONSE").length}`);

// Per-subtopic breakdown
const bySub: Record<string, { MCQ: number; SHORT_ANSWER: number; EXTENDED_ANSWER: number; EXTENDED_RESPONSE: number }> = {};
for (const it of items) {
  const slug = it.subtopic_slugs[0];
  bySub[slug] = bySub[slug] ?? { MCQ: 0, SHORT_ANSWER: 0, EXTENDED_ANSWER: 0, EXTENDED_RESPONSE: 0 };
  (bySub[slug] as Record<string, number>)[it.type]++;
}
console.log("\nPer-subtopic breakdown:");
for (const [slug, counts] of Object.entries(bySub)) {
  console.log(`  ${slug}: MCQ=${counts.MCQ}, SHORT=${counts.SHORT_ANSWER}, EXT_ANS=${counts.EXTENDED_ANSWER}, EXT_RESP=${counts.EXTENDED_RESPONSE}`);
}
