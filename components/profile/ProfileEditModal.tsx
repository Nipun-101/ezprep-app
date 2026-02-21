'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { UserProfile } from '@/lib/profileData';

interface Props {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

const examOptions = [
  'SSC CGL 2025', 'SSC CHSL 2025', 'RRB NTPC', 'RRB Group D',
  'UPSC Civil Services', 'Banking (IBPS PO)', 'Banking (SBI PO)',
  'State PSC', 'IB ACIO', 'Other',
];

export default function ProfileEditModal({ profile, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    location: profile.location,
    targetExam: profile.targetExam,
    bio: profile.bio,
  });

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    onSave({ ...profile, ...form });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
            <p className="text-xs text-gray-400 mt-0.5">Keep your information up to date</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input
              type="text"
              value={profile.phone}
              disabled
              className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Phone number cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Exam</label>
            <select
              value={form.targetExam}
              onChange={(e) => set('targetExam', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
            >
              {examOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bio <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all resize-none"
              placeholder="Tell us a bit about your preparation journey..."
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.bio.length}/200</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-200 text-white rounded-xl font-medium text-sm transition-all active:scale-95 shadow-md shadow-teal-200"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
