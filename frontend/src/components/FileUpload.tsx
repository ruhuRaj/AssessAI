'use client';

import { useCallback, useState } from 'react';
import clsx from 'clsx';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
}

const ACCEPT = '.pdf,.txt,.doc,.docx';
const MAX_MB = 10;

export function FileUpload({
  file,
  onFileChange,
  disabled,
  error,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const validate = (f: File): string | null => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'txt', 'doc', 'docx'].includes(ext)) {
      return 'Only PDF, TXT, or Word files are allowed';
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      return `File must be under ${MAX_MB}MB`;
    }
    return null;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const f = files[0];
      const err = validate(f);
      if (err) {
        onFileChange(null);
        return;
      }
      onFileChange(f);
    },
    [onFileChange]
  );

  return (
    <div>
      <label className="form-label">
        Reference material <span className="font-normal text-slate-400">(optional)</span>
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={clsx(
          'relative rounded-xl border-2 border-dashed p-8 text-center transition',
          dragOver
            ? 'border-veda-500 bg-veda-50'
            : 'border-slate-200 bg-slate-50/50 hover:border-veda-300',
          error && 'border-red-300 bg-red-50/30',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          accept={ACCEPT}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="pointer-events-none">
          <div className="mx-auto w-12 h-12 rounded-full bg-veda-100 flex items-center justify-center text-2xl mb-3">
            📎
          </div>
          {file ? (
            <>
              <p className="font-medium text-slate-800">{file.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {(file.size / 1024).toFixed(1)} KB — click or drop to replace
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-slate-700">
                Drag & drop PDF or text file
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Used as context for AI question generation (max {MAX_MB}MB)
              </p>
            </>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
      {file && (
        <button
          type="button"
          className="mt-2 text-sm text-veda-600 hover:underline no-print"
          onClick={() => onFileChange(null)}
          disabled={disabled}
        >
          Remove file
        </button>
      )}
    </div>
  );
}
