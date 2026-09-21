import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente configuráveis via Vercel ou .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Função para salvar um novo imóvel raspado no banco PostgreSQL + PostGIS do Supabase
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
      console.warn("Aviso Supabase (Modo local sem chaves ativas ainda):", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Supabase local fallback ativado.");
    return null;
  }
}
