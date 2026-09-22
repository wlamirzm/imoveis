/**
 * Utilitários para Formatação de Datas e Tags de Captura de Anúncios
 */

/**
 * Retorna as informações formatadas da tag "Visto por último" do imóvel
 * @param {string} dataUltimaCaptura Data no formato YYYY-MM-DD ou ISO
 * @param {string} dataAnuncio Data de criação/anúncio como fallback
 * @returns {{ text: string, daysAgo: number, labelShort: string, badgeClass: string }}
 */
export function getCapturaTagInfo(dataUltimaCaptura, dataAnuncio) {
  const targetDateStr = dataUltimaCaptura || dataAnuncio;
  if (!targetDateStr) {
    return {
      text: 'Captura Recente',
      daysAgo: 0,
      labelShort: 'Hoje',
      badgeClass: 'bg-emerald-950/90 text-emerald-400 border-emerald-500/40'
    };
  }

  const dateParts = targetDateStr.split('T')[0].split('-');
  const targetDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - targetDate.getTime();
  const daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const dayStr = String(targetDate.getDate()).padStart(2, '0');
  const monthStr = String(targetDate.getMonth() + 1).padStart(2, '0');
  const yearStr = targetDate.getFullYear();
  const dateFormatted = `${dayStr}/${monthStr}/${yearStr}`;

  if (daysAgo === 0) {
    return {
      text: `👁️ Visto hoje (${dateFormatted})`,
      daysAgo: 0,
      labelShort: 'Hoje',
      badgeClass: 'bg-emerald-950/90 text-emerald-400 border-emerald-500/40 font-bold'
    };
  } else if (daysAgo === 1) {
    return {
      text: `👁️ Visto ontem (${dateFormatted})`,
      daysAgo: 1,
      labelShort: 'Ontem',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
    };
  } else if (daysAgo <= 7) {
    return {
      text: `👁️ Visto há ${daysAgo} dias (${dateFormatted})`,
      daysAgo: daysAgo,
      labelShort: `Há ${daysAgo}d`,
      badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-500/30'
    };
  } else if (daysAgo <= 30) {
    return {
      text: `👁️ Visto há ${daysAgo} dias (${dateFormatted})`,
      daysAgo: daysAgo,
      labelShort: `Há ${daysAgo}d`,
      badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500/30'
    };
  } else if (daysAgo <= 90) {
    return {
      text: `👁️ Visto há ${daysAgo} dias (${dateFormatted})`,
      daysAgo: daysAgo,
      labelShort: `Há ${daysAgo}d`,
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/30'
    };
  } else {
    return {
      text: `👁️ Visto há ${daysAgo} dias (${dateFormatted})`,
      daysAgo: daysAgo,
      labelShort: `Há ${daysAgo}d`,
      badgeClass: 'bg-slate-900 text-slate-400 border-slate-700'
    };
  }
}
