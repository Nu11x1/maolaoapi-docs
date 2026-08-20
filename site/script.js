const menuToggle = document.querySelector(".menu-toggle");
const sidebarBackdrop = document.querySelector(".sidebar-backdrop");
const sidebar = document.querySelector(".sidebar");
const navLinks = [...document.querySelectorAll(".sidebar nav a")];

function closeMenu() {
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
}

menuToggle?.addEventListener("click", () => {
  const willOpen = !document.body.classList.contains("menu-open");
  document.body.classList.toggle("menu-open", willOpen);
  menuToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
});

sidebarBackdrop?.addEventListener("click", closeMenu);
navLinks.forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

function setActiveNav(activeId) {
  let activeLink = null;

  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === activeId;
    link.classList.toggle("active", active);
    if (active) activeLink = link;
  });

  if (!activeLink || !sidebar) return;

  const linkRect = activeLink.getBoundingClientRect();
  const sidebarRect = sidebar.getBoundingClientRect();
  const hiddenAbove = linkRect.top < sidebarRect.top + 12;
  const hiddenBelow = linkRect.bottom > sidebarRect.bottom - 12;

  if (hiddenAbove || hiddenBelow) {
    activeLink.scrollIntoView({ block: "nearest" });
  }
}

document.querySelectorAll("pre").forEach((pre) => {
  const wrapper = document.createElement("div");
  wrapper.className = "code-block";
  pre.parentNode.insertBefore(wrapper, pre);
  wrapper.appendChild(pre);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy-button";
  button.textContent = "复制";
  button.setAttribute("aria-label", "复制代码");
  wrapper.appendChild(button);

  button.addEventListener("click", async () => {
    const code = pre.querySelector("code")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "已复制";
      button.classList.add("copied");
      window.setTimeout(() => {
        button.textContent = "复制";
        button.classList.remove("copied");
      }, 1400);
    } catch {
      button.textContent = "复制失败";
    }
  });
});

document.querySelectorAll(".model-tabs").forEach((tabs) => {
  const buttons = [...tabs.querySelectorAll(".model-tab-button")];
  const panels = [...tabs.querySelectorAll(".tab-panel")];

  function activate(targetId) {
    buttons.forEach((button) => {
      const active = button.dataset.target === targetId;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });

    panels.forEach((panel) => {
      const active = panel.id === targetId;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => activate(button.dataset.target));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const next = buttons[(index + offset + buttons.length) % buttons.length];
      next.focus();
      activate(next.dataset.target);
    });
  });
});

const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (visible.length === 0) return;
    const activeId = `#${visible[0].target.id}`;

    setActiveNav(activeId);
  },
  { rootMargin: "-20% 0px -68% 0px", threshold: 0 },
);

sections.forEach((section) => observer.observe(section));

window.addEventListener("hashchange", () => {
  if (window.location.hash) setActiveNav(window.location.hash);
});

if (window.location.hash) {
  setActiveNav(window.location.hash);
}
