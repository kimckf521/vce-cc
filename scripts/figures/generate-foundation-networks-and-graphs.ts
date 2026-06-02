/**
 * Foundation generator: networks-and-graphs
 *
 * Core-drill + extended-fit. 14 MCQ + 11 SHORT + 3 EXTENDED_ANSWER = 28 items.
 * Foundation networks: count vertices/edges, identify shortest path by
 * inspection from prose+table descriptions, no formal Dijkstra/Floyd-Warshall.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/networks-and-graphs.json");

const TOPIC = "discrete-mathematics";
const SUB = "networks-and-graphs";

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
    "A network has $5$ vertices ($A, B, C, D, E$) and the following edges: $AB$, $BC$, $CD$, $DE$, $EA$. The total number of edges in this network is:",
    ["$3$", "$4$", "$5$", "$6$"],
    "C",
    "EASY",
    "Counting the listed edges: $AB, BC, CD, DE, EA$ — that is $5$ edges.\n\n**Answer: C**",
  ),
  mcq(
    "In a small network the vertex $A$ is directly connected to vertices $B$, $C$, and $D$. The degree of vertex $A$ is:",
    ["$1$", "$2$", "$3$", "$4$"],
    "C",
    "EASY",
    "Degree of a vertex is the number of edges meeting it. $A$ meets $3$ edges, so its degree is $3$.\n\n**Answer: C**",
  ),
  mcq(
    "A network of $4$ towns ($P, Q, R, S$) has road distances: $P$–$Q$ is $5$ km, $Q$–$R$ is $4$ km, $R$–$S$ is $3$ km. The total length of road in the network is:",
    ["$9$ km", "$10$ km", "$12$ km", "$15$ km"],
    "C",
    "EASY",
    "Sum: $5 + 4 + 3 = 12$ km.\n\n**Answer: C**",
  ),
  mcq(
    "In a friendship network with $6$ vertices, each vertex represents a person. An edge between two vertices means the two people are friends. If Anna is connected to Ben, Carla and Dan only, then Anna has how many friends in this network?",
    ["$2$", "$3$", "$4$", "$5$"],
    "B",
    "EASY",
    "Anna's edges go to $\\{$Ben, Carla, Dan$\\}$ — that is $3$ friends.\n\n**Answer: B**",
  ),
  mcq(
    "A network of bus stops has $4$ stops ($A, B, C, D$) connected as follows: $A$ to $B$, $B$ to $C$, $C$ to $D$, and $A$ to $D$. The number of edges in this network is:",
    ["$3$", "$4$", "$5$", "$6$"],
    "B",
    "EASY",
    "Edges listed: $AB, BC, CD, AD$ — that is $4$ edges.\n\n**Answer: B**",
  ),
  mcq(
    "A weighted network has direct distances:\n\n| From–To | Distance (km) |\n|---|---|\n| $A$–$B$ | $4$ |\n| $A$–$C$ | $7$ |\n| $B$–$C$ | $2$ |\n\nThe shortest route from $A$ to $C$ is:",
    ["$2$ km (direct $B$–$C$)", "$4$ km via $A$–$B$", "$6$ km via $A$–$B$–$C$", "$7$ km via $A$–$C$"],
    "C",
    "MEDIUM",
    "Direct $A$–$C$ is $7$ km. Via $B$: $A$–$B$ + $B$–$C$ = $4 + 2 = 6$ km. The shorter path is via $B$.\n\n**Answer: C**",
  ),
  mcq(
    "A small road network has these distances:\n\n| From–To | Distance (km) |\n|---|---|\n| $H$–$X$ | $5$ |\n| $H$–$Y$ | $3$ |\n| $X$–$S$ | $4$ |\n| $Y$–$S$ | $7$ |\n\nThe shortest route from $H$ (home) to $S$ (school) is:",
    ["$8$ km via $H$–$X$–$S$", "$9$ km via $H$–$Y$–$S$", "$10$ km via $H$–$X$–$S$", "$12$ km via $H$–$Y$–$S$"],
    "A",
    "MEDIUM",
    "Via $X$: $H$–$X$ + $X$–$S$ $= 5 + 4 = 9$ km. Via $Y$: $H$–$Y$ + $Y$–$S$ $= 3 + 7 = 10$ km. The shorter is via $X$ at $9$ km.\n\n**Answer: A**",
  ),
  mcq(
    "A simple graph has $4$ vertices, all of which are connected to each other by an edge (i.e. every pair is joined). How many edges are in this graph?",
    ["$4$", "$5$", "$6$", "$8$"],
    "C",
    "MEDIUM",
    "Number of edges in a complete graph on $4$ vertices: pairs are $\\{A,B\\}, \\{A,C\\}, \\{A,D\\}, \\{B,C\\}, \\{B,D\\}, \\{C,D\\}$ — that is $6$.\n\n**Answer: C**",
  ),
  mcq(
    "A network has $5$ vertices and $4$ edges, forming a connected tree (no cycles). The number of cycles in the network is:",
    ["$0$", "$1$", "$2$", "$4$"],
    "A",
    "MEDIUM",
    "A tree by definition has no cycles, so $0$ cycles.\n\n**Answer: A**",
  ),
  mcq(
    "In a network of $5$ vertices ($A, B, C, D, E$) with edges $AB$, $AC$, $BC$, $CD$, $DE$, the degree of vertex $C$ is:",
    ["$1$", "$2$", "$3$", "$4$"],
    "C",
    "MEDIUM",
    "Edges meeting $C$: $AC$, $BC$, $CD$ — that is $3$ edges, so degree of $C$ is $3$.\n\n**Answer: C**",
  ),
  mcq(
    "A network has vertices $W, X, Y, Z$. Edges and weights:\n\n| Edge | Weight |\n|---|---|\n| $W$–$X$ | $3$ |\n| $W$–$Y$ | $6$ |\n| $X$–$Y$ | $2$ |\n| $Y$–$Z$ | $4$ |\n| $X$–$Z$ | $8$ |\n\nThe shortest path from $W$ to $Z$ has length:",
    ["$6$", "$8$", "$9$", "$11$"],
    "C",
    "MEDIUM",
    "Options: $W$–$X$–$Z$: $3 + 8 = 11$. $W$–$Y$–$Z$: $6 + 4 = 10$. $W$–$X$–$Y$–$Z$: $3 + 2 + 4 = 9$. Shortest is $9$ via $W$–$X$–$Y$–$Z$.\n\n**Answer: C**",
  ),
  mcq(
    "A network of $6$ vertices has $5$ edges and is connected. Such a network is best described as a:",
    ["complete graph", "tree", "cycle", "weighted graph"],
    "B",
    "MEDIUM",
    "A connected graph on $n$ vertices with $n-1$ edges is a tree. Here $n = 6$ and edges $= 5 = n - 1$, so it is a tree.\n\n**Answer: B**",
  ),
  mcq(
    "In a friendship network, vertices represent students and edges represent 'is a friend of'. If the sum of all the degrees of all vertices is $20$, the total number of edges in the network is:",
    ["$10$", "$15$", "$20$", "$40$"],
    "A",
    "HARD",
    "Each edge contributes $2$ to the total of degrees, so number of edges $= \\dfrac{20}{2} = 10$.\n\n**Answer: A**",
  ),
  mcq(
    "Five towns ($A, B, C, D, E$) are pairwise connected by these direct road distances (km):\n\n| Edge | km |\n|---|---|\n| $A$–$B$ | $4$ |\n| $A$–$C$ | $9$ |\n| $B$–$C$ | $3$ |\n| $B$–$D$ | $7$ |\n| $C$–$D$ | $2$ |\n| $C$–$E$ | $6$ |\n| $D$–$E$ | $3$ |\n\nThe shortest route from $A$ to $E$ is:",
    ["$11$ km via $A$–$B$–$D$–$E$", "$12$ km via $A$–$B$–$C$–$E$", "$12$ km via $A$–$B$–$C$–$D$–$E$", "$13$ km via $A$–$C$–$E$"],
    "C",
    "HARD",
    "Compare routes: $A$–$C$–$E$ $= 9 + 6 = 15$. $A$–$B$–$C$–$E$ $= 4 + 3 + 6 = 13$. $A$–$B$–$D$–$E$ $= 4 + 7 + 3 = 14$. $A$–$B$–$C$–$D$–$E$ $= 4 + 3 + 2 + 3 = 12$. Shortest is $12$ km via $A$–$B$–$C$–$D$–$E$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "A network of $4$ towns has edges (roads) $P$–$Q$, $P$–$R$, $Q$–$S$, and $R$–$S$. How many edges does this network have?",
    1,
    "EASY",
    "**Step 1 (1 mark):** Count the listed edges: $4$ edges.",
  ),
  sa(
    "In a network, the vertex $K$ is connected directly to $4$ other vertices. State the degree of vertex $K$.",
    1,
    "EASY",
    "**Step 1 (1 mark):** The degree of $K$ is the number of edges meeting it: $4$.",
  ),
  sa(
    "A network of trails has weights (lengths in km): $A$–$B$ is $5$ km, $B$–$C$ is $3$ km, $C$–$D$ is $7$ km. What is the total length of trails in the network?",
    1,
    "EASY",
    "**Step 1 (1 mark):** Sum: $5 + 3 + 7 = 15$ km.",
  ),
  sa(
    "Five Melbourne suburbs are connected by tram lines as follows: $A$–$B$, $B$–$C$, $C$–$D$, $D$–$E$, $A$–$E$. List the degree of each vertex.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $A$ meets $AB$ and $AE$, degree $2$. $B$ meets $AB$ and $BC$, degree $2$. $C$ meets $BC$ and $CD$, degree $2$.\n\n**Step 2 (1 mark):** $D$ meets $CD$ and $DE$, degree $2$. $E$ meets $DE$ and $AE$, degree $2$.",
  ),
  sa(
    "A simple network has $4$ vertices and $5$ edges. Is this a tree? Explain in one sentence.",
    2,
    "EASY",
    "**Step 1 (1 mark):** A tree on $n$ vertices has exactly $n - 1$ edges.\n\n**Step 2 (1 mark):** Here $n = 4$ means a tree would have $3$ edges, but this network has $5$ edges, so it is NOT a tree.",
  ),
  sa(
    "A network has direct road distances:\n\n| From–To | Distance (km) |\n|---|---|\n| $H$–$X$ | $5$ |\n| $H$–$Y$ | $8$ |\n| $X$–$Z$ | $6$ |\n| $Y$–$Z$ | $2$ |\n\nFind the shortest route from $H$ to $Z$ and state its length.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Via $X$: $H$–$X$–$Z$ $= 5 + 6 = 11$ km. Via $Y$: $H$–$Y$–$Z$ $= 8 + 2 = 10$ km.\n\n**Step 2 (1 mark):** Shortest route is $H$–$Y$–$Z$ with length $10$ km.",
  ),
  sa(
    "In a sports tournament network, vertices are teams and edges are matches played between teams. The degrees of teams $A, B, C, D, E$ are $3, 2, 4, 1, 2$. Use the handshake (degree-sum) rule to state the total number of matches played.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Sum of degrees: $3 + 2 + 4 + 1 + 2 = 12$.\n\n**Step 2 (1 mark):** Each match corresponds to one edge, and each edge contributes $2$ to the sum of degrees: total matches $= 12 \\div 2 = 6$.",
  ),
  sa(
    "A network has these direct edge distances:\n\n| Edge | km |\n|---|---|\n| $A$–$B$ | $2$ |\n| $B$–$C$ | $5$ |\n| $A$–$C$ | $8$ |\n| $C$–$D$ | $3$ |\n\nFind the shortest route from $A$ to $D$ and state its total length.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Via $C$ directly: $A$–$C$–$D$ $= 8 + 3 = 11$ km. Via $B$ then $C$: $A$–$B$–$C$–$D$ $= 2 + 5 + 3 = 10$ km.\n\n**Step 2 (1 mark):** Shortest route is $A$–$B$–$C$–$D$, length $10$ km.",
  ),
  sa(
    "A school sports network connects $5$ teams ($T_1, T_2, T_3, T_4, T_5$), each playing all others exactly once. How many matches (edges) are there in total?",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** All pairs of $5$ teams: $\\dfrac{5 \\times 4}{2}$.\n\n**Step 2 (1 mark):** $= 10$ matches.",
  ),
  sa(
    "A delivery network connects warehouse $W$ to shops $S_1, S_2, S_3$. Edge distances:\n\n| Edge | km |\n|---|---|\n| $W$–$S_1$ | $4$ |\n| $W$–$S_2$ | $6$ |\n| $S_1$–$S_2$ | $3$ |\n| $S_2$–$S_3$ | $5$ |\n| $S_1$–$S_3$ | $9$ |\n\nFind the shortest route from $W$ to $S_3$ and state its length.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Direct $S_1$: $W$–$S_1$–$S_3$ $= 4 + 9 = 13$ km.\n\n**Step 2 (1 mark):** Via $S_2$: $W$–$S_2$–$S_3$ $= 6 + 5 = 11$ km. Via $S_1$ then $S_2$: $W$–$S_1$–$S_2$–$S_3$ $= 4 + 3 + 5 = 12$ km.\n\n**Step 3 (1 mark):** Shortest is $W$–$S_2$–$S_3$ at $11$ km.",
  ),
  sa(
    "A connected network on $7$ vertices has the smallest possible number of edges (a tree). State the number of edges and explain why.",
    3,
    "HARD",
    "**Step 1 (1 mark):** A tree on $n$ vertices has exactly $n - 1$ edges.\n\n**Step 2 (1 mark):** With $n = 7$, that gives $7 - 1 = 6$ edges.\n\n**Step 3 (1 mark):** This is the minimum because fewer edges would disconnect the graph, and more edges would create a cycle.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "Five suburbs in Melbourne are connected by direct tram routes. The distances (in km) between connected suburbs are shown below.\n\n| Edge | Distance (km) |\n|---|---|\n| $A$–$B$ | $4$ |\n| $A$–$C$ | $6$ |\n| $B$–$C$ | $3$ |\n| $B$–$D$ | $5$ |\n| $C$–$D$ | $2$ |\n| $D$–$E$ | $4$ |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "List the degree of each vertex.",
        solution: "**Step 1 (1 mark):** $A$: edges $AB, AC$, degree $2$. $B$: $AB, BC, BD$, degree $3$. $C$: $AC, BC, CD$, degree $3$. $D$: $BD, CD, DE$, degree $3$. $E$: $DE$, degree $1$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Find the length of the route $A$–$B$–$D$–$E$ and the route $A$–$C$–$D$–$E$. Which is shorter?",
        solution: "**Step 1 (1 mark):** $A$–$B$–$D$–$E$ $= 4 + 5 + 4 = 13$ km. $A$–$C$–$D$–$E$ $= 6 + 2 + 4 = 12$ km.\n\n**Step 2 (1 mark):** $A$–$C$–$D$–$E$ is shorter by $1$ km.",
      },
      {
        label: "c",
        marks: 2,
        content: "By examining all routes from $A$ to $E$, find the shortest route and state its length.",
        solution: "**Step 1 (1 mark):** Other routes: $A$–$B$–$C$–$D$–$E$ $= 4 + 3 + 2 + 4 = 13$ km. $A$–$C$–$B$–$D$–$E$ $= 6 + 3 + 5 + 4 = 18$ km.\n\n**Step 2 (1 mark):** Compared to $A$–$C$–$D$–$E$ at $12$ km, the shortest route is $A$–$C$–$D$–$E$, length $12$ km.",
      },
    ],
  ),
  ea(
    "A small school network has $4$ classrooms ($P, Q, R, S$) connected by walkways. The lengths (in metres) of the walkways are:\n\n| Walkway | Length (m) |\n|---|---|\n| $P$–$Q$ | $20$ |\n| $P$–$R$ | $35$ |\n| $Q$–$R$ | $15$ |\n| $Q$–$S$ | $25$ |\n| $R$–$S$ | $10$ |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "How many edges are in this network and what is the total length of walkway?",
        solution: "**Step 1 (1 mark):** $5$ edges; total length $= 20 + 35 + 15 + 25 + 10 = 105$ m.",
      },
      {
        label: "b",
        marks: 2,
        content: "Find the shortest distance from $P$ to $S$.",
        solution: "**Step 1 (1 mark):** Routes: $P$–$Q$–$S$ $= 20 + 25 = 45$ m. $P$–$R$–$S$ $= 35 + 10 = 45$ m. $P$–$Q$–$R$–$S$ $= 20 + 15 + 10 = 45$ m.\n\n**Step 2 (1 mark):** All three routes give $45$ m, so the shortest distance is $45$ m.",
      },
      {
        label: "c",
        marks: 3,
        content: "A teacher walks from $P$ to $S$ then back to $P$, using the shortest route in each direction. Find the total distance walked.",
        solution: "**Step 1 (1 mark):** Shortest one-way distance from $P$ to $S$ is $45$ m.\n\n**Step 2 (1 mark):** Return is the same distance: $45$ m.\n\n**Step 3 (1 mark):** Total: $45 + 45 = 90$ m.",
      },
    ],
  ),
  ea(
    "A pet courier delivers across $5$ locations ($V, W, X, Y, Z$). The direct distances between locations are listed below. (Locations without a row entry are not directly connected.)\n\n| Edge | km |\n|---|---|\n| $V$–$W$ | $3$ |\n| $V$–$X$ | $7$ |\n| $W$–$X$ | $2$ |\n| $W$–$Y$ | $5$ |\n| $X$–$Y$ | $4$ |\n| $Y$–$Z$ | $6$ |\n| $X$–$Z$ | $9$ |",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "List two different routes from $V$ to $Y$ and give the length of each.",
        solution: "**Step 1 (1 mark):** $V$–$W$–$Y$ $= 3 + 5 = 8$ km.\n\n**Step 2 (1 mark):** $V$–$X$–$Y$ $= 7 + 4 = 11$ km (or $V$–$W$–$X$–$Y$ $= 3 + 2 + 4 = 9$ km).",
      },
      {
        label: "b",
        marks: 2,
        content: "Find the shortest route from $V$ to $Y$ and state its length.",
        solution: "**Step 1 (1 mark):** Compare: $V$–$W$–$Y$ $= 8$ km; $V$–$W$–$X$–$Y$ $= 3 + 2 + 4 = 9$ km; $V$–$X$–$Y$ $= 11$ km.\n\n**Step 2 (1 mark):** Shortest is $V$–$W$–$Y$ at $8$ km.",
      },
      {
        label: "c",
        marks: 3,
        content: "The courier must deliver to $Z$ starting at $V$. Find the shortest route from $V$ to $Z$ and state its length.",
        solution: "**Step 1 (1 mark):** $V$–$X$–$Z$ $= 7 + 9 = 16$ km. $V$–$W$–$X$–$Z$ $= 3 + 2 + 9 = 14$ km.\n\n**Step 2 (1 mark):** $V$–$W$–$Y$–$Z$ $= 3 + 5 + 6 = 14$ km. $V$–$W$–$X$–$Y$–$Z$ $= 3 + 2 + 4 + 6 = 15$ km.\n\n**Step 3 (1 mark):** Shortest is $14$ km via either $V$–$W$–$X$–$Z$ or $V$–$W$–$Y$–$Z$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`networks-and-graphs: wrote ${items.length} items to ${OUT}`);
