(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const small = innerWidth < 700;

  $("#year").textContent = new Date().getFullYear();

  /* ================= toast & copy ================= */
  const toast = $("#toast");
  let tt;
  const say = msg => {
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 1800);
  };
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
  }
  function flash(btn) {
    btn.classList.add("copied");
    setTimeout(() => btn.classList.remove("copied"), 1100);
  }
  $("#copyNick").addEventListener("click", async e => {
    await copyText("@morphynne"); flash(e.currentTarget); say("Ник скопирован: @morphynne");
  });
  $$("[data-copy]").forEach(b => b.addEventListener("click", async () => {
    await copyText(b.dataset.copy); flash(b); say("Скопировано: " + b.dataset.copy);
  }));

  /* ================= share ================= */
  $("#shareBtn").addEventListener("click", async e => {
    const data = { title: "Morphynne", text: "Morphynne — developer", url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch {} return; }
    await copyText(location.href); flash(e.currentTarget); say("Ссылка скопирована");
  });

  /* ================= theme swatches ================= */
  const swatches = $$(".sw");
  function setTheme(name) {
    if (name === "red") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", name);
    swatches.forEach(s => s.classList.toggle("on", s.dataset.theme === name));
    refreshRGB();
    say("акцент: " + name);
  }
  swatches.forEach(s => s.addEventListener("click", () => setTheme(s.dataset.theme)));

  /* ================= progress line ================= */
  const prog = $("#progress");
  addEventListener("scroll", () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  }, { passive: true });

  /* ================= boot ================= */
  const boot = $("#boot"), bootCode = $("#bootCode"), bootBar = $("#bootBar");
  const lines = [
    [["k", "const "], ["", "morphynne = {"]],
    [["", "  "], ["s", "\"role\""], ["", ": "], ["s", "\"developer\""], ["", ","]],
    [["", "  "], ["s", "\"web\""], ["", ": "], ["k", "true"], ["", ","]],
    [["", "  "], ["s", "\"telegram\""], ["", ": "], ["s", "\"@morphynne\""], ["", ","]],
    [["", "  "], ["s", "\"mood\""], ["", ": "], ["s", "\"chaos\""]],
    [["", "};"]],
    [["c", "// welcome in"]],
  ];
  const total = lines.reduce((a, l) => a + l.reduce((b, [, t]) => b + t.length, 0), 0) + lines.length;
  let li = 0, ci = 0, done = false, bootTimer, written = 0;
  function endBoot() {
    if (done) return; done = true;
    clearTimeout(bootTimer);
    boot.classList.add("done");
    root.classList.remove("booting");
    setTimeout(() => boot.remove(), 750);
    afterBoot();
  }
  function typeBoot() {
    if (done) return;
    if (li >= lines.length) { bootTimer = setTimeout(endBoot, 420); return; }
    const flat = lines[li].flatMap(([c, t]) => [...t].map(ch => [c, ch]));
    if (ci === 0 && li > 0) bootCode.append("\n");
    if (ci < flat.length) {
      const [c, ch] = flat[ci];
      const s = document.createElement("span");
      if (c) s.className = c;
      s.textContent = ch; bootCode.append(s); ci++; written++;
      bootBar.style.width = (written / total * 100) + "%";
      bootTimer = setTimeout(typeBoot, 24 + Math.random() * 26);
    } else { li++; ci = 0; written++; bootTimer = setTimeout(typeBoot, 110); }
  }
  boot.addEventListener("click", endBoot);
  if (reduce || location.hash) endBoot(); else { typeBoot(); setTimeout(endBoot, 4800); }

  /* ================= after boot: entrance, typewriter, counters ================= */
  // split handle into letters for entrance
  const handle = $("#handle");
  const hText = handle.textContent;
  handle.innerHTML = [...hText].map((c, i) => `<span class="ch" style="--i:${i}">${c === "_" ? '<span class="red blink">_</span>' : c}</span>`).join("");

  let ran = false;
  function afterBoot() {
    if (ran) return; ran = true;
    root.classList.add("ready");
    $$(".fx").forEach((el, i) => setTimeout(() => el.classList.add("in"), reduce ? 0 : i * 70));
    $$(".stagger").forEach(el => el.classList.add("in"));
    const text = "Собираю идеи в проекты. Код, цифровые инструменты и немного хаоса.";
    const bio = $("#bioText");
    if (reduce) bio.textContent = text;
    else {
      let i = 0;
      const t = setInterval(() => { bio.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(t); }, 30);
    }
    $$(".stat b").forEach(b => {
      const target = +b.dataset.count;
      if (reduce) { b.textContent = target; return; }
      const t0 = performance.now();
      const step = now => {
        const p = Math.min(1, (now - t0) / 1200), e = 1 - Math.pow(1 - p, 3);
        b.textContent = Math.round(target * e);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    $$(".meter i, .progress i").forEach(i => setTimeout(() => i.style.width = i.dataset.level + "%", 400));
  }
  setTimeout(() => { if (!ran) endBoot(); }, 7000);

  /* ================= reveal on scroll ================= */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      if (e.target.querySelector(".meter i, .progress i")) {
        $$(".meter i, .progress i", e.target).forEach(i => i.style.width = i.dataset.level + "%");
      }
      io.unobserve(e.target);
    });
  }, { threshold: .15 });
  $$(".reveal, .content-section, .skills, .project-card, .stagger").forEach(el => io.observe(el));

  /* ================= status cycling ================= */
  const statuses = ["coding something", "ловлю баги", "в поиске идей", "собираю что-то новое"];
  const statusEl = $("#statusText"), statusNum = $("#statusNum");
  let si = 0;
  if (!reduce) setInterval(() => {
    statusEl.classList.add("swap");
    setTimeout(() => {
      si = (si + 1) % statuses.length;
      statusEl.textContent = statuses[si];
      statusNum.textContent = "↗ 0" + (si + 1);
      statusEl.classList.remove("swap");
    }, 260);
  }, 3400);

  /* ================= avatar: click burst + spin ================= */
  const avatarBtn = $("#avatarBtn"), burstCount = $("#burstCount");
  let clicks = 0, bt;
  avatarBtn.addEventListener("click", () => {
    clicks++;
    burstCount.textContent = clicks;
    burstCount.classList.add("show");
    clearTimeout(bt); bt = setTimeout(() => burstCount.classList.remove("show"), 1600);
    avatarBtn.classList.remove("pop"); void avatarBtn.offsetWidth; avatarBtn.classList.add("pop");
    if (!reduce) {
      const r = avatarBtn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (let i = 0; i < 18; i++) {
        const s = document.createElement("span");
        s.className = "sparkle"; document.body.appendChild(s);
        const a = (Math.PI * 2 / 18) * i, d = 70 + Math.random() * 60;
        s.animate([
          { transform: `translate(${cx}px,${cy}px) scale(1)`, opacity: 1 },
          { transform: `translate(${cx + Math.cos(a) * d}px,${cy + Math.sin(a) * d}px) scale(0)`, opacity: 0 },
        ], { duration: 700 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.2,1)" }).onfinish = () => s.remove();
      }
    }
    if (clicks === 7) { say("пасхалка найдена 👀"); konamiRain("✳ morphynne ✳"); }
  });

  /* ================= ghost expand ================= */
  const ghostToggle = $("#ghostToggle"), ghostBody = $("#ghostBody");
  ghostToggle.addEventListener("click", () => {
    const open = ghostBody.classList.toggle("open");
    ghostToggle.setAttribute("aria-expanded", String(open));
    ghostToggle.firstElementChild.textContent = open ? "свернуть" : "подробнее";
  });

  /* ================= terminal ================= */
  const termOut = $("#termOut"), termForm = $("#termForm"), termInput = $("#termInput");
  const esc = s => s.replace(/</g, "&lt;");
  function print(html, cls = "") {
    const d = document.createElement("div");
    d.className = "ln " + cls; d.innerHTML = html;
    termOut.appendChild(d); termOut.scrollTop = termOut.scrollHeight;
  }
  const cmds = {
    help: () => ["доступные: help, whoami, stack, ghostsee --status, date, clear"],
    whoami: () => ["morphynne — developer. web, telegram-боты, linux."],
    stack: () => ["js · python · html/css · telegram bot api · linux"],
    "ghostsee --status": () => ["ghostsee: <span class='ok'>ACTIVE</span> · telegram bot online"],
    date: () => [esc(new Date().toLocaleString("ru-RU"))],
    clear: () => { termOut.innerHTML = ""; return []; },
  };
  function run(raw) {
    const c = raw.trim().toLowerCase();
    if (!c) return;
    print(`<span class="cmd">$ ${esc(raw)}</span>`);
    const fn = cmds[c];
    if (!fn) { print(`команда не найдена: ${esc(c)}. напиши help`, "err"); return; }
    fn().forEach((line, i) => setTimeout(() => print(line, "ok"), reduce ? 0 : i * 120));
  }
  termForm.addEventListener("submit", e => { e.preventDefault(); run(termInput.value); termInput.value = ""; });
  $$("[data-cmd]").forEach(b => b.addEventListener("click", () => run(b.dataset.cmd)));
  print("morphynne terminal v3.0 — напиши <span class='cmd'>help</span>", "note");

  /* ================= mood ================= */
  const mood = $("#mood"), moodVal = $("#moodVal"), moodText = $("#moodText");
  const moodMsg = v => v < 25 ? "спокойно, почти по плану" : v < 60 ? "немного хаоса — норма" : v < 85 ? "код пишется сам" : "полный хаос, но работает";
  const updMood = () => { moodVal.textContent = `chaos: ${mood.value}%`; moodText.textContent = moodMsg(+mood.value); };
  mood.addEventListener("input", updMood); updMood();

  /* ================= player ================= */
  const audio = $("#audio"), card = $("#music"), playBtn = $("#playBtn");
  const bar = $("#bar"), fill = $("#fill"), knob = $("#knob"), cur = $("#cur"), dur = $("#dur");
  const vol = $("#vol"), loopBtn = $("#loopBtn");
  const fmt = s => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";
  audio.volume = .9;
  audio.addEventListener("loadedmetadata", () => dur.textContent = fmt(audio.duration));
  audio.addEventListener("timeupdate", () => {
    const p = audio.duration ? audio.currentTime / audio.duration : 0;
    fill.style.width = p * 100 + "%"; knob.style.left = p * 100 + "%";
    cur.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener("play", () => card.classList.add("playing"));
  audio.addEventListener("pause", () => card.classList.remove("playing"));
  audio.addEventListener("ended", () => card.classList.remove("playing"));
  playBtn.addEventListener("click", () => audio.paused ? audio.play() : audio.pause());
  $("#rewBtn").addEventListener("click", () => audio.currentTime = Math.max(0, audio.currentTime - 10));
  $("#fwdBtn").addEventListener("click", () => audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10));
  loopBtn.addEventListener("click", () => {
    audio.loop = !audio.loop; loopBtn.classList.toggle("on", audio.loop);
    say(audio.loop ? "повтор: вкл" : "повтор: выкл");
  });
  vol.addEventListener("input", () => audio.volume = +vol.value);
  let seeking = false;
  const seek = e => {
    const r = bar.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    if (audio.duration) audio.currentTime = p * audio.duration;
  };
  bar.addEventListener("pointerdown", e => { seeking = true; bar.setPointerCapture(e.pointerId); seek(e); });
  bar.addEventListener("pointermove", e => { if (seeking) seek(e); });
  const endSeek = () => seeking = false;
  bar.addEventListener("pointerup", endSeek);
  bar.addEventListener("pointercancel", endSeek);
  // keyboard: space = play/pause when not typing
  addEventListener("keydown", e => {
    if (e.code !== "Space" || /input|textarea/i.test(document.activeElement.tagName)) return;
    if (!card.getBoundingClientRect().height) return;
    e.preventDefault(); audio.paused ? audio.play() : audio.pause();
  });
  // cover parallax tilt on desktop
  const cover = $("#cover");
  if (fine && !reduce) cover.addEventListener("pointermove", e => {
    const r = cover.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    cover.style.transform = `perspective(600px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) scale(1.03)`;
  });
  if (fine) cover.addEventListener("pointerleave", () => cover.style.transform = "");

  /* ================= konami rain ================= */
  function konamiRain(word) {
    if (reduce) return;
    for (let i = 0; i < 26; i++) {
      const s = document.createElement("span");
      s.className = "konami-rain"; s.textContent = word;
      s.style.left = Math.random() * 100 + "vw";
      s.style.animationDuration = (2.4 + Math.random() * 2.4) + "s";
      s.style.animationDelay = (Math.random() * 1.2) + "s";
      document.body.appendChild(s); setTimeout(() => s.remove(), 5200);
    }
  }
  const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let sp = 0;
  addEventListener("keydown", e => {
    if (e.key === seq[sp]) { sp++; if (sp === seq.length) { sp = 0; konamiRain("↑↑↓↓←→←→BA"); say("cheat mode 😈"); } }
    else sp = e.key === seq[0] ? 1 : 0;
  });

  /* ================= particles + cursor trail ================= */
  const cv = $("#fx"), ctx = cv.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = innerWidth, H = innerHeight, pts = [];
  const mouse = { x: -999, y: -999 };
  const trail = [];
  let rgb = "239,41,71";
  function refreshRGB() {
    const v = getComputedStyle(root).getPropertyValue("--accent-rgb").trim();
    if (v) rgb = v;
  }
  function size() {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = small ? 26 : 60;
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.6 + .4,
    }));
  }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 110 && d > 0) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = `rgba(${rgb},.7)`; ctx.fill();
    }
    const max = small ? 90 : 120;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < max) {
        ctx.strokeStyle = `rgba(${rgb},${(1 - d / max) * .2})`; ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    for (let i = trail.length - 1; i >= 0; i--) {
      const t = trail[i]; t.life -= .045;
      if (t.life <= 0) { trail.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(t.x, t.y, 2.6 * t.life, 0, 6.283);
      ctx.fillStyle = `rgba(${rgb},${t.life * .55})`; ctx.fill();
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  size(); refreshRGB(); frame();
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(size, 150); });

  /* ================= desktop pointer effects ================= */
  if (fine && !reduce) {
    const dot = $("#cursor");
    addEventListener("pointermove", e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      dot.style.opacity = "1";
      dot.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      trail.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (trail.length > 28) trail.shift();
    });
    document.addEventListener("pointerleave", () => dot.style.opacity = "0");
    $$("a, button, input, .pill, .sw, .stat, .avatar-btn").forEach(el => {
      el.addEventListener("pointerenter", () => dot.classList.add("hover"));
      el.addEventListener("pointerleave", () => dot.classList.remove("hover"));
    });
    $$(".magnetic").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .28}px)`;
      });
      el.addEventListener("pointerleave", () => el.style.transform = "");
    });
    $$(".spot, .status-card, .pill, .card, .project-card, .link-card").forEach(el => el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--sx", (e.clientX - r.left) + "px");
      el.style.setProperty("--sy", (e.clientY - r.top) + "px");
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }));
    const tilt = $("#tilt"), aw = $(".avatar-wrap");
    aw.addEventListener("pointermove", e => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = `perspective(500px) rotateX(${-y * 20}deg) rotateY(${x * 20}deg)`;
    });
    aw.addEventListener("pointerleave", () => tilt.style.transform = "");
    // glitch flash on handle hover (desktop)
    handle.addEventListener("pointerenter", () => { handle.classList.add("glitch-flash"); setTimeout(() => handle.classList.remove("glitch-flash"), 400); });
  }

  /* ================= ripple on tap ================= */
  $$(".ripple").forEach(el => el.addEventListener("pointerdown", e => {
    const r = el.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const d = document.createElement("span");
    d.className = "ripple-dot";
    d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    el.appendChild(d); setTimeout(() => d.remove(), 700);
  }));

  /* ================= nav highlight ================= */
  const navLinks = $$(".section-nav a");
  const secs = navLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);
  addEventListener("scroll", () => {
    let idx = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .4) idx = i; });
    navLinks.forEach((a, i) => a.classList.toggle("active", i === idx));
  }, { passive: true });

  /* ================= to top ================= */
  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
