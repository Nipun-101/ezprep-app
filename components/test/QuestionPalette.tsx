'use client';

import { QuestionStatus } from '@/lib/testTypes';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Pause, Play, User, ChevronLeft } from 'lucide-react';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentQuestion: number;
  questionStatuses: QuestionStatus[];
  onQuestionSelect: (index: number) => void;
  isPaused?: boolean;
  onTogglePause?: () => void;
  testTitle?: string;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export default function QuestionPalette({
  totalQuestions,
  currentQuestion,
  questionStatuses,
  onQuestionSelect,
  isPaused = false,
  onTogglePause,
  testTitle = '',
  isMobile = false,
  mobileOpen = false,
  onMobileOpenChange,
}: QuestionPaletteProps) {
  const getStatusClass = (status: QuestionStatus, isCurrent: boolean) => {
    if (isCurrent) {
      return 'ring-2 ring-orange-500 ring-offset-2 bg-orange-500 text-white';
    }

    switch (status) {
      case 'answered':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'not-answered':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'marked':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      case 'marked-answered':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return 'bg-gray-300 text-gray-700 hover:bg-gray-400';
    }
  };

  const getStatusCount = (status: QuestionStatus) => {
    return questionStatuses.filter((s) => s === status).length;
  };

  const PaletteContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6 overflow-y-auto">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-600" />
          </div>
          <div className="text-xs text-gray-500">
            <div>Your photo</div>
            <div>appears here</div>
          </div>
        </div>

        {onTogglePause && (
          <Button
            onClick={onTogglePause}
            variant="outline"
            className="w-full justify-start gap-2 border-2 hover:bg-gray-50"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume Test' : 'Pause Test'}
          </Button>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Legend</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-green-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {getStatusCount('answered')}
              </div>
              <span className="font-medium text-gray-700">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {getStatusCount('not-answered')}
              </div>
              <span className="font-medium text-gray-700">Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {getStatusCount('marked')}
              </div>
              <span className="font-medium text-gray-700">Marked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {getStatusCount('marked-answered')}
              </div>
              <span className="font-medium text-gray-700">Marked & Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-xs shadow-sm">
                {getStatusCount('not-visited')}
              </div>
              <span className="font-medium text-gray-700">Not Visited</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-gray-600">
            <div className="font-semibold">You are viewing <span className="text-gray-900">{testTitle}</span></div>
            <div className="mt-1">section</div>
            <div className="mt-2 font-semibold">Question Palette:</div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-2 pb-2">
              {Array.from({ length: totalQuestions }).map((_, index) => {
                const isCurrent = index === currentQuestion;
                const status = questionStatuses[index] || 'not-visited';

                return (
                  <button
                    key={index}
                    onClick={() => onQuestionSelect(index)}
                    className={`h-10 rounded-md font-bold text-sm transition-all shadow-sm ${getStatusClass(
                      status,
                      isCurrent
                    )}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-8">
              <button className="p-2 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" className="border-2 hover:bg-blue-50">
          Question Paper
        </Button>
        <Button variant="outline" className="border-2 hover:bg-blue-50">
          Instructions
        </Button>
        <Button variant="outline" className="border-2 hover:bg-blue-50">
          Profile
        </Button>
        <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
          Submit
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto p-0">
          <div className="p-4 sm:p-6 h-full">
            <PaletteContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 h-fit sticky top-24 border border-gray-200">
      <PaletteContent />
    </div>
  );
}
