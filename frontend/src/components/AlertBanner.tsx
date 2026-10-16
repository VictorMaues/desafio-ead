'use client';

import React from 'react';
import { FeedbackMessage } from '../types';
import {
  IconAlertTriangle,
  IconBan,
  IconCheckCircle,
  IconInfo,
  IconSearchX,
  IconX,
  IconXCircle,
} from './ui/Icons';

interface AlertBannerProps {
  alerts: FeedbackMessage[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

const STATUS_LABEL: Record<number, string> = {
  409: 'CONFLICT',
  404: 'NOT FOUND',
  201: 'CREATED',
  200: 'OK',
};

const TYPE_LABEL: Record<FeedbackMessage['type'], string> = {
  success: 'SUCESSO',
  error: 'ERRO',
  warning: 'AVISO',
  info: 'INFO',
};

export default function AlertBanner({ alerts, onDismiss, onClearAll }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <section className="space-y-3 mb-8" aria-label="Notificações">
      <div className="flex items-end justify-between gap-3 border-b border-zinc-200 pb-2">
        <h2 className="text-sm font-medium text-zinc-900">
          Notificações e Respostas da API{' '}
          <span className="font-mono tabular-nums text-zinc-400">({alerts.length})</span>
        </h2>
        {alerts.length > 1 && (
          <button
            onClick={onClearAll}
            className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900 transition-colors cursor-pointer"
          >
            Limpar todas
          </button>
        )}
      </div>

      {alerts.map((alert) => {
        const isConflict409 = alert.statusCode === 409;
        const isNotFound404 = alert.statusCode === 404;
        const isInfo = alert.type === 'info' && !alert.statusCode;

        // Ícone monocromático por semântica (sem cores de status)
        let Icon = IconInfo;
        if (isConflict409) Icon = IconBan;
        else if (isNotFound404) Icon = IconSearchX;
        else if (alert.type === 'error') Icon = IconXCircle;
        else if (alert.type === 'success') Icon = IconCheckCircle;
        else if (alert.type === 'warning') Icon = IconAlertTriangle;

        // Erros, sucessos e avisos ganham a borda editorial marcada; info é discreto
        const containerClass = isInfo
          ? 'border border-zinc-300 bg-white'
          : 'border-2 border-zinc-900 bg-zinc-50';

        const tagText = alert.statusCode
          ? `HTTP ${alert.statusCode}${STATUS_LABEL[alert.statusCode] ? ` · ${STATUS_LABEL[alert.statusCode]}` : ''}`
          : TYPE_LABEL[alert.type];

        return (
          <div
            key={alert.id}
            role="alert"
            className={`animate-enter rounded-3xl p-4 sm:p-5 flex items-start justify-between gap-4 ${containerClass}`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <span
                className={`flex shrink-0 items-center justify-center h-9 w-9 rounded-2xl ${
                  isInfo ? 'border border-zinc-300 text-zinc-900' : 'bg-zinc-900 text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={
                      isInfo
                        ? 'inline-flex items-center border border-zinc-300 text-zinc-700 text-xs font-mono px-3 py-1 rounded-full'
                        : 'inline-flex items-center bg-zinc-900 text-white text-xs font-mono px-3 py-1 rounded-full tabular-nums'
                    }
                  >
                    {tagText}
                  </span>
                  <h4 className="text-sm font-semibold text-zinc-900">{alert.title}</h4>
                  <span className="text-xs font-mono tabular-nums text-zinc-400">{alert.timestamp}</span>
                </div>
                <p className="text-sm mt-1.5 leading-relaxed text-zinc-700 break-words">{alert.message}</p>
              </div>
            </div>

            <button
              onClick={() => onDismiss(alert.id)}
              className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full border border-zinc-300 bg-white text-zinc-500 hover:text-zinc-900 hover:border-zinc-900 transition-colors cursor-pointer"
              title="Fechar notificação"
              aria-label="Fechar"
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </section>
  );
}
