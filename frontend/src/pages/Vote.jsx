/* eslint-disable no-unused-vars */
// src/pages/Vote.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Vote() {
  const [candidateNumber, setCandidateNumber] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [answers, setAnswers] = useState({});
  const [msg, setMsg] = useState(null);
  const [loadingCriteria, setLoadingCriteria] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingCriteria(true);
      try {
        const res = await api.get('/public/criteria');
        setCriteria(res.data || []);
      } catch (e) {
        console.error('Erro carregando critérios:', e);
        setMsg({ type: 'error', text: 'Erro ao carregar critérios. Tente novamente.' });
      } finally {
        setLoadingCriteria(false);
      }
    };
    load();
  }, []);

  const clamp = (value, min, max) => {
    if (value === '' || value === null || value === undefined) return '';
    const n = Number(value);
    if (Number.isNaN(n)) return '';
    if (min !== undefined && n < min) return min;
    if (max !== undefined && n > max) return max;
    return n;
  };

  const handleChange = (criterionId, rawVal, type, criterion) => {
    if (type === 'numeric') {
      const min = (criterion?.numericMin !== undefined && criterion.numericMin !== null) ? criterion.numericMin : 1;
      const max = (criterion?.numericMax !== undefined && criterion.numericMax !== null) ? criterion.numericMax : 5;
      const val = clamp(rawVal, min, max);
      setAnswers(prev => ({ ...prev, [criterionId]: val }));
    } else {
      setAnswers(prev => ({ ...prev, [criterionId]: rawVal }));
    }
  };

  const validateAllAnswered = () => {
    for (const c of criteria) {
      const v = answers[c._id];
      if (v === undefined || v === '' || v === null) return false;
      if (c.type === 'numeric') {
        const n = Number(v);
        if (Number.isNaN(n)) return false;
        const min = (c.numericMin !== undefined && c.numericMin !== null) ? c.numericMin : 1;
        const max = (c.numericMax !== undefined && c.numericMax !== null) ? c.numericMax : 5;
        if (n < min || n > max) return false;
      }
    }
    return true;
  };

  const clearForm = () => {
    setCandidateNumber('');
    setAnswers({});
    setMsg(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!candidateNumber) return setMsg({ type: 'error', text: 'Informe o número do candidato.' });
    if (criteria.length > 0 && !validateAllAnswered()) return setMsg({ type: 'error', text: 'Responda todos os critérios e confira os valores.' });

    const body = {
      candidateNumber: Number(candidateNumber),
      answers: Object.entries(answers).map(([criterion, value]) => ({ criterionId: criterion, value }))
    };

    setSubmitting(true);
    try {
      await api.post('/vote', body);
      setMsg({ type: 'success', text: 'Voto registrado com sucesso 🎉' });
      setAnswers({});
      setCandidateNumber('');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setMsg({ type: 'error', text: 'Você precisa entrar (login) para registrar votos. Peça ao admin ou faça login.' });
      } else if (err.response?.data?.message) {
        setMsg({ type: 'error', text: err.response.data.message });
      } else {
        setMsg({ type: 'error', text: 'Erro ao votar. Tente novamente.' });
      }
      console.error('Erro ao enviar voto:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="layout" style={{ alignItems: 'start' }}>
      <aside className="sidebar card">
        <div style={{ fontWeight:700 }}>Votação</div>
        <div className="small" style={{ marginTop:8 }}>Preencha as notas com atenção</div>

        <div className="stat" style={{ marginTop:14 }}>
          <div>
            <div className="small">Critérios</div>
            <div style={{ fontWeight:800, marginTop:6 }}>{criteria.length}</div>
          </div>
          <div>
            <div className="small">Status</div>
            <div style={{ fontWeight:800, marginTop:6 }}>Aberto</div>
          </div>
        </div>

        <div style={{ marginTop:12 }}>
          <div className="small">Dica</div>
          <div className="small" style={{ marginTop:6, color:'var(--muted)' }}>
            Confirme o número do candidato antes de enviar. Voto é único por jurado/candidato.
          </div>
        </div>
      </aside>

      <main>
        <div className="card">
          <h3>Registrar Voto</h3>

          <form onSubmit={submit} style={{ marginTop:12 }}>
            <div className="form-row" style={{ display:'flex', gap:12 }} >
              <div style={{ width: 160 }} >
                <label >Número do candidato</label>
                <input type="text" value={candidateNumber} placeholder="ex: 12" onChange={e=>setCandidateNumber(e.target.value.replace(/\D/g,'').slice(0,4))} />
              </div>

              <div style={{ flex:1 }}>
                <label>Resumo</label>
                <div style={{ padding:10, borderRadius:8, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ fontWeight:700 }}>{candidateNumber ? `#${candidateNumber}` : '— nenhum —'}</div>
                  <div className="small" style={{ marginTop:6 }}>Preencha os critérios abaixo</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop:14 }} className="criteria-grid">
              {criteria.map(c => {
                const min = (c.numericMin !== undefined && c.numericMin !== null) ? c.numericMin : 1;
                const max = (c.numericMax !== undefined && c.numericMax !== null) ? c.numericMax : 5;
                return (
                  <div className="criteria-card" key={c._id}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ fontWeight:700 }}>{c.label}</div>
                      <div className="small">{c.type === 'numeric' ? `${min}–${max}` : 'opções'}</div>
                    </div>

                    {c.type === 'numeric' ? (
                      <input
                        type="number"
                        min={min}
                        max={max}
                        step="1"
                        value={answers[c._id] ?? ''}
                        onChange={e=>handleChange(c._id, e.target.value, 'numeric', c)}
                        onBlur={e => {
                          // enforce clamp on blur as well
                          const clamped = clamp(e.target.value, min, max);
                          setAnswers(prev => ({ ...prev, [c._id]: clamped }));
                        }}
                      />
                    ) : (
                      <select value={answers[c._id] ?? ''} onChange={e=>handleChange(c._id, e.target.value, 'named')}>
                        <option value="">-- escolha --</option>
                        {(c.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}

                    <div className="small" style={{ marginTop:8 }}>Peso: {c.weight ?? 1} · Tipo: {c.type}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
              <button type="button" className="btn btn-ghost" onClick={clearForm} disabled={submitting}>Limpar</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar voto'}
              </button>
            </div>

            {msg && <div className={`msg ${msg.type === 'error' ? 'error' : msg.type === 'success' ? 'success' : 'info'}`} style={{ marginTop:12 }}>{msg.text}</div>}
            <div className="small" style={{ marginTop:10 }}>Sua ação é registrada com carimbo de tempo.</div>
          </form>
        </div>
      </main>
    </div>
  );
}
