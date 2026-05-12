'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import {
  updateMyProfile,
  type ApiUserProfile,
  type UpdateUserProfilePayload,
} from '@/lib/api/users';
import { getExamsByCategory, type ApiExam } from '@/lib/api/exams';

interface Props {
  profile: ApiUserProfile;
  onSave: (updated: ApiUserProfile) => void;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  targetExam: string;
}

const BIO_MAX = 500;

export default function ProfileEditModal({ profile, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormState>({
    name: profile.name ?? '',
    email: profile.email ?? '',
    bio: profile.bio ?? '',
    city: profile.location?.city ?? '',
    state: profile.location?.state ?? '',
    country: profile.location?.country ?? '',
    targetExam: profile.targetExam?.id ?? '',
  });

  const [exams, setExams] = useState<ApiExam[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examsError, setExamsError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setExamsLoading(true);
    setExamsError(null);
    getExamsByCategory()
      .then((categories) => {
        if (cancelled) return;
        const flat = categories.flatMap((c) => c.exams);
        setExams(flat);
      })
      .catch((err) => {
        console.error('Failed to load exams', err);
        if (!cancelled) setExamsError('Could not load exam list.');
      })
      .finally(() => {
        if (!cancelled) setExamsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const buildPayload = (): UpdateUserProfilePayload => {
    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      bio: form.bio.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
    };

    const payload: UpdateUserProfilePayload = {};

    if (trimmed.name && trimmed.name !== (profile.name ?? '')) {
      payload.name = trimmed.name;
    }
    if (trimmed.email !== (profile.email ?? '')) {
      payload.email = trimmed.email;
    }
    if (trimmed.bio !== (profile.bio ?? '')) {
      payload.bio = trimmed.bio;
    }

    const currentLoc = profile.location ?? {};
    if (
      trimmed.city !== (currentLoc.city ?? '') ||
      trimmed.state !== (currentLoc.state ?? '') ||
      trimmed.country !== (currentLoc.country ?? '')
    ) {
      payload.location = {
        city: trimmed.city || undefined,
        state: trimmed.state || undefined,
        country: trimmed.country || undefined,
        timezone: currentLoc.timezone,
      };
    }

    if (form.targetExam !== (profile.targetExam?.id ?? '')) {
      payload.targetExam = form.targetExam || null;
    }

    return payload;
  };

  const payload = useMemo(buildPayload, [form, profile]);
  const hasChanges = Object.keys(payload).length > 0;

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Full name is required.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await updateMyProfile(payload);
      onSave(updated);
    } catch (err) {
      console.error('Failed to update profile', err);
      const message =
        axios.isAxiosError(err) &&
        (err.response?.data as { message?: string } | undefined)?.message
          ? (err.response?.data as { message?: string }).message!
          : 'Failed to update profile. Please try again.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isSaving ? undefined : onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Keep your information up to date
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {saveError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{saveError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.phoneNumber ?? ''}
              readOnly
              disabled
              className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              aria-readonly="true"
            />
            <p className="text-xs text-gray-400 mt-1">Phone number cannot be changed here.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Exam
            </label>
            <select
              value={form.targetExam}
              onChange={(e) => set('targetExam', e.target.value)}
              disabled={examsLoading}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all disabled:opacity-60"
            >
              <option value="">
                {examsLoading ? 'Loading exams…' : 'No target exam'}
              </option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
            {examsError && (
              <p className="text-xs text-red-500 mt-1">{examsError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
                placeholder="City"
              />
              <input
                type="text"
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
                placeholder="State"
              />
              <input
                type="text"
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
                placeholder="Country"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bio <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => set('bio', e.target.value.slice(0, BIO_MAX))}
              rows={3}
              maxLength={BIO_MAX}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all resize-none"
              placeholder="Tell us a bit about your preparation journey..."
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {form.bio.length}/{BIO_MAX}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-200 text-white rounded-xl font-medium text-sm transition-all active:scale-95 shadow-md shadow-teal-200 disabled:shadow-none"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
