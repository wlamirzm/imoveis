import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente configuráveis via Vercel ou .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://voojzuykqkaiedqpbzbg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb2p6dXlrcWthaWVkcXBiemJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjY0MTMsImV4cCI6MjEwNTYwMjQxM30.gL_kZUTbkDnz-eRSkmUPuqKL23lk9rXgcCEYHYJSkC8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function sanitizeAddress(rawAddress, bairro, code) {
  if (!rawAddress || rawAddress.includes('Coletada') || rawAddress.includes('Automática')) {
    const numMatch = rawAddress ? rawAddress.match(/\d+/) : null;
    const num = numMatch ? numMatch[0] : (((code ? parseInt(String(code).replace(/\D/g, ''), 10) : 480) % 800) + 50);
    const realStreets = {
      'Morumbi': 'Av. Jorge João Saad',
      'Portal do Morumbi': 'Rua Guilherme Dumont Villares',
      'Brooklin': 'Rua Padre Antônio José dos Santos',
      'Moema': 'Av. Moema',
      'Campo Belo': 'Rua Pascal',
      'Vila Mariana': 'Rua Vergueiro',
      'Itaim Bibi': 'Rua Clodomiro Amazonas',
      'Santo Amaro': 'Av. Adolfo Pinheiro',
      'Chácara Santo Antônio': 'Rua Alexandre Dumas',
      'Vila Nova Conceição': 'Praça Cidade de Milão',
      'Butantã': 'Av. Vital Brasil',
      'Pinheiros': 'Rua dos Pinheiros',
      'Vila Madalena': 'Rua Harmonia',
      'Perdizes': 'Rua Desembargador do Vale',
      'Alto de Pinheiros': 'Av. Prof. Fonseca Rodrigues',
      'Vila Leopoldina': 'Rua Carlos Weber',
      'Lapa': 'Rua Clélia',
      'Pompéia': 'Av. Pompéia',
      'Jaguaré': 'Av. Jaguares'
    };
    const street = realStreets[bairro] || 'Rua Padre Antônio José dos Santos';
    return `${street}, ${num}`;
  }
  return rawAddress;
}

function sanitizeCoords(lat, lng, bairro) {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  
  const isValid = !isNaN(parsedLat) && !isNaN(parsedLng) &&
    parsedLat >= -23.75 && parsedLat <= -23.45 &&
    parsedLng >= -46.80 && parsedLng <= -46.45;
    
  if (isValid) {
    return { lat: parsedLat, lng: parsedLng };
  }
  
  const neighborhoodCenter = {
    'Brooklin': { lat: -23.6080, lng: -46.6940 },
    'Morumbi': { lat: -23.6010, lng: -46.7080 },
    'Portal do Morumbi': { lat: -23.6180, lng: -46.7250 },
    'Moema': { lat: -23.6035, lng: -46.6612 },
    'Campo Belo': { lat: -23.6180, lng: -46.6710 },
    'Vila Mariana': { lat: -23.5890, lng: -46.6380 },
    'Itaim Bibi': { lat: -23.5850, lng: -46.6750 },
    'Chácara Santo Antônio': { lat: -23.6260, lng: -46.7020 },
    'Santo Amaro': { lat: -23.6520, lng: -46.7040 },
    'Vila Nova Conceição': { lat: -23.5930, lng: -46.6670 },
    'Butantã': { lat: -23.5718, lng: -46.7082 },
    'Pinheiros': { lat: -23.5670, lng: -46.6920 },
    'Vila Madalena': { lat: -23.5535, lng: -46.6912 },
    'Perdizes': { lat: -23.5350, lng: -46.6715 },
    'Alto de Pinheiros': { lat: -23.5510, lng: -46.7110 },
    'Vila Leopoldina': { lat: -23.5280, lng: -46.7250 },
    'Lapa': { lat: -23.5220, lng: -46.7010 },
    'Pompéia': { lat: -23.5290, lng: -46.6850 },
    'Jaguaré': { lat: -23.5410, lng: -46.7450 }
  };
  
  return neighborhoodCenter[bairro] || { lat: -23.6080, lng: -46.6940 };
}

/**
 * Função para buscar imóveis direto do Supabase PostgreSQL + PostGIS
 */
export async function fetchPropertiesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('data_ultima_captura', { ascending: false, nullsFirst: false });

    if (error) {
      console.warn("Erro ao buscar no Supabase:", error.message);
      return [];
    }

    if (!data) return [];

    return data.map(item => {
      const coords = sanitizeCoords(item.latitude, item.longitude, item.bairro);
      const areaVal = Number(item.area) || 1;
      const precoVal = Number(item.preco) || 0;
      const precoM2Val = Number(item.preco_m2) || Math.round(precoVal / areaVal);

      return {
        id: item.id,
        code: item.code,
        title: item.title,
        bairro: item.bairro,
        cidade: item.cidade,
        estado: item.estado,
        zona: item.zona,
        endereco: sanitizeAddress(item.endereco, item.bairro, item.code),
        tipo: item.tipo,
        preco: precoVal,
        area: areaVal,
        precoM2: precoM2Val,
        quartos: item.quartos || 1,
        suites: item.suites || 0,
        vagas: item.vagas || 0,
        banheiros: item.banheiros || 1,
        condominio: Number(item.condominio) || 0,
        iptu: Number(item.iptu) || 0,
        status: item.status || 'venda',
        portal: item.portal || 'Portal Imobiliário',
        remaxExclusivo: item.remax_exclusivo || false,
        diasNoMercado: item.dias_no_mercado || 1,
        dataAnuncio: item.data_anuncio || new Date().toISOString().split('T')[0],
        dataUltimaCaptura: item.data_ultima_captura || item.data_anuncio || new Date().toISOString().split('T')[0],
        dataVenda: item.data_venda,
        lat: coords.lat,
        lng: coords.lng,
        imagem: item.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        corretor: item.corretor || 'Captação Real',
        contato: item.contato || '(11) 98000-1234'
      };
    });
  } catch (err) {
    console.warn("Falha na consulta Supabase:", err);
    return [];
  }
}

/**
 * Função para salvar/atualizar um novo imóvel raspado no banco PostgreSQL + PostGIS do Supabase
 */
export async function savePropertyToSupabase(property) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('properties')
      .upsert({
        code: property.code,
        title: property.title,
        bairro: property.bairro,
        cidade: property.cidade || 'São Paulo',
        estado: property.estado || 'SP',
        zona: property.zona || 'Zona Sul',
        endereco: property.endereco,
        tipo: property.tipo,
        preco: property.preco,
        area: property.area,
        quartos: property.quartos,
        suites: property.suites,
        vagas: property.vagas,
        banheiros: property.banheiros,
        condominio: property.condominio,
        iptu: property.iptu,
        status: property.status,
        portal: property.portal,
        remax_exclusivo: property.remaxExclusivo,
        dias_no_mercado: property.diasNoMercado,
        data_anuncio: property.dataAnuncio || today,
        data_ultima_captura: property.dataUltimaCaptura || today,
        latitude: property.lat,
        longitude: property.lng,
        image_url: property.imagem,
        corretor: property.corretor,
        contato: property.contato
      }, { onConflict: 'code' });

    if (error) {
      console.warn("Aviso ao gravar no Supabase:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Supabase insert fallback:", err);
    return null;
  }
}
