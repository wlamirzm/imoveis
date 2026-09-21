import React from 'react';
import { Search, Filter, X, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export default function FilterBar({ filters, setFilters, onResetFilters }) {
  return (
    <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-4 shadow-xl mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Search Text Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por endereço, bairro ou título do imóvel..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full bg-[#0B131F] border border-slate-700/70 rounded-lg text-sm text-slate-100 pl-9 pr-4 py-2.5 focus:outline-none focus:border-remax-accent focus:ring-1 focus:ring-remax-accent transition-all placeholder:text-slate-500"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Filter */}
          <div className="flex items-center bg-[#0B131F] p-1 rounded-lg border border-slate-700/70">
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filters.status === 'all'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'venda' }))}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filters.status === 'venda'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              À Venda
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'vendido' }))}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filters.status === 'vendido'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vendidos
            </button>
          </div>

          {/* Tipo de Imóvel */}
          <select
            value={filters.tipo}
            onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
            className="bg-[#0B131F] border border-slate-700/70 rounded-lg text-xs text-slate-200 px-3 py-2.5 focus:outline-none focus:border-remax-accent cursor-pointer"
          >
            <option value="all">Todos os Tipos</option>
            <option value="Apartamento">Apartamentos</option>
            <option value="Casa">Casas</option>
            <option value="Cobertura">Coberturas</option>
            <option value="Studio">Studios</option>
          </select>

          {/* Portal Origem */}
          <select
            value={filters.portal}
            onChange={(e) => setFilters(prev => ({ ...prev, portal: e.target.value }))}
            className="bg-[#0B131F] border border-slate-700/70 rounded-lg text-xs text-slate-200 px-3 py-2.5 focus:outline-none focus:border-remax-accent cursor-pointer"
          >
            <option value="all">Todos os Portais</option>
            <option value="RE/MAX">RE/MAX (Exclusivos)</option>
            <option value="ZAP Imóveis">ZAP Imóveis</option>
            <option value="VivaReal">VivaReal</option>
            <option value="OLX">OLX</option>
            <option value="Imovelweb">Imovelweb</option>
          </select>

          {/* Dormitórios */}
          <select
            value={filters.quartos}
            onChange={(e) => setFilters(prev => ({ ...prev, quartos: e.target.value }))}
            className="bg-[#0B131F] border border-slate-700/70 rounded-lg text-xs text-slate-200 px-3 py-2.5 focus:outline-none focus:border-remax-accent cursor-pointer"
          >
            <option value="all">Qualquer Nº Quartos</option>
            <option value="1">1+ Quarto</option>
            <option value="2">2+ Quartos</option>
            <option value="3">3+ Quartos</option>
            <option value="4">4+ Quartos</option>
          </select>

          {/* Limpar Filtros */}
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-2 hover:bg-slate-800 rounded-lg transition-all"
            title="Limpar Filtros"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
