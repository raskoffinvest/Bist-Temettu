const LS_KEY = "bist-temettu-portfoy-v1";

/** { SYMBOL: weightPct } */
let portfolio = loadPortfolio();
let sortKey = "symbol";
let sortDir = 1;
let sectorFilter = "TÜMÜ";
let sectorChart = null;

function loadPortfolio() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function savePortfolio() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(portfolio));
  } catch (e) {
    /* localStorage kullanılamıyorsa sessizce yok say */
  }
}

function stockStatus(stock) {
  const reasons = [];
  if (stock.yieldPct < CRITERIA.yieldMin || stock.yieldPct > CRITERIA.yieldMax) {
    reasons.push(`Verim aralık dışı (${stock.yieldPct}%)`);
  }
  if (stock.payoutPct > CRITERIA.payoutMax) {
    reasons.push(`Payout oranı yüksek (${stock.payoutPct}%)`);
  }
  if (stock.debtToEquity > CRITERIA.debtToEquityMax) {
    reasons.push(`Borç/özkaynak yüksek (${stock.debtToEquity})`);
  }
  if (stock.dividendYears < CRITERIA.dividendYearsMin) {
    reasons.push(`Temettü geçmişi kısa (${stock.dividendYears} yıl)`);
  }
  if (reasons.length === 0) return { level: "ok", reasons };
  if (reasons.length <= 1) return { level: "warn", reasons };
  return { level: "risk", reasons };
}

function formatPct(n) {
  return `${n.toFixed(1)}%`;
}

function renderCriteria() {
  const el = document.getElementById("criteria-list");
  el.innerHTML = `
    <li>Temettü verimi <strong>%${CRITERIA.yieldMin}–%${CRITERIA.yieldMax}</strong> bandında (çok yüksek verim risk sinyali)</li>
    <li>Payout oranı <strong>%${CRITERIA.payoutMax}</strong>'i geçmemeli</li>
    <li>Borç/özkaynak oranı düşük olmalı (referans eşik: <strong>${CRITERIA.debtToEquityMax}</strong>)</li>
    <li>Temettü geçmişi kesintisiz/artan, en az <strong>${CRITERIA.dividendYearsMin} yıl</strong></li>
    <li>Portföyde <strong>${CRITERIA.minStocks}-${CRITERIA.maxStocks}</strong> hisse, en az <strong>${CRITERIA.minSectors}</strong> farklı sektör</li>
    <li>Tek sektör ağırlığı <strong>%${CRITERIA.maxSectorWeightPct}</strong>'i aşmamalı</li>
  `;
}

function renderSectorFilterOptions() {
  const sel = document.getElementById("sector-filter");
  const sectors = ["TÜMÜ", ...new Set(STOCKS.map((s) => s.sector))];
  sel.innerHTML = sectors.map((s) => `<option value="${s}">${s}</option>`).join("");
  sel.value = sectorFilter;
}

function sortedFilteredStocks() {
  let list = STOCKS.filter((s) => sectorFilter === "TÜMÜ" || s.sector === sectorFilter);
  list = list.slice().sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "string") return av.localeCompare(bv) * sortDir;
    return (av - bv) * sortDir;
  });
  return list;
}

function renderStockTable() {
  const tbody = document.getElementById("stock-table-body");
  const rows = sortedFilteredStocks().map((s) => {
    const status = stockStatus(s);
    const inPortfolio = portfolio[s.symbol] !== undefined;
    return `
      <tr class="status-${status.level}">
        <td class="symbol-cell">
          <div class="symbol">${s.symbol}</div>
          <div class="stock-name">${s.name}</div>
        </td>
        <td>${s.sector}</td>
        <td>${formatPct(s.yieldPct)}</td>
        <td>${formatPct(s.payoutPct)}</td>
        <td>${s.debtToEquity}</td>
        <td>${s.dividendYears} yıl</td>
        <td><span class="badge badge-${status.level}" title="${status.reasons.join("; ") || "Kriterlere uygun"}">${status.level === "ok" ? "Uygun" : status.level === "warn" ? "Dikkat" : "Riskli"}</span></td>
        <td>
          <button class="btn-add ${inPortfolio ? "btn-remove" : ""}" data-symbol="${s.symbol}">
            ${inPortfolio ? "Çıkar" : "Ekle"}
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = rows.join("");

  tbody.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sym = btn.dataset.symbol;
      if (portfolio[sym] !== undefined) {
        delete portfolio[sym];
      } else {
        portfolio[sym] = 10;
      }
      savePortfolio();
      renderAll();
    });
  });
}

function renderPortfolio() {
  const container = document.getElementById("portfolio-list");
  const symbols = Object.keys(portfolio);

  if (symbols.length === 0) {
    container.innerHTML = `<p class="empty-hint">Henüz portföye hisse eklenmedi. Yukarıdaki tablodan "Ekle" ile başlayın.</p>`;
  } else {
    container.innerHTML = symbols
      .map((sym) => {
        const stock = STOCKS.find((s) => s.symbol === sym);
        return `
          <div class="portfolio-row">
            <span class="symbol">${sym}</span>
            <span class="portfolio-sector">${stock ? stock.sector : ""}</span>
            <input type="number" min="0" max="100" step="0.5" class="weight-input" data-symbol="${sym}" value="${portfolio[sym]}" />
            <span>%</span>
            <button class="btn-remove-row" data-symbol="${sym}">✕</button>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".weight-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const sym = inp.dataset.symbol;
        const val = parseFloat(inp.value);
        portfolio[sym] = isNaN(val) ? 0 : val;
        savePortfolio();
        renderSummary();
        renderSectorChart();
        renderWarnings();
      });
    });
    container.querySelectorAll(".btn-remove-row").forEach((btn) => {
      btn.addEventListener("click", () => {
        delete portfolio[btn.dataset.symbol];
        savePortfolio();
        renderAll();
      });
    });
  }

  const totalWeight = Object.values(portfolio).reduce((a, b) => a + b, 0);
  const totalEl = document.getElementById("total-weight");
  totalEl.textContent = `Toplam ağırlık: ${totalWeight.toFixed(1)}%`;
  totalEl.className = Math.abs(totalWeight - 100) < 0.01 ? "total-ok" : "total-warn";
}

function portfolioStocks() {
  return Object.entries(portfolio)
    .map(([sym, weight]) => ({ stock: STOCKS.find((s) => s.symbol === sym), weight }))
    .filter((x) => x.stock);
}

function renderSummary() {
  const items = portfolioStocks();
  const totalWeight = items.reduce((a, x) => a + x.weight, 0) || 1;

  const weightedYield = items.reduce((a, x) => a + x.stock.yieldPct * x.weight, 0) / totalWeight;
  const weightedPayout = items.reduce((a, x) => a + x.stock.payoutPct * x.weight, 0) / totalWeight;
  const weightedDebt = items.reduce((a, x) => a + x.stock.debtToEquity * x.weight, 0) / totalWeight;
  const sectorCount = new Set(items.map((x) => x.stock.sector)).size;

  document.getElementById("summary-cards").innerHTML = `
    <div class="card">
      <div class="card-label">Hisse Sayısı</div>
      <div class="card-value">${items.length}</div>
    </div>
    <div class="card">
      <div class="card-label">Sektör Sayısı</div>
      <div class="card-value">${sectorCount}</div>
    </div>
    <div class="card">
      <div class="card-label">Ağırlıklı Temettü Verimi</div>
      <div class="card-value">${items.length ? formatPct(weightedYield) : "–"}</div>
    </div>
    <div class="card">
      <div class="card-label">Ağırlıklı Payout Oranı</div>
      <div class="card-value">${items.length ? formatPct(weightedPayout) : "–"}</div>
    </div>
    <div class="card">
      <div class="card-label">Ağırlıklı Borç/Özkaynak</div>
      <div class="card-value">${items.length ? weightedDebt.toFixed(2) : "–"}</div>
    </div>
  `;
}

function sectorBreakdown() {
  const items = portfolioStocks();
  const totalWeight = items.reduce((a, x) => a + x.weight, 0) || 1;
  const bySector = {};
  items.forEach((x) => {
    bySector[x.stock.sector] = (bySector[x.stock.sector] || 0) + x.weight;
  });
  return Object.entries(bySector).map(([sector, weight]) => ({
    sector,
    pct: (weight / totalWeight) * 100,
  }));
}

function renderSectorChart() {
  const canvas = document.getElementById("sector-chart");
  const breakdown = sectorBreakdown();
  const ctx = canvas.getContext("2d");

  if (typeof Chart === "undefined") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const hint = document.getElementById("chart-fallback");
    if (hint) hint.style.display = "block";
    return;
  }

  if (sectorChart) {
    sectorChart.destroy();
    sectorChart = null;
  }

  if (breakdown.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const palette = ["#2f6f4f", "#4c8c68", "#7bab8a", "#a7c9a8", "#c9a15a", "#b3763f", "#8a5a3b", "#5e7ca0", "#8299b8", "#c2748a", "#a15a6e", "#6b5b95"];

  sectorChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: breakdown.map((b) => b.sector),
      datasets: [
        {
          data: breakdown.map((b) => b.pct),
          backgroundColor: breakdown.map((_, i) => palette[i % palette.length]),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (item) => `${item.label}: ${item.parsed.toFixed(1)}%`,
          },
        },
      },
    },
  });
}

function renderWarnings() {
  const items = portfolioStocks();
  const totalWeight = items.reduce((a, x) => a + x.weight, 0);
  const sectorCount = new Set(items.map((x) => x.stock.sector)).size;
  const breakdown = sectorBreakdown();
  const warnings = [];

  if (items.length > 0) {
    if (Math.abs(totalWeight - 100) > 0.01) {
      warnings.push(`Toplam ağırlık %100 değil (şu an %${totalWeight.toFixed(1)}). Dağılımı düzeltin.`);
    }
    if (items.length < CRITERIA.minStocks) {
      warnings.push(`Çeşitlendirme düşük: ${items.length} hisse var, önerilen alt sınır ${CRITERIA.minStocks}.`);
    }
    if (items.length > CRITERIA.maxStocks) {
      warnings.push(`Hisse sayısı önerilen üst sınırın (${CRITERIA.maxStocks}) üzerinde, yönetimi zorlaştırabilir.`);
    }
    if (sectorCount < CRITERIA.minSectors) {
      warnings.push(`Sektör çeşitliliği düşük: ${sectorCount} sektör var, önerilen alt sınır ${CRITERIA.minSectors}.`);
    }
    breakdown.forEach((b) => {
      if (b.pct > CRITERIA.maxSectorWeightPct) {
        warnings.push(`"${b.sector}" sektör ağırlığı %${b.pct.toFixed(1)} — önerilen üst sınır %${CRITERIA.maxSectorWeightPct}.`);
      }
    });
    items.forEach((x) => {
      const status = stockStatus(x.stock);
      if (status.level === "risk") {
        warnings.push(`${x.stock.symbol}: ${status.reasons.join("; ")}`);
      }
    });
  }

  const el = document.getElementById("warnings");
  if (warnings.length === 0) {
    el.innerHTML = items.length > 0 ? `<p class="ok-hint">Portföy temel kriterlere uygun görünüyor.</p>` : "";
  } else {
    el.innerHTML = `<ul class="warning-list">${warnings.map((w) => `<li>${w}</li>`).join("")}</ul>`;
  }
}

function renderAll() {
  renderStockTable();
  renderPortfolio();
  renderSummary();
  renderSectorChart();
  renderWarnings();
}

document.addEventListener("DOMContentLoaded", () => {
  renderCriteria();
  renderSectorFilterOptions();
  renderAll();

  document.getElementById("sector-filter").addEventListener("change", (e) => {
    sectorFilter = e.target.value;
    renderStockTable();
  });

  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (sortKey === key) {
        sortDir *= -1;
      } else {
        sortKey = key;
        sortDir = 1;
      }
      renderStockTable();
    });
  });

  document.getElementById("reset-portfolio").addEventListener("click", () => {
    if (confirm("Portföydeki tüm hisseler kaldırılsın mı?")) {
      portfolio = {};
      savePortfolio();
      renderAll();
    }
  });
});
