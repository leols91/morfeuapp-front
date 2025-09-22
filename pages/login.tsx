import React from 'react'
import Image from 'next/image'
import LoginForm from '@/components/auth/LoginForm'
import illustration from '@/assets/images/login.png'

const LoginPage = () => {
  return (
    <section className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-reabilis-gray text-white">
      
      {/* Coluna Esquerda (visível apenas em telas grandes) */}
      <div className="hidden lg:flex justify-center items-center p-6">
        <div className="bg-reabilis-purple rounded-3xl p-10 h-full w-full flex items-center justify-center">
          <div className="max-w-md text-white">
            <Image
              src={illustration}
              alt="Dashboard illustration"
              className="rounded-lg mb-6 w-full h-auto"
              priority
            />
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              A forma mais fácil de gerenciar sua clínica!
            </h2>
            <p className="text-sm lg:text-base text-white/80">
              O sistema Reabilis proporciona controle geral sobre sua clínica ou lar terapêutico, de forma segura e eficiente. Que bom ter você conosco!
            </p>
          </div>
        </div>
      </div>

      {/* Coluna Direita */}
      <div className="flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Bem-vindo!</h1>
            <p className="text-sm text-gray-400 mt-2">
              Insira suas credenciais para acessar o sistema.
            </p>
          </div>
          <LoginForm />
          <p className="mt-6 text-xs text-center text-gray-500">
            Não tem uma conta?{' '}
            <a href="#" className="text-reabilis-purple underline">Fale com a administração</a>
          </p>
        </div>
      </div>
    </section>
  )
}

export default LoginPage