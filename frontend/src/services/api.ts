import { Assistido, AssistidoCreate, Atendimento, AtendimentoCreate } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  statusCode: number;
  detail: string;

  constructor(statusCode: number, detail: string) {
    super(`[HTTP ${statusCode}] ${detail}`);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'Ocorreu um erro inesperado no servidor.';
    try {
      const errorJson = await res.json();
      if (typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        // Pydantic validation errors (422)
        errorDetail = errorJson.detail.map((err: { msg: string; loc?: string[] }) => 
          err.loc ? `${err.loc.join('.')}: ${err.msg}` : err.msg
        ).join('; ');
      }
    } catch {
      errorDetail = `Erro HTTP ${res.status}: ${res.statusText || 'Falha na comunicação'}`;
    }
    throw new ApiError(res.status, errorDetail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async checkHealth(): Promise<{ status: string; service: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/`, { cache: 'no-store' });
      return handleResponse(res);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(0, 'Servidor Backend indisponível ou offline em ' + API_BASE_URL);
    }
  },

  async listarAssistidos(): Promise<Assistido[]> {
    const res = await fetch(`${API_BASE_URL}/assistidos`, { cache: 'no-store' });
    return handleResponse<Assistido[]>(res);
  },

  async buscarAssistido(cpf: string): Promise<Assistido> {
    const cleanCpf = cpf.trim();
    const res = await fetch(`${API_BASE_URL}/assistidos/${encodeURIComponent(cleanCpf)}`, {
      cache: 'no-store',
    });
    return handleResponse<Assistido>(res);
  },

  async cadastrarAssistido(data: AssistidoCreate): Promise<Assistido> {
    const res = await fetch(`${API_BASE_URL}/assistidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf: data.cpf.trim(),
        nome: data.nome.trim(),
      }),
    });
    return handleResponse<Assistido>(res);
  },

  async registrarAtendimento(data: AtendimentoCreate): Promise<Atendimento> {
    const res = await fetch(`${API_BASE_URL}/atendimentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assistido_cpf: data.assistido_cpf.trim(),
        justificativa: data.justificativa.trim(),
      }),
    });
    return handleResponse<Atendimento>(res);
  },

  async listarHistoricoAtendimentos(cpf: string): Promise<Atendimento[]> {
    const cleanCpf = cpf.trim();
    const res = await fetch(
      `${API_BASE_URL}/atendimentos/assistido/${encodeURIComponent(cleanCpf)}`,
      { cache: 'no-store' }
    );
    return handleResponse<Atendimento[]>(res);
  },
};
