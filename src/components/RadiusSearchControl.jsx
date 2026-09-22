import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Target, X, Building, Navigation } from 'lucide-react';
import { geocodeAddress } from '../services/quintoAndarService';

// Base de sugestões de endereços populares e de alta demanda na Zona Sul de SP
const POPULAR_ZONA_SUL_ADDRESSES = [
  { text: 'Rua Guilherme Dumont Villares, 1200', bairro: 'Portal do Morumbi', desc: 'Portal do Morumbi / Vila Andrade, São Paulo - SP' },
  { text: 'Rua Guilherme Dumont Villares, 500', bairro: 'Morumbi', desc: 'Vila Andrade, São Paulo - SP' },
  { text: 'Rua Padre Antônio José dos Santos, 500', bairro: 'Brooklin', desc: 'Brooklin Novo, São Paulo - SP' },
  { text: 'Av. Engenheiro Luís Carlos Berrini, 1050', bairro: 'Brooklin', desc: 'Polo Comercial Berrini, SP' },
  { text: 'Rua Florida, 880', bairro: 'Brooklin', desc: 'Próximo à Berrini, SP' },
  { text: 'Rua Arizona, 420', bairro: 'Brooklin', desc: 'Brooklin, SP' },
  { text: 'Av. Moema, 450', bairro: 'Moema', desc: 'Moema Pássaros, SP' },
  { text: 'Alameda dos Maracatins, 890', bairro: 'Moema', desc: 'Moema Indios, SP' },
  { text: 'Alameda Jauaperi, 550', bairro: 'Moema', desc: 'Próximo ao Metrô Moema, SP' },
  { text: 'Rua Marechal Hastimphilo de Moura, 320', bairro: 'Portal do Morumbi', desc: 'Portal do Morumbi / Vila Andrade, SP' },
  { text: 'Av. Giovanni Gronchi, 6000', bairro: 'Portal do Morumbi', desc: 'Portal do Morumbi, SP' },
  { text: 'Rua Dr. Pedro de Melo, 180', bairro: 'Morumbi', desc: 'Vila Andrade / Morumbi, SP' },
  { text: 'Rua Deputado Laércio Corte, 1200', bairro: 'Morumbi', desc: 'Panamby / Morumbi, SP' },
  { text: 'Rua Engenheiro Oscar Americano, 850', bairro: 'Morumbi', desc: 'Alto do Morumbi, SP' },
  { text: 'Rua Pascal, 1200', bairro: 'Campo Belo', desc: 'Campo Belo, SP' },
  { text: 'Rua Vieira de Morais, 640', bairro: 'Campo Belo', desc: 'Eixo Comercial Campo Belo, SP' },
  { text: 'Rua Vergueiro, 2400', bairro: 'Vila Mariana', desc: 'Próximo Metrô Ana Rosa, SP' },
  { text: 'Rua Domingos de Morais, 1500', bairro: 'Vila Mariana', desc: 'Vila Mariana, SP' },
  { text: 'Rua Clodomiro Amazonas, 500', bairro: 'Itaim Bibi', desc: 'Itaim Bibi, SP' },
  { text: 'Rua Joaquim Floriano, 800', bairro: 'Itaim Bibi', desc: 'Itaim Bibi, SP' },
  { text: 'Av. Adolfo Pinheiro, 900', bairro: 'Santo Amaro', desc: 'Metrô Adolfo Pinheiro, SP' },
  { text: 'Rua Alexandre Dumas, 1500', bairro: 'Chácara Santo Antônio', desc: 'Chácara Santo Antônio, SP' },
  { text: 'Rua Praça Cidade de Milão, 100', bairro: 'Vila Nova Conceição', desc: 'Próximo ao Parque Ibirapuera, SP' }
];

export default function RadiusSearchControl({ onApplyRadiusSearch, onClearRadiusSearch, isSearching }) {
  const [addressInput, setAddressInput] = useState('Rua Padre Antônio José dos Santos, 500');
  const [selectedRadiusMeters, setSelectedRadiusMeters] = useState(1000); // 1km default
  const [activeSearchInfo, setActiveSearchInfo] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef(null);

  // Fechar dropdown ao clicar fora do componente
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar sugestões enquanto o usuário digita
  const handleInputChange = (e) => {
    const value = e.target.value;
    setAddressInput(value);

    if (value.trim().length >= 2) {
      const queryLower = value.toLowerCase();
      const filtered = POPULAR_ZONA_SUL_ADDRESSES.filter(item => 
        item.text.toLowerCase().includes(queryLower) ||
        item.bairro.toLowerCase().includes(queryLower) ||
        item.desc.toLowerCase().includes(queryLower)
      );
      setSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const executeSearch = async (address, radius) => {
    if (!address.trim()) return;

    setShowDropdown(false);
    const coords = await geocodeAddress(address);
    const searchInfo = {
      addressText: address,
      displayName: coords.displayName,
      centerLat: coords.lat,
      centerLng: coords.lng,
      radiusMeters: radius
    };

    setActiveSearchInfo(searchInfo);
    onApplyRadiusSearch(searchInfo);
  };

  const handleSelectSuggestion = (suggestionText) => {
    setAddressInput(suggestionText);
    setShowDropdown(false);
    executeSearch(suggestionText, selectedRadiusMeters);
  };

  const handleExecuteSearch = (e) => {
    e.preventDefault();
    executeSearch(addressInput, selectedRadiusMeters);
  };

  const handleRadiusChange = (newRadiusMeters) => {
    setSelectedRadiusMeters(newRadiusMeters);
    if (addressInput.trim()) {
      executeSearch(addressInput, newRadiusMeters);
    }
  };

  const handleClear = () => {
    setActiveSearchInfo(null);
    setAddressInput('');
    setSuggestions([]);
    setShowDropdown(false);
    onClearRadiusSearch();
  };

  return (
    <div ref={containerRef} className="bg-[#131F2E] border border-slate-800 rounded-xl p-4 shadow-xl mb-6 relative">
      <form onSubmit={handleExecuteSearch} className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-remax-red animate-pulse" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Busca Espacial por Raio Geográfico (Todos os Portais + PMSP GeoSampa)
            </h3>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-remax-red"></span> RE/MAX</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> QuintoAndar</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> ZAP/VivaReal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> OLX</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> GeoSampa PMSP</span>
          </div>

          {activeSearchInfo && (
            <span className="bg-remax-red/20 text-remax-red border border-remax-red/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              ● Raio de {activeSearchInfo.radiusMeters >= 1000 ? `${activeSearchInfo.radiusMeters / 1000} km` : `${activeSearchInfo.radiusMeters}m`} Ativo
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          
          {/* Input de Endereço Alvo com Dropdown Autocomplete */}
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <input
              type="text"
              placeholder="Digite um endereço ou bairro (Ex: Portal do Morumbi, Berrini, Moema)..."
              value={addressInput}
              onChange={handleInputChange}
              onFocus={() => {
                if (addressInput.trim().length >= 2) handleInputChange({ target: { value: addressInput } });
              }}
              className="w-full bg-[#0B131F] border border-slate-700 rounded-lg text-xs text-slate-100 pl-9 pr-4 py-2.5 focus:outline-none focus:border-remax-accent"
            />

            {/* Dropdown de Sugestões Autocomplete */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F1A2A] border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSuggestion(item.text)}
                    className="p-3 hover:bg-slate-800/80 cursor-pointer transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-remax-red/10 text-remax-red rounded-lg flex-shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white truncate">{item.text}</p>
                        <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700 flex-shrink-0">
                      {item.bairro}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seletor de Raio */}
          <div className="flex items-center gap-1.5 bg-[#0B131F] p-1 rounded-lg border border-slate-700">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Raio:</span>
            {[
              { label: '100m', val: 100 },
              { label: '250m', val: 250 },
              { label: '500m', val: 500 },
              { label: '1km', val: 1000 },
              { label: '2km', val: 2000 },
              { label: '5km', val: 5000 }
            ].map(r => (
              <button
                key={r.val}
                type="button"
                onClick={() => handleRadiusChange(r.val)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  selectedRadiusMeters === r.val
                    ? 'bg-remax-red text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Botão de Pesquisa */}
          <button
            type="submit"
            disabled={isSearching}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-remax-red to-rose-700 hover:from-rose-600 hover:to-remax-red text-white font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Filtrar Raio (Portais + PMSP)</span>
          </button>

          {activeSearchInfo && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-all"
              title="Limpar Busca por Raio"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
