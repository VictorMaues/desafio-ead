import React from 'react';

/**
 * Primitivas do Design System monocromático.
 * Centraliza as classes para que todos os módulos compartilhem a mesma geometria.
 */

export const ui = {
  /** Container/superfície padrão: branco, borda 1px, cantos 3xl, sem sombra. */
  surface: 'bg-white border border-zinc-200 rounded-3xl',

  /** Rótulo de campo. */
  label: 'block text-[11px] font-medium uppercase tracking-wider text-zinc-500',

  /** Input pílula. */
  input:
    'w-full rounded-full bg-zinc-50 border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 ' +
    'focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors',

  /** Textarea / select: mesma linguagem, cantos 2xl. */
  field:
    'w-full rounded-2xl bg-zinc-50 border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 ' +
    'focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors',

  /** Dados técnicos (CPF, datas, IDs). */
  mono: 'font-mono tabular-nums',

  /** CTA principal: pílula preta sólida. */
  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 ' +
    'px-6 py-2.5 text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',

  /** Ação secundária: branca com borda fina que escurece no hover. */
  btnSecondary:
    'inline-flex items-center justify-center gap-2 rounded-full bg-white text-zinc-900 border border-zinc-300 ' +
    'hover:border-zinc-900 px-4 py-2 text-xs font-medium transition-colors cursor-pointer',

  /** Chip/pílula selecionável — use com `chipActive` ou `chipIdle`. */
  chip: 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors cursor-pointer',
  chipActive: 'bg-zinc-900 text-white border-zinc-900',
  chipIdle: 'bg-white text-zinc-900 border-zinc-300 hover:border-zinc-900',

  /** Tag editorial em pílula preta. */
  tag: 'inline-flex items-center gap-1 bg-zinc-900 text-white text-xs font-mono px-3 py-1 rounded-full tabular-nums',
} as const;

/** Cabeçalho de módulo centralizado em pílula preta. */
export function ModulePill({ index, children }: { index?: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-center">
      <h2 className="inline-flex items-center gap-2 bg-zinc-900 text-white rounded-full px-6 py-1.5 text-xs font-semibold uppercase tracking-widest">
        {index && <span className="font-mono tabular-nums text-zinc-400">{index}</span>}
        {children}
      </h2>
    </div>
  );
}

/** Subtítulo de seção alinhado à esquerda com linha divisória fina. */
export function SectionTitle({
  children,
  aside,
  as: Tag = 'h3',
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
  as?: 'h3' | 'h4';
}) {
  return (
    <div className="flex items-end justify-between gap-3 border-b border-zinc-200 pb-2">
      <Tag className="text-sm font-medium text-zinc-900">{children}</Tag>
      {aside && <div className="text-[11px] text-zinc-500">{aside}</div>}
    </div>
  );
}

/** Card de módulo: superfície + pílula central + conteúdo. */
export function ModuleCard({
  id,
  index,
  title,
  children,
}: {
  id?: string;
  index?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`${ui.surface} p-6 sm:p-7 scroll-mt-6`} aria-label={title}>
      <ModulePill index={index}>{title}</ModulePill>
      <div className="mt-6">{children}</div>
    </section>
  );
}
