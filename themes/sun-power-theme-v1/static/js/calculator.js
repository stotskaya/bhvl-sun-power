(function () {
  const DATA_BASE = "/data/calculator";

  const SOURCES = {
    stationType: `${DATA_BASE}/station-types.json`,
    phases: `${DATA_BASE}/network-phases.json`,
    power: `${DATA_BASE}/power-options.json`,
    panels: `${DATA_BASE}/panel-options.json`,
    basic: `${DATA_BASE}/basic.json`,
  };

  // Маппінг ID → значення в basic.json
  const STATION_TYPE_TO_BASIC = { hybrid: "гібридна", grid: "мережева" };

  const state = {
    stationType: null,
    phases: null,
    power: null,
    consumption: null,
    panels: null,
  };

  let basicRows = [];

  async function loadJSON(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Не вдалося завантажити ${url}`);
    return res.json();
  }

  function renderOptionCards(container, items, key, layoutClass) {
    container.innerHTML = "";
    container.className = layoutClass;

    items.forEach((item) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className =
        "calc-option glass-card rounded-2xl p-6 text-left transition-all flex flex-col gap-3 border border-white/70 focus:outline-none";
      card.dataset.value = item.id;
      card.setAttribute("aria-pressed", "false");

      const top = document.createElement("div");
      top.className = "flex items-center justify-between gap-4";

      const label = document.createElement("span");
      label.className = "text-base font-medium text-gray-900";
      label.textContent = item.label;
      top.appendChild(label);

      if (item.icon) {
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", item.icon);
        icon.className = "w-5 h-5 text-amber-500 shrink-0";
        top.appendChild(icon);
      }

      card.appendChild(top);

      if (item.description) {
        const desc = document.createElement("span");
        desc.className = "text-xs text-gray-500 font-light leading-relaxed";
        desc.textContent = item.description;
        card.appendChild(desc);
      }

      card.addEventListener("click", () =>
        selectOption(container, card, key, item)
      );
      container.appendChild(card);
    });
  }

  function renderPowerOptions(container, items) {
    container.innerHTML = "";
    container.className =
      "grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3";

    items.forEach((item) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className =
        "calc-option glass-card rounded-xl py-4 px-3 text-center text-sm sm:text-base font-medium text-gray-900 transition-all border border-white/70 focus:outline-none";
      card.dataset.value = item.id;
      card.textContent = item.label;
      card.setAttribute("aria-pressed", "false");
      card.addEventListener("click", () =>
        selectOption(container, card, "power", item)
      );
      container.appendChild(card);
    });
  }

  function selectOption(container, card, key, item) {
    container.querySelectorAll(".calc-option").forEach((el) => {
      el.classList.remove("is-selected");
      el.setAttribute("aria-pressed", "false");
    });
    card.classList.add("is-selected");
    card.setAttribute("aria-pressed", "true");

    if (key === "power") {
      state[key] = item.value;
    } else {
      state[key] = item.id;
    }

    syncConsumption();
    updateResult();
  }

  function syncConsumption() {
    const consumptionInput = document.getElementById("calc-consumption");
    const consumption = parseFloat(consumptionInput.value);
    state.consumption =
      Number.isFinite(consumption) && consumption > 0 ? consumption : null;
  }

  function findBasicRow() {
    if (
      state.stationType === null ||
      state.phases === null ||
      state.power === null
    ) {
      return null;
    }
    const stationType = STATION_TYPE_TO_BASIC[state.stationType];
    const phases = parseInt(state.phases, 10);
    const power = state.power;

    return (
      basicRows.find(
        (r) =>
          r["тип_станції"] === stationType &&
          r["тип_мережі_фаз"] === phases &&
          r["потужність_квт"] === power
      ) || null
    );
  }

  function formatNumber(n) {
    return Number(n).toFixed(1).replace(/\.0$/, "");
  }

  function renderResultCard({ label, value, unit, hint, placeholder }) {
    const card = document.createElement("div");
    card.className = "glass-card rounded-2xl p-6 md:p-7";

    if (placeholder) {
      card.innerHTML = `
        <span class="block text-xs uppercase tracking-widest text-gray-400">${label}</span>
        <div class="mt-3">
          <span class="text-lg md:text-xl font-light text-gray-400 italic">${placeholder}</span>
        </div>
      `;
    } else {
      card.innerHTML = `
        <span class="block text-xs uppercase tracking-widest text-gray-400">${label}</span>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl md:text-4xl font-medium solar-gradient-text">${value}</span>
          ${
            unit
              ? `<span class="text-sm text-gray-500 font-light">${unit}</span>`
              : ""
          }
        </div>
        ${
          hint
            ? `<span class="block text-xs text-gray-400 font-light mt-2">${hint}</span>`
            : ""
        }
      `;
    }
    return card;
  }

  function renderBundleCard(opts) {
    const card = document.createElement("div");
    card.className = `calc-bundle ${
      opts.highlighted ? "calc-bundle-highlighted" : ""
    } rounded-2xl p-6 md:p-7`;

    const badge = opts.highlighted
      ? `<span class="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-semibold uppercase tracking-widest shadow-lg shadow-amber-200">
           Рекомендовано
         </span>`
      : "";

    const priceClass = opts.highlighted
      ? "solar-gradient-text font-medium"
      : "text-gray-900 font-medium";

    card.innerHTML = `
      ${badge}
      <div class="mb-5 pb-5 border-b border-white/65">
        <span class="block text-xs uppercase tracking-widest text-gray-400 mb-3">${
          opts.priceLabel
        }</span>
        <div class="flex items-baseline gap-1">
          <span class="text-3xl md:text-4xl ${priceClass}">$${opts.price}</span>
        </div>
      </div>

      <div class="calc-bundle-row">
        <span class="calc-bundle-row-label">Розрахункове генерування</span>
        <span class="calc-bundle-row-value">${
          opts.generation
        }<span class="calc-bundle-row-value-unit">кВт</span></span>
      </div>

      <div class="calc-bundle-row">
        <span class="calc-bundle-row-label">Річне споживання</span>
        <span class="calc-bundle-row-value">${
          opts.consumption
        }<span class="calc-bundle-row-value-unit">кВт</span></span>
      </div>

      <div class="pt-5 mt-2">
        <span class="block text-sm font-light leading-relaxed ${
          opts.statusTone === "positive"
            ? "text-green-700"
            : opts.statusTone === "negative"
            ? "text-amber-700"
            : "text-gray-500"
        }">
          ${opts.status}
        </span>
      </div>
    `;
    return card;
  }

  function updateResult() {
    const empty = document.getElementById("calc-result-empty");
    const notFound = document.getElementById("calc-result-notfound");
    const items = document.getElementById("calc-result-items");
    const bundles = document.getElementById("calc-result-bundles");

    const hasAllKeys =
      state.stationType !== null &&
      state.phases !== null &&
      state.power !== null;

    if (!hasAllKeys) {
      empty.classList.remove("hidden");
      notFound.classList.add("hidden");
      items.classList.add("hidden");
      items.innerHTML = "";
      bundles.classList.add("hidden");
      bundles.innerHTML = "";
      return;
    }

    const row = findBasicRow();

    if (!row) {
      empty.classList.add("hidden");
      notFound.classList.remove("hidden");
      items.classList.add("hidden");
      items.innerHTML = "";
      bundles.classList.add("hidden");
      bundles.innerHTML = "";
      return;
    }

    empty.classList.add("hidden");
    notFound.classList.add("hidden");
    items.classList.remove("hidden");
    items.innerHTML = "";
    bundles.classList.remove("hidden");
    bundles.innerHTML = "";

    const battery = Number(row["корисна_ємність_квт"]) || 0;
    const power = Number(row["потужність_квт"]) || 0;

    items.appendChild(
      renderResultCard({
        label: "Мінімально рекомендована АКБ",
        value: row["корисна_ємність_квт"],
        unit: "кВт·год",
        hint: "корисна ємність",
      })
    );

    if (battery > 0 && power > 0) {
      const hours = (battery / power) * 2;
      items.appendChild(
        renderResultCard({
          label: "Час автономної роботи на 50% потужності",
          value: formatNumber(hours),
          unit: "год",
          hint: "(корисна ємність ÷ потужність × 2)",
        })
      );
    } else {
      items.appendChild(
        renderResultCard({
          label: "Час автономної роботи на 50% потужності",
          placeholder: "Не передбачено",
        })
      );
    }

    items.appendChild(
      renderResultCard({
        label: "Необхідність АКБ",
        value: battery > 0 ? "Так" : "Ні",
      })
    );

    if (state.panels === "yes") {
      items.appendChild(
        renderResultCard({
          label: "Базова монтована потужність сонячних панелей",
          value: row["pv_потужність_мін"],
          unit: "кВт",
        })
      );

      items.appendChild(
        renderResultCard({
          label: "Рекомендована монтована потужність сонячних панелей",
          value: row["pv_потужність_рек"],
          unit: "кВт",
        })
      );
    }

    // Картки комплектів
    const placeholder = "—";
    const baseGenValue = (Number(row["pv_потужність_мін"]) || 0) * 1000;
    const recGenValue = (Number(row["pv_потужність_рек"]) || 0) * 1000;
    const yearlyConsumption =
      state.consumption !== null ? state.consumption * 12 : null;

    // Для порівняння: якщо панелі не «Так» — генерування = 0
    const baseGenForCompare = state.panels === "yes" ? baseGenValue : 0;
    const recGenForCompare = state.panels === "yes" ? recGenValue : 0;

    const STATUS_OK =
      "Потужність сонячної електростанції достатня для перекриття власного споживання";
    const STATUS_INSUFFICIENT =
      "Потужність сонячної електростанції недостатня для перекриття власного споживання";

    function bundleStatus(gen) {
      const sufficient = yearlyConsumption !== null && gen >= yearlyConsumption;
      return {
        text: sufficient ? STATUS_OK : STATUS_INSUFFICIENT,
        tone: sufficient ? "positive" : "negative",
      };
    }

    // Розкладка: одна картка центровано, якщо панелі не потрібні
    bundles.classList.remove("md:grid-cols-2", "md:max-w-xl", "md:mx-auto");
    if (state.panels === "no") {
      bundles.classList.add("md:max-w-xl", "md:mx-auto");

      bundles.appendChild(
        renderBundleCard({
          priceLabel: "Ціна комплекта, від",
          price: row["ціна_без_сонця"],
          generation: placeholder,
          consumption:
            yearlyConsumption !== null ? yearlyConsumption : placeholder,
          status: bundleStatus(0).text,
          statusTone: bundleStatus(0).tone,
          highlighted: false,
        })
      );
    } else {
      bundles.classList.add("md:grid-cols-2");

      const baseStatus = bundleStatus(baseGenForCompare);
      const recStatus = bundleStatus(recGenForCompare);

      bundles.appendChild(
        renderBundleCard({
          priceLabel: "Ціна базового комплекта, від",
          price: row["ціна_комплекта_баз"],
          generation: state.panels === "yes" ? baseGenValue : placeholder,
          consumption:
            yearlyConsumption !== null ? yearlyConsumption : placeholder,
          status: baseStatus.text,
          statusTone: baseStatus.tone,
          highlighted: false,
        })
      );

      bundles.appendChild(
        renderBundleCard({
          priceLabel: "Ціна рекомендованого комплекта, від",
          price: row["ціна_комплекта_рек"],
          generation: state.panels === "yes" ? recGenValue : placeholder,
          consumption:
            yearlyConsumption !== null ? yearlyConsumption : placeholder,
          status: recStatus.text,
          statusTone: recStatus.tone,
          highlighted: true,
        })
      );
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  async function init() {
    const containers = {
      stationType: document.getElementById("calc-station-type"),
      phases: document.getElementById("calc-phases"),
      power: document.getElementById("calc-power"),
      panels: document.getElementById("calc-panels"),
    };

    try {
      const [stationTypes, phases, powerOptions, panelOptions, basicData] =
        await Promise.all([
          loadJSON(SOURCES.stationType),
          loadJSON(SOURCES.phases),
          loadJSON(SOURCES.power),
          loadJSON(SOURCES.panels),
          loadJSON(SOURCES.basic),
        ]);

      basicRows = basicData.basic || [];

      renderOptionCards(
        containers.stationType,
        stationTypes,
        "stationType",
        "grid sm:grid-cols-2 gap-4"
      );
      renderOptionCards(
        containers.phases,
        phases,
        "phases",
        "grid sm:grid-cols-2 gap-4"
      );
      renderPowerOptions(containers.power, powerOptions);
      renderOptionCards(
        containers.panels,
        panelOptions,
        "panels",
        "grid sm:grid-cols-2 gap-4"
      );

      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    } catch (err) {
      console.error("Calculator load error:", err);
      const errorBox = document.getElementById("calc-error");
      if (errorBox) {
        errorBox.textContent =
          "Не вдалося завантажити дані калькулятора. Спробуйте оновити сторінку.";
        errorBox.classList.remove("hidden");
      }
    }

    document
      .getElementById("calc-consumption")
      .addEventListener("input", () => {
        syncConsumption();
        updateResult();
      });

    const form = document.getElementById("calc-form");
    if (form) {
      form.addEventListener("submit", (e) => e.preventDefault());
    }

    updateResult();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
