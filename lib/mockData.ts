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
];
