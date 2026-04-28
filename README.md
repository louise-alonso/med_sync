# 🏥 Sistema de Gestão Médica - MedApp

📌 **Sobre o Projeto**
O MedApp é um sistema de gestão de clínicas médicas projetado para otimizar o fluxo de atendimento. O sistema permite que pacientes agendem consultas, recepcionistas gerenciem a fila e médicos realizem atendimentos de forma organizada e eficiente.

O principal objetivo é eliminar falhas de comunicação e garantir que o médico tenha total controle sobre sua agenda, enquanto a recepção cuida da logística e do fluxo de pacientes.

---

## 🛠️ Tecnologias Utilizadas

O sistema utiliza as seguintes tecnologias:

- **Frontend:** React 18, Vite, TypeScript.
- **Backend:** Node.js, Express, TypeScript.
- **Estilização:** Tailwind CSS (Moderno, Responsivo).
- **Animações:** Framer Motion (Motion).
- **Ícones:** Lucide React.
- **Autenticação:** JSON Web Token (JWT) e BcryptJS para segurança de dados.
- **Banco de Dados:** Simulação em memória (In-memory) para agilidade no desenvolvimento e demonstração.

---

## 🚀 Como Rodar o Projeto no VS Code

Siga os passos abaixo para configurar o ambiente de desenvolvimento:

1. **Instalar Dependências:** No terminal do VS Code, execute:
   ```bash
   npm install
   ```

2. **Rodar o Sistema:** O servidor integra tanto o Backend quanto o Frontend (Vite Middleware):
   ```bash
   npm run dev
   ```

3. **Acessar:** O sistema estará disponível na porta padrão:
   `http://localhost:3000`

---

## 🗄️ Estrutura de Dados e Perfis

O sistema baseia-se em três perfis de acesso distintos:

1.  **PACIENTE:**
    - Visualiza médicos e horários disponíveis.
    - Solicita agendamentos (que aguardam aprovação do médico).
    - Gerencia suas próprias consultas (Reagendar/Cancelar).
2.  **MEDICO:**
    - Painel de Agenda Diária.
    - Aprova ou Recusa solicitações de agendamento.
    - Gerencia a Fila de Atendimento em tempo real (apenas pacientes com presença confirmada).
    - Realiza e finaliza atendimentos com observações médicas.
3.  **RECEPCAO:**
    - Gerencia todos os agendamentos do dia.
    - Realiza "Encaixes" (agendamentos diretos que também dependem de aprovação médica).
    - Confirma presença dos pacientes (Check-in) e registra pagamentos.
    - Organiza a Fila e define prioridades (Normal, Urgência, Emergência).

---

## 🔐 Autenticação (JWT)

O sistema conta com um fluxo de autenticação seguro:
- **Rota:** `/api/auth/login` (POST)
- **Segurança:** Senhas são criptografadas com `bcryptjs`.
- **Sessão:** Ao logar, o usuário recebe um `token` JWT que é armazenado no cliente e enviado em todas as requisições protegidas via Header `Authorization`.

---

## 🔄 Fluxo de Negócio

1. **Agendamento:** O status inicial de qualquer consulta (via paciente ou recepção) é `AGUARDANDO_APROVACAO`.
2. **Aprovação do Médico:** O médico deve aprovar a consulta para que ela mude para `AGENDADO`. Se recusar, muda para `RECUSADO`.
3. **Recepção (O Dia da Consulta):** A recepção confirma a presença do paciente. A consulta ganha prioridade e ordem na fila.
4. **Fila do Médico:** O médico visualiza os pacientes confirmados e clica em **Iniciar Atendimento**.
5. **Finalização:** Após o atendimento, o médico registra as notas e indica se há necessidade de retorno. A consulta é marcada como `CONCLUIDO`.

---

## ⚙️ Regras de Negócio Críticas

- **Reset de Confirmação:** Se uma consulta for reagendada, o status volta para aprovação e a presença é resetada.
- **Controle de Cancelamento:** O cancelamento pelo médico remove a consulta da agenda e da recepção instantaneamente.
- **Prioridade na Fila:** Suporte a tipos de atendimento: Normal, Urgência e Emergência.
- **Validação de Horários:** Bloqueio automático de agendamentos em horários passados ou já ocupados.

---

## 🎨 Design e Layout

- **Tipografia:** Foco em legibilidade e profissionalismo.
- **Interface:** Design "Clean" com feedbacks visuais claros (cores para diferentes estados de consulta).
- **Responsividade:** Totalmente adaptado para desktop e uso em tablets por médicos durante o atendimento.

---

📌 *Projeto desenvolvido para proporcionar uma experiência fluida tanto para a equipe médica quanto para os pacientes.*
