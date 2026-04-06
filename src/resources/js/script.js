document.addEventListener('DOMContentLoaded', () => {
  const filterSelect = document.getElementById('amenity-filter');
  const cards = Array.from(document.querySelectorAll('.location-card'));

  if (!filterSelect || cards.length === 0) {
    return;
  }

  const normalize = (value) => value.trim().toLowerCase();

  const applyFilter = () => {
    const selectedAmenity = normalize(filterSelect.value);

    cards.forEach((card) => {
      if (!selectedAmenity) {
        card.classList.remove('hidden');
        return;
      }

      const amenities = (card.dataset.amenities || '')
        .split(',')
        .map(normalize);

      const matches = amenities.includes(selectedAmenity);
      card.classList.toggle('hidden', !matches);
    });
  };

  filterSelect.addEventListener('change', applyFilter);
});
