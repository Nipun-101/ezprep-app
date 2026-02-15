'use client';

import { QuestionStatus } from '@/lib/testTypes';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentQuestion: number;
  questionStatuses: QuestionStatus[];
  onQuestionSelect: (index: number) => void;
  isMobile?: boolean;
}

export default function QuestionPalette({
  totalQuestions,
  currentQuestion,
  questionStatuses,
  onQuestionSelect,
  isMobile = false,
}: QuestionPaletteProps) {
  const getStatusClass = (status: QuestionStatus, isCurrent: boolean) => {
    if (isCurrent) {
      return 'ring-2 ring-teal-500 ring-offset-2';
    }

    switch (status) {
      case 'answered':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'not-answered':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'marked':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      case 'marked-answered':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }
  };

  const PaletteContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-green-500" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-red-500" />
            <span>Not Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-500" />
            <span>Marked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gray-200 border border-gray-300" />
            <span>Not Visited</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Question Palette</h3>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const isCurrent = index === currentQuestion;
            const status = questionStatuses[index] || 'not-visited';

            return (
              <button
                key={index}
                onClick={() => onQuestionSelect(index)}
                className={`w-10 h-10 rounded-md font-semibold text-sm transition-all ${getStatusClass(
                  status,
                  isCurrent
                )}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50 shadow-lg lg:hidden">
            <Menu className="w-4 h-4 mr-2" />
            Questions
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Question Palette</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <PaletteContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-6">
      <PaletteContent />
    </div>
  );
}
