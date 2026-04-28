# 🏥 Sistema de Gestão Médica - MedApp

📌 **Sobre o Projeto**
Este é um sistema completo de gestão de clínicas e consultórios médicos, projetado para otimizar o fluxo de atendimento desde o agendamento pelo paciente até a conclusão da consulta pelo médico, passando pela organização da recepção.

O sistema resolve problemas de comunicação e organização, garantindo que o médico tenha controle total sobre sua agenda e a recepção consiga gerenciar a fila de espera de forma eficiente.

---

## 🛠️ Tecnologias Utilizadas

O sistema é baseado em uma arquitetura moderna e escalável:

- **Frontend:** React 18 com Vite, utilizando TypeScript para maior segurança de código.
- **Backend:** Node.js com Express e TypeScript.
- **Estilização:** Tailwind CSS para um design responsivo e moderno.
- **Animações:** Framer Motion para transições fluidas e feedback visual.
- **Ícones:** Lucide React para uma interface intuitiva.
- **Autenticação:** JSON Web Token (JWT) com criptografia de senhas via BcryptJS.
- **Banco de Dados:** Estrutura em memora (In-memory DB) simulando persistência para demonstração e agilidade.

---

## 🚀 Como Rodar o Projeto

Para rodar o projeto localmente, siga os passos abaixo:

### 1. Pré-requisitos
- Node.js instalado (versão 18 ou superior).
- Gerenciador de pacotes (npm ou yarn).

### 2. Instalação e Execução
Como o projeto utiliza um servidor Express que integra o Vite como middleware, você só precisa de um comando:

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
O sistema estará disponível em `http://localhost:3000`.

---

## 🗄️ Estrutura de Dados e Negócio

### Perfis de Acesso
- **PACIENTE:** Realiza agendamentos, visualiza seu histórico e reagenda consultas.
- **MEDICO:** Gerencia agenda, aprova/recusa solicitações, realiza o atendimento e prescreve observações.
- **RECEPCAO:** Gerencia a chegada dos pacientes, confirma presença, organiza a fila e processa pagamentos.

### Tabelas Principais (Entidades)
- **Users:** Armazena dados de login, nome e perfil.
- **Appointments (Consultas):** O coração do sistema.
  - `status`: Define em que fase a consulta está (`AGUARDANDO_APROVACAO`, `AGENDADO`, `CHECKIN_REALIZADO`, `EM_ATENDIMENTO`, `CONCLUIDO`, `CANCELADO`).
  - `presenca_confirmada`: Booleano que define se o paciente já passou pela recepção.
  - `ordem_fila`: Define a posição no painel do médico.
- **Schedules:** Define a grade de horários de trabalho de cada médico.

---

## 🔐 Autenticação e Segurança

- **Fluxo:** O usuário faz login via `/api/auth/login`, recebe um token JWT que deve ser enviado no header `Authorization` de todas as rotas protegidas.
- **Middleware:** O backend valida a validade do token e o perfil do usuário antes de permitir o acesso às rotas de negócio.

---

## 🔄 Fluxo do Sistema

1. **Agendamento:** O paciente escolhe um médico e um horário. A consulta nasce com status `AGUARDANDO_APROVACAO`.
2. **Aprovação:** O médico visualiza as solicitações pendentes e pode **Aprovar** ou **Recusar**.
3. **Recepção:** No dia da consulta, o paciente chega e a recepção confirma sua presença (`Confirmar Presença`). A consulta entra na fila do médico.
4. **Atendimento:** O médico inicia a consulta (`Iniciar Atendimento`). O status muda para `EM_ATENDIMENTO`.
5. **Conclusão:** O médico finaliza a consulta preenchendo as observações e indicando se há necessidade de retorno.

---

## ⚙️ Regras de Negócio Implementadas

- ✅ **Aprovação Obrigatória:** Todo agendamento (inclusive encaixes da recepção) precisa ser aprovado pelo médico.
- ✅ **Reset de Presença:** Se uma consulta for reagendada, a confirmação de presença é resetada (o paciente deve passar pela recepção novamente).
- ✅ **Cancelamento Global:** O cancelamento remove a consulta de todos os painéis ativos instantaneamente.
- ✅ **Validação de Horários:** Não é possível agendar em horários passados ou já ocupados.
- ✅ **Fila Inteligente:** A recepção pode reordenar a fila e definir prioridades (Normal, Urgência, Emergência).

---

## 🎨 Design e Interface

- **Cores:** Paleta profissional com verdes terapêuticos (Primary), brancos limpos e tons de cinza para neutralidade.
- **Tipografia:** Foco em legibilidade com fontes Sans-serif modernas.
- **Responsividade:** Layout adaptável para Desktops e Tablets, garantindo que o médico possa usar em seu iPad ou computador.

---

## 👨‍💻 Contribuição

1. Faça um Fork do projeto.
2. Crie uma Branch para sua feature (`git checkout -b feature/nova-feature`).
3. Commit suas mudanças (`git commit -m 'Adicionando nova feature'`).
4. Push para a Branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.

---

📌 *Projeto desenvolvido como parte de um sistema de gestão de saúde inteligente.*
