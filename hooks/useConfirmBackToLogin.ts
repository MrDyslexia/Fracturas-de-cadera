'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useConfirmBackToLogin(onConfirm?: () => void) {
  const router = useRouter();

  useEffect(() => {
    // Inserta un estado "bloqueo" en el historial
    try {
      history.pushState({ _block: true }, '', location.href);
    } catch (_) {
      /* no-op */
    }

    const onPopState = () => {
      const ok = window.confirm('¿Seguro que quieres salir y volver al login?');
      if (ok) {
        // Evita que el handler vuelva a dispararse durante la navegación
        window.removeEventListener('popstate', onPopState);

        // Cierra sesión si corresponde
        try { onConfirm?.(); } catch {}

        // Intenta navegación SPA…
        try { router.replace('/login'); } catch {}

        // …y como fallback (más confiable dentro de popstate) usa redirección dura
        setTimeout(() => {
          if (location.pathname !== '/login') {
            window.location.assign('/login');
          }
        }, 0);
      } else {
        // Reinyecta el estado para seguir bloqueando el back
        try {
          history.pushState({ _block: true }, '', location.href);
        } catch {}
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [router, onConfirm]);
}
