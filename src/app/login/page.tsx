"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Lock, Loader2, Sun, Moon, Hotel } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Esquema de Validação com Zod ---
const loginSchema = z.object({
  username: z.string().min(3, { message: "Usuário deve ter no mínimo 3 caracteres." }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;


// --- Componente do Formulário de Login ---
const LoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (data.password === 'senhaerrada') {
        throw new Error("Usuário ou senha inválidos.");
      }
      // Em caso de sucesso:
      // const response = await authService.login(data);
      // localStorage.setItem('authToken', response.token);
      router.push('/dashboard');
    } catch (apiError: any) {
      setError(apiError.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">Usuário</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="username"
            type="text"
            placeholder="Digite seu usuário"
            className="w-full pl-12 pr-4 py-3 border border-border bg-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-shadow"
            {...form.register('username')}
            disabled={isSubmitting}
          />
        </div>
        {form.formState.errors.username && (
          <p className="text-sm text-destructive mt-1.5">{form.formState.errors.username.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">Senha</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            className="w-full pl-12 pr-4 py-3 border border-border bg-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-shadow"
            {...form.register('password')}
            disabled={isSubmitting}
          />
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive mt-1.5">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="text-right">
        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Esqueceu a senha?
        </a>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md text-center font-medium">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        className="w-full flex items-center justify-center py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
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
  )
}


// --- Componente da Página de Login ---
export default function LoginPage() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* Coluna da Esquerda (Branding) */}
      <div className="hidden bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center p-12 text-primary-foreground">
        <div className="absolute top-6 left-6">
          <div className="flex items-center gap-3 text-2xl font-semibold">
            <Hotel size={32} />
            <span>MorfeuApp</span>
          </div>
        </div>
        <div className="text-center max-w-md">
            {/* Placeholder para uma imagem ilustrativa, como no seu exemplo */}
            <div className="bg-primary-foreground/10 p-4 rounded-lg mb-8">
                <Image
                    src="https://placehold.co/400x250/ffffff/94a3b8?text=Dashboard+Preview"
                    alt="Dashboard Preview"
                    width={400}
                    height={250}
                    className="rounded-md"
                    priority
                />
            </div>
            <h1 className="text-4xl font-bold leading-tight">Gestão simplificada, resultados ampliados.</h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              A plataforma completa para pousadas e hostels que buscam eficiência e controle total.
            </p>
        </div>
      </div>

      {/* Coluna da Direita (Formulário) */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 relative">
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-secondary hover:bg-muted text-muted-foreground transition-colors"
            aria-label="Mudar tema"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 top-2 left-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>
        
        <div className="w-full max-w-sm">
          <div className="text-left mb-8">
            <h2 className="text-3xl font-bold text-foreground">Bem-vindo!</h2>
            <p className="text-sm text-muted-foreground mt-2">Insira suas credenciais para acessar o sistema.</p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <a href="#" className="font-semibold text-primary hover:underline">
              Fale com a administração
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

