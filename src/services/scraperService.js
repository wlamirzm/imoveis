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
  "Vila Nova Conceição": { lat: -23.5930, lng: -46.6670, baseM2: 23200 },
  "Butantã": { lat: -23.5718, lng: -46.7082, baseM2: 10500 },
  "Pinheiros": { lat: -23.5670, lng: -46.6920, baseM2: 17800 },
  "Vila Madalena": { lat: -23.5535, lng: -46.6912, baseM2: 16200 },
  "Perdizes": { lat: -23.5350, lng: -46.6715, baseM2: 14800 },
  "Alto de Pinheiros": { lat: -23.5510, lng: -46.7110, baseM2: 21000 },
  "Vila Leopoldina": { lat: -23.5280, lng: -46.7250, baseM2: 12400 },
  "Lapa": { lat: -23.5220, lng: -46.7010, baseM2: 10800 },
  "Pompéia": { lat: -23.5290, lng: -46.6850, baseM2: 13900 },
  "Jaguaré": { lat: -23.5410, lng: -46.7450, baseM2: 8900 }
};

const PROPERTY_TYPES = ["Apartamento", "Cobertura", "Casa", "Studio"];

const STREET_TEMPLATES_BY_NEIGHBORHOOD = {
  "Brooklin": [
    { street: "Rua Padre Antônio José dos Santos", lat: -23.6080, lng: -46.6940 },
    { street: "Av. Eng. Luís Carlos Berrini", lat: -23.6020, lng: -46.6960 },
    { street: "Rua Flórida", lat: -23.6060, lng: -46.6920 },
    { street: "Rua Arizona", lat: -23.6075, lng: -46.6910 }
  ],
  "Morumbi": [
    { street: "Av. Jorge João Saad", lat: -23.5995, lng: -46.7170 },
    { street: "Rua Guilherme Dumont Villares", lat: -23.6185, lng: -46.7310 },
    { street: "Av. Giovanni Gronchi", lat: -23.6140, lng: -46.7240 },
    { street: "Rua Eng. Oscar Americano", lat: -23.5975, lng: -46.7050 },
    { street: "Rua Dr. Alberto Penteado", lat: -23.6010, lng: -46.7080 }
  ],
  "Moema": [
    { street: "Av. Moema", lat: -23.6035, lng: -46.6612 },
    { street: "Alameda dos Maracatins", lat: -23.6060, lng: -46.6580 },
    { street: "Alameda Jauaperi", lat: -23.6040, lng: -46.6630 }
  ],
  "Campo Belo": [
    { street: "Rua Pascal", lat: -23.6180, lng: -46.6710 },
    { street: "Rua Vieira de Morais", lat: -23.6160, lng: -46.6740 }
  ],
  "Vila Mariana": [
    { street: "Rua Vergueiro", lat: -23.5850, lng: -46.6385 },
    { street: "Rua Domingos de Morais", lat: -23.5870, lng: -46.6360 }
  ],
  "Itaim Bibi": [
    { street: "Rua Clodomiro Amazonas", lat: -23.5850, lng: -46.6750 },
    { street: "Rua Pedroso Alvarenga", lat: -23.5830, lng: -46.6770 }
  ],
  "Santo Amaro": [
    { street: "Av. Adolfo Pinheiro", lat: -23.6520, lng: -46.7040 }
  ],
  "Chácara Santo Antônio": [
    { street: "Rua Alexandre Dumas", lat: -23.6260, lng: -46.7020 }
  ],
  "Vila Nova Conceição": [
    { street: "Praça Cidade de Milão", lat: -23.5930, lng: -46.6670 }
  ],
  "Butantã": [
    { street: "Av. Vital Brasil", lat: -23.5718, lng: -46.7082 },
    { street: "Rua Corinto", lat: -23.5730, lng: -46.7110 },
    { street: "Av. Prof. Francisco Morato", lat: -23.5790, lng: -46.7140 }
  ],
  "Pinheiros": [
    { street: "Rua dos Pinheiros", lat: -23.5670, lng: -46.6920 },
    { street: "Av. Pedroso de Moraes", lat: -23.5630, lng: -46.6950 },
    { street: "Rua Teodoro Sampaio", lat: -23.5610, lng: -46.6890 }
  ],
  "Vila Madalena": [
    { street: "Rua Harmonia", lat: -23.5535, lng: -46.6912 },
    { street: "Rua Fradique Coutinho", lat: -23.5550, lng: -46.6890 }
  ],
  "Perdizes": [
    { street: "Rua Desembargador do Vale", lat: -23.5350, lng: -46.6715 },
    { street: "Rua Turiassu", lat: -23.5330, lng: -46.6740 }
  ],
  "Alto de Pinheiros": [
    { street: "Av. Prof. Fonseca Rodrigues", lat: -23.5510, lng: -46.7110 }
  ],
  "Vila Leopoldina": [
    { street: "Rua Carlos Weber", lat: -23.5280, lng: -46.7250 }
  ],
  "Lapa": [
    { street: "Rua Clélia", lat: -23.5220, lng: -46.7010 }
  ],
  "Pompéia": [
    { street: "Av. Pompéia", lat: -23.5290, lng: -46.6850 }
  ],
  "Jaguaré": [
    { street: "Av. Jaguares", lat: -23.5410, lng: -46.7450 }
  ]
};

/**
 * Gera um novo imóvel coletado via scraping para o bairro selecionado da Zona Sul
 */
export function generateScrapedProperty(bairroTarget = "Brooklin", forceStatus = null) {
  const coordsBase = NEIGHBORHOOD_COORDS[bairroTarget] || NEIGHBORHOOD_COORDS["Brooklin"];
  const streetList = STREET_TEMPLATES_BY_NEIGHBORHOOD[bairroTarget] || STREET_TEMPLATES_BY_NEIGHBORHOOD["Brooklin"];
  const streetObj = streetList[Math.floor(Math.random() * streetList.length)];
  const houseNumber = Math.floor(Math.random() * 1200) + 40;

  // Micro-deslocamento na mesma via (máximo ±20m)
  const latOffset = (Math.random() - 0.5) * 0.0003;
  const lngOffset = (Math.random() - 0.5) * 0.0003;
  
  const area = Math.floor(Math.random() * (240 - 50) + 50);
  const m2Variation = 1 + (Math.random() - 0.5) * 0.24;
  const precoM2 = Math.round(coordsBase.baseM2 * m2Variation);
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
  
  const isZonaOeste = ["Butantã", "Pinheiros", "Vila Madalena", "Perdizes", "Alto de Pinheiros", "Vila Leopoldina", "Lapa", "Pompéia", "Jaguaré"].includes(bairroTarget);
  const zonaName = isZonaOeste ? "Zona Oeste" : "Zona Sul";

  return {
    id: `SCRAP-${idNum}`,
    code: `${portal.substring(0,3).toUpperCase()}-${idNum}`,
    title: `${tipo} ${area}m² - ${quartos} dorms (${bairroTarget} - ${zonaName})`,
    bairro: bairroTarget,
    cidade: "São Paulo",
    estado: "SP",
    zona: zonaName,
    endereco: `${streetObj.street}, ${houseNumber}`,
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
    dataUltimaCaptura: new Date().toISOString().split('T')[0],
    dataVenda: status === "vendido" ? new Date().toISOString().split('T')[0] : null,
    lat: streetObj.lat + latOffset,
    lng: streetObj.lng + lngOffset,
    imagem: images[Math.floor(Math.random() * images.length)],
    corretor: isRemax ? `Corretor RE/MAX ${zonaName}` : "Captação Automática Portal",
    contato: "(11) 98000-1122"
  };
}

/**
 * Executa uma rodada simulada de scraping com logs em tempo real
 */
export async function runScraperJob(bairro, onLogProgress) {
  const isZonaOeste = ["Butantã", "Pinheiros", "Vila Madalena", "Perdizes", "Alto de Pinheiros", "Vila Leopoldina", "Lapa", "Pompéia", "Jaguaré"].includes(bairro);
  const regionLabel = isZonaOeste ? "Zona Oeste" : "Zona Sul";

  const steps = [
    { msg: `🌐 Conectando aos portais (ZAP, VivaReal, OLX, RE/MAX) na ${regionLabel} (${bairro})...`, delay: 600 },
    { msg: `🔍 Varrendo anúncios e extraindo métricas de valor por m² para ${bairro}...`, delay: 900 },
    { msg: `⚡ Geocodificando coordenadas de latitude e longitude dos imóveis...`, delay: 700 },
    { msg: `🧹 Higienizando e aplicando deduplicação de ofertas na ${regionLabel}...`, delay: 800 },
    { msg: `📊 Recalculando valor médio por m² e liquidez para o bairro ${bairro}...`, delay: 500 },
    { msg: `✅ Ingestão da ${regionLabel} (${bairro}) finalizada com sucesso!`, delay: 400 }
  ];

  for (const step of steps) {
    onLogProgress(step.msg);
    await new Promise(resolve => setTimeout(resolve, step.delay));
  }

  // Quantidade dinâmica de novos imóveis encontrados na varredura (de 2 a 5 imóveis por lote de coleta)
  const count = Math.floor(Math.random() * 4) + 2; 
  const scrapedList = [];
  for (let i = 0; i < count; i++) {
    const status = i === 0 ? "vendido" : "venda";
    scrapedList.push(generateScrapedProperty(bairro, status));
  }
  return scrapedList;
}
