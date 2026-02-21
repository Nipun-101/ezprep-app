'use client';

import { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileBadges from './ProfileBadges';
import ProfileActivity from './ProfileActivity';
import ProfileSubjects from './ProfileSubjects';
import ProfileEditModal from './ProfileEditModal';
import { dummyProfile } from '@/lib/profileData';
import type { UserProfile } from '@/lib/profileData';

export default function ProfileView() {
  const [profile, setProfile] = useState<UserProfile>(dummyProfile);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} onEdit={() => setIsEditing(true)} />

      <ProfileStats profile={profile} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ProfileActivity activities={profile.recentActivity} />
        </div>
        <div className="space-y-6">
          <ProfileSubjects subjects={profile.subjectPerformance} />
          <ProfileBadges badges={profile.badges} />
        </div>
      </div>

      {isEditing && (
        <ProfileEditModal
          profile={profile}
          onSave={(updated) => { setProfile(updated); setIsEditing(false); }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
