'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { Assignment } from '@/types';
import { assignmentService } from '@/services/api';
import { useAppSelector } from '@/store/hooks';
import {
  AssignmentsIcon,
  SparkleIcon,
  HomeIcon,
} from '@/components/icons';
import toast from 'react-hot-toast';

export default function HomePage() {
  const user = useAppSelector((s) => s.auth.user);
  const [assignments, setAssignments] = useState<
    (Assignment & { hasPaper?: boolean })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentService
      .list()
      .then((res) => setAssignments(res.data.assignments || []))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const withPaper = assignments.filter((a) => a.hasPaper).length;
    return {
      total: assignments.length,
      generated: withPaper,
      pending: assignments.length - withPaper,
    };
  }, [assignments]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment and its paper?')) return;
    try {
      await assignmentService.delete(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const recent = useMemo(
    () =>
      [...assignments]
        .sort((a, b) => {
          const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
          const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
          return tb - ta;
        })
        .slice(0, 3),
    [assignments]
  );

  const firstName = user?.name?.split(' ')[0] || 'Teacher';

  return (
    <>
      <TopBar title="Home" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl">
        <section className="ui-card p-6 sm:p-8 mb-8 bg-gradient-to-br from-brand-dark to-gray-800 text-white border-0">
          <p className="text-sm text-white/70 mb-1">Welcome back</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Hi, {firstName} 👋
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl">
            Your dashboard for creating AI-powered assessments. Start something
            new or pick up where you left off.
          </p>
        </section>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/create"
            className="ui-card p-5 flex gap-4 items-start hover:border-brand-orange/50 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-orange/15 flex items-center justify-center text-brand-orange shrink-0 group-hover:bg-brand-orange/25 transition">
              <SparkleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-brand-dark">Create Assignment</h2>
              <p className="text-sm text-brand-muted mt-1">
                Set marks, question types, and optional reference material.
              </p>
            </div>
          </Link>

          <Link
            href="/assignments"
            className="ui-card p-5 flex gap-4 items-start hover:border-brand-orange/50 hover:shadow-md transition group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-surface flex items-center justify-center text-brand-dark shrink-0 border border-brand-border group-hover:border-brand-orange/30 transition">
              <AssignmentsIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-brand-dark">All Assignments</h2>
              <p className="text-sm text-brand-muted mt-1">
                Browse, search, and manage your full library
                {stats.total > 0 ? ` (${stats.total} total)` : ''}.
              </p>
            </div>
          </Link>
        </div>

        {!loading && assignments.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg">
            <div className="ui-card p-4 text-center">
              <p className="text-2xl font-bold text-brand-dark">{stats.total}</p>
              <p className="text-xs text-brand-muted mt-1">Total</p>
            </div>
            <div className="ui-card p-4 text-center">
              <p className="text-2xl font-bold text-brand-orange">
                {stats.generated}
              </p>
              <p className="text-xs text-brand-muted mt-1">With paper</p>
            </div>
            <div className="ui-card p-4 text-center">
              <p className="text-2xl font-bold text-brand-muted">
                {stats.pending}
              </p>
              <p className="text-xs text-brand-muted mt-1">In progress</p>
            </div>
          </div>
        )}

        <section className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-brand-dark flex items-center gap-2">
              <HomeIcon className="w-5 h-5 text-brand-muted" />
              Recent activity
            </h2>
            {assignments.length > 0 && (
              <Link
                href="/assignments"
                className="text-sm font-semibold text-brand-orange hover:underline"
              >
                View all →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="ui-card p-8 text-center">
              <p className="text-brand-muted mb-4">
                No assignments yet. Create your first one to get started.
              </p>
              <Link href="/create" className="ui-btn-primary inline-flex">
                + Create assignment
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {recent.map((a) => (
                <AssignmentCard
                  key={a._id}
                  assignment={a}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        <section className="ui-card p-6 bg-brand-orange/5 border-brand-orange/20">
          <h3 className="font-semibold text-brand-dark mb-2">How it works</h3>
          <ol className="text-sm text-brand-muted space-y-2">
            <li>
              <span className="font-bold text-brand-orange">1.</span> Create an
              assignment with your criteria
            </li>
            <li>
              <span className="font-bold text-brand-orange">2.</span> Generate a
              structured question paper with AI
            </li>
            <li>
              <span className="font-bold text-brand-orange">3.</span> Review,
              print, or download as PDF
            </li>
          </ol>
        </section>
      </main>
    </>
  );
}
