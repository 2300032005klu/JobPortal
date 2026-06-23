import api from './api';

import type { Application } from './applicationService';

// IMPORTANT: Normalize recruiter endpoint payload to match the UI expectations
// (id/_id, populated candidate/job shapes, resumeFile/resumeUrl, dates).
export const getRecruiterApplications = async (): Promise<Application[]> => {
  const response = await api.get('/applications/recruiter');

  const mapFromApi = (raw: any): Application => {
    // Backend: populated candidate under `candidateId`, populated job under `jobId`.
    const populatedCandidate = raw?.profiles ?? raw?.candidateId;
    const populatedJob = raw?.jobs ?? raw?.jobId;

    return {
      ...(raw as any),
      id: raw?._id ?? raw?.id,
      candidateId: raw?.candidateId ?? raw?.candidate_id,
      recruiterId: raw?.recruiterId ?? raw?.recruiter_id,
      jobId: raw?.jobId ?? raw?.job_id,

      coverLetter: raw?.coverLetter ?? raw?.cover_letter,
      resumeFile: raw?.resumeFile ?? raw?.resume_file,
      resumeUrl: raw?.resumeUrl ?? raw?.resume_url,

      createdAt: raw?.createdAt ?? raw?.created_at,
      appliedAt: raw?.appliedAt ?? raw?.applied_at,

      profiles: populatedCandidate
        ? {
            ...populatedCandidate,
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
    } as Application;
  };

  return (response.data as any[]).map(mapFromApi);
};


