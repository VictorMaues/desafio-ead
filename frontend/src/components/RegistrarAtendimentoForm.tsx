'use client';

import React, { useState } from 'react';
import { api, ApiError } from '../services/api';
import { Assistido, Atendimento, FeedbackMessage } from '../types';

interface RegistrarAtendimentoFormProps {
  assistidos: Assistido[];
  onAtendimentoRegistrado: (atendimento: Atendimento) => void;
  onAlert: (alert: FeedbackMessage) => void;
  selectedCpf?: string;
}

export default function RegistrarAtendimentoForm({
  assistidos,
  onAtendimentoRegistrado,
  onAlert,
  selectedCpf,
}: RegistrarAtendimentoFormProps) {
  const [cpf, setCpf] = useState(selectedCpf || '');
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);

  // Sincroniza se o CPF selecionado mudar externamente sem disparar cascading render
  const [prevSelectedCpf, setPrevSelectedCpf] = useState(selectedCpf);
  if (selectedCpf !== prevSelectedCpf) {
    setPrevSelectedCpf(selectedCpf);
    if (selectedCpf) {
      setCpf(selectedCpf);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf.trim() || !justificativa.trim()) {
      onAlert({
        id: Math.random().toString(),
        type: 'warning',
        title: 'Campos Obrigatórios',
        message: 'Preencha o CPF do assistido e a justificativa do atendimento.',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      });
      return;
    }

    if (justificativa.trim().length < 5) {
      onAlert({
        id: Math.random().toString(),
        type: 'warning',
        title: 'Justificativa Curta',
        message: 'A justificativa deve conter pelo menos 5 caracteres.',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      });
      return;
    }

    setLoading(true);
    try {
      const novoAtendimento = await api.registrarAtendimento({
        assistido_cpf: cpf.trim(),
        justificativa: justificativa.trim(),
      });

      onAlert({
        id: Math.random().toString(),
        type: 'success',
        statusCode: 201,
        title: 'Atendimento Registrado com Sucesso',
        message: `Atendimento [ID: ${novoAtendimento.id.slice(0, 8)}...] vinculado ao CPF ${novoAtendimento.assistido_cpf}.`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      });

      onAtendimentoRegistrado(novoAtendimento);
      setJustificativa('');
    } catch (err) {
      if (err instanceof ApiError) {
        onAlert({
          id: Math.random().toString(),
          type: 'error',
          statusCode: err.statusCode,
          title:
            err.statusCode === 404
              ? 'Erro 404 - Assistido Não Encontrado'
              : `Erro no Registro (HTTP ${err.statusCode})`,
          message: err.detail,
          timestamp: new Date().toLocaleTimeString('pt-BR'),
        });
      } else {
        onAlert({
          id: Math.random().toString(),
          type: 'error',
          title: 'Erro de Conexão',
          message: 'Falha ao registrar atendimento.',
          timestamp: new Date().toLocaleTimeString('pt-BR'),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const simularCpfInexistente = () => {
    setCpf('00000000000');
    setJustificativa('Tentativa de registro para assistido que não existe no sistema');
  };

  const preencherJustificativaRapida = (texto: string) => {
    setJustificativa(texto);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Registrar Atendimento</h2>
            <p className="text-xs text-slate-500">Vincule uma nova consulta a um CPF existente</p>
          </div>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
          POST /atendimentos
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="atendimento-cpf" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              CPF do Assistido
            </label>
            {assistidos.length > 0 && (
              <span className="text-[11px] text-emerald-700 font-medium">
                {assistidos.length} cadastrado(s)
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              id="atendimento-cpf"
              type="text"
              required
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Ex: 12345678901"
              className="flex-1 px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
            {assistidos.length > 0 && (
              <select
                aria-label="Selecionar assistido recente"
                onChange={(e) => {
                  if (e.target.value) setCpf(e.target.value);
                }}
                value=""
                className="px-2 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="" disabled>Selecionar...</option>
                {assistidos.map((a) => (
                  <option key={a.cpf} value={a.cpf}>
                    {a.nome} ({a.cpf})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="atendimento-justificativa" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Justificativa / Motivo do Atendimento
            </label>
            <span className="text-[11px] text-slate-400">
              {justificativa.length} caracteres (mín. 5)
            </span>
          </div>
          <textarea
            id="atendimento-justificativa"
            required
            rows={3}
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Descreva a demanda jurídica ou atendimento prestado..."
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors resize-none"
          />

          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            <span className="text-[11px] text-slate-400">Sugestões:</span>
            <button
              type="button"
              onClick={() => preencherJustificativaRapida('Ação de alimentos - Fixação de pensão alimentícia')}
              className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
            >
              Pensão Alimentícia
            </button>
            <button
              type="button"
              onClick={() => preencherJustificativaRapida('Juntada de documentos de comprovação de renda familiar')}
              className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
            >
              Juntada de Documentos
            </button>
            <button
              type="button"
              onClick={() => preencherJustificativaRapida('Orientação jurídica sobre divórcio litigioso e guarda')}
              className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
            >
              Divórcio / Guarda
            </button>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm rounded-lg transition-colors shadow-sm disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Registrando...
              </>
            ) : (
              'Registrar Atendimento'
            )}
          </button>

          {/* Botão para testar erro 404 ao vivo na demo */}
          <button
            type="button"
            onClick={simularCpfInexistente}
            className="text-xs py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded transition-colors cursor-pointer text-center font-medium"
            title="Preenche um CPF inexistente para demonstrar o retorno 404 da API"
          >
            ⚠️ Testar Erro 404 (Assistido Inexistente)
          </button>
        </div>
      </form>
    </div>
  );
}
