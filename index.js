const apiKey = "3bb7305e80ce799c4ac19090cc29631b";
const imgApi = "https://image.tmdb.org/t/p/w1280";
const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`
const form = document.getElementById("search-form");
const query = document.getElementById("search-input");
const result = document.getElementById("result");

let page = 1;
let isSearching = false;

function prevPage() {
  page = page - 1;
  init();
}

function nextPage() {
  page = page + 1;
  init();
}

//Fetch JSON data from url
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    return null;
  }
}

//Fetch aand show results based on url 
async function fetchAndShowResult(url) {
  const data = await fetchData(url);
  if (data && data.results) {
    showResults(data.results);
  }
}

//create Movie card html template
function createMovieCard(movie) {
  const { poster_path, original_title, id, release_date, overview } = movie;
  const imagePath = poster_path ? imgApi + poster_path : "./img-01.jpeg";
  const truncatedTitle = original_title.length > 15 ? original_title.slice(0, 15) + "..." : original_title;
  const formattedDate = new Date(release_date).toDateString() || "No release date"
  const WhereToWatch = `https://kipwatch.xyz/info/movie/${id}`
  const cardTemplate = `
     <div class="column">
          <div class="card">
            <a class="card-media" href="./img-01.jpeg">
               <img src="${imagePath}" alt="${original_title}" width="100%" />
            </a>
          <div class="card-content">
            <div class="card-header">
              <div class="left-content">
                 <h3 style="font-weight: 600">${truncatedTitle}</h3>
                 <span style="color: #12efec">${formattedDate}</span>
          </div>
          <div class="right-content">
             <a href="${WhereToWatch}" target="_blank" class="card-btn">Watch Now</a>
          </div>
        </div>
        <div class="info">
         ${overview || "no overview yet..."}
        </div>
     </div>
   </div>
 </div>
 `;
  return cardTemplate;
}

// Clear result element for search
function clearResults() {
  result.innerHTML = "";
}

//show results in page
function showResults(item) {
  const newContent = item.map(createMovieCard).join("");
  result.innerHTML = newContent || "<p>No results found</p>";
}

//load more results
async function loadMoreResults() {
  if (isSearching) {
    return;
  }
  page++;
  const searchTerm = query.ariaValueMax;
  const url = searchTerm ? `${searchUrl}${searchTerm}&page=${page}
  ` : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`
  await fetchAndShowResult(url);
}

//detect end of page and load more results
function detectEnd() {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 20) {
    loadMoreResults()
  }
}

//handle search
async function handleSearch(e) {
  e.preventDefault();
  const searchTerm = query.value.trim();
  page = 1;
  if (searchTerm) {
    isSearching = true;
    clearResults();
    const newUrl = `${searchUrl}${searchTerm}&page=${page}`;
    await fetchAndShowResult(newUrl);
    query.value = "";
  }
}

// Event listeners
form.addEventListener('submit', handleSearch);
form.addEventListener('scroll', detectEnd);
form.addEventListener('resize', detectEnd);

// Initialize the page
async function init() {
  clearResults();
  const url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
  isSearching = false;
  await fetchAndShowResult(url);
}

init();