'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AlertBanner from '../components/AlertBanner';
import CadastrarAssistidoForm from '../components/CadastrarAssistidoForm';
import RegistrarAtendimentoForm from '../components/RegistrarAtendimentoForm';
import HistoricoAtendimentos from '../components/HistoricoAtendimentos';
import { api, ApiError } from '../services/api';
import { Assistido, Atendimento, FeedbackMessage } from '../types';

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar
        backendOnline={backendOnline}
        onRefreshHealth={checkHealth}
        isChecking={isCheckingHealth}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Demonstração / Guia Rápido */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 mb-8 shadow-sm border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded">
                  Desafio EST-2
                </span>
                <span className="text-xs text-slate-300">Ambiente de Demonstração Interativo</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Painel Operacional de Atendimentos
              </h2>
              </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <div className="bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700/80">
                <span className="text-slate-400 block font-semibold">Total Assistidos</span>
                <span className="text-lg font-bold text-white">{assistidos.length}</span>
              </div>
              <div className="bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700/80">
                <span className="text-slate-400 block font-semibold">Status API</span>
                <span className={`text-sm font-bold ${backendOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {backendOnline ? 'Ativo (8000)' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-[10px]">1</span>
              <span><strong>Bloco 1:</strong> Cadastrar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">2</span>
              <span><strong>Bloco 2:</strong> Registrar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">3</span>
              <span><strong>Bloco 3:</strong> Consultar Histórico</span>
            </div>
          </div>
        </div>

        {/* Notificações em Destaque para a Apresentação */}
        <AlertBanner
          alerts={alerts}
          onDismiss={dismissAlert}
          onClearAll={clearAllAlerts}
        />

        {/* Grade Operacional: 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© Defensoria Pública - Projeto EST-2 Atendimentos. Desafio EAD.</p>
          <div className="flex items-center gap-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Swagger API Docs ↗
            </a>
            <a
              href="http://localhost:8000/redoc"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              ReDoc ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
