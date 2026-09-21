import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Calendar, 
  Tag, 
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

// Custom Marker Icons for Leaflet
const createCustomIcon = (status, isRemax, priceM2) => {
  let bgColor = '#0088FF'; // Default Venda Blue
  if (status === 'vendido') bgColor = '#10B981'; // Sold Emerald
  if (isRemax) bgColor = '#DC1C2D'; // RE/MAX Red

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 11px;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
        transform: translate(-50%, -100%);
      ">
        ${isRemax ? '🎈' : '🏠'} R$ ${Math.round(priceM2 / 1000)}k/m²
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 30]
  });
};

// Componente para re-centralizar o mapa quando o bairro muda
function MapCenterUpdater({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function PropertyMap({ properties, onSelectForCma, selectedBairro }) {
  const [activeProperty, setActiveProperty] = useState(null);

  // Determinar centro do mapa baseado nas propriedades
  const defaultCenter = properties.length > 0 
    ? [properties[0].lat, properties[0].lng] 
    : [-23.6035, -46.6612]; // Moema default

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[600px]">
      
      {/* Coluna Esquerda: Lista Interativa de Imóveis Mapeados */}
      <div className="lg:col-span-4 flex flex-col bg-[#131F2E] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-[#0D1826] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-remax-red" />
              Imóveis Mapeados
            </h3>
            <p className="text-xs text-slate-400">
              {properties.length} imóveis na região {selectedBairro !== 'Todos os Bairros' ? `(${selectedBairro})` : ''}
            </p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono">
            {properties.filter(p => p.status === 'venda').length} À Venda / {properties.filter(p => p.status === 'vendido').length} Vendidos
          </span>
        </div>

        {/* Scrollable Property Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {properties.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MapPin className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">Nenhum imóvel encontrado com os filtros atuais.</p>
            </div>
          ) : (
            properties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => setActiveProperty(prop)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  activeProperty?.id === prop.id
                    ? 'border-remax-red bg-slate-800/80 shadow-lg ring-1 ring-remax-red'
                    : 'border-slate-800 bg-[#0B131F]/60 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex gap-3">
                  {/* Thumbnail Image */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900">
                    <img 
                      src={prop.imagem} 
                      alt={prop.title}
                      className="w-full h-full object-cover" 
                    />
                    <span className={`absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      prop.status === 'vendido' 
                        ? 'bg-emerald-600 text-white' 
                        : prop.remaxExclusivo 
                          ? 'bg-remax-red text-white' 
                          : 'bg-blue-600 text-white'
                    }`}>
                      {prop.status === 'vendido' ? 'VENDIDO' : prop.portal}
                    </span>
                  </div>

                  {/* Property Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-semibold text-slate-100 truncate" title={prop.title}>
                        {prop.title}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {prop.endereco} - {prop.bairro}
                    </p>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-sm font-black text-white">
                        R$ {prop.preco.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[11px] font-bold text-remax-accent">
                        (R$ {prop.precoM2.toLocaleString('pt-BR')}/m²)
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>{prop.area}m²</span>
                        <span>•</span>
                        <span>{prop.quartos} qts</span>
                        <span>•</span>
                        <span>{prop.vagas} vag</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectForCma(prop);
                        }}
                        className="text-[10px] bg-remax-red/20 text-remax-red hover:bg-remax-red hover:text-white px-2 py-0.5 rounded font-medium transition-all"
                      >
                        + Usar na ACM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Coluna Direita: Mapa Interativo Leaflet */}
      <div className="lg:col-span-8 bg-[#131F2E] border border-slate-800 rounded-xl overflow-hidden shadow-xl relative flex flex-col">
        
        {/* Map Header Controls */}
        <div className="p-3 bg-[#0D1826] border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-remax-red"></span> RE/MAX Exclusivo
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Portais À Venda
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Imóvel Vendido
            </span>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Clique no pino para ver a análise de m²
          </span>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="flex-1 w-full h-full relative">
          <MapContainer 
            center={defaultCenter} 
            zoom={14} 
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <MapCenterUpdater center={defaultCenter} />

            {properties.map((prop) => (
              <Marker
                key={prop.id}
                position={[prop.lat, prop.lng]}
                icon={createCustomIcon(prop.status, prop.remaxExclusivo, prop.precoM2)}
                eventHandlers={{
                  click: () => setActiveProperty(prop)
                }}
              >
                <Popup>
                  <div className="w-64 text-slate-100 p-1">
                    <div className="relative h-32 rounded-lg overflow-hidden mb-2">
                      <img src={prop.imagem} alt={prop.title} className="w-full h-full object-cover" />
                      <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                        prop.status === 'vendido' ? 'bg-emerald-600' : prop.remaxExclusivo ? 'bg-remax-red' : 'bg-blue-600'
                      }`}>
                        {prop.status === 'vendido' ? 'IMÓVEL VENDIDO' : prop.portal}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-white leading-tight mb-1">{prop.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-2">{prop.endereco} - {prop.bairro}</p>

                    <div className="bg-[#0B131F] p-2 rounded-lg border border-slate-800 mb-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] text-slate-400">Preço Anunciado:</span>
                        <span className="text-sm font-black text-white">R$ {prop.preco.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-slate-400">Preço por m²:</span>
                        <span className="text-xs font-bold text-remax-accent">R$ {prop.precoM2.toLocaleString('pt-BR')}/m²</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-300 text-center mb-3 bg-slate-800/40 py-1.5 rounded">
                      <div><strong className="block text-white">{prop.area}m²</strong> Área</div>
                      <div><strong className="block text-white">{prop.quartos}</strong> Quartos</div>
                      <div><strong className="block text-white">{prop.vagas}</strong> Vagas</div>
                    </div>

                    <button
                      onClick={() => onSelectForCma(prop)}
                      className="w-full py-1.5 bg-remax-red hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Adicionar na ACM RE/MAX
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
