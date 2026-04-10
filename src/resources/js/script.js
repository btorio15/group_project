// Amenity filter
document.addEventListener('DOMContentLoaded', () => {
  const selects = document.querySelectorAll('.amenity-select');
  const amenitySelect = selects[0]; // First select is the amenity filter
  
  if (amenitySelect) {
    amenitySelect.addEventListener('change', () => {
      const selected = amenitySelect.value.toLowerCase();
      const cards = document.querySelectorAll('.location-card');

      cards.forEach(card => {
        if (!selected) {
          card.style.display = '';
          return;
        }
        // data-amenities comes through as a comma-separated string like "Wifi,Restrooms"
        const amenities = (card.dataset.amenities || '').toLowerCase();
        card.style.display = amenities.includes(selected) ? '' : 'none';
      });
    });
  }

  // Category card filter
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('is-active');
      // Deselect all
      categoryCards.forEach(c => c.classList.remove('is-active'));
      // Toggle clicked card
      if (!wasActive) {
        card.classList.add('is-active');
      }
      // Get selected amenity (or empty for "show all")
      const selected = wasActive ? '' : (card.dataset.amenity || '').toLowerCase();
      // Filter location cards
      document.querySelectorAll('.location-card').forEach(loc => {
        if (!selected) {
          loc.style.display = '';
          return;
        }
        const amenities = (loc.dataset.amenities || '').toLowerCase();
        loc.style.display = amenities.includes(selected) ? '' : 'none';
      });
      // Sync the dropdown filter
      if (amenitySelect) {
        amenitySelect.value = wasActive ? '' : (card.dataset.amenity || '');
      }
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