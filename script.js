// =================================================================
// TESSILAND ORGANIZER - SCRIPT FINALE
// =================================================================

// 1. RIFERIMENTI AGLI ELEMENTI HTML
// =================================================================

// Contenitori principali e risultati
const discoverContent = document.getElementById('discoverContent');
const myChannelContent = document.getElementById('myChannelContent');
const discoverResults = document.getElementById('discoverResults');
const myChannelResults = document.getElementById('myChannelResults');

// Schede (Tabs)
const tabDiscover = document.getElementById('tabDiscover');
const tabMyChannel = document.getElementById('tabMyChannel');

// Filtri e Ricerca
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('keywordInput'); // Aggiornato all'ID corretto
const toolSelect = document.getElementById('toolSelect');
const categorySelect = document.getElementById('categorySelect');

// Finestra Modale
const videoModal = document.getElementById('videoModal');
const closeButton = document.getElementById('closeButton');
const youtubePlayerContainer = document.getElementById('youtubePlayerContainer');


// =================================================================
// 2. DATI E STATO DELL'APPLICAZIONE
// =================================================================

const categories = {
    uncinetto: ['Borsa', 'Sciarpa', 'Scialle', 'Cappello', 'Amigurumi', 'Top/Canotta', 'Maglione', 'Cardigan', 'Copertina', 'Sottobicchiere', 'Presina', 'Cestino', 'Tappeto'],
    ferri: ['Maglione', 'Cardigan', 'Sciarpa', 'Cappello', 'Guanti', 'Calzini', 'Copertina', 'Scialle'],
    tunisino: ['Sciarpa', 'Cuscino', 'Maglia', 'Coperta'],
    ricamo: ['Telaio', 'Punto Croce', 'Quadro']
};

// =================================================================
// 3. LOGICA DI RICERCA E VISUALIZZAZIONE
// =================================================================

function openModal(videoId) {
    youtubePlayerContainer.innerHTML = `<iframe src="youtube.com/channel/CHANNEL_ID{videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    videoModal.classList.add('visible');
}

function closeModal() {
    videoModal.classList.remove('visible');
    youtubePlayerContainer.innerHTML = ''; // Ferma il video rimuovendo l'iframe
}

function displayVideos(videos, container) {
    container.innerHTML = '';
    if (videos.length === 0) {
        container.innerHTML = '<p>Nessun video trovato per questa ricerca.</p>';
        return;
    }
    videos.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.className = 'video-card';
        // Aggiungiamo l'ID del video come attributo 'data' per recuperarlo facilmente
        videoElement.dataset.videoId = video.videoId;

        videoElement.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <h3>${video.title}</h3>
            <p>Canale: ${video.channel}</p>
        `;

        // Aggiungiamo l'evento click direttamente alla card
        videoElement.addEventListener('click', () => {
            openModal(video.videoId);
        });

        container.appendChild(videoElement);
    });
}

async function handleDiscoverSearch() {
    const tool = toolSelect.value;
    const category = categorySelect.value;
    const keywords = searchInput.value;

    const searchTerm = `Tessiland tutorial ${tool} ${category} ${keywords}`;
    discoverResults.innerHTML = '<p>Ricerca in corso, un momento...</p>';

    try {
        const response = await fetch(`/.netlify/functions/cerca-youtube?q=${encodeURIComponent(searchTerm)}`);
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
// 4. GESTIONE EVENTI E INTERFACCIA
// =================================================================

function populateCategories() {
    const selectedTool = toolSelect.value;
    const relevantCategories = categories[selectedTool] || [];
    categorySelect.innerHTML = '<option value="">Tutte le categorie</option>'; // Opzione di default
    relevantCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

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
        if (myChannelResults.innerHTML === '') {
            handleMyChannelLoad();
        }
    }
}

// Event Listeners
tabDiscover.addEventListener('click', () => switchToTab('discover'));
tabMyChannel.addEventListener('click', () => switchToTab('myChannel'));
searchButton.addEventListener('click', handleDiscoverSearch);
toolSelect.addEventListener('change', populateCategories);

// Event listeners per chiudere la modale
closeButton.addEventListener('click', closeModal);
videoModal.addEventListener('click', (event) => {
    // Chiude la modale solo se si clicca sullo sfondo scuro e non sul contenuto
    if (event.target === videoModal) {
        closeModal();
    }
});

// =================================================================
// 5. INIZIALIZZAZIONE
// =================================================================

populateCategories(); // Popola le categorie per la prima volta
switchToTab('discover');
handleDiscoverSearch();