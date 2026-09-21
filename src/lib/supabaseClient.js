import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente configuráveis via Vercel ou .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://voojzuykqkaiedqpbzbg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb2p6dXlrcWthaWVkcXBiemJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjY0MTMsImV4cCI6MjEwNTYwMjQxM30.gL_kZUTbkDnz-eRSkmUPuqKL23lk9rXgcCEYHYJSkC8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Função para buscar imóveis direto do Supabase PostgreSQL + PostGIS
 */
export async function fetchPropertiesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Erro ao buscar no Supabase:", error.message);
      return null;
    }

    return data.map(item => ({
      id: item.id,
      code: item.code,
      title: item.title,
      bairro: item.bairro,
      cidade: item.cidade,
      estado: item.estado,
      zona: item.zona,
      endereco: item.endereco,
      tipo: item.tipo,
      preco: Number(item.preco),
      area: Number(item.area),
      precoM2: Number(item.preco_m2),
      quartos: item.quartos,
      suites: item.suites,
      vagas: item.vagas,
      banheiros: item.banheiros,
      condominio: Number(item.condominio),
      iptu: Number(item.iptu),
      status: item.status,
      portal: item.portal,
      remaxExclusivo: item.remax_exclusivo,
      diasNoMercado: item.dias_no_mercado,
      dataAnuncio: item.data_anuncio,
      dataVenda: item.data_venda,
      lat: Number(item.latitude),
      lng: Number(item.longitude),
      imagem: item.image_url,
      corretor: item.corretor,
      contato: item.contato
    }));
  } catch (err) {
    console.warn("Falha na consulta Supabase:", err);
    return null;
  }
}

/**
 * Função para salvar/atualizar um novo imóvel raspado no banco PostgreSQL + PostGIS do Supabase
 */
export async function savePropertyToSupabase(property) {
  try {
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
        data_anuncio: property.dataAnuncio,
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
