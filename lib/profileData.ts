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

export interface TopicPerf {
  topic: string;
  score: number;
  total: number;
  attempts: number;
  trend: 'up' | 'down' | 'stable';
  lastAttempted: string;
}

export interface SubjectPerf {
  subject: string;
  score: number;
  total: number;
  trend: 'up' | 'down' | 'stable';
  topics: TopicPerf[];
}

export interface AIRecommendation {
  type: 'focus' | 'strength' | 'warning' | 'tip';
  subject: string;
  topic?: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
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
  location: 'Kochi, India',
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
    {
      subject: 'Quantitative Aptitude', score: 68, total: 100, trend: 'up',
      topics: [
        { topic: 'Number System', score: 82, total: 100, attempts: 5, trend: 'up', lastAttempted: '2 days ago' },
        { topic: 'Percentage & Profit/Loss', score: 75, total: 100, attempts: 4, trend: 'up', lastAttempted: '4 days ago' },
        { topic: 'Simple & Compound Interest', score: 70, total: 100, attempts: 3, trend: 'stable', lastAttempted: '1 week ago' },
        { topic: 'Ratio & Proportion', score: 65, total: 100, attempts: 3, trend: 'down', lastAttempted: '5 days ago' },
        { topic: 'Geometry & Mensuration', score: 52, total: 100, attempts: 2, trend: 'down', lastAttempted: '1 week ago' },
        { topic: 'Time, Speed & Distance', score: 48, total: 100, attempts: 2, trend: 'down', lastAttempted: '2 weeks ago' },
        { topic: 'Algebra', score: 44, total: 100, attempts: 1, trend: 'stable', lastAttempted: '3 weeks ago' },
        { topic: 'Trigonometry', score: 38, total: 100, attempts: 1, trend: 'stable', lastAttempted: '3 weeks ago' },
      ]
    },
    {
      subject: 'English Comprehension', score: 81, total: 100, trend: 'up',
      topics: [
        { topic: 'Reading Comprehension', score: 88, total: 100, attempts: 6, trend: 'up', lastAttempted: 'Yesterday' },
        { topic: 'Grammar & Error Detection', score: 85, total: 100, attempts: 5, trend: 'stable', lastAttempted: '2 days ago' },
        { topic: 'Vocabulary & Synonyms', score: 80, total: 100, attempts: 4, trend: 'up', lastAttempted: '3 days ago' },
        { topic: 'Sentence Rearrangement', score: 76, total: 100, attempts: 3, trend: 'stable', lastAttempted: '5 days ago' },
        { topic: 'Cloze Test', score: 72, total: 100, attempts: 3, trend: 'down', lastAttempted: '1 week ago' },
        { topic: 'Idioms & Phrases', score: 68, total: 100, attempts: 2, trend: 'down', lastAttempted: '2 weeks ago' },
      ]
    },
    {
      subject: 'General Awareness', score: 74, total: 100, trend: 'stable',
      topics: [
        { topic: 'History', score: 80, total: 100, attempts: 4, trend: 'stable', lastAttempted: '3 days ago' },
        { topic: 'Geography', score: 78, total: 100, attempts: 4, trend: 'up', lastAttempted: '4 days ago' },
        { topic: 'Polity & Constitution', score: 75, total: 100, attempts: 3, trend: 'stable', lastAttempted: '1 week ago' },
        { topic: 'Current Affairs', score: 72, total: 100, attempts: 5, trend: 'down', lastAttempted: 'Yesterday' },
        { topic: 'Science & Technology', score: 68, total: 100, attempts: 3, trend: 'stable', lastAttempted: '1 week ago' },
        { topic: 'Economy', score: 62, total: 100, attempts: 2, trend: 'down', lastAttempted: '2 weeks ago' },
      ]
    },
    {
      subject: 'General Intelligence', score: 77, total: 100, trend: 'down',
      topics: [
        { topic: 'Analogy', score: 88, total: 100, attempts: 5, trend: 'up', lastAttempted: '2 days ago' },
        { topic: 'Series Completion', score: 84, total: 100, attempts: 4, trend: 'stable', lastAttempted: '4 days ago' },
        { topic: 'Classification', score: 80, total: 100, attempts: 3, trend: 'stable', lastAttempted: '5 days ago' },
        { topic: 'Coding-Decoding', score: 74, total: 100, attempts: 3, trend: 'down', lastAttempted: '1 week ago' },
        { topic: 'Blood Relations', score: 70, total: 100, attempts: 2, trend: 'down', lastAttempted: '1 week ago' },
        { topic: 'Puzzle & Seating Arrangement', score: 58, total: 100, attempts: 2, trend: 'down', lastAttempted: '2 weeks ago' },
        { topic: 'Data Interpretation', score: 50, total: 100, attempts: 1, trend: 'stable', lastAttempted: '3 weeks ago' },
      ]
    },
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

export const aiRecommendations: AIRecommendation[] = [
  {
    type: 'warning',
    subject: 'Quantitative Aptitude',
    topic: 'Trigonometry',
    message: 'Your score in Trigonometry is 38% — significantly below your average. This topic carries 5-8 questions in SSC CGL. Dedicate at least 3 practice sessions this week to close this gap before your exam.',
    priority: 'high',
  },
  {
    type: 'warning',
    subject: 'Quantitative Aptitude',
    topic: 'Algebra',
    message: 'Algebra score (44%) and Time, Speed & Distance (48%) are weak areas that have been attempted only once. These are high-frequency topics in SSC CGL Tier 1 — start with formula revision.',
    priority: 'high',
  },
  {
    type: 'focus',
    subject: 'General Intelligence',
    topic: 'Puzzle & Seating Arrangement',
    message: 'Puzzles & Seating Arrangement has dropped to 58% and your overall General Intelligence trend is declining. This topic often has 3-4 questions per paper. Daily 20-minute puzzle practice is recommended.',
    priority: 'high',
  },
  {
    type: 'focus',
    subject: 'General Awareness',
    topic: 'Economy',
    message: 'Economy scored 62% and hasn\'t been attempted in 2 weeks. Focus on Budget highlights, GDP data, and banking terms — these are repeat favorites in recent SSC exams.',
    priority: 'medium',
  },
  {
    type: 'tip',
    subject: 'English Comprehension',
    topic: 'Idioms & Phrases',
    message: 'Idioms & Phrases (68%) is pulling down your strong English average (81%). Learn 10 new idioms daily — this can quickly push your English score above 85%.',
    priority: 'medium',
  },
  {
    type: 'strength',
    subject: 'English Comprehension',
    topic: 'Reading Comprehension',
    message: 'Reading Comprehension is your strongest area at 88% with 6 attempts. Maintain this with 1 RC passage per day to stay sharp before the exam.',
    priority: 'low',
  },
  {
    type: 'strength',
    subject: 'General Intelligence',
    topic: 'Analogy',
    message: 'Analogy (88%) and Series Completion (84%) are strong pillars. These are reliable score-boosters in mock tests — keep your streak going.',
    priority: 'low',
  },
  {
    type: 'tip',
    subject: 'Quantitative Aptitude',
    topic: 'Geometry & Mensuration',
    message: 'Geometry (52%) is improving in trend but needs more attempts. Focus on 2D shapes formulas and practice 1 geometry set daily — you can realistically reach 70% in 2 weeks.',
    priority: 'medium',
  },
];
