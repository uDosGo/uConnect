const libraryCardTemplate = document.getElementById("library-card-template");
const repoCardTemplate = document.getElementById("repo-card-template");
const repoGroupTemplate = document.getElementById("repo-group-template");
const filterInput = document.getElementById("repo-filter");

let filterables = [];

async function loadData() {
  const response = await fetch("./data/family.json");
  if (!response.ok) {
    throw new Error(`Failed to load site data: ${response.status}`);
  }
  return response.json();
}

function buildLink(target, item) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = item.url;
  a.target = "_blank";
  a.rel = "noreferrer";
  a.textContent = item.label;
  li.append(a);
  target.append(li);
}

function fillSimpleList(targetId, items) {
  const target = document.getElementById(targetId);
  for (const item of items) {
    buildLink(target, item);
  }
}

function setText(id, value) {
  const target = document.getElementById(id);
  if (target && value) {
    target.textContent = value;
  }
}

function renderHeroActions(actions) {
  const target = document.getElementById("hero-actions");
  target.replaceChildren();
  for (const action of actions) {
    const link = document.createElement("a");
    link.href = action.url;
    link.textContent = action.label;
    link.className = action.primary ? "button button--primary" : "button";
    if (/^https?:\/\//.test(action.url)) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    target.append(link);
  }
}

function renderLibraryNav(items) {
  const target = document.getElementById("library-nav");
  if (!target) {
    return;
  }
  target.replaceChildren();
  for (const item of items) {
    const link = document.createElement("a");
    link.href = item.url;
    link.textContent = item.label;
    link.className = "library-nav__link";
    target.append(link);
  }
}

function renderFooter(footer) {
  setText("footer-lede", footer.lede);
  const target = document.getElementById("footer-links");
  if (!target) {
    return;
  }
  target.replaceChildren();
  for (const item of footer.links || []) {
    const link = document.createElement("a");
    link.href = item.url;
    link.textContent = item.label;
    link.className = "library-footer__link";
    if (/^https?:\/\//.test(item.url)) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    target.append(link);
  }
}

function renderSiteShell(shell) {
  document.title = shell.title;
  setText("site-title", shell.title);
  setText("hero-eyebrow", shell.hero.eyebrow);
  setText("hero-title", shell.hero.title);
  setText("hero-lede", shell.hero.lede);
  renderHeroActions(shell.hero.actions || []);

  setText("library-eyebrow", shell.sections.library.eyebrow);
  setText("library-title", shell.sections.library.title);
  setText("tracks-eyebrow", shell.sections.tracks.eyebrow);
  setText("tracks-title", shell.sections.tracks.title);
  setText("learning-eyebrow", shell.sections.learning.eyebrow);
  setText("learning-title", shell.sections.learning.title);
  setText("wiki-card-title", shell.sections.learning.wiki_card_title);
  setText("wiki-card-body", shell.sections.learning.wiki_card_body);
  setText("courses-card-title", shell.sections.learning.courses_card_title);
  setText("courses-card-body", shell.sections.learning.courses_card_body);
  setText("reference-eyebrow", shell.sections.reference.eyebrow);
  setText("reference-title", shell.sections.reference.title);
  setText("repos-eyebrow", shell.sections.repos.eyebrow);
  setText("repos-title", shell.sections.repos.title);
  setText("repo-filter-label", shell.sections.repos.filter_label);
  filterInput.placeholder = shell.sections.repos.filter_placeholder;
  setText("github-eyebrow", shell.sections.github.eyebrow);
  setText("github-title", shell.sections.github.title);
}

function renderCardGrid(targetId, cards) {
  const target = document.getElementById(targetId);
  for (const card of cards) {
    const fragment = libraryCardTemplate.content.cloneNode(true);
    const article = fragment.querySelector(".card");
    const haystack = [card.tag, card.title, card.description].join(" ").toLowerCase();
    article.dataset.filter = haystack;
    fragment.querySelector(".card__tag").textContent = card.tag;
    fragment.querySelector("h3").textContent = card.title;
    fragment.querySelector(".card__body").textContent = card.description;
    const link = fragment.querySelector(".card__link");
    link.href = card.url;
    link.textContent = card.link_label || "Open";
    target.append(fragment);
  }
}

function renderRepoGroups(groups) {
  const target = document.getElementById("repo-groups");

  for (const group of groups) {
    const fragment = repoGroupTemplate.content.cloneNode(true);
    const section = fragment.querySelector(".repo-group");
    const headerTitle = fragment.querySelector(".repo-group__title");
    const headerBody = fragment.querySelector(".repo-group__body");
    const grid = fragment.querySelector(".repo-grid");

    headerTitle.textContent = group.title;
    headerBody.textContent = group.description;

    for (const repo of group.repos) {
      const repoFragment = repoCardTemplate.content.cloneNode(true);
      const article = repoFragment.querySelector(".repo-card");
      const haystack = [
        repo.name,
        repo.role,
        repo.summary,
        group.title,
        ...(repo.keywords || []),
        ...repo.links.map((link) => link.label),
      ].join(" ").toLowerCase();
      article.dataset.filter = haystack;
      repoFragment.querySelector(".repo-card__name").textContent = repo.name;
      repoFragment.querySelector(".repo-card__role").textContent = repo.role;
      repoFragment.querySelector(".repo-card__summary").textContent = repo.summary;
      const list = repoFragment.querySelector(".repo-card__links");
      for (const link of repo.links) {
        buildLink(list, link);
      }
      grid.append(repoFragment);
    }

    target.append(fragment);
    filterables.push({ section, cards: Array.from(grid.children) });
  }
}

function wireFilter() {
  filterInput.addEventListener("input", () => {
    const query = filterInput.value.trim().toLowerCase();
    for (const group of filterables) {
      let visible = 0;
      for (const card of group.cards) {
        const hit = query === "" || card.dataset.filter.includes(query);
        card.hidden = !hit;
        if (hit) {
          visible += 1;
        }
      }
      group.section.hidden = visible === 0;
    }
  });
}

loadData()
  .then((data) => {
    renderSiteShell(data.site_shell);
    renderLibraryNav(data.library_nav || []);
    renderFooter(data.site_shell.footer || {});
    renderCardGrid("library-cards", data.library_cards);
    renderCardGrid("track-cards", data.track_cards);
    renderCardGrid("reference-cards", data.featured_references);
    renderCardGrid("github-cards", data.github_cards);
    fillSimpleList("wiki-links", data.wiki_units);
    fillSimpleList("course-links", data.courses_and_resources);
    renderRepoGroups(data.repo_groups);
    wireFilter();
  })
  .catch((error) => {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<p style="padding:20px;color:#8f3b16;">${error.message}</p>`,
    );
  });
