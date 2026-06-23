import api from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'CANDIDATE' | 'RECRUITER';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: 'CANDIDATE' | 'RECRUITER';
    skills?: string[];
    experience?: string;
    resumeUrl?: string;
    resume_url?: string;
  };
}

const normalizeUser = (raw: any): AuthResponse['user'] => ({
  ...raw,
  id: raw?.id ?? raw?._id,
  resumeUrl: raw?.resumeUrl ?? raw?.resume_url,
});

const normalizeAuthResponse = (raw: any): AuthResponse => {
  const user = raw?.user ?? raw;
  return {
    token: raw?.token,
    user: normalizeUser(user),
  };
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return normalizeAuthResponse(response.data);
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return normalizeAuthResponse(response.data);
};


export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const getMe = async (): Promise<AuthResponse['user']> => {
  const response = await api.get('/auth/me');
  return normalizeUser(response.data);
};

// Backward-compatible alias (if older code still references this name)
export const getCurrentUser = getMe;

