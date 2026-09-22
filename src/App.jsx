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
import { getDadosUrbanisticosPMSP } from './services/geosampaService';
import { fetchITBITransactions, calculateITBIMetrics } from './services/itbiService';
import { ITBIAnalyticsPanel } from './components/ITBIAnalyticsPanel';
import { Bot, CheckCircle2, Database, Landmark, Train } from 'lucide-react';

export default function App() {
  const [properties, setProperties] = useState(initialProperties);
  const [activeTab, setActiveTab] = useState('mapa'); // 'mapa' | 'analytics' | 'acm' | 'scraper'
  const [selectedBairro, setSelectedBairro] = useState('Todos os Bairros (Zona Sul)');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  
  // Estado da Busca por Raio Geográfico (Unificado para TODOS os Portais + PMSP GeoSampa)
  const [activeRadiusSearch, setActiveRadiusSearch] = useState(null);
  const [quintoAndarListings, setQuintoAndarListings] = useState([]);
  const [pmspInfoInRadius, setPmspInfoInRadius] = useState(null);
  const [itbiList, setItbiList] = useState([]);

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
    'Pipeline Supabase + PostGIS + GeoSampa PMSP ativo. Aguardando disparo de varredura...'
  ]);
  const [toastNotification, setToastNotification] = useState(null);

  // Carregar imóveis reais do Supabase e disparar busca por raio inicial no endereço padrão
  useEffect(() => {
    async function loadSupabaseData() {
      const dbProperties = await fetchPropertiesFromSupabase();
      if (dbProperties && dbProperties.length > 0) {
        setProperties(dbProperties);
        setIsSupabaseConnected(true);
        setScraperLogs(prev => [...prev, `✅ Conectado ao Supabase PostgreSQL (${dbProperties.length} imóveis na tabela 'properties')`]);
      }
      
      // Aplicar busca inicial focada no endereço padrão
      handleApplyRadiusSearch({
        addressText: 'Rua Padre Antônio José dos Santos, 500',
        displayName: 'Brooklin, São Paulo - SP',
        centerLat: -23.6080,
        centerLng: -46.6940,
        radiusMeters: 1000
      });
    }
    loadSupabaseData();
  }, []);

  const [itbiTimeframeMonths, setItbiTimeframeMonths] = useState(24); // 24 Meses default

  // Handler para Busca por Raio Geográfico Unificada (TODOS os Portais + PMSP GeoSampa + ITBI)
  const handleApplyRadiusSearch = async (searchInfo, timeframeMonths = itbiTimeframeMonths) => {
    setActiveRadiusSearch(searchInfo);
    
    // Extrair o nome do bairro do endereço procurado para titulação adequada
    let detectedBairro = "Brooklin";
    const textLower = (searchInfo.addressText + " " + (searchInfo.displayName || "")).toLowerCase();
    if (textLower.includes("moema")) detectedBairro = "Moema";
    else if (textLower.includes("morumbi")) detectedBairro = "Morumbi";
    else if (textLower.includes("campo belo")) detectedBairro = "Campo Belo";
    else if (textLower.includes("vila mariana")) detectedBairro = "Vila Mariana";
    else if (textLower.includes("itaim")) detectedBairro = "Itaim Bibi";
    else if (textLower.includes("santo amaro")) detectedBairro = "Santo Amaro";
    else if (textLower.includes("vila nova concei")) detectedBairro = "Vila Nova Conceição";

    // Gerar ofertas dos portais no raio exato
    const qaResults = generateQuintoAndarListingsInRadius(
      searchInfo.centerLat,
      searchInfo.centerLng,
      searchInfo.radiusMeters,
      detectedBairro
    );

    // Buscar transações de ITBI no raio geográfico nos últimos N meses (default: 24 meses)
    const fetchedItbi = await fetchITBITransactions(
      searchInfo.centerLat,
      searchInfo.centerLng,
      searchInfo.radiusMeters,
      timeframeMonths
    );
    setItbiList(fetchedItbi);

    // Calcular dados municipais da Prefeitura de SP no ponto central
    const pmspData = getDadosUrbanisticosPMSP(detectedBairro, 1850000);
    setPmspInfoInRadius(pmspData);

    setQuintoAndarListings(qaResults);
    setToastNotification(`Filtro de ${searchInfo.radiusMeters >= 1000 ? `${searchInfo.radiusMeters / 1000}km` : `${searchInfo.radiusMeters}m`} aplicado estritamente ao raio de ${searchInfo.addressText}!`);
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleITBITimeframeChange = (months) => {
    setItbiTimeframeMonths(months);
    if (activeRadiusSearch) {
      handleApplyRadiusSearch(activeRadiusSearch, months);
    }
  };

  const handleClearRadiusSearch = async () => {
    setActiveRadiusSearch(null);
    setQuintoAndarListings([]);
    setPmspInfoInRadius(null);
    const defaultItbi = await fetchITBITransactions(-23.6062, -46.6948, 2000);
    setItbiList(defaultItbi);
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

  // Imóveis consolidados: quando a Busca por Raio estiver ativa, observar EXCLUSIVAMENTE os imóveis do endereço pesquisado
  const allPropertiesCombined = useMemo(() => {
    if (activeRadiusSearch && quintoAndarListings.length > 0) {
      return quintoAndarListings;
    }
    return properties;
  }, [properties, quintoAndarListings, activeRadiusSearch]);

  // Filtragem Dinâmica dos Imóveis (Aplica o raio espacial a TODOS os portais)
  const filteredProperties = useMemo(() => {
    return allPropertiesCombined.filter(prop => {
      
      // Se a Busca por Raio estiver ativa, a distância geográfica ao centro define o perímetro
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
      } else {
        // Filtro por Bairro Dropdown do Header (somente aplicado quando NÃO houver busca espacial ativa)
        if (!selectedBairro.includes('Todos os Bairros') && prop.bairro !== selectedBairro) {
          return false;
        }
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

  // Preço Médio por m² Global no Raio
  const avgM2Price = useMemo(() => {
    if (filteredProperties.length === 0) return 0;
    const sum = filteredProperties.reduce((acc, p) => acc + p.precoM2, 0);
    return Math.round(sum / filteredProperties.length);
  }, [filteredProperties]);

  // Cálculo de Métricas Consolidadas de ITBI PMSP vs Anúncios Ativos
  const itbiMetrics = useMemo(() => {
    return calculateITBIMetrics(itbiList, filteredProperties);
  }, [itbiList, filteredProperties]);

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
        
        {/* Banner de Dados Municipais PMSP GeoSampa Ativos quando houver Busca por Raio */}
        {activeRadiusSearch && pmspInfoInRadius && (
          <div className="bg-gradient-to-r from-amber-500/10 via-remax-card to-emerald-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between text-xs gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block text-sm">
                  Dados Oficiais Prefeitura SP (GeoSampa + ITBI) no Raio de {activeRadiusSearch.radiusMeters >= 1000 ? `${activeRadiusSearch.radiusMeters / 1000}km` : `${activeRadiusSearch.radiusMeters}m`}
                </span>
                <span className="text-slate-400">
                  Endereço Alvo: <strong>{activeRadiusSearch.addressText}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-[#0B131F] px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Zoneamento PMSP:</span>
                <span className="font-bold text-amber-400">{pmspInfoInRadius.zoneamento}</span>
              </div>
              <div className="bg-[#0B131F] px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Vendas ITBI no Raio:</span>
                <span className="font-bold text-emerald-400">{itbiMetrics.totalVendas} imóveis</span>
              </div>
              <div className="bg-[#0B131F] px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Margem de Negociação:</span>
                <span className="font-bold text-emerald-400 font-mono">-{itbiMetrics.descontoMedioPct}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Módulo de Busca Espacial por Raio Geográfico Unificado */}
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

        {/* Painel Analítico de ITBI (Exibido nas Abas Mapa e Analytics) */}
        {(activeTab === 'mapa' || activeTab === 'analytics') && (
          <ITBIAnalyticsPanel
            metrics={itbiMetrics}
            itbiList={itbiList}
            selectedRadiusLabel={activeRadiusSearch ? (activeRadiusSearch.radiusMeters >= 1000 ? `${activeRadiusSearch.radiusMeters / 1000} km` : `${activeRadiusSearch.radiusMeters} m`) : '2 km'}
            onTimeframeChange={handleITBITimeframeChange}
          />
        )}

        {/* Renderização Condicional de Abas */}
        {activeTab === 'mapa' && (
          <PropertyMap
            properties={filteredProperties}
            onSelectForCma={handleSelectForCma}
            selectedBairro={selectedBairro}
            activeRadiusSearch={activeRadiusSearch}
            itbiList={itbiList}
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
          <p>© 2026 RE/MAX Brasil - Raio Geográfico Unificado (Portais + PMSP GeoSampa)</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>RE/MAX</span>
            <span>•</span>
            <span>QuintoAndar</span>
            <span>•</span>
            <span>ZAP</span>
            <span>•</span>
            <span>VivaReal</span>
            <span>•</span>
            <span>OLX</span>
            <span>•</span>
            <span>GeoSampa PMSP</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
