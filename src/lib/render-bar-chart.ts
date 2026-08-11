import type { DailyCount } from './visitor-stats';

const CHART_WIDTH = 600;
const CHART_HEIGHT = 160;
const BAR_MAX_HEIGHT = 120;

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderDailyBarChart(data: DailyCount[]): string {
  if (data.length === 0) {
    return '<p class="chart-empty mono">Belum ada data kunjungan.</p>';
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  const barWidth = CHART_WIDTH / data.length;

  const bars = data
    .map((d, i) => {
      const height = Math.max((d.count / max) * BAR_MAX_HEIGHT, d.count > 0 ? 2 : 0);
      const x = (i * barWidth + barWidth * 0.15).toFixed(1);
      const width = (barWidth * 0.7).toFixed(1);
      const y = (CHART_HEIGHT - 24 - height).toFixed(1);
      const delay = (i * 18).toFixed(0);
      return `<rect class="chart-bar" x="${x}" y="${y}" width="${width}" height="${height.toFixed(1)}" rx="1" style="animation-delay:${delay}ms"><title>${escapeXml(d.date)}: ${d.count}</title></rect>`;
    })
    .join('');

  const labelStep = Math.ceil(data.length / 8);
  const labels = data
    .map((d, i) => {
      if (i % labelStep !== 0 && i !== data.length - 1) return '';
      const x = (i * barWidth + barWidth / 2).toFixed(1);
      const shortDate = escapeXml(d.date.slice(5));
      return `<text x="${x}" y="${CHART_HEIGHT - 6}" class="chart-label" text-anchor="middle">${shortDate}</text>`;
    })
    .join('');

  return `<svg viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}" class="visitor-chart" role="img" aria-label="Grafik kunjungan harian ${data.length} hari terakhir">${bars}${labels}</svg>`;
}
