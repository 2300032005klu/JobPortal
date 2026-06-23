import api from './api';

export interface ApplicationProfile {
  name?: string;
  email?: string;
  skills?: string[];
  experience?: string;
  resumeFile?: string;
  resumeUrl?: string;
}



export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Rejected'
  | string;

export interface Application {
  id: string;
  _id?: string;
  candidateId: any;
  jobId: any;
  coverLetter?: string;
  resumeFile?: string;
  resumeUrl?: string;
  status?: ApplicationStatus;
  createdAt?: string;
  appliedAt?: string;
  jobs?: {
    title?: string;
    profiles?: ApplicationProfile;
  };
  profiles?: ApplicationProfile;
}


const mapApplicationFromApi = (raw: any): Application => {
  if (!raw) return raw as Application;

  // Backend populates candidate under `candidateId` and job under `jobId`.
  const populatedCandidate = raw.profiles ?? raw.candidateId;
  const populatedJob = raw.jobs ?? raw.jobId;

  return {
    ...raw,
    id: raw._id ?? raw.id,
    candidateId: raw.candidateId ?? raw.candidate_id,
    jobId: raw.jobId ?? raw.job_id,
    coverLetter: raw.coverLetter ?? raw.cover_letter,
    resumeFile: raw.resumeFile ?? raw.resume_file,
    resumeUrl: raw.resumeUrl ?? raw.resume_url,


    // normalize dates
    createdAt: raw.createdAt ?? raw.created_at,
    appliedAt: raw.appliedAt ?? raw.applied_at,

    // For backward-compat with existing UI which expects `profiles.*`
    profiles: populatedCandidate
      ? {
          ...populatedCandidate,
          // keep old resumeUrl for backward compatibility if present
          resumeUrl:
            populatedCandidate.resumeUrl ?? populatedCandidate.resume_url,
          resumeFile:
            populatedCandidate.resumeFile ?? populatedCandidate.resume_file,
        }
      : undefined,

    jobs: populatedJob
      ? {
          ...populatedJob,
          profiles: populatedCandidate,
        }
      : undefined,
  };
};

export const uploadResume = async (file: File): Promise<{ url: string; path: string }> => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await api.post('/upload/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};


export const applyForJob = async (data: {
  jobId: string;
  coverLetter: string;
  resumeFile: string;
}): Promise<Application> => {
  const response = await api.post('/applications', {
    jobId: data.jobId,
    coverLetter: data.coverLetter,
    resumeFile: data.resumeFile,
  });


  return mapApplicationFromApi(response.data);
};

export const getMyApplications = async (): Promise<Application[]> => {
  const response = await api.get('/applications/my');
  return (response.data as any[]).map(mapApplicationFromApi);
};

export const checkApplication = async (
  jobId: string
): Promise<{ applied: boolean }> => {
  const response = await api.get(
    `/applications/check/${encodeURIComponent(jobId)}`
  );
  return response.data as { applied: boolean };
};

export const getJobApplications = async (
  jobId: string
): Promise<Application[]> => {
  const response = await api.get(`/applications/job/${jobId}`);
  return (response.data as any[]).map(mapApplicationFromApi);
};

export const updateApplicationStatus = async (
  id: string,
  status: string
): Promise<Application> => {
  const response = await api.patch(`/applications/${id}/status`, { status });
  return mapApplicationFromApi(response.data);
};




