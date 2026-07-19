const destinations = [
  { city: 'Kyoto After Dark', region: 'Japan', duration: '8 days', price: '$7,900', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', tags: ['Private temples', 'Tea masterclass', 'Ryokan'] },
  { city: 'Lofoten Aurora', region: 'Norway', duration: '6 days', price: '$6,450', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', tags: ['Glass cabins', 'Arctic sailing', 'Northern lights'] },
  { city: 'Sahara Signal', region: 'Morocco', duration: '9 days', price: '$8,300', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80', tags: ['Desert camp', 'Design riads', 'Atlas trek'] },
];

const cards = document.querySelector('#destinationCards');

const escapeHtml = (value) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

cards.innerHTML = destinations.map((destination) => `
  <article class="destination-card">
    <img src="${escapeHtml(destination.image)}" alt="${escapeHtml(`${destination.city}, ${destination.region}`)}" />
    <div class="card-body">
      <div class="card-meta"><span>${escapeHtml(destination.region)}</span><span>${escapeHtml(destination.duration)}</span></div>
      <h3>${escapeHtml(destination.city)}</h3>
      <div class="tag-row">${destination.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      <div class="price-row"><span>from <strong>${escapeHtml(destination.price)}</strong></span><a href="#contact" aria-label="Plan ${escapeHtml(destination.city)}">Plan →</a></div>
    </div>
  </article>
`).join('');

document.querySelector('.lead-form').addEventListener('submit', (event) => {
  event.preventDefault();
  event.currentTarget.querySelector('.form-note').textContent = 'Thanks — a Nexaris concierge will shape your first concept shortly.';
});
