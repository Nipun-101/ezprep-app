'use client';

import { useState } from 'react';
import { dummyTest } from '@/lib/dummyTestData';
import { UserAnswer } from '@/lib/testTypes';
import TestInterface from '@/components/test/TestInterface';
import TestResults from '@/components/test/TestResults';

export default function TestPage() {
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<UserAnswer[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ml'>('en');

  const handleSubmit = (answers: UserAnswer[], language: 'en' | 'ml') => {
    setSubmittedAnswers(answers);
    setSelectedLanguage(language);
    setIsTestCompleted(true);
  };

  if (isTestCompleted) {
    return <TestResults test={dummyTest} answers={submittedAnswers} initialLanguage={selectedLanguage} />;
  }

  return <TestInterface test={dummyTest} onSubmit={handleSubmit} initialLanguage="en" />;
}
