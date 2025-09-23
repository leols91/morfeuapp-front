'use client';
import React, { useEffect, useState } from 'react';
import { getMe } from '@/services/usersService'; // Usando nosso novo service

interface HeaderProps {
  titlePage: string;
}

const Header: React.FC<HeaderProps> = ({ titlePage }) => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await getMe();
        // O nome do usuário vem dentro de um objeto 'user' na nossa API
        setUserName(response.user?.name || 'Usuário');
      } catch {
        setUserName('Usuário'); // Fallback em caso de erro
      }
    };
    fetchUserName();
  }, []);

  return (
    <div
      className="
        sticky top-0 z-40
        bg-card/80 dark:bg-card/80 backdrop-blur
        text-foreground
        px-4 sm:px-6 py-3
        border-b border-border
        flex items-center justify-between
      "
      role="banner"
    >
      <h1 className="text-lg font-semibold truncate">{titlePage}</h1>
      <p className="text-sm">Olá, {userName}</p>
    </div>
  );
};

export default Header;
