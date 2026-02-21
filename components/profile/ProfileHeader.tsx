'use client';

import { MapPin, Phone, Mail, Target, Pencil, CalendarDays, Clock } from 'lucide-react';
import type { UserProfile } from '@/lib/profileData';

interface Props {
  profile: UserProfile;
  onEdit: () => void;
}

export default function ProfileHeader({ profile, onEdit }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-teal-200 shrink-0">
              {profile.avatar}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                <Target className="w-3.5 h-3.5 text-teal-500" />
                <span className="font-medium text-teal-600">{profile.targetExam}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium text-sm transition-all active:scale-95 shadow-md shadow-teal-200 self-start sm:self-auto"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {profile.bio && (
          <p className="mt-4 text-gray-600 text-sm leading-relaxed max-w-2xl">{profile.bio}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{profile.phone}</span>
          </div>
          {profile.email && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{profile.email}</span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{profile.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <span>Joined {profile.joinedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{profile.totalStudyHours} hrs studied</span>
          </div>
        </div>
      </div>
    </div>
  );
}
