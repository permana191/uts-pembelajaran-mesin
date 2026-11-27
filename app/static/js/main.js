/* ==========================================================================
   CARBONTEL AI // LIGHTWEIGHT VANILLA JS TELEMETRY CONTROLLER
   Zero heavy dependencies, Event Delegation, Lazy Chart.js Rendering
   ========================================================================== */
(() => {
  "use strict";

  const state = {
    activeTab: "dashboard",
    chartsRendered: { dashboard: false, comparator: false },
    dashboardChart: null,
    fuelChart: null,
    comparatorChart: null,
    compareList: [
      { name: "Hyundai Ioniq Hybrid", vehicle_class: "FULL-SIZE", engine_size: 1.6, cylinders: 4, transmission: "AM6", fuel_type: "X", fuel_city: 4.2, fuel_hwy: 4.0, rf: 97.4, mlr: 101.2 },
      { name: "Toyota Corolla 2.0", vehicle_class: "COMPACT", engine_size: 2.0, cylinders: 4, transmission: "AV", fuel_type: "X", fuel_city: 7.7, fuel_hwy: 6.1, rf: 163.2, mlr: 165.8 },
      { name: "Ford F-150 4X4 V8", vehicle_class: "PICKUP TRUCK - STANDARD", engine_size: 5.0, cylinders: 8, transmission: "AS10", fuel_type: "X", fuel_city: 14.8, fuel_hwy: 11.2, rf: 306.5, mlr: 304.9 }
    ],
    datasetFilter: { fuel: "ALL", vclass: "ALL", query: "" },
    currentPage: 1,
    rowsPerPage: 12
  };

  const PRESETS = {
    hybrid: { vehicle_class: "FULL-SIZE", engine_size: 1.6, cylinders: 4, transmission: "AM6", fuel_type: "X", fuel_city: 4.2, fuel_hwy: 4.0 },
    compact: { vehicle_class: "COMPACT", engine_size: 2.0, cylinders: 4, transmission: "AV", fuel_type: "X", fuel_city: 7.8, fuel_hwy: 6.0 },
    sedan_turbo: { vehicle_class: "MID-SIZE", engine_size: 2.0, cylinders: 4, transmission: "AS8", fuel_type: "Z", fuel_city: 9.8, fuel_hwy: 6.9 },
    suv_diesel: { vehicle_class: "SUV - STANDARD", engine_size: 3.0, cylinders: 6, transmission: "AS8", fuel_type: "D", fuel_city: 10.6, fuel_hwy: 7.8 },
    pickup_e85: { vehicle_class: "PICKUP TRUCK - STANDARD", engine_size: 5.3, cylinders: 8, transmission: "A8", fuel_type: "E", fuel_city: 19.6, fuel_hwy: 14.5 },
    hypercar: { vehicle_class: "TWO-SEATER", engine_size: 8.0, cylinders: 16, transmission: "AM7", fuel_type: "Z", fuel_city: 26.8, fuel_hwy: 16.6 }
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Parse embedded metadata safely
  const metaEl = $("#app-metadata");
  const METADATA = metaEl ? JSON.parse(metaEl.textContent) : {};

  // ========================================================================
  // 1. TAB NAVIGATION (EVENT DELEGATION + GPU ANIMATION)
  // ========================================================================
  function switchTab(tabId) {
    if (!tabId || state.activeTab === tabId) return;
    state.activeTab = tabId;

    $$(".nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    $$(".tab-section").forEach(sec => {
      const isMatch = sec.id === `tab-${tabId}`;
      sec.classList.toggle("active", isMatch);
    });

    // Close mobile sidebar if open
    const sidebar = $("#rightSidebar");
    if (sidebar) sidebar.classList.remove("open");

    // Lazy initialize Chart.js instances only when tab becomes visible
    if (tabId === "dashboard" && !state.chartsRendered.dashboard) {
      renderDashboardCharts();
    } else if (tabId === "comparator" && !state.chartsRendered.comparator) {
      renderComparatorUI();
    }
  }

  document.addEventListener("click", (e) => {
    const navBtn = e.target.closest(".nav-btn");
    if (navBtn) {
      switchTab(navBtn.dataset.tab);
      return;
    }

    const presetBtn = e.target.closest(".preset-btn[data-preset]");
    if (presetBtn) {
      applyPreset(presetBtn.dataset.preset);
      $$(".preset-btn[data-preset]").forEach(b => b.classList.remove("active"));
      presetBtn.classList.add("active");
      return;
    }

    const fuelPill = e.target.closest(".fuel-filter-btn");
    if (fuelPill) {
      $$(".fuel-filter-btn").forEach(b => b.classList.remove("active"));
      fuelPill.classList.add("active");
      state.datasetFilter.fuel = fuelPill.dataset.fuel;
      state.currentPage = 1;
      renderDatasetTable();
      return;
    }

    const chartFilterBtn = e.target.closest(".chart-cat-btn");
    if (chartFilterBtn) {
      $$(".chart-cat-btn").forEach(b => b.classList.remove("active"));
      chartFilterBtn.classList.add("active");
      filterChartsGallery(chartFilterBtn.dataset.cat);
      return;
    }

    const zoomWrap = e.target.closest(".chart-img-wrap");
    if (zoomWrap) {
      openLightbox(zoomWrap.dataset.src, zoomWrap.dataset.title, zoomWrap.dataset.caption);
      return;
    }

    if (e.target.id === "closeLightbox" || e.target.id === "chartLightbox") {
      $("#chartLightbox").classList.remove("open");
    }
  });

  // Mobile Sidebar Toggle
  const mobileToggle = $("#mobileMenuBtn");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      $("#rightSidebar").classList.toggle("open");
    });
  }

  // ========================================================================
  // 2. DASHBOARD CHARTS (CHART.JS)
  // ========================================================================
  function renderDashboardCharts() {
    if (typeof Chart === "undefined" || !METADATA.vehicle_class_stats) return;
    state.chartsRendered.dashboard = true;

    const vcData = METADATA.vehicle_class_stats.slice(0, 10);
    const ctxVc = $("#vcOverviewChart");
    if (ctxVc) {
      state.dashboardChart = new Chart(ctxVc, {
        type: "bar",
        data: {
          labels: vcData.map(d => d["Vehicle Class"]),
          datasets: [{
            label: "Rata-rata Emisi CO2 (g/km)",
            data: vcData.map(d => d.mean),
            backgroundColor: "rgba(0, 243, 255, 0.35)",
            borderColor: "#00f3ff",
            borderWidth: 1.5
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#e2e8f0", font: { size: 11 } } }
          },
          scales: {
            x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.06)" } },
            y: { ticks: { color: "#e2e8f0", font: { size: 10 } }, grid: { display: false } }
          }
        }
      });
    }

    const fuelData = METADATA.fuel_stats || [];
    const fuelNames = { X: "Regular Gas (X)", Z: "Premium Gas (Z)", D: "Diesel (D)", E: "Ethanol E85 (E)" };
    const ctxFuel = $("#fuelOverviewChart");
    if (ctxFuel) {
      state.fuelChart = new Chart(ctxFuel, {
        type: "bar",
        data: {
          labels: fuelData.map(d => fuelNames[d["Fuel Type"]] || d["Fuel Type"]),
          datasets: [
            {
              label: "Mean Emisi CO2 (g/km)",
              data: fuelData.map(d => d.mean_co2),
              backgroundColor: "rgba(0, 255, 157, 0.38)",
              borderColor: "#00ff9d",
              borderWidth: 1.5,
              yAxisID: "y"
            },
            {
              label: "Mean Konsumsi BBM (L/100km)",
              data: fuelData.map(d => d.mean_comb),
              backgroundColor: "rgba(255, 184, 0, 0.38)",
              borderColor: "#ffb800",
              borderWidth: 1.5,
              yAxisID: "y1"
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#e2e8f0", font: { size: 11 } } }
          },
          scales: {
            x: { ticks: { color: "#e2e8f0" }, grid: { display: false } },
            y: { position: "left", ticks: { color: "#00ff9d" }, grid: { color: "rgba(255,255,255,0.06)" } },
            y1: { position: "right", ticks: { color: "#ffb800" }, grid: { display: false } }
          }
        }
      });
    }
  }

  // ========================================================================
  // 3. REAL-TIME CO2 SIMULATOR (BACKEND /api/predict)
  // ========================================================================
  function updateSliderLabels() {
    const eng = parseFloat($("#simEngine").value).toFixed(1);
    const city = parseFloat($("#simCity").value).toFixed(1);
    const hwy = parseFloat($("#simHwy").value).toFixed(1);
    const km = parseInt($("#simAnnualKm").value, 10);
    const comb = (0.55 * parseFloat(city) + 0.45 * parseFloat(hwy)).toFixed(2);

    $("#lblEngine").textContent = `${eng} L`;
    $("#lblCity").textContent = `${city} L/100km`;
    $("#lblHwy").textContent = `${hwy} L/100km`;
    $("#lblCombAuto").textContent = `${comb} L/100km`;
    $("#lblAnnualKm").textContent = `${km.toLocaleString("id-ID")} km/tahun`;
  }

  function applyPreset(key) {
    const p = PRESETS[key];
    if (!p) return;
    $("#simClass").value = p.vehicle_class;
    $("#simEngine").value = p.engine_size;
    $("#simCylinders").value = p.cylinders;
    $("#simTransmission").value = p.transmission;
    $("#simFuel").value = p.fuel_type;
    $("#simCity").value = p.fuel_city;
    $("#simHwy").value = p.fuel_hwy;
    updateSliderLabels();
    runSimulationPrediction();
  }

  async function runSimulationPrediction() {
    const payload = {
      vehicle_class: $("#simClass").value,
      engine_size: parseFloat($("#simEngine").value),
      cylinders: parseInt($("#simCylinders").value, 10),
      transmission: $("#simTransmission").value,
      fuel_type: $("#simFuel").value,
      fuel_city: parseFloat($("#simCity").value),
      fuel_hwy: parseFloat($("#simHwy").value),
      annual_km: parseFloat($("#simAnnualKm").value)
    };

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) return;

      const rfVal = data.predictions.random_forest;
      const mlrVal = data.predictions.multiple_linear_regression;

      $("#outRfCo2").textContent = rfVal.toFixed(1);
      $("#outMlrCo2").textContent = `${mlrVal.toFixed(1)} g/km`;
      $("#outModelDelta").textContent = `±${data.predictions.delta_models.toFixed(2)} g/km`;
      $("#outAnnualCo2").textContent = `${data.derived.annual_co2_kg.toLocaleString("id-ID")} kg/thn`;
      $("#outTrees").textContent = `${data.derived.trees_offset} pohon`;

      const diffAvg = data.derived.diff_vs_avg_pct;
      const sign = diffAvg > 0 ? "+" : "";
      $("#outVsAvg").textContent = `${sign}${diffAvg}% vs rata-rata`;

      const badge = $("#outEcoBadge");
      badge.textContent = `${data.eco_classification.tier} — ${data.eco_classification.status}`;
      badge.className = `eco-badge ${data.eco_classification.level}`;
      $("#outAdvice").textContent = data.eco_classification.advice;
    } catch (err) {
      console.error("Prediction error:", err);
    }
  }

  const simForm = $("#simulatorForm");
  if (simForm) {
    ["simEngine", "simCity", "simHwy", "simAnnualKm"].forEach(id => {
      const el = $(`#${id}`);
      if (el) el.addEventListener("input", updateSliderLabels);
    });
    simForm.addEventListener("submit", (e) => {
      e.preventDefault();
      runSimulationPrediction();
    });
  }

  // ========================================================================
  // 4. MULTI-VEHICLE HEAD-TO-HEAD COMPARATOR
  // ========================================================================
  function renderComparatorUI() {
    state.chartsRendered.comparator = true;
    const tbody = $("#compareTableBody");
    if (tbody) {
      tbody.innerHTML = state.compareList.map((item, idx) => {
        const comb = (0.55 * item.fuel_city + 0.45 * item.fuel_hwy).toFixed(2);
        const annualKg = Math.round((item.rf * 15000) / 1000);
        return `
          <tr>
            <td><strong>${item.name}</strong><br><small style="color:#94a3b8">${item.vehicle_class}</small></td>
            <td>${item.engine_size}L / ${item.cylinders}-Cyl / Fuel ${item.fuel_type}</td>
            <td>${comb} L/100km</td>
            <td style="color:#00f3ff;font-weight:700">${item.rf.toFixed(1)} g/km</td>
            <td style="color:#00ff9d">${item.mlr.toFixed(1)} g/km</td>
            <td>${annualKg.toLocaleString("id-ID")} kg/thn</td>
            <td><button class="btn-sm remove-cmp-btn" data-idx="${idx}"><i class="fas fa-trash"></i></button></td>
          </tr>
        `;
      }).join("");

      $$(".remove-cmp-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          state.compareList.splice(parseInt(btn.dataset.idx, 10), 1);
          renderComparatorUI();
        });
      });
    }

    const ctx = $("#comparatorChart");
    if (ctx && typeof Chart !== "undefined") {
      if (state.comparatorChart) state.comparatorChart.destroy();
      state.comparatorChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: state.compareList.map(c => c.name),
          datasets: [
            {
              label: "Random Forest (g/km)",
              data: state.compareList.map(c => c.rf),
              backgroundColor: "rgba(0, 243, 255, 0.45)",
              borderColor: "#00f3ff",
              borderWidth: 1.5
            },
            {
              label: "Multiple Linear Regression (g/km)",
              data: state.compareList.map(c => c.mlr),
              backgroundColor: "rgba(0, 255, 157, 0.4)",
              borderColor: "#00ff9d",
              borderWidth: 1.5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: "#e2e8f0" } } },
          scales: {
            x: { ticks: { color: "#e2e8f0" }, grid: { display: false } },
            y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.06)" }, beginAtZero: true }
          }
        }
      });
    }
  }

  const addCurrentBtn = $("#addCurrentToCompare");
  if (addCurrentBtn) {
    addCurrentBtn.addEventListener("click", async () => {
      if (state.compareList.length >= 5) {
        alert("Maksimal 5 kendaraan dalam arena komparasi. Hapus salah satu terlebih dahulu.");
        return;
      }
      const label = $("#cmpCustomName").value.trim() || `${$("#simClass").value} (${$("#simEngine").value}L)`;
      const payload = {
        vehicle_class: $("#simClass").value,
        engine_size: parseFloat($("#simEngine").value),
        cylinders: parseInt($("#simCylinders").value, 10),
        transmission: $("#simTransmission").value,
        fuel_type: $("#simFuel").value,
        fuel_city: parseFloat($("#simCity").value),
        fuel_hwy: parseFloat($("#simHwy").value)
      };
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        state.compareList.push({
          name: label,
          ...payload,
          rf: data.predictions.random_forest,
          mlr: data.predictions.multiple_linear_regression
        });
        $("#cmpCustomName").value = "";
        switchTab("comparator");
        renderComparatorUI();
      }
    });
  }

  // ========================================================================
  // 5. INTERACTIVE DATASET EXPLORER
  // ========================================================================
  function renderDatasetTable() {
    const records = METADATA.sample_records || [];
    const { fuel, vclass, query } = state.datasetFilter;
    const q = query.toLowerCase();

    const filtered = records.filter(r => {
      const matchFuel = fuel === "ALL" || r["Fuel Type"] === fuel;
      const matchClass = vclass === "ALL" || r["Vehicle Class"] === vclass;
      const matchText = !q || r["Make"].toLowerCase().includes(q) || r["Model"].toLowerCase().includes(q);
      return matchFuel && matchClass && matchText;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / state.rowsPerPage));
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    const start = (state.currentPage - 1) * state.rowsPerPage;
    const pageRows = filtered.slice(start, start + state.rowsPerPage);

    const tbody = $("#datasetTableBody");
    if (tbody) {
      tbody.innerHTML = pageRows.map(r => `
        <tr>
          <td><strong>${r["Make"]}</strong></td>
          <td>${r["Model"]}</td>
          <td>${r["Vehicle Class"]}</td>
          <td>${r["Engine Size(L)"]} L</td>
          <td>${r["Cylinders"]}</td>
          <td>${r["Transmission"]}</td>
          <td><span class="cyber-pill">${r["Fuel Type"]}</span></td>
          <td>${r["Fuel Consumption Comb (L/100 km)"]}</td>
          <td style="color:#00ff9d;font-weight:700">${r["CO2 Emissions(g/km)"]} g/km</td>
        </tr>
      `).join("") || `<tr><td colspan="9" style="text-align:center;color:#94a3b8">Tidak ada data kendaraan yang cocok dengan filter.</td></tr>`;
    }

    const pageInfo = $("#datasetPageInfo");
    if (pageInfo) {
      pageInfo.textContent = `Menampilkan ${pageRows.length} dari ${filtered.length} sampel terfilter (Halaman ${state.currentPage}/${totalPages})`;
    }
  }

  const searchInput = $("#datasetSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.datasetFilter.query = e.target.value;
      state.currentPage = 1;
      renderDatasetTable();
    });
  }

  const classSelect = $("#datasetClassFilter");
  if (classSelect) {
    classSelect.addEventListener("change", (e) => {
      state.datasetFilter.vclass = e.target.value;
      state.currentPage = 1;
      renderDatasetTable();
    });
  }

  if ($("#prevPageBtn")) {
    $("#prevPageBtn").addEventListener("click", () => {
      if (state.currentPage > 1) { state.currentPage--; renderDatasetTable(); }
    });
  }
  if ($("#nextPageBtn")) {
    $("#nextPageBtn").addEventListener("click", () => {
      state.currentPage++; renderDatasetTable();
    });
  }

  // ========================================================================
  // 6. REPORT CHARTS GALLERY & LIGHTBOX
  // ========================================================================
  function filterChartsGallery(category) {
    $$(".chart-item").forEach(card => {
      const show = category === "all" || card.dataset.category === category;
      card.style.display = show ? "flex" : "none";
    });
  }

  function openLightbox(src, title, caption) {
    $("#lightboxImg").src = src;
    $("#lightboxTitle").textContent = title;
    $("#lightboxCaption").textContent = caption;
    $("#lightboxDownload").href = src;
    $("#chartLightbox").classList.add("open");
  }

  // Initial boot
  document.addEventListener("DOMContentLoaded", () => {
    renderDashboardCharts();
    updateSliderLabels();
    runSimulationPrediction();
    renderDatasetTable();
  });
})();
