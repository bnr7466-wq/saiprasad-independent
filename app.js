// --- CONFIGURATION & ASSETS ---
// Place transparent PNG cutouts inside an assets/ folder and set their paths below:
const CANDIDATE_IMG_URL = ""; // e.g., "./assets/candidate.png"
const LEADER_IMG_URL = "./leader.png";

const SLOGANS = {
  te: [
    "స్వతంత్ర అభ్యర్థి సాయిప్రసాద్ కే",
    "నేను సాయిప్రసాద్ కే ఓటు వేస్తా",
    "మా ఇంటి ఓట్లు సాయిప్రసాద్ కే",
    "మా ఊరు సాయిప్రసాద్ వెంటే",
    "నేను ఓటు వేస్తా.. వేయిస్తా"
  ],
  en: [
    "My Support is for\nSaiPrasad",
    "I Vote for Symbol",
    "Our Family Votes for SaiPrasad",
    "Our Village Stands with SaiPrasad",
    "Together for Moda Grama Panchayathi"
  ]
};

const THEMES = {
  classic: { c1: "#0b3b8c", c2: "#169b49", bar: "#072863", accent: "#facc15", text: "#ffffff" },
  flag:    { c1: "#0b3d91", c2: "#169b49", bar: "#0b3d91", accent: "#ffffff", text: "#ffffff", split: true },
  sunrise: { c1: "#d97706", c2: "#b45309", bar: "#78350f", accent: "#fef08a", text: "#ffffff" },
  gold:    { c1: "#0f172a", c2: "#1e3a8a", bar: "#020617", accent: "#fbbf24", text: "#ffffff" },
  wave:    { c1: "#064e3b", c2: "#15803d", bar: "#052e16", accent: "#fde047", text: "#ffffff" }
};

const state = {
  lang: "te",
  sloganIndex: 0,
  theme: "classic",
  format: "square",
  userImg: null,
  candidateImg: null,
  leaderImg: null,
  imgX: 0,
  imgY: 0,
  imgScale: 1,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0
};

const canvas = document.getElementById("frameCanvas");
const ctx = canvas.getContext("2d");

// Safe image loader for both local file:/// and http/https
function loadOptionalImage(url, key) {
  if (!url) return;
  const img = new Image();
  if (url.startsWith("http://") || url.startsWith("https://")) {
    img.crossOrigin = "anonymous";
  }
  img.onload = () => {
    state[key] = img;
    drawCanvas();
  };
  img.onerror = () => {
    console.error("Failed to load image:", url);
  };
  img.src = url;
}
loadOptionalImage(CANDIDATE_IMG_URL, "candidateImg");
loadOptionalImage(LEADER_IMG_URL, "leaderImg");

function renderSlogans() {
  const container = document.getElementById("sloganContainer");
  container.innerHTML = "";
  SLOGANS[state.lang].forEach((text, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "opt-btn" + (idx === state.sloganIndex ? " active" : "") + (idx === 4 ? " full" : "");
    btn.textContent = text.replace("\n", " ");
    btn.onclick = () => {
      state.sloganIndex = idx;
      renderSlogans();
      drawCanvas();
    };
    container.appendChild(btn);
  });
}

function drawCanvas() {
  const isTall = state.format === "tall";
  canvas.width = 1080;
  canvas.height = isTall ? 1920 : 1080;

  const W = canvas.width;
  const H = canvas.height;
  const theme = THEMES[state.theme];

  if (theme.split) {
    ctx.fillStyle = "#0b3d91";
    ctx.fillRect(0, 0, W * 0.35, H);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(W * 0.35, 0, W * 0.3, H);
    ctx.fillStyle = "#169b49";
    ctx.fillRect(W * 0.65, 0, W * 0.35, H);
  } else {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.c1);
    grad.addColorStop(1, theme.c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = theme.split ? "#0b3d91" : theme.text;
  ctx.textAlign = "center";
  ctx.font = "800 58px sans-serif";
  const sloganLines = SLOGANS[state.lang][state.sloganIndex].split("\n");
  const topOffset = isTall ? 210 : 115;
  sloganLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, topOffset + i * 74);
  });

  // Supporter Photo Circle
  const circleR = isTall ? 310 : 255;
  const circleX = isTall ? W / 2 : 340;
  const circleY = isTall ? 810 : 540;

  ctx.beginPath();
  ctx.arc(circleX, circleY, circleR + 16, 0, Math.PI * 2);
  ctx.fillStyle = theme.accent;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(circleX - circleR, circleY - circleR, circleR * 2, circleR * 2);

  if (state.userImg) {
    const aspect = state.userImg.width / state.userImg.height;
    let drawW = circleR * 2 * state.imgScale;
    let drawH = drawW / aspect;
    if (drawH < circleR * 2 * state.imgScale) {
      drawH = circleR * 2 * state.imgScale;
      drawW = drawH * aspect;
    }
    ctx.drawImage(
      state.userImg,
      circleX - drawW / 2 + state.imgX,
      circleY - drawH / 2 + state.imgY,
      drawW,
      drawH
    );
  } else {
    ctx.fillStyle = "#64748b";
    ctx.font = "700 42px sans-serif";
    ctx.fillText(state.lang === "te" ? "మీ ఫోటో" : "Your Photo", circleX, circleY + 15);
  }
  ctx.restore();

  // Supporter Name & Village Pill
  const supName = document.getElementById("supporterName").value.trim();
  const supVillage = document.getElementById("supporterVillage").value.trim();
  if (supName || supVillage) {
    const label = [supName, supVillage].filter(Boolean).join(" - ");
    const pillY = circleY + circleR + 42;
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.beginPath();
    ctx.roundRect(circleX - 240, pillY - 34, 480, 50, 25);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 28px sans-serif";
    ctx.fillText(label, circleX, pillY);
  }

  // Expanded Leader Inset Circle (Top Right)
  const leaderX = isTall ? 840 : 850;
  const leaderY = isTall ? 470 : 355;
  const leaderR = isTall ? 155 : 145;

  ctx.beginPath();
  ctx.arc(leaderX, leaderY, leaderR + 10, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(leaderX, leaderY, leaderR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(leaderX - leaderR, leaderY - leaderR, leaderR * 2, leaderR * 2);

  if (state.leaderImg) {
    const imgAspect = state.leaderImg.width / state.leaderImg.height;
    const diameter = leaderR * 2;
    let drawW = diameter;
    let drawH = diameter;

    if (imgAspect > 1) {
      drawW = diameter * imgAspect;
    } else {
      drawH = diameter / imgAspect;
    }

    ctx.drawImage(
      state.leaderImg,
      leaderX - drawW / 2,
      leaderY - drawH / 2,
      drawW,
      drawH
    );
  } else {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 24px sans-serif";
    ctx.fillText("Leader", leaderX, leaderY + 8);
  }
  ctx.restore();

  // Candidate Cutout (Bottom Right)
  const bottomBarH = isTall ? 260 : 195;
  if (state.candidateImg) {
    const cH = isTall ? 650 : 500;
    const cW = (state.candidateImg.width / state.candidateImg.height) * cH;
    ctx.drawImage(state.candidateImg, W - cW - 20, H - bottomBarH - cH + 15, cW, cH);
  }

  // Bottom Nameplate Footer
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, H - bottomBarH - 12, W, 12);

  ctx.fillStyle = theme.bar;
  ctx.fillRect(0, H - bottomBarH, W, bottomBarH);

  ctx.fillStyle = "#fde047";
  ctx.font = "700 34px sans-serif";
  ctx.fillText(
    state.lang === "te" ? "మోధ గ్రామ పంచాయతీ సర్పంచ్ స్వతంత్ర అభ్యర్థి" : "Moda Grama Panchayathi Independent Candidate",
    W / 2,
    H - bottomBarH + 68
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 56px sans-serif";
  ctx.fillText(
    state.lang === "te" ? "తిప్పేస్వామి గారి సాయి ప్రసాద్" : "Thippeswamy Gari Sai Prasad",
    W / 2,
    H - bottomBarH + 145
  );
}

document.getElementById("photoInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      state.userImg = img;
      state.imgX = 0;
      state.imgY = 0;
      state.imgScale = 1;
      document.getElementById("zoomSlider").value = 1;
      drawCanvas();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

["supporterName", "supporterVillage"].forEach(id => {
  document.getElementById(id).addEventListener("input", drawCanvas);
});

document.querySelectorAll("[data-lang]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-lang]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.lang = btn.dataset.lang;
    renderSlogans();
    drawCanvas();
  });
});

document.querySelectorAll("[data-theme]").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll("[data-theme]").forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    state.theme = card.dataset.theme;
    drawCanvas();
  });
});

document.querySelectorAll("[data-format]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-format]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.format = btn.dataset.format;
    drawCanvas();
  });
});

document.getElementById("zoomSlider").addEventListener("input", (e) => {
  state.imgScale = parseFloat(e.target.value);
  drawCanvas();
});

function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

canvas.addEventListener("pointerdown", (e) => {
  if (!state.userImg) return;
  state.isDragging = true;
  const pos = getPointerPos(e);
  state.dragStartX = pos.x - state.imgX;
  state.dragStartY = pos.y - state.imgY;
});

window.addEventListener("pointermove", (e) => {
  if (!state.isDragging) return;
  const pos = getPointerPos(e);
  state.imgX = pos.x - state.dragStartX;
  state.imgY = pos.y - state.dragStartY;
  drawCanvas();
});

window.addEventListener("pointerup", () => { state.isDragging = false; });

document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `campaign-frame-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

document.getElementById("shareBtn").addEventListener("click", async () => {
  canvas.toBlob(async (blob) => {
    const file = new File([blob], "campaign-frame.png", { type: "image/png" });
    const shareText = "I support Thippeswamy Gari SaiPrasad! Create your frame here: " + window.location.href;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: shareText });
        return;
      } catch (err) {}
    }
    const link = document.createElement("a");
    link.download = "campaign-frame.png";
    link.href = URL.createObjectURL(blob);
    link.click();
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  }, "image/png");
});

renderSlogans();
drawCanvas();
