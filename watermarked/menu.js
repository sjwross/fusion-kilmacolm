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
    shrimp: ["king prawn", "prawn"],
    shrimps: ["king prawn", "prawn"],
    prawns: ["king prawn", "prawn"],
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
    // 4–5 letters: 1 edit; 6+: up to 2 (covers prwan↔prawn, chiken↔chicken)
    if (len < 4) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    return 2;
  }

  // Pairs that are 1 edit apart but mean different foods — never fuzzy-link them
  const FUZZY_BLOCK = new Set(["fries", "fried", "fry", "fires", "fired"]);

  function fuzzyOk(a, b) {
    if (FUZZY_BLOCK.has(a) || FUZZY_BLOCK.has(b)) return false;
    if (a[0] !== b[0]) return false;
    return true;
  }

  function levenshtein(a, b) {
    // Damerau–Levenshtein (adjacent transpositions count as 1) — helps prwan→prawn
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
        }
      }
    }
    return dp[m][n];
  }

  function applySynonymKey(key, phrases, toks) {
    const kn = normalize(key);
    phrases.add(kn);
    tokens(kn).forEach((t) => toks.add(t));
    (SYNONYMS[key] || []).forEach((syn) => {
      phrases.add(normalize(syn));
      tokens(syn).forEach((t) => toks.add(t));
    });
  }

  function expandQuery(query) {
    const n = normalize(query);
    if (!n) return { phrases: [], tokens: [], hint: null };

    const phrases = new Set([n]);
    const toks = new Set(tokens(n));
    const padded = ` ${n} `;
    const keys = Object.keys(SYNONYMS).sort((a, b) => b.length - a.length);
    let hint = null;

    // 1) Exact whole-word synonym keys
    for (const key of keys) {
      const kn = normalize(key);
      if (!kn) continue;
      if (padded.includes(` ${kn} `)) {
        applySynonymKey(key, phrases, toks);
        if (!hint && SYNONYMS[key][0]) hint = SYNONYMS[key][0];
      }
    }

    // 2) Progressive prefixes while typing (shr… → shrimp → king prawn)
    //    and fuzzy near-misses on synonym keys (wantonn → wanton).
    tokens(n).forEach((t) => {
      if (SYNONYMS[t]) {
        applySynonymKey(t, phrases, toks);
        if (!hint && SYNONYMS[t][0]) hint = SYNONYMS[t][0];
        return;
      }

      let bestKey = null;
      let bestScore = -Infinity;

      for (const key of keys) {
        const kn = normalize(key);
        if (!kn || kn.length < 3) continue;

        // Typed token is a prefix of a synonym key (min 3 chars: shr→shrimp)
        if (t.length >= 3 && kn.startsWith(t) && kn.length > t.length) {
          // Prefer longer / closer keys (shrimp over shrimps when tied)
          const score = 100 + t.length * 4 - (kn.length - t.length);
          if (score > bestScore) {
            bestScore = score;
            bestKey = key;
          }
          continue;
        }

        // Synonym key is a prefix of a longer typed token (shrimpp)
        if (t.length >= kn.length && t.startsWith(kn) && t.length - kn.length <= 2) {
          const score = 90;
          if (score > bestScore) {
            bestScore = score;
            bestKey = key;
          }
          continue;
        }

        // Typo near a synonym key
        if (t.length >= 4 && kn.length >= 4) {
          const allowed = t.length < 6 ? 1 : 2;
          if (Math.abs(t.length - kn.length) <= allowed) {
            const d = levenshtein(t, kn);
            if (d > 0 && d <= allowed) {
              const score = 70 - d * 15;
              if (score > bestScore) {
                bestScore = score;
                bestKey = key;
              }
            }
          }
        }
      }

      if (bestKey) {
        applySynonymKey(bestKey, phrases, toks);
        if (!hint && SYNONYMS[bestKey][0]) hint = SYNONYMS[bestKey][0];
      }
    });

    return { phrases: [...phrases], tokens: [...toks], hint };
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
      if (!phrase || phrase.length < 3) continue;
      if (hay === phrase) {
        score += 120;
        matched = true;
      } else if (` ${hay} `.includes(` ${phrase} `)) {
        // Whole-token phrase only (avoids “shr” matching inside “mushroom”)
        score += 70 + Math.min(phrase.length, 30);
        matched = true;
      } else if (phrase.length >= 4 && entry.tokens.some((et) => et.startsWith(phrase))) {
        score += 50 + phrase.length;
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
      // Prefix (e.g. chic → chicken, pra → prawn) — need 3+ chars
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
      // Fuzzy token match (typos) — slight spelling errors
      const allowed = fuzzyAllowed(Math.max(qt.length, 5));
      if (!allowed || qt.length < 4) continue;
      for (const et of entry.tokens) {
        if (STOPWORDS.has(et)) continue;
        if (!fuzzyOk(qt, et)) continue;
        if (Math.abs(et.length - qt.length) > allowed) continue;
        const d = levenshtein(qt, et);
        const maxLen = Math.max(qt.length, et.length);
        if (d > 0 && d <= allowed && d / maxLen <= 0.45) {
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
    if (!n.length) return [];
    const qTokens = tokens(n);
    const prefix = qTokens[0] || n;
    const candidates = new Map(); // label -> score

    function add(label, score) {
      if (!label) return;
      candidates.set(label, Math.max(candidates.get(label) || 0, score));
    }

    // Category titles (Soups, Satay, Seafood…)
    menu.forEach((cat) => {
      const title = cat.title.replace(/ Dishes$/, "").replace(/ Style$/, "");
      const tn = normalize(title);
      if (tn.startsWith(prefix)) add(title, 60 + prefix.length * 3);
    });

    // Synonym keys → UK menu terms (sh… → king prawn; s alone stays menu-native)
    Object.keys(SYNONYMS).forEach((key) => {
      const kn = normalize(key);
      const menuTerm = SYNONYMS[key][0];
      if (!menuTerm) return;
      qTokens.forEach((qt) => {
        if (!qt) return;
        if (kn.startsWith(qt)) {
          // Single letter: only suggest if the UK term also starts with that letter
          if (qt.length === 1) {
            if (normalize(menuTerm).startsWith(qt)) add(menuTerm, 35);
            return;
          }
          // Two+ letters into a foreign/alt word → suggest the menu wording
          add(menuTerm, 45 + qt.length * 4);
        }
        if (qt.length >= 4) {
          const allowed = fuzzyAllowed(Math.max(qt.length, kn.length));
          if (allowed && Math.abs(qt.length - kn.length) <= allowed) {
            const d = levenshtein(qt, kn);
            if (d > 0 && d <= allowed) add(menuTerm, 30 - d * 6);
          }
        }
      });
      // Also surface UK terms that themselves start with the typed prefix
      if (normalize(menuTerm).startsWith(prefix)) add(menuTerm, 50 + prefix.length);
    });

    // Dish names and tokens from the menu index
    index.forEach((entry) => {
      const nameN = normalize(entry.name || entry.label);
      if (nameN.startsWith(prefix)) add(entry.label, 55 + prefix.length * 2);

      // Any word in the dish name starting with the prefix (e.g. “sh” → Bamboo Shoots…)
      nameN.split(" ").forEach((word) => {
        if (word.length < 2 || STOPWORDS.has(word)) return;
        if (word.startsWith(prefix)) add(entry.label, 48 + prefix.length * 2);
      });

      if (n.length >= 4) {
        const d = levenshtein(n, nameN);
        const maxLen = Math.max(n.length, nameN.length);
        if (d <= 3 && d / maxLen <= 0.45) add(entry.label, 50 - d * 10);
      }

      qTokens.forEach((qt) => {
        if (!qt || STOPWORDS.has(qt)) return;
        entry.tokens.forEach((et) => {
          if (et.length < 2 || STOPWORDS.has(et)) return;
          if (et.startsWith(qt)) {
            // Prefer the full dish label over a bare fragment like “shoots”
            add(entry.label, 42 + qt.length * 3);
            if (et.length >= 4) add(et, 28 + qt.length);
          }
          if (qt.length >= 4) {
            const allowed = fuzzyAllowed(Math.max(qt.length, et.length));
            if (!allowed || !fuzzyOk(qt, et)) return;
            if (Math.abs(et.length - qt.length) > allowed) return;
            const td = levenshtein(qt, et);
            if (td > 0 && td <= allowed) add(et, 20 - td * 5);
          }
        });
      });
    });

    // Prefer short, useful chips: categories / ingredients over long duplicate dish variants
    return [...candidates.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].length - b[0].length || a[0].localeCompare(b[0]))
      .slice(0, limit)
      .map(([label]) => label);
  }

  function bindSuggestClicks(scored) {
    if (!searchStatus) return;
    searchStatus.querySelectorAll("[data-suggest]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = btn.getAttribute("data-suggest");
        searchInput.value = v;
        applySearch(v);
        searchInput.focus();
        if (scored) {
          const id = scored.find((x) => x.entry.label === v)?.entry.id;
          const el = id && root.querySelector(`[data-search-id="${id}"]`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });
  }

  function showSuggestionChips(q, suggestions, mode) {
    const chips = suggestions
      .map(
        (s) =>
          `<button type="button" class="search-suggest" data-suggest="${escapeAttr(s)}">${escapeHtml(s)}</button>`
      )
      .join("");
    searchStatus.hidden = false;
    if (mode === "early") {
      searchStatus.innerHTML = `Suggestions for “${escapeHtml(q)}”: <span class="search-suggests">${chips}</span>`;
    } else {
      searchStatus.innerHTML = `No exact matches for “${escapeHtml(q)}”. Did you mean: <span class="search-suggests">${chips}</span>`;
    }
    bindSuggestClicks(null);
  }

  function applySearch(raw) {
    const q = raw.trim();
    const sections = root.querySelectorAll(".menu-category");
    const items = root.querySelectorAll("[data-search-id]");

    function showAll() {
      sections.forEach((s) => {
        s.hidden = false;
        s.classList.remove("is-search-hit");
      });
      items.forEach((el) => {
        el.hidden = false;
        el.classList.remove("is-search-hit");
      });
      document.body.classList.remove("menu-searching");
    }

    if (!q) {
      showAll();
      if (searchStatus) {
        searchStatus.hidden = true;
        searchStatus.innerHTML = "";
      }
      if (searchClear) searchClear.hidden = true;
      return;
    }

    if (searchClear) searchClear.hidden = false;

    const expanded = expandQuery(q);
    const scored = index
      .map((entry) => ({ entry, score: scoreEntry(entry, expanded) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    // Short queries (1–2 letters): keep the full menu, only show suggestion chips
    if (normalize(q).length <= 2 && !scored.length) {
      showAll();
      const suggestions = closestSuggestions(q, 8);
      if (searchStatus) {
        if (suggestions.length) showSuggestionChips(q, suggestions, "early");
        else {
          searchStatus.hidden = false;
          searchStatus.innerHTML = `Keep typing to search — try “king prawn”, “curry”, or a letter like “c”.`;
        }
      }
      return;
    }

    document.body.classList.add("menu-searching");

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
      const mapped = expanded.hint ? normalize(expanded.hint) : "";
      const typed = normalize(q);
      const synNote =
        mapped && !typed.includes(mapped.split(" ").pop())
          ? ` <span class="search-syn">Showing ${escapeHtml(expanded.hint)} dishes.</span>`
          : "";
      const topLine = top.length
        ? ` Top: ${top.map((t) => `<button type="button" class="search-suggest" data-suggest="${escapeAttr(t)}">${escapeHtml(t)}</button>`).join(" ")}`
        : "";
      searchStatus.hidden = false;
      searchStatus.innerHTML = `<strong>${scored.length}</strong> match${scored.length === 1 ? "" : "es"} for “${escapeHtml(q)}”.${synNote}${topLine}`;
      bindSuggestClicks(scored);
      return;
    }

    // No matches — did you mean? (typos / near misses)
    const suggestions = closestSuggestions(q, 6);
    if (suggestions.length) {
      showSuggestionChips(q, suggestions, "didyoumean");
    } else {
      searchStatus.hidden = false;
      searchStatus.innerHTML = `No matches for “${escapeHtml(q)}”. Try a dish, number, or ingredient (e.g. king prawn, curry, chips).`;
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
      // Snappy while typing so prefixes like “shr” map to prawn immediately
      timer = setTimeout(() => applySearch(searchInput.value), 40);
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
