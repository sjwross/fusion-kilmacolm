(function () {
  const root = document.getElementById("menuRoot");
  const nav = document.getElementById("menuNav");
  if (!root || !window.FUSION_MENU) return;

  const menu = window.FUSION_MENU;

  function tags(item, cat) {
    const bits = [];
    if (item.spicy || cat.spicy) bits.push('<span class="tag tag-spicy" title="Spicy">!</span>');
    if (item.neu) bits.push('<span class="tag tag-new" title="New">New</span>');
    if (item.nuts || cat.nuts) bits.push('<span class="tag tag-nuts" title="Contains nuts">N</span>');
    return bits.length ? `<span class="meta">${bits.join("")}</span>` : "";
  }

  function renderCategory(cat) {
    const section = document.createElement("section");
    section.className = "menu-category";
    section.id = `cat-${cat.id}`;

    let html = `<h3>${cat.title}</h3>`;
    if (cat.blurb) html += `<p class="blurb">${cat.blurb}</p>`;

    if (cat.boxes) {
      html += `<div class="box-grid">${cat.boxes
        .map(
          (box) => `
        <article class="box-card">
          <div class="code">Box ${box.code}</div>
          <div class="price">£${box.price}</div>
          <ul>${box.lines.map((line) => `<li>${line}</li>`).join("")}</ul>
        </article>`
        )
        .join("")}</div>`;
    } else {
      html += `<ul class="menu-list">${cat.items
        .map(
          (item) => `
        <li class="menu-item">
          <span class="num">${item.n}</span>
          <div class="name-wrap">
            <span class="name">${item.name}</span>${tags(item, cat)}
            ${item.note ? `<span class="note">${item.note}</span>` : ""}
          </div>
          <span class="price">${item.price}</span>
        </li>`
        )
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
      document.querySelectorAll(".menu-nav button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const target = document.getElementById(`cat-${cat.id}`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nav.appendChild(btn);
  });
})();
