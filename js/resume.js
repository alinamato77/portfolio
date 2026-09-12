const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
});
// Fallback if iframe fails
const frame = document.getElementById('pdfFrame');
frame.addEventListener('error', () => {
  frame.style.display = 'none';
  document.getElementById('pdfFallback').style.display = 'block';
});
