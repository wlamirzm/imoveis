-- Migration 002: Tabela de Transações Efetivas de ITBI (Prefeitura de São Paulo - PMSP)
CREATE TABLE IF NOT EXISTS public.itbi_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sql_imovel VARCHAR(30),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    distrito VARCHAR(100),
    cep VARCHAR(10),
    valor_transacao NUMERIC(12,2),
    valor_venal_referencia NUMERIC(12,2),
    valor_itbi NUMERIC(12,2),
    area_construida_m2 NUMERIC(10,2),
    preco_m2_real NUMERIC(10,2),
    tipo_imovel VARCHAR(50) DEFAULT 'Apartamento',
    data_arrecadacao DATE DEFAULT CURRENT_DATE,
    location GEOGRAPHY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_itbi_location ON public.itbi_transactions USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_itbi_bairro ON public.itbi_transactions (bairro);
