import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchWithRetry = async <T,>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === maxRetries) throw e;
      await new Promise(r => setTimeout(r, baseDelay * (attempt + 1)));
    }
  }
  throw new Error('Erro inesperado');
};

type PasswordTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
  message?: string;
};

const isNetworkError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('Load failed');
};

const signInWithXhrFallback = (email: string, password: string): Promise<PasswordTokenResponse> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${supabaseUrl}/auth/v1/token?grant_type=password`, true);
    xhr.timeout = 15000;
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.setRequestHeader('apikey', supabaseKey);
    xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`);
    xhr.setRequestHeader('x-client-info', 'psigestao-auth-fallback');
    xhr.setRequestHeader('x-supabase-api-version', '2024-01-01');

    xhr.onload = () => {
      let payload: PasswordTokenResponse = {};
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        payload = { message: 'Resposta inválida do servidor de autenticação.' };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload);
      } else {
        reject(new Error(payload.message || payload.error_description || payload.error || 'Erro no login'));
      }
    };

    xhr.onerror = () => reject(new Error('Failed to fetch'));
    xhr.ontimeout = () => reject(new Error('Tempo esgotado ao conectar ao servidor.'));
    xhr.send(JSON.stringify({ email, password, gotrue_meta_security: {} }));
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await fetchWithRetry(() =>
        supabase.auth.signInWithPassword({ email, password })
      );
      return { error: error as Error | null };
    } catch (e) {
      if (isNetworkError(e)) {
        try {
          const tokenResponse = await signInWithXhrFallback(email, password);
          if (!tokenResponse.access_token || !tokenResponse.refresh_token) {
            throw new Error(tokenResponse.message || 'Resposta inválida do servidor de autenticação.');
          }

          const { error } = await supabase.auth.setSession({
            access_token: tokenResponse.access_token,
            refresh_token: tokenResponse.refresh_token,
          });

          return { error: error as Error | null };
        } catch (fallbackError) {
          return { error: fallbackError as Error };
        }
      }

      return {
        error: new Error(
          'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.'
        ),
      };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    try {
      const { error } = await fetchWithRetry(() =>
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        })
      );
      return { error: error as Error | null };
    } catch (e) {
      console.error('SignUp error after retries:', e);
      return {
        error: new Error(
          'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.'
        ),
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
