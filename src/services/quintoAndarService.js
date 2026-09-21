// Serviço de Integração com o Portal QuintoAndar & Busca por Raio Geográfico

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

/**
 * Simula/Busca anúncios do QuintoAndar no raio especificado (em metros) em torno da coordenada central
 */
export function generateQuintoAndarListingsInRadius(centerLat, centerLng, radiusMeters = 1000, bairroName = "Brooklin") {
  const count = Math.floor(4 + Math.random() * 5);
  const listings = [];

  for (let i = 0; i < count; i++) {
    // Variação angular aleatória dentro do raio
    const angle = Math.random() * 2 * Math.PI;
    const distanceMeters = Math.random() * radiusMeters;
    
    // Converter distância em graus (~111.000m por grau)
    const deltaLat = (distanceMeters * Math.cos(angle)) / 111000;
    const deltaLng = (distanceMeters * Math.sin(angle)) / (111000 * Math.cos(centerLat * (Math.PI / 180)));
    
    const propLat = centerLat + deltaLat;
    const propLng = centerLng + deltaLng;
    
    const area = Math.floor(Math.random() * (180 - 50) + 50);
    const precoM2 = Math.floor(11000 + Math.random() * 6000);
    const preco = area * precoM2;
    const quartos = area > 120 ? 3 : area > 70 ? 2 : 1;

    listings.push({
      id: `QA-${Math.floor(100000 + Math.random() * 900000)}`,
      code: `QUINTOANDAR-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Apartamento QuintoAndar ${area}m² - ${quartos} dorms`,
      bairro: bairroName,
      cidade: "São Paulo",
      estado: "SP",
      zona: "Zona Sul",
      endereco: `Rua Próxima ao Alvo, ${Math.floor(Math.random() * 500) + 10}`,
      tipo: "Apartamento",
      preco: preco,
      area: area,
      precoM2: precoM2,
      quartos: quartos,
      suites: Math.min(quartos, 2),
      vagas: area > 90 ? 2 : 1,
      banheiros: quartos + 1,
      condominio: Math.round(area * 12),
      iptu: Math.round(area * 3.8),
      status: "venda",
      portal: "QuintoAndar",
      remaxExclusivo: false,
      diasNoMercado: Math.floor(Math.random() * 30) + 2,
      dataAnuncio: new Date().toISOString().split('T')[0],
      lat: propLat,
      lng: propLng,
      distanciaDoAlvoM: Math.round(distanceMeters),
      imagem: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      corretor: "Parceiro QuintoAndar",
      contato: "Atendimento QuintoAndar"
    });
  }

  return listings;
}
