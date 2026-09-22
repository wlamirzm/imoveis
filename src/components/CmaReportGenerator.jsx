import React, { useState, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  Building2, 
  Download, 
  Landmark,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getDadosUrbanisticosPMSP } from '../services/geosampaService';
import { getDadosONR } from '../services/onrService';

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
    corretor: "Corretor CONEXPER Especialista"
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Buscar dados urbanísticos oficiais da Prefeitura de SP (GeoSampa) e Estatísticas ONR
  const dadosPMSP = useMemo(() => getDadosUrbanisticosPMSP(subject.bairro, subject.precoAlvo), [subject.bairro, subject.precoAlvo]);
  const dadosONR = useMemo(() => getDadosONR(subject.bairro), [subject.bairro]);

  // Recalcular Comparáveis Ativos (À Venda) ranqueando por proximidade de área m² e quartos
  const comparablesActive = useMemo(() => {
    return properties
      .filter(p => p.status === 'venda' && (p.bairro === subject.bairro || !subject.bairro))
      .map(p => {
        const areaDiff = Math.abs((p.area || 0) - (subject.area || 0));
        const quartosDiff = Math.abs((p.quartos || 0) - (subject.quartos || 0));
        const score = (areaDiff * 10) + (quartosDiff * 100);
        return { ...p, score };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 4);
  }, [properties, subject.bairro, subject.area, subject.quartos]);

  // Recalcular Comparáveis Vendidos (Transacionados) ranqueando por proximidade de área m² e quartos
  const comparablesSold = useMemo(() => {
    return properties
      .filter(p => p.status === 'vendido' && (p.bairro === subject.bairro || !subject.bairro))
      .map(p => {
        const areaDiff = Math.abs((p.area || 0) - (subject.area || 0));
        const quartosDiff = Math.abs((p.quartos || 0) - (subject.quartos || 0));
        const score = (areaDiff * 10) + (quartosDiff * 100);
        return { ...p, score };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }, [properties, subject.bairro, subject.area, subject.quartos]);

  // Cálculos de Precificação da ACM recalculados instantaneamente ao alterar qualquer campo do painel lateral
  const allComparables = useMemo(() => [...comparablesActive, ...comparablesSold], [comparablesActive, comparablesSold]);
  
  const avgCompM2 = useMemo(() => {
    if (allComparables.length === 0) return 14500;
    const sum = allComparables.reduce((acc, p) => acc + p.precoM2, 0);
    return Math.round(sum / allComparables.length);
  }, [allComparables]);

  const precoSugeridoRemax = useMemo(() => (subject.area || 0) * avgCompM2, [subject.area, avgCompM2]);
  const precoMinimoVenda = useMemo(() => Math.round(precoSugeridoRemax * 0.93), [precoSugeridoRemax]);
  const precoTetoAnuncio = useMemo(() => Math.round(precoSugeridoRemax * 1.06), [precoSugeridoRemax]);

  // Comparativo percentual entre o Preço Pedido pelo Vendedor e a Avaliação Sugerida
  const deltaPrecoPct = useMemo(() => {
    if (!precoSugeridoRemax || !subject.precoAlvo) return 0;
    const diff = ((subject.precoAlvo - precoSugeridoRemax) / precoSugeridoRemax) * 100;
    return Number(diff.toFixed(1));
  }, [subject.precoAlvo, precoSugeridoRemax]);

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
      pdf.save(`CONEXPER_ACM_PMSP_${subject.bairro}_${subject.area}m2.pdf`);
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
              CONEXPER • GeoSampa & ITBI PMSP
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Laudo de avaliação com cruzamento de comparáveis imobiliários, zoneamento do Plano Diretor de SP e estimativa fiscal de ITBI/IPTU.
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

          <div>
            <label className="text-xs text-slate-400 block mb-1">Rua / Endereço Completo do Imóvel</label>
            <input
              type="text"
              value={subject.endereco || ''}
              onChange={(e) => setSubject({ ...subject, endereco: e.target.value })}
              placeholder="Ex: Av. Jorge João Saad, 50"
              className="w-full bg-[#0B131F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-remax-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Bairro (ZS & ZO)</label>
              <select
                value={subject.bairro}
                onChange={(e) => setSubject({ ...subject, bairro: e.target.value })}
                className="w-full bg-[#0B131F] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-remax-accent"
              >
                <option value="Brooklin">Brooklin</option>
                <option value="Morumbi">Morumbi</option>
                <option value="Portal do Morumbi">Portal do Morumbi</option>
                <option value="Moema">Moema</option>
                <option value="Campo Belo">Campo Belo</option>
                <option value="Vila Mariana">Vila Mariana</option>
                <option value="Itaim Bibi">Itaim Bibi</option>
                <option value="Chácara Santo Antônio">Chácara Santo Antônio</option>
                <option value="Santo Amaro">Santo Amaro</option>
                <option value="Vila Nova Conceição">Vila Nova Conceição</option>
                <option value="Butantã">Butantã</option>
                <option value="Pinheiros">Pinheiros</option>
                <option value="Vila Madalena">Vila Madalena</option>
                <option value="Perdizes">Perdizes</option>
                <option value="Alto de Pinheiros">Alto de Pinheiros</option>
                <option value="Vila Leopoldina">Vila Leopoldina</option>
                <option value="Lapa">Lapa</option>
                <option value="Pompéia">Pompéia</option>
                <option value="Jaguaré">Jaguaré</option>
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

          {/* Dados Oficiais PMSP (Novo GeoSampa & ITBI) */}
          <div className="bg-[#0B131F] border border-slate-800 rounded-lg p-3 text-xs space-y-2">
            <h4 className="font-bold text-white flex items-center justify-between text-[11px] border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                Novo GeoSampa PMSP
              </span>
              <a 
                href={dadosPMSP.urlNovoGeoSampa} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] text-amber-400 hover:underline font-bold"
              >
                novogeosampa ↗
              </a>
            </h4>
            <div className="flex justify-between text-slate-400">
              <span>Zoneamento:</span>
              <span className="font-bold text-white text-[11px] truncate max-w-[160px]">{dadosPMSP.zoneamento.split('-')[0]}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Coeficiente Aprov. (CA):</span>
              <span className="font-bold text-amber-400 font-mono">{dadosPMSP.coeficienteAproveitamento}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Subprefeitura SP:</span>
              <span className="font-bold text-slate-200 text-[11px] truncate max-w-[160px]">{dadosPMSP.subprefeitura}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimativa ITBI PMSP (3%):</span>
              <span className="font-bold text-emerald-400">R$ {dadosPMSP.itbiEstimado.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          {/* Dados Cartorários & Registrais ONR (mapa.onr.org.br) */}
          <div className="bg-[#0B131F] border border-amber-500/30 rounded-lg p-3 text-xs space-y-2">
            <h4 className="font-bold text-white flex items-center justify-between text-[11px] border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Cartório & ONR Registradores
              </span>
              <a 
                href={dadosONR.urlONR} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] text-amber-400 hover:underline font-bold"
              >
                mapa.onr.org.br ↗
              </a>
            </h4>
            <div className="flex justify-between text-slate-400">
              <span>Circunscrição ONR:</span>
              <span className="font-bold text-white text-[11px] truncate max-w-[160px]">{dadosONR.circunscricao}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cartório de RI:</span>
              <span className="font-bold text-amber-400 text-[11px] truncate max-w-[160px]">{dadosONR.cartorio.split(' de São Paulo')[0]}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Código CNS ONR:</span>
              <span className="font-mono text-emerald-400 font-bold">{dadosONR.cns}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Prazo Médio Registro:</span>
              <span className="font-bold text-slate-200">{dadosONR.tempoMedioPrenotacaoDias} dias úteis</span>
            </div>
          </div>
        </div>

        {/* Painel Direito: Laudo de Avaliação Profissional (Imprimível em PDF) */}
        <div className="lg:col-span-8">
          <div ref={reportRef} className="bg-[#0D1826] border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6 text-slate-100">
            
            {/* Header do Laudo com Marca CONEXPER & Prefeitura SP */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <img 
                  src="/logoConexper.png" 
                  alt="CONEXPER Logo" 
                  className="w-12 h-12 object-contain rounded-xl bg-slate-900/60 p-1 border border-slate-700/60 shadow-lg" 
                />
                <div>
                  <h1 className="text-xl font-black text-white uppercase tracking-wider">
                    LAUDO DE ANÁLISE COMPARATIVA DE MERCADO (ACM)
                  </h1>
                  <p className="text-xs text-remax-red font-bold flex items-center gap-1">
                    CONEXPER Market Intelligence • Cruzamento de Dados Oficiais Prefeitura SP (GeoSampa)
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 font-mono">
                <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                <p>Bairro: {subject.bairro}</p>
              </div>
            </div>

            {/* Identificação do Imóvel Avaliado (Rua / Endereço Completo & Preço Pedido pelo Vendedor) */}
            <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-5 shadow-md">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <span className="bg-remax-red/20 text-remax-red border border-remax-red/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Imóvel sob Avaliação
                  </span>
                  <h2 className="text-base font-bold text-white mt-1">{subject.title}</h2>
                  <p className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    <span className="text-remax-accent font-bold">📍 Endereço:</span> 
                    <span className="text-white font-semibold">{subject.endereco || 'Endereço não informado'}</span> 
                    <span className="text-slate-400">({subject.bairro}, São Paulo - SP)</span>
                  </p>
                </div>

                <div className="bg-[#0B131F] border border-amber-500/40 p-3 rounded-xl text-right min-w-[210px]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Preço Pedido pelo Vendedor</span>
                  <span className="text-xl font-black text-amber-400 font-mono block">
                    R$ {subject.precoAlvo ? subject.precoAlvo.toLocaleString('pt-BR') : '0'}
                  </span>
                  {subject.area > 0 && (
                    <span className="text-[11px] font-bold text-slate-400 block mt-0.5">
                      (R$ {Math.round(subject.precoAlvo / subject.area).toLocaleString('pt-BR')}/m²)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-300">
                <div><span>Área Útil:</span> <strong className="text-white font-mono text-sm ml-1">{subject.area} m²</strong></div>
                <div><span>Dormitórios:</span> <strong className="text-white ml-1">{subject.quartos} ({subject.suites} suítes)</strong></div>
                <div><span>Vagas na Garagem:</span> <strong className="text-white ml-1">{subject.vagas} vagas</strong></div>
                <div><span>Laudo Emitido por:</span> <strong className="text-slate-200 ml-1">{subject.corretor}</strong></div>
              </div>
            </div>

            {/* Quadro de Informações Urbanísticas Oficiais PMSP */}

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

            {/* Quadro de Precificação Sugerida CONEXPER com Recálculo em Tempo Real */}
            <div className="bg-[#131F2E] border border-slate-800 rounded-xl p-6 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-800/80 pb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-remax-gold" />
                  Recomendação de Precificação Mercado ({subject.bairro})
                </h3>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Recálculo Dinâmico em Tempo Real
                  </span>

                  {deltaPrecoPct !== 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                      deltaPrecoPct > 0 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {deltaPrecoPct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      Pedindo {deltaPrecoPct > 0 ? `+${deltaPrecoPct}%` : `${deltaPrecoPct}%`} vs. Avaliação
                    </span>
                  )}
                </div>
              </div>

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
                <span className="font-bold text-slate-300">CONEXPER Market Intelligence System</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
