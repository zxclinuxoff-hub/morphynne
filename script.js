(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isSmall = innerWidth < 700;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- translations ---------- */
  const T = {
    ru: {
      online: "ONLINE", tagline: "цифровая личность / создатель проектов",
      bio: "Собираю идеи в проекты. Код, цифровые инструменты и немного хаоса.",
      currentStatus: "СЕЙЧАС", message: "Написать", copyNick: "Скопировать ник",
      copied: "Ник скопирован", copyFail: "Скопируй вручную: @morphynne",
      musicLabel: "NOW PLAYING", trackLabel: "ТРЕК", openSC: "Открыть в SoundCloud",
      navProfile: "Profile", navMusic: "Music", navProjects: "Projects", navUpdates: "Updates", navLinks: "Links",
      projectsLabel: "PROJECTS", active: "ACTIVE", ghostDesc: "Telegram-инструменты и автоматизация.",
      updatesLabel: "LATEST UPDATES", update1: "Morphynne bio — первая версия",
      update1p: "Новый личный сайт и интерактивный плеер.", update2p: "Работа над Telegram-инструментами продолжается.",
      linksLabel: "FIND ME", footer: "СДЕЛАНО ПО-СВОЕМУ", skip: "нажми, чтобы пропустить",
      statuses: ["coding something", "шлю Ghostsee в прод", "ловлю баги"]
    },
    en: {
      online: "ONLINE", tagline: "digital identity / project builder",
      bio: "Turning ideas into projects. Code, digital tools, and a little chaos.",
      currentStatus: "CURRENTLY", message: "Message me", copyNick: "Copy handle",
      copied: "Handle copied", copyFail: "Copy manually: @morphynne",
      musicLabel: "NOW PLAYING", trackLabel: "TRACK", openSC: "Open on SoundCloud",
      navProfile: "Profile", navMusic: "Music", navProjects: "Projects", navUpdates: "Updates", navLinks: "Links",
      projectsLabel: "PROJECTS", active: "ACTIVE", ghostDesc: "Telegram tools and automation.",
      updatesLabel: "LATEST UPDATES", update1: "Morphynne bio — first version",
      update1p: "A new personal site and interactive player.", update2p: "Work on Telegram tools continues.",
      linksLabel: "FIND ME", footer: "BUILT MY OWN WAY", skip: "click to skip",
      statuses: ["coding something", "shipping Ghostsee", "hunting bugs"]
    }
  };
  let lang = "ru";
  let statusIndex = 0;
  const statusEl = document.getElementById("statusText");

  function applyLang() {
    root.lang = lang;
    document.getElementById("lang").textContent = lang.toUpperCase();
    document.querySelectorAll("[data-t]").forEach(el => {
      const v = T[lang][el.dataset.t];
      if (typeof v === "string") el.textContent = v;
    });
    statusEl.textContent = T[lang].statuses[statusIndex];
  }

  document.getElementById("lang").addEventListener("click", () => {
    lang = lang === "ru" ? "en" : "ru";
    applyLang();
  });

  /* ---------- toast ---------- */
  const toast = document.getElementById("toast");
  let toastTimer;
  function notify(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  /* ---------- copy handle ---------- */
  const copyBtn = document.getElementById("copyNick");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("@morphynne");
      notify(T[lang].copied);
      copyBtn.classList.add("copied");
      setTimeout(() => copyBtn.classList.remove("copied"), 1600);
    } catch (e) {
      notify(T[lang].copyFail);
    }
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- split the handle into letters for the entrance animation ---------- */
  const handle = document.getElementById("handle");
  if (handle) {
    const word = "MORPHYNNE";
    handle.innerHTML =
      [...word].map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join("") +
      '<span class="red blink">_</span>';
    handle.addEventListener("pointerenter", () => {
      handle.classList.remove("glitch");
      void handle.offsetWidth;
      handle.classList.add("glitch");
    });
  }

  /* ---------- boot intro: code being written, with syntax colours ---------- */
  const bootEl = document.getElementById("boot");
  const bootCode = document.getElementById("bootCode");
  const bootBar = document.getElementById("bootBar");

  const lines = [
    "// morphynne.bio — initializing",
    "",
    "const me = {",
    '  handle: "@morphynne",',
    '  role: "developer",',
    '  builds: ["ghostsee"],',
    '  status: "coding something",',
    "};",
    "",
    "await render(me);",
    "> access granted_"
  ];
  const total = lines.reduce((n, l) => n + l.length + 1, 0);
  let typed = 0;
  let finished = false;

  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function highlight(text) {
    const re = /(\/\/[^\n]*)|("[^"\n]*"?)|\b(const|await)\b|(>)/g;
    let out = "", last = 0, m;
    while ((m = re.exec(text))) {
      out += esc(text.slice(last, m.index));
      const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "k" : "p";
      out += `<span class="${cls}">${esc(m[0])}</span>`;
      last = re.lastIndex;
    }
    return out + esc(text.slice(last));
  }

  function finish() {
    if (finished) return;
    finished = true;
    bootEl.classList.add("out");
    root.classList.remove("booting");
    root.classList.add("ready");
    setTimeout(() => bootEl.remove(), 900);
    initReveal();
  }

  async function runBoot() {
    let out = "";
    for (const line of lines) {
      for (const ch of line) {
        if (finished) return;
        out += ch;
        typed++;
        bootCode.innerHTML = highlight(out);
        bootBar.style.width = (typed / total * 100).toFixed(1) + "%";
        // quicker on spaces, slightly slower on punctuation, with a little human jitter
        const delay = ch === " " ? 6 : /[{}();,:]/.test(ch) ? 38 : 13 + Math.random() * 20;
        await sleep(delay);
      }
      out += "\n";
      typed++;
      await sleep(line === "" ? 70 : 160);
    }
    bootBar.style.width = "100%";
    await sleep(500);
    finish();
  }

  bootEl.addEventListener("click", finish);
  document.addEventListener("keydown", finish, { once: true });

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    const items = document.querySelectorAll(".reveal, .stagger");
    // alternate direction for cards so the page feels less uniform
    document.querySelectorAll(".content-section.reveal").forEach((s, i) => {
      if (i % 2) s.classList.add("r");
    });
    document.querySelectorAll(".stagger").forEach(group => {
      [...group.children].forEach((c, i) => c.style.setProperty("--i", i));
    });
    if (!("IntersectionObserver" in window)) {
      items.forEach(el => el.classList.add("seen"));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("seen");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(el => io.observe(el));
  }

  /* ---------- section nav highlight ---------- */
  const navLinks = [...document.querySelectorAll(".section-nav a")];
  const navIO = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    }
  }), { rootMargin: "-20% 0px -65% 0px" });
  ["profile", "music", "projects", "updates", "links"].forEach(id => {
    const el = document.getElementById(id);
    if (el) navIO.observe(el);
  });

  /* ---------- status line cycling ---------- */
  function cycleStatus() {
    statusEl.classList.add("swap");
    setTimeout(() => {
      statusIndex = (statusIndex + 1) % T[lang].statuses.length;
      statusEl.textContent = T[lang].statuses[statusIndex];
      statusEl.classList.remove("swap");
    }, 260);
  }
  if (!reduceMotion) setInterval(cycleStatus, 3600);

  /* ---------- pointer effects (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    // spotlight: remember cursor position inside each card
    document.querySelectorAll(".spot, .pill").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--sx", (e.clientX - r.left) + "px");
        el.style.setProperty("--sy", (e.clientY - r.top) + "px");
      });
    });

    // magnetic: buttons lean a little toward the cursor
    document.querySelectorAll(".magnetic").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.25;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });

    // avatar tilt
    const tilt = document.querySelector(".avatar-tilt");
    if (tilt) {
      const wrap = tilt.parentElement;
      wrap.addEventListener("pointermove", e => {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = `perspective(600px) rotateY(${(px * 16).toFixed(2)}deg) rotateX(${(-py * 16).toFixed(2)}deg)`;
      });
      wrap.addEventListener("pointerleave", () => { tilt.style.transform = ""; });
    }
  }

  /* ---------- ripple on press (all devices) ---------- */
  document.querySelectorAll(".ripple-host").forEach(el => {
    el.addEventListener("pointerdown", e => {
      if (reduceMotion) return;
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 0.9;
      const dot = document.createElement("span");
      dot.className = "ripple";
      dot.style.width = dot.style.height = size + "px";
      dot.style.left = (e.clientX - r.left - size / 2) + "px";
      dot.style.top = (e.clientY - r.top - size / 2) + "px";
      el.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove());
    });
  });

  /* ---------- particle field (canvas) ---------- */
  const canvas = document.getElementById("fx");
  if (canvas && !reduceMotion && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const pointer = { x: -9999, y: -9999 };
    let particles = [], W = 0, H = 0, dpr = 1, rafId = null;

    function resize() {
      W = innerWidth;
      H = innerHeight;
      dpr = Math.min(devicePixelRatio || 1, isSmall ? 1.5 : 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(isSmall ? 26 : 70, Math.floor((W * H) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.3 + 0.5,
        a: Math.random() * 0.45 + 0.2
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
        if (finePointer) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < 130 && d > 0) {
            p.x += (dx / d) * 0.7;
            p.y += (dy / d) * 0.7;
          }
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(239,41,71,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      const maxD = isSmall ? 95 : 125;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < maxD) {
            ctx.strokeStyle = `rgba(239,41,71,${(1 - d / maxD) * 0.13})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(frame);
    }

    function start() { if (!rafId) rafId = requestAnimationFrame(frame); }
    function stop() { cancelAnimationFrame(rafId); rafId = null; }

    resize();
    let resizeTimer;
    addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    if (finePointer) addEventListener("pointermove", e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    start();
  }

  /* ---------- start ---------- */
  applyLang();
  if (reduceMotion) {
    finish();
  } else {
    runBoot();
    setTimeout(finish, 9000); // safety net: never leave the page hidden
  }
})();
