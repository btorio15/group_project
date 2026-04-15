// ===== HAMBURGER MENU =====
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.nav-hamburger');
  const nav = document.querySelector('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav--open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
  }
});

// ===== CATEGORY FILTER + KEYBOARD NAV =====
document.addEventListener('DOMContentLoaded', () => {
  const categoryCards = document.querySelectorAll('.category-card');

  function activateCard(card) {
    const wasActive = card.classList.contains('is-active');
    categoryCards.forEach(c => c.classList.remove('is-active'));
    if (!wasActive) card.classList.add('is-active');

    const selected = wasActive ? '' : (card.dataset.amenity || '').toLowerCase();
    document.querySelectorAll('.location-card').forEach(loc => {
      if (!selected) {
        loc.style.display = '';
        return;
      }
      const amenities = (loc.dataset.amenities || '').toLowerCase();
      loc.style.display = amenities.includes(selected) ? '' : 'none';
    });
  }

  categoryCards.forEach(card => {
    card.addEventListener('click', () => activateCard(card));
    // Keyboard: Enter or Space triggers the same action
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateCard(card);
      }
    });
  });

  // ===== EDIT MODAL =====
  const overlay   = document.getElementById('editModalOverlay');
  const closeBtn  = document.getElementById('editModalClose');
  const cancelBtn = document.getElementById('editModalCancel');
  if (!overlay) return;

  let lastFocusedElement = null;

  function openEditModal(btn) {
    lastFocusedElement = btn;

    document.getElementById('editId').value       = btn.dataset.id || '';
    document.getElementById('editName').value     = btn.dataset.name || '';
    document.getElementById('editAddress').value  = btn.dataset.address || '';
    document.getElementById('editImageUrl').value = btn.dataset.imageUrl || '';

    const current = (btn.dataset.amenities || '').split(',').map(a => a.trim());
    document.querySelectorAll('[name="amenities"]').forEach(cb => {
      cb.checked = current.includes(cb.value);
    });

    overlay.classList.add('is-open');

    // Focus the first input when modal opens
    const firstInput = overlay.querySelector('input[type="text"]');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }

  function closeEditModal() {
    overlay.classList.remove('is-open');
    // Restore focus to the button that opened the modal
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  document.querySelectorAll('.location-card__edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn));
  });

  closeBtn.addEventListener('click', closeEditModal);
  cancelBtn.addEventListener('click', closeEditModal);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeEditModal();
  });

  // Close modal with Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeEditModal();
    }
  });

  document.getElementById('editLocationForm').addEventListener('submit', e => {
    // Form will submit normally to /edit
  });
});
