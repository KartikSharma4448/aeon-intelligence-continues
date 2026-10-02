const memoryData = {
  episodic: { index: 'I / EXPERIENCE', title: 'The moments behind\nthe information.', description: 'An experience carries more than a timestamp. Episodic memory connects events with the people, places, and circumstances that gave them meaning.', example: 'Remembering a conversation alongside where it happened and why it mattered.' },
  semantic: { index: 'II / UNDERSTANDING', title: 'Knowledge that grows\nwith experience.', description: 'Semantic memory connects concepts and their relationships. As experience grows, isolated information becomes a more useful model of the world.', example: 'Connecting a new idea to existing knowledge, rather than treating it as an isolated fact.' },
  affective: { index: 'III / SIGNIFICANCE', title: 'Context includes\nwhat matters.', description: 'Affective memory considers the emotional significance of experience. Understanding what matters to someone can make future responses more thoughtful.', example: 'Recognizing that an important milestone deserves a different response than a routine update.' },
  procedural: { index: 'IV / CAPABILITY', title: 'Experience becomes\ncapability.', description: 'Procedural memory represents familiar patterns, habits, and skills. Repeated experience helps shape how a system approaches the next task.', example: 'Carrying forward a familiar workflow while adapting it to a new situation.' }
};
const hostData = {
  workstation: { index: '01', title: 'Room to think deeply.', description: "A workstation offers room for richer models, deeper context, and demanding workloads. AEON's adaptive vision begins with understanding the resources its host can provide.", capacity: 'Extended', priority: 'Depth & performance', bars: 20 },
  wearable: { index: '02', title: 'Context, close at hand.', description: 'Wearables call for a smaller footprint and careful use of energy. The aim is to carry useful personal context into a compact environment while adapting the model to its limits.', capacity: 'Compact', priority: 'Efficiency & proximity', bars: 7 },
  vehicle: { index: '03', title: 'An evolving environment.', description: 'A vehicle brings changing conditions and distributed resources. The vision is an adaptive intelligence that carries relevant context into the journey, with deployment-specific safety requirements.', capacity: 'Distributed', priority: 'Context & responsiveness', bars: 14 },
  habitat: { index: '04', title: 'Intelligence in the everyday.', description: 'An ambient environment can connect multiple devices across a shared space. AEON explores how distributed intelligence could preserve context while respecting the boundaries of each environment.', capacity: 'Shared', priority: 'Coordination & low power', bars: 11 }
};
function wireTabs(selector, callback) {
  const tabs = [...document.querySelectorAll(selector)];
  function activate(tab) {
    tabs.forEach(item => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
    callback(tab);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); activate(tabs[next]); tabs[next].focus(); }
    });
  });
}
let graphAccent = 0;
wireTabs('[data-memory]', tab => {
  const data = memoryData[tab.dataset.memory];
  document.getElementById('memory-index').textContent = data.index;
  const title = document.getElementById('memory-title');
  title.replaceChildren(...data.title.split('\n').flatMap((part, index) => index ? [document.createElement('br'), document.createTextNode(part)] : [document.createTextNode(part)]));
  document.getElementById('memory-description').textContent = data.description;
  document.getElementById('memory-example').textContent = data.example;
  document.getElementById('memory-panel').setAttribute('aria-labelledby', tab.id);
  graphAccent = Object.keys(memoryData).indexOf(tab.dataset.memory);
  drawGraph(performance.now());
  enterPanel(document.getElementById('memory-panel'));
});
wireTabs('[data-host]', tab => {
  const data = hostData[tab.dataset.host];
  ['index', 'title', 'description', 'capacity', 'priority'].forEach(key => { document.getElementById('host-' + key).textContent = data[key]; });
  document.getElementById('host-panel').setAttribute('aria-labelledby', tab.id);
  document.querySelectorAll('.resource-bars i').forEach((bar, index) => bar.classList.toggle('inactive', index >= data.bars));
  enterPanel(document.querySelector('.host-copy'));
  if (!reducedMotion.matches) document.querySelectorAll('.resource-bars i').forEach((bar, index) => {
    bar.getAnimations().forEach(animation => animation.cancel());
    bar.animate([{ transform: 'scaleY(.25)' }, { transform: 'scaleY(1)' }], { duration: 480, delay: index * 16, easing: 'cubic-bezier(.22,1,.36,1)' });
  });
});
const menu = document.querySelector('.menu-button');
const navigation = document.getElementById('navigation');
menu.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); }));
document.addEventListener('keydown', event => { if (event.key === 'Escape') { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); } });
const dialog = document.getElementById('access-dialog');
let lastTrigger;
document.querySelectorAll('.access-trigger').forEach(button => button.addEventListener('click', () => { lastTrigger = button; document.getElementById('form-status').textContent = ''; dialog.showModal(); enterPanel(dialog); document.getElementById('full-name').focus(); }));
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
dialog.addEventListener('close', () => lastTrigger?.focus());
document.getElementById('inquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const text = ['AEON / Inquiry', '', 'Name: ' + form.get('name'), 'Email: ' + form.get('email'), 'Interest: ' + form.get('interest'), '', 'Context:', form.get('message'), '', 'Prepared: ' + new Date().toISOString()].join('\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'aeon-inquiry.txt'; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.getElementById('form-status').textContent = 'Your inquiry is ready in your downloads. Nothing has been sent.';
});
document.getElementById('year').textContent = new Date().getFullYear();
const sectionObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { navigation.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id)); } }); }, { rootMargin: '-20% 0px -55% 0px' });
['vision', 'memory', 'continuity', 'questions'].forEach(id => sectionObserver.observe(document.getElementById(id)));
const canvas = document.getElementById('memory-canvas');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let graphWidth = 0, graphHeight = 0, graphVisible = false;
const nodes = Array.from({ length: 68 }, (_, index) => {
  const angle = index * 2.399963;
  const radius = Math.sqrt((index + 6) / 74) * .43;
  return { x: .5 + Math.cos(angle) * radius, y: .5 + Math.sin(angle) * radius, group: index % 4, phase: index * .7 };
});
function resizeGraph() {
  const bounds = canvas.getBoundingClientRect(); graphWidth = bounds.width; graphHeight = bounds.height;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(graphWidth * ratio); canvas.height = Math.round(graphHeight * ratio); ctx.setTransform(ratio, 0, 0, ratio, 0, 0); drawGraph(performance.now());
}
function drawGraph(time) {
  ctx.clearRect(0, 0, graphWidth, graphHeight);
  const points = nodes.map(node => ({ x: node.x * graphWidth + (reducedMotion.matches ? 0 : Math.sin(time / 3000 + node.phase) * 3), y: node.y * graphHeight + (reducedMotion.matches ? 0 : Math.cos(time / 3500 + node.phase) * 3), group: node.group }));
  points.forEach((a, i) => {
    points.slice(i + 1).forEach((b, edgeIndex) => {
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < graphWidth * .205) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = a.group === graphAccent && b.group === graphAccent ? 'rgba(228,72,53,.36)' : 'rgba(91,109,120,.16)'; ctx.lineWidth = .7; ctx.stroke(); }
      if (!reducedMotion.matches && distance < graphWidth * .205 && a.group === graphAccent && (i + edgeIndex) % 13 === 0) {
        const progress = ((time / 2200 + i * .14) % 1);
        ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * progress, a.y + (b.y - a.y) * progress, 2, 0, Math.PI * 2); ctx.fillStyle = '#e44835'; ctx.fill();
      }
    });
    ctx.beginPath(); ctx.arc(a.x, a.y, a.group === graphAccent ? 3 : 1.8, 0, Math.PI * 2); ctx.fillStyle = a.group === graphAccent ? '#e44835' : '#7a8b97'; ctx.fill();
  });
}
new ResizeObserver(resizeGraph).observe(canvas);
let graphFrame;
function animate(time) {
  graphFrame = undefined;
  if (!graphVisible || document.hidden || reducedMotion.matches) return;
  drawGraph(time); graphFrame = requestAnimationFrame(animate);
}
function resumeGraph() { if (graphFrame === undefined && graphVisible && !document.hidden && !reducedMotion.matches) graphFrame = requestAnimationFrame(animate); }
new IntersectionObserver(entries => { graphVisible = entries[0].isIntersecting; resumeGraph(); }).observe(canvas);
document.addEventListener('visibilitychange', resumeGraph);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) document.getAnimations().forEach(animation => animation.cancel());
  drawGraph(performance.now()); resumeGraph(); updatePageMotion();
});

function enterPanel(element) {
  if (reducedMotion.matches) return;
  element.getAnimations().forEach(animation => animation.cancel());
  element.animate([{ opacity: .4, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    revealObserver.unobserve(entry.target);
    if (!reducedMotion.matches) entry.target.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 750, delay: Number(entry.target.dataset.revealDelay || 0), easing: 'cubic-bezier(.22,1,.36,1)' });
  });
}, { threshold: .12 });
document.querySelectorAll('.section-label, .vision-body, .section-heading, .memory-layout, .host-selector, .host-panel, .reflection-intro, .reflection-steps, .faq-list, .access-content').forEach(element => {
  if (!element.closest('.hero, dialog') && !element.parentElement.closest('.reflection-intro')) revealObserver.observe(element);
});
document.querySelectorAll('.feature-row article').forEach((element, index) => { element.dataset.revealDelay = String(index * 100); revealObserver.observe(element); });
if (!reducedMotion.matches) document.querySelectorAll('.hero-content > *').forEach((element, index) => {
  element.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 850, delay: index * 100, fill: 'backwards', easing: 'cubic-bezier(.22,1,.36,1)' });
});
document.querySelectorAll('.reflection-steps, .faq-list').forEach((group, index) => {
  const panels = [...group.querySelectorAll('details')];
  panels.forEach(panel => {
    panel.setAttribute('name', `aeon-accordion-${index}`);
    panel.addEventListener('toggle', () => {
      if (!panel.open) return;
      // Keep exclusivity in browsers without native details grouping.
      panels.forEach(sibling => { if (sibling !== panel) sibling.open = false; });
      enterPanel(panel.querySelector('p'));
    });
  });
});

const header = document.querySelector('.header');
const hero = document.querySelector('.hero');
const readingProgress = document.createElement('div');
readingProgress.className = 'reading-progress'; readingProgress.setAttribute('aria-hidden', 'true'); header.appendChild(readingProgress);
let motionFrame, pointerX = 0, pointerY = 0;
function updatePageMotion() {
  motionFrame = undefined;
  const distance = document.documentElement.scrollHeight - innerHeight;
  readingProgress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0})`;
  header.classList.toggle('is-scrolled', scrollY > 20);
  hero.style.setProperty('--hero-x', reducedMotion.matches ? '0px' : `${pointerX}px`);
  hero.style.setProperty('--hero-y', reducedMotion.matches ? '0px' : `${pointerY}px`);
}
function queuePageMotion() { if (motionFrame === undefined) motionFrame = requestAnimationFrame(updatePageMotion); }
addEventListener('scroll', queuePageMotion, { passive: true });
addEventListener('resize', queuePageMotion, { passive: true });
hero.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
  const bounds = hero.getBoundingClientRect();
  pointerX = ((event.clientX - bounds.left) / bounds.width - .5) * 10;
  pointerY = ((event.clientY - bounds.top) / bounds.height - .5) * 8;
  queuePageMotion();
}, { passive: true });
hero.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; queuePageMotion(); });
updatePageMotion();
