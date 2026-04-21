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
      const wrapper = loc.closest('.location-card-link') || loc;
      if (!selected) {
        wrapper.style.display = '';
        return;
      }
      const amenities = (loc.dataset.amenities || '').toLowerCase();
      wrapper.style.display = amenities.includes(selected) ? '' : 'none';
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
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openEditModal(btn);
    });
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

// ===== RATING FILTER =====
document.addEventListener('DOMContentLoaded', () => {
  const ratingSelect = document.querySelector('.amenity-select:not(.distance-select)');
  if (!ratingSelect) return;

  function filterByRating() {
    const selectedValue = ratingSelect.value;
    let minRating = 0;

    if (selectedValue === '4+ stars') minRating = 4;
    else if (selectedValue === '3+ stars') minRating = 3;

    document.querySelectorAll('.location-card').forEach(card => {
      const ratingText = card.dataset.rating || 'N/A';
      const rating = parseFloat(ratingText);
      const wrapper = card.closest('.location-card-link') || card;

      // Show card if rating meets minimum, or if no valid rating and showing all
      const shouldShow = isNaN(rating) ? minRating === 0 : rating >= minRating;
      wrapper.style.display = shouldShow ? '' : 'none';
    });
  }

  ratingSelect.addEventListener('change', filterByRating);
});

// ===== PROXIMITY / DISTANCE FILTER =====
document.addEventListener('DOMContentLoaded', () => {
  const distanceSelect = document.querySelector('.distance-select');
  const cardsContainer = document.querySelector('.locations-grid__cards');
  if (!distanceSelect || !cardsContainer) return;

  const originalOrder = Array.from(cardsContainer.querySelectorAll('.location-card-link'));
  let userCoords = null;

  function haversineMiles(lat1, lng1, lat2, lng2) {
    const R = 3958.8;
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function formatMiles(miles) {
    return miles < 10 ? `${miles.toFixed(1)} mi` : `${Math.round(miles)} mi`;
  }

  function updateDistancesOnCards() {
    if (!userCoords) return;
    document.querySelectorAll('.location-card').forEach(card => {
      const lat = parseFloat(card.dataset.lat);
      const lng = parseFloat(card.dataset.lng);
      const valueEl = card.querySelector('.location-card__distance-value');
      if (!valueEl || isNaN(lat) || isNaN(lng)) return;
      const miles = haversineMiles(userCoords.lat, userCoords.lng, lat, lng);
      card.dataset.distance = String(miles);
      valueEl.textContent = formatMiles(miles);
    });
  }

  function sortCards(mode) {
    if (mode === 'original') {
      originalOrder.forEach(link => cardsContainer.appendChild(link));
      return;
    }
    const links = Array.from(cardsContainer.querySelectorAll('.location-card-link'));
    links.sort((a, b) => {
      const da = parseFloat(a.querySelector('.location-card')?.dataset.distance);
      const db = parseFloat(b.querySelector('.location-card')?.dataset.distance);
      const aHas = !isNaN(da);
      const bHas = !isNaN(db);
      if (!aHas && !bHas) return 0;
      if (!aHas) return 1;
      if (!bHas) return -1;
      return mode === 'asc' ? da - db : db - da;
    });
    links.forEach(link => cardsContainer.appendChild(link));
  }

  function requestLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          resolve(userCoords);
        },
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
      );
    });
  }

  distanceSelect.addEventListener('change', async () => {
    const value = distanceSelect.value;

    if (value === 'Any distance') {
      sortCards('original');
      return;
    }

    if (!userCoords) {
      try {
        await requestLocation();
        updateDistancesOnCards();
      } catch (err) {
        alert('Unable to access your location. Please allow location access to sort by proximity.');
        distanceSelect.value = 'Any distance';
        return;
      }
    }

    sortCards(value === 'Nearest first' ? 'asc' : 'desc');
  });
});
