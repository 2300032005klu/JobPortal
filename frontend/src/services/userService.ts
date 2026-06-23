import api from './api';

export interface UpdateProfileInput {
  name: string;
  skills: string[];
  experience: string;
  resume_url: string;
}

export const updateProfile = async (data: UpdateProfileInput) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

export interface Stats {
  totalJobs: number;
  totalApplications: number;
  totalRecruiters: number;
  totalCandidates: number;
}

export const getStats = async (): Promise<Stats> => {
  const response = await api.get('/users/stats');
  return response.data as Stats;
};

