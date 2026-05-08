import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Tipos ──────────────────────────────────────────────────

export interface EvalSessionData {
  status: string;
  candidateFirstName: string;
  companyName: string;
  positionName: string;
}

export interface StartSessionResponse {
  sessionId: string;
  introAudioUrl: string;
}

export interface TurnResponse {
  transcript: string;
  nextAudioUrl: string;
  isFinal: boolean;
}

// ── API del candidato (pública, por token) ─────────────────

export const evalApi = {
  getSession: async (token: string): Promise<EvalSessionData> => {
    const res = await api.get(`/eval/${token}`);
    return res.data;
  },

  acceptConsent: async (
    token: string,
    payload: { accepted: boolean; userAgent: string },
  ) => {
    const res = await api.post(`/eval/${token}/consent`, payload);
    return res.data;
  },

  startSession: async (token: string): Promise<StartSessionResponse> => {
    const res = await api.post(`/eval/${token}/start`);
    return res.data;
  },

  sendTurn: async (
    token: string,
    sessionId: string,
    audioBlob: Blob,
  ): Promise<TurnResponse> => {
    const form = new FormData();
    form.append('sessionId', sessionId);
    form.append('audio', audioBlob, 'turn.webm');
    const res = await api.post(`/eval/${token}/turn`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  endSession: async (token: string, sessionId: string) => {
    const res = await api.post(`/eval/${token}/end`, { sessionId });
    return res.data;
  },
};
