/* ---------- DATOS DE LA CARTA ----------
   Verificado en Google Maps (pestaña Menú, fotos reales de pizarra) el
   07-09-2026. Las 3 fotos de pizarra fechadas 2021/2023 muestran un
   "menú ejecutivo" real (sopa/ensalada + fondo + postre) con precios que
   subieron de $4.500 (2021) a $5.800-$8.000 (2023) — muy viejos para
   mostrar como precio vigente, así que NINGÚN item trae precio ('p');
   se muestra "Consultar" en vez de inventar un número actual. */
const MENU = {
  ejecutivo: {
    label: 'Menú Ejecutivo',
    groups: [{ title: 'Incluye sopa o ensalada + plato de fondo + postre', items: [
      { n: 'Pollo al Horno' },
      { n: 'Spaghetti Pesto' },
      { n: 'Lentejas' },
      { n: 'Hamburguesa Casera' },
      { n: 'César Pollo' },
      { n: 'Hipocalórico (Atún o Pollo)', v: 1 },
      { n: 'Zapallito Relleno' },
      { n: 'Charquicán con Huevo Frito' },
      { n: 'Agregado: Arroz' },
      { n: 'Agregado: Ensalada' },
      { n: 'Agregado: Papas Doradas' },
    ]}]
  },
  platos: {
    label: 'Platos y Postres',
    groups: [{ title: 'Destacados reales de la carta', items: [
      { n: 'Sopa de Entrada', d: 'Con sopaipilla — uno de los "platos destacados" reales en Google Maps', img: 'fotos/sopa-entrada.jpg' },
      { n: 'Churrasco Italiano', d: 'Otro destacado real de la carta' },
      { n: 'Ravioles' },
      { n: 'Natilla', d: '"Superó con creces" según una reseña real de Google' },
    ]}]
  },
  cafeYte: {
    label: 'Café y Té',
    groups: [{ title: '"Muy buena selección de té" y "buen café" — aspectos destacados reales en Google', items: [
      { n: 'Té en tetera', img: 'fotos/te.jpg' },
      { n: 'Café espresso' },
      { n: 'Cappuccino', img: 'fotos/cafes.jpg' },
      { n: 'Café americano' },
    ]}]
  }
};

const money = n => n ? '$' + n.toLocaleString('es-CL') : 'Consultar';

const tabsEl = document.getElementById('menuTabs');
const panelsEl = document.getElementById('menuPanels');
const catKeys = Object.keys(MENU);

catKeys.forEach((key, i) => {
  const tab = document.createElement('button');
  tab.className = 'menu-tab' + (i===0 ? ' active':'');
  tab.textContent = MENU[key].label;
  tab.addEventListener('click', () => showTab(key));
  tab.dataset.key = key;
  tabsEl.appendChild(tab);

  const panel = document.createElement('div');
  panel.className = 'menu-panel' + (i===0 ? ' active':'');
  panel.id = 'panel-' + key;

  MENU[key].groups.forEach(group => {
    if(group.title){
      const h = document.createElement('div');
      h.className = 'menu-group-title';
      h.textContent = group.title;
      panel.appendChild(h);
    }
    const grid = document.createElement('div');
    grid.className = 'menu-grid';
    group.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'menu-item';
      row.addEventListener('click', () => openModal(item));

      if(item.img){
        const photo = document.createElement('div');
        photo.className = 'menu-item-photo';
        const photoImg = document.createElement('img');
        photoImg.src = item.img;
        photoImg.alt = item.n;
        photo.appendChild(photoImg);
        row.appendChild(photo);
      }

      const textWrap = document.createElement('div');
      textWrap.className = 'menu-item-text';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = item.n;
      textWrap.appendChild(nameSpan);

      if(item.v){
        const vegTag = document.createElement('span');
        vegTag.className = 'veg-tag';
        vegTag.textContent = 'INFO';
        textWrap.appendChild(vegTag);
      }

      if(item.d){
        const descDiv = document.createElement('div');
        descDiv.className = 'desc';
        descDiv.textContent = item.d;
        textWrap.appendChild(descDiv);
      }

      const priceDiv = document.createElement('div');
      priceDiv.className = 'price mono';
      priceDiv.textContent = money(item.p);

      row.appendChild(textWrap);
      row.appendChild(priceDiv);
      grid.appendChild(row);
    });
    panel.appendChild(grid);
  });
  panelsEl.appendChild(panel);
});

function showTab(key){
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.toggle('active', t.dataset.key === key));
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + key));
}

/* ---------- MODAL PRODUCTO ---------- */
let currentItem = null;
function openModal(item){
  currentItem = item;
  document.getElementById('modalName').textContent = item.n;
  document.getElementById('modalPrice').textContent = money(item.p);
  document.getElementById('modalDesc').textContent = item.d || 'Preparado real de la carta de Café Vincent.';
  const photoWrap = document.getElementById('modalPhoto');
  if(item.img){
    photoWrap.innerHTML = '';
    const photoImg = document.createElement('img');
    photoImg.src = item.img;
    photoImg.alt = item.n;
    photoWrap.appendChild(photoImg);
    photoWrap.style.display = 'block';
  } else {
    photoWrap.style.display = 'none';
  }
  toggleModal(true);
}
document.getElementById('modalAddBtn').addEventListener('click', () => {
  addToCart(currentItem);
  toggleModal(false);
  toggleCart(true);
});
function toggleModal(open){ document.getElementById('modalOverlay').classList.toggle('open', open); }

/* ---------- CARRITO ---------- */
let cart = [];
function addToCart(item){
  const existing = cart.find(c => c.n === item.n);
  if(existing){ existing.qty++; } else { cart.push({...item, qty:1}); }
  renderCart();
}
function changeQty(name, delta){
  const line = cart.find(c => c.n === name);
  if(!line) return;
  line.qty += delta;
  if(line.qty <= 0) cart = cart.filter(c => c.n !== name);
  renderCart();
}
function renderCart(){
  const linesEl = document.getElementById('cartLines');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.getElementById('cartCount');
  const totalQty = cart.reduce((s,c) => s + c.qty, 0);
  countEl.textContent = totalQty;
  if(cart.length === 0){
    linesEl.innerHTML = '<p class="cart-empty">Todavía no agregaste nada.</p>';
    totalEl.textContent = 'A consultar';
    return;
  }
  linesEl.innerHTML = '';
  cart.forEach(line => {
    const div = document.createElement('div');
    div.className = 'cart-line';
    div.innerHTML = `
      <div>
        <div class="name">${line.n}</div>
        <div class="qty-ctrl">
          <button class="qty-btn" data-name="${line.n}" data-delta="-1">−</button>
          <span class="mono">${line.qty}</span>
          <button class="qty-btn" data-name="${line.n}" data-delta="1">+</button>
        </div>
      </div>
      <div class="price mono">${money(line.p)}</div>
    `;
    linesEl.appendChild(div);
  });
  totalEl.textContent = 'A consultar';
  linesEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.name, parseInt(btn.dataset.delta)));
  });
}
document.getElementById('cartBtn').addEventListener('click', () => toggleCart(true));
document.getElementById('cartCloseBtn').addEventListener('click', () => toggleCart(false));
function toggleCart(open){ document.getElementById('cartOverlay').classList.toggle('open', open); }

document.getElementById('modalCloseBtn').addEventListener('click', () => toggleModal(false));
[document.getElementById('cartOverlay'), document.getElementById('modalOverlay')].forEach(ov => {
  ov.addEventListener('click', (e) => { if(e.target === ov) ov.classList.remove('open'); });
});

/* ---------- NAV MÓVIL Y NAVEGACIÓN POR PESTAÑAS ---------- */
document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

const panels = document.querySelectorAll('.tab-panel');
function goToTab(tabId){
  panels.forEach(p => p.classList.toggle('active', p.dataset.tabPanel === tabId));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.tab === tabId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('navLinks').classList.remove('open');
  initScrollReveal();
}

document.querySelectorAll('[data-tab]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    goToTab(el.dataset.tab);
  });
});

/* ---------- INDICADOR ABIERTO/CERRADO EN VIVO
   Verificado en Google Maps el 07-09-2026: abre 9:00, cierra 21:00,
   los 7 días de la semana. ---------- */
function updateOpenStatus(dotId, textId){
  const dot = document.getElementById(dotId);
  const text = document.getElementById(textId);
  if(!dot || !text) return;
  const now = new Date();
  const minutes = now.getHours()*60 + now.getMinutes();
  const isOpen = minutes >= (9*60) && minutes < (21*60);
  text.textContent = isOpen ? 'Abierto ahora' : 'Cerrado ahora';
  dot.classList.toggle('closed', !isOpen);
}
updateOpenStatus('statusDot', 'statusText');
updateOpenStatus('statusDot2', 'statusText2');

/* ---------- SCROLL REVEAL (entrada ordenada al hacer scroll) ----------
   Solo agrega/observa animación de entrada — la navegación sigue siendo
   100% por pestañas (SPA), esto NO es sticky-scroll. */
function initScrollReveal(){
  const els = document.querySelectorAll('.reveal:not(.revealed)');
  if(!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el, i) => {
    el.style.transitionDelay = (Math.min(i % 6, 6) * 60) + 'ms';
    io.observe(el);
  });
}
initScrollReveal();

/* ---------- PANTALLA DE CARGA (rápida, <1s) ---------- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
  }, 350);
});
