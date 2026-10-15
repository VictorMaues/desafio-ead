'use client';

import React from 'react';
import { FeedbackMessage } from '../types';

interface AlertBannerProps {
  alerts: FeedbackMessage[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export default function AlertBanner({ alerts, onDismiss, onClearAll }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-8">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          Notificações e Respostas da API ({alerts.length})
        </span>
        {alerts.length > 1 && (
          <button
            onClick={onClearAll}
            className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
          >
            Limpar todas
          </button>
        )}
      </div>

      {alerts.map((alert) => {
        const isError = alert.type === 'error';
        const isSuccess = alert.type === 'success';
        const isWarning = alert.type === 'warning';
        const isConflict409 = alert.statusCode === 409;
        const isNotFound404 = alert.statusCode === 404;

        let bgClass = 'bg-slate-50 border-slate-300 text-slate-800';
        let badgeClass = 'bg-slate-200 text-slate-800';
        let icon = 'ℹ️';

        if (isConflict409) {
          bgClass = 'bg-rose-50 border-rose-400 text-rose-900 shadow-sm';
          badgeClass = 'bg-rose-600 text-white font-bold';
          icon = '🚫';
        } else if (isNotFound404) {
          bgClass = 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm';
          badgeClass = 'bg-amber-600 text-white font-bold';
          icon = '⚠️';
        } else if (isError) {
          bgClass = 'bg-red-50 border-red-300 text-red-900';
          badgeClass = 'bg-red-600 text-white';
          icon = '❌';
        } else if (isSuccess) {
          bgClass = 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm';
          badgeClass = 'bg-emerald-600 text-white';
          icon = '✅';
        } else if (isWarning) {
          bgClass = 'bg-yellow-50 border-yellow-300 text-yellow-900';
          badgeClass = 'bg-yellow-600 text-white';
          icon = '⚠️';
        }

        return (
          <div
            key={alert.id}
            role="alert"
            className={`border-l-4 p-4 rounded-r-lg transition-all duration-200 flex items-start justify-between gap-3 ${bgClass}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl select-none" aria-hidden="true">{icon}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {alert.statusCode && (
                    <span className={`px-2 py-0.5 text-xs rounded font-mono ${badgeClass}`}>
                      HTTP {alert.statusCode}
                      {alert.statusCode === 409 && ' • CONFLICT'}
                      {alert.statusCode === 404 && ' • NOT FOUND'}
                      {alert.statusCode === 201 && ' • CREATED'}
                      {alert.statusCode === 200 && ' • OK'}
                    </span>
                  )}
                  <h4 className="text-sm font-bold">{alert.title}</h4>
                  <span className="text-xs opacity-75">{alert.timestamp}</span>
                </div>
                <p className="text-sm mt-1 leading-relaxed font-medium">{alert.message}</p>
              </div>
            </div>

            <button
              onClick={() => onDismiss(alert.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md text-lg leading-none transition-colors"
              title="Fechar notificação"
              aria-label="Fechar"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
