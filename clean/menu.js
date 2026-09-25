(function () {
  const root = document.getElementById("menuRoot");
  const nav = document.getElementById("menuNav");
  const searchInput = document.getElementById("menuSearch");
  const searchStatus = document.getElementById("menuSearchStatus");
  const searchClear = document.getElementById("menuSearchClear");
  if (!root || !window.FUSION_MENU) return;

  const menu = window.FUSION_MENU;

  /* Everyday words → menu language (UK takeaway) */
  const SYNONYMS = {
    shrimp: ["prawn", "king prawn"],
    shrimps: ["prawn", "king prawn"],
    prawns: ["prawn", "king prawn"],
    prawn: ["king prawn", "prawn"],
    "king prawns": ["king prawn"],
    scampi: ["king prawn", "prawn"],
    fries: ["chips"],
    "french fries": ["chips"],
    "potato chips": ["chips"],
    chip: ["chips"],
    noodles: ["chow mein", "noodle"],
    noodle: ["chow mein", "noodle"],
    "chow mein": ["chow mein", "noodle"],
    "lo mein": ["chow mein"],
    "egg roll": ["spring roll", "pancake roll"],
    "egg rolls": ["spring roll", "pancake roll"],
    "spring roll": ["spring roll", "pancake roll"],
    "pancake roll": ["pancake roll", "spring roll"],
    wonton: ["won ton"],
    wanton: ["won ton"],
    "won ton": ["won ton"],
    dumplings: ["won ton", "samosa"],
    "hot and sour": ["hot & sour"],
    "sweet and sour": ["sweet & sour"],
    "salt and chilli": ["salt & chilli"],
    "salt and chili": ["salt & chilli"],
    chili: ["chilli"],
    chilli: ["chilli"],
    spicy: ["chilli", "szechuan", "thai", "salt & chilli", "kung po"],
    hot: ["chilli", "spicy", "szechuan"],
    peanut: ["satay", "cashew"],
    peanuts: ["satay", "cashew"],
    "cashew nut": ["cashew"],
    cashews: ["cashew"],
    bbq: ["bbq", "barbecue"],
    barbecue: ["bbq"],
    barbeque: ["bbq"],
    "char siu": ["roast pork"],
    "cha siu": ["roast pork"],
    "chinese sausage": ["roast pork"],
    "roast pork": ["roast pork"],
    charsiu: ["roast pork"],
    "orange chicken": ["orange sauce", "lemon or orange"],
    "lemon chicken": ["lemon or orange", "lemon"],
    "general tso": ["kung po", "chilli"],
    "kung pao": ["kung po"],
    "kungpo": ["kung po"],
    szechuan: ["szechuan"],
    sichuan: ["szechuan"],
    "schezwan": ["szechuan"],
    "schezuan": ["szechuan"],
    "black bean": ["black bean"],
    "bean sauce": ["black bean"],
    veggies: ["vegetable", "mushroom", "beansprout"],
    vegetables: ["vegetable", "mushroom", "beansprout"],
    veg: ["vegetable"],
    starter: ["appetiser", "starter"],
    starters: ["appetiser"],
    appetizer: ["appetiser"],
    appetizers: ["appetiser"],
    "deep fried": ["deep fried", "crispy", "balls"],
    crispy: ["crispy", "deep fried"],
    wings: ["chicken wings", "wings"],
    ribs: ["spare ribs", "ribs"],
    "spare rib": ["spare ribs"],
    rice: ["rice", "fried rice", "boiled rice"],
    "fried rice": ["egg fried rice", "fried rice"],
    "boiled rice": ["boiled rice"],
    crackers: ["prawn crackers"],
    "prawn cracker": ["prawn crackers"],
    toast: ["prawn on toast", "sesame"],
    "sesame toast": ["sesame prawn on toast"],
    duck: ["duck", "aromatic duck", "roast duck"],
    "peking duck": ["aromatic duck", "roast duck", "peking"],
    "crispy duck": ["aromatic duck", "crispy"],
    squid: ["squid"],
    calamari: ["squid"],
    mussels: ["mussels"],
    seaweed: ["seaweed"],
    samosa: ["samosa"],
    "onion rings": ["onion rings"],
    munchie: ["munchie box"],
    "munchy box": ["munchie box"],
    "snack box": ["snack box", "box"],
    combo: ["combination", "special", "mixed"],
    combination: ["combination"],
    special: ["special", "house special", "combination"],
    "thai red": ["thai red", "thai"],
    "thai green": ["thai green", "thai"],
    "green curry": ["thai", "curry"],
    "red curry": ["thai", "curry"],
    satay: ["satay"],
    "honey chilli": ["honey chilli"],
    "honey chili": ["honey chilli"],
    "sweet chilli": ["sweet chilli"],
    "sweet chili": ["sweet chilli"],
    peking: ["peking"],
    cantonese: ["cantonese"],
    "black pepper": ["black pepper"],
    ginger: ["ginger"],
    pineapple: ["pineapple"],
    tomato: ["tomato"],
    mushroom: ["mushroom"],
    mushrooms: ["mushroom"],
    "cashew nuts": ["cashew"],
    "spring onion": ["spring onion"],
    "green pepper": ["green pepper"],
    oyster: ["oyster"],
    plum: ["plum"],
    lemon: ["lemon"],
    orange: ["orange"],
    honey: ["honey"],
    gravy: ["gravy"],
    sauce: ["sauce"],
    dessert: ["fritter", "banana", "pineapple fritter"],
    pudding: ["fritter"],
    sweet: ["sweet & sour", "fritter", "honey"],
  };

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const STOPWORDS = new Set([
    "a",
    "an",
    "and",
    "or",
    "the",
    "of",
    "in",
    "on",
    "with",
    "for",
    "to",
    "any",
    "style",
    "dishes",
    "dish",
  ]);

  function tokens(s) {
    return normalize(s)
      .split(" ")
      .filter((t) => t && !STOPWORDS.has(t));
  }

  function fuzzyAllowed(len) {
    // Keep short tokens exact/prefix-only so fries≠fried.
    if (len < 6) return 0;
    if (len <= 9) return 2;
    return 2;
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const row = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) row[j] = j;
    for (let i = 1; i <= a.length; i++) {
      let prev = i - 1;
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = row[j];
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
        prev = tmp;
      }
    }
    return row[b.length];
  }

  function expandQuery(query) {
    const n = normalize(query);
    if (!n) return { phrases: [], tokens: [] };

    const phrases = new Set([n]);
    const toks = new Set(tokens(n));
    const padded = ` ${n} `;

    // Multi-word synonym keys first (longest match), whole words only
    const keys = Object.keys(SYNONYMS).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      const kn = normalize(key);
      if (!kn) continue;
      if (padded.includes(` ${kn} `)) {
        SYNONYMS[key].forEach((syn) => {
          phrases.add(normalize(syn));
          tokens(syn).forEach((t) => toks.add(t));
        });
        phrases.add(kn);
        tokens(kn).forEach((t) => toks.add(t));
      }
    }

    // Per-token synonyms (exact) + careful fuzzy synonym keys (wantonn → wanton)
    // Skip fuzzy on short keys like fried/fries (1-letter neighbors).
    const synKeys = Object.keys(SYNONYMS);
    tokens(n).forEach((t) => {
      if (SYNONYMS[t]) {
        SYNONYMS[t].forEach((syn) => {
          phrases.add(normalize(syn));
          tokens(syn).forEach((x) => toks.add(x));
        });
        return;
      }
      if (t.length < 6) return;
      const allowed = 1;
      let bestKey = null;
      let bestD = Infinity;
      for (const key of synKeys) {
        const kn = normalize(key);
        if (!kn || kn.length < 6) continue;
        if (Math.abs(kn.length - t.length) > allowed) continue;
        const d = levenshtein(t, kn);
        if (d > 0 && d <= allowed && d < bestD) {
          bestD = d;
          bestKey = key;
        }
      }
      if (bestKey) {
        phrases.add(normalize(bestKey));
        tokens(bestKey).forEach((x) => toks.add(x));
        SYNONYMS[bestKey].forEach((syn) => {
          phrases.add(normalize(syn));
          tokens(syn).forEach((x) => toks.add(x));
        });
      }
    });

    return { phrases: [...phrases], tokens: [...toks] };
  }

  function tags(item, cat) {
    const bits = [];
    if (item.spicy || cat.spicy) bits.push('<span class="tag tag-spicy" title="Spicy">!</span>');
    if (item.neu) bits.push('<span class="tag tag-new" title="New">New</span>');
    if (item.nuts || cat.nuts) bits.push('<span class="tag tag-nuts" title="Contains nuts">N</span>');
    return bits.length ? `<span class="meta">${bits.join("")}</span>` : "";
  }

  /** Flat search index */
  const index = [];

  function addIndexEntry(entry) {
    index.push(entry);
  }

  function renderCategory(cat) {
    const section = document.createElement("section");
    section.className = "menu-category";
    section.id = `cat-${cat.id}`;
    section.dataset.catId = cat.id;

    let html = `<h3>${cat.title}</h3>`;
    if (cat.blurb) html += `<p class="blurb">${cat.blurb}</p>`;

    if (cat.boxes) {
      html += `<div class="box-grid">${cat.boxes
        .map((box, i) => {
          const hay = normalize(
            `snack box ${box.code} ${box.lines.join(" ")} ${cat.title}`
          );
          addIndexEntry({
            id: `box-${cat.id}-${box.code}`,
            kind: "box",
            catId: cat.id,
            label: `Snack Box ${box.code}`,
            hay,
            tokens: tokens(hay),
          });
          return `
        <article class="box-card" data-search-id="box-${cat.id}-${box.code}">
          <div class="code">Box ${box.code}</div>
          <div class="price">£${box.price}</div>
          <ul>${box.lines.map((line) => `<li>${line}</li>`).join("")}</ul>
        </article>`;
        })
        .join("")}</div>`;
    } else {
      html += `<ul class="menu-list">${cat.items
        .map((item) => {
          const shortName = item.name.length <= 18;
          const label = shortName
            ? `${item.name} (${cat.title.replace(/ Dishes$/, "").replace(/ Style$/, "")})`
            : item.name;
          const hay = normalize(
            `${item.name} ${item.note || ""} ${cat.title} ${
              item.spicy || cat.spicy ? "spicy chilli hot" : ""
            } ${item.nuts || cat.nuts ? "nuts satay cashew" : ""}`
          );
          addIndexEntry({
            id: `item-${item.n}`,
            kind: "item",
            catId: cat.id,
            n: item.n,
            label,
            name: item.name,
            hay,
            tokens: tokens(hay),
          });
          return `
        <li class="menu-item" data-search-id="item-${item.n}">
          <span class="num">${item.n}</span>
          <div class="name-wrap">
            <span class="name">${item.name}</span>${tags(item, cat)}
            ${item.note ? `<span class="note">${item.note}</span>` : ""}
          </div>
          <span class="price">${item.price}</span>
        </li>`;
        })
        .join("")}</ul>`;
    }

    section.innerHTML = html;
    root.appendChild(section);
  }

  menu.forEach(renderCategory);

  menu.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = cat.title.replace(/ Dishes$/, "");
    btn.addEventListener("click", () => {
      if (searchInput && searchInput.value.trim()) {
        searchInput.value = "";
        applySearch("");
      }
      document.querySelectorAll(".menu-nav button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const target = document.getElementById(`cat-${cat.id}`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nav.appendChild(btn);
  });

  function scoreEntry(entry, expanded) {
    const hay = entry.hay;
    let score = 0;
    let matched = false;

    for (const phrase of expanded.phrases) {
      if (!phrase) continue;
      if (hay === phrase) {
        score += 120;
        matched = true;
      } else if (hay.includes(phrase)) {
        score += 70 + Math.min(phrase.length, 30);
        matched = true;
      }
    }

    for (const qt of expanded.tokens) {
      if (qt.length < 2 || STOPWORDS.has(qt)) continue;
      if (entry.tokens.includes(qt)) {
        score += 28;
        matched = true;
        continue;
      }
      // Prefix (e.g. chic → chicken)
      if (qt.length >= 3) {
        const prefixHit = entry.tokens.some(
          (et) => et.startsWith(qt) || (qt.startsWith(et) && et.length >= 4)
        );
        if (prefixHit) {
          score += 14;
          matched = true;
          continue;
        }
      }
      // Fuzzy token match (typos) — strict to avoid fries→fried noise
      const allowed = fuzzyAllowed(qt.length);
      if (!allowed) continue;
      for (const et of entry.tokens) {
        if (STOPWORDS.has(et)) continue;
        if (Math.abs(et.length - qt.length) > allowed) continue;
        const d = levenshtein(qt, et);
        const maxLen = Math.max(qt.length, et.length);
        if (d > 0 && d <= allowed && d / maxLen <= 0.34) {
          score += 18 - d * 5;
          matched = true;
          break;
        }
      }
    }

    // Item number exact
    const numMatch = expanded.phrases[0] && /^\d+$/.test(expanded.phrases[0]);
    if (numMatch && String(entry.n) === expanded.phrases[0]) {
      score += 200;
      matched = true;
    }

    // Prefer dishes that cover more of the typed words (chicken + curry > chicken soup)
    if (matched && expanded.tokens.length > 1) {
      let covered = 0;
      for (const qt of expanded.tokens) {
        if (qt.length < 2 || STOPWORDS.has(qt)) continue;
        const hit =
          entry.tokens.includes(qt) ||
          entry.tokens.some((et) => et.startsWith(qt) || (qt.startsWith(et) && et.length >= 4)) ||
          entry.hay.includes(qt);
        if (hit) covered += 1;
      }
      score += covered * 35;
    }

    return matched ? score : 0;
  }

  function closestSuggestions(query, limit) {
    const n = normalize(query);
    if (n.length < 2) return [];
    const qTokens = tokens(n);
    const candidates = new Map(); // label -> score

    // Close dish names / tokens from index
    index.forEach((entry) => {
      const nameN = normalize(entry.name || entry.label);
      const d = levenshtein(n, nameN);
      const maxLen = Math.max(n.length, nameN.length);
      if (d <= 3 && d / maxLen <= 0.45) {
        candidates.set(entry.label, (candidates.get(entry.label) || 0) + 50 - d * 10);
      }
      // Token-level: typed word close to a menu word
      qTokens.forEach((qt) => {
        if (qt.length < 4 || STOPWORDS.has(qt)) return;
        const allowed = fuzzyAllowed(qt.length);
        entry.tokens.forEach((et) => {
          if (et.length < 4 || STOPWORDS.has(et)) return;
          const td = levenshtein(qt, et);
          if (td > 0 && td <= allowed) {
            candidates.set(et, (candidates.get(et) || 0) + 20 - td * 5);
          }
        });
      });
    });

    // Synonym keys that are close typos
    Object.keys(SYNONYMS).forEach((key) => {
      const kn = normalize(key);
      qTokens.forEach((qt) => {
        if (qt.length < 4) return;
        const d = levenshtein(qt, kn);
        if (d > 0 && d <= fuzzyAllowed(qt.length)) {
          candidates.set(key, (candidates.get(key) || 0) + 25 - d * 5);
        }
      });
      if (n.length >= 4) {
        const d = levenshtein(n, kn);
        if (d > 0 && d <= fuzzyAllowed(n.length)) {
          candidates.set(key, (candidates.get(key) || 0) + 30 - d * 8);
        }
      }
    });

    return [...candidates.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([label]) => label);
  }

  function applySearch(raw) {
    const q = raw.trim();
    const sections = root.querySelectorAll(".menu-category");
    const items = root.querySelectorAll("[data-search-id]");

    if (!q) {
      sections.forEach((s) => {
        s.hidden = false;
        s.classList.remove("is-search-hit");
      });
      items.forEach((el) => {
        el.hidden = false;
        el.classList.remove("is-search-hit");
      });
      if (searchStatus) {
        searchStatus.hidden = true;
        searchStatus.innerHTML = "";
      }
      if (searchClear) searchClear.hidden = true;
      document.body.classList.remove("menu-searching");
      return;
    }

    document.body.classList.add("menu-searching");
    if (searchClear) searchClear.hidden = false;

    const expanded = expandQuery(q);
    const scored = index
      .map((entry) => ({ entry, score: scoreEntry(entry, expanded) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    const hitIds = new Set(scored.map((x) => x.entry.id));
    const hitCats = new Set(scored.map((x) => x.entry.catId));

    items.forEach((el) => {
      const id = el.getAttribute("data-search-id");
      const on = hitIds.has(id);
      el.hidden = !on;
      el.classList.toggle("is-search-hit", on);
    });

    sections.forEach((s) => {
      const on = hitCats.has(s.dataset.catId);
      s.hidden = !on;
      s.classList.toggle("is-search-hit", on);
    });

    if (!searchStatus) return;

    if (scored.length) {
      const top = scored.slice(0, 4).map((x) => x.entry.label);
      const synNote =
        expanded.phrases.some((p) => p !== normalize(q) && p.length > 2) &&
        /shrimp|fries|noodle|chili|wanton|szechuan|sichuan|schez|bbq|calamari/i.test(q)
          ? ` <span class="search-syn">Matched related menu terms.</span>`
          : "";
      const topLine = top.length
        ? ` Top: ${top.map((t) => `<button type="button" class="search-suggest" data-suggest="${escapeAttr(t)}">${escapeHtml(t)}</button>`).join(" ")}`
        : "";
      searchStatus.hidden = false;
      searchStatus.innerHTML = `<strong>${scored.length}</strong> match${scored.length === 1 ? "" : "es"} for “${escapeHtml(q)}”.${synNote}${topLine}`;
      searchStatus.querySelectorAll("[data-suggest]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const v = btn.getAttribute("data-suggest");
          // Prefer filtering to that dish name
          searchInput.value = v;
          applySearch(v);
          searchInput.focus();
          const id = scored.find((x) => x.entry.label === v)?.entry.id;
          const el = id && root.querySelector(`[data-search-id="${id}"]`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });
      return;
    }

    // No matches — did you mean?
    const suggestions = closestSuggestions(q, 5);
    searchStatus.hidden = false;
    if (suggestions.length) {
      const chips = suggestions
        .map(
          (s) =>
            `<button type="button" class="search-suggest" data-suggest="${escapeAttr(s)}">${escapeHtml(s)}</button>`
        )
        .join("");
      searchStatus.innerHTML = `No exact matches for “${escapeHtml(q)}”. Did you mean: <span class="search-suggests">${chips}</span>`;
      searchStatus.querySelectorAll("[data-suggest]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const v = btn.getAttribute("data-suggest");
          searchInput.value = v;
          applySearch(v);
          searchInput.focus();
        });
      });
    } else {
      searchStatus.innerHTML = `No matches for “${escapeHtml(q)}”. Try a dish, number, or ingredient (e.g. shrimp, curry, chips).`;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  if (searchInput) {
    let timer = null;
    searchInput.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => applySearch(searchInput.value), 120);
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        applySearch("");
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      applySearch("");
      searchInput.focus();
    });
  }
})();
