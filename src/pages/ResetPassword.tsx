import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Brain, Lock, Loader2 } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase sends the recovery token in the URL hash and triggers PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });

    // Also check existing session in case the event already fired
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { password?: string; confirm?: string } = {};

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) newErrors.password = parsed.error.errors[0].message;
    if (password !== confirmPassword) newErrors.confirm = 'As senhas não coincidem';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({
          title: 'Erro ao redefinir',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Senha redefinida!',
          description: 'Sua senha foi atualizada com sucesso.',
        });
        await supabase.auth.signOut();
        navigate('/auth');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-black text-foreground">PsiGestão</span>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-black text-foreground">Redefinir senha</h2>
          <p className="mt-2 text-muted-foreground">Escolha uma nova senha para sua conta.</p>
        </div>

        {!ready ? (
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Validando link de redefinição...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-semibold">Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-12 h-12 rounded-xl border-border bg-muted/50"
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-foreground font-semibold">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-12 h-12 rounded-xl border-border bg-muted/50"
                />
              </div>
              {errors.confirm && <p className="text-sm text-destructive">{errors.confirm}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold text-base">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Redefinir senha'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
