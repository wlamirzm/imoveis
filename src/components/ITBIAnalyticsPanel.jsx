import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export function ITBIAnalyticsPanel({ metrics, itbiList = [], selectedRadiusLabel = '1 km', onTimeframeChange }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(24); // 24 Meses default

  const handleTimeframeClick = (months) => {
    setSelectedTimeframe(months);
    if (onTimeframeChange) {
      onTimeframeChange(months);
    }
  };

  const chartData = [
    {
      name: 'Média da Região',
      'Anunciado (Portais)': metrics.precoMedioM2Anunciado,
      'Real Pago (ITBI PMSP)': metrics.precoMedioM2Real,
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 text-white shadow-2xl">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              Dados Oficiais PMSP (Últimos {selectedTimeframe} Meses)
            </span>
            <span className="text-xs text-slate-400">Arrecadação Municipal ITBI (3%)</span>
          </div>
          <h2 className="text-2xl font-bold mt-2 text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 10 11-18 0 9 9 0 0118 0z" />
            </svg>
            Análise de Vendas Concretizadas & ITBI no Raio ({selectedRadiusLabel})
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Imóveis efetivamente vendidos e escriturados com imposto pago na Prefeitura de SP nos últimos {selectedTimeframe} meses.
          </p>
        </div>

        {/* Seletor de Janela Temporal (12m vs 24m) & Margem */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleTimeframeClick(12)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTimeframe === 12
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              12 Meses
            </button>
            <button
              onClick={() => handleTimeframeClick(24)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTimeframe === 24
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              24 Meses
            </button>
          </div>

          <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/30 px-4 py-2.5 rounded-xl">
            <div className="text-right">
              <p className="text-xs text-emerald-400 font-medium">Desconto Médio de Fechamento</p>
              <p className="text-2xl font-extrabold text-emerald-400">-{metrics.descontoMedioPct}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Chave */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Metric 1 */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vendas Efetivadas ({selectedTimeframe} Meses)</p>
          <p className="text-3xl font-bold text-white mt-1">{metrics.totalVendas} <span className="text-sm font-normal text-slate-400">imóveis</span></p>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            Escrituradas na PMSP
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Preço Real por m² (ITBI)</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">
            R$ {metrics.precoMedioM2Real.toLocaleString('pt-BR')} <span className="text-sm font-normal text-slate-400">/m²</span>
          </p>
          <p className="text-xs text-slate-400 mt-2">Valor oficial em cartório</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Preço Pedido (Anúncios)</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">
            R$ {metrics.precoMedioM2Anunciado.toLocaleString('pt-BR')} <span className="text-sm font-normal text-slate-400">/m²</span>
          </p>
          <p className="text-xs text-slate-400 mt-2">QuintoAndar, ZAP, RE/MAX, OLX</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Volume Financeiro Total</p>
          <p className="text-2xl font-bold text-sky-400 mt-1">
            R$ {(metrics.volumeFinanceiroTotal / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-slate-400 mt-2">
            R$ {(metrics.totalItbiArrecadado / 1000).toFixed(0)}k arrecadados em ITBI (3%)
          </p>
        </div>
      </div>

      {/* Seção Gráfica e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico comparativo m² */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 lg:col-span-1 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center justify-between">
            <span>Comparativo m²: Anunciado vs Real</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} format={(val) => `R$ ${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  formatter={(val) => [`R$ ${Number(val).toLocaleString('pt-BR')}/m²`]}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Anunciado (Portais)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Real Pago (ITBI PMSP)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Transações de ITBI Efetivadas */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 lg:col-span-2 overflow-x-auto">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center justify-between">
            <span>Últimas Transações ITBI Concretizadas (PMSP - {selectedTimeframe} Meses)</span>
            <span className="text-xs text-slate-400">{itbiList.length} registros no raio</span>
          </h3>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
              <tr>
                <th className="p-2.5">SQL (Inscrição)</th>
                <th className="p-2.5">Endereço / Bairro</th>
                <th className="p-2.5">Área (m²)</th>
                <th className="p-2.5">Valor Venda</th>
                <th className="p-2.5">Preço m²</th>
                <th className="p-2.5">Data Imposto</th>
                <th className="p-2.5">Distância</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {itbiList.length > 0 ? (
                itbiList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-2.5 font-mono text-slate-400 text-[11px]">{item.sql}</td>
                    <td className="p-2.5">
                      <div className="font-medium text-white">{item.logradouro}, {item.numero}</div>
                      <div className="text-[11px] text-slate-400">{item.bairro} ({item.distrito})</div>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-200">{item.areaM2} m²</td>
                    <td className="p-2.5 font-semibold text-emerald-400">
                      R$ {item.valorTransacao.toLocaleString('pt-BR')}
                    </td>
                    <td className="p-2.5 text-slate-200 font-medium">
                      R$ {Math.round(item.precoM2Real).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-2.5 text-slate-400 font-mono text-[11px]">
                      {item.dataArrecadacao}
                    </td>
                    <td className="p-2.5 text-slate-400">
                      {item.distanciaM < 1000 ? `${item.distanciaM}m` : `${(item.distanciaM / 1000).toFixed(1)}km`}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500">
                    Nenhuma transação de ITBI registrada nos últimos {selectedTimeframe} meses neste raio geográfico.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
