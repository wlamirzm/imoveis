// Motor de Simulação de Ingestão & Scraping Automatizado de Portais Imobiliários - Focado na ZONA SUL de São Paulo

const PORTALS = ["ZAP Imóveis", "VivaReal", "OLX", "Imovelweb", "RE/MAX Portal"];
const NEIGHBORHOOD_COORDS = {
  "Brooklin": { lat: -23.6105, lng: -46.6880, baseM2: 14500 },
  "Morumbi": { lat: -23.6120, lng: -46.7210, baseM2: 8900 },
  "Moema": { lat: -23.6035, lng: -46.6612, baseM2: 15300 },
  "Campo Belo": { lat: -23.6180, lng: -46.6710, baseM2: 12800 },
  "Vila Mariana": { lat: -23.5890, lng: -46.6380, baseM2: 13500 },
  "Itaim Bibi": { lat: -23.5850, lng: -46.6750, baseM2: 19800 },
  "Chácara Santo Antônio": { lat: -23.6260, lng: -46.7020, baseM2: 11900 },
  "Santo Amaro": { lat: -23.6500, lng: -46.7070, baseM2: 9800 },
  "Vila Nova Conceição": { lat: -23.5930, lng: -46.6670, baseM2: 23200 }
};

const PROPERTY_TYPES = ["Apartamento", "Cobertura", "Casa", "Studio"];

/**
 * Gera um novo imóvel coletado via scraping para o bairro selecionado da Zona Sul
 */
export function generateScrapedProperty(bairroTarget = "Brooklin", forceStatus = null) {
  const coords = NEIGHBORHOOD_COORDS[bairroTarget] || NEIGHBORHOOD_COORDS["Brooklin"];
  
  // Variação leve nas coordenadas (raio de ~1km)
  const latOffset = (Math.random() - 0.5) * 0.015;
  const lngOffset = (Math.random() - 0.5) * 0.015;
  
  const area = Math.floor(Math.random() * (240 - 50) + 50);
  // Preço por m² com variação estatística de ±12%
  const m2Variation = 1 + (Math.random() - 0.5) * 0.24;
  const precoM2 = Math.round(coords.baseM2 * m2Variation);
  const preco = Math.round((area * precoM2) / 10000) * 10000;
  
  const tipo = PROPERTY_TYPES[Math.floor(Math.random() * PROPERTY_TYPES.length)];
  const quartos = area > 150 ? 4 : area > 85 ? 3 : area > 55 ? 2 : 1;
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
    title: `${tipo} ${area}m² - ${quartos} dorms (${bairroTarget} - Zona Sul)`,
    bairro: bairroTarget,
    cidade: "São Paulo",
    estado: "SP",
    zona: "Zona Sul",
    endereco: `Rua Coletada Automática ZS, ${Math.floor(Math.random() * 900) + 10}`,
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
    corretor: isRemax ? "Corretor RE/MAX Zona Sul" : "Captação Automática Portal",
    contato: "(11) 98000-1122"
  };
}

/**
 * Executa uma rodada simulada de scraping para a Zona Sul com logs em tempo real
 */
export async function runScraperJob(bairro, onLogProgress) {
  const steps = [
    { msg: `🌐 Conectando aos portais (ZAP, VivaReal, OLX, RE/MAX) na Zona Sul (${bairro})...`, delay: 600 },
    { msg: `🔍 Varrendo anúncios e extraindo métricas de valor por m² para ${bairro}...`, delay: 900 },
    { msg: `⚡ Geocodificando coordenadas de latitude e longitude dos imóveis...`, delay: 700 },
    { msg: `🧹 Higienizando e aplicando deduplicação de ofertas na Zona Sul...`, delay: 800 },
    { msg: `📊 Recalculando valor médio por m² e liquidez para o bairro ${bairro}...`, delay: 500 },
    { msg: `✅ Ingestão da Zona Sul finalizada com sucesso!`, delay: 400 }
  ];

  for (const step of steps) {
    onLogProgress(step.msg);
    await new Promise(resolve => setTimeout(resolve, step.delay));
  }

  // Retorna 3 novos imóveis raspados da Zona Sul
  return [
    generateScrapedProperty(bairro, "venda"),
    generateScrapedProperty(bairro, "venda"),
    generateScrapedProperty(bairro, "vendido")
  ];
}
