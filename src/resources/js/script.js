// Amenity filter
document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('amenity-filter');
  if (!select) return;

  select.addEventListener('change', () => {
    const selected = select.value.toLowerCase();
    const cards = document.querySelectorAll('.location-card');

    cards.forEach(card => {
      if (!selected) {
        // "All amenities" selected — show everything
        card.style.display = '';
        return;
      }

      // data-amenities comes through as a comma-separated string like "Wifi,Restrooms"
      const amenities = (card.dataset.amenities || '').toLowerCase();
      card.style.display = amenities.includes(selected) ? '' : 'none';
    });
  });
});