import React, { useState } from 'react';
import { 
  Bot, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  ShieldAlert, 
  Database, 
  Globe, 
  Terminal, 
  Layers, 
  Layers3,
  Server,
  Sparkles
} from 'lucide-react';

export default function ScraperControl({ onTriggerScrape, isScraping, logs, scrapedCount }) {
  const [targetBairro, setTargetBairro] = useState('Moema');
  const [selectedPortals, setSelectedPortals] = useState({
    zap: true,
    vivareal: true,
    olx: true,
    remax: true
  });

  return (
    <div className="space-y-6">
      
      {/* Header Central de Coleta */}
      <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              Central de Ingestão & Scraping Automatizado
            </h2>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
              ETL em Tempo Real
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure e execute varredura automática nos portais imobiliários para atualização contínua de estoque e histórico de vendas.
          </p>
        </div>

        <button
          onClick={() => onTriggerScrape(targetBairro)}
          disabled={isScraping}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-xl ${
            isScraping
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
          }`}
        >
          <Play className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
          <span>{isScraping ? 'Coleta em Execução...' : 'Iniciar Varredura Agora'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Painel de Configuração */}
        <div className="lg:col-span-4 bg-[#131F2E] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-remax-accent" />
            Parâmetros da Ingestão
          </h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Selecione a Região Target</label>
            <select
              value={targetBairro}
              onChange={(e) => setTargetBairro(e.target.value)}
              className="w-full bg-[#0B131F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-remax-accent"
            >
              <option value="Moema">Moema - SP</option>
              <option value="Itaim Bibi">Itaim Bibi - SP</option>
              <option value="Pinheiros">Pinheiros - SP</option>
              <option value="Jardins">Jardins - SP</option>
              <option value="Vila Nova Conceição">Vila Nova Conceição - SP</option>
              <option value="Campo Belo">Campo Belo - SP</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-2">Portais Alvo</label>
            <div className="space-y-2">
              {[
                { id: 'zap', label: 'ZAP Imóveis (Scraper HTTP + API)', color: 'text-blue-400' },
                { id: 'vivareal', label: 'VivaReal (Web Crawler)', color: 'text-teal-400' },
                { id: 'olx', label: 'OLX Imóveis (Parsing de Anúncios)', color: 'text-amber-400' },
                { id: 'remax', label: 'RE/MAX Portal (Integração Direta)', color: 'text-remax-red' }
              ].map(portal => (
                <label key={portal.id} className="flex items-center gap-2 text-xs text-slate-300 bg-[#0B131F] p-2 rounded border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPortals[portal.id]}
                    onChange={() => setSelectedPortals({ ...selectedPortals, [portal.id]: !selectedPortals[portal.id] })}
                    className="rounded bg-slate-800 border-slate-700 text-remax-red focus:ring-0"
                  />
                  <span className={portal.color}>{portal.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stat Box de Saúde de Coleta */}
          <div className="bg-[#0B131F] border border-slate-800 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Taxa de Geocodificação:</span>
              <span className="font-bold text-emerald-400">98.4%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Deduplicação de Anúncios:</span>
              <span className="font-bold text-remax-accent">14.2% filtrados</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Frequência Automática:</span>
              <span className="font-bold text-white">A cada 6 horas</span>
            </div>
          </div>
        </div>

        {/* Terminal de Logs de Ingestão em Tempo Real */}
        <div className="lg:col-span-8 bg-[#0D1826] border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col h-96">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Console de Execução do Scraper (Live Terminal)
              </h3>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              Status: {isScraping ? 'RUNNING' : 'IDLE'}
            </span>
          </div>

          <div className="flex-1 bg-[#070D14] border border-slate-900 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-y-auto space-y-2">
            <p className="text-slate-500">// Terminal do Ingestion Pipeline v2.4 (RE/MAX)</p>
            {logs.length === 0 ? (
              <p className="text-slate-500">Pronto para execução. Clique em "Iniciar Varredura Agora".</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-slate-600 font-bold">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-slate-200">{log}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
