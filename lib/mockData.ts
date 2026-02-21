export type ExamIconType = 'railways' | 'ssc' | 'ib' | 'typing';

export interface Exam {
  id: string;
  name: string;
  iconType: ExamIconType;
  isActive: boolean;
}

export interface ExamCategory {
  id: string;
  title: string;
  exams: Exam[];
}

export const examCategories: ExamCategory[] = [
  {
    id: 'railways',
    title: 'Popular Exams from Railways RRB',
    exams: [
      { id: 'rrb-ntpc', name: 'RRB NTPC', iconType: 'railways', isActive: true },
      { id: 'rrb-group-d', name: 'RRB/RRC Group D', iconType: 'railways', isActive: true },
      { id: 'rrb-alp-1', name: 'RRB ALP', iconType: 'railways', isActive: true },
      { id: 'railways-section-controller', name: 'Railways Section Controller', iconType: 'railways', isActive: true },
      { id: 'alp-stage2-electrician', name: 'ALP Stage2 [Electrician]', iconType: 'railways', isActive: true },
      { id: 'alp-stage2-fitter', name: 'ALP Stage2 [Fitter]', iconType: 'railways', isActive: true },
      { id: 'alp-stage2-mechanic-diesel', name: 'ALP Stage2 [Mechanic Diesel]', iconType: 'railways', isActive: true },
      { id: 'alp-stage2-mechanic-motor', name: 'ALP Stage2 [Mechanic Motor Vehicle]', iconType: 'railways', isActive: true },
      { id: 'alp-stage2-rac', name: 'ALP Stage2 [RAC]', iconType: 'railways', isActive: true },
      { id: 'rrb-alp-2', name: 'RRB ALP', iconType: 'railways', isActive: true },
      { id: 'grade-1-technician', name: 'Grade I Technician', iconType: 'railways', isActive: true },
      { id: 'grade-3-technician', name: 'Grade III Technician', iconType: 'railways', isActive: true },
      { id: 'railway-rpf-si', name: 'Railway RPF SI', iconType: 'railways', isActive: true },
      { id: 'railway-rpf-constable', name: 'Railway RPF Constable', iconType: 'railways', isActive: true },
      { id: 'rrb-ntpc-stage2', name: 'RRB NTPC Stage 2', iconType: 'railways', isActive: true },
      { id: 'rrb-je', name: 'RRB JE', iconType: 'railways', isActive: true },
    ],
  },
  {
    id: 'ssc',
    title: 'Popular Exams from SSC Tests',
    exams: [
      { id: 'ssc-cgl-tier1', name: 'SSC CGL Tier I', iconType: 'ssc', isActive: true },
      { id: 'ssc-cgl-tier2', name: 'SSC CGL Tier II', iconType: 'ssc', isActive: true },
      { id: 'ib-security-assistant', name: 'IB Security Assistant/Executive', iconType: 'ib', isActive: true },
      { id: 'ssc-chsl', name: 'SSC CHSL', iconType: 'ssc', isActive: true },
      { id: 'ib-junior-intelligence', name: 'IB Junior Intelligence Officer', iconType: 'ib', isActive: true },
      { id: 'ib-mts', name: 'IB MTS', iconType: 'ib', isActive: true },
      { id: 'ssc-delhi-police-constable', name: 'SSC Delhi Police Constable', iconType: 'ssc', isActive: true },
      { id: 'ssc-delhi-head-constable-ministerial', name: 'SSC Delhi Head Constable (Ministerial)', iconType: 'ssc', isActive: true },
      { id: 'ssc-delhi-head-constable-awotpo', name: 'SSC Delhi Head Constable (AWO/TPO)', iconType: 'ssc', isActive: true },
      { id: 'ssc-delhi-constable-driver', name: 'SSC Delhi Constable (Driver)', iconType: 'ssc', isActive: true },
      { id: 'ib-acio', name: 'IB ACIO', iconType: 'ib', isActive: true },
      { id: 'ssc-typing-tests', name: 'SSC Typing Tests', iconType: 'typing', isActive: true },
      { id: 'ssc-aao-tier2', name: 'SSC AAO Tier II', iconType: 'ssc', isActive: true },
      { id: 'ssc-junior-hindi-translator', name: 'SSC Junior Hindi Translator', iconType: 'ssc', isActive: true },
    ],
  },
];

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string;
  comingSoon?: boolean;
}

export const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
  { id: 'courses', label: 'Courses', icon: 'BookOpen', href: '/dashboard/courses', comingSoon: true },
  { id: 'concept-videos', label: 'Concept Videos', icon: 'Video', href: '/dashboard/concept-videos', comingSoon: true },
  { id: 'tests', label: 'Tests', icon: 'FileText', href: '/dashboard/tests', comingSoon: true },
  { id: 'mentorship', label: 'Personalised Mentorship', icon: 'Users', href: '/dashboard/mentorship', badge: 'New!', comingSoon: true },
  { id: 'search', label: 'Search', icon: 'Search', href: '/dashboard/search', comingSoon: true },
  { id: 'bookmarks', label: 'My Bookmarks', icon: 'Bookmark', href: '/dashboard/bookmarks', comingSoon: true },
  { id: 'subscriptions', label: 'My Subscriptions', icon: 'CreditCard', href: '/dashboard/subscriptions', comingSoon: true },
  { id: 'current-affairs', label: 'Current Affairs', icon: 'Zap', href: '/dashboard/current-affairs', comingSoon: true },
  { id: 'success-stories', label: 'Success Stories', icon: 'Award', href: '/dashboard/success-stories', comingSoon: true },
  { id: 'analytics', label: 'AI Analytics', icon: 'BarChart2', href: '/analytics', badge: 'AI' },
  { id: 'profile', label: 'My Profile', icon: 'UserCircle', href: '/dashboard/profile' },
];

export interface PracticeTest {
  id: string;
  title: string;
  topic: string;
  questionsCount: number;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isNew?: boolean;
}

export interface MockTest {
  id: string;
  title: string;
  questionsCount: number;
  duration: number;
  marksTotal: number;
  attempts: number;
  isFree?: boolean;
}

export interface ExamDetail {
  id: string;
  name: string;
  iconType: ExamIconType;
  description: string;
  totalTests: number;
  totalStudents: number;
  practiceTests: PracticeTest[];
  mockTests: MockTest[];
}

export const examDetails: Record<string, ExamDetail> = {
  'rrb-ntpc': {
    id: 'rrb-ntpc',
    name: 'RRB NTPC',
    iconType: 'railways',
    description: 'Railway Recruitment Board Non-Technical Popular Categories (RRB NTPC) exam is conducted for recruitment to various posts in Indian Railways. The exam is conducted in multiple stages including CBT Stage 1, CBT Stage 2, and skill test. Prepare with our comprehensive practice tests and full-length mock tests designed according to the latest exam pattern.',
    totalTests: 245,
    totalStudents: 125000,
    practiceTests: [
      { id: 'pt-1', title: 'General Awareness - Basic', topic: 'General Awareness', questionsCount: 15, duration: 20, difficulty: 'easy', isNew: true },
      { id: 'pt-2', title: 'Mathematics - Arithmetic', topic: 'Mathematics', questionsCount: 20, duration: 25, difficulty: 'medium' },
      { id: 'pt-3', title: 'Reasoning - Logical', topic: 'General Intelligence', questionsCount: 18, duration: 22, difficulty: 'medium' },
      { id: 'pt-4', title: 'General Science - Physics', topic: 'General Science', questionsCount: 12, duration: 15, difficulty: 'easy' },
      { id: 'pt-5', title: 'Current Affairs - Monthly', topic: 'General Awareness', questionsCount: 15, duration: 18, difficulty: 'medium', isNew: true },
      { id: 'pt-6', title: 'Mathematics - Algebra', topic: 'Mathematics', questionsCount: 20, duration: 30, difficulty: 'hard' },
    ],
    mockTests: [
      { id: 'mt-1', title: 'RRB NTPC Mock Test 1', questionsCount: 100, duration: 90, marksTotal: 100, attempts: 15240, isFree: true },
      { id: 'mt-2', title: 'RRB NTPC Mock Test 2', questionsCount: 100, duration: 90, marksTotal: 100, attempts: 12350 },
      { id: 'mt-3', title: 'RRB NTPC Mock Test 3', questionsCount: 100, duration: 90, marksTotal: 100, attempts: 10890 },
      { id: 'mt-4', title: 'RRB NTPC Full Length Test', questionsCount: 100, duration: 90, marksTotal: 100, attempts: 9540 },
    ],
  },
  'ssc-cgl-tier1': {
    id: 'ssc-cgl-tier1',
    name: 'SSC CGL Tier I',
    iconType: 'ssc',
    description: 'Staff Selection Commission Combined Graduate Level (SSC CGL) Tier 1 is the first stage of the prestigious CGL examination. The exam tests candidates on General Intelligence & Reasoning, General Awareness, Quantitative Aptitude, and English Comprehension. Our comprehensive practice material covers all sections with topic-wise tests and full-length mock tests.',
    totalTests: 320,
    totalStudents: 245000,
    practiceTests: [
      { id: 'pt-1', title: 'Quantitative Aptitude - Numbers', topic: 'Quantitative Aptitude', questionsCount: 15, duration: 20, difficulty: 'easy' },
      { id: 'pt-2', title: 'English - Grammar', topic: 'English', questionsCount: 20, duration: 25, difficulty: 'medium', isNew: true },
      { id: 'pt-3', title: 'Reasoning - Verbal', topic: 'Reasoning', questionsCount: 18, duration: 22, difficulty: 'medium' },
      { id: 'pt-4', title: 'General Awareness - History', topic: 'General Awareness', questionsCount: 12, duration: 15, difficulty: 'easy' },
      { id: 'pt-5', title: 'Quantitative Aptitude - Geometry', topic: 'Quantitative Aptitude', questionsCount: 15, duration: 25, difficulty: 'hard' },
      { id: 'pt-6', title: 'English - Comprehension', topic: 'English', questionsCount: 20, duration: 30, difficulty: 'medium' },
    ],
    mockTests: [
      { id: 'mt-1', title: 'SSC CGL Tier 1 Mock Test 1', questionsCount: 100, duration: 60, marksTotal: 200, attempts: 25680, isFree: true },
      { id: 'mt-2', title: 'SSC CGL Tier 1 Mock Test 2', questionsCount: 100, duration: 60, marksTotal: 200, attempts: 22450 },
      { id: 'mt-3', title: 'SSC CGL Tier 1 Mock Test 3', questionsCount: 100, duration: 60, marksTotal: 200, attempts: 19870 },
      { id: 'mt-4', title: 'SSC CGL Tier 1 Full Test', questionsCount: 100, duration: 60, marksTotal: 200, attempts: 18340 },
    ],
  },
};

export function getExamById(examId: string): ExamDetail | null {
  return examDetails[examId] || null;
}

export function getAllExams(): Exam[] {
  return examCategories.flatMap(category => category.exams);
}
