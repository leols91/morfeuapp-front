export const login = async (username: string, password: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error('Usuário ou senha inválidos.')
    }

    const data = await response.json()

    localStorage.setItem('morfeu-token', data.token)
    localStorage.setItem('userId', data.id)

    return { success: true }
  } catch (error) {
    console.error('[LOGIN ERROR]', error)
    return { success: false, message: (error as Error).message }
  }
}