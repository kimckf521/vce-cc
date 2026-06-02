/**
 * Foundation generator: statistical-investigations
 *
 * Tier: extended-fit only (no core-drill marker in matrix but base items
 * still required). Targets: 14 MCQ + 11 SHORT_ANSWER + 3 EXTENDED_ANSWER = 28.
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/statistical-investigations.json");

const TOPIC = "data-analysis-probability-and-statistics";
const SUB = "statistical-investigations";

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
    "Which of these is the BEST example of a statistical question?",
    [
      "What is your favourite colour?",
      "How tall is each student in Year 11?",
      "Who is the principal?",
      "What is $2 + 2$?",
    ],
    "B",
    "EASY",
    "A statistical question requires data collected from many subjects and a measurable variable. 'How tall is each student in Year 11?' produces numerical data across a sample.\n\n**Answer: B**",
  ),
  mcq(
    "The first step in a statistical investigation is to:",
    [
      "Present the findings",
      "Pose a clear question",
      "Calculate the mean",
      "Draw a graph",
    ],
    "B",
    "EASY",
    "A statistical investigation starts with a clear question or problem to investigate.\n\n**Answer: B**",
  ),
  mcq(
    "Which is an example of NUMERICAL data?",
    [
      "Favourite type of music",
      "Eye colour",
      "Height in centimetres",
      "Country of birth",
    ],
    "C",
    "EASY",
    "Numerical data can be measured or counted (e.g. height). The other options are categorical.\n\n**Answer: C**",
  ),
  mcq(
    "Which is the BEST sampling method to fairly represent students at a large secondary college?",
    [
      "Ask the first $30$ students entering the school",
      "Ask only the basketball team",
      "Select $30$ students at random using a class list",
      "Only ask students in Year 12",
    ],
    "C",
    "EASY",
    "A random sample gives every student an equal chance of being chosen, producing a fairer representation.\n\n**Answer: C**",
  ),
  mcq(
    "Identify the variable in the investigation: 'How does the height of students change with age?'",
    ["Number of students", "Age", "Both height and age", "School"],
    "C",
    "EASY",
    "Two variables — height and age — are being compared, so both are needed for the investigation.\n\n**Answer: C**",
  ),
  mcq(
    "Which of the following is a CATEGORICAL variable?",
    [
      "Mass of a parcel",
      "Time to run $100$ m",
      "Type of pet owned",
      "Number of siblings",
    ],
    "C",
    "EASY",
    "Type of pet has categories (dog, cat, fish, etc.) rather than numerical measurements.\n\n**Answer: C**",
  ),
  mcq(
    "An investigation aims to compare snack preferences of $200$ students. Which graph would be MOST suitable?",
    ["Pie chart or column chart", "Scatterplot", "Line graph", "Time-series plot"],
    "A",
    "EASY",
    "Categorical data with proportions is best displayed using a pie chart or column chart.\n\n**Answer: A**",
  ),
  mcq(
    "A survey asks $50$ Year 11 students how many text messages they sent yesterday. The variable being measured is:",
    [
      "A categorical variable",
      "A numerical variable",
      "Not a variable",
      "A subjective opinion",
    ],
    "B",
    "MEDIUM",
    "Number of text messages is a count — numerical data.\n\n**Answer: B**",
  ),
  mcq(
    "A researcher wants to know the average daily screen time of teenagers. They survey only their three closest friends. The MAIN limitation of this investigation is:",
    [
      "The data is qualitative",
      "Sample size is too small to be reliable",
      "The friends are too old",
      "The survey question is too clear",
    ],
    "B",
    "MEDIUM",
    "A sample of $3$ is too small to be representative of all teenagers.\n\n**Answer: B**",
  ),
  mcq(
    "Which step belongs in the DATA ANALYSIS stage of a statistical investigation?",
    [
      "Designing the survey",
      "Selecting the participants",
      "Calculating the mean and creating a graph",
      "Writing the research question",
    ],
    "C",
    "MEDIUM",
    "Calculations such as mean, median, and graphing happen during data analysis.\n\n**Answer: C**",
  ),
  mcq(
    "A student investigates 'What is the most popular sport at our school?'. The MOST appropriate type of graph to display the results is:",
    ["Pie chart", "Scatterplot", "Line graph", "Histogram"],
    "A",
    "MEDIUM",
    "Sport choice is categorical and shows proportions of a whole, best suited to a pie chart.\n\n**Answer: A**",
  ),
  mcq(
    "When summarising numerical data, the MEDIAN is the:",
    [
      "Most frequent value",
      "Middle value when sorted",
      "Sum divided by count",
      "Difference between max and min",
    ],
    "B",
    "MEDIUM",
    "The median is the middle value of a sorted data set.\n\n**Answer: B**",
  ),
  mcq(
    "A school newspaper claims '$90\\%$ of students prefer pizza over salad'. To check this claim, the BEST action is to:",
    [
      "Accept it because it's printed",
      "Ask one student",
      "Examine the survey method and sample size",
      "Stop serving salad",
    ],
    "C",
    "HARD",
    "Examining the sampling method and size determines whether the claim is reliable.\n\n**Answer: C**",
  ),
  mcq(
    "A study reports the average daily commute is $48$ minutes. One commuter takes $5$ hours each day. The fairer comparison would be to:",
    [
      "Use only the average",
      "Use the range and median to also describe spread",
      "Ignore the high outlier",
      "Report only the maximum",
    ],
    "B",
    "HARD",
    "Reporting only the average can hide variability. Using range and median better describes spread and the typical value.\n\n**Answer: B**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Write a clear statistical question to investigate the favourite breakfast cereal of students in your class.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Example: 'What is the favourite breakfast cereal of students in our Year 11 class?'",
  ),
  sa(
    "Classify the following variable as numerical or categorical: 'Hair colour of students'.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Hair colour is a categorical variable.",
  ),
  sa(
    "Classify the following variable as numerical or categorical: 'Time taken (in seconds) to run $100$ metres'.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Time in seconds is a numerical variable.",
  ),
  sa(
    "State two reasons why a sample of just $5$ students would NOT be reliable for an investigation about the whole school's lunch preferences.",
    2,
    "EASY",
    "**Step 1 (1 mark):** The sample is too small to represent the variety of students at the school.\n\n**Step 2 (1 mark):** Findings could easily be biased or affected by chance with only $5$ responses.",
  ),
  sa(
    "List the four main stages of a statistical investigation in order.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Pose a question and plan the investigation.\n\n**Step 2 (1 mark):** Collect data, then analyse and present (e.g. summary statistics and graphs), then interpret and draw conclusions.",
  ),
  sa(
    "A school survey asks 'Do you support a longer lunch break?' to $40$ Year 12 students.\n\nIdentify one source of bias in this survey.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Only Year 12 students are surveyed; other year levels are excluded.\n\n**Step 2 (1 mark):** Therefore the results do not represent the whole school's view.",
  ),
  sa(
    "A student records the data set $\\{15, 18, 22, 19, 21, 17, 20\\}$ during an investigation.\n\nCalculate the mean of this data set.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Sum: $15 + 18 + 22 + 19 + 21 + 17 + 20 = 132$.\n\n**Step 2 (1 mark):** Mean $= \\dfrac{132}{7} \\approx 18.86$ (to $2$ d.p.).",
  ),
  sa(
    "A researcher investigates how many minutes of exercise students do per day. Suggest ONE appropriate way to present the results and ONE appropriate summary statistic.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** A column graph or histogram would clearly display the spread of exercise minutes across students.\n\n**Step 2 (1 mark):** The mean or median would summarise a typical number of exercise minutes per day.",
  ),
  sa(
    "Describe ONE way to ensure a sample of $40$ students from a school of $600$ is representative.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Use random selection (e.g. drawing names from a list) so that every student has an equal chance of being chosen.\n\n**Step 2 (1 mark):** Alternatively, ensure equal proportions from each year level to avoid bias.",
  ),
  sa(
    "A class of $25$ students records how many books they read in a month. The results are: $\\{2, 1, 3, 0, 4, 2, 1, 5, 3, 2, 1, 0, 4, 2, 3, 1, 2, 6, 1, 2, 3, 2, 1, 4, 2\\}$.\n\nCalculate the mean number of books read, correct to one decimal place.",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** Sum: $2 + 1 + 3 + 0 + 4 + 2 + 1 + 5 + 3 + 2 + 1 + 0 + 4 + 2 + 3 + 1 + 2 + 6 + 1 + 2 + 3 + 2 + 1 + 4 + 2 = 57$.\n\n**Step 2 (1 mark):** Mean $= \\dfrac{57}{25}$.\n\n**Step 3 (1 mark):** $= 2.28 \\approx 2.3$ books.",
  ),
  sa(
    "A magazine article reports that '$80\\%$ of Australians prefer summer to winter', based on a phone survey of $20$ people in Sydney.\n\nDiscuss two reasons why this claim is not reliable.",
    3,
    "HARD",
    "**Step 1 (1 mark):** The sample is too small ($20$ people) to represent the entire Australian population.\n\n**Step 2 (1 mark):** The sample is geographically biased — only Sydney residents were surveyed, ignoring climate differences across Australia.\n\n**Step 3 (1 mark):** Therefore the $80\\%$ claim cannot be reliably generalised to all Australians.",
  ),

  // ── EXTENDED_ANSWER (3) ─────────────────────────────────────────────
  ea(
    "Ben is conducting a statistical investigation. His research question is: 'How many hours of screen time do Year 11 students at our school have on a school day?'. He surveys $20$ students from his Maths class and records the following data (in hours):\n\n$\\{2, 4, 3, 5, 6, 2, 3, 4, 5, 7, 3, 4, 2, 5, 4, 3, 6, 4, 5, 3\\}$",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Identify whether the variable 'screen time in hours' is numerical or categorical.",
        solution: "**Step 1 (1 mark):** Screen time in hours is a numerical variable.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the mean number of hours of screen time, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Sum: $2 + 4 + 3 + 5 + 6 + 2 + 3 + 4 + 5 + 7 + 3 + 4 + 2 + 5 + 4 + 3 + 6 + 4 + 5 + 3 = 80$.\n\n**Step 2 (1 mark):** Mean $= \\dfrac{80}{20} = 4.0$ hours.",
      },
      {
        label: "c",
        marks: 1,
        content: "Calculate the range of the data.",
        solution: "**Step 1 (1 mark):** Range $= 7 - 2 = 5$ hours.",
      },
      {
        label: "d",
        marks: 2,
        content: "Identify and explain one limitation of Ben's investigation.",
        solution: "**Step 1 (1 mark):** The sample is limited to students in Ben's Maths class, so the data may not represent all Year 11 students.\n\n**Step 2 (1 mark):** Choosing a random sample across the year level (or a larger sample size) would reduce bias and improve reliability.",
      },
    ],
  ),
  ea(
    "A Year 11 class is investigating 'Do students prefer apples or bananas as a snack?' across the school. They survey $80$ students. The results are: $48$ chose apples and $32$ chose bananas.",
    "MEDIUM",
    [
      {
        label: "a",
        marks: 1,
        content: "Identify the variable in this investigation and state whether it is numerical or categorical.",
        solution: "**Step 1 (1 mark):** The variable is 'snack preference' — a categorical variable.",
      },
      {
        label: "b",
        marks: 2,
        content: "Calculate the percentage of students who chose apples.",
        solution: "**Step 1 (1 mark):** Fraction: $\\dfrac{48}{80}$.\n\n**Step 2 (1 mark):** Percentage: $\\dfrac{48}{80} \\times 100 = 60\\%$.",
      },
      {
        label: "c",
        marks: 1,
        content: "Suggest an appropriate type of graph to present this data, with reason.",
        solution: "**Step 1 (1 mark):** A pie chart (or column chart) is appropriate because the data is categorical and shows proportions of two categories making up a whole.",
      },
      {
        label: "d",
        marks: 2,
        content: "Based on the survey, draw a conclusion to answer the original research question.",
        solution: "**Step 1 (1 mark):** Sixty percent of surveyed students preferred apples to bananas.\n\n**Step 2 (1 mark):** Therefore, apples appear to be the more popular snack, based on this sample of $80$ students.",
      },
    ],
  ),
  ea(
    "A team of students is investigating: 'How many bottles of water are sold each day at the school canteen?'. The number of bottles sold over $10$ school days is:\n\n$\\{42, 51, 38, 47, 55, 40, 49, 53, 44, 46\\}$",
    "HARD",
    [
      {
        label: "a",
        marks: 2,
        content: "Calculate the mean number of bottles sold per day, correct to one decimal place.",
        solution: "**Step 1 (1 mark):** Sum: $42 + 51 + 38 + 47 + 55 + 40 + 49 + 53 + 44 + 46 = 465$.\n\n**Step 2 (1 mark):** Mean $= \\dfrac{465}{10} = 46.5$ bottles per day.",
      },
      {
        label: "b",
        marks: 1,
        content: "Calculate the range of bottles sold.",
        solution: "**Step 1 (1 mark):** Range $= 55 - 38 = 17$ bottles.",
      },
      {
        label: "c",
        marks: 2,
        content: "The school predicts daily sales for the next $20$ school days based on this average. Predict the total expected sales over $20$ school days.",
        solution: "**Step 1 (1 mark):** Use the mean as the daily prediction: $46.5$ bottles.\n\n**Step 2 (1 mark):** Total: $46.5 \\times 20 = 930$ bottles.",
      },
      {
        label: "d",
        marks: 3,
        content: "Identify one limitation of using the mean alone to predict future sales, and suggest how the investigation could be improved.",
        solution: "**Step 1 (1 mark):** The mean does not show the spread of the data — sales varied between $38$ and $55$ bottles.\n\n**Step 2 (1 mark):** Daily variation could be due to factors like weather or special events not captured in the $10$-day sample.\n\n**Step 3 (1 mark):** The investigation could be improved by collecting data over a longer period (e.g. a full term) and recording the weather to identify trends.",
      },
    ],
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`statistical-investigations: wrote ${items.length} items to ${OUT}`);
