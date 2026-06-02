/**
 * Foundation generator: time-and-time-zones
 * Tier: core-drill + extended-fit (14 MCQ + 11 SHORT + 3 EXT_ANS = 28)
 * Topic: space-and-measurement
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/time-and-time-zones.json");

const TOPIC = "space-and-measurement";
const SUB = "time-and-time-zones";

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
    "The time $14{:}45$ in 24-hour format is the same as:",
    ["$2{:}45$ am", "$2{:}45$ pm", "$4{:}45$ pm", "$12{:}45$ pm"],
    "B",
    "EASY",
    "Subtract $12$ from $14$ to convert to pm: $14{:}45 - 12{:}00 = 2{:}45$ pm.\n\n**Answer: B**",
  ),
  mcq(
    "The time $7{:}30$ pm in 24-hour format is:",
    ["$07{:}30$", "$17{:}30$", "$19{:}30$", "$20{:}30$"],
    "C",
    "EASY",
    "For pm times after $12{:}59$, add $12$: $7 + 12 = 19$, so $19{:}30$.\n\n**Answer: C**",
  ),
  mcq(
    "A train leaves the station at $9{:}15$ am and arrives at its destination at $11{:}40$ am. The journey takes:",
    ["$1$ h $25$ min", "$2$ h $15$ min", "$2$ h $25$ min", "$2$ h $55$ min"],
    "C",
    "EASY",
    "From $9{:}15$ to $11{:}15$ is $2$ hours; then add $25$ min to reach $11{:}40$. Total: $2$ h $25$ min.\n\n**Answer: C**",
  ),
  mcq(
    "Melbourne is in the Australian Eastern Standard Time (AEST) zone, which is UTC$+10$. When it is $10{:}00$ am in Melbourne (no daylight saving), the time in UTC is:",
    ["$00{:}00$", "$06{:}00$", "$20{:}00$", "$23{:}00$"],
    "A",
    "EASY",
    "If Melbourne is $10$ hours ahead of UTC, subtract $10$ hours from Melbourne time: $10{:}00 - 10$ h $= 00{:}00$ UTC (midnight UTC).\n\n**Answer: A**",
  ),
  mcq(
    "How many minutes are in $3.5$ hours?",
    ["$180$ minutes", "$200$ minutes", "$210$ minutes", "$240$ minutes"],
    "C",
    "EASY",
    "$3.5 \\times 60 = 210$ minutes.\n\n**Answer: C**",
  ),
  mcq(
    "Sydney is in AEST (UTC$+10$) and Perth is in AWST (UTC$+8$). When it is $3{:}00$ pm in Sydney (no daylight saving), the time in Perth is:",
    ["$11{:}00$ am", "$1{:}00$ pm", "$5{:}00$ pm", "$7{:}00$ pm"],
    "B",
    "MEDIUM",
    "Perth is $2$ hours behind Sydney: $3{:}00$ pm $- 2$ h $= 1{:}00$ pm.\n\n**Answer: B**",
  ),
  mcq(
    "A flight departs Melbourne at $11{:}45$ am and the flight time is $3$ hours $40$ minutes. The arrival time (in Melbourne time) is:",
    ["$2{:}25$ pm", "$3{:}25$ pm", "$3{:}45$ pm", "$4{:}25$ pm"],
    "B",
    "MEDIUM",
    "$11{:}45 + 3$ h $= 14{:}45$. Add $40$ min: $14{:}45 + 40$ min $= 15{:}25$, i.e. $3{:}25$ pm.\n\n**Answer: B**",
  ),
  mcq(
    "London is in UTC$+0$ (no daylight saving). Melbourne is in AEDT (UTC$+11$) during daylight saving. When it is $9{:}00$ am in London, the time in Melbourne is:",
    ["$8{:}00$ pm previous day", "$8{:}00$ pm same day", "$10{:}00$ am same day", "$2{:}00$ am next day"],
    "B",
    "MEDIUM",
    "Melbourne (AEDT) is $11$ hours ahead of London: $9{:}00$ am $+ 11$ h $= 20{:}00$ (i.e. $8{:}00$ pm same day).\n\n**Answer: B**",
  ),
  mcq(
    "Adelaide is in ACST (UTC$+9{:}30$). Brisbane is in AEST (UTC$+10$). When it is $2{:}00$ pm in Brisbane, the time in Adelaide is:",
    ["$12{:}30$ pm", "$1{:}30$ pm", "$2{:}30$ pm", "$3{:}30$ pm"],
    "B",
    "MEDIUM",
    "Adelaide is $30$ min behind Brisbane (no daylight saving in Brisbane): $2{:}00$ pm $- 30$ min $= 1{:}30$ pm.\n\n**Answer: B**",
  ),
  mcq(
    "A movie starts at $7{:}45$ pm and runs for $2$ h $20$ min. The finishing time is:",
    ["$9{:}05$ pm", "$9{:}45$ pm", "$10{:}05$ pm", "$10{:}25$ pm"],
    "C",
    "MEDIUM",
    "$7{:}45$ pm $+ 2$ h $= 9{:}45$ pm. Add $20$ min: $10{:}05$ pm.\n\n**Answer: C**",
  ),
  mcq(
    "Singapore is in SGT (UTC$+8$). Melbourne is in AEST (UTC$+10$, no daylight saving). When it is $11{:}30$ pm Tuesday in Singapore, the time and day in Melbourne is:",
    ["$9{:}30$ pm Tuesday", "$1{:}30$ am Wednesday", "$1{:}30$ am Tuesday", "$3{:}30$ am Wednesday"],
    "B",
    "MEDIUM",
    "Melbourne is $2$ hours ahead of Singapore: $11{:}30$ pm Tue $+ 2$ h $= 1{:}30$ am Wednesday.\n\n**Answer: B**",
  ),
  mcq(
    "A bus leaves Brisbane at $11{:}50$ pm and arrives at Toowoomba at $2{:}15$ am the next day. The duration of the journey is:",
    ["$1$ h $25$ min", "$2$ h $25$ min", "$2$ h $35$ min", "$3$ h $25$ min"],
    "B",
    "MEDIUM",
    "From $11{:}50$ pm to $12{:}50$ am is $1$ hour. From $12{:}50$ am to $2{:}15$ am is $1$ h $25$ min. Total: $2$ h $25$ min.\n\n**Answer: B**",
  ),
  mcq(
    "Tokyo is in JST (UTC$+9$). New York is in EST (UTC$-5$). When it is $9{:}00$ am Monday in Tokyo, the time and day in New York is:",
    ["$7{:}00$ pm Sunday", "$7{:}00$ pm Monday", "$5{:}00$ am Monday", "$9{:}00$ pm Sunday"],
    "A",
    "HARD",
    "Difference: Tokyo is $9 - (-5) = 14$ hours ahead of New York. New York time: $9{:}00$ am Mon $- 14$ h $= 7{:}00$ pm Sunday.\n\n**Answer: A**",
  ),
  mcq(
    "A flight leaves Sydney (AEDT, UTC$+11$) at $10{:}00$ am Wednesday. The flight duration is $14$ hours, and the destination is Auckland (NZDT, UTC$+13$). The local arrival time in Auckland is:",
    ["$10{:}00$ am Wednesday", "$12{:}00$ am Thursday", "$2{:}00$ am Thursday", "$4{:}00$ am Thursday"],
    "C",
    "HARD",
    "Auckland is $2$ hours ahead of Sydney. Departure in Auckland time: $10{:}00$ am Wed $+ 2$ h $= 12{:}00$ pm Wednesday. Add flight time: $12{:}00$ pm Wed $+ 14$ h $= 2{:}00$ am Thursday.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ────────────────────────────────────────────────
  sa(
    "Convert $19{:}45$ from 24-hour to 12-hour time.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $19{:}45 - 12{:}00 = 7{:}45$ pm.",
  ),
  sa(
    "Convert $4{:}25$ pm to 24-hour time.",
    1,
    "EASY",
    "**Step 1 (1 mark):** $4 + 12 = 16$, so $16{:}25$.",
  ),
  sa(
    "A train leaves Flinders Street Station at $8{:}10$ am and arrives at Geelong at $9{:}45$ am. Calculate the duration of the journey.",
    1,
    "EASY",
    "**Step 1 (1 mark):** From $8{:}10$ to $9{:}45$ is $1$ h $35$ min.",
  ),
  sa(
    "Adelaide (ACST, UTC$+9{:}30$) and Brisbane (AEST, UTC$+10$). When it is $4{:}00$ pm in Brisbane, what is the time in Adelaide?",
    1,
    "EASY",
    "**Step 1 (1 mark):** Adelaide is $30$ minutes behind Brisbane: $4{:}00$ pm $- 30$ min $= 3{:}30$ pm.",
  ),
  sa(
    "A meeting starts at $13{:}45$ and lasts $1$ hour $45$ minutes. State the finishing time in 24-hour format.",
    2,
    "EASY",
    "**Step 1 (1 mark):** $13{:}45 + 1$ h $= 14{:}45$.\n\n**Step 2 (1 mark):** $14{:}45 + 45$ min $= 15{:}30$.",
  ),
  sa(
    "A flight departs Sydney at $11{:}30$ am and the flight time is $3$ hours $50$ minutes. Find the arrival time (in Sydney time).",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** $11{:}30$ am $+ 3$ h $= 2{:}30$ pm.\n\n**Step 2 (1 mark):** $2{:}30$ pm $+ 50$ min $= 3{:}20$ pm.",
  ),
  sa(
    "Perth is in AWST (UTC$+8$) and Sydney is in AEDT (UTC$+11$) during daylight saving. If it is $9{:}30$ am in Perth, find the time in Sydney.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Sydney is $3$ hours ahead of Perth (during AEDT).\n\n**Step 2 (1 mark):** $9{:}30$ am $+ 3$ h $= 12{:}30$ pm in Sydney.",
  ),
  sa(
    "London (UTC$+0$) and Melbourne (AEST, UTC$+10$, no daylight saving). If it is $11{:}00$ pm Monday in London, find the time and day in Melbourne.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Melbourne is $10$ hours ahead of London.\n\n**Step 2 (1 mark):** $11{:}00$ pm Mon $+ 10$ h $= 9{:}00$ am Tuesday.",
  ),
  sa(
    "A bus leaves Geelong at $10{:}25$ pm and arrives in Ballarat at $1{:}10$ am the next morning. Calculate the duration of the trip.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** From $10{:}25$ pm to $12{:}25$ am is $2$ hours.\n\n**Step 2 (1 mark):** From $12{:}25$ am to $1{:}10$ am is $45$ min. Total: $2$ h $45$ min.",
  ),
  sa(
    "Melbourne is in AEDT (UTC$+11$) during daylight saving. A teacher in Melbourne wants to call a friend in London (UTC$+0$) at $7{:}00$ pm London time. What time and day (Melbourne time) should the call be made if the call is on London-Monday?",
    3,
    "HARD",
    "**Step 1 (1 mark):** Melbourne is $11$ hours ahead of London.\n\n**Step 2 (1 mark):** $7{:}00$ pm Monday London $+ 11$ h $= 6{:}00$ am Tuesday Melbourne.\n\n**Step 3 (1 mark):** The call should be made at $6{:}00$ am Tuesday (Melbourne time).",
  ),
  sa(
    "A flight leaves Brisbane at $11{:}55$ pm on Friday. The flight takes $9$ hours $20$ minutes. Find the arrival time and day (in Brisbane time).",
    3,
    "HARD",
    "**Step 1 (1 mark):** From $11{:}55$ pm Fri to $11{:}55$ am Sat is $12$ hours; subtract $2$ h $40$ min from $11{:}55$ am Sat (since $9$ h $20$ min $< 12$ h).\n\n**Step 2 (1 mark):** Alternative: $11{:}55$ pm Fri $+ 9$ h $= 8{:}55$ am Sat. $8{:}55$ am Sat $+ 20$ min $= 9{:}15$ am Saturday.\n\n**Step 3 (1 mark):** Arrival: $9{:}15$ am Saturday.",
  ),

  // ── EXTENDED_ANSWER (3) ──────────────────────────────────────────────
  ea(
    "Sasha is planning a video call between her family in Melbourne and her grandparents in Singapore. Use the following time zones (no daylight saving):\n\n- Melbourne (AEST): UTC$+10$\n- Singapore (SGT): UTC$+8$",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the time difference between Melbourne and Singapore in hours.",
        solution: "**Step 1 (1 mark):** Difference: $10 - 8 = 2$ hours. Melbourne is $2$ hours ahead of Singapore.",
      },
      {
        label: "b",
        marks: 2,
        content: "If it is $7{:}00$ pm Saturday in Melbourne, what time and day is it in Singapore?",
        solution: "**Step 1 (1 mark):** Singapore is $2$ hours behind Melbourne.\n\n**Step 2 (1 mark):** $7{:}00$ pm Sat $- 2$ h $= 5{:}00$ pm Saturday in Singapore.",
      },
      {
        label: "c",
        marks: 2,
        content: "Sasha's grandparents prefer calls between $9{:}00$ am and $9{:}00$ pm Singapore time. Sasha wants to call them at $11{:}00$ pm Melbourne time. Determine the Singapore time at that moment and state whether the call falls within their preferred window.",
        solution: "**Step 1 (1 mark):** Singapore time: $11{:}00$ pm Mel $- 2$ h $= 9{:}00$ pm Singapore.\n\n**Step 2 (1 mark):** $9{:}00$ pm is the latest acceptable time, so the call is just within (at the edge of) the preferred window.",
      },
    ],
  ),
  ea(
    "A travel agent is planning an itinerary. A passenger flies from Perth (AWST, UTC$+8$) to Sydney (AEDT, UTC$+11$, during daylight saving), then later flies from Sydney to Auckland, New Zealand (NZDT, UTC$+13$, during daylight saving).",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the time difference between Perth and Sydney during AEDT.",
        solution: "**Step 1 (1 mark):** Difference: $11 - 8 = 3$ hours. Sydney is $3$ hours ahead of Perth.",
      },
      {
        label: "b",
        marks: 2,
        content: "The first flight departs Perth at $10{:}30$ am (Perth time) and arrives at $5{:}45$ pm (Sydney time). Calculate the flight duration.",
        solution: "**Step 1 (1 mark):** Convert Perth departure to Sydney time: $10{:}30$ am $+ 3$ h $= 1{:}30$ pm Sydney.\n\n**Step 2 (1 mark):** Duration: $5{:}45$ pm $- 1{:}30$ pm $= 4$ h $15$ min.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the time difference between Sydney (AEDT) and Auckland (NZDT). If the connecting flight from Sydney to Auckland departs at $8{:}00$ pm Sydney time and the flight duration is $3$ hours, find the local arrival time in Auckland.",
        solution: "**Step 1 (1 mark):** Auckland is $13 - 11 = 2$ hours ahead of Sydney.\n\n**Step 2 (1 mark):** Departure in Auckland time: $8{:}00$ pm $+ 2$ h $= 10{:}00$ pm. Add flight time: $10{:}00$ pm $+ 3$ h $= 1{:}00$ am next day.",
      },
    ],
  ),
  ea(
    "Daniel works in Melbourne (AEDT, UTC$+11$) during daylight saving. His company has offices in London (UTC$+0$) and Tokyo (JST, UTC$+9$).",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Calculate the time difference between Melbourne and London.",
        solution: "**Step 1 (1 mark):** Difference: $11 - 0 = 11$ hours. Melbourne is $11$ hours ahead of London.",
      },
      {
        label: "b",
        marks: 2,
        content: "Daniel wants to attend a video meeting that takes place at $9{:}00$ am Monday in London. At what time and day (Melbourne time) does the meeting start?",
        solution: "**Step 1 (1 mark):** Melbourne is $11$ hours ahead of London.\n\n**Step 2 (1 mark):** $9{:}00$ am Mon London $+ 11$ h $= 8{:}00$ pm Monday Melbourne.",
      },
      {
        label: "c",
        marks: 2,
        content: "Calculate the time difference between Melbourne (AEDT) and Tokyo. If Daniel sends an email to Tokyo at $4{:}30$ pm Melbourne time, what time is it in Tokyo at that moment?",
        solution: "**Step 1 (1 mark):** Tokyo is $11 - 9 = 2$ hours behind Melbourne.\n\n**Step 2 (1 mark):** Tokyo time: $4{:}30$ pm $- 2$ h $= 2{:}30$ pm.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`time-and-time-zones: wrote ${items.length} items to ${OUT}`);
