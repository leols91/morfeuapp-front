"use client";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/form/Field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const schema = z.object({
  username: z.string().min(3, "Informe o usuário"),
  password: z.string().min(3, "Informe a senha"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: FormData) {
    setError(null);
    try {
      await login(values.username, values.password);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Falha no login. Verifique suas credenciais.";
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-full max-w-md p-6 rounded-2xl border border-gray-200 shadow-soft bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-1">Entrar</h1>
        <p className="text-sm text-gray-500 mb-6">Acesse o MorfeuApp</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm">Usuário</label>
            <Input placeholder="seu_usuario" {...register("username")} />
            {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="text-sm">Senha</label>
            <Input type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <div className="mt-4 text-xs text-gray-500">
          <p>Precisa de acesso? Fale com o administrador.</p>
        </div>
      </div>
    </div>
  );
}
