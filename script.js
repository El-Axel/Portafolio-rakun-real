/* ============================================================
   RAKÜN VISUAL DESIGN — script.js
   ============================================================ */

   
/* --- Navegación scroll --- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* --- Menú móvil --- */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

function closeNav() {
  navLinks.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ============================================================
   TRABAJO — categorías + carrusel
   ============================================================ */

const catButtons = document.querySelectorAll('.work-cat-card');
const carouselWraps = document.querySelectorAll('.work-carousel-wrap');

catButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.category;

    catButtons.forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
    });

    carouselWraps.forEach(wrap => {
      wrap.classList.toggle('open', wrap.id === `carousel-${cat}`);
    });

    const target = document.getElementById(`carousel-${cat}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* Carrusel: cuántas tarjetas se ven a la vez según el ancho */
function slidesPerView() {
  if (window.innerWidth <= 580) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

const carouselState = {};

function initCarousel(name) {
  const track = document.getElementById(`track-${name}`);
  const dotsWrap = document.getElementById(`dots-${name}`);
  if (!track) return;

  const totalSlides = track.children.length;
  carouselState[name] = { index: 0, total: totalSlides };

  renderDots(name);
  updateCarousel(name);
}

function renderDots(name) {
  const dotsWrap = document.getElementById(`dots-${name}`);
  if (!dotsWrap) return;
  const perView = slidesPerView();
  const totalPages = Math.max(1, Math.ceil(carouselState[name].total / perView));

  dotsWrap.innerHTML = '';
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement('span');
    dot.className = 'work-carousel-dot' + (i === 0 ? ' active' : '');
    dotsWrap.appendChild(dot);
  }
}

function updateCarousel(name) {
  const track = document.getElementById(`track-${name}`);
  const dotsWrap = document.getElementById(`dots-${name}`);
  if (!track) return;

  const state = carouselState[name];
  const perView = slidesPerView();
  const totalPages = Math.max(1, Math.ceil(state.total / perView));

  if (state.index >= totalPages) state.index = totalPages - 1;
  if (state.index < 0) state.index = 0;

  const slide = track.children[0];
  const slideWidth = slide ? slide.getBoundingClientRect().width : 0;
  const gap = 1.2 * parseFloat(getComputedStyle(document.documentElement).fontSize);
  const offset = state.index * perView * (slideWidth + gap);

  track.style.transform = `translateX(-${offset}px)`;

  if (dotsWrap) {
    [...dotsWrap.children].forEach((dot, i) => {
      dot.classList.toggle('active', i === state.index);
    });
  }
}

document.querySelectorAll('.work-carousel-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.target;
    const dir = parseInt(btn.dataset.dir, 10);
    const state = carouselState[name];
    if (!state) return;

    const perView = slidesPerView();
    const totalPages = Math.max(1, Math.ceil(state.total / perView));

    state.index = (state.index + dir + totalPages) % totalPages;
    updateCarousel(name);
  });
});

['reels', 'youtube', 'cine'].forEach(initCarousel);

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ['reels', 'youtube', 'cine'].forEach(name => {
      renderDots(name);
      updateCarousel(name);
    });
  }, 200);
});

/* ============================================================
   CALCULADORA — personaliza tu plan
   ============================================================ */

const PRECIOS = {
  reel: { basica: 80000, avanzada: 120000 },
  yt:   { basica: 350000, avanzada: 500000 },
  grabacionMultiplier: 1.5, // +50% sobre "solo edición" cuando se incluye grabación
  post: 60000,
  cm: 300000,
  pauta: 350000
};

const calcState = {
  reels: 0,
  reelLevel: 'basica',
  reelRec: true, // true = grabación + edición
  posts: 0,
  yt: 0,
  ytLevel: 'basica',
  ytRec: true,
  cm: false,
  pauta: false
};

function formatCOP(n) {
  return Math.round(n).toLocaleString('es-CO');
}

function unitPrice(base, level, includeRec) {
  const price = base[level];
  return includeRec ? Math.round(price * PRECIOS.grabacionMultiplier) : price;
}

function updateCalc() {
  const reelUnit = unitPrice(PRECIOS.reel, calcState.reelLevel, calcState.reelRec);
  const ytUnit   = unitPrice(PRECIOS.yt, calcState.ytLevel, calcState.ytRec);

  const reelCosto = calcState.reels * reelUnit;
  const postCosto = calcState.posts * PRECIOS.post;
  const ytCosto   = calcState.yt * ytUnit;
  const cmCosto    = calcState.cm ? PRECIOS.cm : 0;
  const pautaCosto = calcState.pauta ? PRECIOS.pauta : 0;

  const total = reelCosto + postCosto + ytCosto + cmCosto + pautaCosto;

  document.getElementById('totalNum').textContent = formatCOP(total);

  document.getElementById('reelsCount').textContent = calcState.reels;
  document.getElementById('postsCount').textContent = calcState.posts;
  document.getElementById('ytCount').textContent    = calcState.yt;

  document.getElementById('reelPriceTag').textContent = '$' + formatCOP(reelUnit) + ' c/u';
  document.getElementById('ytPriceTag').textContent   = '$' + formatCOP(ytUnit) + ' c/u';

  document.getElementById('reelOptions').classList.toggle('is-disabled', calcState.reels === 0);
  document.getElementById('ytOptions').classList.toggle('is-disabled', calcState.yt === 0);

  const reelLine = document.getElementById('reelLine');
  reelLine.style.display = calcState.reels > 0 ? '' : 'none';
  document.getElementById('reelLineLabel').textContent = `Reels (×${calcState.reels})`;
  document.getElementById('reelCosto').textContent = '$' + formatCOP(reelCosto);

  const postLine = document.getElementById('postLine');
  postLine.style.display = calcState.posts > 0 ? '' : 'none';
  document.getElementById('postLineLabel').textContent = `Posts (×${calcState.posts})`;
  document.getElementById('postCosto').textContent = '$' + formatCOP(postCosto);

  const ytLine = document.getElementById('ytLine');
  ytLine.style.display = calcState.yt > 0 ? '' : 'none';
  document.getElementById('ytLineLabel').textContent = `YouTube long form (×${calcState.yt})`;
  document.getElementById('ytCosto').textContent = '$' + formatCOP(ytCosto);

  document.getElementById('cmLine').style.display = calcState.cm ? '' : 'none';
  document.getElementById('cmCosto').textContent = '+$' + formatCOP(PRECIOS.cm);

  document.getElementById('pautaLine').style.display = calcState.pauta ? '' : 'none';
  document.getElementById('pautaCosto').textContent = '+$' + formatCOP(PRECIOS.pauta);
}

/* Contadores (+ / −) */
document.querySelectorAll('.calc-counter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.counter;
    const delta = parseInt(btn.dataset.delta, 10);
    const next = Math.max(0, Math.min(30, calcState[key] + delta));
    calcState[key] = next;
    updateCalc();
  });
});

/* Toggles de nivel y servicio (reels / yt / cm / pauta) */
document.querySelectorAll('.calc-toggle[data-group]').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.dataset.group;
    const value = btn.dataset.value;

    document.querySelectorAll(`[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (group === 'reelLevel') calcState.reelLevel = value;
    if (group === 'reelRec')   calcState.reelRec   = value === 'si';
    if (group === 'ytLevel')   calcState.ytLevel    = value;
    if (group === 'ytRec')     calcState.ytRec      = value === 'si';
    if (group === 'cm')        calcState.cm         = value === 'si';
    if (group === 'pauta')     calcState.pauta      = value === 'si';

    updateCalc();
  });
});

updateCalc();

/* ============================================================
   FORMULARIO / CONTACTO
   ============================================================ */

function openContact(planName) {
  document.getElementById('contactOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  const servicioSelect = document.getElementById('contactServicio');
  const mensaje = document.getElementById('contactMensaje');

  if (planName && servicioSelect) {
    const match = [...servicioSelect.options].find(o => o.value === planName);
    if (match) servicioSelect.value = planName;
  }

  if (planName === 'Plan personalizado' && mensaje) {
    const total = document.getElementById('totalNum').textContent;
    mensaje.value = `Presupuesto estimado en la calculadora: $${total} COP/mes.`;
  }
}

function closeContact() {
  document.getElementById('contactOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('contactOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('contactOverlay')) closeContact();
});

/* Envío del formulario a Formspree (correo: rakundesigns@gmail.com) */
const contactForm = document.getElementById('contactForm');
const contactFormStatus = document.getElementById('contactFormStatus');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const endpoint = contactForm.getAttribute('action');
  const submitBtn = contactForm.querySelector('button[type="submit"]');

  if (!endpoint || endpoint.includes('TU_ENDPOINT_DE_FORMSPREE')) {
    contactFormStatus.style.display = 'block';
    contactFormStatus.style.color = 'var(--color-yellow)';
    contactFormStatus.textContent = 'Formulario aún no conectado: configurá tu endpoint de Formspree en el código (ver comentario en el HTML). Mientras tanto, escribinos por WhatsApp.';
    return;
  }

  submitBtn.disabled = true;
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = 'Enviando...';

  try {
    const formData = new FormData(contactForm);
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    contactFormStatus.style.display = 'block';

    if (response.ok) {
      contactFormStatus.style.color = 'var(--color-blue)';
      contactFormStatus.textContent = '¡Listo! Tu mensaje fue enviado. Te contactamos pronto.';
      contactForm.reset();
      setTimeout(closeContact, 2200);
    } else {
      contactFormStatus.style.color = 'var(--color-pink)';
      contactFormStatus.textContent = 'No pudimos enviar el formulario. Probá de nuevo o escribinos por WhatsApp.';
    }
  } catch (err) {
    contactFormStatus.style.display = 'block';
    contactFormStatus.style.color = 'var(--color-pink)';
    contactFormStatus.textContent = 'Error de conexión. Probá de nuevo o escribinos por WhatsApp.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeContact(); });

/* --- Scroll reveal --- */
const revealEls = document.querySelectorAll('.reveal');
const observer  = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => observer.observe(el));

/* ============================================================
   VIDEO POPUP (MODAL) LOGIC
   ============================================================ */
const modal = document.getElementById('videoModal');
const modalInner = document.getElementById('modalInner');
const modalIframe = document.getElementById('modalIframe');
const closeModalBtn = document.getElementById('closeModal');

// Escuchar clics en todos los slides que tengan un data-video-id
document.querySelectorAll('.work-slide[data-video-id]').forEach(slide => {
  slide.addEventListener('click', () => {
    const videoId = slide.dataset.videoId;
    const isVertical = slide.dataset.type === 'vertical';

    // Ajustar el formato del modal si es Reel o YouTube
    if (isVertical) {
      modalInner.classList.add('is-vertical');
    } else {
      modalInner.classList.remove('is-vertical');
    }

    // Inyectar el link de YouTube con autoplay activado
    modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    
    // Mostrar modal y bloquear el scroll de fondo
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

// Función para cerrar
function closeVideoModal() {
  modal.classList.remove('open');
  modalIframe.src = ''; // Limpiar el src detiene la reproducción de YouTube
  document.body.style.overflow = '';
}

// Cerrar al hacer clic en la "X", en el fondo negro o presionando "Escape"
if(closeModalBtn) closeModalBtn.addEventListener('click', closeVideoModal);
if(modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeVideoModal();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
    closeVideoModal();
  }
});