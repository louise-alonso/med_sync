export interface User {
  id: string;
  nome: string;
  email: string;
  perfil: 'PACIENTE' | 'MEDICO' | 'RECEPCAO';
}

export interface Appointment {
  id: string;
  paciente_id: string;
  medico_id: string;
  medico_nome?: string;
  paciente_nome?: string;
  especialidade?: string;
  data_hora: string;
  status: 'AGUARDANDO_APROVACAO' | 'AGENDADO' | 'CHECKIN_REALIZADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'RECUSADO';
  ordem_fila?: number;
  prioridade?: 'NORMAL' | 'URGENCIA' | 'EMERGENCIA';
  presenca_confirmada: boolean;
  necessita_retorno: boolean;
  observacoes_medico: string;
  metodo_pagamento?: 'DINHEIRO' | 'PIX' | 'CARTAO' | 'PLANO';
  status_pagamento?: 'PENDENTE' | 'PAGO';
}

export interface Doctor {
  id: string;
  nome: string;
  especialidade: string;
  crm: string;
}
