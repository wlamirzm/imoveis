// Motor de Simulação de Ingestão & Scraping Automatizado de Portais Imobiliários

const PORTALS = ["ZAP Imóveis", "VivaReal", "OLX", "Imovelweb", "RE/MAX Portal"];
const NEIGHBORHOOD_COORDS = {
  "Moema": { lat: -23.6035, lng: -46.6612, baseM2: 15200 },
  "Itaim Bibi": { lat: -23.5850, lng: -46.6750, baseM2: 19800 },
  "Pinheiros": { lat: -23.5650, lng: -46.6880, baseM2: 13900 },
  "Jardins": { lat: -23.5700, lng: -46.6700, baseM2: 16500 },
  "Vila Nova Conceição": { lat: -23.5930, lng: -46.6670, baseM2: 22400 },
  "Campo Belo": { lat: -23.6180, lng: -46.6710, baseM2: 12500 },
  "Perdizes": { lat: -23.5350, lng: -46.6720, baseM2: 11800 }
};

const PROPERTY_TYPES = ["Apartamento", "Cobertura", "Casa", "Studio"];

/**
 * Gera um novo imóvel coletado via scraping para o bairro selecionado
 */
export function generateScrapedProperty(bairroTarget = "Moema", forceStatus = null) {
  const coords = NEIGHBORHOOD_COORDS[bairroTarget] || NEIGHBORHOOD_COORDS["Moema"];
  
  // Variação leve nas coordenadas (raio de ~1km)
  const latOffset = (Math.random() - 0.5) * 0.015;
  const lngOffset = (Math.random() - 0.5) * 0.015;
  
  const area = Math.floor(Math.random() * (220 - 45) + 45);
  // Preço por m² com variação estatística de ±12%
  const m2Variation = 1 + (Math.random() - 0.5) * 0.24;
  const precoM2 = Math.round(coords.baseM2 * m2Variation);
  const preco = Math.round((area * precoM2) / 10000) * 10000;
  
  const tipo = PROPERTY_TYPES[Math.floor(Math.random() * PROPERTY_TYPES.length)];
  const quartos = area > 140 ? 4 : area > 85 ? 3 : area > 55 ? 2 : 1;
  const suites = Math.min(quartos, Math.floor(Math.random() * quartos) + 1);
  const vagas = area > 150 ? 3 : area > 80 ? 2 : 1;
  
  const portal = PORTALS[Math.floor(Math.random() * PORTALS.length)];
  const isRemax = portal === "RE/MAX Portal";
  const status = forceStatus || (Math.random() > 0.35 ? "venda" : "vendido");
  
  const idNum = Math.floor(1000 + Math.random() * 9000);
  
  const images = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
  ];
  
  return {
    id: `SCRAP-${idNum}`,
    code: `${portal.substring(0,3).toUpperCase()}-${idNum}`,
    title: `${tipo} ${area}m² - ${quartos} dorms (${bairroTarget})`,
    bairro: bairroTarget,
    cidade: "São Paulo",
    estado: "SP",
    endereco: `Rua Coletada Automática, ${Math.floor(Math.random() * 900) + 10}`,
    tipo: tipo,
    preco: preco,
    area: area,
    precoM2: precoM2,
    quartos: quartos,
    suites: suites,
    vagas: vagas,
    banheiros: suites + 1,
    condominio: Math.round(area * 11),
    iptu: Math.round(area * 3.5),
    status: status,
    portal: portal,
    remaxExclusivo: isRemax,
    diasNoMercado: Math.floor(Math.random() * 60) + 3,
    dataAnuncio: new Date(Date.now() - Math.random() * 45 * 86400000).toISOString().split('T')[0],
    dataVenda: status === "vendido" ? new Date().toISOString().split('T')[0] : null,
    lat: coords.lat + latOffset,
    lng: coords.lng + lngOffset,
    imagem: images[Math.floor(Math.random() * images.length)],
    corretor: isRemax ? "Corretor RE/MAX Integrado" : "Captação Automática Portal",
    contato: "(11) 98000-1122"
  };
}

/**
 * Executa uma rodada simulada de scraping com logs em tempo real
 */
export async function runScraperJob(bairro, onLogProgress) {
  const steps = [
    { msg: `🌐 Conectando aos portais (ZAP, VivaReal, OLX, RE/MAX) para o bairro ${bairro}...`, delay: 600 },
    { msg: `🔍 Varrendo 14 páginas de anúncios e extraindo metadados de preço e m²...`, delay: 900 },
    { msg: `⚡ Executando algoritmo de geocodificação e coordenadas de geolocalização...`, delay: 700 },
    { msg: `🧹 Higienizando e aplicando regras de deduplicação (Removendo duplicatas idênticas)...`, delay: 800 },
    { msg: `📊 Recalculando preço médio por m² e métricas de absorção para ${bairro}...`, delay: 500 },
    { msg: `✅ Ingestão finalizada com sucesso! Novos anúncios armazenados no banco de dados.`, delay: 400 }
  ];

  for (const step of steps) {
    onLogProgress(step.msg);
    await new Promise(resolve => setTimeout(resolve, step.delay));
  }

  // Retorna 3 novos imóveis raspados
  return [
    generateScrapedProperty(bairro, "venda"),
    generateScrapedProperty(bairro, "venda"),
    generateScrapedProperty(bairro, "vendido")
  ];
}
