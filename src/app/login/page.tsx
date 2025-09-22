"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Lock, Loader2, Sun, Moon, Hotel } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation'; // Importe o useRouter

// --- Esquema de Validação com Zod ---
const loginSchema = z.object({
  username: z.string().min(3, { message: "Usuário deve ter no mínimo 3 caracteres." }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// --- Componente da Tela de Login ---
export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter(); // Instancie o router

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Simulação de chamada de API
      // Futuramente: const response = await authService.login(data);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulação de erro da API para teste
      if (data.password === 'senhaerrada') {
        throw new Error("Usuário ou senha inválidos.");
      }

      // Em caso de sucesso, salvar o token e redirecionar
      // localStorage.setItem('authToken', response.token);
      router.push('/dashboard'); // Redireciona para a página de dashboard

    } catch (apiError: any) {
      setError(apiError.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* Coluna da Esquerda (Branding) - Visível apenas em telas grandes */}
      <div className="hidden bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center p-12 text-primary-foreground">
        <div className="text-center">
            <Hotel size={64} className="mx-auto mb-6" />
            <h1 className="text-4xl font-bold">MorfeuApp</h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              A plataforma completa para gestão de pousadas e hostels. Simplifique sua operação e maximize seus resultados.
            </p>
        </div>
        <div className="absolute bottom-8 text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} MorfeuApp. Todos os direitos reservados.
        </div>
      </div>

      {/* Coluna da Direita (Formulário) */}
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-secondary hover:bg-muted text-muted-foreground"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>

        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <Hotel size={48} className="mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">MorfeuApp</h1>
          </div>

          <div className="bg-card p-6 sm:p-8 rounded-lg shadow-sm border border-border">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground">Acessar Painel</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-6">Use suas credenciais para entrar.</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Campo de Usuário */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1.5">Usuário</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="username"
                    type="text"
                    placeholder="ex: leoadmin"
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-md bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    {...form.register('username')}
                    disabled={isSubmitting}
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive mt-1.5">{form.formState.errors.username.message}</p>
                )}
              </div>

              {/* Campo de Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-md bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    {...form.register('password')}
                    disabled={isSubmitting}
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1.5">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Mensagem de Erro da API */}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md text-center font-medium">
                  {error}
                </div>
              )}
              
              {/* Botão de Enviar */}
              <button
                type="submit"
                className="w-full flex items-center justify-center py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6 lg:hidden">
            © {new Date().getFullYear()} MorfeuApp. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

