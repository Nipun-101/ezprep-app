import apiClient from './client';

export type RecentActivityStatus =
  | 'SUBMITTED'
  | 'EXPIRED'
  | 'PAUSED'
  | 'IN_PROGRESS'
  | string;

export interface RecentActivitySubject {
  id: string;
  name: string;
}

export interface RecentActivityExam {
  id: string;
  name: string;
  description?: string;
}

export interface RecentActivityTopic {
  id: string;
  name: string;
  description?: string;
}

export interface RecentActivityItem {
  attemptId: string;
  testTitle: string | null;
  scorePercent: number;
  score?: number;
  totalMarks?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  unansweredQuestions?: number;
  totalQuestions: number;
  timeConsumedMinutes: number;
  submittedAt: string;
  status: RecentActivityStatus;
  subject: RecentActivitySubject;
  exam: RecentActivityExam;
  topic?: RecentActivityTopic;
}

interface RecentActivityResponse {
  message: string;
  data: RecentActivityItem[];
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const response = await apiClient.get<RecentActivityResponse>(
    '/api/v1/analytics/recent-activity'
  );
  return response.data.data;
}

export type SubjectTopicTrend =
  | 'improving'
  | 'declining'
  | 'stable'
  | 'insufficient-data'
  | string;

export type SubjectStrengthLabel =
  | 'Strong'
  | 'Good'
  | 'Average'
  | 'Weak'
  | string;

export interface TopicBreakdown {
  topicId: string;
  topicName: string;
  questionsAttempted: number;
  correctAnswers: number;
  accuracyPercent: number;
  trend: SubjectTopicTrend;
  isWeak: boolean;
  isStrong: boolean;
}

export interface SubjectBreakdown {
  subjectId: string;
  subjectName: string;
  averageScorePercent: number;
  trend: SubjectTopicTrend;
  strengthLabel: SubjectStrengthLabel;
  topics: TopicBreakdown[];
  weakTopicCount: number;
  strongTopicCount: number;
}

interface SubjectTopicBreakdownResponse {
  message: string;
  data: { subjects: SubjectBreakdown[] };
}

export async function getSubjectTopicBreakdown(): Promise<SubjectBreakdown[]> {
  const response = await apiClient.get<SubjectTopicBreakdownResponse>(
    '/api/v1/analytics/subject-topic-breakdown'
  );
  return response.data.data.subjects;
}

export type BadgeCategory =
  | 'Milestone'
  | 'Consistency'
  | 'Performance'
  | 'Mastery'
  | string;

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  criteria: string;
  isEarned: boolean;
}

export interface BadgesSummary {
  badges: UserBadge[];
  earnedCount: number;
  totalCount: number;
}

interface BadgesResponse {
  message: string;
  data: BadgesSummary;
}

export async function getBadges(): Promise<BadgesSummary> {
  const response = await apiClient.get<BadgesResponse>(
    '/api/v1/analytics/badges'
  );
  return response.data.data;
}

export interface DashboardStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface DashboardTestsSummary {
  attempted: number;
  completed: number;
  completionRate: number;
}

export interface DashboardScoreAnalytics {
  averageScorePercent: number;
  bestScorePercent: number;
  totalTestsScored: number;
}

export interface DashboardAccuracy {
  totalCorrect: number;
  totalAnswered: number;
  totalUnanswered: number;
  accuracyPercent: number;
}

export interface DashboardTimeInvestment {
  totalMinutes: number;
  averageMinutesPerAttempt: number;
}

export interface DashboardSubjectPerformance {
  subjectId: string;
  subjectName: string;
  attemptCount: number;
  averageScorePercent: number;
}

export interface DashboardExamPerformance {
  examId: string;
  examName: string;
  attemptCount: number;
  averageScorePercent: number;
}

export interface DashboardAnalytics {
  streak: DashboardStreak;
  testsSummary: DashboardTestsSummary;
  scoreAnalytics: DashboardScoreAnalytics;
  accuracy: DashboardAccuracy;
  timeInvestment: DashboardTimeInvestment;
  subjectPerformance: DashboardSubjectPerformance[];
  examPerformance: DashboardExamPerformance[];
}

interface DashboardResponse {
  message: string;
  data: DashboardAnalytics;
}

export async function getDashboard(): Promise<DashboardAnalytics> {
  const response = await apiClient.get<DashboardResponse>(
    '/api/v1/analytics/dashboard'
  );
  return response.data.data;
}
