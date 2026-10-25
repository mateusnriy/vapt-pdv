import { useState, useEffect } from 'react';
import { LoginPage } from './features/auth/LoginPage';
import { ModoGarcomPage } from './features/garcom/ModoGarcomPage';
import { ModoCaixaPage } from './features/caixa/ModoCaixaPage';
import { useSessionStore } from './stores/useSessionStore';

export function App() {
  const { modo } = useSessionStore();
  const [apiHealth, setApiHealth] = useState<'checking' | 'online' | 'offline'>('checking');

  // Checagem de conectividade com a API Fastify
  useEffect(() => {
    fetch('/health')
      .then((res) => {
        if (res.ok) setApiHealth('online');
        else setApiHealth('offline');
      })
      .catch(() => setApiHealth('offline'));
  }, []);

  if (modo === 'garcom') {
    return <ModoGarcomPage apiHealth={apiHealth} />;
  }

  if (modo === 'caixa') {
    return <ModoCaixaPage apiHealth={apiHealth} />;
  }

  // Padrão: tela de seleção de operador / login
  return <LoginPage />;
}

export default App;
