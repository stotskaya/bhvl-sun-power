document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  function reveal() {
    console.log("reveal");
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
      var windowHeight = window.innerHeight;
      var elementTop = reveals[i].getBoundingClientRect().top;
      var elementVisible = 150;
      if (elementTop < windowHeight - elementVisible) {
        reveals[i].classList.add("active");
      }
    }
  }

  window.addEventListener("scroll", reveal);

  reveal();


  window.onscroll = function () {
    const header = document.querySelector("header nav");
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      header.classList.add("py-2");
      header.classList.remove("py-3");
    } else {
      header.classList.add("py-3");
      header.classList.remove("py-2");
    }
  };

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const statusEl = document.getElementById("contact-form-status");
    const submitButton = document.getElementById("contact-submit");

    const getField = (id) => document.getElementById(id);
    const nameEl = getField("contact-name");
    const emailEl = getField("contact-email");
    const subjectEl = getField("contact-subject");
    const messageEl = getField("contact-message");

    const setStatus = (type, text) => {
      if (!statusEl) return;
      statusEl.classList.remove(
        "hidden",
        "bg-red-50",
        "text-red-700",
        "bg-green-50",
        "text-green-700"
      );
      if (type === "error") {
        statusEl.classList.add("bg-red-50", "text-red-700");
      } else {
        statusEl.classList.add("bg-green-50", "text-green-700");
      }
      statusEl.textContent = text;
    };

    const clearStatus = () => {
      if (!statusEl) return;
      statusEl.classList.add("hidden");
      statusEl.textContent = "";
    };

    const setError = (fieldId, message) => {
      const errorEl = document.getElementById(`contact-error-${fieldId}`);
      if (!errorEl) return;
      if (message) {
        errorEl.textContent = message;
        errorEl.classList.remove("hidden");
      } else {
        errorEl.textContent = "";
        errorEl.classList.add("hidden");
      }
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validate = () => {
      clearStatus();
      const name = (nameEl?.value || "").trim();
      const email = (emailEl?.value || "").trim();
      const subject = (subjectEl?.value || "").trim();
      const message = (messageEl?.value || "").trim();

      setError("name", name ? "" : "Please enter your name.");
      setError(
        "email",
        email
          ? validateEmail(email)
            ? ""
            : "Please enter a valid email address."
          : "Please enter your email."
      );
      setError("subject", subject ? "" : "Please enter a subject.");
      setError("message", message ? "" : "Please enter your message.");

      const ok =
        Boolean(name) &&
        Boolean(email) &&
        validateEmail(email) &&
        Boolean(subject) &&
        Boolean(message);
      return ok ? { name, email, subject, message } : null;
    };

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = validate();
      if (!payload) {
        setStatus("error", "Please fix the highlighted fields and try again.");
        return;
      }

      if (submitButton) submitButton.disabled = true;

      const body = `Name: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`;
      const mailto = `mailto:studio@lumina.energy?subject=${encodeURIComponent(
        payload.subject
      )}&body=${encodeURIComponent(body)}`;

      try {
        window.location.href = mailto;
        contactForm.reset();
        setStatus(
          "success",
          "Your message is ready to send in your email client."
        );
      } catch (err) {
        setStatus(
          "error",
          "Unable to open your email client. Please email us directly at studio@lumina.energy."
        );
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });

    ["input", "blur"].forEach((evt) => {
      [nameEl, emailEl, subjectEl, messageEl].forEach((el) => {
        if (!el) return;
        el.addEventListener(evt, () => {
          validate();
        });
      });
    });
  }
 
  if ("WebSocket" in window) {
    (function () {
      function refreshCSS() {
        var sheets = [].slice.call(document.getElementsByTagName("link"));
        var head = document.getElementsByTagName("head")[0];
        for (var i = 0; i < sheets.length; ++i) {
          var elem = sheets[i];
          var parent = elem.parentElement || head;
          parent.removeChild(elem);
          var rel = elem.rel;
          if (
            (elem.href && typeof rel != "string") ||
            rel.length == 0 ||
            rel.toLowerCase() == "stylesheet"
          ) {
            var url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, "");
            elem.href =
              url +
              (url.indexOf("?") >= 0 ? "&" : "?") +
              "_cacheOverride=" +
              new Date().valueOf();
          }
          parent.appendChild(elem);
        }
      }
      var protocol = window.location.protocol === "http:" ? "ws://" : "wss://";
      var address =
        protocol + window.location.host + window.location.pathname + "/ws";
      var socket = new WebSocket(address);
      socket.onmessage = function (msg) {
        if (msg.data == "reload") window.location.reload();
        else if (msg.data == "refreshcss") refreshCSS();
      };
      if (
        sessionStorage &&
        !sessionStorage.getItem("IsThisFirstTime_Log_From_LiveServer")
      ) {
        console.log("Live reload enabled.");
        sessionStorage.setItem("IsThisFirstTime_Log_From_LiveServer", true);
      }
    })();
  } else {
    console.error(
      "Upgrade your browser. This Browser is NOT supported WebSocket for Live-Reloading."
    );
  }

  
});

document.addEventListener("DOMContentLoaded", () => {
  initInsightsFilter();
  initCatalogFilter();
});


function initInsightsFilter() {
  const grid = document.getElementById("insightsGrid");
  if (!grid) return;

  console.log("Initializing Insights Filter...");

  const resultsCountEl = document.getElementById("resultsCount");
  const resultsStatusEl = document.getElementById("resultsStatus");
  const paginationEl = document.getElementById("insightsPagination");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageNumbersEl = document.getElementById("pageNumbers");
  const clearFiltersBtn = document.getElementById("clearFilters");

  if (!prevBtn || !nextBtn || !pageNumbersEl) return;

  const items = Array.from(grid.querySelectorAll("article[data-category]"));
  const categoryButtons = Array.from(
    document.querySelectorAll("button[data-category]")
  );
  const tagButtons = Array.from(document.querySelectorAll("button[data-tag]"));

  const pageSize = 6;
  let currentPage = 1;
  let selectedCategory = "all";
  let selectedTag = "all";

  const norm = (v) =>
    String(v || "")
      .trim()
      .toLowerCase();

  const render = () => {
    const filtered = items.filter((item) => {
      const cat = norm(item.dataset.category);
      const tags = new Set(
        String(item.dataset.tags || "")
          .split(",")
          .map((t) => norm(t))
      );
      const catOk =
        selectedCategory === "all" || cat === norm(selectedCategory);
      const tagOk = selectedTag === "all" || tags.has(norm(selectedTag));
      return catOk && tagOk;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (currentPage - 1) * pageSize;
    const visible = new Set(filtered.slice(start, start + pageSize));

    items.forEach((item) =>
      item.classList.toggle("hidden", !visible.has(item))
    );

    if (resultsCountEl) resultsCountEl.textContent = String(total);
    if (paginationEl)
      paginationEl.classList.toggle("hidden", total <= pageSize);

    updatePaginationUI(totalPages);
  };

  function updatePaginationUI(totalPages) {
    pageNumbersEl.innerHTML = "";
    for (let p = 1; p <= totalPages; p++) {
      const btn = document.createElement("button");
      btn.className = `w-10 h-10 rounded-full text-sm font-medium ${
        p === currentPage ? "bg-gray-900 text-white" : "glass-card"
      }`;
      btn.textContent = p;
      btn.onclick = () => {
        currentPage = p;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
      pageNumbersEl.appendChild(btn);
    }
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
  }

  categoryButtons.forEach(
    (btn) =>
      (btn.onclick = () => {
      selectedCategory = btn.dataset.category;
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
        currentPage = 1;
        render();
      })
  );
  tagButtons.forEach(
    (btn) =>
      (btn.onclick = () => {
      selectedTag = btn.dataset.tag;
      tagButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
        currentPage = 1;
        render();
      })
  );

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  };
  nextBtn.onclick = () => {
     currentPage++;
    render();
  };

  render();
}


function initCatalogFilter() {


  console.log("Initializing Catalog Filter...");

  const grid = document.getElementById("catalogGrid");
    const resultsCountEl = document.getElementById("resultsCount");
    const resultsStatusEl = document.getElementById("resultsStatus");
    const noResultsEl = document.getElementById("noResults");
    const noResultsReset = document.getElementById("noResultsReset");
    const filtersForm = document.getElementById("filtersForm");
    const resetFiltersBtn = document.getElementById("resetFilters");
    const clearSearchStateBtn = document.getElementById("clearSearchState");
    const activeFiltersCountEl = document.getElementById("activeFiltersCount");
    const sortByEl = document.getElementById("sortBy");
    const priceMinEl = document.getElementById("priceMin");
    const priceMaxEl = document.getElementById("priceMax");

    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");
    const pageNumbersEl = document.getElementById("pageNumbers");

    const filtersToggle = document.getElementById("filtersToggle");
    const filtersPanel = document.getElementById("filtersPanel");

    if (
      !grid ||
      !filtersForm ||
      !resultsCountEl ||
      !prevBtn ||
      !nextBtn ||
      !pageNumbersEl
    )
      return;

    const allItems = Array.from(grid.querySelectorAll("[data-id]"));
    const pageSize = 9;
    let currentPage = 1;
    let filteredItems = allItems.slice();

    const getCheckedValues = (name) =>
      Array.from(
        filtersForm.querySelectorAll(`input[name="${name}"]:checked`)
      ).map((el) => el.value);
    const getSelectedRatingMin = () => {
      const selected = filtersForm.querySelector(
        'input[name="rating"]:checked'
      );
      const v = selected ? parseFloat(selected.value) : 0;
      return Number.isFinite(v) ? v : 0;
    };
    const getPrice = (el) => {
      const raw = (el && el.value ? String(el.value) : "").trim();
      const v = raw === "" ? NaN : parseFloat(raw);
      return Number.isFinite(v) ? v : NaN;
    };
    const normalizeSet = (values) =>
      new Set(values.map((v) => String(v).trim()).filter(Boolean));
    const itemTags = (item) =>
      normalizeSet(String(item.dataset.tags || "").split(","));

    const computeActiveFiltersCount = () => {
      const categories = getCheckedValues("category");
      const tags = getCheckedValues("tag");
      const brands = getCheckedValues("brand");
      const ratingMin = getSelectedRatingMin();
      const min = getPrice(priceMinEl);
      const max = getPrice(priceMaxEl);

      let count = categories.length + tags.length + brands.length;
      if (ratingMin > 0) count += 1;
      if (Number.isFinite(min) || Number.isFinite(max)) count += 1;
      return count;
    };

    const matchesFilters = (item) => {
      const categories = normalizeSet(getCheckedValues("category"));
      const tags = normalizeSet(getCheckedValues("tag"));
      const brands = normalizeSet(getCheckedValues("brand"));
      const ratingMin = getSelectedRatingMin();
      const min = getPrice(priceMinEl);
      const max = getPrice(priceMaxEl);

      const itemCategory = String(item.dataset.category || "");
      const itemBrand = String(item.dataset.brand || "");
      const itemRating = parseFloat(item.dataset.rating || "0");
      const itemPrice = parseFloat(item.dataset.price || "0");

      if (categories.size && !categories.has(itemCategory)) return false;
      if (brands.size && !brands.has(itemBrand)) return false;
      if (
        Number.isFinite(ratingMin) &&
        ratingMin > 0 &&
        !(itemRating >= ratingMin)
      )
        return false;

      if (Number.isFinite(min) && itemPrice < min) return false;
      if (Number.isFinite(max) && itemPrice > max) return false;

      if (tags.size) {
        const t = itemTags(item);
        let ok = false;
        tags.forEach((tag) => {
          if (t.has(tag)) ok = true;
        });
        if (!ok) return false;
      }

      return true;
    };

    const sortItems = (items) => {
      const key = sortByEl ? sortByEl.value : "featured";
      const copy = items.slice();
      const byName = (a, b) =>
        String(
          a.querySelector('[itemprop="name"]')?.textContent || ""
        ).localeCompare(
          String(b.querySelector('[itemprop="name"]')?.textContent || "")
        );
      const byPrice = (a, b) =>
        parseFloat(a.dataset.price || "0") - parseFloat(b.dataset.price || "0");
      const byRating = (a, b) =>
        parseFloat(b.dataset.rating || "0") -
        parseFloat(a.dataset.rating || "0");
      const byFeatured = (a, b) =>
        parseInt(b.dataset.featured || "0", 10) -
        parseInt(a.dataset.featured || "0", 10);

      switch (key) {
        case "price_asc":
          copy.sort((a, b) => byPrice(a, b));
          break;
        case "price_desc":
          copy.sort((a, b) => byPrice(b, a));
          break;
        case "rating_desc":
          copy.sort(
            (a, b) => byRating(a, b) || byFeatured(a, b) || byName(a, b)
          );
          break;
        case "name_asc":
          copy.sort((a, b) => byName(a, b));
          break;
        case "featured":
        default:
          copy.sort(
            (a, b) => byFeatured(a, b) || byRating(a, b) || byName(a, b)
          );
          break;
      }
      return copy;
    };

    const setVisibility = (item, visible) => {
      item.classList.toggle("hidden", !visible);
      item.setAttribute("aria-hidden", visible ? "false" : "true");
      const focusables = item.querySelectorAll(
        "a, button, input, select, textarea, [tabindex]"
      );
      focusables.forEach((el) => {
        if (!visible) {
          el.setAttribute("tabindex", "-1");
        } else if (el.getAttribute("tabindex") === "-1") {
          el.removeAttribute("tabindex");
        }
      });
    };

    const renderPagination = (totalPages) => {
      pageNumbersEl.innerHTML = "";
      const maxButtons = 7;
      const clampedCurrent = Math.min(
        Math.max(currentPage, 1),
        totalPages || 1
      );
      currentPage = clampedCurrent;

      const makeButton = (page, label) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-sm font-medium hover:bg-black hover:text-white transition-all";
        btn.textContent = label;
        btn.setAttribute("aria-label", `Page ${page}`);
        if (page === currentPage) {
          btn.classList.add("bg-gray-900", "text-white");
          btn.setAttribute("aria-current", "page");
        }
        btn.addEventListener("click", () => {
          currentPage = page;
          update();
          window.scrollTo({
            top: grid.getBoundingClientRect().top + window.scrollY - 120,
            behavior: "smooth",
          });
        });
        return btn;
      };

      const buildRange = () => {
        if (totalPages <= maxButtons) {
          return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const range = [];
        const left = Math.max(1, currentPage - 2);
        const right = Math.min(totalPages, currentPage + 2);
        range.push(1);
        if (left > 2) range.push("…");
        for (let p = left; p <= right; p += 1) {
          if (p !== 1 && p !== totalPages) range.push(p);
        }
        if (right < totalPages - 1) range.push("…");
        if (totalPages > 1) range.push(totalPages);
        return range;
      };

      buildRange().forEach((p) => {
        if (p === "…") {
          const span = document.createElement("span");
          span.className = "text-gray-400 px-2";
          span.textContent = "…";
          span.setAttribute("aria-hidden", "true");
          pageNumbersEl.appendChild(span);
          return;
        }
        pageNumbersEl.appendChild(makeButton(p, String(p)));
      });

      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;
    };

    const update_1 = () => {
      console.log("update");
      const activeCount = computeActiveFiltersCount();
      if (activeFiltersCountEl)
        activeFiltersCountEl.textContent = `${activeCount} active`;

      const matches = allItems.filter(matchesFilters);
      filteredItems = sortItems(matches);

      const total = filteredItems.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      if (currentPage > totalPages) currentPage = 1;

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pageItems = new Set(filteredItems.slice(start, end));

      allItems.forEach((item) => setVisibility(item, pageItems.has(item)));

      resultsCountEl.textContent = String(total);
      if (resultsStatusEl) {
        resultsStatusEl.textContent = total
          ? `Showing ${Math.min(
              total,
              end
            )} of ${total} (page ${currentPage}/${totalPages})`
          : "No results";
      }

      if (noResultsEl) noResultsEl.classList.toggle("hidden", total !== 0);
      if (grid) grid.classList.toggle("hidden", total === 0);
      if (prevBtn.parentElement)
        prevBtn.parentElement.classList.toggle("hidden", total === 0);

      renderPagination(totalPages);
    };

    const resetAll = () => {
      filtersForm.reset();
      if (priceMinEl) priceMinEl.value = "";
      if (priceMaxEl) priceMaxEl.value = "";
      if (sortByEl) sortByEl.value = "featured";
      currentPage = 1;
      update_1();
    };

    filtersForm.addEventListener("submit", (e) => {
      e.preventDefault();
      currentPage = 1;
      update_1();
      if (
        filtersToggle &&
        filtersPanel &&
        window.matchMedia("(max-width: 1023px)").matches
      ) {
        filtersPanel.classList.add("hidden");
        filtersToggle.setAttribute("aria-expanded", "false");
      }
    });

    filtersForm.addEventListener("change", () => {
      currentPage = 1;
      update_1();
    });

    if (sortByEl) {
      sortByEl.addEventListener("change", () => {
        currentPage = 1;
        update_1();
      });
    }

    if (resetFiltersBtn) resetFiltersBtn.addEventListener("click", resetAll);
    if (clearSearchStateBtn)
      clearSearchStateBtn.addEventListener("click", resetAll);
    if (noResultsReset) noResultsReset.addEventListener("click", resetAll);

    prevBtn.addEventListener("click", () => {
      if (currentPage <= 1) return;
      currentPage -= 1;
      update_1();
      window.scrollTo({
        top: grid.getBoundingClientRect().top + window.scrollY - 120,
        behavior: "smooth",
      });
    });

    nextBtn.addEventListener("click", () => {
      const totalPages = Math.max(
        1,
        Math.ceil(filteredItems.length / pageSize)
      );
      if (currentPage >= totalPages) return;
      currentPage += 1;
      update_1();
      window.scrollTo({
        top: grid.getBoundingClientRect().top + window.scrollY - 120,
        behavior: "smooth",
      });
    });

    if (filtersToggle && filtersPanel) {
      filtersToggle.addEventListener("click", () => {
        const isHidden = filtersPanel.classList.contains("hidden");
        filtersPanel.classList.toggle("hidden", !isHidden);
        filtersToggle.setAttribute(
          "aria-expanded",
          isHidden ? "true" : "false"
        );
      });
    }

    update_1();

}
const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' data-lucide='cpu' style='stroke-width: 0.5;color: rgb(229 231 235);' aria-hidden='true'%3E%3Cpath d='M12 20v2'%3E%3C/path%3E%3Cpath d='M12 2v2'%3E%3C/path%3E%3Cpath d='M17 20v2'%3E%3C/path%3E%3Cpath d='M17 2v2'%3E%3C/path%3E%3Cpath d='M2 12h2'%3E%3C/path%3E%3Cpath d='M2 17h2'%3E%3C/path%3E%3Cpath d='M2 7h2'%3E%3C/path%3E%3Cpath d='M20 12h2'%3E%3C/path%3E%3Cpath d='M20 17h2'%3E%3C/path%3E%3Cpath d='M20 7h2'%3E%3C/path%3E%3Cpath d='M7 20v2'%3E%3C/path%3E%3Cpath d='M7 2v2'%3E%3C/path%3E%3Crect x='4' y='4' width='16' height='16' rx='2'%3E%3C/rect%3E%3Crect x='8' y='8' width='8' height='8' rx='1'%3E%3C/rect%3E%3C/svg%3E";
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", function () {
      console.warn("Image failed to load:", this.src);
      this.src = PLACEHOLDER_SVG;
      this.style = "width: 60%; height: auto;"
      this.classList.add("is-placeholder"); 
    });
  });
});