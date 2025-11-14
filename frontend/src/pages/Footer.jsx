/* eslint-disable no-unused-vars */
// src/pages/Footer.jsx
import React, { useEffect, useRef } from 'react';

export default function Footer({ stickyOnMobile = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const applyPadding = () => {
      const isMobile = window.matchMedia('(max-width: 760px)').matches;
      const frame = document.querySelector('.app-frame');
      if (!frame) return;

      if (stickyOnMobile && isMobile) {
        // mede altura do footer e aplica padding bottom no frame para não cobrir conteúdo
        const h = Math.ceil(el.getBoundingClientRect().height);
        // reserva + 12px espaço extra
        frame.style.paddingBottom = `${h + 16}px`;
      } else {
        // remove padding quando não for mobile ou sticky desligado
        frame.style.paddingBottom = '';
      }
    };

    // aplica inicialmente
    applyPadding();

    // atualiza quando a janela redimensionar (ex: rotacionar celular)
    window.addEventListener('resize', applyPadding);

    // também observa mudanças no conteúdo do footer que mudem a height
    let ro;
    try {
      ro = new ResizeObserver(applyPadding);
      ro.observe(el);
    } catch (e) {
      // ResizeObserver pode não estar disponível em todos os browsers - ok
    }

    return () => {
      window.removeEventListener('resize', applyPadding);
      if (ro) ro.disconnect();
      // limpa padding ao desmontar
      const frame = document.querySelector('.app-frame');
      if (frame) frame.style.paddingBottom = '';
    };
  }, [stickyOnMobile]);

  // estilo inline simples — usa a classe sticky-mobile para controles CSS adicionais
  const isStickyNow = stickyOnMobile && window.matchMedia && window.matchMedia('(max-width: 760px)').matches;

  return (
    <footer
      ref={ref}
      className={`app-footer ${isStickyNow ? 'sticky-mobile' : ''}`}
      style={{
        background: '#0f172a',
        borderTop: '1px solid #1e293b',
        padding: '14px 12px',
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '0.9rem',
        color: '#cbd5e1',
        position: isStickyNow ? 'fixed' : 'static',
        left: isStickyNow ? '12px' : 'auto',
        right: isStickyNow ? '12px' : 'auto',
        bottom: isStickyNow ? '12px' : 'auto',
        borderRadius: isStickyNow ? '12px' : 0,
        boxShadow: isStickyNow ? '0 10px 30px rgba(0,0,0,0.4)' : 'none',
        maxWidth: isStickyNow ? 'calc(100% - 24px)' : '100%',
        backdropFilter: isStickyNow ? 'blur(6px)' : 'none',
        zIndex: isStickyNow ? 100 : 'auto',
      }}
    >
      <div className="footer-inner" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="footer-left" style={{ textAlign: 'left', minWidth: 0 }}>
          <div className="footer-title" style={{ fontWeight: 700, color: '#e6f0f6' }}>Votação de Projetos</div>
          <div className="footer-sub small" style={{ color: 'var(--muted)' }}>
            © {new Date().getFullYear()} — Desenvolvido por <strong>Samuel</strong>
          </div>
        </div>

        <div className="footer-center hide-mobile" style={{ textAlign: 'center', flex: '1 1 auto' }}>
          <div className="small" style={{ color: 'var(--muted)' }}>Feito com ♥︎ · <span className="small">v1.0</span></div>
        </div>

        <div className="footer-right" style={{ textAlign: 'right', minWidth: 0 }}>
          <div className="small" style={{ color: 'var(--muted)' }}>Contato</div>
          <div className="footer-links" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
            <a className="footer-link" href="mailto:suporte@votacao.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              suporte@votacao.com
            </a>
            <a className="footer-icon" href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.02)', color: 'var(--accent)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 .5C5.7.5.9 5.3.9 11.6c0 4.6 2.9 8.5 6.9 9.9.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1-1.4-1-1.4-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.8.1-.6.3-1 .5-1.2-2.2-.3-4.4-1.1-4.4-4.9 0-1.1.4-2 .9-2.7-.1-.3-.4-1.4.1-2.9 0 0 .7-.2 2.3.9.7-.2 1.5-.3 2.3-.3s1.6.1 2.3.3c1.6-1.1 2.3-.9 2.3-.9.5 1.5.2 2.6.1 2.9.6.7.9 1.6.9 2.7 0 3.8-2.2 4.6-4.4 4.9.3.2.6.7.6 1.5v2.2c0 .3.2.6.7.5 4-1.4 6.9-5.3 6.9-9.9C23.1 5.3 18.3.5 12 .5z" fill="currentColor"/>
              </svg>
            </a>
            <a className="footer-icon" href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.02)', color: 'var(--accent)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.24 8.5h4.5V24h-4.5zM8.24 8.5h4.3v2.08h.06c.6-1.12 2.06-2.3 4.25-2.3 4.55 0 5.39 2.99 5.39 6.88V24h-4.5v-7.2c0-1.72-.03-3.92-2.39-3.92-2.39 0-2.76 1.86-2.76 3.79V24h-4.5z" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
