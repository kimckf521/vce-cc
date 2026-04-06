import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/utils";

const TEST_EXAM_YEAR = 9999;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const questions = await prisma.question.findMany({
    where: { exam: { year: TEST_EXAM_YEAR } },
    include: {
      exam: { select: { year: true, examType: true } },
      topic: { select: { name: true } },
      solution: { select: { content: true, imageUrl: true } },
    },
    orderBy: [
      { exam: { examType: "asc" } },
      { questionNumber: "asc" },
      { part: "asc" },
    ],
  });

  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`admin-testing:${user.id}`, { maxRequests: 20, windowMs: 60_000 });
  if (limited) return limited;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { action } = body;

  if (action === "seed") {
    // Get first topic for linking test questions
    const topic = await prisma.topic.findFirst({ orderBy: { order: "asc" } });
    if (!topic) {
      return NextResponse.json({ error: "No topics found. Seed topics first." }, { status: 400 });
    }

    // Create test exam
    const exam1 = await prisma.exam.upsert({
      where: { year_examType: { year: TEST_EXAM_YEAR, examType: "EXAM_1" } },
      update: {},
      create: { year: TEST_EXAM_YEAR, examType: "EXAM_1" },
    });

    const exam2 = await prisma.exam.upsert({
      where: { year_examType: { year: TEST_EXAM_YEAR, examType: "EXAM_2" } },
      update: {},
      create: { year: TEST_EXAM_YEAR, examType: "EXAM_2" },
    });

    // Sample test questions
    const testQuestions = [
      {
        examId: exam1.id,
        topicId: topic.id,
        questionNumber: 1,
        part: null,
        marks: 2,
        difficulty: "EASY" as const,
        content: "**[TEST]** Find the derivative of $f(x) = 3x^2 + 2x - 5$.",
        imageUrl: null,
      },
      {
        examId: exam1.id,
        topicId: topic.id,
        questionNumber: 2,
        part: null,
        marks: 3,
        difficulty: "MEDIUM" as const,
        content: "**[TEST]** Solve $2x^2 - 5x + 3 = 0$ for $x$.",
        imageUrl: null,
      },
      {
        examId: exam1.id,
        topicId: topic.id,
        questionNumber: 3,
        part: null,
        marks: 4,
        difficulty: "HARD" as const,
        content: "**[TEST]** The graph of $y = f(x)$ is shown below. Sketch the graph of $y = f'(x)$.",
        imageUrl: 'function:{"fn":"x^3 - 3*x","xMin":-3,"xMax":3,"yMin":-5,"yMax":5,"gridStep":1}',
      },
      {
        examId: exam2.id,
        topicId: topic.id,
        questionNumber: 1,
        part: null,
        marks: 1,
        difficulty: "EASY" as const,
        content: "**[TEST MCQ]** The derivative of $\\sin(2x)$ is:\n\nA. $\\cos(2x)$\nB. $2\\cos(2x)$\nC. $-2\\cos(2x)$\nD. $2\\sin(2x)$\nE. $-\\sin(2x)$",
        imageUrl: null,
      },
      {
        examId: exam2.id,
        topicId: topic.id,
        questionNumber: 5,
        part: "a",
        marks: 2,
        difficulty: "MEDIUM" as const,
        content: "**[TEST]** Consider the function $f(x) = x^2 e^{-x}$ for $x \\geq 0$.\n\nFind $f'(x)$.",
        imageUrl: null,
      },
      {
        examId: exam2.id,
        topicId: topic.id,
        questionNumber: 5,
        part: "b",
        marks: 3,
        difficulty: "MEDIUM" as const,
        content: "**[TEST]** Find the coordinates of the stationary points of $f$ and determine their nature.",
        imageUrl: 'function:{"fn":"x^2 * Math.exp(-x)","xMin":-1,"xMax":6,"yMin":-0.5,"yMax":1.5,"gridStep":1}',
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const q of testQuestions) {
      const existing = await prisma.question.findFirst({
        where: { examId: q.examId, questionNumber: q.questionNumber, part: q.part },
      });
      if (existing) {
        skipped++;
        continue;
      }

      await prisma.question.create({
        data: {
          ...q,
          solution: {
            create: {
              content: `**[TEST SOLUTION]** This is a placeholder solution for test question ${q.questionNumber}${q.part ? q.part : ""}.`,
            },
          },
        },
      });
      created++;
    }

    return NextResponse.json({
      message: `Test data seeded: ${created} questions created, ${skipped} skipped (already exist).`,
      exams: { exam1: exam1.id, exam2: exam2.id },
    });
  }

  if (action === "clear") {
    // Delete test exams (cascades to questions, solutions, attempts)
    const deleted = await prisma.exam.deleteMany({
      where: { year: TEST_EXAM_YEAR },
    });

    return NextResponse.json({
      message: `Test data cleared: ${deleted.count} test exam(s) removed with all associated questions, solutions, and attempts.`,
    });
  }

  return NextResponse.json({ error: "Invalid action. Use 'seed' or 'clear'." }, { status: 400 });
}
