export interface Assistido {
  cpf: string;
  nome: string;
}

export interface AssistidoCreate {
  cpf: string;
  nome: string;
}

export interface Atendimento {
  id: string;
  assistido_cpf: string;
  justificativa: string;
  data_hora: string;
}

export interface AtendimentoCreate {
  assistido_cpf: string;
  justificativa: string;
}

export interface FeedbackMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  statusCode?: number;
  title: string;
  message: string;
  timestamp: string;
}
