// 1) Grab DOM elements
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
// The button in the .filters row
const fetchBtn = document.querySelector('.filters button');

// 2) Prepare date pickers (provided helper in dateRange.js)
setupDateInputs(startInput, endInput);

// 3) Backup APOD data source (NASA API is currently down due to government shutdown)
const APOD_DATA_URL = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// 4) Filter APOD data by date range
function filterApodData(allData, start, end) {
  console.log(`Filtering ${allData.length} items between ${start} and ${end}`);
  
  // Compare date strings directly to avoid timezone issues
  const filtered = allData.filter(item => {
    const isInRange = item.date >= start && item.date <= end;
    if (isInRange) {
      console.log(`Match found: ${item.date}`);
    }
    return isInRange;
  });
  
  console.log(`Filtered to ${filtered.length} items`);
  return filtered;
}

// 5) Render helper: create one gallery card
function createCard(item) {
  // Some APOD entries are videos. Prefer thumbnail_url if present.
  const imgSrc = item.media_type === 'video'
    ? (item.thumbnail_url || '')
    : item.url;

  // Format date as m/d/y
  const formattedDate = formatDate(item.date);

  // Create explanation tooltip
  const explanation = item.explanation || 'No explanation available';

  // Basic fallback when an image is not available
  const imageHtml = imgSrc
    ? `<div class="image-container">
         <img src="${imgSrc}" alt="${item.title}">
       </div>`
    : `<div class="placeholder" style="padding:20px">No preview available</div>`;

  return `
    <div class="gallery-item">
      <div class="tooltip">${explanation}</div>
      ${imageHtml}
      <p style="font-weight:bold; font-size:18px; margin-top:10px;">${item.title}</p>
      <p style="color:#555;">${formattedDate}</p>
    </div>
  `;
}

// Helper function to format date as m/d/y
function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
  const month = date.getMonth() + 1; // getMonth() is 0-indexed
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
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

  console.log(`Fetching images for range: ${start} to ${end}`);
  showLoading();
  fetchBtn.disabled = true;

  try {
    const res = await fetch(APOD_DATA_URL);
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    const allData = await res.json();
    console.log(`Fetched ${allData.length} total items from backup source`);

    // Filter the data by the selected date range
    const items = filterApodData(allData, start, end);
    renderGallery(items);
  } catch (err) {
    console.error('Error:', err);
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
