// =================================================================
// RIFERIMENTI AGLI ELEMENTI HTML
// =================================================================
const discoverContent = document.getElementById('discoverContent');
const myChannelContent = document.getElementById('myChannelContent');
const discoverResults = document.getElementById('discoverResults');
const myChannelResults = document.getElementById('myChannelResults');
const tabDiscover = document.getElementById('tabDiscover');
const tabMyChannel = document.getElementById('tabMyChannel');
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-button');

// =================================================================
// STATO DELL'APPLICAZIONE
// =================================================================
let activeOrder = 'relevance';

// =================================================================
// LOGICA DI RICERCA
// =================================================================
function displayVideos(videos, container) {
    container.innerHTML = '';
    if (videos.length === 0) {
        container.innerHTML = '<p>Nessun video trovato per questa ricerca.</p>';
        return;
    }
    videos.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.className = 'video-card';
        videoElement.innerHTML = `
            <a href="https://www.youtube.com/watch?v=0rsmRLhHTv4{video.videoId}" target="_blank" rel="noopener noreferrer">
                <img src="${video.thumbnail}" alt="${video.title}">
                <h3>${video.title}</h3>
                <p>Canale: ${video.channel}</p>
            </a>
        `;
        container.appendChild(videoElement);
    });
}

async function handleDiscoverSearch() {
    const userQuery = searchInput.value;
    const searchTerm = `Tessiland ${userQuery}`;
    discoverResults.innerHTML = '<p>Ricerca in corso, un momento...</p>';
    try {
        const response = await fetch(`/.netlify/functions/cerca-youtube?q=${encodeURIComponent(searchTerm)}&order=${activeOrder}`);
        if (!response.ok) throw new Error('Errore di rete o dal server.');
        const videos = await response.json();
        displayVideos(videos, discoverResults);
    } catch (error) {
        discoverResults.innerHTML = '<p>Oops, qualcosa è andato storto. Riprova.</p>';
        console.error('Errore:', error);
    }
}

async function handleMyChannelLoad() {
    myChannelResults.innerHTML = '<p>Caricamento video dal canale ufficiale...</p>';
    try {
        const response = await fetch(`/.netlify/functions/get-my-channel-videos`);
        if (!response.ok) throw new Error('Errore di rete o dal server.');
        const videos = await response.json();
        displayVideos(videos, myChannelResults);
    } catch (error) {
        myChannelResults.innerHTML = '<p>Oops, qualcosa è andato storto. Riprova.</p>';
        console.error('Errore:', error);
    }
}

// =================================================================
// GESTIONE EVENTI (CLICKS)
// =================================================================
function switchToTab(activeTab) {
    if (activeTab === 'discover') {
        discoverContent.classList.add('active');
        myChannelContent.classList.remove('active');
        tabDiscover.classList.add('active');
        tabMyChannel.classList.remove('active');
    } else {
        myChannelContent.classList.add('active');
        discoverContent.classList.remove('active');
        tabMyChannel.classList.add('active');
        tabDiscover.classList.remove('active');
        if (myChannelResults.innerHTML.includes('<p>')) {
            handleMyChannelLoad();
        }
    }
}

tabDiscover.addEventListener('click', () => switchToTab('discover'));
tabMyChannel.addEventListener('click', () => switchToTab('myChannel'));
searchButton.addEventListener('click', handleDiscoverSearch);
searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') handleDiscoverSearch();
});
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        activeOrder = button.dataset.order;
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        handleDiscoverSearch();
    });
});

// =================================================================
// INIZIALIZZAZIONE
// =================================================================
switchToTab('discover');
handleDiscoverSearch();