import apiClient from './client';

export interface SubmitFeedbackPayload {
  text?: string;
  userInterface?: number;
  questions?: number;
  fullMockTests?: number;
  topicWisePractice?: number;
  easeOfUse?: number;
}

export async function submitFeedback(payload: SubmitFeedbackPayload): Promise<void> {
  await apiClient.post('/api/v1/feedback', payload);
}
