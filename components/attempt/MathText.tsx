'use client';

import dynamic from 'next/dynamic';
import type { MathTextInnerProps } from './MathTextInner';

const MathTextInner = dynamic(() => import('./MathTextInner'), {
  ssr: false,
});

export default function MathText(props: MathTextInnerProps) {
  return <MathTextInner {...props} />;
}
