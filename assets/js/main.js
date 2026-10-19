/* ==========================================================================
   Rafael · Serviços digitais — interações da página
   ========================================================================== */
(() => {
  'use strict';

  const CONFIG = {
    whatsapp: '5564992938611',
    email: 'rafael.origenes10@gmail.com',
    // Opcional: URL de um serviço de envio de formulários (ex.: Formspree, Getform).
    // Vazio = o formulário abre o WhatsApp/e-mail com a mensagem pronta (nenhum dado é enviado a servidores).
    // Se preencher, adicione o domínio do serviço em "connect-src" na meta Content-Security-Policy do index.html.
    formEndpoint: ''
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const hasIO = 'IntersectionObserver' in window;

  /* ---------- Cabeçalho: sombra ao rolar ---------- */
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const toggle = $('.nav-toggle');
  const nav = $('#menu');
  const mobileMq = window.matchMedia('(max-width: 1080px)');

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    $('use', toggle).setAttribute('href', open ? '#i-close' : '#i-menu');
  };
  const isMenuOpen = () => nav.classList.contains('is-open');

  toggle.addEventListener('click', () => setMenu(!isMenuOpen()));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => {
    if (isMenuOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen()) { setMenu(false); toggle.focus(); }
  });
  mobileMq.addEventListener('change', (e) => { if (!e.matches) setMenu(false); });

  /* ---------- Link ativo no menu conforme a seção ---------- */
  const navLinks = $$('.nav__link');
  const setActive = (id) => {
    navLinks.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  };
  if (hasIO) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  }

  /* ---------- Revelar elementos ao rolar ---------- */
  const reveals = $$('[data-reveal]');
  if (hasIO) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Links antigos das abas (#svc-...) levam às novas seções ---------- */
  const legacy = { "svc-sites": "planos", "svc-anuncios": "anuncios", "svc-fotos": "fotos", "svc-videos": "videos", "svc-personalizados": "personalizados" };
  const legacyTarget = legacy[decodeURIComponent(location.hash.slice(1))];
  if (legacyTarget) {
    history.replaceState(null, "", "#" + legacyTarget);
    requestAnimationFrame(() => document.getElementById(legacyTarget).scrollIntoView());
  }

  /* ---------- Formulário de orçamento ---------- */
  const form = $('#quote-form');
  const fields = {
    nome: $('#f-nome'),
    empresa: $('#f-empresa'),
    whatsapp: $('#f-whatsapp'),
    email: $('#f-email'),
    servico: $('#f-servico'),
    descricao: $('#f-descricao'),
    prazo: $('#f-prazo')
  };
  const btnSubmit = $('[data-action="whatsapp"]', form);
  const btnEmail = $('[data-action="email"]', form);
  const statusBox = $('.form__status', form);
  const counter = $('[data-count]', form);

  btnSubmit.disabled = false;
  btnEmail.disabled = false;
  if (CONFIG.formEndpoint) {
    $('[data-submit-label]', btnSubmit).textContent = 'Enviar solicitação';
    $('use', btnSubmit).setAttribute('href', '#i-arrow');
  }

  // Pré-seleciona o serviço ao clicar em "Solicitar orçamento"
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-service]');
    if (!link || !link.dataset.service) return;
    const sel = fields.servico;
    if (![...sel.options].some((o) => o.value === link.dataset.service)) return;
    sel.value = link.dataset.service;
    setError(sel, '');
    sel.classList.remove('is-highlight');
    void sel.offsetWidth; // reinicia a animação
    sel.classList.add('is-highlight');
  });

  const digits = (v) => v.replace(/\D/g, '');

  const formatPhone = (value) => {
    let d = digits(value);
    if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return value.trim();
  };

  const validators = {
    nome: (v) => (v.trim().length >= 2 ? '' : 'Informe seu nome.'),
    whatsapp: (v) => {
      const n = digits(v).length;
      if (!n) return 'Informe seu WhatsApp para eu poder responder.';
      return n >= 10 && n <= 13 ? '' : 'Informe um número válido com DDD, por exemplo (64) 99999-9999.';
    },
    email: (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Confira o e-mail informado ou deixe o campo em branco.'),
    servico: (v) => (v ? '' : 'Selecione o serviço desejado.'),
    descricao: (v) => (v.trim().length >= 10 ? '' : 'Descreva o projeto em poucas palavras (mínimo de 10 caracteres).'),
    prazo: (v) => (v ? '' : 'Selecione o prazo desejado.')
  };

  function setError(input, message) {
    const box = document.getElementById(`e-${input.name}`);
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    if (box) box.textContent = message;
  }

  const validateField = (name) => {
    const input = fields[name];
    const msg = validators[name] ? validators[name](input.value) : '';
    setError(input, msg);
    return !msg;
  };

  const validateAll = () => {
    let firstInvalid = null;
    Object.keys(validators).forEach((name) => {
      if (!validateField(name) && !firstInvalid) firstInvalid = fields[name];
    });
    return firstInvalid;
  };

  // Validação em tempo real depois que o campo foi tocado
  Object.keys(validators).forEach((name) => {
    const input = fields[name];
    input.addEventListener('blur', () => {
      if (name === 'whatsapp' && input.value) input.value = formatPhone(input.value);
      if (input.value || input.hasAttribute('aria-invalid')) validateField(name);
    });
    const live = () => { if (input.hasAttribute('aria-invalid')) validateField(name); };
    input.addEventListener('input', live);
    input.addEventListener('change', live);
  });

  fields.whatsapp.addEventListener('input', () => {
    const clean = fields.whatsapp.value.replace(/[^\d()+\-\s]/g, '');
    if (clean !== fields.whatsapp.value) fields.whatsapp.value = clean;
  });

  const updateCount = () => { counter.textContent = String(fields.descricao.value.length); };
  fields.descricao.addEventListener('input', updateCount);
  updateCount();

  const collect = () => {
    const sel = fields.servico;
    return {
      nome: fields.nome.value.trim(),
      empresa: fields.empresa.value.trim(),
      whatsapp: formatPhone(fields.whatsapp.value),
      email: fields.email.value.trim(),
      servico: sel.value ? sel.options[sel.selectedIndex].text : '',
      descricao: fields.descricao.value.trim().replace(/\n{3,}/g, '\n\n'),
      prazo: fields.prazo.value
    };
  };

  const buildMessage = (d, rich) => {
    const b = (s) => (rich ? `*${s}*` : s);
    const lines = [
      'Olá, Rafael! Vim pelo seu site e gostaria de solicitar um orçamento.',
      '',
      `${b('Nome:')} ${d.nome}`
    ];
    if (d.empresa) lines.push(`${b('Empresa:')} ${d.empresa}`);
    lines.push(`${b('WhatsApp:')} ${d.whatsapp}`);
    if (d.email) lines.push(`${b('E-mail:')} ${d.email}`);
    lines.push(`${b('Serviço:')} ${d.servico}`, `${b('Prazo desejado:')} ${d.prazo}`, '', b('Sobre o projeto:'), d.descricao);
    return lines.join('\n');
  };

  // Mensagens de status montadas via DOM (nunca com innerHTML de dados do usuário)
  const showStatus = (type, parts) => {
    statusBox.hidden = false;
    statusBox.className = `form__status form__status--${type}`;
    statusBox.replaceChildren(...parts.map((p) => {
      if (typeof p === 'string') return document.createTextNode(p);
      const a = document.createElement('a');
      a.href = p.href;
      a.textContent = p.text;
      if (p.external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      return a;
    }));
  };

  const waUrl = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

  const openWhatsApp = (data) => {
    const url = waUrl(buildMessage(data, true));
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
    showStatus('ok', [
      'O WhatsApp foi aberto com sua mensagem pronta. Para concluir, confira os dados e toque em enviar por lá. Não abriu? ',
      { href: url, text: 'Abrir o WhatsApp', external: true },
      '.'
    ]);
  };

  const openEmail = (data) => {
    const subject = `Pedido de orçamento — ${data.servico}`;
    const url = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildMessage(data, false))}`;
    window.location.href = url;
    showStatus('ok', [
      'Seu aplicativo de e-mail deve abrir com a mensagem pronta para você enviar. Se nada acontecer, escreva para ',
      { href: `mailto:${CONFIG.email}`, text: CONFIG.email },
      ' ou ',
      { href: waUrl(buildMessage(data, true)), text: 'envie pelo WhatsApp', external: true },
      '.'
    ]);
  };

  const sendToEndpoint = async (data) => {
    const label = $('[data-submit-label]', btnSubmit);
    btnSubmit.disabled = true;
    label.textContent = 'Enviando…';
    try {
      const res = await fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showStatus('ok', ['Solicitação enviada! Vou responder pelo WhatsApp informado assim que possível.']);
      form.reset();
      updateCount();
    } catch (err) {
      showStatus('error', [
        'Não foi possível enviar agora. Você pode ',
        { href: waUrl(buildMessage(data, true)), text: 'enviar pelo WhatsApp', external: true },
        ' sem perder o que escreveu.'
      ]);
    } finally {
      btnSubmit.disabled = false;
      label.textContent = 'Enviar solicitação';
    }
  };

  const handle = (channel) => {
    const firstInvalid = validateAll();
    if (firstInvalid) {
      showStatus('error', ['Confira os campos destacados antes de enviar.']);
      firstInvalid.focus();
      return;
    }
    fields.whatsapp.value = formatPhone(fields.whatsapp.value);
    const data = collect();
    if (channel === 'email') openEmail(data);
    else if (CONFIG.formEndpoint) sendToEndpoint(data);
    else openWhatsApp(data);
  };

  form.addEventListener('submit', (e) => { e.preventDefault(); handle('whatsapp'); });
  btnEmail.addEventListener('click', () => handle('email'));

  /* ---------- Projetos personalizados: ideia direto no WhatsApp ---------- */
  const ideaForm = $('#idea-form');
  if (ideaForm) {
    const idea = $('#f-ideia');
    const ideaBtn = $('button[type="submit"]', ideaForm);
    const ideaStatus = $('.form__status', ideaForm);
    const ideaCount = $('[data-idea-count]', ideaForm);
    const ideaError = $('#e-ideia');
    const checkIdea = () => {
      const msg = idea.value.trim().length >= 10 ? '' : 'Descreva sua ideia em poucas palavras (mínimo de 10 caracteres).';
      if (msg) idea.setAttribute('aria-invalid', 'true'); else idea.removeAttribute('aria-invalid');
      ideaError.textContent = msg;
      return !msg;
    };
    ideaBtn.disabled = false;
    idea.addEventListener('input', () => {
      ideaCount.textContent = String(idea.value.length);
      if (idea.hasAttribute('aria-invalid')) checkIdea();
    });
    ideaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!checkIdea()) { idea.focus(); return; }
      const text = 'Olá, Rafael! Vim pelo seu site e gostaria de solicitar um orçamento de um projeto personalizado.\n\n*Minha ideia:*\n'
        + idea.value.trim().replace(/\n{3,}/g, '\n\n');
      const url = waUrl(text);
      const win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;
      const link = document.createElement('a');
      link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Abrir o WhatsApp';
      ideaStatus.hidden = false;
      ideaStatus.className = 'form__status form__status--ok';
      ideaStatus.replaceChildren('O WhatsApp foi aberto com sua ideia escrita. Para concluir, confira e toque em enviar por lá. Não abriu? ', link, '.');
    });
  }

  /* ---------- Copiar e-mail ---------- */
  $$('[data-copy]').forEach((btn) => {
    if (!navigator.clipboard || !window.isSecureContext) return;
    btn.hidden = false;
    const label = $('[data-copy-label]', btn);
    label.setAttribute('aria-live', 'polite');
    let timer;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = 'Copiado!';
        btn.classList.add('is-done');
      } catch {
        label.textContent = 'Não foi possível copiar';
      }
      clearTimeout(timer);
      timer = setTimeout(() => { label.textContent = 'Copiar'; btn.classList.remove('is-done'); }, 2200);
    });
  });

  /* ---------- Botão flutuante do WhatsApp ---------- */
  const fab = $('[data-wa-float]');
  if (fab) {
    fab.setAttribute('aria-hidden', 'true');
    const blockers = new Set();
    const hero = $('#inicio');
    const update = () => {
      const show = window.scrollY > hero.offsetHeight * 0.7 && blockers.size === 0;
      fab.classList.toggle('is-visible', show);
      fab.tabIndex = show ? 0 : -1;
      if (show) fab.removeAttribute('aria-hidden'); else fab.setAttribute('aria-hidden', 'true');
    };
    if (hasIO) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) blockers.add(en.target); else blockers.delete(en.target); });
        update();
      });
      [$('.quote__card'), $('.custom__form'), $('#contato'), $('.footer')].forEach((el) => el && io.observe(el));
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- Ano no rodapé ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
