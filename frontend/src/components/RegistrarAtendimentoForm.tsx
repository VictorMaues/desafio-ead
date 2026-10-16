'use client';

import React, { useState } from 'react';
import { api, ApiError } from '../services/api';
import { Assistido, Atendimento, FeedbackMessage } from '../types';
import { ModuleCard, SectionTitle, ui } from './ui/primitives';
import { IconChevronDown, IconFileText, IconSpinner } from './ui/Icons';

const SUGESTOES: { label: string; texto: string }[] = [
  { label: 'Pensão Alimentícia', texto: 'Ação de alimentos - Fixação de pensão alimentícia' },
  { label: 'Juntada de Documentos', texto: 'Juntada de documentos de comprovação de renda familiar' },
  { label: 'Divórcio / Guarda', texto: 'Orientação jurídica sobre divórcio litigioso e guarda' },
];

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
    <ModuleCard id="registrar" index="02" title="Registrar Atendimento">
      {/*<span className={ui.tag}>POST /atendimentos</span>*/}

      <form onSubmit={handleSubmit} className="space-y-5">
        <SectionTitle
          aside={
            assistidos.length > 0 ? (
              <span className={ui.mono}>{assistidos.length} cadastrado(s)</span>
            ) : undefined
          }
        >
          Identificação
        </SectionTitle>

        <div className="space-y-1.5">
          <label htmlFor="atendimento-cpf" className={ui.label}>
            CPF do Assistido
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="atendimento-cpf"
              type="text"
              required
              maxLength={11}
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Ex: 12345678901"
              className={`${ui.input} ${ui.mono} tracking-wide sm:flex-1`}
            />
            {assistidos.length > 0 && (
              <div className="relative sm:w-40">
                <select
                  aria-label="Selecionar assistido recente"
                  onChange={(e) => {
                    if (e.target.value) setCpf(e.target.value);
                  }}
                  value=""
                  className={`${ui.field} appearance-none pr-9 text-xs font-medium cursor-pointer`}
                >
                  <option value="" disabled>Selecionar...</option>
                  {assistidos.map((a) => (
                    <option key={a.cpf} value={a.cpf}>
                      {a.nome} ({a.cpf})
                    </option>
                  ))}
                </select>
                <IconChevronDown className="w-3.5 h-3.5 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              </div>
            )}
          </div>
        </div>

        <SectionTitle
          aside={
            <span className={`${ui.mono} ${justificativa.trim().length >= 5 ? 'text-zinc-900' : ''}`}>
              {justificativa.length} caracteres (mín. 5)
            </span>
          }
        >
          Justificativa / Motivo do Atendimento
        </SectionTitle>

        <div className="space-y-3">
          <label htmlFor="atendimento-justificativa" className="sr-only">
            Justificativa / Motivo do Atendimento
          </label>
          <textarea
            id="atendimento-justificativa"
            required
            rows={3}
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Descreva a demanda jurídica ou atendimento prestado..."
            className={`${ui.field} resize-none leading-relaxed`}
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 mr-1">Sugestões</span>
            {SUGESTOES.map((s) => {
              const ativo = justificativa === s.texto;
              return (
                <button
                  key={s.label}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => preencherJustificativaRapida(s.texto)}
                  className={`${ui.chip} ${ativo ? ui.chipActive : ui.chipIdle}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-1 flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading}
            className={`${ui.btnPrimary} w-full`}
          >
            {loading ? (
              <>
                <IconSpinner className="w-3.5 h-3.5" />
                Registrando...
              </>
            ) : (
              <>
                <IconFileText className="w-3.5 h-3.5" />
                Registrar Atendimento
              </>
            )}
          </button>

          {/* Botão para testar erro 404 ao vivo na demo */}
          {/*<button
            type="button"
            onClick={simularCpfInexistente}
            className={ui.btnSecondary}
            title="Preenche um CPF inexistente para demonstrar o retorno 404 da API"
          >
            Testar Erro 404 (Assistido Inexistente)
          </button>*/}
        </div>
      </form>
    </ModuleCard>
  );
}
