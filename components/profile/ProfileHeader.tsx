'use client';

import { MapPin, Phone, Mail, Target, Pencil, CalendarDays } from 'lucide-react';
import {
  formatJoinedDate,
  formatLocation,
  getInitials,
  targetExamsFromProfile,
  type ApiUserProfile,
} from '@/lib/api/users';

interface Props {
  profile: ApiUserProfile;
  onEdit: () => void;
}

export default function ProfileHeader({ profile, onEdit }: Props) {
  const initials = getInitials(profile.name);
  const location = formatLocation(profile.location);
  const joinedDate = formatJoinedDate(profile.createdAt);
  const targetExams = targetExamsFromProfile(profile);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 px-6 pt-8 pb-6 relative">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 80%, white 2px, transparent 2px), radial-gradient(circle at 90% 20%, white 2px, transparent 2px), radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px, 80px 80px, 30px 30px',
          }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/40 bg-white/20 text-xl font-bold text-white shadow-xl backdrop-blur-sm">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials || '?'
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-white">{profile.name}</h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {targetExams.length === 0 ? (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    <Target className="h-3 w-3 shrink-0" />
                    <span className="truncate">No target exam</span>
                  </span>
                ) : (
                  targetExams.map((exam) => (
                    <span
                      key={exam.id}
                      title={exam.name}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                    >
                      <Target className="h-3 w-3 shrink-0" />
                      <span className="truncate">{exam.name}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/30 bg-white/20 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          {profile.bio && (
            <p className="text-gray-600 text-sm leading-relaxed mb-4 pb-4 border-b border-gray-100">
              {profile.bio}
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            {profile.phoneNumber && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Phone className="w-4 h-4 text-teal-400" />
                <span>{profile.phoneNumber}</span>
              </div>
            )}
            {profile.email && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Mail className="w-4 h-4 text-teal-400" />
                <span>{profile.email}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>{location}</span>
              </div>
            )}
            {joinedDate && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <CalendarDays className="w-4 h-4 text-teal-400" />
                <span>Joined {joinedDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
