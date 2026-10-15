"use client";

import React from "react";

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
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img
                src="/Group.svg"
                alt="Logo Defensoria Pública"
                className="h-11 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Defensoria Pública
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-500/30">
                  EST-2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sistema de Gestão de Assistidos e Histórico de Atendimentos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                backendOnline === true
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                  : backendOnline === false
                    ? "bg-rose-950/80 text-rose-300 border-rose-700/60"
                    : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline === true
                    ? "bg-emerald-400 animate-pulse"
                    : backendOnline === false
                      ? "bg-rose-500"
                      : "bg-slate-400"
                }`}
              />
              <span>
                {backendOnline === true
                  ? "Backend Conectado (Porta 8000)"
                  : backendOnline === false
                    ? "Backend Offline (Conexão recusada)"
                    : "Verificando Backend..."}
              </span>
            </div>

            <button
              onClick={onRefreshHealth}
              disabled={isChecking}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              title="Testar conexão com o Backend"
              aria-label="Atualizar status da conexão"
            >
              <svg
                className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
