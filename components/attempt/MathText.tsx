'use client';

import { cn } from '@/lib/utils';
import { useMathpix } from './MathpixBoundary';

export interface MathTextProps {
  text: string | null | undefined;
  inline?: boolean;
  className?: string;
}

export default function MathText({ text, inline = false, className }: MathTextProps) {
  const api = useMathpix();
  const value = typeof text === 'string' ? text : '';
  if (!value.trim()) return null;

  if (!api) {
    return (
      <div
        className={cn(
          'break-words whitespace-pre-wrap text-inherit',
          inline && 'inline',
          className
        )}
      >
        {value}
      </div>
    );
  }

  const Markdown = api.MathpixMarkdown;
  return (
    <div
      className={cn(
        'mathpix-content',
        inline ? 'mathpix-inline' : 'mathpix-block',
        className
      )}
    >
      <Markdown text={value} htmlTags />
    </div>
  );
}
