import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ExamModeWrapper from "@/components/ExamModeWrapper";

// Mock next/dynamic — SolutionModal is dynamically imported
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    const Component = (props: Record<string, unknown>) => null;
    Component.displayName = "DynamicMock";
    return Component;
  },
}));

// Mock Supabase client (used by useSessionRefresh)
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  }),
}));

// Mock useAutoSave hook
vi.mock("@/hooks/useAutoSave", () => ({
  useAutoSave: () => ({
    restore: () => null,
    updateSelections: vi.fn(),
    updateStatuses: vi.fn(),
    updateElapsed: vi.fn(),
    markSubmitted: vi.fn(),
  }),
}));

// Mock fetch for attempt saving and exam session creation
const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
vi.stubGlobal("fetch", mockFetch);

// Suppress scrollTo
vi.stubGlobal("scrollTo", vi.fn());

const sampleGroups = [
  {
    examId: "e1",
    year: 2024,
    examType: "EXAM_2" as const,
    topicName: "Calculus",
    subtopics: ["Differentiation"],
    parts: [
      {
        id: "q1",
        questionNumber: 1,
        part: null,
        marks: 1,
        content: "What is f'(x)?\n**A.** 2x\n**B.** 3x\n**C.** x\n**D.** 4x",
        imageUrl: null,
        difficulty: "EASY" as const,
        solution: { content: "**Answer: A**\nUsing the power rule.", imageUrl: null, videoUrl: null },
        initialStatus: null,
      },
    ],
  },
  {
    examId: "e1",
    year: 2024,
    examType: "EXAM_2" as const,
    topicName: "Calculus",
    subtopics: ["Integration"],
    parts: [
      {
        id: "q2",
        questionNumber: 2,
        part: null,
        marks: 1,
        content: "What is the integral of x?\n**A.** x²/2\n**B.** x²\n**C.** 2x\n**D.** x",
        imageUrl: null,
        difficulty: "MEDIUM" as const,
        solution: { content: "**Answer: A**\nIntegrate.", imageUrl: null, videoUrl: null },
        initialStatus: null,
      },
    ],
  },
];

function renderExam(props?: Partial<React.ComponentProps<typeof ExamModeWrapper>>) {
  return render(
    <ExamModeWrapper
      groups={sampleGroups}
      totalQuestions={2}
      sectionLabel="Exam 2A"
      calculatorAllowed={true}
      showScore={true}
      {...props}
    />
  );
}

describe("ExamModeWrapper — exam flow", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders question cards and submit button", () => {
    vi.useFakeTimers();
    renderExam();

    // Check that the component renders the submit button with 0 answered
    expect(screen.getByText(/Submit Exam \(0\/2 answered\)/)).toBeDefined();

    // Check that question content is present (the MCQ body text)
    expect(screen.getByText(/What is f'\(x\)\?/)).toBeDefined();
    expect(screen.getByText(/What is the integral of x\?/)).toBeDefined();
  });

  it("shows submit button with answered count", () => {
    vi.useFakeTimers();
    renderExam();
    expect(screen.getByText(/Submit Exam \(0\/2 answered\)/)).toBeDefined();
  });

  it("submitting shows the results banner", async () => {
    renderExam();

    const submitBtn = screen.getByText(/Submit Exam/);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Exam Results")).toBeDefined();
    });
  });

  it("submitting saves exam session via API", async () => {
    renderExam();

    fireEvent.click(screen.getByText(/Submit Exam/));

    await waitFor(() => {
      const sessionCall = mockFetch.mock.calls.find(
        (call: unknown[]) => (call[0] as string) === "/api/exam-sessions"
      );
      expect(sessionCall).toBeDefined();
      const body = JSON.parse((sessionCall![1] as { body: string }).body);
      expect(body.mode).toBe("Exam 2A");
      expect(body.totalQuestions).toBe(2);
      expect(body.correctCount).toBe(0);
      expect(body.score).toBe(0);
    });
  });

  it("hides submit button after submission", async () => {
    renderExam();

    fireEvent.click(screen.getByText(/Submit Exam/));

    await waitFor(() => {
      expect(screen.queryByText(/Submit Exam/)).toBeNull();
    });
  });

  it("elapsed timer increments with fake timers", () => {
    vi.useFakeTimers();
    renderExam();

    // Advance 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Submit — the handler reads elapsedSeconds synchronously
    act(() => {
      fireEvent.click(screen.getByText(/Submit Exam/));
    });

    // Check the API was called with elapsed time >= 4
    const sessionCall = mockFetch.mock.calls.find(
      (call: unknown[]) => (call[0] as string) === "/api/exam-sessions"
    );
    expect(sessionCall).toBeDefined();
    const body = JSON.parse((sessionCall![1] as { body: string }).body);
    expect(body.elapsedSeconds).toBeGreaterThanOrEqual(4);
  });

  it("shows score breakdown after submit", async () => {
    renderExam();

    fireEvent.click(screen.getByText(/Submit Exam/));

    await waitFor(() => {
      // Should show "0 correct" since no answers were selected
      expect(screen.getByText(/0 correct/)).toBeDefined();
      // Should show percentage
      expect(screen.getByText("0%")).toBeDefined();
    });
  });
});
