import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import Link from "next/link";
import { FileText, HelpCircle, Users, FlaskConical, ImageIcon, Gift } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) redirect("/dashboard");

  const [examCount, questionCount, userCount, affiliateCount] = await Promise.all([
    prisma.exam.count(),
    prisma.question.count(),
    prisma.user.count(),
    prisma.affiliate.count(),
  ]);

  const stats = [
    { label: "Exams", value: examCount, icon: FileText, href: "/admin/exams" },
    { label: "Questions", value: questionCount, icon: HelpCircle, href: "/admin/questions" },
    { label: "Users", value: userCount, icon: Users, href: "/admin/users" },
    { label: "Affiliates", value: affiliateCount, icon: Gift, href: "/admin/affiliates" },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Admin Panel</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Manage exams, questions, users, and affiliates.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all group"
          >
            <Icon className="h-5 w-5 text-brand-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/exams/new"
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Add exam</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload a new past paper and attach its PDF.</p>
        </Link>
        <Link
          href="/admin/questions/new"
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Add question</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add a question with topic, marks, and solution.</p>
        </Link>
        <Link
          href="/admin/topics"
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Manage topics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add or edit topics and subtopics.</p>
        </Link>
        <Link
          href="/admin/seed"
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Seed topics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Populate the database with VCE Methods syllabus topics.</p>
        </Link>
        <Link
          href="/admin/extraction"
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
        >
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="h-4 w-4 text-brand-500 dark:text-brand-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Extraction Storage</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">View and manage uploaded extraction images.</p>
        </Link>
        <Link
          href="/admin/testing"
          className="rounded-2xl bg-white dark:bg-gray-900 border border-amber-100 dark:border-amber-800 shadow-sm p-5 hover:border-amber-300 dark:hover:border-amber-600 transition-all"
        >
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Testing</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Seed or clear test data for development.</p>
        </Link>
      </div>
    </div>
  );
}
