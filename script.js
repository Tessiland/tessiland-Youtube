// 1. Prendiamo le "maniglie" degli elementi HTML
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');

// Funzione per mostrare i video sulla pagina
function displayVideos(videos) {
    // Svuotiamo i risultati precedenti
    resultsContainer.innerHTML = '';

    // Se non ci sono video, mostriamo un messaggio
    if (videos.length === 0) {
        resultsContainer.innerHTML = '<p>Nessun video trovato per la tua ricerca.</p>';
        return;
    }

    // Per ogni video trovato, creiamo una "card" HTML
    videos.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.className = 'video-card'; // Aggiungiamo una classe per lo stile

        videoElement.innerHTML = `
            <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank">
                <img src="${video.thumbnail}" alt="${video.title}">
                <h3>${video.title}</h3>
                <p>Canale: ${video.channel}</p>
            </a>
        `;
        resultsContainer.appendChild(videoElement);
    });
}

// 2. Diciamo al pulsante di "ascoltare" l'evento 'click'
searchButton.addEventListener('click', async () => {
    // 3. Quando l'utente clicca, esegui questa funzione asincrona

    // Prendiamo il testo scritto dall'utente e aggiungiamo "Tessiland" per una ricerca mirata
    const userQuery = searchInput.value;
    const searchTerm = `Tessiland ${userQuery}`;
    
    // Mostriamo un messaggio di attesa
    resultsContainer.innerHTML = '<p>Ricerca in corso, un momento...</p>';

    try {
        // Chiamiamo la nostra Funzione Netlify passando il termine di ricerca
        const response = await fetch(`/.netlify/functions/cerca-youtube?q=${encodeURIComponent(searchTerm)}`);

        if (!response.ok) {
            throw new Error('Errore di rete o dal server.');
        }

        const videos = await response.json();

        // Usiamo la nostra nuova funzione per mostrare i video
        displayVideos(videos);

    } catch (error) {
        // In caso di errore, lo mostriamo sulla pagina
        resultsContainer.innerHTML = '<p>Oops, qualcosa è andato storto. Riprova.</p>';
        console.error('Errore:', error);
    }
});