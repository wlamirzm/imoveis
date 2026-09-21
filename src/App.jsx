import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import PropertyMap from './components/PropertyMap';
import MarketAnalytics from './components/MarketAnalytics';
import CmaReportGenerator from './components/CmaReportGenerator';
import ScraperControl from './components/ScraperControl';

import { initialProperties } from './data/mockProperties';
import { runScraperJob } from './services/scraperService';
import { Bot, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [properties, setProperties] = useState(initialProperties);
  const [activeTab, setActiveTab] = useState('mapa'); // 'mapa' | 'analytics' | 'acm' | 'scraper'
  const [selectedBairro, setSelectedBairro] = useState('Todos os Bairros');
  
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
    'Pipeline inicializado. Aguardando disparo de varredura...'
  ]);
  const [toastNotification, setToastNotification] = useState(null);

  // Handler para disparar a Coleta Automatizada
  const handleTriggerScrape = async (targetBairroParam) => {
    const bairroToScrape = (targetBairroParam && targetBairroParam !== 'Todos os Bairros')
      ? targetBairroParam
      : (selectedBairro !== 'Todos os Bairros' ? selectedBairro : 'Moema');

    setIsScraping(true);
    setScraperLogs([`🚀 Disparando tarefa de coleta para ${bairroToScrape}...`]);

    const newProperties = await runScraperJob(bairroToScrape, (logMessage) => {
      setScraperLogs(prev => [...prev, logMessage]);
    });

    setProperties(prev => [...newProperties, ...prev]);
    setIsScraping(false);
    
    // Toast Notification
    setToastNotification(`+${newProperties.length} novos imóveis coletados em ${bairroToScrape}!`);
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
    setSelectedBairro('Todos os Bairros');
  };

  // Filtragem Dinâmica dos Imóveis
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // Filtro por Bairro Dropdown do Header
      if (selectedBairro !== 'Todos os Bairros' && prop.bairro !== selectedBairro) {
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
  }, [properties, selectedBairro, filters]);

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
        
        {/* Barra de Filtros (visível em Mapa e Analytics) */}
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
          <p>© 2026 RE/MAX Brasil - Sistema de Inteligência Geográfica & ACM Imobiliária</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>ZAP Imóveis</span>
            <span>•</span>
            <span>VivaReal</span>
            <span>•</span>
            <span>OLX</span>
            <span>•</span>
            <span>RE/MAX Exclusivos</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
