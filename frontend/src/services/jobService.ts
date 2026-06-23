import api from './api';

export type Role = 'CANDIDATE' | 'RECRUITER';

export interface JobProfile {
  name?: string;
  email?: string;
}

export interface Job {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  requirements?: string;
  type?: string;
  location?: string;
  salary?: string;
  company?: string;
  posted_by?: string;
  deadline?: string;
  created_at?: string;
  updated_at?: string;
  profiles?: JobProfile;
}

export const getJobs = async (filters?: {
  search?: string;
  type?: string;
  location?: string;
}): Promise<Job[]> => {
  const params: Record<string, string> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.type) params.type = filters.type;
  if (filters?.location) params.location = filters.location;

  const response = await api.get('/jobs', { params });
  return response.data as Job[];
};

export const getJobById = async (id: string): Promise<Job> => {
  console.log('Fetching job by id:', id);
  const response = await api.get(`/jobs/${id}`);
  return response.data as Job;
};

export const getFeaturedJobs = async (): Promise<Job[]> => {
  const response = await api.get('/jobs/featured');
  return response.data as Job[];
};

export const getMyJobs = async (): Promise<Job[]> => {
  const response = await api.get('/jobs/my');
  return response.data as Job[];
};

export type CreateJobInput = Omit<
  Job,
  'id' | 'posted_by' | 'created_at' | 'updated_at' | 'profiles'
>;

export const createJob = async (jobData: CreateJobInput): Promise<Job> => {
  const response = await api.post('/jobs', jobData);
  return response.data as Job;
};

export const updateJob = async (id: string, jobData: Partial<Job>): Promise<Job> => {
  const response = await api.put(`/jobs/${id}`, jobData);
  return response.data as Job;
};

export const deleteJob = async (id: string): Promise<void> => {
  await api.delete(`/jobs/${id}`);
};

