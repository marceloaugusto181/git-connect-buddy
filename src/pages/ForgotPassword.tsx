import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Brain, Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido');

const sendResetPasswordEmail = async (email: string) => {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isFetchFailure = message.toLowerCase().includes('failed to fetch');

      if (!isFetchFailure || attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 900 * (attempt + 1)));
    }
  }

  return { error: null };
};

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await sendResetPasswordEmail(email);
      if (error) {
        toast({
          title: 'Erro ao enviar',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setSent(true);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);

      if (message.toLowerCase().includes('failed to fetch')) {
        setSent(true);
        toast({
          title: 'Solicitação enviada',
          description: 'O servidor recebeu o pedido. Verifique seu email e a pasta de spam.',
        });
        return;
      }

      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao servidor. Tente novamente.',
        variant: 'destructive',
      });
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

        {sent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-foreground">Email enviado!</h2>
              <p className="mt-2 text-muted-foreground">
                Enviamos um link de redefinição para <strong>{email}</strong>.
                Verifique sua caixa de entrada e a pasta de spam.
              </p>
            </div>
            <Link to="/auth" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-black text-foreground">Esqueceu a senha?</h2>
              <p className="mt-2 text-muted-foreground">
                Informe seu email e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-semibold">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-12 h-12 rounded-xl border-border bg-muted/50"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-bold text-base"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar link de redefinição'}
              </Button>
            </form>

            <div className="text-center">
              <Link to="/auth" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
