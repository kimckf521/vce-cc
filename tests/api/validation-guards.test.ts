import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    exam: { create: vi.fn().mockResolvedValue({ id: "exam1" }) },
    question: {
      create: vi.fn().mockResolvedValue({ id: "q1" }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    attempt: {
      upsert: vi.fn().mockResolvedValue({ id: "a1" }),
      delete: vi.fn().mockResolvedValue({}),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: "user1", role: "ADMIN" }),
      update: vi.fn().mockResolvedValue({ id: "u1" }),
    },
    examSession: {
      create: vi.fn().mockResolvedValue({ id: "es1" }),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

// Mock Supabase
const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}));

// Mock rate limiting — always allow
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(null),
}));

describe("API validation guards", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user1" } } });
  });

  describe("POST /api/admin/exams", () => {
    it("rejects invalid exam type", async () => {
      // Dynamically import after mocks
      const { POST } = await import("@/app/api/admin/exams/route");
      const req = new Request("http://localhost/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: 2024, examType: "EXAM_99" }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    it("rejects missing year", async () => {
      const { POST } = await import("@/app/api/admin/exams/route");
      const req = new Request("http://localhost/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examType: "EXAM_1" }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/attempts", () => {
    it("rejects invalid status", async () => {
      const { POST } = await import("@/app/api/attempts/route");
      const req = new Request("http://localhost/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: "q1", status: "PERFECT" }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });

    it("rejects empty questionId", async () => {
      const { POST } = await import("@/app/api/attempts/route");
      const req = new Request("http://localhost/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: "", status: "CORRECT" }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });

    it("returns 401 when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const { POST } = await import("@/app/api/attempts/route");
      const req = new Request("http://localhost/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: "q1", status: "CORRECT" }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/attempts", () => {
    it("returns 401 when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const { DELETE } = await import("@/app/api/attempts/route");
      const req = new Request("http://localhost/api/attempts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: "q1" }),
      });

      const res = await DELETE(req as any);
      expect(res.status).toBe(401);
    });

    it("rejects empty questionId", async () => {
      const { DELETE } = await import("@/app/api/attempts/route");
      const req = new Request("http://localhost/api/attempts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: "" }),
      });

      const res = await DELETE(req as any);
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/user/update-name", () => {
    it("rejects empty name", async () => {
      const { POST } = await import("@/app/api/user/update-name/route");
      const req = new Request("http://localhost/api/user/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });

    it("rejects name over 100 chars", async () => {
      const { POST } = await import("@/app/api/user/update-name/route");
      const req = new Request("http://localhost/api/user/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "A".repeat(101) }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });

    it("returns 401 when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const { POST } = await import("@/app/api/user/update-name/route");
      const req = new Request("http://localhost/api/user/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Valid Name" }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/search", () => {
    it("rejects empty query", async () => {
      const { GET } = await import("@/app/api/search/route");
      const url = new URL("http://localhost/api/search?q=");
      const req = new Request(url);
      Object.defineProperty(req, "nextUrl", { value: url });

      const res = await GET(req as any);
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/exam-sessions", () => {
    it("returns 401 when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const { POST } = await import("@/app/api/exam-sessions/route");
      const req = new Request("http://localhost/api/exam-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "Exam 2A",
          totalQuestions: 20,
          correctCount: 15,
          incorrectCount: 5,
          score: 75,
        }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(401);
    });

    it("rejects invalid score (negative)", async () => {
      const { POST } = await import("@/app/api/exam-sessions/route");
      const req = new Request("http://localhost/api/exam-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "Exam 2A",
          totalQuestions: 20,
          correctCount: 15,
          incorrectCount: 5,
          score: -10,
        }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });
  });
});
