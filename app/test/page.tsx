'use client';

import { useState } from 'react';
import { dummyTest } from '@/lib/dummyTestData';
import { UserAnswer } from '@/lib/testTypes';
import TestInterface from '@/components/test/TestInterface';
import TestResults from '@/components/test/TestResults';

export default function TestPage() {
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<UserAnswer[]>([]);

  const handleSubmit = (answers: UserAnswer[]) => {
    setSubmittedAnswers(answers);
    setIsTestCompleted(true);
  };

  if (isTestCompleted) {
    return <TestResults test={dummyTest} answers={submittedAnswers} language="en" />;
  }

  return <TestInterface test={dummyTest} onSubmit={handleSubmit} language="en" />;
}
