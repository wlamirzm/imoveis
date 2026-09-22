import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { calculateHaversineDistanceMeters } from '../services/quintoAndarService';
import { exportPropertiesToExcel } from '../utils/excelExporter';
import { getCapturaTagInfo } from '../utils/dateUtils';
import { 
  Building2, 
  MapPin, 
  Sparkles,
  Layers, 
  Download
} from 'lucide-react';

// Tile Layers 100% Livres & Gratuitos para Leaflet / OpenStreetMap
const MAP_STYLES = {
  osmStandard: {
    name: 'OpenStreetMap (Padrão Oficial Livre)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  },
  esriSatellite: {
    name: 'Satélite (Esri World Imagery)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri'
  }
};

const formatPrecoMapTag = (preco) => {
  if (!preco) return 'R$ --';
  if (preco >= 1000000) {
    const val = (preco / 1000000).toFixed(2).replace('.', ',').replace(',00', '');
    return `R$ ${val}M`;
  }
  return `R$ ${Math.round(preco / 1000)}k`;
};

// Custom Marker Icons para Leaflet (Preço Pedido do Imóvel)
const createCustomIcon = (status, isRemax, preco, portal) => {
  let bgColor = '#0088FF'; // Default Venda Blue
  if (status === 'vendido') bgColor = '#10B981'; // Sold Emerald
  if (isRemax) bgColor = '#DC1C2D'; // RE/MAX Red
  if (portal === 'QuintoAndar') bgColor = '#7C3AED'; // QuintoAndar Purple

  const priceLabel = formatPrecoMapTag(preco);

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 11px;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        user-select: none;
      ">
        ${portal === 'QuintoAndar' ? '🟣' : isRemax ? '🎈' : '🏠'} ${priceLabel}
      </div>
    `,
    iconSize: [95, 30],
    iconAnchor: [47, 30]
  });
};

// Componente para re-centralizar o mapa e aplicar raio de 50m no imóvel selecionado
function MapCenterUpdater({ center, radiusMeters, focusLocation }) {
  const map = useMap();

  React.useEffect(() => {
    if (focusLocation) {
      // Zoom level 19 enquadra com precisão o raio de 50 metros do imóvel
      map.setView([focusLocation.lat, focusLocation.lng], 19, { animate: true });
    } else if (center) {
      const zoomLevel = radiusMeters ? (radiusMeters <= 100 ? 18 : radiusMeters <= 250 ? 17 : radiusMeters <= 500 ? 16 : radiusMeters <= 1000 ? 15 : 14) : 14;
      map.setView(center, zoomLevel, { animate: true });
    }
  }, [center, radiusMeters, focusLocation, map]);

  return null;
}

export default function PropertyMap({ properties, onSelectForCma, activeRadiusSearch, itbiList = [] }) {
  const [activeProperty, setActiveProperty] = useState(null);
  const [selectedStyleKey, setSelectedStyleKey] = useState('osmStandard');
  const [showITBILayer, setShowITBILayer] = useState(true);

  const currentTileStyle = MAP_STYLES[selectedStyleKey];

  // Filtragem estrita dos imóveis que estão rigorosamente DENTRO do raio selecionado
  const displayProperties = useMemo(() => {
    if (!activeRadiusSearch) return properties;

    return properties
      .map(prop => {
        const dist = calculateHaversineDistanceMeters(
          activeRadiusSearch.centerLat,
          activeRadiusSearch.centerLng,
          prop.lat,
          prop.lng
        );
        return { ...prop, distanciaDoAlvoM: dist };
      })
      .filter(prop => prop.distanciaDoAlvoM <= activeRadiusSearch.radiusMeters)
      .sort((a, b) => a.distanciaDoAlvoM - b.distanciaDoAlvoM);
  }, [properties, activeRadiusSearch]);

  // Filtragem estrita dos registros de ITBI que estão rigorosamente DENTRO do raio selecionado
  const filteredItbiList = useMemo(() => {
    if (!activeRadiusSearch) return itbiList;

    return itbiList
      .map(itbi => {
        const dist = calculateHaversineDistanceMeters(
          activeRadiusSearch.centerLat,
          activeRadiusSearch.centerLng,
          itbi.lat,
          itbi.lng
        );
        return { ...itbi, distanciaM: dist };
      })
      .filter(itbi => itbi.distanciaM <= activeRadiusSearch.radiusMeters)
      .sort((a, b) => a.distanciaM - b.distanciaM);
  }, [itbiList, activeRadiusSearch]);

  // Determinar centro do mapa baseado na busca por raio ou no primeiro imóvel
  const defaultCenter = activeRadiusSearch
    ? [activeRadiusSearch.centerLat, activeRadiusSearch.centerLng]
    : (displayProperties.length > 0 ? [displayProperties[0].lat, displayProperties[0].lng] : [-23.6080, -46.6940]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[600px]">
      
      {/* Coluna Esquerda: Lista Interativa de Imóveis Mapeados */}
      <div className="lg:col-span-4 flex flex-col bg-[#131F2E] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-[#0D1826] flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-remax-red" />
              Imóveis no Perímetro {activeRadiusSearch ? `(${activeRadiusSearch.radiusMeters >= 1000 ? `${activeRadiusSearch.radiusMeters / 1000}km` : `${activeRadiusSearch.radiusMeters}m`})` : ''}
            </h3>
            <p className="text-xs text-slate-400">
              {displayProperties.length} imóveis estritamente dentro do raio {activeRadiusSearch ? `de ${activeRadiusSearch.radiusMeters}m` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => exportPropertiesToExcel(displayProperties, activeRadiusSearch?.addressText, activeRadiusSearch?.radiusMeters)}
              disabled={displayProperties.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Exportar imóveis no perímetro para planilha Excel (.csv/.xls)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono hidden sm:inline-block">
              {displayProperties.filter(p => p.portal === 'QuintoAndar').length} QuintoAndar
            </span>
          </div>
        </div>

        {/* Scrollable Property Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {displayProperties.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MapPin className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">Nenhum imóvel encontrado dentro do perímetro selecionado.</p>
            </div>
          ) : (
            displayProperties.map((prop) => {
              const capturaInfo = getCapturaTagInfo(prop.dataUltimaCaptura, prop.dataAnuncio);

              return (
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
                        prop.portal === 'QuintoAndar'
                          ? 'bg-purple-600 text-white'
                          : prop.status === 'vendido' 
                            ? 'bg-emerald-600 text-white' 
                            : prop.remaxExclusivo 
                              ? 'bg-remax-red text-white' 
                              : 'bg-blue-600 text-white'
                      }`}>
                        {prop.portal}
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

                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${capturaInfo.badgeClass}`}>
                          {capturaInfo.text}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="text-sm font-black text-white">
                          R$ {prop.preco.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-[11px] font-bold text-remax-accent">
                          (R$ {prop.precoM2.toLocaleString('pt-BR')}/m²)
                        </span>
                      </div>

                      {prop.distanciaDoAlvoM && (
                        <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
                          📍 a {prop.distanciaDoAlvoM}m do endereço alvo
                        </span>
                      )}

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
              );
            })
          )}
        </div>
      </div>

      {/* Coluna Direita: Mapa Interativo Leaflet (Com Círculo de Raio) */}
      <div className="lg:col-span-8 bg-[#131F2E] border border-slate-800 rounded-xl overflow-hidden shadow-xl relative flex flex-col">
        
        {/* Map Header Controls */}
        <div className="p-3 bg-[#0D1826] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-remax-red"></span> RE/MAX Exclusivo
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> QuintoAndar
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Portais À Venda
            </span>
            <label className="flex items-center gap-1.5 text-emerald-400 font-semibold cursor-pointer bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 rounded">
              <input 
                type="checkbox" 
                checked={showITBILayer} 
                onChange={(e) => setShowITBILayer(e.target.checked)}
                className="accent-emerald-500" 
              />
              📄 Exibir ITBI PMSP ({itbiList.length})
            </label>
          </div>

          {/* Seletor de Camada de Mapa Livre */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedStyleKey}
              onChange={(e) => setSelectedStyleKey(e.target.value)}
              className="bg-[#131F2E] border border-slate-700/80 rounded-lg text-xs text-slate-200 px-2.5 py-1.5 focus:outline-none focus:border-remax-accent cursor-pointer"
            >
              {Object.entries(MAP_STYLES).map(([key, style]) => (
                <option key={key} value={key}>{style.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="flex-1 w-full h-full relative">
          {activeProperty && (
            <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
              <button
                onClick={() => setActiveProperty(null)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-1.5 transition-all border border-amber-300 cursor-pointer animate-pulse"
              >
                🎯 Raio de 50m Ativo — Voltar à Visão Geral
              </button>
            </div>
          )}
          <MapContainer 
            center={defaultCenter} 
            zoom={14} 
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              key={selectedStyleKey}
              attribution={currentTileStyle.attribution}
              url={currentTileStyle.url}
            />
            
            <MapCenterUpdater 
              center={defaultCenter} 
              radiusMeters={activeRadiusSearch ? activeRadiusSearch.radiusMeters : null}
              focusLocation={activeProperty ? { lat: activeProperty.lat, lng: activeProperty.lng } : null}
            />

            {/* Círculo do Raio de Busca Geral */}
            {activeRadiusSearch && (
              <Circle
                center={[activeRadiusSearch.centerLat, activeRadiusSearch.centerLng]}
                radius={activeRadiusSearch.radiusMeters}
                pathOptions={{
                  color: '#DC1C2D',
                  fillColor: '#DC1C2D',
                  fillOpacity: 0.12,
                  weight: 2,
                  dashArray: '6, 6'
                }}
              />
            )}

            {/* Raio Específico de 50 metros do Imóvel Selecionado */}
            {activeProperty && (
              <Circle
                center={[activeProperty.lat, activeProperty.lng]}
                radius={50}
                pathOptions={{
                  color: '#F59E0B',
                  fillColor: '#F59E0B',
                  fillOpacity: 0.35,
                  weight: 3
                }}
              />
            )}

            {/* Marcador do Centro do Endereço Alvo */}
            {activeRadiusSearch && (
              <Marker
                position={[activeRadiusSearch.centerLat, activeRadiusSearch.centerLng]}
                icon={L.divIcon({
                  className: 'target-center-pin',
                  html: `
                    <div style="
                      background-color: #DC1C2D;
                      color: white;
                      padding: 6px 10px;
                      border-radius: 20px;
                      font-weight: 800;
                      font-size: 11px;
                      border: 3px solid white;
                      box-shadow: 0 0 20px rgba(220,28,45,0.8);
                      white-space: nowrap;
                      cursor: pointer;
                      user-select: none;
                    ">
                      🎯 Endereço Alvo
                    </div>
                  `,
                  iconSize: [100, 34],
                  iconAnchor: [50, 34]
                })}
              />
            )}

            {/* Marcadores das Transações de ITBI da PMSP */}
            {showITBILayer && filteredItbiList.map((itbi) => (
              <Marker
                key={itbi.id}
                position={[itbi.lat, itbi.lng]}
                icon={L.divIcon({
                  className: 'itbi-map-pin',
                  html: `
                    <div style="
                      background-color: #10B981;
                      color: white;
                      padding: 3px 6px;
                      border-radius: 10px;
                      font-weight: 800;
                      font-size: 10px;
                      border: 2px solid white;
                      box-shadow: 0 4px 10px rgba(16,185,129,0.5);
                      white-space: nowrap;
                      cursor: pointer;
                      user-select: none;
                    ">
                      📄 ITBI R$ ${Math.round(itbi.precoM2Real / 1000)}k/m²
                    </div>
                  `,
                  iconSize: [80, 26],
                  iconAnchor: [40, 26]
                })}
              >
                <Popup>
                  <div className="w-60 text-slate-100 p-1">
                    <div className="bg-emerald-950/80 border border-emerald-500/40 p-2 rounded-lg mb-2 text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Venda Concretizada (ITBI PMSP)</span>
                      <p className="text-lg font-black text-emerald-400 mt-0.5">R$ {itbi.valorTransacao.toLocaleString('pt-BR')}</p>
                      <p className="text-xs font-semibold text-slate-200">R$ {Math.round(itbi.precoM2Real).toLocaleString('pt-BR')}/m²</p>
                    </div>
                    <p className="text-xs font-bold text-white leading-tight">{itbi.logradouro}, {itbi.numero}</p>
                    <p className="text-[11px] text-slate-400 mb-2">{itbi.bairro} ({itbi.distrito})</p>
                    <div className="text-[11px] space-y-1 text-slate-300 border-t border-slate-800 pt-2">
                      <p><b>SQL:</b> <span className="font-mono text-slate-400">{itbi.sql}</span></p>
                      <p><b>Área Construída:</b> {itbi.areaM2} m²</p>
                      <p><b>ITBI Pago (3%):</b> R$ {itbi.valorItbi.toLocaleString('pt-BR')}</p>
                      <p><b>Data do Imposto:</b> {itbi.dataArrecadacao}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {displayProperties.map((prop) => {
              const popupCaptura = getCapturaTagInfo(prop.dataUltimaCaptura, prop.dataAnuncio);

              return (
                <Marker
                  key={prop.id}
                  position={[prop.lat, prop.lng]}
                  icon={createCustomIcon(prop.status, prop.remaxExclusivo, prop.preco, prop.portal)}
                  eventHandlers={{
                    click: () => setActiveProperty(prop)
                  }}
                >
                  <Popup>
                    <div className="w-64 text-slate-100 p-1">
                      <div className="relative h-32 rounded-lg overflow-hidden mb-2">
                        <img src={prop.imagem} alt={prop.title} className="w-full h-full object-cover" />
                        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                          prop.portal === 'QuintoAndar' ? 'bg-purple-600' : prop.status === 'vendido' ? 'bg-emerald-600' : prop.remaxExclusivo ? 'bg-remax-red' : 'bg-blue-600'
                        }`}>
                          {prop.portal}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-white leading-tight mb-1">{prop.title}</h4>
                      <p className="text-[11px] text-slate-400 mb-1.5">{prop.endereco} - {prop.bairro}</p>

                      <div className="mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded border block text-center ${popupCaptura.badgeClass}`}>
                          {popupCaptura.text}
                        </span>
                      </div>

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

                      <button
                        onClick={() => onSelectForCma(prop)}
                        className="w-full py-1.5 bg-remax-red hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 shadow-md"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Adicionar na ACM RE/MAX
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
