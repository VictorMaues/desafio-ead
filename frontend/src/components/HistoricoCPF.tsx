'use client';

import React, { useState } from 'react';
import { api, ApiError } from '../services/api';
import { Assistido, Atendimento } from '../types';
import { IconInbox, IconSearch, IconSpinner } from './ui/Icons';

/**
 * Estados possíveis da consulta.
 * União discriminada: apenas um estado fica ativo por vez.
 */
type EstadoConsulta =
  | { status: 'inicial' }
  | { status: 'carregando' }
  | { status: 'nao-encontrado'; cpf: string }
  | { status: 'erro'; codigo: number; mensagem: string }
  | { status: 'sucesso'; assistido: Assistido; atendimentos: Atendimento[] };

/** Remove caracteres não numéricos: "000.000.000-00" -> "00000000000". */
const apenasDigitos = (valor: string) => valor.replace(/\D/g, '');

/** Formata 11 dígitos como CPF (000.000.000-00). */
function formatarCpf(cpf: string): string {
  const d = apenasDigitos(cpf);
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf;
}

/** Formata data e hora para o padrão pt-BR local. */
const formatadorDataHora = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

// ============================================================
// Componente principal
// ============================================================
export default function HistoricoCPF() {
  const [cpf, setCpf] = useState('');
  const [estado, setEstado] = useState<EstadoConsulta>({ status: 'inicial' });

  const carregando = estado.status === 'carregando';
  const cpfLimpo = apenasDigitos(cpf);

  const buscar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cpfLimpo) return;

    setEstado({ status: 'carregando' });
    try {
      const [assistido, atendimentos] = await Promise.all([
        api.buscarAssistido(cpfLimpo),
        api.listarHistoricoAtendimentos(cpfLimpo),
      ]);

      // Ordena por data decrescente (mais recente primeiro)
      const ordenados = [...atendimentos].sort(
        (a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime(),
      );
      setEstado({ status: 'sucesso', assistido, atendimentos: ordenados });
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        setEstado({ status: 'nao-encontrado', cpf: cpfLimpo });
      } else if (err instanceof ApiError) {
        setEstado({ status: 'erro', codigo: err.statusCode, mensagem: err.detail });
      } else {
        setEstado({
          status: 'erro',
          codigo: 0,
          mensagem: 'Não foi possível conectar ao backend em localhost:8000.',
        });
      }
    }
  };

  return (
    <section
      aria-labelledby="historico-cpf-titulo"
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      {/* 1. Cabeçalho do módulo - padrão visual da branch main */}
      <header className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
            <IconSearch className="w-4 h-4 text-indigo-700" />
          </div>
          <div>
            <h2 id="historico-cpf-titulo" className="text-base font-bold text-slate-800">
              Consultar Histórico por CPF
            </h2>
            <p className="text-xs text-slate-500">
              Consulte a ficha do assistido e o histórico cronológico de atendimentos
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
          EST-2
        </span>
      </header>

      {/* 2. Barra de busca */}
      <form onSubmit={buscar} role="search" className="mb-6">
        <label
          htmlFor="historico-cpf-input"
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Informe o CPF do Assistido
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="historico-cpf-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Digite o CPF a consultar (ex: 000.000.000-00)..."
            className="flex-1 px-3.5 py-2.5 text-sm font-mono text-slate-900 bg-white placeholder:text-slate-400 font-medium rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
          <button
            id="historico-cpf-buscar"
            type="submit"
            disabled={carregando || !cpfLimpo}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {carregando ? (
              <IconSpinner className="w-4 h-4 text-white" />
            ) : (
              <IconSearch className="w-4 h-4 text-white" />
            )}
            <span>{carregando ? 'Buscando...' : 'Consultar'}</span>
          </button>
        </div>
      </form>

      {/* 3. Resultado conforme o estado atual */}
      <div aria-live="polite">
        <ResultadoConsulta estado={estado} />
      </div>
    </section>
  );
}

// ============================================================
// Subcomponentes de apresentação (padrão visual da branch main)
// ============================================================

function ResultadoConsulta({ estado }: { estado: EstadoConsulta }) {
  switch (estado.status) {
    case 'inicial':
      return (
        <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <IconInbox className="w-6 h-6 mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">
            Informe um CPF para consultar o histórico
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Digite o CPF do assistido no campo acima para carregar seus dados e atendimentos.
          </p>
        </div>
      );

    case 'carregando':
      return (
        <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <IconSpinner className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-slate-600">Carregando histórico do assistido...</p>
        </div>
      );

    case 'nao-encontrado':
      return (
        <div
          role="alert"
          className="p-4 rounded-xl border border-rose-200 bg-rose-50/80 flex items-start gap-3 shadow-sm"
        >
          <span className="shrink-0 bg-rose-600 text-white font-mono text-xs font-bold px-2.5 py-1 rounded">
            404
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-rose-900">Assistido Não Encontrado</p>
            <p className="text-xs text-rose-700 mt-0.5">
              Não existe nenhum assistido cadastrado com o CPF{' '}
              <span className="font-mono font-bold">{formatarCpf(estado.cpf)}</span>.
            </p>
          </div>
        </div>
      );

    case 'erro':
      return (
        <div
          role="alert"
          className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 flex items-start gap-3 shadow-sm"
        >
          <span className="shrink-0 bg-amber-600 text-white font-mono text-xs font-bold px-2.5 py-1 rounded">
            {estado.codigo ? estado.codigo : 'OFFLINE'}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900">Falha na Consulta</p>
            <p className="text-xs text-amber-700 mt-0.5">{estado.mensagem}</p>
          </div>
        </div>
      );

    case 'sucesso':
      return (
        <div className="space-y-5">
          {/* Card com Dados do Assistido */}
          <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                {estado.assistido.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{estado.assistido.nome}</h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                    CPF: {formatarCpf(estado.assistido.cpf)}
                  </span>
                  <span className="text-xs text-indigo-700 font-medium">
                    {estado.atendimentos.length}{' '}
                    {estado.atendimentos.length === 1
                      ? 'atendimento registrado'
                      : 'atendimentos registrados'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Linha do Tempo (Timeline) */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
              Linha do Tempo de Atendimentos
            </h3>

            {estado.atendimentos.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-sm font-medium text-slate-600">
                  Nenhum atendimento registrado para este assistido até o momento.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-200">
                {estado.atendimentos.map((at) => (
                  <div key={at.id} className="relative">
                    {/* Nó na linha */}
                    <div className="absolute -left-6 top-3 w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow-sm" />
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2 pb-2 border-b border-slate-100">
                        <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200/60 font-semibold">
                          {formatadorDataHora.format(new Date(at.data_hora))}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400" title={at.id}>
                          ID: {at.id.slice(0, 8)}...
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed font-normal">
                        {at.justificativa}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
  }
}
