'use client';

import * as React from 'react';
import { MathpixLoader, MathpixMarkdown } from 'mathpix-markdown-it';
import { cn } from '@/lib/utils';

export interface MathTextInnerProps {
  text: string;
  inline?: boolean;
  className?: string;
}

export default function MathTextInner({ text, inline = false, className }: MathTextInnerProps) {
  if (!text) return null;
  return (
    <div
      className={cn(
        'mathpix-content',
        inline ? 'mathpix-inline' : 'mathpix-block',
        className
      )}
    >
      <MathpixLoader>
        <MathpixMarkdown text={text} htmlTags />
      </MathpixLoader>
    </div>
  );
}
