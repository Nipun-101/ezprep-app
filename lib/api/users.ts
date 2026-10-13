import apiClient from './client';

export type Gender = 'male' | 'female' | 'other';

export interface ApiUserLocation {
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
}

export interface ApiNotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  studyReminders: boolean;
  weeklyReport: boolean;
  promotionalOffers: boolean;
}

export interface ApiUserPreferences {
  studyTime?: string;
  weeklyStudyGoalHours?: number;
  notifications: ApiNotificationPreferences;
}

export interface ApiUserInteractions {
  interestedSubjects: string[];
  likedTopics: string[];
  dislikedTopics: string[];
  interestedExams: string[];
}

export interface ApiTargetExam {
  id: string;
  name: string;
}

export interface ApiUserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  isDeleted: boolean;
  membershipTier: string;
  badgesEarnedCount: number;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: Gender;
  location?: ApiUserLocation;
  targetExam?: ApiTargetExam;
  targetExamDate?: string;
  preferences: ApiUserPreferences;
  interactions: ApiUserInteractions;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfilePayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: Gender;
  location?: ApiUserLocation;
  targetExam?: string | null;
  targetExamDate?: string;
}

interface ProfileResponse {
  message: string;
  data: ApiUserProfile;
}

export async function getMyProfile(): Promise<ApiUserProfile> {
  const response = await apiClient.get<ProfileResponse>('/api/v1/users/me');
  return response.data.data;
}

export async function updateMyProfile(
  payload: UpdateUserProfilePayload
): Promise<ApiUserProfile> {
  const response = await apiClient.patch<ProfileResponse>(
    '/api/v1/users/me',
    payload
  );
  return response.data.data;
}

export function getInitials(name?: string): string {
  if (!name) return '';
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatJoinedDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatLocation(loc?: ApiUserLocation): string {
  if (!loc) return '';
  return [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
}
