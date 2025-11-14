/* eslint-disable no-unused-vars */
// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard(){
  const navigate = useNavigate();

  const [criteria, setCriteria] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [judges, setJudges] = useState([]);

  const [newCrit, setNewCrit] = useState({ label: '', type: 'numeric', numericMin: 1, numericMax: 5, options: '', weight: 1 });
  const [newCand, setNewCand] = useState({ number: '', name: '' });
  const [newJudge, setNewJudge] = useState({ name: '', email: '', password: '' });

  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check user role, redirect non-admins
  useEffect(() => {
    let mounted = true;
    const checkRole = async () => {
      setCheckingRole(true);
      try {
        const res = await api.get('/me'); // backend should return currently logged user info
        if (!mounted) return;
        if (res?.data?.role !== 'admin') {
          // if not admin, redirect to home (or voting)
          navigate('/');
          return;
        }
        setIsAdmin(true);
      } catch (err) {
        // not logged or error -> redirect to login
        console.error('Erro ao verificar role:', err);
        navigate('/login');
      } finally {
        if (mounted) setCheckingRole(false);
      }
    };
    checkRole();
    return () => { mounted = false; };
  }, [navigate]);

  // load data only when isAdmin true
  const load = async () => {
    setLoading(true);
    try {
      const [c1, c2, j] = await Promise.all([
        api.get('/admin/criteria'),
        api.get('/admin/candidates'),
        api.get('/admin/judges')
      ]);
      setCriteria(c1.data || []);
      setCandidates(c2.data || []);
      setJudges(j.data || []);
    } catch (e) {
      console.error(e);
      setMsg({ type: 'error', text: 'Erro ao carregar dados. Verifique se está logado.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  // --- CRITERIA ---
  const addCriterion = async () => {
    const payload = {
      label: newCrit.label,
      type: newCrit.type,
      numericMin: Number(newCrit.numericMin) || 1,
      numericMax: Number(newCrit.numericMax) || 5,
      options: newCrit.type === 'named' ? newCrit.options.split(',').map(s=>s.trim()).filter(Boolean) : [],
      weight: Number(newCrit.weight) || 1
    };
    try {
      await api.post('/admin/criterion', payload);
      setMsg({ type:'success', text:'Critério adicionado' });
      setNewCrit({ label: '', type: 'numeric', numericMin: 1, numericMax: 5, options: '', weight: 1 });
      const res = await api.get('/admin/criteria');
      setCriteria(res.data || []);
    } catch (e) {
      setMsg({ type:'error', text: e.response?.data?.message || 'Erro ao criar critério' });
    }
  };

  const deleteCriterion = async (id) => {
    if (!confirm('Excluir critério? Essa ação removerá os votos relacionados a este critério.')) return;
    try {
      // backend accepts both /admin/criterion/:id and /admin/criteria/:id (we keep singular here)
      await api.delete(`/admin/criterion/${id}`);
      setMsg({ type: 'success', text: 'Critério removido' });
      setCriteria(prev => prev.filter(c => c._id !== id));
    } catch (e) {
      console.error(e);
      setMsg({ type: 'error', text: e.response?.data?.message || 'Erro ao remover critério' });
    }
  };

  // --- CANDIDATES ---
  const addCandidate = async () => {
    try {
      await api.post('/admin/candidate', { number: Number(newCand.number), name: newCand.name || '' });
      setMsg({ type:'success', text:'Candidato adicionado' });
      setNewCand({ number: '', name: '' });
      const res = await api.get('/admin/candidates');
      setCandidates(res.data || []);
    } catch (e) {
      setMsg({ type:'error', text: e.response?.data?.message || 'Erro ao criar candidato' });
    }
  };

  const deleteCandidate = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este candidato? Todos os votos do candidato também serão afetados.')) return;
    try {
      await api.delete(`/admin/candidate/${id}`);
      setMsg({ type: 'success', text: 'Candidato removido' });
      setCandidates(prev => prev.filter(c => c._id !== id));
    } catch (e) {
      console.error(e);
      setMsg({ type: 'error', text: e.response?.data?.message || 'Erro ao remover candidato' });
    }
  };

  // --- JUDGES ---
  const addJudge = async () => {
    if (!newJudge.email || !newJudge.password) {
      setMsg({ type: 'error', text: 'Preencha email e senha do jurado.' });
      return;
    }
    try {
      await api.post('/admin/judge', newJudge);
      setMsg({ type: 'success', text: 'Jurado criado com sucesso' });
      setNewJudge({ name: '', email: '', password: '' });
      const res = await api.get('/admin/judges');
      setJudges(res.data || []);
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Erro ao criar jurado' });
    }
  };

  const removeJudge = async (id) => {
    if(!confirm('Remover jurado? Essa ação é irreversível.')) return;
    try {
      await api.delete(`/admin/judge/${id}`);
      setMsg({ type: 'success', text: 'Jurado removido' });
      setJudges(prev => prev.filter(j => j._id !== id));
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Erro ao remover jurado' });
    }
  };

  // while checking role, show small message (prevents flicker)
  if (checkingRole) {
    return (
      <div style={{ display:'grid', placeItems:'center', minHeight: 240 }}>
        <div className="card" style={{ width: 340, textAlign:'center' }}>
          <div style={{ fontWeight:700, marginBottom:8 }}>Verificando permissões...</div>
          <div className="small">Aguarde um instante.</div>
        </div>
      </div>
    );
  }

  // if not admin, we've already navigated away — but keep safe guard
  if (!isAdmin) return null;

  return (
    <div className="layout">
      <aside className="sidebar card">
        <div style={{ fontWeight:700 }}>Admin Dashboard</div>
        <div className="small" style={{ marginTop:8 }}>Gerencie critérios, candidatos e jurados</div>

        <div className="stat" style={{ marginTop:14 }}>
          <div>
            <div className="small">Critérios</div>
            <div style={{ fontWeight:800, marginTop:6 }}>{criteria.length}</div>
          </div>
          <div>
            <div className="small">Candidatos</div>
            <div style={{ fontWeight:800, marginTop:6 }}>{candidates.length}</div>
          </div>
        </div>

        <div style={{ marginTop:12 }}>
          <div className="small">Dica</div>
          <div className="small" style={{ marginTop:6, color:'var(--muted)' }}>
            Crie jurados com senha segura e compartilhe as credenciais apenas com quem for votar.
          </div>
        </div>
      </aside>

      <main>
        {/* CRITERIA */}
        <div className="card">
          <h3>Adicionar Critério</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 140px', gap:12, marginTop:10 }}>
            <div>
              <div className="form-row">
                <label>Critério</label>
                <input type="text" value={newCrit.label} onChange={e=>setNewCrit({...newCrit, label: e.target.value})} />
              </div>

              <div className="form-row">
                <label>Tipo</label>
                <select value={newCrit.type} onChange={e=>setNewCrit({...newCrit, type: e.target.value})}>
                  <option value="numeric">Numérico</option>
                  <option value="named">Nomeado (opções)</option>
                </select>
              </div>

              {newCrit.type === 'named' ? (
                <div className="form-row">
                  <label>Opções (separadas por vírgula)</label>
                  <input value={newCrit.options} onChange={e=>setNewCrit({...newCrit, options: e.target.value})} />
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div className="form-row">
                    <label>Mínimo</label>
                    <input type="number" value={newCrit.numericMin} onChange={e=>setNewCrit({...newCrit, numericMin: e.target.value})} />
                  </div>
                  <div className="form-row">
                    <label>Máximo</label>
                    <input type="number" value={newCrit.numericMax} onChange={e=>setNewCrit({...newCrit, numericMax: e.target.value})} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="form-row">
                <label>Peso</label>
                <input type="number" value={newCrit.weight} onChange={e=>setNewCrit({...newCrit, weight: e.target.value})} />
              </div>

              <div style={{ display:'flex', gap:8, marginTop:24 }}>
                <button className="btn btn-primary" onClick={addCriterion}>Criar Critério</button>
                <button className="btn btn-ghost" onClick={()=>setNewCrit({ label: '', type: 'numeric', numericMin:1, numericMax:5, options:'', weight:1 })}>Limpar</button>
              </div>
            </div>
          </div>

          {/* list criteria with delete option */}
          <div style={{ marginTop: 14 }}>
            <h4>Critérios</h4>
            {criteria.length === 0 && <div className="small">Nenhum critério</div>}
            {criteria.map(c => (
              <div key={c._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:10, marginTop:8, borderRadius:8, background:'rgba(255,255,255,0.01)', border:'1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ fontWeight:700 }}>{c.label}</div>
                  <div className="small">Tipo: {c.type} · Peso: {c.weight}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-ghost" onClick={()=>deleteCriterion(c._id)}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CANDIDATES */}
        <div className="card" style={{ marginTop: 14 }}>
          <h3>Adicionar Candidato</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:10 }}>
            <div>
              <label>Número</label>
              <input type="number" value={newCand.number} onChange={e=>setNewCand({...newCand, number: e.target.value.replace(/\D/g,'')})} />
            </div>
            <div>
              <label>Nome (opcional)</label>
              <input type="text" value={newCand.name} onChange={e=>setNewCand({...newCand, name: e.target.value})} />
            </div>
          </div>
          <div style={{ marginTop:12, display:'flex', justifyContent:'flex-end', gap:8 }}>
            <button className="btn btn-primary" onClick={addCandidate}>Criar candidato</button>
          </div>

          <div style={{ marginTop:14 }}>
            <h4>Candidatos</h4>
            {candidates.length === 0 && <div className="small">Nenhum candidato</div>}
            {candidates.map(c => (
              <div key={c._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:10, marginTop:8, borderRadius:8, background:'rgba(255,255,255,0.01)', border:'1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ fontWeight:700 }}>#{c.number}{c.name ? ` - ${c.name}` : ''}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-ghost" onClick={()=>{ navigator.clipboard?.writeText(`${c.number}${c.name ? ' - ' + c.name : ''}`); alert('Copiado') }}>Copiar</button>
                  <button className="btn btn-ghost" onClick={()=>deleteCandidate(c._id)}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JUDGES */}
        <div className="card" style={{ marginTop:14 }}>
          <h3>Gerenciar Jurados</h3>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 200px', gap:12 }}>
            <div>
              <label>Nome (opcional)</label>
              <input type="text" value={newJudge.name} onChange={e=>setNewJudge({...newJudge, name: e.target.value})} />
            </div>
            <div>
              <label>Email</label>
              <input type="text" value={newJudge.email} onChange={e=>setNewJudge({...newJudge, email: e.target.value})} />
            </div>
            <div>
              <label>Senha</label>
              <input type="password" value={newJudge.password} onChange={e=>setNewJudge({...newJudge, password: e.target.value})} />
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
            <button className="btn btn-primary" onClick={addJudge}>Criar jurado</button>
          </div>

          <div style={{ marginTop:14 }}>
            <h4>Jurados cadastrados</h4>
            {judges.length === 0 && <div className="small">Nenhum jurado ainda</div>}
            {judges.map(j => (
              <div key={j._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:10, marginTop:8, borderRadius:8, background:'rgba(255,255,255,0.01)', border:'1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ fontWeight:700 }}>{j.name || '(sem nome)'}</div>
                  <div className="small">{j.email}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-ghost" onClick={()=>{ navigator.clipboard?.writeText(`${j.email}`); alert('Email copiado') }}>Copiar email</button>
                  <button className="btn btn-ghost" onClick={()=>removeJudge(j._id)}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {msg && <div className={`msg ${msg.type === 'error' ? 'error' : msg.type === 'success' ? 'success' : 'info'}`} style={{ marginTop:12 }}>{msg.text}</div>}
      </main>
    </div>
  );
}
