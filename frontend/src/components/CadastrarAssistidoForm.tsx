"use client";

import React, { useState } from "react";
import { api, ApiError } from "../services/api";
import { Assistido, FeedbackMessage } from "../types";

interface CadastrarAssistidoFormProps {
  onAssistidoCadastrado: (assistido: Assistido) => void;
  onAlert: (alert: FeedbackMessage) => void;
  assistidosExistentes: Assistido[];
}

export default function CadastrarAssistidoForm({
  onAssistidoCadastrado,
  onAlert,
  assistidosExistentes,
}: CadastrarAssistidoFormProps) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cpf.trim()) {
      onAlert({
        id: Math.random().toString(),
        type: "warning",
        title: "Campos Obrigatórios",
        message: "Por favor, informe o Nome e o CPF do assistido.",
        timestamp: new Date().toLocaleTimeString("pt-BR"),
      });
      return;
    }

    setLoading(true);
    try {
      const novoAssistido = await api.cadastrarAssistido({
        nome: nome.trim(),
        cpf: cpf.trim(),
      });

      onAlert({
        id: Math.random().toString(),
        type: "success",
        statusCode: 201,
        title: "Assistido Cadastrado com Sucesso",
        message: `Assistido(a) "${novoAssistido.nome}" registrado(a) sob o CPF ${novoAssistido.cpf}.`,
        timestamp: new Date().toLocaleTimeString("pt-BR"),
      });

      onAssistidoCadastrado(novoAssistido);
      setNome("");
      setCpf("");
    } catch (err) {
      if (err instanceof ApiError) {
        onAlert({
          id: Math.random().toString(),
          type: "error",
          statusCode: err.statusCode,
          title:
            err.statusCode === 409
              ? "Erro 409 - Conflito de CPF Duplicado"
              : `Erro no Cadastro (HTTP ${err.statusCode})`,
          message: err.detail,
          timestamp: new Date().toLocaleTimeString("pt-BR"),
        });
      } else {
        onAlert({
          id: Math.random().toString(),
          type: "error",
          title: "Falha de Comunicação",
          message: "Não foi possível se conectar ao servidor.",
          timestamp: new Date().toLocaleTimeString("pt-BR"),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const preencherExemplo = () => {
    // Gera um CPF fictício legível para teste
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setNome(`Cidadão Exemplo ${randomSuffix}`);
    setCpf(`123456${randomSuffix}00`);
  };

  const simularDuplicado = () => {
    if (assistidosExistentes.length > 0) {
      const primeiro = assistidosExistentes[0];
      setNome(`Outra Pessoa com Mesmo CPF`);
      setCpf(primeiro.cpf);
    } else {
      // Valor padrão de teste
      setNome("Pessoa Repetida");
      setCpf("000.000.000-00");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Cadastrar Assistido
            </h2>
            <p className="text-xs text-slate-500">
              Adicione um novo cidadão à base
            </p>
          </div>
        </div>
        {/*<span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
          POST /assistidos
        </span>*/}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="assistido-nome"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            Nome Completo
          </label>
          <input
            id="assistido-nome"
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Carlos Eduardo de Oliveira"
            className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white placeholder:text-slate-400 font-medium rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="assistido-cpf"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              CPF (Apenas dígitos ou formatado)
            </label>
            <span className="text-[11px] text-slate-400">11 dígitos</span>
          </div>
          <input
            id="assistido-cpf"
            type="text"
            required
            maxLength={11}
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Ex: 000.000.000-00"
            className="w-full px-3.5 py-2 text-sm font-mono text-slate-900 bg-white placeholder:text-slate-400 font-medium rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg transition-colors shadow-sm disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Cadastrando...
              </>
            ) : (
              "Cadastrar Assistido"
            )}
          </button>

          {/* Botões rápidos para facilitar a demonstração ao vivo */}
          {/*<div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={preencherExemplo}
              className="flex-1 text-xs py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
              title="Preenche com um nome e CPF aleatório"
            >
              🪄 Preencher Novo
            </button>
            <button
              type="button"
              onClick={simularDuplicado}
              className="flex-1 text-xs py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded transition-colors cursor-pointer"
              title="Preenche com CPF existente para forçar erro 409 na demo"
            >
              ⚠️ Testar Erro 409
            </button>
          </div>*/}
        </div>
      </form>
    </div>
  );
}
