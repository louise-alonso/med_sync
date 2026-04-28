import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  Calendar, 
  User as UserIcon, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  ChevronRight,
  Stethoscope,
  Activity,
  History,
  AlertCircle,
  CreditCard,
  Trash2,
  Search
} from 'lucide-react';
import { User, Appointment, Doctor } from './types';

// --- CONTEXT ---

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- API HELPERS ---

const API_BASE = '/api';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return res;
};

// --- COMPONENTS ---

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white border-b border-border h-[70px] flex items-center justify-between px-10 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <div className="w-3.5 h-1 bg-white rounded-[2px] relative">
            <div className="w-1 h-3.5 bg-white rounded-[2px] absolute top-[-5px] left-[5px]"></div>
          </div>
        </div>
        <span className="font-display font-extrabold text-2xl text-primary tracking-tight">MedSync</span>
      </div>
      
      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user.nome}</p>
            <p className="text-xs text-text-secondary">
              {user.perfil === 'MEDICO' ? 'Médico' : user.perfil === 'RECEPCAO' ? 'Recepção' : 'Paciente'}
            </p>
          </div>
          <button 
            onClick={logout}
            className="p-2 hover:bg-neutral-bg rounded-lg text-text-secondary hover:text-tertiary transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
};

// --- PAGES ---

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center p-6 bg-neutral-bg hero-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[600px] w-full text-center space-y-6"
      >
        <div className="space-y-6">
          <h1 className="text-[48px] font-display font-bold leading-[1.1] tracking-[-0.02em]">
            Sua saúde organizada em um único lugar.
          </h1>
          <p className="text-text-secondary text-lg">
            Plataforma integrada para médicos e pacientes. Agendamentos rápidos, prontuários seguros e gestão em tempo real.
          </p>
        </div>
        <div className="flex justify-center pt-10">
         <button 
            id="home-entrar-btn"
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Entrar no Sistema
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao entrar');
      
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card max-w-sm w-full space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Bem-vindo de volta</h2>
          <p className="text-text-secondary text-sm">Entre com suas credenciais para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-main px-1">Email</label>
            <input 
              type="email" 
              required
              className="input-field" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-main px-1">Senha</label>
            <input 
              type="password" 
              required
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-tertiary/10 text-tertiary p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="pt-4 border-t border-border mt-6">
          <p className="text-xs text-text-secondary text-center">
            Dados de teste: <br />
            <strong>paciente@teste.com</strong> / 123456 <br />
            <strong>medico@teste.com</strong> / 123456 <br />
            <strong>recepcao@teste.com</strong> / 123456
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'AGENDADAS' | 'HISTORICO'>('AGENDADAS');
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [appRes, docRes] = await Promise.all([
        fetchWithAuth('/pacientes/me/consultas'),
        fetchWithAuth('/medicos')
      ]);
      const [apps, docs] = await Promise.all([appRes.json(), docRes.json()]);
      setAppointments(apps);
      setDoctors(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const docId = rescheduleId ? appointments.find(a => a.id === rescheduleId)?.medico_id : selectedDoctor;
    if (docId && selectedDate) {
      fetchWithAuth(`/medicos/${docId}/horarios-disponiveis?data=${selectedDate}`)
        .then(res => res.json())
        .then(setAvailableSlots);
    }
  }, [selectedDoctor, selectedDate, rescheduleId, appointments]);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleBook = async (slot: string) => {
    setSelectedSlot(slot);
  };

  const confirmBooking = async () => {
    if (!selectedSlot) return;
    setBookingLoading(true);
    try {
      const url = rescheduleId ? `/consultas/${rescheduleId}/reschedule` : '/consultas';
      const body = rescheduleId ? { data_hora: selectedSlot } : { medico_id: selectedDoctor, data_hora: selectedSlot };
      
      const res = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setSelectedDoctor('');
        setRescheduleId(null);
        setSelectedSlot(null);
        setAvailableSlots([]);
        loadData();
        alert(rescheduleId ? 'Reagendamento solicitado!' : 'Agendamento solicitado! Aguarde a aprovação do médico.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  // Removed handleCheckin per user request

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  const filteredApps = appointments.filter(a => 
    activeTab === 'AGENDADAS' 
      ? ['AGUARDANDO_APROVACAO', 'AGENDADO', 'CHECKIN_REALIZADO', 'EM_ATENDIMENTO'].includes(a.status)
      : ['CONCLUIDO', 'CANCELADO', 'RECUSADO'].includes(a.status)
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display mb-2">Painel do Paciente</h1>
          <p className="text-text-secondary">Acompanhe seu histórico e agende novas consultas.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-border">
          <button 
            onClick={() => setActiveTab('AGENDADAS')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'AGENDADAS' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-neutral-bg'}`}
          >
            Ativas
          </button>
          <button 
            onClick={() => setActiveTab('HISTORICO')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'HISTORICO' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-neutral-bg'}`}
          >
            Histórico
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agendar Nova */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-border space-y-4 shadow-sm sticky top-[90px]">
            <div className="flex items-center gap-2 text-primary">
              {rescheduleId ? <Clock className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
              <h3 className="font-bold">{rescheduleId ? 'Reagendar' : 'Agendar Consulta'}</h3>
            </div>
            
            <div className="space-y-3">
              {!rescheduleId && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary uppercase">Médico</label>
                    <select 
                      className="input-field py-2" 
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                      <option value="">Selecione um médico</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.nome} - {d.especialidade}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary uppercase">Data</label>
                <input 
                  type="date" 
                  className="input-field py-2"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {(selectedDoctor || rescheduleId) && (
              <div className="pt-2 space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase">Horários Disponíveis</label>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {availableSlots.length > 0 ? (
                    availableSlots.map(slot => (
                      <button 
                        key={slot}
                        onClick={() => handleBook(slot)}
                        disabled={bookingLoading}
                        className={`text-xs py-2 px-3 border rounded-lg transition-colors text-center ${
                          selectedSlot === slot ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary hover:text-primary'
                        }`}
                      >
                        {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-text-secondary italic col-span-2">Nenhum horário disponível.</p>
                  )}
                </div>
              </div>
            )}
            
            {selectedSlot && (
              <button 
                onClick={confirmBooking}
                disabled={bookingLoading}
                className="btn-primary w-full py-3 mt-4"
              >
                {bookingLoading ? 'Processando...' : 'Confirmar Agendamento'}
              </button>
            )}
            
            {rescheduleId && (
               <button 
                onClick={() => setRescheduleId(null)}
                className="w-full text-xs text-tertiary font-bold hover:underline"
               >
                 Cancelar Reagendamento
               </button>
            )}
          </div>
        </div>

        {/* Listagem */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            {filteredApps.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-border text-center space-y-2">
                <Calendar className="w-10 h-10 text-text-secondary/30 mx-auto" />
                <p className="text-text-secondary font-medium">Nenhuma consulta encontrada.</p>
              </div>
            ) : (
              filteredApps.sort((a,b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()).map(app => (
                <motion.div 
                  layout
                  key={app.id} 
                  className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      app.status === 'CONCLUIDO' ? 'bg-secondary/10 text-secondary' :
                      app.status === 'AGENDADO' ? 'bg-primary/10 text-primary' :
                      app.status === 'RECUSADO' ? 'bg-tertiary/10 text-tertiary' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg">{app.medico_nome}</h4>
                        <span className="text-xs bg-neutral-bg px-2 py-0.5 rounded text-text-secondary border border-border">{app.especialidade}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(app.data_hora).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(app.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'CONCLUIDO' ? 'bg-green-100 text-green-700' :
                      app.status === 'AGENDADO' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                      app.status === 'RECUSADO' ? 'bg-tertiary/20 text-tertiary' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {app.status === 'RECUSADO' ? 'RECUSADO PELO MÉDICO' : 
                       app.status === 'CANCELADO' ? 'CANCELADA' : app.status.replace(/_/g, ' ')}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {(app.status === 'AGUARDANDO_APROVACAO' || app.status === 'AGENDADO' || app.status === 'RECUSADO') && (
                        <button 
                          onClick={() => setRescheduleId(app.id)}
                          className="text-xs font-bold text-text-secondary hover:text-primary transition-colors"
                        >
                          Reagendar
                        </button>
                      )}
                    </div>

                    {app.status === 'AGUARDANDO_APROVACAO' && (
                       <p className="text-[10px] text-text-secondary animate-pulse italic">Aguardando aprovação do médico...</p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState<any | null>(null);
  const [obs, setObs] = useState('');
  const [retorno, setRetorno] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rescheduleAppId, setRescheduleAppId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState<string | null>(null);
  const [lastFinishedApp, setLastFinishedApp] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchWithAuth(`/medicos/me/agenda?data=${selectedDate}`);
      const data = await res.json();
      setAppointments(data);
      
      // Check if there's an ongoing appointment
      const ongoing = data.find((a: any) => a.status === 'EM_ATENDIMENTO');
      if (ongoing) {
        setActiveApp(ongoing);
        setObs(ongoing.observacoes_medico || '');
        setRetorno(ongoing.necessita_retorno || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  useEffect(() => {
    if (rescheduleAppId && rescheduleDate) {
      const app = appointments.find(a => a.id === rescheduleAppId);
      if (app) {
        fetchWithAuth(`/medicos/${app.medico_id}/horarios-disponiveis?data=${rescheduleDate}`)
          .then(res => res.json())
          .then(setRescheduleSlots);
      }
    }
  }, [rescheduleAppId, rescheduleDate, appointments]);

  const handleConfirmReschedule = async () => {
    if (!rescheduleAppId || !selectedRescheduleSlot) return;
    setActionLoading('RESCHEDULE');
    try {
      const res = await fetchWithAuth(`/consultas/${rescheduleAppId}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({ data_hora: selectedRescheduleSlot })
      });
      if (res.ok) {
        setRescheduleAppId(null);
        setSelectedRescheduleSlot(null);
        await loadData();
        alert('Reagendamento solicitado com sucesso!');
      } else {
        const err = await res.json();
        alert(err.message || 'Erro ao reagendar.');
      }
    } catch (e) {
      alert('Erro de conexão ao reagendar.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    setActionLoading(id);
    try {
      const res = await fetchWithAuth(`/consultas/${id}/cancelar`, { method: 'PUT' });
      if (res.ok) {
        alert('Consulta cancelada com sucesso!');
        await loadData();
      } else {
        const err = await res.json();
        alert(err.message || 'Erro ao cancelar consulta.');
      }
    } catch (e) {
      alert('Erro de conexão ao cancelar.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetchWithAuth(`/consultas/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Consulta ${status === 'AGENDADO' ? 'aprovada' : 'recusada'} com sucesso!`);
        await loadData();
      } else {
        const err = await res.json();
        alert(err.message || 'Erro ao atualizar status.');
      }
    } catch (e) {
      alert('Erro de conexão ao atualizar status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (id: string) => {
    setActionLoading(id);
    const res = await fetchWithAuth(`/consultas/${id}/iniciar`, { method: 'PUT' });
    if (res.ok) {
      loadData();
    }
    setActionLoading(null);
  };

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnSlot, setReturnSlot] = useState('');
  const [returnSlots, setReturnSlots] = useState<string[]>([]);

  useEffect(() => {
    if (showReturnModal && lastFinishedApp) {
      fetchWithAuth(`/medicos/${lastFinishedApp.medico_id}/horarios-disponiveis?data=${returnDate}`)
        .then(res => res.json())
        .then(setReturnSlots);
    }
  }, [showReturnModal, returnDate, lastFinishedApp]);

  const handleCreateReturn = async () => {
    if (!returnSlot || !lastFinishedApp) return;
    setActionLoading('RETURN');
    try {
      const res = await fetchWithAuth('/consultas', {
        method: 'POST',
        body: JSON.stringify({ 
          medico_id: lastFinishedApp.medico_id, 
          data_hora: returnSlot,
          paciente_id: lastFinishedApp.paciente_id
        })
      });
      if (res.ok) {
        setShowReturnModal(false);
        setReturnSlot('');
        setLastFinishedApp(null);
        alert('Retorno agendado com sucesso!');
        loadData();
      } else {
        const error = await res.json();
        alert(error.message || 'Erro ao agendar retorno.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinish = async (id: string) => {
    setActionLoading(id);
    const res = await fetchWithAuth(`/consultas/${id}/finalizar`, {
      method: 'PUT',
      body: JSON.stringify({ observacoes_medico: obs, necessita_retorno: retorno })
    });
    if (res.ok) {
      if (retorno) {
          setLastFinishedApp(activeApp);
          setShowReturnModal(true);
      }
      setActiveApp(null);
      setObs('');
      setRetorno(false);
      loadData();
    }
    setActionLoading(null);
  };

  if (loading) return <div className="p-8 text-center text-text-secondary font-medium italic">Carregando dados da clínica...</div>;

  // Sorting: Manual Priority > Manual Order (ordem_fila) then by time
  const sortedApps = [...appointments].sort((a, b) => {
    const priorityMap = { 'EMERGENCIA': 0, 'URGENCIA': 1, 'NORMAL': 2, undefined: 3 };
    const pA = priorityMap[a.prioridade as keyof typeof priorityMap];
    const pB = priorityMap[b.prioridade as keyof typeof priorityMap];
    if (pA !== pB) return pA - pB;

    if (a.ordem_fila !== undefined && b.ordem_fila !== undefined) {
      if (a.ordem_fila !== b.ordem_fila) return a.ordem_fila - b.ordem_fila;
    }
    return new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime();
  });

  const waitingApproval = sortedApps.filter(a => a.status === 'AGUARDANDO_APROVACAO');
  const queue = sortedApps.filter(a => ['AGENDADO', 'CHECKIN_REALIZADO'].includes(a.status));
  const canceledHistory = sortedApps.filter(a => a.status === 'CANCELADO' || a.status === 'RECUSADO');

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display mb-2">Agenda Médica</h1>
          <p className="text-text-secondary">Acompanhe seus atendimentos e gerencie sua fila.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-border">
          <label className="text-xs font-bold uppercase px-2 text-text-secondary">Ver data:</label>
          <input 
            type="date" 
            className="border-none focus:ring-0 text-sm font-bold text-primary cursor-pointer"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Atendimento Ativo & Pendentes */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Appointment */}
          <AnimatePresence mode="wait">
            {activeApp && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-3xl border-2 border-primary shadow-xl space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <Activity className="text-primary w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] bg-primary text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest">Em Atendimento</span>
                  <h3 className="text-3xl font-display mt-2">{activeApp.paciente_nome}</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-main">Prontuário / Observações</label>
                    <textarea 
                      className="input-field min-h-[150px] text-base"
                      placeholder="Descreva o atendimento, prescrições e orientações..."
                      value={obs}
                      onChange={(e) => setObs(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 p-4 bg-neutral-bg rounded-2xl border border-border w-full sm:w-auto">
                      <input 
                        type="checkbox" 
                        id="doctor-retorno"
                        className="w-6 h-6 rounded-lg accent-primary cursor-pointer"
                        checked={retorno}
                        onChange={(e) => setRetorno(e.target.checked)}
                      />
                      <label htmlFor="doctor-retorno" className="font-semibold cursor-pointer">Recomendar Retorno</label>
                    </div>
                    <button 
                      onClick={() => handleFinish(activeApp.id)}
                      disabled={!!actionLoading}
                      className="btn-primary px-10 py-4 text-xl w-full sm:w-auto"
                    >
                      {actionLoading ? 'Finalizando...' : 'Finalizar Consulta'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pending Approvals */}
          {waitingApproval.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />
                Aguardando Aprovação ({waitingApproval.length})
              </h2>
              <div className="grid gap-3">
                {waitingApproval.map(app => (
                  <div key={app.id} className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-xl border border-orange-200 text-center min-w-[70px]">
                        <span className="block text-xs font-bold text-orange-600">{new Date(app.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-text-main">{app.paciente_nome}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => handleStatusUpdate(app.id, 'RECUSADO')}
                        disabled={!!actionLoading}
                        className="px-4 py-2 text-xs font-bold text-tertiary hover:bg-tertiary/10 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {actionLoading === app.id ? '...' : 'Recusar'}
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(app.id, 'AGENDADO')}
                        disabled={!!actionLoading}
                        className="bg-primary text-white px-4 py-2 text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        Aprovar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Agenda / Queue */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Fila de Atendimento
            </h2>
            
            <div className="space-y-3">
              {queue.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-border text-center">
                  <p className="text-text-secondary">Nenhum paciente na fila para esta data.</p>
                </div>
              ) : (
                queue.map(app => (
                  <div key={app.id} className={`bg-white p-5 rounded-2xl border transition-all ${
                    app.presenca_confirmada ? 'border-primary/50 bg-green-50/30' : 'border-border bg-neutral-bg/30 grayscale'
                  } flex items-center justify-between gap-4 relative`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-display bg-white border-border text-text-secondary`}>
                        <span className="text-[10px] font-black uppercase leading-none mb-1">Hora</span>
                        <span className="text-lg font-black leading-none">{new Date(app.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg">{app.paciente_nome}</h4>
                          {app.presenca_confirmada && (
                            <span className="text-[10px] bg-secondary text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Presente</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!activeApp && (
                      <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
                         <button 
                            onClick={() => setRescheduleAppId(app.id)}
                            className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-2 rounded-xl border border-primary/20"
                         >
                            Reagendar
                         </button>
                         <button 
                            onClick={() => handleStatusUpdate(app.id, 'RECUSADO')}
                            disabled={!!actionLoading}
                            className="text-xs font-bold text-tertiary hover:bg-tertiary/5 px-3 py-2 rounded-xl border border-tertiary/20 disabled:opacity-50"
                         >
                            Recusar
                         </button>
                         <button 
                            onClick={() => handleStart(app.id)}
                            disabled={!app.presenca_confirmada || !!actionLoading}
                            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all grow sm:grow-0 ${
                                app.presenca_confirmada 
                                ? 'bg-primary text-white hover:scale-105 active:scale-95' 
                                : 'bg-neutral-bg text-text-secondary/50 cursor-not-allowed border border-border'
                            }`}
                         >
                            {actionLoading === app.id ? 'Iniciando...' : 'Iniciar Atendimento'}
                         </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Canceled/Rejected History with Remarcar option */}
          {canceledHistory.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-text-secondary">
                <Trash2 className="w-5 h-5" />
                Cancelados / Recusados
              </h2>
              <div className="space-y-3">
                {canceledHistory.map(app => (
                  <div key={app.id} className="bg-white p-4 rounded-2xl border border-border flex items-center justify-between gap-4 opacity-70">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px] p-2 bg-neutral-bg rounded-xl border border-border">
                        <span className="text-xs font-bold text-text-secondary">{new Date(app.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-text-main line-through">{app.paciente_nome}</h4>
                        <span className="text-[10px] font-bold uppercase text-tertiary">{app.status}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setRescheduleAppId(app.id)}
                      className="btn-primary py-2 px-4 text-xs"
                    >
                      Remarcar Consulta
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-6">
            <h3 className="font-bold text-lg">Estatísticas do Dia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-bg p-4 rounded-2xl border border-border text-center">
                <span className="block text-2xl font-black text-primary">{appointments.length}</span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Total</span>
              </div>
              <div className="bg-neutral-bg p-4 rounded-2xl border border-border text-center">
                <span className="block text-2xl font-black text-secondary">
                  {appointments.filter(a => a.status === 'CONCLUIDO').length}
                </span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Concluídos</span>
              </div>
              <div className="bg-neutral-bg p-4 rounded-2xl border border-border text-center">
                <span className="block text-2xl font-black text-tertiary">
                  {appointments.filter(a => a.status === 'CANCELADO' || a.status === 'RECUSADO').length}
                </span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Canceladas</span>
              </div>
              <div className="bg-neutral-bg p-4 rounded-2xl border border-border text-center">
                <span className="block text-2xl font-black text-orange-500">
                  {appointments.filter(a => a.status === 'EM_ATENDIMENTO').length}
                </span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Em andamento</span>
              </div>
              <div className="bg-neutral-bg p-4 rounded-2xl border border-border text-center">
                <span className="block text-2xl font-black text-green-600">
                  {appointments.filter(a => a.presenca_confirmada).length}
                </span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Presentes</span>
              </div>
              <div className="bg-neutral-bg p-4 rounded-2xl border border-border text-center">
                <span className="block text-2xl font-black text-gray-400">
                  {appointments.filter(a => !a.presenca_confirmada && a.status === 'AGENDADO').length}
                </span>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Ausentes</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              Lembrete
            </h4>
            <p className="text-sm text-text-secondary">
              A fila é organizada manualmente pela recepção. A ordem definida pela recepção dita a sequência de atendimento do dia.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Retorno */}
      <AnimatePresence>
        {showReturnModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl"
            >
              <h3 className="text-2xl font-bold">Agendar Retorno</h3>
              <p className="text-sm text-text-secondary italic">Agendar consulta de retorno para o paciente {lastFinishedApp?.paciente_nome}.</p>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-text-secondary">Data do Retorno</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={returnDate}
                    onChange={(e) => {
                      setReturnDate(e.target.value);
                      setReturnSlot('');
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-secondary">Horários Disponíveis</label>
                  <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {returnSlots.length > 0 ? (
                      returnSlots.map(slot => (
                        <button 
                          key={slot}
                          onClick={() => setReturnSlot(slot)}
                          className={`text-xs py-2 px-2 border rounded-lg transition-colors text-center ${
                            returnSlot === slot ? 'bg-primary text-white border-primary shadow-sm' : 'border-border hover:border-primary hover:text-primary'
                          }`}
                        >
                          {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-text-secondary italic col-span-3">Nenhum horário disponível para esta data.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowReturnModal(false)} 
                  className="flex-1 py-3 font-bold text-text-secondary hover:bg-neutral-bg transition-colors rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreateReturn}
                  disabled={!returnSlot || actionLoading === 'RETURN'}
                  className="flex-1 btn-primary py-3"
                >
                  {actionLoading === 'RETURN' ? 'Processando...' : 'Confirmar Retorno'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal for Doctor */}
      <AnimatePresence>
        {rescheduleAppId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl max-w-md w-full space-y-6"
            >
              <h3 className="text-2xl font-bold">Reagendar Consulta</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-text-secondary">Nova Data</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={rescheduleDate}
                    onChange={(e) => {
                      setRescheduleDate(e.target.value);
                      setSelectedRescheduleSlot(null);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-secondary">Horários Disponíveis</label>
                  <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {rescheduleSlots.length > 0 ? (
                      rescheduleSlots.map(slot => (
                        <button 
                          key={slot}
                          onClick={() => setSelectedRescheduleSlot(slot)}
                          className={`text-xs py-2 px-1 border rounded-lg transition-colors text-center ${
                            selectedRescheduleSlot === slot ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary hover:text-primary'
                          }`}
                        >
                          {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-text-secondary italic col-span-3">Nenhum horário disponível para esta data.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setRescheduleAppId(null)} className="flex-1 py-3 font-bold text-text-secondary">Cancelar</button>
                <button 
                  onClick={handleConfirmReschedule} 
                  disabled={!selectedRescheduleSlot || actionLoading === 'RESCHEDULE'} 
                  className="flex-1 btn-primary py-3"
                >
                  {actionLoading === 'RESCHEDULE' ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- AUTH PROVIDER ---

const APP_VERSION = '1.1.0';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('app_version');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const lastActivity = localStorage.getItem('lastActivity');
    const storedVersion = localStorage.getItem('app_version');

    // Invalidate if version mismatch (forced logout on update/restart simulation)
    if (storedVersion !== APP_VERSION) {
      logout();
      setIsLoading(false);
      return;
    }

    if (token && storedUser && lastActivity) {
      const now = Date.now();
      const diff = (now - parseInt(lastActivity)) / (1000 * 60);
      
      if (diff > 5) { // 5 minutes timeout
        logout();
      } else {
        setUser(JSON.parse(storedUser));
        localStorage.setItem('lastActivity', now.toString());
      }
    }
    setIsLoading(false);
  }, []);

  // Proactive logout check
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const diff = (Date.now() - parseInt(lastActivity)) / (1000 * 60);
        if (diff > 5) logout();
      }
    }, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [user]);

  // Update activity on every click/move
  useEffect(() => {
    const updateActivity = () => {
      if (localStorage.getItem('token')) {
        localStorage.setItem('lastActivity', Date.now().toString());
      }
    };
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('lastActivity', Date.now().toString());
    localStorage.setItem('app_version', APP_VERSION);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- ROUTING ---

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const ReceptionDashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [showEncaixe, setShowEncaixe] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [encaixeData, setEncaixeData] = useState({
    medico_id: '',
    data_hora: '',
    paciente_nome: '',
    paciente_email: ''
  });
  const [paymentModalApp, setPaymentModalApp] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const [appRes, docRes] = await Promise.all([
        fetchWithAuth(`/recepcao/consultas?data=${selectedDate}`),
        fetchWithAuth('/medicos')
      ]);
      const [apps, docs] = await Promise.all([appRes.json(), docRes.json()]);
      setAppointments(apps);
      setDoctors(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleConfirmPresence = async (id: string) => {
    const res = await fetchWithAuth(`/consultas/${id}/confirmar-presenca`, { method: 'PUT' });
    if (res.ok) loadData();
  };

  const handleCreateEncaixe = async () => {
    if (!encaixeData.medico_id || !encaixeData.data_hora || !encaixeData.paciente_nome) {
      alert('Preencha todos os campos do encaixe.');
      return;
    }
    const res = await fetchWithAuth('/recepcao/encaixe', {
      method: 'POST',
      body: JSON.stringify(encaixeData)
    });
    if (res.ok) {
      setShowEncaixe(false);
      setEncaixeData({ medico_id: '', data_hora: '', paciente_nome: '', paciente_email: '' });
      await loadData();
      alert('Encaixe solicitado com sucesso! Aguarde a aprovação do médico.');
    } else {
      const err = await res.json();
      alert(err.message || 'Erro ao criar encaixe.');
    }
  };

  const handleUpdatePayment = async (metodo: any, status: any) => {
    if (!paymentModalApp) return;
    const res = await fetchWithAuth(`/consultas/${paymentModalApp.id}/pagamento`, {
      method: 'PUT',
      body: JSON.stringify({ metodo_pagamento: metodo, status_pagamento: status })
    });
    if (res.ok) {
      setPaymentModalApp(null);
      loadData();
    }
  };

  const handleUpdateOrder = async (id: string, ordem: number) => {
    const res = await fetchWithAuth(`/consultas/${id}/ordem`, {
      method: 'PUT',
      body: JSON.stringify({ ordem })
    });
    if (res.ok) loadData();
  };

  const filtered = appointments.filter(a => 
    a.paciente_nome?.toLowerCase().includes(search.toLowerCase()) ||
    a.id.includes(search)
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display mb-2">Painel de Recepção</h1>
          <p className="text-text-secondary">Confirmação de presença e fluxo de pacientes.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowEncaixe(true)}
            className="btn-primary py-2 px-6 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Novo Encaixe
          </button>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-border">
            <Calendar className="w-4 h-4 text-primary ml-2" />
            <input 
              type="date" 
              className="border-none focus:ring-0 text-sm font-bold text-primary cursor-pointer"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
          <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest mb-1">Total</p>
          <h3 className="text-2xl font-display">{appointments.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
          <p className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">Confirmados</p>
          <h3 className="text-2xl font-display text-secondary">{appointments.filter(a => a.presenca_confirmada).length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
          <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest mb-1">Faltantes</p>
          <h3 className="text-2xl font-display text-orange-600">
            {appointments.filter(a => !a.presenca_confirmada && a.status === 'AGENDADO').length}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
          <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Pagos</p>
          <h3 className="text-2xl font-display text-primary">{appointments.filter(a => a.status_pagamento === 'PAGO').length}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text"
              placeholder="Buscar paciente por nome..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-neutral-bg text-[10px] uppercase font-bold text-text-secondary border-b border-border">
                <th className="px-4 py-3">Ordem</th>
                <th className="px-4 py-3">Prioridade</th>
                <th className="px-4 py-3">Horário</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Médico</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-secondary italic">
                    Nenhuma consulta encontrada para esta data.
                  </td>
                </tr>
              ) : (
                filtered.sort((a,b) => {
                  const priorityMap = { 'EMERGENCIA': 0, 'URGENCIA': 1, 'NORMAL': 2, undefined: 3 };
                  const pA = priorityMap[a.prioridade as keyof typeof priorityMap];
                  const pB = priorityMap[b.prioridade as keyof typeof priorityMap];
                  if (pA !== pB) return pA - pB;

                  if (a.ordem_fila !== undefined && b.ordem_fila !== undefined) {
                    if (a.ordem_fila !== b.ordem_fila) return a.ordem_fila - b.ordem_fila;
                  }
                  return new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime();
                }).map(app => (
                  <tr key={app.id} className="hover:bg-neutral-bg/50 transition-colors">
                    <td className="px-4 py-4">
                      <input 
                        type="number" 
                        min="1"
                        className="w-14 p-1 border border-border rounded text-center text-xs"
                        value={app.ordem_fila || ''}
                        onChange={(e) => handleUpdateOrder(app.id, parseInt(e.target.value))}
                        placeholder="--"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <select 
                        className={`text-[10px] font-bold uppercase p-1 rounded-lg border ${
                          app.prioridade === 'EMERGENCIA' ? 'border-tertiary text-tertiary bg-tertiary/5' :
                          app.prioridade === 'URGENCIA' ? 'border-orange-400 text-orange-600 bg-orange-50' :
                          'border-border text-text-secondary'
                        }`}
                        value={app.prioridade || 'NORMAL'}
                        onChange={(e) => {
                          const res = fetchWithAuth(`/consultas/${app.id}/ordem`, {
                            method: 'PUT',
                            body: JSON.stringify({ prioridade: e.target.value })
                          }).then(() => loadData());
                        }}
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="URGENCIA">Urgência</option>
                        <option value="EMERGENCIA">Emergência</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 font-bold text-sm">
                      {new Date(app.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-text-main">{app.paciente_nome}</p>
                      <p className="text-[10px] text-text-secondary">ID: {app.id}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium">{app.medico_nome}</p>
                    </td>
                    <td className="px-4 py-4">
                      {app.presenca_confirmada ? (
                        <span className="flex items-center gap-1 text-secondary font-bold text-xs bg-green-50 px-2 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Presente
                        </span>
                      ) : (
                        <span className="text-text-secondary text-xs italic bg-neutral-bg px-2 py-1 rounded-lg">Aguardando</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                       <button 
                        onClick={() => setPaymentModalApp(app)}
                        className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded-lg border ${
                          app.status_pagamento === 'PAGO' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                       >
                         <CreditCard className="w-3.5 h-3.5" />
                         {app.status_pagamento || 'PENDENTE'}
                       </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === 'AGUARDANDO_APROVACAO' ? (
                          <span className="text-[10px] uppercase font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">
                            Aguardando Confirmação Médico
                          </span>
                        ) : (
                          !app.presenca_confirmada && app.status === 'AGENDADO' && (
                            <button 
                              onClick={() => handleConfirmPresence(app.id)}
                              disabled={app.status_pagamento !== 'PAGO'}
                              className={`py-1.5 px-4 text-xs whitespace-nowrap rounded-xl font-bold transition-all ${
                                app.status_pagamento === 'PAGO' 
                                  ? 'bg-primary text-white hover:bg-primary-dark shadow-sm' 
                                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                              }`}
                            >
                              {app.status_pagamento === 'PAGO' ? 'Confirmar Presença' : 'Aguardando Pagamento'}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Encaixe Modal */}
      <AnimatePresence>
        {showEncaixe && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl max-w-md w-full space-y-6"
            >
              <h3 className="text-2xl font-bold">Novo Encaixe</h3>
              <div className="space-y-4">
                <input 
                  className="input-field" 
                  placeholder="Nome do Paciente"
                  value={encaixeData.paciente_nome}
                  onChange={(e) => setEncaixeData({...encaixeData, paciente_nome: e.target.value})}
                />
                <input 
                  className="input-field" 
                  placeholder="E-mail (Login)"
                  value={encaixeData.paciente_email}
                  onChange={(e) => setEncaixeData({...encaixeData, paciente_email: e.target.value})}
                />
                <select 
                  className="input-field"
                  value={encaixeData.medico_id}
                  onChange={(e) => setEncaixeData({...encaixeData, medico_id: e.target.value})}
                >
                  <option value="">Selecione o Médico</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
                <input 
                  type="datetime-local" 
                  className="input-field"
                  value={encaixeData.data_hora}
                  onChange={(e) => setEncaixeData({...encaixeData, data_hora: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEncaixe(false)} className="flex-1 py-3 font-bold text-text-secondary">Cancelar</button>
                <button onClick={handleCreateEncaixe} className="flex-1 btn-primary py-3">Criar Encaixe</button>
              </div>
            </motion.div>
          </div>
        )}

        {paymentModalApp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl max-w-sm w-full space-y-6"
            >
              <h3 className="text-xl font-bold">Registrar Pagamento</h3>
              <p className="text-sm text-text-secondary">Paciente: {paymentModalApp.paciente_nome}</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {['DINHEIRO', 'PIX', 'CARTAO', 'PLANO'].map(m => (
                    <button 
                      key={m}
                      onClick={() => handleUpdatePayment(m, 'PAGO')}
                      className="py-3 border border-border rounded-xl text-xs font-bold hover:border-primary hover:text-primary transition-all flex flex-col items-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      {m}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => handleUpdatePayment(paymentModalApp.metodo_pagamento, 'PENDENTE')}
                  className="w-full py-3 text-xs font-bold text-tertiary"
                >
                  Marcar como Pendente
                </button>
              </div>
              <button 
                onClick={() => setPaymentModalApp(null)}
                className="w-full text-text-secondary font-bold text-sm"
              >
                Voltar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.perfil === 'MEDICO') return <DoctorDashboard />;
  if (user?.perfil === 'RECEPCAO') return <ReceptionDashboard />;
  return <PatientDashboard />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-neutral-bg">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
