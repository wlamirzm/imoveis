import React from 'react';
import { 
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Building, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieIcon,
  ShieldCheck
} from 'lucide-react';
import { historicalPriceData, portalDistribution } from '../data/mockProperties';

export default function MarketAnalytics({ properties, selectedBairro }) {
  // Cálculo de KPIs dinâmicos baseados nas propriedades filtradas
  const activeProps = properties.filter(p => p.status === 'venda');
  const soldProps = properties.filter(p => p.status === 'vendido');

  const avgM2 = properties.length > 0
    ? Math.round(properties.reduce((acc, p) => acc + p.precoM2, 0) / properties.length)
    : 0;

  const avgTicket = properties.length > 0
    ? Math.round(properties.reduce((acc, p) => acc + p.preco, 0) / properties.length)
    : 0;

  const avgDaysOnMarket = properties.length > 0
    ? Math.round(properties.reduce((acc, p) => acc + p.diasNoMercado, 0) / properties.length)
    : 0;

  // Agrupamento de estatísticas por bairro da ZONA SUL SP
  const bairrosStats = ["Brooklin", "Morumbi", "Moema", "Campo Belo", "Vila Mariana", "Santo Amaro", "Chácara Santo Antônio", "Vila Nova Conceição"].map(bairroName => {
    const list = properties.filter(p => p.bairro === bairroName);
    const countVenda = list.filter(p => p.status === 'venda').length;
    const countVendido = list.filter(p => p.status === 'vendido').length;
    
    const baseM2Map = {
      "Brooklin": 14500,
      "Morumbi": 8900,
      "Moema": 15300,
      "Campo Belo": 12800,
      "Vila Mariana": 13500,
      "Santo Amaro": 9800,
      "Chácara Santo Antônio": 11900,
      "Vila Nova Conceição": 23200
    };

    const fallbackStatsMap = {
      "Brooklin": { ativos: 18, vendidos: 7, liquidezDias: 28 },
      "Morumbi": { ativos: 22, vendidos: 5, liquidezDias: 42 },
      "Moema": { ativos: 15, vendidos: 9, liquidezDias: 22 },
      "Campo Belo": { ativos: 14, vendidos: 6, liquidezDias: 31 },
      "Vila Mariana": { ativos: 16, vendidos: 8, liquidezDias: 25 },
      "Santo Amaro": { ativos: 12, vendidos: 4, liquidezDias: 38 },
      "Chácara Santo Antônio": { ativos: 10, vendidos: 5, liquidezDias: 33 },
      "Vila Nova Conceição": { ativos: 9, vendidos: 6, liquidezDias: 19 }
    };
    const fallback = fallbackStatsMap[bairroName] || { ativos: 12, vendidos: 5, liquidezDias: 30 };

    const m2 = list.length > 0 
      ? Math.round(list.reduce((sum, p) => sum + p.precoM2, 0) / list.length) 
      : (baseM2Map[bairroName] || 13500);
    
    return {
      bairro: bairroName,
      precoM2: m2,
      ativos: countVenda > 0 ? countVenda : fallback.ativos,
      vendidos: countVendido > 0 ? countVendido : fallback.vendidos,
      liquidezDias: fallback.liquidezDias
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Cards KPI de Topo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Preço Médio / m² */}
        <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preço Médio / m² ZS</span>
            <div className="p-2 bg-remax-accent/10 text-remax-accent rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">R$ {avgM2.toLocaleString('pt-BR')}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +5.1%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Média consolidada em {selectedBairro}</p>
        </div>

        {/* Card 2: Ticket Médio de Mercado */}
        <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Médio ZS</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">R$ {(avgTicket / 1000000).toFixed(2)}M</span>
            <span className="text-xs text-slate-400">por imóvel</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Valor médio de listagem na Zona Sul</p>
        </div>

        {/* Card 3: Estoque Ativo vs Vendidos */}
        <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estoque & Vendas ZS</span>
            <div className="p-2 bg-remax-red/10 text-remax-red rounded-lg">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-black text-white">{activeProps.length}</span>
              <span className="text-xs text-slate-400 block">À Venda</span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <span className="text-2xl font-black text-emerald-400">{soldProps.length}</span>
              <span className="text-xs text-slate-400 block">Vendidos</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Taxa de absorção de {Math.round((soldProps.length / (properties.length || 1)) * 100)}%</p>
        </div>

        {/* Card 4: Tempo Médio no Mercado (DOM) */}
        <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tempo no Mercado (DOM)</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{avgDaysOnMarket} dias</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5" /> -4 dias
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Média de liquidez na Zona Sul</p>
        </div>
      </div>

      {/* Seção Gráfica Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfico 1: Evolução Histórica do m² nos Bairros da ZONA SUL */}
        <div className="lg:col-span-8 bg-[#131F2E] border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-remax-accent" />
                Evolução do Preço Médio / m² (Bairros da Zona Sul SP)
              </h3>
              <p className="text-xs text-slate-400">Histórico de valorização imobiliária nos últimos 12 meses</p>
            </div>
            <span className="text-xs bg-remax-accent/10 text-remax-accent px-2.5 py-1 rounded-full font-medium">
              Zona Sul SP 📈
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalPriceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBrooklin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC1C2D" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#DC1C2D" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMoema" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0088FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="mes" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={['dataMin - 1000', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B131F', borderColor: '#1E293B', borderRadius: '8px', color: '#fff' }} 
                  formatter={(val) => [`R$ ${val.toLocaleString('pt-BR')}/m²`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Brooklin" stroke="#DC1C2D" fillOpacity={1} fill="url(#colorBrooklin)" name="Brooklin" />
                <Area type="monotone" dataKey="Moema" stroke="#0088FF" fillOpacity={1} fill="url(#colorMoema)" name="Moema" />
                <Area type="monotone" dataKey="VilaMariana" stroke="#10B981" fillOpacity={0} fill="none" name="Vila Mariana" />
                <Area type="monotone" dataKey="CampoBelo" stroke="#E5A93C" fillOpacity={0} fill="none" name="Campo Belo" />
                <Area type="monotone" dataKey="Morumbi" stroke="#A855F7" fillOpacity={0} fill="none" name="Morumbi" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Origem das Capturas (Portais vs RE/MAX Exclusivos) */}
        <div className="lg:col-span-4 bg-[#131F2E] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-remax-red" />
              Share de Anúncios na Zona Sul
            </h3>
            <p className="text-xs text-slate-400 mb-4">Participação de mercado por portal</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portalDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portalDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B131F', borderColor: '#1E293B', borderRadius: '8px', color: '#fff' }}
                  formatter={(val) => [`${val}% do Mercado ZS`]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-white">42%</span>
              <span className="text-[10px] text-remax-red font-bold uppercase">RE/MAX Leader</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mt-2">
            {portalDistribution.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Inteligência por Bairro da ZONA SUL */}
      <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Benchmarking e Liquidez de Bairros na Zona Sul (SP)
            </h3>
            <p className="text-xs text-slate-400">Comparativo de valor m² e velocidade de vendas (Morumbi, Brooklin, Moema...)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-[#0B131F] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Bairro (Zona Sul)</th>
                <th className="py-3 px-4">Preço Médio / m²</th>
                <th className="py-3 px-4">Estoque (À Venda)</th>
                <th className="py-3 px-4">Vendidos (Últimos 60d)</th>
                <th className="py-3 px-4">Tempo Médio (DOM)</th>
                <th className="py-3 px-4 text-right">Oportunidade RE/MAX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bairrosStats.map((row) => (
                <tr key={row.bairro} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-remax-red"></span>
                    {row.bairro}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-remax-accent">
                    R$ {row.precoM2.toLocaleString('pt-BR')}/m²
                  </td>
                  <td className="py-3 px-4">{row.ativos} imóveis</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{row.vendidos} imóveis</td>
                  <td className="py-3 px-4">{row.liquidezDias} dias</td>
                  <td className="py-3 px-4 text-right">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold">
                      Alta Exclusividade
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
