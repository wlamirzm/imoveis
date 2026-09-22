import React from 'react';
import { 
  MapPin, 
  BarChart3, 
  FileCheck2, 
  Bot, 
  RefreshCw, 
  Sparkles,
  Building2
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  selectedBairro, 
  setSelectedBairro, 
  onTriggerScrape, 
  isScraping,
  totalProperties,
  avgM2Price
}) {
  const bairrosDisponiveis = [
    "Todos os Bairros (Zona Sul + Zona Oeste)",
    "-- ZONA SUL --",
    "Brooklin",
    "Morumbi",
    "Portal do Morumbi",
    "Moema",
    "Campo Belo",
    "Vila Mariana",
    "Itaim Bibi",
    "Chácara Santo Antônio",
    "Santo Amaro",
    "Vila Nova Conceição",
    "-- ZONA OESTE --",
    "Butantã",
    "Pinheiros",
    "Vila Madalena",
    "Perdizes",
    "Alto de Pinheiros",
    "Vila Leopoldina",
    "Lapa",
    "Pompéia",
    "Jaguaré"
  ];

  return (
    <header className="bg-[#0D1826] border-b border-slate-800/80 sticky top-0 z-50 shadow-2xl">
      {/* Top Banner Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-4 border-b border-slate-800/50">
          
          {/* Logo CONEXPER & System Title */}
          <div className="flex items-center gap-3">
            <img 
              src="/logoConexper.png" 
              alt="CONEXPER Logo" 
              className="w-10 h-10 object-contain rounded-xl bg-slate-900/60 p-1 shadow-lg border border-slate-700/60" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  CONEXPER <span className="text-remax-red">Market</span> Intelligence <span className="text-xs text-slate-400 font-normal">(Zona Sul & Zona Oeste SP)</span>
                </h1>
                <span className="bg-remax-red/10 border border-remax-red/30 text-remax-red text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> ACM Pro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mapeamento Espacial, Coleta Automatizada & ACM (Brooklin, Morumbi, Butantã, Pinheiros, Perdizes...)
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Bairro Filter Zona Sul */}
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedBairro}
                onChange={(e) => setSelectedBairro(e.target.value)}
                className="bg-[#131F2E] border border-slate-700/80 rounded-lg text-sm text-slate-200 pl-9 pr-8 py-2 focus:outline-none focus:border-remax-accent focus:ring-1 focus:ring-remax-accent cursor-pointer transition-all"
              >
                {bairrosDisponiveis.map((b) => (
                  <option key={b} value={b} disabled={b.startsWith('--')}>{b}</option>
                ))}
              </select>
            </div>

            {/* Live Scraper Trigger Button */}
            <button
              onClick={onTriggerScrape}
              disabled={isScraping}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-md ${
                isScraping
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-remax-red to-rose-700 hover:from-rose-600 hover:to-remax-red text-white shadow-remax-red/20 hover:shadow-lg'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
              <span>{isScraping ? 'Coletando Dados...' : 'Coletar Dados (ZS + ZO)'}</span>
            </button>

            {/* Quick Stat Pill */}
            <div className="hidden lg:flex items-center gap-3 bg-[#131F2E] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block">Total Imóveis:</span>
                <span className="font-bold text-white text-sm">{totalProperties}</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-400 block">Preço Médio/m²:</span>
                <span className="font-bold text-remax-accent text-sm">
                  R$ {avgM2Price ? avgM2Price.toLocaleString('pt-BR') : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pt-2 pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('mapa')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'mapa'
                ? 'border-remax-red text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <MapPin className="w-4 h-4 text-remax-red" />
            <span>Mapa Espacial (Zona Sul)</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-remax-red text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-remax-accent" />
            <span>Inteligência & Preços ZS</span>
          </button>

          <button
            onClick={() => setActiveTab('acm')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'acm'
                ? 'border-remax-red text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Gerador de ACM (Avaliação RE/MAX)</span>
          </button>

          <button
            onClick={() => setActiveTab('scraper')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'scraper'
                ? 'border-remax-red text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span>Coletor & Portais Automáticos</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
