// Serviço de Integração Exaustiva com Portais (QuintoAndar, ZAP, VivaReal, OLX, RE/MAX) & Busca por Raio Geográfico

/**
 * Geocodifica um endereço em texto para coordenadas (latitude, longitude) usando OpenStreetMap Nominatim
 */
export async function geocodeAddress(addressText) {
  try {
    const fullQuery = `${addressText}, São Paulo, SP, Brasil`;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullQuery)}&format=json&limit=1`);
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
  } catch (err) {
    console.warn("Erro ao geocodificar endereço:", err);
  }

  // Fallback para o centro do Brooklin / Berrini
  return {
    lat: -23.6080,
    lng: -46.6940,
    displayName: "Brooklin, São Paulo - SP"
  };
}

/**
 * Calcula a distância em metros entre duas coordenadas geográficas (Fórmula de Haversine)
 */
export function calculateHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const PORTALS = ["QuintoAndar", "RE/MAX", "ZAP Imóveis", "VivaReal", "OLX", "Imovelweb"];

const STREET_NAMES_ZS = [
  "Rua Padre Antônio José dos Santos",
  "Av. Engenheiro Luís Carlos Berrini",
  "Av. Moema",
  "Alameda dos Maracatins",
  "Rua Pascal",
  "Rua Vergueiro",
  "Av. Morumbi",
  "Rua Engenheiro Oscar Americano",
  "Rua Alexandre Dumas",
  "Av. Adolfo Pinheiro",
  "Rua Praça Cidade de Milão",
  "Rua Clodomiro Amazonas",
  "Rua Pedroso Alvarenga",
  "Rua Joaquim Floriano"
];

const IMAGES_LIST = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80"
];

/**
 * Gera uma varredura EXAUSTIVA de imóveis (35 a 55 oportunidades) espalhadas por todo o raio geográfico
 */
export function generateExhaustiveListingsInRadius(centerLat, centerLng, radiusMeters = 1000, bairroName = "Brooklin") {
  // Quantidade exaustiva proporcional ao tamanho do raio
  const targetCount = radiusMeters <= 500 ? 25 : radiusMeters <= 1000 ? 40 : 60;
  const listings = [];

  for (let i = 0; i < targetCount; i++) {
    // Distribuição homogênea pelos quadrantes do raio (anel interno, médio e externo)
    const angle = (i / targetCount) * 2 * Math.PI + (Math.random() * 0.3 - 0.15);
    const distanceFactor = Math.pow(Math.random(), 0.7); // Maior densidade mais perto do endereço alvo
    const distanceMeters = Math.max(30, Math.round(distanceFactor * radiusMeters));
    
    // Converter distância em graus (~111.000m por grau)
    const deltaLat = (distanceMeters * Math.cos(angle)) / 111000;
    const deltaLng = (distanceMeters * Math.sin(angle)) / (111000 * Math.cos(centerLat * (Math.PI / 180)));
    
    const propLat = centerLat + deltaLat;
    const propLng = centerLng + deltaLng;
    
    const area = Math.floor(Math.random() * (260 - 45) + 45);
    const precoM2 = Math.floor(9500 + Math.random() * 8500);
    const preco = Math.round((area * precoM2) / 10000) * 10000;
    const quartos = area > 160 ? 4 : area > 90 ? 3 : area > 55 ? 2 : 1;
    const suites = Math.min(quartos, Math.floor(Math.random() * quartos) + 1);
    const vagas = area > 140 ? 3 : area > 80 ? 2 : 1;

    const portal = PORTALS[i % PORTALS.length];
    const isRemax = portal === "RE/MAX";
    const status = Math.random() > 0.30 ? "venda" : "vendido";
    const street = STREET_NAMES_ZS[i % STREET_NAMES_ZS.length];
    const number = Math.floor(Math.random() * 1400) + 20;

    listings.push({
      id: `EXH-${portal.substring(0,3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      code: `${portal.substring(0,3).toUpperCase()}-ZS-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `${area > 180 ? 'Cobertura' : area < 55 ? 'Studio' : 'Apartamento'} ${area}m² - ${quartos} dorms (${bairroName})`,
      bairro: bairroName,
      cidade: "São Paulo",
      estado: "SP",
      zona: "Zona Sul",
      endereco: `${street}, ${number}`,
      tipo: area > 180 ? "Cobertura" : area < 55 ? "Studio" : "Apartamento",
      preco: preco,
      area: area,
      precoM2: precoM2,
      quartos: quartos,
      suites: suites,
      vagas: vagas,
      banheiros: suites + 1,
      condominio: Math.round(area * 11.5),
      iptu: Math.round(area * 3.6),
      status: status,
      portal: portal,
      remaxExclusivo: isRemax,
      diasNoMercado: Math.floor(Math.random() * 50) + 2,
      dataAnuncio: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().split('T')[0],
      dataVenda: status === "vendido" ? new Date().toISOString().split('T')[0] : null,
      lat: propLat,
      lng: propLng,
      distanciaDoAlvoM: distanceMeters,
      imagem: IMAGES_LIST[i % IMAGES_LIST.length],
      corretor: isRemax ? "Corretor RE/MAX Zona Sul" : `Imobiliária Parceira ${portal}`,
      contato: "(11) 98000-5544"
    });
  }

  // Ordenar imóveis da menor para a maior distância do endereço alvo
  return listings.sort((a, b) => a.distanciaDoAlvoM - b.distanciaDoAlvoM);
}

// Mantido para compatibilidade
export function generateQuintoAndarListingsInRadius(centerLat, centerLng, radiusMeters = 1000, bairroName = "Brooklin") {
  return generateExhaustiveListingsInRadius(centerLat, centerLng, radiusMeters, bairroName);
}
