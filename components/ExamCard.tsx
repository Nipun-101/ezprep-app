import { Clock, FileText, Users } from 'lucide-react';

interface ExamCardProps {
  id: string;
  title: string;
  fullName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testsCount: number;
  studentsCount: string;
  duration: string;
  acronym: string;
}

const difficultyColors = {
  Easy: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-orange-100 text-orange-700 border-orange-200',
  Hard: 'bg-red-100 text-red-700 border-red-200'
};

const acronymColors = {
  SBI: 'bg-teal-500 text-white',
  IBPS: 'bg-cyan-500 text-white',
  SSC: 'bg-blue-500 text-white',
  UPSC: 'bg-purple-500 text-white',
  RLY: 'bg-indigo-500 text-white',
  NAB: 'bg-emerald-500 text-white'
};

export default function ExamCard({ 
  id, 
  title, 
  fullName, 
  difficulty, 
  testsCount, 
  studentsCount, 
  duration, 
  acronym 
}: ExamCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm ${acronymColors[acronym as keyof typeof acronymColors] || 'bg-gray-500 text-white'}`}>
            {acronym}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-teal-600 transition-colors">
              {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{fullName}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[difficulty]}`}>
          {difficulty}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span>{testsCount} Tests</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{studentsCount}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
}