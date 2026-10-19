# Rafael · Serviços digitais

Site pessoal de apresentação de serviços (sites, anúncios, edição de fotos e vídeos).
Feito em HTML, CSS e JavaScript puros: sem dependências e sem etapa de build.

## Rodar localmente

Requer Node.js (qualquer versão recente).

```bash
npm start
# ou
node server.js
```

Acesse **http://localhost:3000**. Para usar outra porta: `PORT=8080 node server.js`.

> Abrir o `index.html` com duplo clique também funciona, mas o botão "Copiar e-mail"
> só aparece quando o site é servido via `http://localhost` ou `https://`.

## Estrutura

```
index.html              Página única (todas as seções, SEO, ícones SVG)
assets/css/styles.css   Estilos (cores em variáveis no topo do arquivo)
assets/js/boot.js       Marca que o JS está ativo (evita "piscar" nas animações)
assets/js/main.js       Menu, abas, formulário, WhatsApp (configuração no topo)
assets/fonts/           Fontes Manrope e Instrument Serif (licença OFL)
assets/img/favicon.svg  Ícone do site
server.js               Servidor local simples
```

## Como o formulário funciona

O site **não tem servidor de envio**. Ao enviar, o formulário valida os campos e abre o
WhatsApp (ou o app de e-mail) com a mensagem já preenchida; o cliente revisa e envia.
Nenhum dado é salvo no site nem colocado na URL da página.

### Opcional: receber o formulário por um serviço externo

1. Crie um formulário em um serviço como Formspree ou Getform e copie a URL de envio.
2. Em `assets/js/main.js`, preencha `formEndpoint: 'https://...'`.
3. No `index.html`, adicione o domínio do serviço em `connect-src` na meta
   `Content-Security-Policy` (ex.: `connect-src 'self' https://formspree.io`).

Assim o botão principal passa a enviar de verdade, e a confirmação só aparece se o serviço
responder com sucesso. O WhatsApp continua como alternativa em caso de erro.

## Publicar

Qualquer hospedagem de sites estáticos serve (Netlify, Vercel, GitHub Pages, Cloudflare Pages
ou uma hospedagem comum): envie o conteúdo da pasta, sem precisar do `server.js` nem do `package.json`.
Depois de ter um domínio, vale adicionar no `<head>` do `index.html`:

```html
<link rel="canonical" href="https://seudominio.com.br/">
<meta property="og:url" content="https://seudominio.com.br/">
```
