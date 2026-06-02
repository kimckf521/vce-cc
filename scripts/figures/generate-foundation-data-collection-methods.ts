/**
 * Foundation generator: data-collection-methods
 * Tier: core-drill ONLY (14 MCQ + 11 SHORT = 25)
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "../output/foundation-batch/data-collection-methods.json");

const TOPIC = "data-analysis-probability-and-statistics";
const SUB = "data-collection-methods";

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
    "A census collects data from:",
    ["A random subset of the population", "Every member of the population", "Only volunteers", "Only people in one suburb"],
    "B",
    "EASY",
    "A census collects information from the entire population.\n\n**Answer: B**",
  ),
  mcq(
    "Which of the following is most likely to be a sample?",
    ["The Australian Bureau of Statistics' national Census", "Surveying $500$ Year $11$ students from across Victoria", "Asking every student in your school", "Counting every car in Melbourne"],
    "B",
    "EASY",
    "$500$ students is a subset of the broader population — a sample.\n\n**Answer: B**",
  ),
  mcq(
    "Which of the following data is primary?",
    ["Numbers from a Bureau of Meteorology report", "Statistics from a published news article", "A survey of your own classmates conducted by you", "Population figures from a government website"],
    "C",
    "EASY",
    "Primary data is collected first-hand by the researcher; secondary is from other sources.\n\n**Answer: C**",
  ),
  mcq(
    "An AFL coach measures all $22$ players' sprint times in the squad. This collection method is best described as a:",
    ["Sample", "Census", "Secondary data source", "Observational study"],
    "B",
    "EASY",
    "All squad members are measured — a census of the squad.\n\n**Answer: B**",
  ),
  mcq(
    "The most appropriate data collection method to estimate the average height of all Year $11$ students in Victoria is:",
    ["Surveying $20$ friends", "Surveying every Year $11$ student in your own class", "Taking a random sample of Year $11$ students across many schools", "Asking online volunteers from across the country"],
    "C",
    "EASY",
    "A random sample drawn across many schools gives the best estimate. The others are biased or too small.\n\n**Answer: C**",
  ),
  mcq(
    "A researcher wants to estimate the average daily spend of all customers at a Brisbane cafe over a month. She randomly selects $40$ customers each day. This is an example of:",
    ["A census", "A stratified sample", "A simple random sample", "A convenience sample"],
    "C",
    "EASY",
    "Customers are selected randomly each day, with no stratification — a simple random sample.\n\n**Answer: C**",
  ),
  mcq(
    "A school of $600$ students has $200$ in Year $11$ and $400$ in Year $12$. A researcher randomly selects $30$ students total, taking $10$ from Year $11$ and $20$ from Year $12$. This is best described as:",
    ["Convenience sample", "Stratified sample", "Self-selected sample", "Census"],
    "B",
    "MEDIUM",
    "The sample is drawn proportionally from strata (year levels) — stratified sample.\n\n**Answer: B**",
  ),
  mcq(
    "Sarah surveys the first $20$ people who walk into a Melbourne cafe. This is best described as:",
    ["Stratified sample", "Simple random sample", "Convenience sample", "Census"],
    "C",
    "MEDIUM",
    "Sampling from whoever is easiest to access is convenience sampling.\n\n**Answer: C**",
  ),
  mcq(
    "Which of the following is a potential disadvantage of a census?",
    ["Provides accurate data", "Is more cost-effective than sampling", "Can be expensive and time-consuming for large populations", "Always biased"],
    "C",
    "MEDIUM",
    "Censuses cover everyone, so they are typically expensive and slow for large populations.\n\n**Answer: C**",
  ),
  mcq(
    "An online poll on a newspaper website asks readers to vote on a controversial topic. Why might this give biased results?",
    ["The sample size is too small", "Only readers with strong opinions are likely to respond", "The poll only runs on weekends", "Internet polls always show the truth"],
    "B",
    "MEDIUM",
    "Self-selected online polls attract respondents with strong views — self-selection bias.\n\n**Answer: B**",
  ),
  mcq(
    "Which of the following situations is best suited to a sample rather than a census?",
    ["Counting the number of students absent in a Year $11$ class today", "Estimating the average travel time for $5$ million workers in Melbourne", "Recording the score of an AFL match", "Listing the days of the week a shop is open"],
    "B",
    "MEDIUM",
    "Surveying $5$ million workers is impractical — use a sample.\n\n**Answer: B**",
  ),
  mcq(
    "A Sydney scientist measures the pH of every $10$th sample of river water at a monitoring station. This sampling method is best described as:",
    ["Convenience sampling", "Systematic sampling", "Stratified sampling", "Self-selected sampling"],
    "B",
    "MEDIUM",
    "Selecting every $k$th item is systematic sampling.\n\n**Answer: B**",
  ),
  mcq(
    "Which of the following is most likely to introduce bias into a survey?",
    ["A randomly chosen sample of $1\\,000$ shoppers", "Wording a question as: \"Don't you agree that fast food is unhealthy?\"", "Surveying respondents anonymously", "Using stratified sampling proportional to age groups"],
    "B",
    "HARD",
    "Leading question wording biases responses — known as response bias.\n\n**Answer: B**",
  ),
  mcq(
    "A school has $300$ Year $7$ students, $200$ Year $11$ students and $100$ Year $12$ students. A stratified sample of $60$ students is taken proportional to year level. The number of Year $11$ students sampled is:",
    ["$10$", "$15$", "$20$", "$30$"],
    "C",
    "HARD",
    "Total students: $600$. Year $11$ proportion: $\\dfrac{200}{600} = \\dfrac{1}{3}$. Year $11$ in sample: $\\dfrac{1}{3} \\times 60 = 20$.\n\n**Answer: C**",
  ),

  // ── SHORT_ANSWER (11) ───────────────────────────────────────────────
  sa(
    "Explain the difference between a census and a sample.",
    1,
    "EASY",
    "**Step 1 (1 mark):** A census collects data from every member of a population; a sample collects data from only a subset of the population.",
  ),
  sa(
    "Give one advantage of using a sample instead of a census.",
    1,
    "EASY",
    "**Step 1 (1 mark):** Samples are cheaper and faster to collect than a census.",
  ),
  sa(
    "Classify the following as primary or secondary data: \"A student conducts her own survey of $30$ classmates about their favourite AFL team.\"",
    1,
    "EASY",
    "**Step 1 (1 mark):** Primary data (collected directly by the researcher).",
  ),
  sa(
    "A Melbourne shop wants to know the average age of its customers. The owner asks the first $15$ customers on Saturday morning.\n\n(i) State the type of sampling used.\n\n(ii) Give one reason this method may give biased results.",
    2,
    "EASY",
    "**Step 1 (1 mark):** (i) Convenience sampling — the owner uses customers who are easiest to access.\n\n**Step 2 (1 mark):** (ii) The first $15$ Saturday-morning customers may not represent the typical customer base (e.g. weekday or evening customers are excluded).",
  ),
  sa(
    "A researcher wants to estimate the proportion of adults in Australia who play sport weekly. Explain why a sample would be more practical than a census.",
    2,
    "EASY",
    "**Step 1 (1 mark):** A census would require contacting every adult in Australia (millions of people), which is expensive and slow.\n\n**Step 2 (1 mark):** A well-chosen sample gives a good estimate at a much lower cost and in less time.",
  ),
  sa(
    "A school of $1\\,200$ students wishes to survey $60$ students about cafeteria food. Year $11$ has $400$ students, Year $12$ has $300$, and the remainder are in Years $7$–$10$.\n\nIf stratified sampling proportional to year level is used, how many Year $11$ students should be in the sample?",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** Year $11$ proportion: $\\dfrac{400}{1200} = \\dfrac{1}{3}$.\n\n**Step 2 (1 mark):** Sample size from Year $11$: $\\dfrac{1}{3} \\times 60 = 20$ students.",
  ),
  sa(
    "Describe one example of each of the following sampling methods.\n\n(i) Simple random sample\n\n(ii) Convenience sample",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** (i) Putting all student names in a hat and drawing $20$ at random.\n\n**Step 2 (1 mark):** (ii) Asking only friends, family or whoever is nearby (e.g. the first $10$ shoppers at a Brisbane store).",
  ),
  sa(
    "A Sydney newspaper invites online readers to vote on whether public transport fares should rise. Of $5\\,000$ votes, $80\\%$ say \"no\". Explain why this result may not represent the views of all Sydney residents.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** The poll is self-selected — only readers who feel strongly about fares are likely to vote, especially those opposing the rise.\n\n**Step 2 (1 mark):** Non-readers and readers without strong opinions are under-represented, so the sample is biased and cannot be generalised to all Sydney residents.",
  ),
  sa(
    "A Year $11$ student claims to have collected primary data by copying weather statistics from the Bureau of Meteorology website. Is this primary or secondary data? Justify your answer.",
    2,
    "MEDIUM",
    "**Step 1 (1 mark):** The data is secondary — it was originally collected by the Bureau of Meteorology, not by the student.\n\n**Step 2 (1 mark):** Primary data would mean the student measured weather themselves (e.g. recording rainfall in their own backyard).",
  ),
  sa(
    "A council wants to know how often residents in Brunswick use the local library. Suggest TWO different sampling methods the council could use, and identify one strength and one weakness of each.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Method 1: Simple random sample of residents from the electoral roll. Strength: unbiased. Weakness: may be slow and expensive.\n\n**Step 2 (1 mark):** Method 2: Convenience sample of people inside the library on a Tuesday. Strength: quick and cheap. Weakness: misses non-users, so biased.\n\n**Step 3 (1 mark):** The simple random sample is more reliable for estimating overall usage by residents, even though it is more expensive.",
  ),
  sa(
    "A Melbourne research firm needs to survey $200$ employees from a company with $1\\,500$ staff. The company has $900$ office workers, $450$ warehouse workers and $150$ delivery drivers. Using stratified sampling proportional to group size, calculate how many employees from each group should be surveyed.",
    3,
    "HARD",
    "**Step 1 (1 mark):** Office workers: $\\dfrac{900}{1500} \\times 200 = 120$ employees.\n\n**Step 2 (1 mark):** Warehouse workers: $\\dfrac{450}{1500} \\times 200 = 60$ employees.\n\n**Step 3 (1 mark):** Delivery drivers: $\\dfrac{150}{1500} \\times 200 = 20$ employees. (Total: $120 + 60 + 20 = 200$.)",
  ),
];

if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ items }, null, 2));
console.log(`data-collection-methods: wrote ${items.length} items to ${OUT}`);
