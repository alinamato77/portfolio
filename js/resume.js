// Fallback if iframe fails
const frame = document.getElementById('pdfFrame');
frame.addEventListener('error', () => {
  frame.style.display = 'none';
  document.getElementById('pdfFallback').style.display = 'block';
});
