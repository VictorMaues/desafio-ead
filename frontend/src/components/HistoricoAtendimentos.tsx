'use client';

import React, { useState } from 'react';
import { api, ApiError } from '../services/api';
import { Assistido, Atendimento, FeedbackMessage } from '../types';
import { ModuleCard, SectionTitle, ui } from './ui/primitives';
import {
  IconArrowRight,
  IconCalendar,
  IconClock,
  IconHistory,
  IconInbox,
  IconSearch,
  IconSpinner,
} from './ui/Icons';

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
    <ModuleCard id="historico" index="03" title="Consultar Histórico por CPF">
      {/* Formulário de Busca */}
      <form onSubmit={handleFormSubmit} className="mb-7 space-y-4">
        <SectionTitle>Informe o CPF do Assistido</SectionTitle>

        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="busca-cpf" className="sr-only">
            Informe o CPF do Assistido
          </label>
          <div className="relative flex-1">
            <IconSearch className="w-4 h-4 pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              id="busca-cpf"
              type="text"
              required
              maxLength={11}
              inputMode="numeric"
              value={cpfBusca}
              onChange={(e) => setCpfBusca(e.target.value)}
              placeholder="Digite o CPF a consultar..."
              className={`${ui.input} ${ui.mono} tracking-wide pl-11`}
            />
          </div>
          <button type="submit" disabled={loading} className={ui.btnPrimary}>
            {loading ? <IconSpinner className="w-3.5 h-3.5" /> : <IconArrowRight className="w-3.5 h-3.5" />}
            Consultar
          </button>
        </div>

        {/* Seletor em blocos squircle para assistidos cadastrados */}
        {assistidos.length > 0 && (
          <div className="space-y-2">
            <span className={ui.label}>
              Cadastrados <span className={`${ui.mono} text-zinc-400`}>({assistidos.length})</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {assistidos.map((a) => {
                const ativo = cpfBusca === a.cpf;
                return (
                  <button
                    key={a.cpf}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => {
                      setCpfBusca(a.cpf);
                      executarBusca(a.cpf);
                    }}
                    className={`text-left rounded-2xl border px-3 py-2.5 transition-colors cursor-pointer ${
                      ativo
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-900 border-zinc-300 hover:border-zinc-900'
                    }`}
                  >
                    <span className="block text-xs font-semibold truncate">{a.nome.split(' ')[0]}</span>
                    <span
                      className={`block text-[11px] ${ui.mono} ${ativo ? 'text-zinc-400' : 'text-zinc-500'}`}
                    >
                      {a.cpf}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </form>

      {/* Resultado da Consulta */}
      {assistidoAtual && (
        <div className="space-y-5 animate-enter">
          {/* Card com Dados do Assistido */}
          <div className="rounded-3xl border border-zinc-900 bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-zinc-900 text-white font-semibold flex items-center justify-center text-lg">
                {assistidoAtual.nome.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-zinc-900 text-base truncate">{assistidoAtual.nome}</h3>
                <span className={`text-xs text-zinc-500 ${ui.mono}`}>CPF {assistidoAtual.cpf}</span>
              </div>
            </div>
            <span className={ui.tag}>
              {atendimentos.length} atendimento(s) registrado(s)
            </span>
          </div>

          {/* Linha do Tempo (Timeline) */}
          <div className="space-y-3">
            <SectionTitle as="h4" aside={<span className={ui.mono}>{atendimentos.length} registro(s)</span>}>
              Linha do Tempo de Atendimentos
            </SectionTitle>

            {atendimentos.length === 0 ? (
              <div className="flex flex-col items-center text-center py-10 px-4 border border-dashed border-zinc-300 rounded-3xl">
                <span className="flex items-center justify-center h-10 w-10 rounded-2xl border border-zinc-300 text-zinc-900 mb-3">
                  <IconInbox className="w-4 h-4" />
                </span>
                <p className="text-sm font-medium text-zinc-900">
                  Nenhum atendimento registrado para este assistido até o momento.
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Utilize o Bloco 2 acima para registrar o primeiro atendimento.
                </p>
              </div>
            ) : (
              <ol className="space-y-2.5">
                {atendimentos.map((at, index) => {
                  const dataFormatada = formatarDataHora(at.data_hora);
                  return (
                    <li
                      key={at.id}
                      className="animate-enter rounded-2xl border border-zinc-300 overflow-hidden bg-white hover:border-zinc-900 transition-colors"
                      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
                    >
                      {/* Cabeçalho escuro: índice, UUID e data/hora */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900 text-white px-4 py-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-xs font-semibold ${ui.mono}`}>
                            #{String(index + 1).padStart(2, '0')}
                          </span>
                          <span className={`text-[11px] text-zinc-400 ${ui.mono}`} title={`ID completo: ${at.id}`}>
                            UUID {at.id.slice(0, 8)}...
                          </span>
                        </div>

                        <div className={`flex items-center gap-3 text-[11px] text-zinc-300 ${ui.mono}`}>
                          <span className="flex items-center gap-1.5">
                            <IconCalendar className="w-3.5 h-3.5" />
                            {dataFormatada.data}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <IconClock className="w-3.5 h-3.5" />
                            {dataFormatada.hora} (UTC)
                          </span>
                        </div>
                      </div>

                      {/* Corpo branco: justificativa */}
                      <p className="px-4 py-3 text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
                        {at.justificativa}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      )}

      {/* Estado Inicial sem Busca */}
      {!assistidoAtual && !loading && !buscouPeloMenosUmaVez && (
        <div className="flex flex-col items-center text-center py-12 px-4 border border-dashed border-zinc-300 rounded-3xl">
          <span className="flex items-center justify-center h-11 w-11 rounded-2xl bg-zinc-900 text-white mb-3">
            <IconHistory className="w-5 h-5" />
          </span>
          <p className="text-sm font-semibold text-zinc-900">Consulte o Histórico</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
            Digite o CPF de um assistido ou clique em um dos cadastrados acima para visualizar todos os atendimentos prestados com data e hora.
          </p>
        </div>
      )}
    </ModuleCard>
  );
}
