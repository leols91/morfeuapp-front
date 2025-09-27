"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

type Pousada = { id: string; name: string };

type User = {
  id: string;
  name: string;
  username: string;
  pousadas?: Pousada[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

function setActivePousada(pousadas?: Pousada[]) {
  if (typeof window === "undefined") return;
  if (!pousadas || pousadas.length === 0) return;
  const current = window.localStorage.getItem("mrf.pousada");
  const exists = pousadas.find((p) => p.id === current);
  const chosen = exists?.id ?? pousadas[0].id;
  window.localStorage.setItem("mrf.pousada", chosen);
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("mrf.token") : null;
        if (!token) {
          setLoading(false);
          if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/reservas")) {
            router.replace("/login");
          }
          return;
        }
        const res = await api.get("/users/me");
        const u = res.data.user ?? res.data;
        setUser(u);
        setActivePousada(u.pousadas);
      } catch {
        localStorage.removeItem("mrf.token");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(username: string, password: string) {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem("mrf.token", data.token);
    const me = await api.get("/users/me");
    const u = me.data.user ?? me.data;
    setUser(u);
    setActivePousada(u.pousadas);
    router.replace("/dashboard");
  }

  function logout() {
    localStorage.removeItem("mrf.token");
    setUser(null);
    router.replace("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
