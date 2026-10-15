'use client';

import React, { useState } from 'react';
import { api, ApiError } from '../services/api';
import { Assistido, Atendimento, FeedbackMessage } from '../types';

interface HistoricoAtendimentosProps {
  assistidos: Assistido[];
  onAlert: (alert: FeedbackMessage) => void;
  onSelectCpfForAtendimento?: (cpf: string) => void;
  externalCpfSearch?: string;
}

export default function HistoricoAtendimentos({
  assistidos,
  onAlert,
  onSelectCpfForAtendimento,
  externalCpfSearch,
}: HistoricoAtendimentosProps) {
  const [cpfBusca, setCpfBusca] = useState(externalCpfSearch || '');
  const [assistidoAtual, setAssistidoAtual] = useState<Assistido | null>(null);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscouPeloMenosUmaVez, setBuscouPeloMenosUmaVez] = useState(false);

  // Sincroniza busca externa durante renderização se a prop mudar
  const [prevExternalCpf, setPrevExternalCpf] = useState(externalCpfSearch);
  if (externalCpfSearch !== prevExternalCpf) {
    setPrevExternalCpf(externalCpfSearch);
    if (externalCpfSearch) {
      setCpfBusca(externalCpfSearch);
    }
  }

  const executarBusca = React.useCallback(async (cpfParaBuscar: string) => {
    const cleanCpf = cpfParaBuscar.trim();
    if (!cleanCpf) {
      onAlert({
        id: Math.random().toString(),
        type: 'warning',
        title: 'Campo Obrigatório',
        message: 'Digite o CPF que deseja consultar.',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      });
      return;
    }

    setLoading(true);
    setBuscouPeloMenosUmaVez(true);

    try {
      // 1. Busca dados do assistido para confirmar cadastro
      let assistidoObj: Assistido | null = null;
      try {
        assistidoObj = await api.buscarAssistido(cleanCpf);
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 404) {
          setAssistidoAtual(null);
          setAtendimentos([]);
          onAlert({
            id: Math.random().toString(),
            type: 'error',
            statusCode: 404,
            title: 'Assistido Não Encontrado (HTTP 404)',
            message: `Nenhum assistido cadastrado com o CPF ${cleanCpf}.`,
            timestamp: new Date().toLocaleTimeString('pt-BR'),
          });
          setLoading(false);
          return;
        }
        throw err;
      }

      setAssistidoAtual(assistidoObj);

      // 2. Busca histórico de atendimentos
      const historico = await api.listarHistoricoAtendimentos(cleanCpf);
      setAtendimentos(historico);

      onAlert({
        id: Math.random().toString(),
        type: 'info',
        title: 'Histórico Carregado',
        message: `${historico.length} atendimento(s) encontrado(s) para ${assistidoObj.nome}.`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        onAlert({
          id: Math.random().toString(),
          type: 'error',
          statusCode: err.statusCode,
          title: 'Erro na Consulta',
          message: err.detail,
          timestamp: new Date().toLocaleTimeString('pt-BR'),
        });
      } else {
        onAlert({
          id: Math.random().toString(),
          type: 'error',
          title: 'Erro de Rede',
          message: 'Falha ao buscar histórico do assistido.',
          timestamp: new Date().toLocaleTimeString('pt-BR'),
        });
      }
    } finally {
      setLoading(false);
    }
  }, [onAlert]);

  // Executa a busca se a busca externa for acionada
  React.useEffect(() => {
    let active = true;
    if (externalCpfSearch) {
      Promise.resolve().then(async () => {
        if (!active) return;
        await executarBusca(externalCpfSearch);
      });
    }
    return () => {
      active = false;
    };
  }, [externalCpfSearch, executarBusca]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executarBusca(cpfBusca);
  };

  const formatarDataHora = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return {
        data: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        hora: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        raw: isoString,
      };
    } catch {
      return { data: isoString, hora: '', raw: isoString };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
            3
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Consultar Histórico por CPF</h2>
          </div>
        </div>
        <div className="flex gap-1.5 text-xs font-mono">
        </div>
      </div>

      {/* Formulário de Busca */}
      <form onSubmit={handleFormSubmit} className="mb-6">
        <label htmlFor="busca-cpf" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Informe o CPF do Assistido
        </label>
        <div className="flex gap-2">
          <input
            id="busca-cpf"
            type="text"
            required
            maxLength={11}
            value={cpfBusca}
            onChange={(e) => setCpfBusca(e.target.value)}
            placeholder="Digite o CPF a consultar..."
            className="flex-1 px-3.5 py-2 text-sm font-mono text-slate-900 bg-white placeholder:text-slate-400 font-medium rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            )}
            Consultar
          </button>
        </div>

        {/* Chips de atalho para assistidos cadastrados */}
        {assistidos.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-medium">Cadastrados:</span>
            {assistidos.map((a) => (
              <button
                key={a.cpf}
                type="button"
                onClick={() => {
                  setCpfBusca(a.cpf);
                  executarBusca(a.cpf);
                }}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                  cpfBusca === a.cpf
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {a.nome.split(' ')[0]} ({a.cpf})
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Resultado da Consulta */}
      {assistidoAtual && (
        <div className="space-y-4">
          {/* Card com Dados do Assistido */}
          <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                {assistidoAtual.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{assistidoAtual.nome}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    CPF: {assistidoAtual.cpf}
                  </span>
                  <span className="text-xs text-indigo-700 font-medium">
                    {atendimentos.length} atendimento(s) registrado(s)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Linha do Tempo (Timeline) */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
              Linha do Tempo de Atendimentos
            </h4>

            {atendimentos.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-sm font-medium text-slate-600">
                  Nenhum atendimento registrado para este assistido até o momento.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Utilize o Bloco 2 acima para registrar o primeiro atendimento.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-200">
                {atendimentos.map((at, index) => {
                  const dataFormatada = formatarDataHora(at.data_hora);
                  return (
                    <div key={at.id} className="relative group">
                      {/* Marcador na Linha */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-indigo-600 bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                        <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                      </div>

                      {/* Conteúdo do Atendimento */}
                      <div className="bg-slate-50 hover:bg-white rounded-xl p-4 border border-slate-200 transition-all hover:shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/50">
                              #{index + 1}
                            </span>
                            <span className="text-xs font-mono text-slate-400" title={`ID completo: ${at.id}`}>
                              UUID: {at.id.slice(0, 8)}...
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              📅 {dataFormatada.data}
                            </span>
                            <span className="flex items-center gap-1">
                              ⏰ {dataFormatada.hora} (UTC)
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                            {at.justificativa}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado Inicial sem Busca */}
      {!assistidoAtual && !loading && !buscouPeloMenosUmaVez && (
        <div className="text-center py-10 px-4 border border-slate-200 rounded-xl bg-slate-50/40">
          <span className="text-3xl mb-2 block">🔍</span>
          <p className="text-sm font-semibold text-slate-700">Consulte o Histórico</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Digite o CPF de um assistido ou clique em um dos cadastrados acima para visualizar todos os atendimentos prestados com data e hora.
          </p>
        </div>
      )}
    </div>
  );
}
