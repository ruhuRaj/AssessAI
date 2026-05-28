'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Assignment } from '@/types';
import { formatDateShort } from '@/utils/helpers';

interface AssignmentCardProps {
  assignment: Assignment & { hasPaper?: boolean };
  onDelete: (id: string) => void;
}

export function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const href = assignment.hasPaper
    ? `/paper/${assignment._id}`
    : `/generate/${assignment._id}`;

  return (
    <div className="ui-card p-5 relative hover:shadow-md transition group">
      {assignment.hasPaper && (
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
          Paper ready
        </span>
      )}
      <div className="flex justify-between items-start gap-2 mb-6">
        <Link
          href={href}
          className={`font-bold text-brand-dark hover:text-brand-orange line-clamp-2 ${assignment.hasPaper ? 'mt-5' : ''}`}
        >
          {assignment.title}
        </Link>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg text-brand-muted hover:bg-brand-surface"
            aria-label="Menu"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-44 bg-white rounded-xl border border-brand-border shadow-lg py-1 text-sm">
              <Link
                href={href}
                className="block px-4 py-2 hover:bg-brand-surface text-brand-dark"
                onClick={() => setMenuOpen(false)}
              >
                View Assignment
              </Link>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                onClick={() => {
                  setMenuOpen(false);
                  if (assignment._id) onDelete(assignment._id);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between text-xs text-brand-muted mt-auto pt-4 border-t border-brand-border/60">
        <span>
          Assigned on:{' '}
          {assignment.createdAt
            ? formatDateShort(assignment.createdAt)
            : '—'}
        </span>
        <span>
          Due:{' '}
          {assignment.dueDate ? formatDateShort(assignment.dueDate) : '—'}
        </span>
      </div>
    </div>
  );
}
