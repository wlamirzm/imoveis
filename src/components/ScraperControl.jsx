import React, { useState } from 'react';
import { 
  Bot, 
  Play, 
  Globe, 
  Terminal,
  Link,
  Search,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { processListingUrl, saveExtractedProperty } from '../services/realScraperService';

export default function ScraperControl({ onTriggerScrape, isScraping, logs, _scrapedCount }) {
  const [targetBairro, setTargetBairro] = useState('Brooklin');
  const [selectedPortals, setSelectedPortals] = useState({
    zap: true,
    vivareal: true,
    olx: true,
    remax: true
  });

  // Estado do Validador de URL Real
  const [inputUrl, setInputUrl] = useState('');
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  const [urlMessage, setUrlMessage] = useState(null);
  const [isSavingSupabase, setIsSavingSupabase] = useState(false);

  // Executa teste/validação de link de anúncio real
  const handleTestUrl = async (e) => {
    e.preventDefault();
    if (!inputUrl || !inputUrl.trim()) return;

    setIsValidatingUrl(true);
    setExtractedResult(null);
    setUrlMessage(null);

    const result = await processListingUrl(inputUrl.trim());
    setIsValidatingUrl(false);

    if (result && result.property) {
      setExtractedResult(result.property);
      setUrlMessage({
        type: 'success',
        text: `Anúncio extraído com sucesso do portal ${result.portal}! ${result.note || ''}`
      });
    } else {
      setUrlMessage({
        type: 'error',
        text: 'Não foi possível extrair os dados desta URL. Verifique o link e tente novamente.'
      });
    }
  };

  // Salva imóvel extraído diretamente no Supabase
  const handleSaveToSupabase = async () => {
    if (!extractedResult) return;
    setIsSavingSupabase(true);
    await saveExtractedProperty(extractedResult);
    setIsSavingSupabase(false);

    setUrlMessage({
      type: 'success',
      text: `✅ Imóvel '${extractedResult.code}' salvo com sucesso no banco PostgreSQL do Supabase!`
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Central de Ingestão */}
      <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              Central de Ingestão & Validação de Anúncios Reais
            </h2>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
              PostgreSQL + PostGIS Ativo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Valide a raspagem de links reais de anúncios imobiliários ou execute varreduras automáticas na Zona Sul.
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
          <span>{isScraping ? 'Coleta em Execução...' : 'Disparar Varredura na Região'}</span>
        </button>
      </div>

      {/* Módulo 1: Validador de Links Reais de Anúncios (URL Tester) */}
      <div className="bg-[#131F2E] border border-amber-500/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <Link className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Validador de Anúncios Reais (URL Tester & Extração)</h3>
            <p className="text-xs text-slate-400">Cole a URL de qualquer anúncio (ZAP, VivaReal, OLX, QuintoAndar, RE/MAX) para validar os dados e salvar no Supabase.</p>
          </div>
        </div>

        <form onSubmit={handleTestUrl} className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder="Cole a URL do imóvel (ex: https://www.zapimoveis.com.br/imovel/... ou https://www.quintoandar.com.br/imovel/...)"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-[#0B131F] border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isValidatingUrl}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isValidatingUrl ? 'Analisando URL...' : 'Testar Extração de Link'}</span>
          </button>
        </form>

        {/* Notificação / Status do Teste */}
        {urlMessage && (
          <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
            urlMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {urlMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{urlMessage.text}</span>
          </div>
        )}

        {/* Card de Pré-visualização do Imóvel Extraído */}
        {extractedResult && (
          <div className="mt-5 bg-[#0B131F] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <img 
                src={extractedResult.imagem} 
                alt={extractedResult.title} 
                className="w-24 h-20 object-cover rounded-lg border border-slate-700" 
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-remax-accent/20 text-remax-accent text-[10px] font-bold px-2 py-0.5 rounded">
                    {extractedResult.portal}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{extractedResult.code}</span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{extractedResult.title}</h4>
                <p className="text-xs text-slate-400">{extractedResult.endereco}</p>
                <div className="flex items-center gap-3 text-xs pt-1">
                  <span className="font-extrabold text-emerald-400">R$ {extractedResult.preco.toLocaleString('pt-BR')}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300">{extractedResult.area} m²</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-remax-accent">R$ {extractedResult.precoM2.toLocaleString('pt-BR')}/m²</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              {extractedResult.urlOriginal && (
                <a
                  href={extractedResult.urlOriginal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 text-xs flex items-center gap-1 font-bold"
                  title="Abrir Anúncio Original"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={handleSaveToSupabase}
                disabled={isSavingSupabase}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSavingSupabase ? 'Salvando no Banco...' : 'Salvar no Supabase'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Painel de Configuração da Varredura */}
        <div className="lg:col-span-4 bg-[#131F2E] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-remax-accent" />
            Parâmetros da Ingestão Regional
          </h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Selecione a Região Target</label>
            <select
              value={targetBairro}
              onChange={(e) => setTargetBairro(e.target.value)}
              className="w-full bg-[#0B131F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-remax-accent"
            >
              <option value="Brooklin">Brooklin - SP</option>
              <option value="Moema">Moema - SP</option>
              <option value="Morumbi">Morumbi - SP</option>
              <option value="Portal do Morumbi">Portal do Morumbi - SP</option>
              <option value="Itaim Bibi">Itaim Bibi - SP</option>
              <option value="Campo Belo">Campo Belo - SP</option>
              <option value="Vila Mariana">Vila Mariana - SP</option>
              <option value="Vila Nova Conceição">Vila Nova Conceição - SP</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-2">Portais Monitorados</label>
            <div className="space-y-2">
              {[
                { id: 'zap', label: 'ZAP Imóveis (Parsing SSR / JSON-LD)', color: 'text-blue-400' },
                { id: 'vivareal', label: 'VivaReal (Extrator de Anúncios)', color: 'text-teal-400' },
                { id: 'olx', label: 'OLX Imóveis (Web Crawler)', color: 'text-amber-400' },
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
              <span>Frequência Cron (Vercel):</span>
              <span className="font-bold text-white">A cada 6 horas</span>
            </div>
          </div>
        </div>

        {/* Terminal de Logs de Ingestão em Tempo Real */}
        <div className="lg:col-span-8 bg-[#0D1826] border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col h-[420px]">
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
            <p className="text-slate-500">// Terminal do Ingestion Pipeline v2.5 (RE/MAX + Supabase)</p>
            {logs.length === 0 ? (
              <p className="text-slate-500">Pronto para execução. Cole uma URL acima ou clique em "Disparar Varredura na Região".</p>
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
