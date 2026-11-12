const $=(s,p=document)=>p.querySelector(s); const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const transition=$('.page-transition');
window.addEventListener('scroll',()=>$('.header')?.classList.toggle('scrolled',scrollY>30));
$('.menu')?.addEventListener('click',()=>$('.navlinks')?.classList.toggle('open'));
$$('a[href]').forEach(a=>{const href=a.getAttribute('href'); if(href&&href.endsWith('.html')) a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey) return; e.preventDefault(); transition?.classList.add('show'); setTimeout(()=>location.href=href,330)})});
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('visible')),{threshold:.12}); $$('.reveal').forEach(x=>io.observe(x));
const slides=$$('.hero-slide'); let slide=0; const showSlide=n=>slides.forEach((s,i)=>s.style.opacity=i===n?'1':'0'); if(slides.length){showSlide(0); setInterval(()=>{slide=(slide+1)%slides.length;showSlide(slide)},5500)}
$$('[data-lightbox]').forEach(el=>el.addEventListener('click',()=>{$('.lightbox img').src=el.dataset.lightbox;$('.lightbox').classList.add('open')})); $('.lightbox')?.addEventListener('click',e=>{if(e.target.closest('img'))return;$('.lightbox').classList.remove('open')});
const form=$('#contactForm'); const toast=$('.toast'); form?.addEventListener('submit',e=>{e.preventDefault(); const data=new FormData(form); const email='rev.event.agency@gmail.com'; const subject=encodeURIComponent(`Заявка с сайта R.E.V.: ${data.get('type')||'событие'}`); const body=encodeURIComponent(`Имя: ${data.get('name')}\nКомпания: ${data.get('company')}\nEmail: ${data.get('email')}\nТип события: ${data.get('type')}\nСообщение: ${data.get('message')}`); window.location.href=`mailto:${email}?subject=${subject}&body=${body}`; if(toast){toast.textContent='Откроется почтовый клиент для отправки заявки.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),4500)}});
$$('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());

/* ===== Регистрация на событие ===== */
(()=>{
const modal=$('#regModal'); if(!modal) return;
const EVENT='Мини-хакатон для школы Большого Физтеха', KEY='rev_event_regs_hackathon', MAIL='rev.event.agency@gmail.com';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []}};
const save=a=>{try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}};
const counter=$('#regCount'), form=$('#regForm'), err=$('#regError');
const paint=()=>{const n=load().length; if(counter) counter.textContent=n?`Зарегистрировано с этого устройства: ${n}`:''};
const open=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');$('#regFormWrap').hidden=false;$('#regDone').hidden=true};
const close=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')};
$$('[data-register]').forEach(b=>b.addEventListener('click',open));
$$('.modal-close,[data-close]',modal).forEach(b=>b.addEventListener('click',close));
modal.addEventListener('click',e=>{if(e.target===modal)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
form.addEventListener('submit',async e=>{
  e.preventDefault(); err.textContent='';
  const d=Object.fromEntries(new FormData(form));
  if(d._honey) return;
  if(!d.name.trim()||!/^\S+@\S+\.\S+$/.test(d.email)){err.textContent='Проверьте имя и email.';return}
  if(!form.consent.checked){err.textContent='Нужно согласие на обработку данных.';return}
  const regs=load();
  if(regs.some(r=>r.email.toLowerCase()===d.email.toLowerCase())){err.textContent='Этот email уже зарегистрирован.';return}
  const rec={name:d.name.trim(),email:d.email.trim(),phone:(d.phone||'').trim(),role:d.role,date:new Date().toISOString()};
  regs.push(rec); save(regs); paint();
  const btn=form.querySelector('button[type=submit]'); btn.disabled=true; btn.textContent='Отправляем…';
  let sent=false;
  try{
    const r=await fetch('https://formsubmit.co/ajax/'+MAIL,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({
      _subject:'Новая регистрация: '+EVENT,_template:'table',_captcha:'false',
      _autoresponse:`Здравствуйте, ${rec.name}! Вы зарегистрированы на событие «${EVENT}». Подробности мы пришлём на этот адрес. — команда R.E.V.`,
      'Событие':EVENT,'Имя':rec.name,'email':rec.email,'Телефон':rec.phone||'—','Роль':rec.role})});
    const j=await r.json(); sent=r.ok&&String(j.success)!=='false';
  }catch(x){sent=false}
  btn.disabled=false; btn.textContent='Подтвердить регистрацию →';
  $('#regFormWrap').hidden=true; $('#regDone').hidden=false;
  $('#regDoneText').textContent=sent
    ? `Спасибо, ${rec.name}! Заявка отправлена организаторам, а на ${rec.email} придёт письмо с подтверждением.`
    : `Спасибо, ${rec.name}! Заявка сохранена на этом устройстве, но письмо отправить не удалось. Напишите нам на ${MAIL}, чтобы подтвердить участие.`;
  form.reset();
});
paint();
})();
