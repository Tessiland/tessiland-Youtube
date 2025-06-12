// =================================================================
// 1. RIFERIMENTI AGLI ELEMENTI HTML
// =================================================================

// Contenitori principali
const discoverContent = document.getElementById('discoverContent');
const myChannelContent = document.getElementById('myChannelContent');
const discoverResults = document.getElementById('discoverResults');
const myChannelResults = document.getElementById('myChannelResults');

// Pulsanti delle schede (Tab)
const tabDiscover = document.getElementById('tabDiscover');
const tabMyChannel = document.getElementById('tabMyChannel');

// Elementi della ricerca nella scheda "Scopri"
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');

// Pulsanti dei filtri
const filterButtons = document.querySelectorAll('.filter-button');

// =================================================================
// 2. STATO DELL'APPLICAZIONE
// =================================================================

let activeOrder = 'relevance'; // Il filtro di default è 'rilevanza'

// =================================================================
// 3. LOGICA DI RICERCA
// =================================================================

// Funzione generica per mostrare i video in un contenitore
function displayVideos(videos, container) {
    container.innerHTML = ''; // Svuota i risultati precedenti
    if (videos.length === 0) {
        container.innerHTML = '<p>Nessun video trovato.</p>';
        return;
    }
    videos.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.className = 'video-card';
        videoElement.innerHTML = `
            <a href="https://www.youtube.com/watch?v=$${video.videoId}" target="_blank" rel="noopener noreferrer">
                <img src="${video.thumbnail}" alt="${video.title}">
                <h3>${video.title}</h3>
                <p>Canale: ${video.channel}</p>
            </a>
        `;
        container.appendChild(videoElement);
    });
}

// Funzione per la ricerca nella scheda "Scopri"
async function handleDiscoverSearch() {
    const userQuery = searchInput.value;
    const searchTerm = `Tessiland ${userQuery}`;
    discoverResults.innerHTML = '<p>Ricerca in corso, un momento...</p>';

    // Qui inseriremo la chiamata alla funzione Netlify per la ricerca generale
    console.log(`Ricerca "Scopri": Query='${searchTerm}', Ordine='${activeOrder}'`);
    // Per ora simuliamo un risultato vuoto
    // displayVideos([], discoverResults);
}

// Funzione per caricare i video del "Mio Canale"
async function handleMyChannelLoad() {
    myChannelResults.innerHTML = '<p>Caricamento video dal canale ufficiale...</p>';
    
    // Qui inseriremo la chiamata alla funzione Netlify per il canale specifico
    console.log('Ricerca "Il Mio Canale"');
    // Per ora simuliamo un risultato vuoto
    // displayVideos([], myChannelResults);
}

// =================================================================
// 4. GESTIONE EVENTI (CLICKS)
// =================================================================

// Logica per cambiare scheda
function switchToTab(activeTab) {
    if (activeTab === 'discover') {
        // Mostra contenuti "Scopri"
        discoverContent.classList.add('active');
        myChannelContent.classList.remove('active');
        // Aggiorna stile pulsanti
        tabDiscover.classList.add('active');
        tabMyChannel.classList.remove('active');
    } else {
        // Mostra contenuti "Mio Canale"
        myChannelContent.classList.add('active');
        discoverContent.classList.remove('active');
        // Aggiorna stile pulsanti
        tabMyChannel.classList.add('active');
        tabDiscover.classList.remove('active');
        // Carica i video del canale se non sono già stati caricati
        if (myChannelResults.innerHTML === '') {
            handleMyChannelLoad();
        }
    }
}

// Event listener per i pulsanti delle schede
tabDiscover.addEventListener('click', () => switchToTab('discover'));
tabMyChannel.addEventListener('click', () => switchToTab('myChannel'));

// Event listener per il pulsante di ricerca
searchButton.addEventListener('click', handleDiscoverSearch);
searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleDiscoverSearch();
    }
});

// Event listener per i pulsanti dei filtri
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Aggiorna lo stato del filtro attivo
        activeOrder = button.dataset.order;
        // Aggiorna lo stile dei pulsanti
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        // Rilancia la ricerca con il nuovo ordine
        handleDiscoverSearch();
    });
});

// =================================================================
// 5. INIZIALIZZAZIONE
// =================================================================

// Al caricamento della pagina, assicurati che la prima scheda sia attiva e lancia una ricerca di default
switchToTab('discover');
handleDiscoverSearch();