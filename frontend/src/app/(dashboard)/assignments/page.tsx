'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { EmptyState } from '@/components/assignments/EmptyState';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { Assignment } from '@/types';
import { assignmentService } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { setAssignmentList } from '@/store/assignmentSlice';
import { SearchIcon } from '@/components/icons';
import toast from 'react-hot-toast';

export default function AllAssignmentsPage() {
  const dispatch = useAppDispatch();
  const [assignments, setAssignments] = useState<
    (Assignment & { hasPaper?: boolean })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    assignmentService
      .list()
      .then((res) => {
        const list = res.data.assignments || [];
        setAssignments(list);
        dispatch(setAssignmentList(list));
      })
      .catch(() => toast.error('Failed to load assignments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const stats = useMemo(() => {
    const withPaper = assignments.filter((a) => a.hasPaper).length;
    return {
      total: assignments.length,
      generated: withPaper,
      pending: assignments.length - withPaper,
    };
  }, [assignments]);

  const filtered = useMemo(() => {
    let list = assignments;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subject.toLowerCase().includes(q)
      );
    }
    if (filter === 'with-paper') list = list.filter((a) => a.hasPaper);
    if (filter === 'pending') list = list.filter((a) => !a.hasPaper);
    return list;
  }, [assignments, search, filter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment and its paper?')) return;
    try {
      await assignmentService.delete(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <>
      <TopBar title="All assignments" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin w-10 h-10 border-2 border-brand-orange border-t-transparent rounded-full" />
          </div>
        ) : assignments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-brand-dark">
                    All assignments
                  </h2>
                  <span className="bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {stats.total}
                  </span>
                </div>
                <p className="text-sm text-brand-muted mt-1">
                  Search, filter, and manage every assignment you have created.
                </p>
              </div>
              <Link href="/create" className="ui-btn-primary shrink-0">
                + Create assignment
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg">
              <div className="ui-card p-4 text-center">
                <p className="text-2xl font-bold text-brand-dark">{stats.total}</p>
                <p className="text-xs text-brand-muted mt-1">Total</p>
              </div>
              <div className="ui-card p-4 text-center">
                <p className="text-2xl font-bold text-brand-orange">
                  {stats.generated}
                </p>
                <p className="text-xs text-brand-muted mt-1">Generated</p>
              </div>
              <div className="ui-card p-4 text-center">
                <p className="text-2xl font-bold text-brand-muted">
                  {stats.pending}
                </p>
                <p className="text-xs text-brand-muted mt-1">Pending</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <select
                className="ui-input w-full sm:w-44 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All assignments</option>
                <option value="with-paper">With paper</option>
                <option value="pending">Needs generation</option>
              </select>
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted w-5 h-5" />
                <input
                  type="search"
                  placeholder="Search by title or subject"
                  className="ui-input pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-brand-muted py-12">
                No assignments match your search.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
                {filtered.map((a) => (
                  <AssignmentCard
                    key={a._id}
                    assignment={a}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
