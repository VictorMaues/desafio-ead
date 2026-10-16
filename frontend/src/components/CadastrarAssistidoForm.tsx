"use client";

import React, { useState } from "react";
import { api, ApiError } from "../services/api";
import { Assistido, FeedbackMessage } from "../types";
import { ModuleCard, SectionTitle, ui } from "./ui/primitives";
import { IconSpinner, IconUserPlus } from "./ui/Icons";

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
      setCpf("12345678901");
    }
  };

  return (
    <ModuleCard id="cadastrar" index="01" title="Cadastrar Assistido">
      {/*<span className={ui.tag}>POST /assistidos</span>*/}

      <form onSubmit={handleSubmit} className="space-y-5">
        <SectionTitle aside="Adicione um novo cidadão à base">
          Dados do assistido
        </SectionTitle>

        <div className="space-y-1.5">
          <label htmlFor="assistido-nome" className={ui.label}>
            Nome Completo
          </label>
          <input
            id="assistido-nome"
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Carlos Eduardo de Oliveira"
            className={ui.input}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="assistido-cpf" className={ui.label}>
              CPF (Apenas dígitos ou formatado)
            </label>
            <span className={`text-[11px] text-zinc-400 ${ui.mono}`}>
              {cpf.length}/11
            </span>
          </div>
          <input
            id="assistido-cpf"
            type="text"
            required
            maxLength={11}
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Ex: 12345678901"
            className={`${ui.input} ${ui.mono} tracking-wide`}
          />
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
                Cadastrando...
              </>
            ) : (
              <>
                <IconUserPlus className="w-3.5 h-3.5" />
                Cadastrar Assistido
              </>
            )}
          </button>

          {/* Botões rápidos para facilitar a demonstração ao vivo */}
          {/*<div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={preencherExemplo}
              className={`${ui.btnSecondary} flex-1`}
              title="Preenche com um nome e CPF aleatório"
            >
              Preencher Novo
            </button>
            <button
              type="button"
              onClick={simularDuplicado}
              className={`${ui.btnSecondary} flex-1`}
              title="Preenche com CPF existente para forçar erro 409 na demo"
            >
              Testar Erro 409
            </button>
          </div>*/}
        </div>
      </form>
    </ModuleCard>
  );
}
