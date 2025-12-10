// scripts/quiz.js
// Sencillo manejador del quiz (5 preguntas de opción única).
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quiz-arte');
  if (!form) return;

  const submitBtn = form.querySelector('#quiz-submit');
  const resetBtn = form.querySelector('#quiz-reset');
  const resultBox = document.getElementById('quiz-result');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const questions = Array.from(form.querySelectorAll('.quiz-question'));
    let correctCount = 0;
    const formData = new FormData(form);

    // Validación: si alguna pregunta no respondida, marcarla y avisar
    let firstUnanswered = null;
    for (const q of questions) {
      const name = q.dataset.name;
      if (!formData.has(name)) {
        firstUnanswered = firstUnanswered || q;
        q.classList.remove('correct');
        q.classList.add('incorrect');
        const fb = q.querySelector('.quiz-feedback');
        if (fb) fb.textContent = 'No respondida.';
      }
    }
    if (firstUnanswered) {
      firstUnanswered.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      resultBox.innerHTML = 'Por favor responde todas las preguntas antes de enviar.';
      return;
    }

    // Evaluar cada pregunta
    questions.forEach((q) => {
      const name = q.dataset.name;
      const correct = String(q.dataset.correct || '').trim();
      const correctText = q.getAttribute('data-correct-text') || correct;
      const selected = formData.get(name);

      const fb = q.querySelector('.quiz-feedback') || (() => {
        const el = document.createElement('div');
        el.className = 'quiz-feedback';
        q.appendChild(el);
        return el;
      })();

      // limpiar clases previas
      q.classList.remove('correct', 'incorrect');
      fb.textContent = '';

      if (selected === correct) {
        q.classList.add('correct');
        fb.textContent = 'Correcto.';
        correctCount++;
      } else {
        q.classList.add('incorrect');
        fb.textContent = `Incorrecto. Respuesta correcta: ${correctText}.`;
      }

      // desactivar inputs para evitar cambios tras enviar
      q.querySelectorAll('input').forEach(i => i.disabled = true);
    });

    const total = questions.length;
    const pct = Math.round((correctCount / total) * 100);
    let msg = `<strong>Puntuación:</strong> ${correctCount} / ${total} (${pct}%). `;
    if (pct === 100) msg += '¡Perfecto!';
    else if (pct >= 70) msg += '¡Bien hecho!';
    else msg += 'Puedes intentarlo de nuevo.';

    resultBox.innerHTML = msg;
    if (!reduceMotion) {
      resultBox.animate([
        { transform: 'translateY(-6px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ], { duration: 350, easing: 'ease-out' });
    }

    submitBtn.disabled = true;
    resetBtn.style.display = 'inline-block';
  });

  // Reset para reintentar
  resetBtn.addEventListener('click', () => {
    const questions = Array.from(form.querySelectorAll('.quiz-question'));
    questions.forEach(q => {
      q.classList.remove('correct', 'incorrect');
      q.querySelectorAll('input').forEach(i => {
        i.disabled = false;
        if (i.type === 'radio') i.checked = false;
      });
      const fb = q.querySelector('.quiz-feedback');
      if (fb) fb.textContent = '';
    });
    resultBox.textContent = '';
    submitBtn.disabled = false;
    resetBtn.style.display = 'none';
    // opcional: volver al inicio del quiz
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});