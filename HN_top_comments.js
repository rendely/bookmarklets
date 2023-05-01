javascript:(() => {
  const t = document.querySelectorAll('table td:not([indent="0"])[indent]'); 
  t.forEach(t => {
    const tr = t.closest('tr.comtr');
    tr.remove();
  })
})();