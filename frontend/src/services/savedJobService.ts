import api from './api';

export type SavedJobResponse = any;

export const saveJob = async (jobId: string): Promise<void> => {
  await api.post(`/jobs/${jobId}/save`);
};

export const unsaveJob = async (jobId: string): Promise<void> => {
  await api.delete(`/jobs/${jobId}/save`);
};

export const getSavedJobs = async (): Promise<any[]> => {
  const res = await api.get('/jobs/saved');
  return res.data;
};

export const isJobSaved = async (jobId: string): Promise<{ saved: boolean }> => {
  const res = await api.get(`/jobs/${jobId}/saved`);
  return res.data;
};

