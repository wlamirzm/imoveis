/**
 * Utilitário de Exportação de Imóveis para Planilha Excel / CSV compatível com MS Excel
 */
export function exportPropertiesToExcel(propertiesList, addressText = "Zona_Sul_SP", radiusMeters = null) {
  if (!propertiesList || propertiesList.length === 0) {
    alert("Nenhum imóvel disponível para exportação no perímetro atual.");
    return;
  }

  // Cabeçalhos das colunas em português
  const headers = [
    "Código",
    "Portal",
    "Status",
    "Título do Anúncio",
    "Endereço Completo",
    "Bairro",
    "Tipo de Imóvel",
    "Preço Anunciado (R$)",
    "Área Útil (m²)",
    "Preço por m² (R$/m²)",
    "Quartos",
    "Suítes",
    "Vagas de Garagem",
    "Banheiros",
    "Condomínio Mensal (R$)",
    "IPTU Mensal (R$)",
    "Distância ao Alvo (m)",
    "Corretor / Imobiliária",
    "Contato"
  ];

  // Linhas formatadas para o padrão brasileiro do Excel (delimitador ponto-e-vírgula ';')
  const rows = propertiesList.map(p => [
    `"${p.code || p.id}"`,
    `"${p.portal || 'RE/MAX'}"`,
    `"${p.status === 'vendido' ? 'Vendido' : 'À Venda'}"`,
    `"${(p.title || '').replace(/"/g, '""')}"`,
    `"${(p.endereco || '').replace(/"/g, '""')}"`,
    `"${p.bairro || ''}"`,
    `"${p.tipo || ''}"`,
    p.preco || 0,
    p.area || 0,
    p.precoM2 || 0,
    p.quartos || 0,
    p.suites || 0,
    p.vagas || 0,
    p.banheiros || 0,
    p.condominio || 0,
    p.iptu || 0,
    p.distanciaDoAlvoM || 0,
    `"${(p.corretor || '').replace(/"/g, '""')}"`,
    `"${p.contato || ''}"`
  ]);

  // Inserir UTF-8 BOM (\uFEFF) para garantir caracteres acentuados corretos no Excel
  const csvContent = "\uFEFF" + [
    headers.join(";"),
    ...rows.map(r => r.join(";"))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const sanitizedAddr = addressText.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
  const radiusStr = radiusMeters ? `_${radiusMeters}m` : '';
  const fileName = `Imoveis_Perimetro_${sanitizedAddr}${radiusStr}_${dateStr}.csv`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Utilitário de Exportação das Transações de ITBI (PMSP) para Excel / CSV
 */
export function exportITBIToExcel(itbiList, addressText = "Zona_Sul_SP", radiusMeters = null) {
  if (!itbiList || itbiList.length === 0) {
    alert("Nenhuma transação de ITBI disponível no perímetro atual.");
    return;
  }

  const headers = [
    "SQL (Inscrição Imobiliária)",
    "Logradouro",
    "Número",
    "Bairro",
    "Distrito",
    "Valor da Transação (R$)",
    "Valor Venal de Referência (R$)",
    "ITBI Pago (3% - R$)",
    "Área Construída (m²)",
    "Preço por m² Real (R$/m²)",
    "Tipo de Imóvel",
    "Data de Arrecadação",
    "Distância ao Alvo (m)"
  ];

  const rows = itbiList.map(item => [
    `"${item.sql || ''}"`,
    `"${(item.logradouro || '').replace(/"/g, '""')}"`,
    `"${item.numero || ''}"`,
    `"${item.bairro || ''}"`,
    `"${item.distrito || ''}"`,
    item.valorTransacao || 0,
    item.valorVenal || 0,
    item.valorItbi || 0,
    item.areaM2 || 0,
    Math.round(item.precoM2Real) || 0,
    `"${item.tipo || 'Apartamento'}"`,
    `"${item.dataArrecadacao || ''}"`,
    item.distanciaM || 0
  ]);

  const csvContent = "\uFEFF" + [
    headers.join(";"),
    ...rows.map(r => r.join(";"))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const sanitizedAddr = addressText.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
  const radiusStr = radiusMeters ? `_${radiusMeters}m` : '';
  const fileName = `Transacoes_ITBI_PMSP_${sanitizedAddr}${radiusStr}_${dateStr}.csv`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
