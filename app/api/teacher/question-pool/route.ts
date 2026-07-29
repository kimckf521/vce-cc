import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requireTeacher } from "@/lib/teacher-gate";
import { teacherPoolQuerySchema } from "@/lib/validations";
import {
  questionSetItemSelect,
  serializePoolItem,
} from "@/lib/teacher-assessments";
import {
  approvedItemsFilter,
  getGeneratedQuestionSetId,
} from "@/lib/question-set-groups";
import { getDbSubjectSlug } from "@/lib/subject-context";

/**
 * GET /api/teacher/question-pool — browse the generated bank (APPROVED items
 * only — T1 never exposes VCAA past-paper Question rows here). Filterable by
 * topic / difficulty / type / tech plus a case-insensitive text substring
 * (`q`, matched against content OR preamble), cursor-paginated by id.
 */
export async function GET(req: NextRequest) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`teacher-question-pool:${user.id}`, {
    maxRequests: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const parsed = teacherPoolQuerySchema.safeParse({
    subjectSlug: searchParams.get("subjectSlug") ?? undefined,
    topicId: searchParams.get("topicId") ?? undefined,
    difficulty: searchParams.get("difficulty") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    tech: searchParams.get("tech") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { subjectSlug, topicId, difficulty, type, tech, q, cursor, limit } =
    parsed.data;

  // Accept either the short URL slug (methods) or the DB slug
  // (mathematical-methods) — getDbSubjectSlug translates the former and
  // passes the latter through unchanged.
  const setId = await getGeneratedQuestionSetId(getDbSubjectSlug(subjectSlug));
  if (!setId) {
    // Subject has no generated bank (or the slug is unknown) — an empty
    // pool, not an error, so the UI renders its normal empty state.
    return NextResponse.json({ items: [], nextCursor: null });
  }

  const rows = await prisma.questionSetItem.findMany({
    where: {
      ...approvedItemsFilter(setId),
      ...(topicId && { topicId }),
      ...(difficulty && { difficulty }),
      ...(type && { type }),
      // "ANY" (or omitted) means no tech filter; a concrete value matches
      // exactly that tag — unclassified (null-tech) rows only appear unfiltered.
      ...(tech && tech !== "ANY" && { tech }),
      // Parts-based items (all Foundation EA/ER, for one) keep their text in
      // preamble + parts with an EMPTY content column — searching content
      // alone made them unfindable. OR across both text columns. (Text inside
      // the parts JSON is still not searched; acceptable for now since the
      // scenario/stem carries the searchable vocabulary.)
      ...(q && {
        OR: [
          { content: { contains: q, mode: "insensitive" as const } },
          { preamble: { contains: q, mode: "insensitive" as const } },
        ],
      }),
    },
    orderBy: { id: "asc" },
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    // Fetch one extra row to learn whether another page exists.
    take: limit + 1,
    select: questionSetItemSelect,
  });

  const page = rows.slice(0, limit);
  const nextCursor = rows.length > limit ? page[page.length - 1].id : null;

  return NextResponse.json({
    items: page.map(serializePoolItem),
    nextCursor,
  });
}
