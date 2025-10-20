// 1) Grab DOM elements
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
// The button in the .filters row
const fetchBtn = document.querySelector('.filters button');

// 2) Prepare date pickers (provided helper in dateRange.js)
setupDateInputs(startInput, endInput);

// 3) Your NASA API key
// Use 'DEMO_KEY' for classroom use, or replace with your own free key.
const API_KEY = 'Ln0ThpxAypmUbJZmvq6zA9dMx3JMlEtftDoz9wgz';

// 4) Build the APOD API URL for a date range
function buildApodUrl(start, end) {
  // thumbs=true asks NASA for a thumbnail when the media is a video
  return `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}&thumbs=true`;
}

// 5) Render helper: create one gallery card
function createCard(item) {
  // Some APOD entries are videos. Prefer thumbnail_url if present.
  const imgSrc = item.media_type === 'video'
    ? (item.thumbnail_url || '')
    : item.url;

  // Basic fallback when an image is not available
  const imageHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${item.title}">`
    : `<div class="placeholder" style="padding:20px">No preview available</div>`;

  return `
    <div class="gallery-item">
      ${imageHtml}
      <p style="font-weight:bold; font-size:18px; margin-top:10px;">${item.title}</p>
      <p style="color:#555;">${item.date}</p>
    </div>
  `;
}

// 6) Render the whole gallery
function renderGallery(items) {
  // Clear any existing content
  gallery.innerHTML = '';

  if (!items || items.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">ℹ️</div>
        <p>No results for that range. Try different dates.</p>
      </div>
    `;
    return;
  }

  // APOD returns ascending by date. Reverse to show most recent first.
  const ordered = [...items].reverse();

  // Build all cards and inject into the page
  const cards = ordered.map(createCard).join('');
  gallery.innerHTML = cards;
}

// 7) Show a lightweight loading state
function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">⏳</div>
      <p>Loading images...</p>
    </div>
  `;
}

// 8) Fetch and display APOD entries for the selected range
async function fetchImages() {
  const start = startInput.value;
  const end = endInput.value;

  // Basic guard against empty inputs
  if (!start || !end) return;

  showLoading();
  fetchBtn.disabled = true;

  try {
    const url = buildApodUrl(start, end);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();

    // The API returns either an array or a single object.
    const items = Array.isArray(data) ? data : [data];
    renderGallery(items);
  } catch (err) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Could not load images. ${err.message}</p>
      </div>
    `;
  } finally {
    fetchBtn.disabled = false;
  }
}

// 9) Wire the button to fetch the images
fetchBtn.addEventListener('click', fetchImages);

// 10) Optional: load defaults on page open (the helper already sets last 9 days)
fetchImages();
