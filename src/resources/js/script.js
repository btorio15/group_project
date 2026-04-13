// Category card filter
document.addEventListener('DOMContentLoaded', () => {
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
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
    });
  });

  // Edit modal
  const overlay   = document.getElementById('editModalOverlay');
  const closeBtn  = document.getElementById('editModalClose');
  const cancelBtn = document.getElementById('editModalCancel');
  if (!overlay) return;

  function openEditModal(btn) {
    document.getElementById('editId').value       = btn.dataset.id || '';
    document.getElementById('editName').value     = btn.dataset.name || '';
    document.getElementById('editAddress').value  = btn.dataset.address || '';
    document.getElementById('editImageUrl').value = btn.dataset.imageUrl || '';

    const current = (btn.dataset.amenities || '').split(',').map(a => a.trim());
    document.querySelectorAll('[name="amenities"]').forEach(cb => {
      cb.checked = current.includes(cb.value);
    });

    overlay.classList.add('is-open');
  }

  function closeEditModal() {
    overlay.classList.remove('is-open');
  }

  document.querySelectorAll('.location-card__edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn));
  });

  closeBtn.addEventListener('click', closeEditModal);
  cancelBtn.addEventListener('click', closeEditModal);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeEditModal();
  });

  document.getElementById('editLocationForm').addEventListener('submit', e => {
    e.preventDefault(); // stub — backend not wired yet
    console.log('TODO: POST to /edit route');
    closeEditModal();
  });
});