window.utils = window.utils || {
  copyCode: async (elementId) => {
    const codeElement = document.getElementById(elementId);
    if (!codeElement) return;

    try {
      await navigator.clipboard.writeText(codeElement.innerText);
      const codeBlock = codeElement.closest('.code-block');
      const button = codeBlock?.querySelector('.btn-copy');
      window.utils.flashCopyFeedback(button);
    } catch (err) {
      console.error('Falha ao copiar', err);
    }
  },

  flashCopyFeedback: (button) => {
    if (!button) return;

    const icon = button.querySelector('i');

    if (icon) {
      if (!button.dataset.copyIconClass) {
        button.dataset.copyIconClass = icon.className;
      }

      icon.className = 'ph ph-check';
    }

    button.classList.add('copied');

    if (button._copyFeedbackTimeout) {
      window.clearTimeout(button._copyFeedbackTimeout);
    }

    button._copyFeedbackTimeout = window.setTimeout(() => {
      if (icon && button.dataset.copyIconClass) {
        icon.className = button.dataset.copyIconClass;
      }

      button.classList.remove('copied');
      button._copyFeedbackTimeout = null;
    }, 1000);
  },

  initAnchorLinks: () => {
    document.addEventListener('click', function (event) {
      const target = event.target.closest('a[href^="#"]');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href === '#' || target.hasAttribute('onclick')) return;

      event.preventDefault();
      const sectionId = href.slice(1);
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  },
};

document.addEventListener('DOMContentLoaded', utils.initAnchorLinks);
