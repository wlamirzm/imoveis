import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import RadiusSearchControl from './components/RadiusSearchControl';
import PropertyMap from './components/PropertyMap';
import MarketAnalytics from './components/MarketAnalytics';
import CmaReportGenerator from './components/CmaReportGenerator';
import ScraperControl from './components/ScraperControl';

import { initialProperties } from './data/mockProperties';
import { runScraperJob } from './services/scraperService';
import { fetchPropertiesFromSupabase, savePropertyToSupabase } from './lib/supabaseClient';
import { generateQuintoAndarListingsInRadius, calculateHaversineDistanceMeters } from './services/quintoAndarService';
import { Bot, CheckCircle2, Database } from 'lucide-react';

export default function App() {
  const [properties, setProperties] = useState(initialProperties);
  const [activeTab, setActiveTab] = useState('mapa'); // 'mapa' | 'analytics' | 'acm' | 'scraper'
  const [selectedBairro, setSelectedBairro] = useState('Todos os Bairros (Zona Sul)');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  
  // Estado da Busca por Raio Geográfico (QuintoAndar + RE/MAX)
  const [activeRadiusSearch, setActiveRadiusSearch] = useState(null);
  const [quintoAndarListings, setQuintoAndarListings] = useState([]);

  // Imóvel selecionado para a ACM
  const [selectedForCma, setSelectedForCma] = useState(null);

  // Filtros de busca
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    tipo: 'all',
    portal: 'all',
    quartos: 'all'
  });

  // Estado do Scraper Automatizado
  const [isScraping, setIsScraping] = useState(false);
  const [scraperLogs, setScraperLogs] = useState([
    'Pipeline Supabase + QuintoAndar + PostGIS conectado. Aguardando disparo de varredura...'
  ]);
  const [toastNotification, setToastNotification] = useState(null);

  // Carregar imóveis reais do Supabase na inicialização
  useEffect(() => {
    async function loadSupabaseData() {
      const dbProperties = await fetchPropertiesFromSupabase();
      if (dbProperties && dbProperties.length > 0) {
        setProperties(dbProperties);
        setIsSupabaseConnected(true);
        setScraperLogs(prev => [...prev, `✅ Conectado ao Supabase PostgreSQL (${dbProperties.length} imóveis na tabela 'properties')`]);
      }
    }
    loadSupabaseData();
  }, []);

  // Handler para Busca por Raio Geográfico em torno de um endereço
  const handleApplyRadiusSearch = (searchInfo) => {
    setActiveRadiusSearch(searchInfo);
    
    // Gerar anúncios do QuintoAndar no raio selecionado
    const qaResults = generateQuintoAndarListingsInRadius(
      searchInfo.centerLat,
      searchInfo.centerLng,
      searchInfo.radiusMeters,
      "Brooklin"
    );

    setQuintoAndarListings(qaResults);
    setToastNotification(`Busca por raio de ${searchInfo.radiusMeters >= 1000 ? `${searchInfo.radiusMeters / 1000}km` : `${searchInfo.radiusMeters}m`} aplicada! ${qaResults.length} ofertas QuintoAndar encontradas.`);
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleClearRadiusSearch = () => {
    setActiveRadiusSearch(null);
    setQuintoAndarListings([]);
  };

  // Handler para disparar a Coleta Automatizada e gravar no Supabase
  const handleTriggerScrape = async (targetBairroParam) => {
    const bairroToScrape = (targetBairroParam && !targetBairroParam.includes('Todos os Bairros'))
      ? targetBairroParam
      : (selectedBairro.includes('Todos os Bairros') ? 'Brooklin' : selectedBairro);

    setIsScraping(true);
    setScraperLogs([`🚀 Disparando tarefa de coleta para ${bairroToScrape} (Zona Sul SP)...`]);

    const newProperties = await runScraperJob(bairroToScrape, (logMessage) => {
      setScraperLogs(prev => [...prev, logMessage]);
    });

    // Salvar novos imóveis raspados no Supabase
    for (const prop of newProperties) {
      await savePropertyToSupabase(prop);
    }

    setProperties(prev => [...newProperties, ...prev]);
    setIsScraping(false);
    
    // Toast Notification
    setToastNotification(`+${newProperties.length} novos imóveis coletados e salvos no Supabase em ${bairroToScrape}!`);
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Resetar Filtros
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      tipo: 'all',
      portal: 'all',
      quartos: 'all'
    });
    setSelectedBairro('Todos os Bairros (Zona Sul)');
  };

  // Imóveis consolidados (Base Principal + QuintoAndar no Raio)
  const allPropertiesCombined = useMemo(() => {
    return [...quintoAndarListings, ...properties];
  }, [properties, quintoAndarListings]);

  // Filtragem Dinâmica dos Imóveis (suportando filtro espacial por raio)
  const filteredProperties = useMemo(() => {
    return allPropertiesCombined.filter(prop => {
      
      // Se busca por raio estiver ativa, filtrar estritamente pela distância Haversine ao ponto central
      if (activeRadiusSearch) {
        const distMeters = calculateHaversineDistanceMeters(
          activeRadiusSearch.centerLat,
          activeRadiusSearch.centerLng,
          prop.lat,
          prop.lng
        );
        prop.distanciaDoAlvoM = distMeters;
        if (distMeters > activeRadiusSearch.radiusMeters) {
          return false;
        }
      }

      // Filtro por Bairro Dropdown do Header
      if (!selectedBairro.includes('Todos os Bairros') && prop.bairro !== selectedBairro) {
        return false;
      }

      // Filtro por Busca Textual
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = prop.title.toLowerCase().includes(query);
        const matchesAddress = prop.endereco.toLowerCase().includes(query);
        const matchesBairro = prop.bairro.toLowerCase().includes(query);
        if (!matchesTitle && !matchesAddress && !matchesBairro) return false;
      }

      // Filtro por Status
      if (filters.status !== 'all' && prop.status !== filters.status) {
        return false;
      }

      // Filtro por Tipo de Imóvel
      if (filters.tipo !== 'all' && prop.tipo !== filters.tipo) {
        return false;
      }

      // Filtro por Portal
      if (filters.portal !== 'all' && prop.portal !== filters.portal) {
        return false;
      }

      // Filtro por Quartos
      if (filters.quartos !== 'all') {
        const minQuartos = Number(filters.quartos);
        if (prop.quartos < minQuartos) return false;
      }

      return true;
    });
  }, [allPropertiesCombined, selectedBairro, filters, activeRadiusSearch]);

  // Preço Médio por m² Global
  const avgM2Price = useMemo(() => {
    if (filteredProperties.length === 0) return 0;
    const sum = filteredProperties.reduce((acc, p) => acc + p.precoM2, 0);
    return Math.round(sum / filteredProperties.length);
  }, [filteredProperties]);

  // Handler para selecionar um imóvel no mapa e ir direto para a ACM
  const handleSelectForCma = (property) => {
    setSelectedForCma({
      title: property.title,
      bairro: property.bairro,
      endereco: property.endereco,
      area: property.area,
      quartos: property.quartos,
      suites: property.suites,
      vagas: property.vagas,
      precoAlvo: property.preco,
      corretor: "Corretor RE/MAX Integrado"
    });
    setActiveTab('acm');
  };

  return (
    <div className="min-h-screen bg-[#0B131F] text-slate-100 flex flex-col font-sans">
      
      {/* Toast Floating Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-bold">{toastNotification}</span>
        </div>
      )}

      {/* Header com Marca RE/MAX e Seletor de Abas */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedBairro={selectedBairro}
        setSelectedBairro={setSelectedBairro}
        onTriggerScrape={() => handleTriggerScrape()}
        isScraping={isScraping}
        totalProperties={filteredProperties.length}
        avgM2Price={avgM2Price}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Supabase & QuintoAndar Status Banner */}
        <div className="bg-[#131F2E] border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-medium">Banco de Dados Espacial PostGIS + QuintoAndar:</span>
            <span className="font-bold text-white font-mono">Supabase PostgreSQL</span>
          </div>
          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
            ● QuintoAndar Radius Search Actived
          </span>
        </div>

        {/* Módulo de Busca Espacial por Raio Geográfico (QuintoAndar) */}
        {(activeTab === 'mapa' || activeTab === 'analytics') && (
          <RadiusSearchControl
            onApplyRadiusSearch={handleApplyRadiusSearch}
            onClearRadiusSearch={handleClearRadiusSearch}
            isSearching={isScraping}
          />
        )}

        {/* Barra de Filtros Tradicionais */}
        {(activeTab === 'mapa' || activeTab === 'analytics') && (
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* Renderização Condicional de Abas */}
        {activeTab === 'mapa' && (
          <PropertyMap
            properties={filteredProperties}
            onSelectForCma={handleSelectForCma}
            selectedBairro={selectedBairro}
            activeRadiusSearch={activeRadiusSearch}
          />
        )}

        {activeTab === 'analytics' && (
          <MarketAnalytics
            properties={filteredProperties}
            selectedBairro={selectedBairro}
          />
        )}

        {activeTab === 'acm' && (
          <CmaReportGenerator
            properties={properties}
            initialSubjectProperty={selectedForCma}
          />
        )}

        {activeTab === 'scraper' && (
          <ScraperControl
            onTriggerScrape={handleTriggerScrape}
            isScraping={isScraping}
            logs={scraperLogs}
            scrapedCount={properties.length}
          />
        )}
      </main>

      {/* Footer Profissional RE/MAX */}
      <footer className="bg-[#070D14] border-t border-slate-800 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 RE/MAX Brasil - Busca por Raio QuintoAndar & PostGIS</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>QuintoAndar</span>
            <span>•</span>
            <span>ZAP</span>
            <span>•</span>
            <span>VivaReal</span>
            <span>•</span>
            <span>RE/MAX Exclusivos</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
