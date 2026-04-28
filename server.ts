import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = 'medapp-secret-key-123';

// --- DATA MODELS & MOCK DATA ---

interface User {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  perfil: 'PACIENTE' | 'MEDICO' | 'RECEPCAO';
  data_criacao: string;
}

interface Doctor {
  id: string; // FK user_id
  especialidade: string;
  crm: string;
}

interface Patient {
  id: string; // FK user_id
  data_nascimento: string;
  telefone: string;
}

interface Appointment {
  id: string;
  paciente_id: string;
  medico_id: string;
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

interface WorkSchedule {
  id: string;
  medico_id: string;
  dia_semana: number; // 0-6 (Sunday-Saturday)
  hora_inicio: string; // "HH:mm"
  hora_fim: string; // "HH:mm"
  duracao_consulta_min: number;
}

// In-memory "database"
const db = {
  users: [] as User[],
  doctors: [] as Doctor[],
  patients: [] as Patient[],
  appointments: [] as Appointment[],
  schedules: [] as WorkSchedule[]
};

// Initialize with Mock Data
async function initDb() {
  const salt = await bcrypt.genSalt(10);
  
  const addPatient = async (id: string, nome: string, email: string) => {
    const pass = await bcrypt.hash('123456', salt);
    db.users.push({ id, nome, email, senhaHash: pass, perfil: 'PACIENTE', data_criacao: new Date().toISOString() });
    db.patients.push({ id, data_nascimento: '1990-01-01', telefone: '(11) 90000-0000' });
  };

  const addDoctor = async (id: string, nome: string, email: string, espec: string, crm: string) => {
    const pass = await bcrypt.hash('123456', salt);
    db.users.push({ id, nome, email, senhaHash: pass, perfil: 'MEDICO', data_criacao: new Date().toISOString() });
    db.doctors.push({ id, especialidade: espec, crm });
    
    // Default schedules
    for (let day = 1; day <= 5; day++) {
      db.schedules.push({
        id: `s-${id}-${day}`,
        medico_id: id,
        dia_semana: day,
        hora_inicio: '08:00',
        hora_fim: '18:00',
        duracao_consulta_min: 30
      });
    }
  };

  const addReception = async (id: string, nome: string, email: string) => {
    const pass = await bcrypt.hash('123456', salt);
    db.users.push({ id, nome, email, senhaHash: pass, perfil: 'RECEPCAO', data_criacao: new Date().toISOString() });
  };

  await addPatient('u1', 'João Paciente', 'paciente@teste.com');
  await addPatient('u3', 'Maria Silva', 'paciente2@teste.com');
  
  await addDoctor('u2', 'Dr. Silva Médico', 'medico@teste.com', 'Cardiologia', 'CRM/SP 123456');
  await addDoctor('u4', 'Dra. Oliveira', 'medico2@teste.com', 'Pediatria', 'CRM/SP 654321');

  await addReception('u5', 'Ana Recepção', 'recepcao@teste.com');
}

// --- SERVER SETUP ---

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- MIDDLEWARE ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- AUTH ROUTES ---
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

    const validPass = await bcrypt.compare(password, user.senhaHash);
    if (!validPass) return res.status(400).json({ message: 'Senha incorreta' });

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      perfil: user.perfil, 
      nome: user.nome,
      iat: Math.floor(Date.now() / 1000) 
    }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil } });
  });

  const getISODate = (date: Date | string) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// --- BUSINESS ROUTES ---
  
  // Public/Patient: List Doctors
  app.get('/api/medicos', authenticateToken, (req, res) => {
    const doctorsList = db.doctors.map(d => {
      const u = db.users.find(user => user.id === d.id);
      return { ...d, nome: u?.nome };
    });
    res.json(doctorsList);
  });

  // Patient: Available Slots
  app.get('/api/medicos/:id/horarios-disponiveis', authenticateToken, (req, res) => {
    const medicoId = req.params.id;
    const { data } = req.query;
    if (!data) return res.status(400).json({ message: 'Data é obrigatória' });
    
    const [year, month, day] = (data as string).split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();
    
    const schedule = db.schedules.find(s => s.medico_id === medicoId && s.dia_semana === dayOfWeek);
    if (!schedule) return res.json([]);

    const slots = [];
    const [startH, startM] = schedule.hora_inicio.split(':').map(Number);
    const [endH, endM] = schedule.hora_fim.split(':').map(Number);
    
    let current = new Date(targetDate);
    current.setHours(startH, startM, 0, 0);
    const end = new Date(targetDate);
    end.setHours(endH, endM, 0, 0);

    const now = new Date();
    const isToday = targetDate.getFullYear() === now.getFullYear() && 
                    targetDate.getMonth() === now.getMonth() && 
                    targetDate.getDate() === now.getDate();

    while (current < end) {
      const isPast = isToday && current <= now;
      const currentSlotTime = current.getTime();
      
      const isTaken = db.appointments.some(a => 
        a.medico_id === medicoId && 
        new Date(a.data_hora).getTime() === currentSlotTime &&
        !['CANCELADO', 'RECUSADO'].includes(a.status)
      );
      
      if (!isTaken && !isPast) {
        slots.push(new Date(current).toISOString());
      }
      current.setMinutes(current.getMinutes() + schedule.duracao_consulta_min);
    }

    res.json(slots);
  });

  // Patient or Doctor: Book Appointment (Doctor uses it for Returns)
  app.post('/api/consultas', authenticateToken, (req: any, res) => {
    const { medico_id, data_hora, paciente_id: req_paciente_id } = req.body;
    
    // If doctor/reception, use paciente_id from body, otherwise use auth user id
    const paciente_id = (req.user.perfil === 'MEDICO' || req.user.perfil === 'RECEPCAO') 
      ? req_paciente_id 
      : req.user.id;

    if (!paciente_id) return res.status(400).json({ message: 'ID do paciente é obrigatório' });

    const isTaken = db.appointments.some(a => 
      a.medico_id === medico_id && 
      new Date(a.data_hora).getTime() === new Date(data_hora).getTime() &&
      !['CANCELADO', 'RECUSADO'].includes(a.status)
    );

    if (isTaken) return res.status(400).json({ message: 'Horário já ocupado' });

    const appointment: Appointment = {
      id: Math.random().toString(36).substring(7),
      paciente_id,
      medico_id,
      data_hora,
      status: 'AGUARDANDO_APROVACAO',
      presenca_confirmada: false,
      necessita_retorno: false,
      observacoes_medico: ''
    };

    db.appointments.push(appointment);
    res.json(appointment);
  });

  // Reception: List Appointments for selected date
  app.get('/api/recepcao/consultas', authenticateToken, (req: any, res) => {
    if (req.user.perfil !== 'RECEPCAO') return res.sendStatus(403);
    const { data } = req.query;
    if (!data) return res.status(400).json({ message: 'Data é obrigatória' });

    const [year, month, day] = (data as string).split('-').map(Number);
    const targetDate = getISODate(new Date(year, month - 1, day));
    
    const apps = db.appointments
      .filter(a => 
        getISODate(a.data_hora) === targetDate && 
        !['CANCELADO', 'RECUSADO'].includes(a.status)
      )
      .map(a => {
        const pacUser = db.users.find(u => u.id === a.paciente_id);
        const docUser = db.users.find(u => u.id === a.medico_id);
        return { 
          ...a, 
          paciente_nome: pacUser?.nome, 
          medico_nome: docUser?.nome 
        };
      });
    res.json(apps);
  });

  // Reception: Confirm Presence
  app.put('/api/consultas/:id/confirmar-presenca', authenticateToken, (req: any, res) => {
    if (req.user.perfil !== 'RECEPCAO') return res.sendStatus(403);
    const appointment = db.appointments.find(a => a.id === req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Consulta não encontrada' });
    
    if (appointment.status !== 'AGENDADO' && appointment.status !== 'CHECKIN_REALIZADO') {
       // Allow re-confirming or handle already done
    }

    appointment.presenca_confirmada = true;
    res.json(appointment);
  });

  // Reception: Update Payment
  app.put('/api/consultas/:id/pagamento', authenticateToken, (req: any, res) => {
    if (req.user.perfil !== 'RECEPCAO') return res.sendStatus(403);
    const { metodo_pagamento, status_pagamento } = req.body;
    const appointment = db.appointments.find(a => a.id === req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Consulta não encontrada' });

    appointment.metodo_pagamento = metodo_pagamento;
    appointment.status_pagamento = status_pagamento;
    res.json(appointment);
  });

  // Reception: Update Queue Order and Priority
  app.put('/api/consultas/:id/ordem', authenticateToken, (req: any, res) => {
    if (req.user.perfil !== 'RECEPCAO') return res.sendStatus(403);
    const { ordem, prioridade } = req.body;
    const appointment = db.appointments.find(a => a.id === req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Consulta não encontrada' });

    if (ordem !== undefined) appointment.ordem_fila = ordem;
    if (prioridade !== undefined) appointment.prioridade = prioridade;
    res.json(appointment);
  });

  // Reception: Create Encaixe (direct appointment)
  app.post('/api/recepcao/encaixe', authenticateToken, (req: any, res) => {
    if (req.user.perfil !== 'RECEPCAO') return res.sendStatus(403);
    const { medico_id, data_hora, paciente_nome, paciente_email } = req.body;
    
    // Find or create mock patient user
    let user = db.users.find(u => u.email === paciente_email);
    if (!user) {
      user = {
        id: Math.random().toString(36).substring(7),
        nome: paciente_nome,
        email: paciente_email,
        senhaHash: '', // Placeholder
        perfil: 'PACIENTE',
        data_criacao: new Date().toISOString()
      };
      db.users.push(user);
    }

    const appointment: Appointment = {
      id: Math.random().toString(36).substring(7),
      paciente_id: user.id,
      medico_id,
      data_hora,
      status: 'AGUARDANDO_APROVACAO', // Encaixe starts as pending doctor approval
      presenca_confirmada: false,
      necessita_retorno: false,
      observacoes_medico: '',
      status_pagamento: 'PENDENTE'
    };

    db.appointments.push(appointment);
    res.json(appointment);
  });

  // Patient: My Appointments
  app.get('/api/pacientes/me/consultas', authenticateToken, (req: any, res) => {
    const myApps = db.appointments
      .filter(a => a.paciente_id === req.user.id)
      .map(a => {
        const docUser = db.users.find(u => u.id === a.medico_id);
        const docInfo = db.doctors.find(d => d.id === a.medico_id);
        return { ...a, medico_nome: docUser?.nome, especialidade: docInfo?.especialidade };
      });
    res.json(myApps);
  });

  // Appointment: Reschedule (Common for Patient and Doctor)
  app.post('/api/consultas/:id/reschedule', authenticateToken, (req: any, res) => {
    const { data_hora } = req.body;
    const appointment = db.appointments.find(a => a.id === req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Consulta não encontrada' });

    const isPatient = req.user.perfil === 'PACIENTE' && appointment.paciente_id === req.user.id;
    const isDoctor = req.user.perfil === 'MEDICO' && appointment.medico_id === req.user.id;
    const isReception = req.user.perfil === 'RECEPCAO';

    if (!isPatient && !isDoctor && !isReception) return res.sendStatus(403);

    // Update appointment
    appointment.data_hora = data_hora;
    appointment.status = 'AGUARDANDO_APROVACAO'; // Restart flow for approval
    appointment.presenca_confirmada = false; // Must pass through reception again
    res.json(appointment);
  });

  // Doctor: My Agenda
  app.get('/api/medicos/me/agenda', authenticateToken, (req: any, res) => {
    if (req.user.perfil !== 'MEDICO') return res.sendStatus(403);
    const { data } = req.query;
    
    let apps = db.appointments.filter(a => a.medico_id === req.user.id);
    
    if (data) {
      const [year, month, day] = (data as string).split('-').map(Number);
      const targetStr = getISODate(new Date(year, month - 1, day));
      apps = apps.filter(a => getISODate(a.data_hora) === targetStr);
    }
    
    const result = apps.map(a => {
      const pacUser = db.users.find(u => u.id === a.paciente_id);
      return { ...a, paciente_nome: pacUser?.nome };
    });
    res.json(result);
  });

  // Doctor: Update Status (Approve/Reject)
  app.put('/api/consultas/:id/status', authenticateToken, (req: any, res) => {
    const { status } = req.body;
    const appo = db.appointments.find(a => a.id === req.params.id && a.medico_id === req.user.id);
    if (!appo) return res.status(404).json({ message: 'Consulta não encontrada' });
    
    appo.status = status as any;
    res.json(appo);
  });

  // Doctor: Cancel Appointment
  app.put('/api/consultas/:id/cancelar', authenticateToken, (req: any, res) => {
    const appointment = db.appointments.find(a => a.id === req.params.id && a.medico_id === req.user.id);
    if (!appointment) return res.status(404).json({ message: 'Consulta não encontrada' });
    
    appointment.status = 'CANCELADO';
    res.json(appointment);
  });

  // Doctor: Start Appointment
  app.put('/api/consultas/:id/iniciar', authenticateToken, (req: any, res) => {
    const appo = db.appointments.find(a => a.id === req.params.id && a.medico_id === req.user.id);
    if (!appo) return res.status(404).json({ message: 'Consulta não encontrada' });
    
    appo.status = 'EM_ATENDIMENTO';
    res.json(appo);
  });

  // Doctor: Finish Appointment
  app.put('/api/consultas/:id/finalizar', authenticateToken, (req: any, res) => {
    const { observacoes_medico, necessita_retorno } = req.body;
    const appo = db.appointments.find(a => a.id === req.params.id && a.medico_id === req.user.id);
    if (!appo) return res.status(404).json({ message: 'Consulta não encontrada' });
    
    appo.status = 'CONCLUIDO';
    appo.observacoes_medico = observacoes_medico;
    appo.necessita_retorno = necessita_retorno;
    res.json(appo);
  });

  // Serve static files and handle SPA
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
