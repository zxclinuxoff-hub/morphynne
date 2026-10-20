(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const mobile = innerWidth < 700 || !fine;

  $("#year").textContent = new Date().getFullYear();

  /* ================= toast ================= */
  const toast = $("#toast");
  let tt;
  const say = msg => {
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 1800);
  };

  /* ================= copy ================= */
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
  }
  $$("[data-copy]").forEach(btn => btn.addEventListener("click", async () => {
    await copyText(btn.dataset.copy);
    btn.classList.add("copied");
    setTimeout(() => btn.classList.remove("copied"), 1100);
    say(btn.dataset.msg || "Скопировано");
  }));

  /* ================= share ================= */
  const shareFn = async () => {
    const data = { title: "Morphynne", text: "Morphynne — developer", url: location.href };
    if (navigator.share) { try { await navigator.share(data); return; } catch { return; } }
    await copyText(location.href); say("Ссылка скопирована");
  };
  $("#shareBtn").addEventListener("click", shareFn);
  $("#shareBtn2").addEventListener("click", shareFn);

  /* ================= theme swatches ================= */
  const swatches = $$(".sw");
  const setTheme = name => {
    if (name === "red") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", name);
    swatches.forEach(s => s.setAttribute("aria-pressed", String(s.dataset.theme === name)));
    say("акцент: " + name);
  };
  swatches.forEach(s => s.addEventListener("click", () => setTheme(s.dataset.theme)));
  setTheme("red");

  /* ================= tabs ================= */
  const panels = $$(".panel");
  const dockBtns = $$(".dock-btn");
  let current = "profile", leaving = null;
  function go(name, push = true) {
    if (name === current) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const next = $(`[data-panel="${name}"]`);
    if (!next) return;
    const prev = $(`[data-panel="${current}"]`);
    if (prev && !reduce) {
      prev.classList.add("leave");
      setTimeout(() => { prev.hidden = true; prev.classList.remove("leave"); }, 240);
    } else if (prev) prev.hidden = true;
    next.hidden = false;
    current = name;
    document.body.dataset.tab = name;
    dockBtns.forEach(b => b.classList.toggle("active", b.dataset.go === name));
    if (push) history.replaceState(null, "", "#" + name);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (name === "profile") runProfile();
  }
  $$("[data-go]").forEach(el => el.addEventListener("click", e => { e.preventDefault(); go(el.dataset.go); }));
  const initial = location.hash.slice(1);
  if (["music", "projects", "contact"].includes(initial)) {
    panels.forEach(p => p.hidden = p.dataset.panel !== initial);
    current = initial; document.body.dataset.tab = initial;
    dockBtns.forEach(b => b.classList.toggle("active", b.dataset.go === initial));
  } else panels.forEach(p => p.hidden = p.dataset.panel !== "profile");

  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ================= boot ================= */
  const boot = $("#boot"), bootText = $("#bootText");
  const lines = [
    [["k", "const"], ["", " morphynne = {"]],
    [["", "  "], ["s", "\"role\""], ["", ": "], ["s", "\"developer\""], ["", ","]],
    [["", "  "], ["s", "\"web\""], ["", ": "], ["k", "true"], ["", ","]],
    [["", "  "], ["s", "\"mood\""], ["", ": "], ["s", "\"chaos\""]],
    [["", "};"]],
    [["c", "// welcome in"]],
  ];
  let li = 0, ci = 0, booted = false, bootTimer;
  function endBoot() {
    if (booted) return; booted = true;
    clearTimeout(bootTimer);
    boot.classList.add("done");
    setTimeout(() => boot.remove(), 700);
    runProfile();
  }
  function typeBoot() {
    if (booted) return;
    if (li >= lines.length) { bootTimer = setTimeout(endBoot, 450); return; }
    const flat = lines[li].flatMap(([c, t]) => [...t].map(ch => [c, ch]));
    if (ci === 0 && li > 0) bootText.append("\n");
    if (ci < flat.length) {
      const [c, ch] = flat[ci];
      const s = document.createElement("span");
      if (c) s.className = c;
      s.textContent = ch; bootText.append(s); ci++;
      bootTimer = setTimeout(typeBoot, 26 + Math.random() * 28);
    } else { li++; ci = 0; bootTimer = setTimeout(typeBoot, 110); }
  }
  boot.addEventListener("click", endBoot);
  if (reduce || location.hash) endBoot(); else { typeBoot(); setTimeout(endBoot, 4600); }

  /* ================= profile animations ================= */
  let profileRan = false;
  function runProfile() {
    // bio typewriter
    const bioEl = $("#bioText");
    if (!profileRan) {
      profileRan = true;
      const text = "Собираю идеи в проекты. Код, инструменты и немного хаоса.";
      if (reduce) bioEl.textContent = text;
      else {
        let i = 0;
        const t = setInterval(() => { bioEl.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(t); }, 32);
      }
      // counters
      $$(".stat b").forEach(b => {
        const target = +b.dataset.count;
        if (reduce) { b.textContent = target; return; }
        const t0 = performance.now(), dur = 1200;
        const step = now => {
          const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          b.textContent = Math.round(target * e);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }
    // meters
    $$(".meter i, .progress i").forEach(i => { i.style.width = i.dataset.level + "%"; });
  }

  /* ================= status cycling ================= */
  const statuses = ["coding something", "ловлю баги", "в поиске идей", "собираю что-то новое"];
  const statusEl = $("#statusText");
  let si = 0;
  if (!reduce) setInterval(() => {
    statusEl.classList.add("swap");
    setTimeout(() => {
      si = (si + 1) % statuses.length;
      statusEl.textContent = statuses[si];
      statusEl.classList.remove("swap");
    }, 300);
  }, 3400);

  /* ================= avatar: click burst ================= */
  const avatarBtn = $("#avatarBtn"), burstCount = $("#burstCount");
  let clicks = 0, burstT;
  avatarBtn.addEventListener("click", e => {
    clicks++;
    burstCount.textContent = clicks;
    burstCount.classList.add("show");
    clearTimeout(burstT); burstT = setTimeout(() => burstCount.classList.remove("show"), 1600);
    avatarBtn.classList.remove("spin"); void avatarBtn.offsetWidth; avatarBtn.classList.add("spin");
    if (!reduce) {
      const r = avatarBtn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (let i = 0; i < 16; i++) {
        const s = document.createElement("span");
        s.className = "sparkle"; document.body.appendChild(s);
        const a = (Math.PI * 2 / 16) * i, d = 70 + Math.random() * 50;
        s.animate([
          { transform: `translate(${cx}px,${cy}px) scale(1)`, opacity: 1 },
          { transform: `translate(${cx + Math.cos(a) * d}px,${cy + Math.sin(a) * d}px) scale(0)`, opacity: 0 },
        ], { duration: 700 + Math.random() * 300, easing: "cubic-bezier(.2,.7,.2,1)" }).onfinish = () => s.remove();
      }
    }
    if (clicks === 7) say("ты нашёл пасхалку 👀");
  });

  /* ================= ghost project expand ================= */
  const ghostToggle = $("#ghostToggle"), ghostBody = $("#ghostBody");
  ghostToggle.addEventListener("click", () => {
    const open = ghostBody.classList.toggle("open");
    ghostToggle.setAttribute("aria-expanded", String(open));
    ghostToggle.firstChild.textContent = open ? "свернуть " : "подробнее ";
  });

  /* ================= terminal ================= */
  const termOut = $("#termOut"), termForm = $("#termForm"), termInput = $("#termInput");
  const print = (html, cls = "") => {
    const d = document.createElement("div");
    d.className = "ln " + cls; d.innerHTML = html;
    termOut.appendChild(d); termOut.scrollTop = termOut.scrollHeight;
  };
  const commands = {
    help: () => ["доступные команды: help, whoami, stack, ghostsee --status, date, clear"],
    whoami: () => ["morphynne — developer. web, telegram-боты, linux."],
    stack: () => ["js · python · html/css · telegram bot api · linux"],
    "ghostsee --status": () => ["ghostsee: <span class='ok'>ACTIVE</span> · telegram bot online"],
    date: () => [new Date().toLocaleString("ru-RU")],
    clear: () => { termOut.innerHTML = ""; return []; },
  };
  function runCmd(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    print(`<span class="cmd">$ ${raw.replace(/</g, "&lt;")}</span>`);
    const fn = commands[cmd];
    if (!fn) { print(`команда не найдена: ${cmd.replace(/</g, "&lt;")}. напиши help`, "err"); return; }
    const out = fn();
    out.forEach((line, i) => setTimeout(() => print(line, "ok"), reduce ? 0 : i * 120));
  }
  termForm.addEventListener("submit", e => { e.preventDefault(); runCmd(termInput.value); termInput.value = ""; });
  $$("[data-cmd]").forEach(b => b.addEventListener("click", () => runCmd(b.dataset.cmd)));
  print("morphynne terminal v1.0 — напиши <span class='cmd'>help</span>", "terminal-note");

  /* ================= mood slider ================= */
  const mood = $("#mood"), moodVal = $("#moodVal"), moodText = $("#moodText");
  const moodMsg = v => v < 25 ? "спокойно, почти по плану" : v < 60 ? "немного хаоса — норма" : v < 85 ? "код пишется сам" : "полный хаос, но работает";
  const updMood = () => { moodVal.textContent = `chaos: ${mood.value}%`; moodText.textContent = moodMsg(+mood.value); };
  mood.addEventListener("input", updMood); updMood();

  /* ================= player ================= */
  const audio = $("#audio"), player = $("#player"), playBtn = $("#playBtn");
  const bar = $("#bar"), fill = $("#fill"), knob = $("#knob"), cur = $("#cur"), dur = $("#dur");
  const vol = $("#vol"), loopBtn = $("#loopBtn");
  const fmt = s => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";
  audio.volume = 0.9;
  audio.addEventListener("loadedmetadata", () => dur.textContent = fmt(audio.duration));
  audio.addEventListener("timeupdate", () => {
    const p = audio.duration ? audio.currentTime / audio.duration : 0;
    fill.style.width = p * 100 + "%"; knob.style.left = p * 100 + "%";
    cur.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener("play", () => player.classList.add("playing"));
  audio.addEventListener("pause", () => player.classList.remove("playing"));
  audio.addEventListener("ended", () => player.classList.remove("playing"));
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

  /* ================= particles + cursor trail ================= */
  const cv = $("#fx"), ctx = cv.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = innerWidth, H = innerHeight, pts = [];
  const mouse = { x: -999, y: -999 };
  const trail = [];
  function size() {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = mobile ? 26 : 62;
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.6 + .4,
    }));
  }
  const accentRGB = () => getComputedStyle(root).getPropertyValue("--accent").trim();
  let rgb = "239,41,71";
  function refreshRGB() {
    const c = accentRGB();
    const m = c.match(/#([0-9a-f]{6})/i);
    if (m) { const n = parseInt(m[1], 16); rgb = `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; }
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
    const max = mobile ? 90 : 120;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < max) {
        ctx.strokeStyle = `rgba(${rgb},${(1 - d / max) * .22})`; ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    // trail
    for (let i = trail.length - 1; i >= 0; i--) {
      const t = trail[i]; t.life -= .04;
      if (t.life <= 0) { trail.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(t.x, t.y, 3 * t.life, 0, 6.283);
      ctx.fillStyle = `rgba(${rgb},${t.life * .6})`; ctx.fill();
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  size(); refreshRGB(); frame();
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(size, 150); });
  if (fine && !reduce) addEventListener("pointermove", e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    trail.push({ x: e.clientX, y: e.clientY, life: 1 });
    if (trail.length > 30) trail.shift();
  });
  swatches.forEach(s => s.addEventListener("click", () => setTimeout(refreshRGB, 20)));

  /* ================= pointer effects (desktop) ================= */
  if (fine && !reduce) {
    $$(".magnetic").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .25}px)`;
      });
      el.addEventListener("pointerleave", () => el.style.transform = "");
    });
    $$(".spot").forEach(el => el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }));
    $$(".card").forEach(el => el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    }));
    $$(".card").forEach(el => el.addEventListener("pointerleave", () => el.style.transform = ""));
  }

  /* ================= ripple on tap ================= */
  $$(".ripple").forEach(el => el.addEventListener("pointerdown", e => {
    const r = el.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const d = document.createElement("span");
    d.className = "ripple-dot";
    d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    el.appendChild(d); setTimeout(() => d.remove(), 700);
  }));
})();
