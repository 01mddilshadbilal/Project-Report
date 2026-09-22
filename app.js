const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const dataNode = document.getElementById('projectData');
const projects = JSON.parse(dataNode.textContent);

const grid = $('#projectGrid');
const filters = $('#filters');
const overlay = $('#projectOverlay');
const toast = $('#toast');
const toastText = $('#toastText');
let filter = 'all';

const art = {
  android: 'radial-gradient(circle at 75% 25%,rgba(43,232,255,.28),transparent 28%),radial-gradient(circle at 22% 80%,rgba(141,99,255,.17),transparent 30%),linear-gradient(145deg,#08121d,#0c0c14)',
  web: 'radial-gradient(circle at 72% 25%,rgba(255,63,190,.25),transparent 28%),radial-gradient(circle at 20% 75%,rgba(43,232,255,.13),transparent 32%),linear-gradient(145deg,#170b18,#090a12)',
  iot: 'radial-gradient(circle at 25% 25%,rgba(152,255,106,.18),transparent 29%),radial-gradient(circle at 75% 78%,rgba(43,232,255,.18),transparent 30%),linear-gradient(145deg,#081515,#090a10)',
  ai: 'radial-gradient(circle at 72% 22%,rgba(255,63,190,.26),transparent 30%),radial-gradient(circle at 18% 78%,rgba(141,99,255,.22),transparent 31%),linear-gradient(145deg,#120919,#080810)'
};

const categoryNames = { all:'ALL', android:'ANDROID', web:'WEB', iot:'IoT', ai:'AI' };
const categories = ['all', ...new Set(projects.map(p=>p.category))];
filters.innerHTML = categories.map(c => `<button class="filter magnetic ${c==='all'?'active':''}" data-filter="${c}">${categoryNames[c] || c}<b>${c==='all'?projects.length:projects.filter(p=>p.category===c).length}</b></button>`).join('');

function renderProjects(){
  const list = filter==='all' ? projects : projects.filter(p=>p.category===filter);
  grid.innerHTML = list.map((p,i)=>`
    <article class="project-card reveal ${i%2?'delay-1':''}" data-id="${p.id}" style="--art:${art[p.category]||art.android}">
      <div class="project-art ${p.cover?'has-cover':''}">
        <div class="project-code">TDS / ${p.number}</div>
        ${p.cover ? `<img src="${p.cover}" alt="${p.title} project preview" loading="lazy">` : `<div class="project-symbol">${p.symbol}</div>`}
      </div>
      <div class="project-meta"><div class="project-cat">${p.label} • AI ASSISTED</div><div class="project-status">${p.status}</div></div>
      <div class="project-title">${p.title}</div>
      <div class="project-desc">${p.description}</div>
      <div class="project-open">OPEN PROJECT <span>↗</span></div>
    </article>`).join('');
  bindCardEffects();
  observeReveal();
}

function bindCardEffects(){
  $$('.project-card').forEach(card=>{
    card.addEventListener('pointermove', e=>{
      const r=card.getBoundingClientRect();
      card.style.setProperty('--mx',`${((e.clientX-r.left)/r.width)*100}%`);
      card.style.setProperty('--my',`${((e.clientY-r.top)/r.height)*100}%`);
      card.style.transform=`translateY(-7px) rotateX(${((e.clientY-r.top)/r.height-.5)*-4}deg) rotateY(${((e.clientX-r.left)/r.width-.5)*4}deg)`;
    });
    card.addEventListener('pointerleave',()=>card.style.transform='');
    card.addEventListener('click',()=>openProject(card.dataset.id));
  });
}

function openProject(id){
  const p=projects.find(x=>x.id===id); if(!p)return;
  $('#drawerNumber').textContent=String(p.number).padStart(2,'0');
  $('#drawerCategory').textContent=p.label;
  $('#drawerTitle').textContent=p.title;
  $('#drawerDescription').textContent=p.description;
  $('#drawerSymbol').textContent=p.symbol;
  $('#drawerStatus').textContent=p.status;
  $('#drawerTech').innerHTML=p.tech.map(t=>`<span>${t}</span>`).join('');
  $('#drawerFeatures').innerHTML=p.features.map(f=>`<div>${f}</div>`).join('');
  const demo=$('#drawerDemo'), report=$('#drawerReport');
  configureDrawerLink(demo,p.demo);
  configureDrawerLink(report,p.report);
  overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); document.body.classList.add('no-scroll');
  showToast(`${p.title} • project opened`);
}
function closeProject(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll')}
$('#closeDrawer').addEventListener('click',closeProject);
overlay.addEventListener('click',e=>{if(e.target===overlay)closeProject()});

function configureDrawerLink(el,url){
  const available = Boolean(url && url !== '#');
  el.href = available ? url : '#';
  el.classList.toggle('is-disabled',!available);
  el.setAttribute('aria-disabled',String(!available));
  el.tabIndex = available ? 0 : -1;
}



filters.addEventListener('click',e=>{
  const btn=e.target.closest('.filter'); if(!btn)return;
  filter=btn.dataset.filter;
  $$('.filter').forEach(b=>b.classList.toggle('active',b===btn));
  renderProjects();
  showToast(`${categoryNames[filter]||filter} • projects loaded`);
});

/* Intro */
const intro=$('#intro'); let introDone=false;
function enterSite(){if(introDone)return;introDone=true;intro.classList.add('hide');document.body.classList.remove('no-scroll');setTimeout(()=>intro.remove(),950)}
$('#skipIntro').addEventListener('click',()=>{showToast('Welcome to the TDS Project Universe');enterSite()});
document.body.classList.add('no-scroll');
setTimeout(enterSite,3900);

/* Mobile navigation */
$('#menuBtn').addEventListener('click',()=>{
  $('#nav').classList.toggle('open');
  showToast($('#nav').classList.contains('open')?'Navigation opened':'Navigation closed');
});
$$('.nav-link').forEach(a=>a.addEventListener('click',()=>$('#nav').classList.remove('open')));

/* Active navigation */
const sections=[...document.querySelectorAll('main section[id]')];
const navLinks=$$('.nav-link');
const navObserver=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting)navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${en.target.id}`))}),{rootMargin:'-36% 0px -56% 0px'});
sections.forEach(s=>navObserver.observe(s));

/* Scroll reveal */
let revealObserver;
function observeReveal(){
  if(!revealObserver) revealObserver=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('visible');revealObserver.unobserve(en.target)}}),{threshold:.12});
  $$('.reveal:not(.visible)').forEach(el=>revealObserver.observe(el));
}

/* Cursor */
const cursor=$('.cursor-glow');
window.addEventListener('pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});

/* Universal click effect — randomized every click */
document.addEventListener('click',e=>{
  const target=e.target.closest('a,button,.project-card');
  if(!target)return;
  const colors=['#2be8ff','#8d63ff','#ff3fbe','#98ff6a','#ffc76b'];
  const ring=document.createElement('span'); ring.className='ripple';
  const size=12+Math.random()*18;
  ring.style.width=size+'px';ring.style.height=size+'px';
  ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px';
  ring.style.borderColor=colors[Math.floor(Math.random()*colors.length)];
  document.body.appendChild(ring);setTimeout(()=>ring.remove(),700);
});

/* Magnetic buttons */
function bindMagnetic(){
  $$('.magnetic').forEach(el=>{
    if(el.dataset.magneticBound)return;
    el.dataset.magneticBound='1';
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      el.style.transform=`translate(${(e.clientX-(r.left+r.width/2))*.06}px,${(e.clientY-(r.top+r.height/2))*.06}px)`;
    });
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });
}

/* Tilt featured card */
const featured=$('#featuredCard');
featured.addEventListener('pointermove',e=>{
  const r=featured.getBoundingClientRect();
  featured.style.transform=`perspective(1000px) rotateX(${((e.clientY-r.top)/r.height-.5)*-5}deg) rotateY(${((e.clientX-r.left)/r.width-.5)*7}deg) translateY(-6px)`;
});
featured.addEventListener('pointerleave',()=>featured.style.transform='');

/* Featured project cycling */
let featuredIndex=0;
function updateFeatured(){
  const p=projects[featuredIndex%projects.length];
  $('#featuredIndex').textContent=`${String(p.number).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}`;
  $('#featuredCategory').textContent=`${p.label} • AI ASSISTED`;
  $('#featuredTitle').textContent=p.title;
  $('#featuredDesc').textContent=p.description;
  $('#featuredTags').innerHTML=p.tech.slice(0,3).map(t=>`<span>${t}</span>`).join('');
  $('#featuredOpen').dataset.id=p.id;
}
$('#featuredOpen').addEventListener('click',()=>openProject($('#featuredOpen').dataset.id));
setInterval(()=>{featuredIndex=(featuredIndex+1)%projects.length;updateFeatured()},4200);

/* Contact */
const CONTACT_EMAIL='mddilshadbilal@gmail.com';
const WHATSAPP_NUMBER='917654406857';

$('#contactForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('#contactName').value.trim();
  const email=$('#contactSenderEmail').value.trim();
  const message=$('#contactMessage').value.trim();
  const method=$('input[name="contactMethod"]:checked')?.value || 'email';
  const text=`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  if(method==='whatsapp'){
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,'_blank','noopener');
  }else{
    const subject=encodeURIComponent('TDS Tech Solution — Project Inquiry');
    window.location.href=`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(text)}`;
  }
});

/* Escape */
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))closeProject()});

$('#year').textContent=new Date().getFullYear();
updateFeatured();renderProjects();observeReveal();bindMagnetic();
