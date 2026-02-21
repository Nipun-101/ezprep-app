export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  location: string;
  targetExam: string;
  bio: string;
  joinedDate: string;
  avatar: string;
  rank: number;
  totalStudents: number;
  streakDays: number;
  testsAttempted: number;
  testsCompleted: number;
  avgScore: number;
  topScore: number;
  totalStudyHours: number;
  accuracy: number;
  badges: Badge[];
  recentActivity: ActivityItem[];
  subjectPerformance: SubjectPerf[];
  weeklyActivity: WeeklyActivity[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'test' | 'practice' | 'video';
  title: string;
  score?: number;
  totalMarks?: number;
  duration: number;
  date: string;
  status: 'completed' | 'in_progress';
}

export interface SubjectPerf {
  subject: string;
  score: number;
  total: number;
  trend: 'up' | 'down' | 'stable';
}

export interface WeeklyActivity {
  day: string;
  minutes: number;
  tests: number;
}

export const dummyProfile: UserProfile = {
  name: 'Arjun Sharma',
  phone: '+91 98765 43210',
  email: 'arjun.sharma@gmail.com',
  location: 'New Delhi, India',
  targetExam: 'SSC CGL 2025',
  bio: 'Aspiring government officer, preparing for SSC CGL. Currently in my final year of B.Com. Consistent 6-hour daily study routine.',
  joinedDate: 'March 2024',
  avatar: 'AS',
  rank: 234,
  totalStudents: 125000,
  streakDays: 18,
  testsAttempted: 47,
  testsCompleted: 43,
  avgScore: 72,
  topScore: 91,
  totalStudyHours: 186,
  accuracy: 74,
  badges: [
    { id: '1', title: 'First Test', description: 'Completed your first mock test', icon: 'Star', color: 'from-yellow-400 to-orange-400', earned: true },
    { id: '2', title: '7-Day Streak', description: 'Studied 7 days in a row', icon: 'Flame', color: 'from-orange-400 to-red-400', earned: true },
    { id: '3', title: 'Top Scorer', description: 'Scored above 90% in a test', icon: 'Trophy', color: 'from-teal-400 to-emerald-500', earned: true },
    { id: '4', title: '30-Day Streak', description: 'Study for 30 consecutive days', icon: 'Zap', color: 'from-blue-400 to-cyan-400', earned: false },
    { id: '5', title: 'Speed Demon', description: 'Complete a test in under 45 mins', icon: 'Timer', color: 'from-pink-400 to-rose-400', earned: false },
    { id: '6', title: 'Perfect Score', description: 'Score 100% in any test', icon: 'Award', color: 'from-amber-400 to-yellow-300', earned: false },
  ],
  recentActivity: [
    { id: '1', type: 'test', title: 'SSC CGL Tier 1 Mock Test 4', score: 156, totalMarks: 200, duration: 55, date: '2 hours ago', status: 'completed' },
    { id: '2', type: 'practice', title: 'Quantitative Aptitude - Geometry', score: 14, totalMarks: 20, duration: 22, date: 'Yesterday', status: 'completed' },
    { id: '3', type: 'test', title: 'SSC CGL Tier 1 Mock Test 3', score: 148, totalMarks: 200, duration: 60, date: '2 days ago', status: 'completed' },
    { id: '4', type: 'practice', title: 'English Grammar Practice', score: 17, totalMarks: 20, duration: 18, date: '3 days ago', status: 'completed' },
    { id: '5', type: 'test', title: 'RRB NTPC Mock Test 2', score: 74, totalMarks: 100, duration: 88, date: '5 days ago', status: 'completed' },
    { id: '6', type: 'practice', title: 'Reasoning - Logical Series', score: 11, totalMarks: 15, duration: 17, date: '6 days ago', status: 'completed' },
  ],
  subjectPerformance: [
    { subject: 'Quantitative Aptitude', score: 68, total: 100, trend: 'up' },
    { subject: 'English Comprehension', score: 81, total: 100, trend: 'up' },
    { subject: 'General Awareness', score: 74, total: 100, trend: 'stable' },
    { subject: 'General Intelligence', score: 77, total: 100, trend: 'down' },
  ],
  weeklyActivity: [
    { day: 'Mon', minutes: 120, tests: 1 },
    { day: 'Tue', minutes: 90, tests: 0 },
    { day: 'Wed', minutes: 180, tests: 2 },
    { day: 'Thu', minutes: 60, tests: 1 },
    { day: 'Fri', minutes: 150, tests: 1 },
    { day: 'Sat', minutes: 200, tests: 2 },
    { day: 'Sun', minutes: 110, tests: 0 },
  ],
};
