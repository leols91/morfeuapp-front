// src/app/layout.tsx
import type { Metadata } from "next";
import "./../styles/globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";


export const metadata: Metadata = {
  title: "MorfeuApp",
  description: "PMS para pousadas e hostels",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>  {/* +++ */}
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  className: "text-sm",
                  success: { duration: 3000 },
                  error: { duration: 4000 },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}