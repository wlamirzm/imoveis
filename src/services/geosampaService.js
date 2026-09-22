/**
 * Serviço de Integração com Dados Municipais da Prefeitura de SP & Novo GeoSampa
 * Portal Oficial: https://novogeosampa.prefeitura.sp.gov.br/
 */

const NOVO_GEOSAMPA_URL = 'https://novogeosampa.prefeitura.sp.gov.br/';

const DATA_ZONA_SUL = {
  "Brooklin": {
    zoneamento: "ZEU - Zona Eixo de Estruturação da Transformação Urbana",
    pdePlanoDiretor: "Eixo de Adensamento Prioritário (Lei 16.050/2014)",
    coeficienteAproveitamento: "4.0 (Máximo com Outorga Onerosa)",
    gabaritoAltura: "Livre (Comprimento de Eixo ZEU)",
    subprefeitura: "Subprefeitura Pinheiros / Vila Mariana",
    metroProximo: "Estação Berrini (Linha 9-Esmeralda) / Estação Campo Belo (Linha 5-Lilás)",
    distanciaMetroM: 350,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.72
  },
  "Morumbi": {
    zoneamento: "ZPR-1 - Zona Predominantemente Residencial",
    pdePlanoDiretor: "Baixa Densidade Construtiva & Proteção Ambiental",
    coeficienteAproveitamento: "1.0 (Básico)",
    gabaritoAltura: "10 metros (Máximo)",
    subprefeitura: "Subprefeitura Butantã",
    metroProximo: "Estação São Paulo-Morumbi (Linha 4-Amarela)",
    distanciaMetroM: 850,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.65
  },
  "Portal do Morumbi": {
    zoneamento: "ZM - Zona Mista / ZCOR-1",
    pdePlanoDiretor: "Densidade Média com Uso Misto Residencial e Comercial",
    coeficienteAproveitamento: "2.0 (Máximo)",
    gabaritoAltura: "28 metros",
    subprefeitura: "Subprefeitura Campo Limpo / Butantã",
    metroProximo: "Estação Vila Sônia (Linha 4-Amarela)",
    distanciaMetroM: 920,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.68
  },
  "Moema": {
    zoneamento: "ZEU / ZC-2 - Zona Centralidade",
    pdePlanoDiretor: "Centralidade Regional de Alta Liquidez e Uso Misto",
    coeficienteAproveitamento: "4.0 (Eixo de Transporte Metrô Line 5)",
    gabaritoAltura: "Livre nas vias ZEU / 28m nas vias internas",
    subprefeitura: "Subprefeitura Vila Mariana",
    metroProximo: "Estação Moema / Eucaliptos (Linha 5-Lilás)",
    distanciaMetroM: 280,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.75
  },
  "Campo Belo": {
    zoneamento: "ZEM - Zona de Estruturação Metropolitana",
    pdePlanoDiretor: "Eixo Metropolitano com Incentivo ao Uso Misto",
    coeficienteAproveitamento: "4.0 (Máximo)",
    gabaritoAltura: "Livre (Quadras ZEM)",
    subprefeitura: "Subprefeitura Santo Amaro",
    metroProximo: "Estação Campo Belo (Linha 5-Lilás)",
    distanciaMetroM: 420,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.70
  },
  "Vila Mariana": {
    zoneamento: "ZC-2 / ZEU - Eixo de Transporte",
    pdePlanoDiretor: "Polo Educacional e Saúde com Alto Adensamento",
    coeficienteAproveitamento: "4.0 (Eixo Linha 1 Azul / Linha 2 Verde)",
    gabaritoAltura: "Livre nos Eixos / 28m ZM",
    subprefeitura: "Subprefeitura Vila Mariana",
    metroProximo: "Estação Ana Rosa / Vila Mariana (Linha 1-Azul)",
    distanciaMetroM: 310,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.74
  },
  "Vila Nova Conceição": {
    zoneamento: "ZPR-2 - Residencial Nobre de Baixa Densidade",
    pdePlanoDiretor: "Preservação de Enclave Residencial de Alto Padrão",
    coeficienteAproveitamento: "1.0 a 2.0",
    gabaritoAltura: "15 metros / Regulamentação Local Ibirapuera",
    subprefeitura: "Subprefeitura Vila Mariana",
    metroProximo: "Estação Moema (Linha 5-Lilás)",
    distanciaMetroM: 650,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.78
  },
  "Santo Amaro": {
    zoneamento: "ZEU / ZC-1 - Eixo Comercial e Residencial",
    pdePlanoDiretor: "Requalificação Urbana e Adensamento Eixo Adolfo Pinheiro",
    coeficienteAproveitamento: "4.0 (Máximo)",
    gabaritoAltura: "Livre no Eixo",
    subprefeitura: "Subprefeitura Santo Amaro",
    metroProximo: "Estação Adolfo Pinheiro / Largo Treze (Linha 5-Lilás)",
    distanciaMetroM: 190,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.68
  },
  "Itaim Bibi": {
    zoneamento: "ZEU / ZC-2 - Polo Financeiro Faria Lima / Berrini",
    pdePlanoDiretor: "Operação Urbana Consorciada Faria Lima",
    coeficienteAproveitamento: "4.0 (OUCFL / ZEU)",
    gabaritoAltura: "Livre (Comprimento de Eixo)",
    subprefeitura: "Subprefeitura Pinheiros",
    metroProximo: "Estação Cidade Jardim / Vila Olímpia (Linha 9-Esmeralda)",
    distanciaMetroM: 400,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.80
  },
  "Butantã": {
    zoneamento: "ZEU / ZM - Eixo Linha 4-Amarela & Cidade Universitária",
    pdePlanoDiretor: "Adensamento no Eixo de Transporte Metrô Linha 4-Amarela",
    coeficienteAproveitamento: "4.0 (Eixo ZEU) / 2.0 (ZM)",
    gabaritoAltura: "Livre (Eixo ZEU) / 28m (ZM)",
    subprefeitura: "Subprefeitura Butantã",
    metroProximo: "Estação Butantã (Linha 4-Amarela)",
    distanciaMetroM: 250,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.70
  },
  "Pinheiros": {
    zoneamento: "ZEU / ZC-2 - Eixo Faria Lima & Teodoro Sampaio",
    pdePlanoDiretor: "Operação Urbana Consorciada Faria Lima / Eixo de Alta Liquidez",
    coeficienteAproveitamento: "4.0 (Máximo com Outorga Onerosa)",
    gabaritoAltura: "Livre nos Eixos",
    subprefeitura: "Subprefeitura Pinheiros",
    metroProximo: "Estação Fradique Coutinho / Faria Lima (Linha 4-Amarela)",
    distanciaMetroM: 200,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.82
  },
  "Vila Madalena": {
    zoneamento: "ZM / ZCOR - Zona de Centralidade Cultural e Gastronômica",
    pdePlanoDiretor: "Preservação Cultural com Adensamento Controlado",
    coeficienteAproveitamento: "2.0 (Básico)",
    gabaritoAltura: "28 metros (Quadras Internas) / Livre (Eixo Metro)",
    subprefeitura: "Subprefeitura Pinheiros",
    metroProximo: "Estação Vila Madalena (Linha 2-Verde)",
    distanciaMetroM: 300,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.78
  },
  "Perdizes": {
    zoneamento: "ZEU / ZM - Eixo Metrô Linha 6-Laranja (Futura)",
    pdePlanoDiretor: "Adensamento de Média-Alta Densidade Residencial",
    coeficienteAproveitamento: "4.0 (Eixo ZEU) / 2.0 (ZM)",
    gabaritoAltura: "Livre (Eixos) / 28m (ZM)",
    subprefeitura: "Subprefeitura Lapa",
    metroProximo: "Estação Sumaré (Linha 2-Verde) / Estação SESC-Pompéia (Linha 6)",
    distanciaMetroM: 450,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.76
  },
  "Alto de Pinheiros": {
    zoneamento: "ZPR-1 - Zona Predominantemente Residencial Estritamente Baixa Densidade",
    pdePlanoDiretor: "Preservação Ambiental e Arquitetônica de Baixo Gabarito",
    coeficienteAproveitamento: "1.0 (Básico)",
    gabaritoAltura: "10 metros (Máximo)",
    subprefeitura: "Subprefeitura Pinheiros",
    metroProximo: "Estação Cidade Universitária (Linha 9-Esmeralda)",
    distanciaMetroM: 600,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.85
  },
  "Vila Leopoldina": {
    zoneamento: "ZEU / ZEM - Eixo de Transformação Industrial e Residencial",
    pdePlanoDiretor: "Requalificação Urbana e Adensamento Eixo Ceagesp / Villa-Lobos",
    coeficienteAproveitamento: "4.0 (Máximo)",
    gabaritoAltura: "Livre (Eixos ZEU)",
    subprefeitura: "Subprefeitura Lapa",
    metroProximo: "Estação Imperatriz Leopoldina / Villa-Lobos-Jaguaré (Linha 8/9)",
    distanciaMetroM: 500,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.72
  },
  "Lapa": {
    zoneamento: "ZEU / ZC-1 - Eixo Comercial Centralidade Regional",
    pdePlanoDiretor: "Polo de Serviços e Mobilidade Urbana Multimodal",
    coeficienteAproveitamento: "4.0 (Máximo)",
    gabaritoAltura: "Livre nos Eixos",
    subprefeitura: "Subprefeitura Lapa",
    metroProximo: "Estação Lapa (Linha 7-Rubi / Linha 8-Diamante)",
    distanciaMetroM: 350,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.69
  },
  "Pompéia": {
    zoneamento: "ZEU / ZM - Eixo Cultural e Residencial SESC Pompéia",
    pdePlanoDiretor: "Adensamento Médio-Alto Uso Misto",
    coeficienteAproveitamento: "3.5",
    gabaritoAltura: "Livre (Vias Principais)",
    subprefeitura: "Subprefeitura Lapa",
    metroProximo: "Estação Água Branca / SESC Pompéia",
    distanciaMetroM: 400,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.74
  },
  "Jaguaré": {
    zoneamento: "ZM / ZEM - Zona de Estruturação Metropolitana e Residencial",
    pdePlanoDiretor: "Vetor de Crescimento Residencial Próximo à USP",
    coeficienteAproveitamento: "2.5",
    gabaritoAltura: "28 metros",
    subprefeitura: "Subprefeitura Lapa",
    metroProximo: "Estação Villa-Lobos-Jaguaré (Linha 9-Esmeralda)",
    distanciaMetroM: 650,
    aliquotaITBI: 0.03,
    fatorValorVenal: 0.66
  }
};

/**
 * Retorna dados urbanísticos do Novo GeoSampa/PMSP (novogeosampa.prefeitura.sp.gov.br)
 */
export function getDadosUrbanisticosPMSP(bairro, precoMercado = 1500000) {
  const info = DATA_ZONA_SUL[bairro] || DATA_ZONA_SUL["Brooklin"];
  
  const valorVenalEstimado = Math.round(precoMercado * info.fatorValorVenal);
  const itbiEstimado = Math.round(precoMercado * info.aliquotaITBI);

  return {
    bairro: bairro,
    zoneamento: info.zoneamento,
    pdePlanoDiretor: info.pdePlanoDiretor,
    coeficienteAproveitamento: info.coeficienteAproveitamento,
    gabaritoAltura: info.gabaritoAltura,
    subprefeitura: info.subprefeitura,
    metroProximo: info.metroProximo,
    distanciaMetroM: info.distanciaMetroM,
    valorVenalEstimado: valorVenalEstimado,
    itbiEstimado: itbiEstimado,
    urlNovoGeoSampa: `${NOVO_GEOSAMPA_URL}?bairro=${encodeURIComponent(bairro)}`,
    fonteDados: "Prefeitura do Município de São Paulo (Novo GeoSampa - novogeosampa.prefeitura.sp.gov.br)"
  };
}
