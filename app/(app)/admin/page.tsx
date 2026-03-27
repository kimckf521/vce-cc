export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, BookOpen, HelpCircle, Users } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") redirect("/dashboard");

  const [examCount, questionCount, userCount, solutionCount] = await Promise.all([
    prisma.exam.count(),
    prisma.question.count(),
    prisma.user.count(),
    prisma.solution.count(),
  ]);

  const stats = [
    { label: "Exams", value: examCount, icon: FileText, href: "/admin/exams" },
    { label: "Questions", value: questionCount, icon: HelpCircle, href: "/admin/questions" },
    { label: "Solutions", value: solutionCount, icon: BookOpen, href: "/admin/questions" },
    { label: "Users", value: userCount, icon: Users, href: "/admin/users" },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
      <p className="text-gray-500 mb-8">Manage exams, questions, solutions, and users.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:border-brand-300 transition-all group"
          >
            <Icon className="h-5 w-5 text-brand-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 group-hover:text-brand-600 transition-colors">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/exams/new"
          className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:border-brand-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900 mb-1">Add exam</h3>
          <p className="text-sm text-gray-500">Upload a new past paper and attach its PDF.</p>
        </Link>
        <Link
          href="/admin/questions/new"
          className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:border-brand-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900 mb-1">Add question</h3>
          <p className="text-sm text-gray-500">Add a question with topic, marks, and solution.</p>
        </Link>
        <Link
          href="/admin/topics"
          className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:border-brand-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900 mb-1">Manage topics</h3>
          <p className="text-sm text-gray-500">Add or edit topics and subtopics.</p>
        </Link>
        <Link
          href="/admin/seed"
          className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:border-brand-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900 mb-1">Seed topics</h3>
          <p className="text-sm text-gray-500">Populate the database with VCE Methods syllabus topics.</p>
        </Link>
      </div>
    </div>
  );
}
