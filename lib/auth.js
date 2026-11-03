'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

// session: sesión activa · isEditor: el correo está autorizado en la tabla editors
export function useAuth() {
  const [session, setSession] = useState(null);
  const [isEditor, setIsEditor] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let activo = true;

    async function comprobar(s) {
      if (!s) {
        if (activo) setIsEditor(false);
        return;
      }
      const { data } = await supabase.rpc('is_editor');
      if (activo) setIsEditor(data === true);
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return;
      setSession(data.session);
      await comprobar(data.session);
      if (activo) setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSession(s);
      setTimeout(() => comprobar(s), 0);
    });

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, isEditor, ready };
}
