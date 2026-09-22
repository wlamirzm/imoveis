import React, { useState } from 'react';
import { Search, MapPin, Target, X } from 'lucide-react';
import { geocodeAddress } from '../services/quintoAndarService';

export default function RadiusSearchControl({ onApplyRadiusSearch, onClearRadiusSearch, isSearching }) {
  const [addressInput, setAddressInput] = useState('Rua Padre Antônio José dos Santos, 500');
  const [selectedRadiusMeters, setSelectedRadiusMeters] = useState(1000); // 1km default
  const [activeSearchInfo, setActiveSearchInfo] = useState(null);

  const executeSearch = async (address, radius) => {
    if (!address.trim()) return;

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
    onClearRadiusSearch();
  };

  return (
    <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-4 shadow-xl mb-6">
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
          
          {/* Input de Endereço Alvo */}
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Digite qualquer endereço (Ex: Av. Engenheiro Luís Carlos Berrini, 1000 ou Rua Morumbi)..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full bg-[#0B131F] border border-slate-700 rounded-lg text-xs text-slate-100 pl-9 pr-4 py-2.5 focus:outline-none focus:border-remax-accent"
            />
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
