'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AlertBanner from '../components/AlertBanner';
import CadastrarAssistidoForm from '../components/CadastrarAssistidoForm';
import RegistrarAtendimentoForm from '../components/RegistrarAtendimentoForm';
import HistoricoAtendimentos from '../components/HistoricoAtendimentos';
import { api, ApiError } from '../services/api';
import { Assistido, Atendimento, FeedbackMessage } from '../types';
import { IconArrowRight, IconArrowUpRight } from '../components/ui/Icons';

export default function Home() {
  const [assistidos, setAssistidos] = useState<Assistido[]>([]);
  const [alerts, setAlerts] = useState<FeedbackMessage[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [selectedCpfForAtendimento, setSelectedCpfForAtendimento] = useState<string>('');
  const [activeSearchCpf, setActiveSearchCpf] = useState<string>('');

  const addAlert = useCallback((alert: FeedbackMessage) => {
    setAlerts((prev) => [alert, ...prev.slice(0, 4)]); // Mantém os 5 alertas mais recentes
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const checkHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      await api.checkHealth();
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  const carregarAssistidos = useCallback(async () => {
    try {
      const data = await api.listarAssistidos();
      setAssistidos(data);
    } catch (err) {
      // Ignora erro silenciosamente se for durante carga inicial e backend estiver offline
      if (err instanceof ApiError && err.statusCode === 0) {
        setBackendOnline(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      await checkHealth();
      await carregarAssistidos();
    });
    return () => {
      active = false;
    };
  }, [checkHealth, carregarAssistidos]);

  const handleAssistidoCadastrado = (novo: Assistido) => {
    setAssistidos((prev) => {
      if (prev.some((a) => a.cpf === novo.cpf)) return prev;
      return [novo, ...prev];
    });
    // Pré-seleciona para facilitar o fluxo de atendimento
    setSelectedCpfForAtendimento(novo.cpf);
    setActiveSearchCpf(novo.cpf);
  };

  const handleAtendimentoRegistrado = (novoAtendimento: Atendimento) => {
    // Atualiza a visualização do histórico caso o assistido em tela seja o mesmo
    setActiveSearchCpf(novoAtendimento.assistido_cpf);
  };

  const etapas = [
    { id: 'cadastrar', index: '01', label: 'Cadastrar', desc: 'Novo assistido' },
    { id: 'registrar', index: '02', label: 'Registrar', desc: 'Atendimento' },
    { id: 'historico', index: '03', label: 'Consultar', desc: 'Histórico por CPF' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100">
      <Navbar
        backendOnline={backendOnline}
        onRefreshHealth={checkHealth}
        isChecking={isCheckingHealth}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Painel de resumo / Guia rápido */}
        <section
          aria-label="Resumo operacional"
          className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 mb-8"
        >
          <div className="flex justify-center">
            <span className="bg-zinc-900 text-white rounded-full px-6 py-1.5 text-xs font-semibold uppercase tracking-widest">
              Desafio EDA
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-6">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Atendimentos e reações do sistema
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
                Painel Operacional de Atendimentos
              </h2>
            </div>

            {/* Indicadores em blocos squircle */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-300 bg-white px-4 py-3">
                <span className="block text-[11px] uppercase tracking-wider text-zinc-500">
                  Total Assistidos
                </span>
                <span className="block mt-1 text-2xl font-semibold font-mono tabular-nums text-zinc-900">
                  {String(assistidos.length).padStart(2, '0')}
                </span>
              </div>
              <div
                className={`rounded-2xl border px-4 py-3 transition-colors ${
                  backendOnline
                    ? 'bg-zinc-900 border-zinc-900 text-white'
                    : 'bg-zinc-50 border-2 border-zinc-900 text-zinc-900'
                }`}
              >
                <span
                  className={`block text-[11px] uppercase tracking-wider ${
                    backendOnline ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  Status API
                </span>
                <span className="block mt-1 text-lg font-semibold font-mono tabular-nums">
                  {backendOnline ? 'Ativo (8000)' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Navegação por etapas em blocos squircle */}
          <nav aria-label="Etapas do fluxo" className="mt-6 pt-6 border-t border-zinc-200">
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {etapas.map((etapa) => (
                <li key={etapa.id}>
                  <a
                    href={`#${etapa.id}`}
                    className="group flex items-center gap-3 rounded-2xl border border-zinc-300 bg-white px-4 py-3 hover:bg-zinc-900 hover:border-zinc-900 transition-colors"
                  >
                    <span className="flex items-center justify-center h-8 w-8 rounded-xl border border-zinc-300 text-xs font-mono tabular-nums text-zinc-900 group-hover:border-zinc-700 group-hover:text-white transition-colors">
                      {etapa.index}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-zinc-900 group-hover:text-white transition-colors">
                        {etapa.label}
                      </span>
                      <span className="block text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        {etapa.desc}
                      </span>
                    </span>
                    <IconArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        {/* Notificações em Destaque para a Apresentação */}
        <AlertBanner
          alerts={alerts}
          onDismiss={dismissAlert}
          onClearAll={clearAllAlerts}
        />

        {/* Grade Operacional: 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Bloco 1 (Cadastrar) e Bloco 2 (Registrar Atendimento) */}
          <div className="lg:col-span-5 space-y-6">
            <CadastrarAssistidoForm
              onAssistidoCadastrado={handleAssistidoCadastrado}
              onAlert={addAlert}
              assistidosExistentes={assistidos}
            />

            <RegistrarAtendimentoForm
              assistidos={assistidos}
              onAtendimentoRegistrado={handleAtendimentoRegistrado}
              onAlert={addAlert}
              selectedCpf={selectedCpfForAtendimento}
            />
          </div>

          {/* Coluna Direita: Bloco 3 (Consulta e Linha do Tempo de Atendimentos) */}
          <div className="lg:col-span-7">
            <HistoricoAtendimentos
              assistidos={assistidos}
              onAlert={addAlert}
              onSelectCpfForAtendimento={(cpf) => setSelectedCpfForAtendimento(cpf)}
              externalCpfSearch={activeSearchCpf}
            />
          </div>
        </div>
      </main>

      {/* Rodapé institucional */}
      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6 mt-6">
        <div className="border-t border-zinc-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© Defensoria Pública — Projeto EST-2 Atendimentos. Desafio EDA.</p>
          <div className="flex items-center gap-2">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3.5 py-1.5 font-medium text-zinc-900 hover:border-zinc-900 transition-colors"
            >
              Swagger API Docs
              <IconArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="http://localhost:8000/redoc"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3.5 py-1.5 font-medium text-zinc-900 hover:border-zinc-900 transition-colors"
            >
              ReDoc
              <IconArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
