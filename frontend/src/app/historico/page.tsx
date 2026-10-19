import type { Metadata } from 'next';
import Link from 'next/link';
import HistoricoCPF from '../../components/HistoricoCPF';
import { IconArrowRight } from '../../components/ui/Icons';

export const metadata: Metadata = {
  title: 'Histórico por CPF | Defensoria Pública',
  description: 'Consulta do histórico de atendimentos de um assistido a partir do CPF.',
};

/** Rota /historico — página com a padronização visual da branch main. */
export default function HistoricoPage() {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Navegação" className="mb-6 flex items-center justify-between">
          <Link
            id="historico-voltar-painel"
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 transition-colors shadow-sm"
          >
            <IconArrowRight className="w-3.5 h-3.5 rotate-180" />
            Voltar ao painel
          </Link>
          <span className="text-xs font-medium text-slate-500">Defensoria Pública • Desafio EDA</span>
        </nav>

        <h1 className="sr-only">Histórico de atendimentos por CPF</h1>
        <HistoricoCPF />
      </main>
    </div>
  );
}
