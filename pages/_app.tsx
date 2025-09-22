// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import DefaultLayout from '@/layouts/DefaultLayout'
import { ThemeColorProvider } from '@/contexts/ThemeColorContext'
import { UserThemeProvider } from '@/contexts/UserThemeContext'

const noLayoutPages = ['/login']

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const isNoLayoutPage = noLayoutPages.includes(router.pathname)

  const Layout: React.FC<{ children: React.ReactNode }> = isNoLayoutPage
    ? ({ children }) => <>{children}</>
    : DefaultLayout

  return (
    <UserThemeProvider>
      <ThemeColorProvider> {/* ✅ Inclui tudo dentro */}
        <Head>
          <title>Sistema Reabilis</title>
          <meta name="description" content="Sistema Reabilis" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeColorProvider>
    </UserThemeProvider>
  )
}

export default App