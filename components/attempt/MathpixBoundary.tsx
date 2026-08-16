'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type MathpixModule = typeof import('mathpix-markdown-it');

const MathpixContext = createContext<MathpixModule | null>(null);

let cached: MathpixModule | null = null;
let pending: Promise<MathpixModule> | null = null;

export function loadMathpix(): Promise<MathpixModule> {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = import('mathpix-markdown-it').then((mod) => {
      cached = mod;
      return mod;
    });
  }
  return pending;
}

export function useMathpix(): MathpixModule | null {
  return useContext(MathpixContext);
}

/**
 * Loads Mathpix once and wraps children in a single loader.
 * Children always render immediately — formulas upgrade when the library is ready.
 */
export default function MathpixBoundary({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<MathpixModule | null>(cached);

  useEffect(() => {
    let live = true;
    loadMathpix().then((loaded) => {
      if (live) setApi(loaded);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!api) {
    return <>{children}</>;
  }

  const Loader = api.MathpixLoader;
  return (
    <MathpixContext.Provider value={api}>
      <Loader>{children}</Loader>
    </MathpixContext.Provider>
  );
}
