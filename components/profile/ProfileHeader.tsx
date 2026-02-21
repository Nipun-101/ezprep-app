'use client';

import { MapPin, Phone, Mail, Target, Pencil, CalendarDays, Clock, TrendingUp } from 'lucide-react';
import type { UserProfile } from '@/lib/profileData';

interface Props {
  profile: UserProfile;
  onEdit: () => void;
}

export default function ProfileHeader({ profile, onEdit }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 px-6 pt-8 pb-14 relative">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 10% 80%, white 2px, transparent 2px), radial-gradient(circle at 90% 20%, white 2px, transparent 2px), radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px, 80px 80px, 30px 30px'
          }}
        />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-white text-xl font-bold shadow-xl shrink-0">
              {profile.avatar}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{profile.name}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30">
                  <Target className="w-3 h-3" />
                  {profile.targetExam}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium text-sm transition-all active:scale-95 border border-white/30"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 -mt-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          {profile.bio && (
            <p className="text-gray-600 text-sm leading-relaxed mb-4 pb-4 border-b border-gray-100">{profile.bio}</p>
          )}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Phone className="w-4 h-4 text-teal-400" />
              <span>{profile.phone}</span>
            </div>
            {profile.email && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Mail className="w-4 h-4 text-teal-400" />
                <span>{profile.email}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>{profile.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <CalendarDays className="w-4 h-4 text-teal-400" />
              <span>Joined {profile.joinedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>{profile.totalStudyHours} hrs studied</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
