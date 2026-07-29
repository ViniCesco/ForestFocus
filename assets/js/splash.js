// Tempo de exibição da Splash Screen em milissegundos (2,2 segundos)
const SPLASH_TIME = 3200;

setTimeout(() => {
  // Redireciona para o Dashboard (index.html)
  window.location.href = 'pages/dashboard.html';
}, SPLASH_TIME);