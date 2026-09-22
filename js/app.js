const LS_KEY = "bist-temettu-portfoy-v1";

/** { SYMBOL: { weight: number, targetPrice: number|null, currentPrice: number|null } } */
let portfolio = loadPortfolio();
let sortKey = "symbol";
let sortDir = 1;
let sectorFilter = "TÜMÜ";
let sectorChart = null;

function loadPortfolio() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // Eski format (sadece ağırlık sayısı) ile geriye dönük uyumluluk
    Object.keys(parsed).forEach((sym) => {
      if (typeof parsed[sym] === "number") {
        parsed[sym] = { weight: parsed[sym], targetPrice: null, currentPrice: null };
      }
    });
    return parsed;
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

function isNum(v) {
  return typeof v === "number" && !Number.isNaN(v);
}

function stockStatus(stock) {
  const reasons = [];
  if (isNum(stock.yieldPct) && (stock.yieldPct < CRITERIA.yieldMin || stock.yieldPct > CRITERIA.yieldMax)) {
    reasons.push(`Verim aralık dışı (${stock.yieldPct}%)`);
  }
  if (isNum(stock.payoutPct) && stock.payoutPct > CRITERIA.payoutMax) {
    reasons.push(`Payout oranı yüksek (${stock.payoutPct}%)`);
  }
  if (isNum(stock.debtToEquity) && stock.debtToEquity > CRITERIA.debtToEquityMax) {
    reasons.push(`Borç/özkaynak yüksek (${stock.debtToEquity})`);
  }
  if (isNum(stock.dividendYears) && stock.dividendYears < CRITERIA.dividendYearsMin) {
    reasons.push(`Temettü geçmişi kısa (${stock.dividendYears} yıl)`);
  }
  if (isNum(stock.peRatio) && isNum(stock.pbRatio) && stock.peRatio < CRITERIA.valueTrapPE && stock.pbRatio < CRITERIA.valueTrapPB) {
    reasons.push(`Düşük F/K (${stock.peRatio}) + düşük PD/DD (${stock.pbRatio}) — olası value trap, nedenini araştırın`);
  }
  if (!stock.policyConsistent) {
    reasons.push("Temettü politikası açık/tutarlı değil");
  }
  if (reasons.length === 0) return { level: "ok", reasons };
  if (reasons.length <= 1) return { level: "warn", reasons };
  return { level: "risk", reasons };
}

function formatPct(n) {
  return isNum(n) ? `${n.toFixed(1)}%` : "–";
}

function formatNum(n) {
  return isNum(n) ? n : "–";
}

function formatPrice(n) {
  return n === null || n === undefined ? "–" : `${n.toFixed(2)} TL`;
}

function riskTooltip(s) {
  const parts = [];
  if (s.geoRisk) parts.push(`Jeopolitik: ${s.geoRisk}`);
  if (s.manipRisk) parts.push(`Manipülasyon: ${s.manipRisk}`);
  return parts.join("\n\n");
}

function renderCriteria() {
  const el = document.getElementById("criteria-list");
  el.innerHTML = `
    <li>Temettü verimi <strong>%${CRITERIA.yieldMin}–%${CRITERIA.yieldMax}</strong> bandında (çok yüksek verim risk sinyali)</li>
    <li>Payout oranı <strong>%${CRITERIA.payoutMax}</strong>'i geçmemeli</li>
    <li>Borç/özkaynak oranı düşük olmalı (referans eşik: <strong>${CRITERIA.debtToEquityMax}</strong>)</li>
    <li>Temettü geçmişi kesintisiz/artan, en az <strong>${CRITERIA.dividendYearsMin} yıl</strong></li>
    <li>F/K ve PD/DD makul seviyede olmalı — çok düşük F/K (&lt;${CRITERIA.valueTrapPE}) + çok düşük PD/DD (&lt;${CRITERIA.valueTrapPB}) birlikte <strong>value trap</strong> sinyali olabilir</li>
    <li>Temettü politikası yönetim/ortaklık yapısında açık ve tutarlı uygulanmalı (bazı holdingler kâr olsa da dağıtmıyor)</li>
    <li>Savunma karakterli, döngüsel olmayan sektörler (gıda, telekom, sigorta gibi) tercih edilebilir; döngüsel sektörlerde pay sınırlı tutulmalı</li>
    <li>Enflasyon muhasebesi (TFRS/UMS 29) raporlanan kârı ve temettü kapasitesini etkiliyor — şirket bazında enflasyon düzeltmeli tabloları kontrol edin</li>
    <li>TL bazlı temettünün kur riski var — nominal ve reel/dolar bazlı getiri farkına dikkat edin</li>
    <li>Jeopolitik ve manipülasyon riski hisse bazında değişir — havuz tablosundaki ⓘ ikonuna bakın</li>
    <li>Portföyde <strong>${CRITERIA.minStocks}-${CRITERIA.maxStocks}</strong> hisse, en az <strong>${CRITERIA.minSectors}</strong> farklı sektör</li>
    <li>Tek sektör ağırlığı <strong>%${CRITERIA.maxSectorWeightPct}</strong>'i aşmamalı</li>
    <li>Stopaj: doğrudan hisse yerine hisse ağırlıklı fonlar (örn. PHE/KHA/PBR) bazı yatırımcılar için %0 stopaj avantajı sunabilir</li>
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
    const dateLine = s.sourceUrl
      ? `<a class="price-date" href="${s.sourceUrl}" target="_blank" rel="noopener">${s.priceAsOfDate || "kaynak"}</a>`
      : `<div class="price-date">${s.priceAsOfDate || ""}</div>`;
    const priceLine = s.currentPrice ? `${formatPrice(s.currentPrice)}${dateLine}` : "–";
    const srLine = s.support1 || s.resistance1
      ? `D: ${s.support1 ?? "–"} / R: ${s.resistance1 ?? "–"}`
      : "–";
    return `
      <tr class="status-${status.level}">
        <td class="symbol-cell">
          <div class="symbol">
            ${s.symbol}
            <span class="info-icon" title="${riskTooltip(s)}">ⓘ</span>
          </div>
          <div class="stock-name">${s.name}</div>
        </td>
        <td>${s.sector}</td>
        <td>${formatPct(s.yieldPct)}</td>
        <td>${formatPct(s.payoutPct)}</td>
        <td>${formatNum(s.debtToEquity)}</td>
        <td>${formatNum(s.peRatio)}</td>
        <td>${formatNum(s.pbRatio)}</td>
        <td><span class="badge badge-${s.cyclical ? "cyclical" : "defensive"}">${s.cyclical ? "Döngüsel" : "Savunma"}</span></td>
        <td>${isNum(s.dividendYears) ? `${s.dividendYears} yıl` : "–"}</td>
        <td>${priceLine}</td>
        <td>${srLine}</td>
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
        const stock = STOCKS.find((s) => s.symbol === sym);
        portfolio[sym] = { weight: 10, targetPrice: null, currentPrice: stock ? stock.currentPrice : null };
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
        const p = portfolio[sym];
        const hasSignal = p.targetPrice != null && p.currentPrice != null && p.currentPrice <= p.targetPrice;
        return `
          <div class="portfolio-row ${hasSignal ? "signal-row" : ""}" data-row-symbol="${sym}">
            <div class="portfolio-row-main">
              <span class="symbol">${sym}</span>
              <span class="portfolio-sector">${stock ? stock.sector : ""}</span>
              <input type="number" min="0" max="100" step="0.5" class="weight-input" data-symbol="${sym}" data-field="weight" value="${p.weight}" title="Portföy ağırlığı (%)" />
              <span>%</span>
              <button class="btn-remove-row" data-symbol="${sym}">✕</button>
            </div>
            <div class="portfolio-row-price">
              <label>Hedef alım fiyatı
                <input type="number" min="0" step="0.01" class="price-input" data-symbol="${sym}" data-field="targetPrice" value="${p.targetPrice ?? ""}" placeholder="TL" />
              </label>
              <label>Güncel fiyat
                <input type="number" min="0" step="0.01" class="price-input" data-symbol="${sym}" data-field="currentPrice" value="${p.currentPrice ?? ""}" placeholder="TL" />
              </label>
              <span class="signal-badge-slot">${hasSignal ? `<span class="badge badge-ok signal-badge">ALIM SİNYALİ</span>` : ""}</span>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".weight-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const sym = inp.dataset.symbol;
        const val = parseFloat(inp.value);
        portfolio[sym].weight = isNaN(val) ? 0 : val;
        savePortfolio();
        renderSummary();
        renderSectorChart();
        renderWarnings();
      });
    });
    container.querySelectorAll(".price-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const sym = inp.dataset.symbol;
        const field = inp.dataset.field;
        const val = parseFloat(inp.value);
        portfolio[sym][field] = inp.value === "" || isNaN(val) ? null : val;
        savePortfolio();
        updateSignalDisplay(sym);
        renderSummary();
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

  const totalWeight = Object.values(portfolio).reduce((a, p) => a + p.weight, 0);
  const totalEl = document.getElementById("total-weight");
  totalEl.textContent = `Toplam ağırlık: ${totalWeight.toFixed(1)}%`;
  totalEl.className = Math.abs(totalWeight - 100) < 0.01 ? "total-ok" : "total-warn";
}

function updateSignalDisplay(sym) {
  const p = portfolio[sym];
  const row = document.querySelector(`.portfolio-row[data-row-symbol="${sym}"]`);
  if (!row || !p) return;
  const hasSignal = p.targetPrice != null && p.currentPrice != null && p.currentPrice <= p.targetPrice;
  row.classList.toggle("signal-row", hasSignal);
  const slot = row.querySelector(".signal-badge-slot");
  slot.innerHTML = hasSignal ? `<span class="badge badge-ok signal-badge">ALIM SİNYALİ</span>` : "";
}

function portfolioStocks() {
  return Object.entries(portfolio)
    .map(([sym, p]) => ({ stock: STOCKS.find((s) => s.symbol === sym), weight: p.weight }))
    .filter((x) => x.stock);
}

function weightedAvg(items, field) {
  const known = items.filter((x) => isNum(x.stock[field]));
  const knownWeight = known.reduce((a, x) => a + x.weight, 0);
  if (!knownWeight) return null;
  return known.reduce((a, x) => a + x.stock[field] * x.weight, 0) / knownWeight;
}

function renderSummary() {
  const items = portfolioStocks();

  const weightedYield = weightedAvg(items, "yieldPct");
  const weightedPayout = weightedAvg(items, "payoutPct");
  const weightedDebt = weightedAvg(items, "debtToEquity");
  const sectorCount = new Set(items.map((x) => x.stock.sector)).size;
  const signalCount = Object.values(portfolio).filter(
    (p) => p.targetPrice != null && p.currentPrice != null && p.currentPrice <= p.targetPrice
  ).length;

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
      <div class="card-value">${isNum(weightedDebt) ? weightedDebt.toFixed(2) : "–"}</div>
    </div>
    <div class="card ${signalCount > 0 ? "card-signal" : ""}">
      <div class="card-label">Alım Sinyali</div>
      <div class="card-value">${signalCount}</div>
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

async function loadPriceData() {
  try {
    const res = await fetch("js/price-data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const priceData = await res.json();
    STOCKS.forEach((s) => {
      const p = priceData[s.symbol];
      if (p) Object.assign(s, p);
    });
    if (priceData._meta && priceData._meta.lastRefreshedAt) {
      const el = document.getElementById("price-refresh-note");
      if (el) {
        const d = new Date(priceData._meta.lastRefreshedAt);
        el.textContent = `Fiyat/destek-direnç verisi en son ${d.toLocaleDateString("tr-TR")} tarihinde web aramasıyla güncellendi.`;
      }
    }
  } catch (e) {
    // js/price-data.json bulunamadı/okunamadı (ör. file:// ile açıldı) —
    // tablo fiyat sütunları "–" olarak kalır, panelin geri kalanı çalışmaya devam eder.
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  renderCriteria();
  renderSectorFilterOptions();
  await loadPriceData();
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
