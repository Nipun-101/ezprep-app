'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileBadges from './ProfileBadges';
import ProfileActivity from './ProfileActivity';
import ProfileSubjects from './ProfileSubjects';
import ProfileEditModal from './ProfileEditModal';
import { getMyProfile, type ApiUserProfile } from '@/lib/api/users';
import { useTargetExams } from '@/lib/hooks/useTargetExams';

export default function ProfileView() {
  const [profile, setProfile] = useState<ApiUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { applyFromProfile, targets, ready } = useTargetExams();

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyProfile();
      setProfile(data);
      applyFromProfile(data);
    } catch (err) {
      console.error('Failed to load profile', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [applyFromProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Couldn&apos;t load your profile
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          {error ?? 'Something went wrong.'}
        </p>
        <button
          onClick={loadProfile}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-all active:scale-95 shadow-md shadow-teal-200"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const profileWithLiveTargets =
    ready
      ? {
          ...profile,
          targetExams: targets,
          targetExam: targets[0],
        }
      : profile;

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profileWithLiveTargets} onEdit={() => setIsEditing(true)} />

      <ProfileStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ProfileActivity />
        </div>
        <div className="space-y-6">
          <ProfileSubjects />
          <ProfileBadges />
        </div>
      </div>

      {isEditing && (
        <ProfileEditModal
          profile={profileWithLiveTargets}
          onSave={(updated) => {
            setProfile(updated);
            applyFromProfile(updated);
            setIsEditing(false);
          }}
          onTargetsChange={(updated) => {
            setProfile(updated);
            applyFromProfile(updated);
          }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-100 to-emerald-100 px-6 pt-8 pb-6 h-32" />
        <div className="px-6 py-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 space-y-3">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="flex gap-4 pt-2">
              <div className="h-3 bg-gray-100 rounded w-24" />
              <div className="h-3 bg-gray-100 rounded w-32" />
              <div className="h-3 bg-gray-100 rounded w-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
