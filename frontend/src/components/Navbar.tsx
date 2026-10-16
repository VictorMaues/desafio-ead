"use client";

import React from "react";
import { IconRefresh } from "./ui/Icons";

interface NavbarProps {
  backendOnline: boolean | null;
  onRefreshHealth: () => void;
  isChecking: boolean;
}

export default function Navbar({
  backendOnline,
  onRefreshHealth,
  isChecking,
}: NavbarProps) {
  const statusLabel =
    backendOnline === true
      ? "Backend conectado"
      : backendOnline === false
        ? "Backend offline"
        : "Verificando backend";

  const statusDetail =
    backendOnline === true
      ? ":8000"
      : backendOnline === false
        ? "conexão recusada"
        : "...";

  return (
    <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="bg-white border border-zinc-200 rounded-3xl px-4 sm:px-5 py-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Logo institucional em bloco squircle, convertido para monocromático */}
            <div className="flex items-center justify-center h-12 w-14 rounded-2xl bg-zinc-900 px-2">
              <img
                src="/Group.svg"
                alt="Logo Defensoria Pública"
                className="h-8 w-auto object-contain grayscale brightness-125"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 leading-tight">
                Defensoria Pública
              </h1>
              <p className="text-xs text-zinc-500">
                Sistema de Gestão de Assistidos e Histórico de Atendimentos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div
              role="status"
              aria-live="polite"
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                backendOnline === true
                  ? "bg-zinc-900 text-white border border-zinc-900"
                  : backendOnline === false
                    ? "bg-zinc-50 text-zinc-900 border-2 border-zinc-900"
                    : "bg-white text-zinc-500 border border-zinc-300"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {backendOnline === true && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    backendOnline === true
                      ? "bg-white"
                      : backendOnline === false
                        ? "bg-transparent border border-zinc-900"
                        : "bg-zinc-300"
                  }`}
                />
              </span>
              <span>{statusLabel}</span>
              <span
                className={`font-mono tabular-nums ${
                  backendOnline === true ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                {statusDetail}
              </span>
            </div>

            <button
              onClick={onRefreshHealth}
              disabled={isChecking}
              className="flex items-center justify-center h-8 w-8 rounded-full border border-zinc-300 bg-white text-zinc-900 hover:border-zinc-900 transition-colors cursor-pointer disabled:opacity-50"
              title="Testar conexão com o Backend"
              aria-label="Atualizar status da conexão"
            >
              <IconRefresh className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
