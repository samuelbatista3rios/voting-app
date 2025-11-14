/* eslint-disable no-unused-vars */
// src/pages/Results.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Results(){
  const [results, setResults] = useState([]);
  const [top3, setTop3] = useState([]);

  useEffect(()=>{
    const load = async () => {
      try {
        const res = await api.get('/results/top');
        setResults(res.data.results || []);
        setTop3(res.data.top3 || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }}>
      <div className="card">
        <h3>Resultados</h3>
        <p className="small">Top 3 baseado na média ponderada dos critérios.</p>

        <div style={{ display:'flex', gap:12, marginTop:12 }}>
          <div style={{ flex:1 }}>
            <h4>Top 3</h4>
            <div className="results-list">
              {top3.map((r, idx) => (
                <div key={r.candidate._id} className="result-row">
                  <div>
                    <div style={{ fontWeight:800 }}>#{r.candidate.number} - {r.candidate.name}</div>
                    <div className="small">votos: {r.votes}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:800, color:'#eaffff' }}>{Number(r.average).toFixed(2)}</div>
                    <div className="small">média</div>
                  </div>
                </div>
              ))}
              {top3.length === 0 && <div className="small">Sem resultados por enquanto.</div>}
            </div>
          </div>

          <div style={{ flex:1 }}>
            <h4>Tabela completa</h4>
            <div className="results-list">
              {results.map(r => (
                <div key={r.candidate._id} className="result-row">
                  <div style={{ fontWeight:700 }}>#{r.candidate.number} - {r.candidate.name}</div>
                  <div style={{ textAlign:'right' }}>{Number(r.average).toFixed(2)}</div>
                </div>
              ))}
              {results.length === 0 && <div className="small">Sem resultados por enquanto.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
