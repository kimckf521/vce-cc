/**
 * Foundation generator: categorical-and-numerical-data
 * Tier: core-drill ONLY (14 MCQ + 11 SHORT = 25)
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/categorical-and-numerical-data.json");

const TOPIC = "data-analysis-probability-and-statistics";
const SUB = "categorical-and-numerical-data";

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

const items: Item[] = [
  // ── MCQ (14) ─────────────────────────────────────────────────────────
  mcq(
    "Which of the following variables is categorical?",
    ["Height of students in cm", "Number of siblings", "Favourite football team", "Time taken to run $100$ m"],
    "C",
    "EASY",
    "Categorical variables describe categories/labels, not numerical measurement. \"Favourite football team\" is a category (e.g. Tigers, Cats).\n\n**Answer: C**",
  ),
  mcq(
    "Which of the following variables is numerical?",
    ["Eye colour", "Suburb of residence", "Weekly grocery spend in dollars", "Type of pet owned"],
    "C",
    "EASY",
    "Weekly grocery spend is a measurable number (e.g. $\\$140$).\n\n**Answer: C**",
  ),
  mcq(
    "A survey asks students about their preferred mode of travel to school (walk, bike, car, train). This variable is best classified as:",
    ["Numerical discrete", "Numerical continuous", "Categorical nominal", "Categorical ordinal"],
    "C",
    "EASY",
    "The categories (walk, bike, car, train) have no inherent order, so the variable is categorical nominal.\n\n**Answer: C**",
  ),
  mcq(
    "Which of the following is an example of a discrete numerical variable?",
    ["Time spent watching TV per day in minutes", "Number of goals scored in an AFL game", "Weight of a Melbourne loaf of bread", "Temperature in Sydney at noon"],
    "B",
    "EASY",
    "Number of goals is counted (can only be whole numbers) — that is discrete numerical.\n\n**Answer: B**",
  ),
  mcq(
    "Which of the following is an example of a continuous numerical variable?",
    ["Number of pets owned", "T-shirt size (S, M, L)", "Height of an adult in cm", "AFL team supported"],
    "C",
    "EASY",
    "Height can take any value within a range (e.g. $172.4$ cm) — continuous numerical.\n\n**Answer: C**",
  ),
  mcq(
    "Clothing sizes labelled \"Small\", \"Medium\", \"Large\" are best classified as:",
    ["Numerical discrete", "Numerical continuous", "Categorical nominal", "Categorical ordinal"],
    "D",
    "EASY",
    "Sizes have a meaningful order (S < M < L) — categorical ordinal.\n\n**Answer: D**",
  ),
  mcq(
    "A weather station records daily rainfall in millimetres. This variable is best classified as:",
    ["Numerical continuous", "Numerical discrete", "Categorical nominal", "Categorical ordinal"],
    "A",
    "MEDIUM",
    "Rainfall can take any value (e.g. $5.4$ mm), so it is numerical continuous.\n\n**Answer: A**",
  ),
  mcq(
    "Which type of graph is most appropriate for displaying categorical data?",
    ["Histogram", "Bar chart", "Scatter plot", "Line graph showing change over time"],
    "B",
    "MEDIUM",
    "Bar charts are designed for categorical data; histograms are for numerical (continuous) data.\n\n**Answer: B**",
  ),
  mcq(
    "Which of the following is an ordinal categorical variable?",
    ["Hair colour", "Movie rating (G, PG, M, MA, R)", "AFL team supported", "Suburb of birth"],
    "B",
    "MEDIUM",
    "Movie classifications have a clear order (G < PG < M < MA < R) — ordinal.\n\n**Answer: B**",
  ),
  mcq(
    "A researcher counts the number of cars passing a Melbourne intersection each hour. This variable is best described as:",
    ["Numerical discrete", "Numerical continuous", "Categorical nominal", "Categorical ordinal"],
    "A",
    "MEDIUM",
    "Cars are counted in whole numbers — discrete numerical.\n\n**Answer: A**",
  ),
  mcq(
    "A student records the postcodes of $30$ classmates. Although postcodes look like numbers, the variable is best classified as:",
    ["Numerical discrete", "Numerical continuous", "Categorical nominal", "Categorical ordinal"],
    "C",
    "MEDIUM",
    "Postcodes are labels for locations, not measurements — categorical nominal.\n\n**Answer: C**",
  ),
  mcq(
    "Which of the following pairs has the same type of variable?",
    ["Number of siblings; height in cm", "AFL team; favourite colour", "Weight in kg; postcode", "Class size; movie rating"],
    "B",
    "MEDIUM",
    "AFL team and favourite colour are both categorical nominal. The others mix types.\n\n**Answer: B**",
  ),
  mcq(
    "A market researcher in Brisbane asks shoppers to rate a new product from $1$ (poor) to $5$ (excellent). The variable is best classified as:",
    ["Numerical continuous", "Numerical discrete", "Categorical nominal", "Categorical ordinal"],
    "D",
    "HARD",
    "The ratings $1$–$5$ have a clear ranking but are not true measurements of magnitude — categorical ordinal.\n\n**Answer: D**",
  ),
  mcq(
    "Identify the variable that is NOT continuous numerical.",
    ["Weight of a watermelon at a Sydney market", "Time spent commuting in minutes", "Number of customers entering a cafe per day", "Distance run by an athlete in km"],
    "C",
    "HARD",
    "Number of customers is counted (whole numbers) — discrete, not continuous.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Classify the following variable as categorical or numerical: \"Favourite ice-cream flavour\".",
    1,
    "EASY",
    "**Step 1 (1 mark):** Categorical (the values are labels/categories, not numbers).",
  ),
  sa(
    "Classify the following variable as categorical or numerical: \"Number of pets at home\".",
    1,
    "EASY",
    "**Step 1 (1 mark):** Numerical (the values are counts).",
  ),
  sa(
    "State whether the variable \"Weight of a parcel in kg\" is discrete or continuous numerical.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Continuous (weight can take any value, e.g. $2.345$ kg).",
  ),
  sa(
    "Classify the following two variables as categorical or numerical:\n\n(i) \"Mode of transport to school\"\n\n(ii) \"Daily rainfall in mm\".",
    2,
    "EASY",
    "**Step 1 (1 mark):** (i) Categorical (mode of transport is a label).\n\n**Step 2 (1 mark):** (ii) Numerical (rainfall is a measurement).",
  ),
  sa(
    "A Melbourne survey collects: hair colour, height in cm, T-shirt size (S/M/L), number of siblings.\n\nFor each variable, state whether it is categorical or numerical.",
    2,
    "EASY",
    "**Step 1 (1 mark):** Hair colour: categorical. Height in cm: numerical.\n\n**Step 2 (1 mark):** T-shirt size: categorical. Number of siblings: numerical.",
  ),
  sa(
    "For each variable below, classify it as nominal or ordinal categorical:\n\n(i) Favourite colour\n\n(ii) Year level at school (Year 7, 8, 9, ...)",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** (i) Nominal — colours have no natural order.\n\n**Step 2 (1 mark):** (ii) Ordinal — year levels are ordered.",
  ),
  sa(
    "For each variable below, classify it as discrete or continuous numerical:\n\n(i) Number of AFL goals scored\n\n(ii) Time to run $100$ m in seconds",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** (i) Discrete (counted in whole numbers).\n\n**Step 2 (1 mark):** (ii) Continuous (time is a measurement).",
  ),
  sa(
    "A Brisbane researcher records the suburb of residence for each respondent. Although postcodes are numbers, explain why this variable is treated as categorical.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Postcodes are used as labels to identify suburbs, not as measurements of any quantity.\n\n**Step 2 (1 mark):** Arithmetic on postcodes (averaging, adding) is meaningless, so the variable is categorical nominal.",
  ),
  sa(
    "Decide whether each of the following variables is categorical or numerical, and if numerical, whether discrete or continuous.\n\n(i) Cost of a coffee in dollars\n\n(ii) Brand of mobile phone",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** (i) Numerical, continuous.\n\n**Step 2 (1 mark):** (ii) Categorical (nominal).",
  ),
  sa(
    "A Sydney teacher collects the following information from each Year $11$ student: their AFL team, the number of after-school sports played per week, their height in centimetres, and a satisfaction rating of $1$ to $5$ on the school cafe.\n\nFor each variable, classify it fully (e.g. \"categorical nominal\", \"numerical discrete\", \"numerical continuous\", \"categorical ordinal\").",
    3,
    "MEDIUM",
    "**Step 1 (1 mark):** AFL team: categorical nominal. After-school sports per week: numerical discrete.\n\n**Step 2 (1 mark):** Height in cm: numerical continuous.\n\n**Step 3 (1 mark):** Satisfaction rating $1$–$5$: categorical ordinal.",
  ),
  sa(
    "A Melbourne market researcher claims that \"customer income in dollars\" and \"customer income bracket (low, medium, high)\" are the same type of variable. Explain why this is incorrect and classify each correctly.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Income in dollars is a measurable quantity, so it is numerical continuous.\n\n**Step 2 (1 mark):** Income bracket groups customers into ordered labels — categorical ordinal.\n\n**Step 3 (1 mark):** The two variables are different types: one is numerical, the other categorical, so they should not be analysed in the same way.",
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`categorical-and-numerical-data: wrote ${items.length} items to ${OUT}`);
