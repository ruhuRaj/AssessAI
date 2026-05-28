'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, logout } from '@/store/authSlice';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    schoolName: user?.schoolName || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        schoolName: user.schoolName || '',
      });
    }
  }, [user]);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      setSaving(true);
      const res = await authService.updateProfile({
        name: form.name.trim(),
        schoolName: form.schoolName.trim() || undefined,
      });
      dispatch(setUser(res.data.user));
      toast.success('Profile updated');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);

    try {
      setUploading(true);
      const res = await authService.uploadAvatar(file);
      dispatch(setUser(res.data.user));
      URL.revokeObjectURL(localPreview);
      setPhotoPreview(null);
      toast.success('Profile photo updated');
    } catch (err: unknown) {
      const errRes = err as { response?: { data?: { error?: string } } };
      toast.error(errRes.response?.data?.error || 'Upload failed');
      URL.revokeObjectURL(localPreview);
      setPhotoPreview(null);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const avatarImageUrl = photoPreview || user?.profileImageUrl;

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Enter your password to confirm');
      return;
    }
    try {
      setDeleting(true);
      await authService.deleteAccount(deletePassword);
      dispatch(logout());
      toast.success('Account deleted');
      router.replace('/signup');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Could not delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TopBar title="Profile" showBack backHref="/" />
      <main className="p-4 sm:p-6 max-w-xl space-y-6">
        <div className="ui-card p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative">
              <UserAvatar
                name={user?.name}
                imageUrl={avatarImageUrl}
                size="lg"
              />
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="mt-4 text-sm font-semibold text-brand-orange hover:underline disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Change photo'}
            </button>
            <p className="text-xs text-brand-muted mt-1">
              JPG, PNG, WebP or GIF · max 5MB
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1.5">
                Email
              </label>
              <input
                className="ui-input bg-brand-surface text-brand-muted"
                value={user?.email || ''}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1.5">
                Full name
              </label>
              <input
                className="ui-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1.5">
                School
              </label>
              <input
                className="ui-input"
                value={form.schoolName}
                onChange={(e) =>
                  setForm({ ...form, schoolName: e.target.value })
                }
                placeholder="Optional"
                disabled={saving}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="ui-btn-primary w-full py-3"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        <div className="ui-card p-6 sm:p-8 border-red-200">
          <h2 className="text-lg font-semibold text-red-600">Danger zone</h2>
          <p className="text-sm text-brand-muted mt-2">
            Permanently delete your account and all assignments. This cannot be
            undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50"
            >
              Delete account
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-brand-dark">
                Confirm with your password
              </label>
              <input
                type="password"
                className="ui-input"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                disabled={deleting}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Yes, delete my account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                  disabled={deleting}
                  className="px-4 py-2.5 text-sm font-medium text-brand-muted border border-brand-border rounded-xl hover:bg-brand-surface"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
