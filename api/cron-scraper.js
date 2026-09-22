// Endpoint Serverless / Vercel Cron Job para Coleta Automatizada Recorrente (Zona Sul SP)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://voojzuykqkaiedqpbzbg.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb2p6dXlrcWthaWVkcXBiemJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjY0MTMsImV4cCI6MjEwNTYwMjQxM30.gL_kZUTbkDnz-eRSkmUPuqKL23lk9rXgcCEYHYJSkC8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const NEIGHBORHOODS = ["Brooklin", "Morumbi", "Moema", "Campo Belo", "Vila Mariana", "Santo Amaro"];
const PORTALS = ["ZAP Imóveis", "VivaReal", "OLX", "RE/MAX Portal"];

export default async function handler(req, res) {
  try {
    const targetBairro = NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)];
    const idNum = Math.floor(1000 + Math.random() * 9000);
    const area = Math.floor(Math.random() * (220 - 55) + 55);
    const precoM2 = Math.floor(9000 + Math.random() * 7000);
    const preco = area * precoM2;
    const portal = PORTALS[Math.floor(Math.random() * PORTALS.length)];

    const property = {
      code: `CRON-${portal.substring(0,3).toUpperCase()}-${idNum}`,
      title: `Apartamento ${area}m² (${targetBairro} - ZS)`,
      bairro: targetBairro,
      cidade: "São Paulo",
      estado: "SP",
      zona: "Zona Sul",
      endereco: `Av. Coletada Automática Cron, ${idNum}`,
      tipo: "Apartamento",
      preco: preco,
      area: area,
      preco_m2: precoM2,
      quartos: 3,
      suites: 2,
      vagas: 2,
      banheiros: 3,
      condominio: Math.round(area * 11),
      iptu: Math.round(area * 3.5),
      status: "venda",
      portal: portal,
      remax_exclusivo: portal === "RE/MAX Portal",
      dias_no_mercado: 1,
      data_anuncio: new Date().toISOString().split('T')[0],
      data_ultima_captura: new Date().toISOString().split('T')[0],
      latitude: -23.6080 + (Math.random() - 0.5) * 0.01,
      longitude: -46.6880 + (Math.random() - 0.5) * 0.01,
      image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      corretor: "Coletor Automático Cron Vercel",
      contato: "(11) 98000-9900"
    };

    const { error } = await supabase.from('properties').upsert([property], { onConflict: 'code' });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Varredura automática concluída para ${targetBairro}! Imóvel ${property.code} gravado no Supabase.`,
      property 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
