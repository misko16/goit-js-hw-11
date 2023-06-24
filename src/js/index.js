import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

const API_KEY = '37763432-319a8e0ed827dc5543f3404e4';
const BASE_URL = `https://pixabay.com/api/?key=${API_KEY}`;

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

let currentPage = 1;
const perPage = 40;

searchForm.addEventListener('submit', handleSearchSubmit);

loadMoreBtn.addEventListener('click', handleLoadMore);

async function handleSearchSubmit(e) {
  e.preventDefault();
  const searchQuery = e.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    return;
  }

  clearGallery();
  currentPage = 1;
  await fetchImages(searchQuery);
}

async function handleLoadMore() {
  const searchQuery = searchForm.elements.searchQuery.value.trim();
  await fetchImages(searchQuery);
}

async function fetchImages(searchQuery) {
  try {
    const response = await axios.get(
      `${BASE_URL}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=${perPage}`
    );
    const { hits, totalHits } = response.data;

    if (hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    } else {
      renderImages(hits);
      currentPage++;

      if (currentPage > Math.ceil(totalHits / perPage)) {
        loadMoreBtn.style.display = 'none';
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      } else {
        loadMoreBtn.style.display = 'block';
      }

      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);

      lightbox.refresh();
    }
  } catch (error) {
    console.error('Error:', error);
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
  }
}

function renderImages(images) {
  const galleryHTML = images
    .map(
      (image) => `
      <div class="photo-card">
        <a href="${image.largeImageURL}">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${image.likes}</p>
          <p class="info-item"><b>Views:</b> ${image.views}</p>
          <p class="info-item"><b>Comments:</b> ${image.comments}</p>
          <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
        </div>
      </div>
    `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', galleryHTML);
}

function clearGallery() {
  gallery.innerHTML = '';
}

loadMoreBtn.style.display = 'none';
