/**
 * Foundation generator: bearings-and-navigation (extended-fit)
 *
 * 14 MCQ + 11 SHORT + 3 EXT_ANS = 28 items. No EXT_RESP.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/bearings-and-navigation.json");

const TOPIC = "space-and-measurement";
const SUB = "bearings-and-navigation";

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
    "A bearing is measured clockwise from which direction?",
    ["South", "East", "North", "West"],
    "C",
    "EASY",
    "True bearings are measured clockwise from North.\n\n**Answer: C**",
  ),
  mcq(
    "Due East has a true bearing of:",
    ["$000°$", "$045°$", "$090°$", "$180°$"],
    "C",
    "EASY",
    "East is a quarter turn clockwise from North: $090°$.\n\n**Answer: C**",
  ),
  mcq(
    "Due South has a true bearing of:",
    ["$090°$", "$180°$", "$270°$", "$360°$"],
    "B",
    "EASY",
    "South is half a turn clockwise from North: $180°$.\n\n**Answer: B**",
  ),
  mcq(
    "Due West has a true bearing of:",
    ["$090°$", "$180°$", "$270°$", "$360°$"],
    "C",
    "EASY",
    "West is three-quarters of a turn clockwise from North: $270°$.\n\n**Answer: C**",
  ),
  mcq(
    "A ship is sailing on a bearing of $045°$. This direction is best described as:",
    ["North-East", "North-West", "South-East", "South-West"],
    "A",
    "EASY",
    "A bearing of $045°$ is halfway between North ($000°$) and East ($090°$), i.e. North-East.\n\n**Answer: A**",
  ),
  mcq(
    "A bearing of $225°$ is best described as:",
    ["North-East", "South-East", "South-West", "North-West"],
    "C",
    "EASY",
    "$225°$ is halfway between South ($180°$) and West ($270°$), i.e. South-West.\n\n**Answer: C**",
  ),
  mcq(
    "A hiker walks on a bearing of $120°$. This direction lies in which quadrant relative to North?",
    ["Between North and East", "Between East and South", "Between South and West", "Between West and North"],
    "B",
    "EASY",
    "$120°$ is between $090°$ (East) and $180°$ (South).\n\n**Answer: B**",
  ),
  mcq(
    "A boat is travelling on a bearing of $300°$. Which compass region best describes this direction?",
    ["Between North and East", "Between East and South", "Between South and West", "Between West and North"],
    "D",
    "MEDIUM",
    "$300°$ is between $270°$ (West) and $360°$ (North).\n\n**Answer: D**",
  ),
  mcq(
    "From point $A$, point $B$ has a bearing of $070°$. The bearing of $A$ from $B$ (the back-bearing) is:",
    ["$110°$", "$160°$", "$250°$", "$290°$"],
    "C",
    "MEDIUM",
    "Back-bearing $= 070° + 180° = 250°$.\n\n**Answer: C**",
  ),
  mcq(
    "From point $P$, point $Q$ has a bearing of $215°$. The back-bearing (i.e. bearing of $P$ from $Q$) is:",
    ["$035°$", "$055°$", "$135°$", "$325°$"],
    "A",
    "MEDIUM",
    "Back-bearing $= 215° - 180° = 035°$.\n\n**Answer: A**",
  ),
  mcq(
    "A yacht sails due East for $5$ km and then turns to a bearing of $090°$. What is its current direction of travel?",
    ["North", "East", "South", "West"],
    "B",
    "EASY",
    "A bearing of $090°$ is due East — the yacht continues East.\n\n**Answer: B**",
  ),
  mcq(
    "An aircraft is heading on a bearing of $135°$. After flying $20$ km, it turns and heads on a bearing of $225°$. Through what angle (clockwise) has it turned?",
    ["$45°$", "$90°$", "$135°$", "$180°$"],
    "B",
    "MEDIUM",
    "Clockwise turn $= 225° - 135° = 90°$.\n\n**Answer: B**",
  ),
  mcq(
    "A walker leaves a campsite and walks $4$ km on a bearing of $060°$, then turns and walks $4$ km on a bearing of $240°$. The walker is now:",
    ["$8$ km East of the camp", "Back at the campsite", "$4$ km North of the camp", "$4$ km West of the camp"],
    "B",
    "HARD",
    "The bearings $060°$ and $240°$ are opposite directions ($060° + 180° = 240°$). The walker retraces the path and ends up back at the campsite.\n\n**Answer: B**",
  ),
  mcq(
    "From a lighthouse, a ship is on a bearing of $310°$. The angle (measured clockwise from North) is in which quadrant?",
    ["North-East", "South-East", "South-West", "North-West"],
    "D",
    "HARD",
    "$310°$ lies between $270°$ (West) and $360°$ (North), so it is North-West.\n\n**Answer: D**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "State the true bearing of due East.",
    1,
    "EASY",
    "**Step 1 (1 mark):** East is $090°$.",
  ),
  sa(
    "State the true bearing of due South.",
    1,
    "EASY",
    "**Step 1 (1 mark):** South is $180°$.",
  ),
  sa(
    "State the true bearing of due West.",
    1,
    "EASY",
    "**Step 1 (1 mark):** West is $270°$.",
  ),
  sa(
    "Convert the compass direction North-East to a true bearing.",
    1,
    "EASY",
    "**Step 1 (1 mark):** North-East is halfway between North ($000°$) and East ($090°$), so the bearing is $045°$.",
  ),
  sa(
    "Convert the compass direction South-West to a true bearing.",
    1,
    "EASY",
    "**Step 1 (1 mark):** South-West is halfway between South ($180°$) and West ($270°$), so the bearing is $225°$.",
  ),
  sa(
    "A ship sails on a bearing of $110°$. State the back-bearing (the bearing of the starting point from the ship's current position).",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Since $110° < 180°$, add $180°$ to find the back-bearing.\n\n**Step 2 (1 mark):** Back-bearing $= 110° + 180° = 290°$.",
  ),
  sa(
    "From point $X$, point $Y$ is on a bearing of $250°$. State the bearing of $X$ from $Y$.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Since $250° > 180°$, subtract $180°$ to find the back-bearing.\n\n**Step 2 (1 mark):** Bearing $= 250° - 180° = 070°$.",
  ),
  sa(
    "An aircraft heads on a bearing of $075°$. It then turns clockwise through $60°$. State its new bearing.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Add the clockwise turn: $075° + 60°$.\n\n**Step 2 (1 mark):** New bearing $= 135°$.",
  ),
  sa(
    "A walker is heading on a bearing of $200°$. He turns anti-clockwise through $50°$. State his new bearing.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Anti-clockwise means subtract: $200° - 50°$.\n\n**Step 2 (1 mark):** New bearing $= 150°$.",
  ),
  sa(
    "A boat leaves a marina and sails on a bearing of $030°$ for $5$ km, then turns onto a new bearing. The new bearing makes a clockwise turn of $90°$ from the original. State the boat's new bearing.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Add the clockwise turn: $030° + 90°$.\n\n**Step 2 (1 mark):** New bearing $= 120°$.",
  ),
  sa(
    "From port $A$, ship $S$ is observed on a bearing of $340°$. From port $B$ (which lies due East of $A$), the same ship is seen on a bearing of $015°$. Both bearings indicate the ship is North of the line between the ports. Describe in words where the ship is located relative to the two ports.",
    3,
    "HARD",
    "**Step 1 (1 mark):** From $A$ on a bearing of $340°$ means the ship is just $20°$ West of due North of $A$.\n\n**Step 2 (1 mark):** From $B$ on a bearing of $015°$ means the ship is just $15°$ East of due North of $B$.\n\n**Step 3 (1 mark):** Since $B$ is East of $A$ and both lines of sight point roughly North, the ship lies North of the line $AB$, between $A$ and $B$ horizontally — slightly closer to $B$ than to $A$.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "A sailing boat leaves Williamstown and sails on a bearing of $060°$ for $8$ km, then changes direction.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Describe the initial direction of travel in compass terms.",
        solution: "**Step 1 (1 mark):** A bearing of $060°$ is between North ($000°$) and East ($090°$), so the boat sails roughly North-East (a little more East than North).",
      },
      {
        label: "b",
        marks: 2,
        content: "After reaching the $8$ km point, the boat turns clockwise through $90°$. State the new bearing of the boat.",
        solution: "**Step 1 (1 mark):** Add the clockwise turn to the original bearing: $060° + 90°$.\n\n**Step 2 (1 mark):** New bearing $= 150°$.",
      },
      {
        label: "c",
        marks: 2,
        content: "From the $8$ km point, what bearing would the boat travel on to return directly to Williamstown?",
        solution: "**Step 1 (1 mark):** Find the back-bearing of the original course. Since $060° < 180°$, add $180°$.\n\n**Step 2 (1 mark):** Return bearing $= 060° + 180° = 240°$.",
      },
    ],
  ),
  ea(
    "Two hikers, Anna and Ben, leave the same campsite. Anna walks on a bearing of $075°$. Ben walks on a bearing of $165°$.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the angle between their two paths at the campsite.",
        solution: "**Step 1 (1 mark):** Angle between paths $= 165° - 075° = 90°$.",
      },
      {
        label: "b",
        marks: 2,
        content: "Anna's path is described as a compass direction. State the compass direction (using N/S/E/W) that her bearing of $075°$ most closely resembles, and explain why.",
        solution: "**Step 1 (1 mark):** $075°$ lies between $000°$ (North) and $090°$ (East), so the direction is between North and East.\n\n**Step 2 (1 mark):** Because $075°$ is much closer to $090°$ (East) than to $000°$ (North), Anna's direction is closest to East, slightly North of due East.",
      },
      {
        label: "c",
        marks: 2,
        content: "From Anna's position, the campsite is now in which bearing direction (i.e. find the back-bearing)?",
        solution: "**Step 1 (1 mark):** Since Anna walked on a bearing of $075°$, the back-bearing from her position to the campsite is found by adding $180°$.\n\n**Step 2 (1 mark):** Back-bearing $= 075° + 180° = 255°$.",
      },
    ],
  ),
  ea(
    "A fishing trawler leaves Port Phillip Bay and heads on a bearing of $200°$. After $30$ minutes it turns and travels on a bearing of $290°$ for another $30$ minutes, before turning once more.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the size of the clockwise turn between the first and second bearings.",
        solution: "**Step 1 (1 mark):** From $200°$ to $290°$ clockwise.\n\n**Step 2 (1 mark):** Turn $= 290° - 200° = 90°$.",
      },
      {
        label: "b",
        marks: 2,
        content: "On its second leg (bearing $290°$), describe the trawler's direction in compass terms.",
        solution: "**Step 1 (1 mark):** $290°$ lies between $270°$ (West) and $360°$ (North), so it is between West and North.\n\n**Step 2 (1 mark):** Because $290°$ is closer to $270°$ than to $360°$, the direction is closest to West, slightly North of due West.",
      },
      {
        label: "c",
        marks: 2,
        content: "After completing the second leg, the trawler turns and heads back to the Port on a single direct bearing. The Port is now due East of its current position. State the bearing on which the trawler must travel to return.",
        solution: "**Step 1 (1 mark):** Due East is a bearing of $090°$.\n\n**Step 2 (1 mark):** Return bearing $= 090°$.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`bearings-and-navigation: wrote ${items.length} items to ${OUT}`);
