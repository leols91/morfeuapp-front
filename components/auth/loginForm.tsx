'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) throw new Error('Usuário ou senha inválidos.')

      const data = await response.json()
      Cookies.set('token', data.token, { expires: 1 })
      localStorage.setItem('userId', data.id)
      router.push('/')
    } catch (err) {
      setError((err as Error).message || 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm text-white font-medium">Usuário</label>
      <input
        className="w-full px-4 py-3 rounded-2xl bg-reabilis-input text-white placeholder-white/70 border border-reabilis-input-border focus:outline-none focus:ring-2 focus:ring-reabilis-purple transition duration-300"
        type="text"
        placeholder="Digite seu usuário"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />

      <label className="text-sm text-white font-medium">Senha</label>
      <input
        className="w-full px-4 py-3 rounded-2xl bg-reabilis-input text-white placeholder-white/70 border border-reabilis-input-border focus:outline-none focus:ring-2 focus:ring-reabilis-purple transition duration-300"
        type="password"
        placeholder="Digite sua senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      <div className="text-right text-sm text-white/70 hover:underline cursor-pointer">
        Esqueceu a senha?
      </div>

      <button
        type="submit"
        className="bg-reabilis-purple hover:bg-reabilis-purple-hover text-white font-semibold py-3 rounded-2xl transition duration-300"
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}

export default LoginForm