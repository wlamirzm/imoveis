import React, { useState, useRef } from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  Building2, 
  Bed, 
  Maximize2, 
  Download, 
  CheckCircle2, 
  Info, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  FileText,
  Printer,
  Landmark,
  Train
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getDadosUrbanisticosPMSP } from '../services/geosampaService';

export default function CmaReportGenerator({ properties, initialSubjectProperty }) {
  const reportRef = useRef(null);

  // Imóvel sob avaliação (Subject Property)
  const [subject, setSubject] = useState(initialSubjectProperty || {
    title: "Apartamento Modelo Brooklin / Morumbi",
    bairro: "Brooklin",
    endereco: "Rua Padre Antônio José dos Santos, 500",
    area: 125,
    quartos: 3,
    suites: 2,
    vagas: 2,
    precoAlvo: 1850000,
    corretor: "Corretor RE/MAX Especialista ZS"
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Buscar dados urbanísticos oficiais da Prefeitura de SP (GeoSampa)
  const dadosPMSP = getDadosUrbanisticosPMSP(subject.bairro, subject.precoAlvo);

  // Buscar Comparáveis Ativos (À Venda) na mesma região com características similares
  const comparablesActive = properties
    .filter(p => p.status === 'venda' && (p.bairro === subject.bairro || !subject.bairro))
    .slice(0, 4);

  // Buscar Comparáveis Vendidos na mesma região
  const comparablesSold = properties
    .filter(p => p.status === 'vendido' && (p.bairro === subject.bairro || !subject.bairro))
    .slice(0, 3);

  // Cálculos de Precificação da ACM
  const allComparables = [...comparablesActive, ...comparablesSold];
  const avgCompM2 = allComparables.length > 0
    ? Math.round(allComparables.reduce((sum, p) => sum + p.precoM2, 0) / allComparables.length)
    : 14500;

  const precoSugeridoRemax = subject.area * avgCompM2;
  const precoMinimoVenda = Math.round(precoSugeridoRemax * 0.93);
  const precoTetoAnuncio = Math.round(precoSugeridoRemax * 1.06);

  // Função para exportar laudo em PDF
  const handleExportPdf = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#0D1826',
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`REMAX_ACM_PMSP_${subject.bairro}_${subject.area}m2.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Relatório visual pronto! Utilize a opção de impressão do navegador (Ctrl+P) ou salvamento em PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header do Módulo ACM */}
      <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Análise Comparativa de Mercado (ACM) + Dados PMSP</h2>
            <span className="bg-remax-red/20 text-remax-red border border-remax-red/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Integração GeoSampa & ITBI PMSP
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Laudo de avaliação com cruzamento de comparáveis RE/MAX, zoneamento do Plano Diretor de SP e estimativa fiscal de ITBI/IPTU.
          </p>
        </div>

        <button
          onClick={handleExportPdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-remax-red to-rose-700 hover:from-rose-600 hover:to-remax-red text-white font-bold text-sm rounded-lg shadow-lg shadow-remax-red/20 transition-all cursor-pointer"
        >
          <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
          <span>{isGeneratingPdf ? 'Gerando Laudo PDF...' : 'Exportar Relatório ACM (PDF)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Painel Esquerdo: Formulário de Configuração do Imóvel */}
        <div className="lg:col-span-4 bg-[#131F2E] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-remax-accent" />
            Dados do Imóvel sob Avaliação
          </h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Título do Laudo / Cliente</label>
            <input
              type="text"
              value={subject.title}
              onChange={(e) => setSubject({ ...subject, title: e.target.value })}
              className="w-full bg-[#0B131F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-remax-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Bairro (Zona Sul)</label>
              <select
                value={subject.bairro}
                onChange={(e) => setSubject({ ...subject, bairro: e.target.value })}
                className="w-full bg-[#0B131F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-remax-accent"
              >
                <option value="Brooklin">Brooklin</option>
                <option value="Morumbi">Morumbi</option>
                <option value="Moema">Moema</option>
                <option value="Campo Belo">Campo Belo</option>
                <option value="Vila Mariana">Vila Mariana</option>
                <option value="Itaim Bibi">Itaim Bibi</option>
                <option value="Chácara Santo Antônio">Chácara Santo Antônio</option>
                <option value="Santo Amaro">Santo Amaro</option>
                <option value="Vila Nova Conceição">Vila Nova Conceição</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Área Útil (m²)</label>
              <input
                type="number"
                value={subject.area}
                onChange={(e) => setSubject({ ...subject, area: Number(e.target.value) })}
                className="w-full bg-[#0B131F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-remax-accent font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Quartos</label>
              <input
                type="number"
                value={subject.quartos}
                onChange={(e) => setSubject({ ...subject, quartos: Number(e.target.value) })}
                className="w-full bg-[#0B131F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-remax-accent"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Suítes</label>
              <input
                type="number"
                value={subject.suites}
                onChange={(e) => setSubject({ ...subject, suites: Number(e.target.value) })}
                className="w-full bg-[#0B131F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-remax-accent"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Vagas</label>
              <input
                type="number"
                value={subject.vagas}
                onChange={(e) => setSubject({ ...subject, vagas: Number(e.target.value) })}
                className="w-full bg-[#0B131F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-remax-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Preço Desejado pelo Proprietário (R$)</label>
            <input
              type="number"
              value={subject.precoAlvo}
              onChange={(e) => setSubject({ ...subject, precoAlvo: Number(e.target.value) })}
              className="w-full bg-[#0B131F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold text-amber-400 focus:outline-none focus:border-remax-accent"
            />
          </div>

          {/* Dados Oficiais PMSP (Zoneamento e ITBI) */}
          <div className="bg-[#0B131F] border border-slate-800 rounded-lg p-3 text-xs space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-[11px] border-b border-slate-800 pb-1">
              <Landmark className="w-3.5 h-3.5 text-amber-400" />
              Indicadores Oficiais Prefeitura de SP
            </h4>
            <div className="flex justify-between text-slate-400">
              <span>Zoneamento (GeoSampa):</span>
              <span className="font-bold text-white">{dadosPMSP.zoneamento.split('-')[0]}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Transporte Próximo:</span>
              <span className="font-bold text-emerald-400">{dadosPMSP.distanciaMetroM}m do Metrô</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimativa ITBI PMSP (3%):</span>
              <span className="font-bold text-amber-400">R$ {dadosPMSP.itbiEstimado.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Painel Direito: Laudo de Avaliação Profissional (Imprimível em PDF) */}
        <div className="lg:col-span-8">
          <div ref={reportRef} className="bg-[#0D1826] border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6 text-slate-100">
            
            {/* Header do Laudo com Marca RE/MAX & Prefeitura SP */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-remax-red to-remax-blue flex items-center justify-center font-black text-white text-xl shadow-lg">
                  R/M
                </div>
                <div>
                  <h1 className="text-xl font-black text-white uppercase tracking-wider">
                    LAUDO DE ANÁLISE COMPARATIVA DE MERCADO (ACM)
                  </h1>
                  <p className="text-xs text-remax-red font-bold flex items-center gap-1">
                    RE/MAX Brasil • Cruzamento de Dados Oficiais Prefeitura SP (GeoSampa)
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 font-mono">
                <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                <p>Região: {subject.bairro} - Zona Sul SP</p>
              </div>
            </div>

            {/* Quadro de Informações Urbanísticas Oficiais PMSP */}
            <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Zoneamento Municipal (PMSP)</span>
                <span className="font-bold text-white block mt-0.5">{dadosPMSP.zoneamento}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Acessibilidade a Transporte</span>
                <span className="font-bold text-emerald-400 block mt-0.5">{dadosPMSP.metroProximo} ({dadosPMSP.distanciaMetroM}m)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Estimativa de Imposto ITBI (3%)</span>
                <span className="font-bold text-amber-400 block mt-0.5">R$ {dadosPMSP.itbiEstimado.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Quadro de Precificação Sugerida RE/MAX */}
            <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-6 shadow-inner">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-remax-gold" />
                Recomendação de Precificação para Captação Exclusiva ({subject.bairro})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                
                {/* Preço Mínimo */}
                <div className="bg-[#0B131F] border border-slate-800 p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 uppercase block mb-1">Preço Mínimo (Liquidez Rápida)</span>
                  <span className="text-lg font-bold text-slate-300 font-mono">
                    R$ {precoMinimoVenda.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    (R$ {Math.round(precoMinimoVenda / subject.area).toLocaleString('pt-BR')}/m²)
                  </span>
                </div>

                {/* Preço Recomendado RE/MAX (Destaque) */}
                <div className="bg-gradient-to-b from-remax-red/20 to-remax-blue/20 border-2 border-remax-red p-4 rounded-xl relative shadow-lg">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-remax-red text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase">
                    Recomendado RE/MAX
                  </span>
                  <span className="text-2xl font-black text-white font-mono block mt-1">
                    R$ {Math.round(precoSugeridoRemax).toLocaleString('pt-BR')}
                  </span>
                  <span className="text-xs font-bold text-remax-accent block mt-1">
                    R$ {avgCompM2.toLocaleString('pt-BR')}/m²
                  </span>
                </div>

                {/* Preço Teto */}
                <div className="bg-[#0B131F] border border-slate-800 p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 uppercase block mb-1">Preço Teto de Anúncio</span>
                  <span className="text-lg font-bold text-slate-300 font-mono">
                    R$ {precoTetoAnuncio.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    (R$ {Math.round(precoTetoAnuncio / subject.area).toLocaleString('pt-BR')}/m²)
                  </span>
                </div>
              </div>
            </div>

            {/* Imóveis Concorrentes (Ativos à Venda) */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Imóveis Concorrentes no Mercado ({comparablesActive.length} Imóveis Ativos no {subject.bairro})
              </h3>

              <div className="space-y-2">
                {comparablesActive.map((comp) => (
                  <div key={comp.id} className="bg-[#131F2E] border border-slate-800/80 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{comp.title}</span>
                      <span className="text-slate-400">{comp.endereco} • {comp.area}m² • {comp.quartos} dorms</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-white block">R$ {comp.preco.toLocaleString('pt-BR')}</span>
                      <span className="text-remax-accent font-bold text-[11px]">R$ {comp.precoM2.toLocaleString('pt-BR')}/m²</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Imóveis Referência (Vendidos Recentemente) */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Imóveis Vendidos no {subject.bairro} (Transacionados)
              </h3>

              <div className="space-y-2">
                {comparablesSold.map((comp) => (
                  <div key={comp.id} className="bg-[#131F2E] border border-slate-800/80 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-400 block">{comp.title} (VENDIDO)</span>
                      <span className="text-slate-400">{comp.endereco} • {comp.area}m² • Vendido em {comp.dataVenda}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-white block">R$ {comp.preco.toLocaleString('pt-BR')}</span>
                      <span className="text-emerald-400 font-bold text-[11px]">R$ {comp.precoM2.toLocaleString('pt-BR')}/m²</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assinatura / Rodapé */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-[11px] text-slate-400">
              <div>
                <span>Laudo emitido por: <strong>{subject.corretor}</strong></span>
                <span className="block">RE/MAX Brasil • Fonte de Dados: GeoSampa / Prefeitura SP</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-300">RE/MAX Market Intelligence System</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
