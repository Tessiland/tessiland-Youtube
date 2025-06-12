// =================================================================
// TESSILAND ORGANIZER - SCRIPT FINALE V3.0 (Architettura con Database)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. RIFERIMENTI AGLI ELEMENTI HTML
    const discoverResults = document.getElementById('discoverResults');
    const searchButton = document.getElementById('searchButton');
    const toolSelect = document.getElementById('toolSelect');
    const categorySelect = document.getElementById('categorySelect');
    const materialSelect = document.getElementById('materialSelect');
    const productInput = document.getElementById('productInput');
    const productList = document.getElementById('productList');
    const videoModal = document.getElementById('videoModal');
    const closeButton = document.getElementById('closeButton');
    const youtubePlayerContainer = document.getElementById('youtubePlayerContainer');

    // 2. DATI E STATO DELL'APPLICAZIONE
    let allProducts = []; // Conterrà la lista di prodotti da prodotti.json
    let allVideos = [];   // Conterrà la lista di video da database.json
    
    const categories = {
        uncinetto: ['Borsa', 'Sciarpa', 'Scialle', 'Cappello', 'Amigurumi', 'Top/Canotta', 'Maglione', 'Cardigan', 'Copertina', 'Sottobicchiere', 'Presina', 'Cestino', 'Tappeto'],
        ferri: ['Maglione', 'Cardigan', 'Sciarpa', 'Cappello', 'Guanti', 'Calzini', 'Copertina', 'Scialle'],
        tunisino: ['Sciarpa', 'Cuscino', 'Maglia', 'Coperta'],
        ricamo: ['Telaio', 'Punto Croce', 'Quadro']
    };

    // 3. FUNZIONI PRINCIPALI

    function openModal(videoId) {
        youtubePlayerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/VIDEO_ID{videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        videoModal.classList.add('visible');
    }

    function closeModal() {
        videoModal.classList.remove('visible');
        youtubePlayerContainer.innerHTML = '';
    }

    function displayVideos(videos) {
        discoverResults.innerHTML = '';
        if (videos.length === 0) {
            discoverResults.innerHTML = '<p>Nessun video trovato per questa ricerca. Prova a usare filtri meno specifici.</p>';
            return;
        }

        // Per ora mostriamo fino a 100 risultati. La paginazione sarà un miglioramento futuro.
        const videosToDisplay = videos.slice(0, 100);

        videosToDisplay.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = 'video-card';
            videoElement.dataset.videoId = video.videoId;
            videoElement.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}">
                <h3>${video.title}</h3>
                <p>Canale: ${video.channel}</p>
            `;
            videoElement.addEventListener('click', () => openModal(video.videoId));
            discoverResults.appendChild(videoElement);
        });
    }

    function runFilter() {
        const product = productInput.value.toLowerCase();
        const tool = toolSelect.value.toLowerCase();
        const category = categorySelect.value.toLowerCase();
        const material = materialSelect.value.toLowerCase();

        // La ricerca ora è istantanea, avviene sui dati che già abbiamo!
        let filteredVideos = allVideos;

        if (product) {
            filteredVideos = filteredVideos.filter(video => 
                (video.products || []).some(p => p.toLowerCase().includes(product)) ||
                (video.title || '').toLowerCase().includes(product) ||
                (video.description || '').toLowerCase().includes(product)
            );
        }
        if (tool) {
            filteredVideos = filteredVideos.filter(video => (video.tool || '').toLowerCase() === tool);
        }
        if (category) {
            filteredVideos = filteredVideos.filter(video => (video.category || '').toLowerCase() === category);
        }
        if (material) {
            // Questa è una ricerca semplice, si può migliorare
            filteredVideos = filteredVideos.filter(video => (video.description || '').toLowerCase().includes(material) || (video.tags || []).includes(material));
        }

        displayVideos(filteredVideos);
    }

    function populateCategories() {
        const selectedTool = toolSelect.value;
        const relevantCategories = categories[selectedTool] || [];
        categorySelect.innerHTML = '<option value="">Tutte</option>';
        relevantCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.toLowerCase();
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    async function initializeApp() {
        discoverResults.innerHTML = '<p>Caricamento del database dei video...</p>';

        try {
            // Carica SIMULTANEAMENTE sia i prodotti che il database dei video
            const [productsResponse, videosResponse] = await Promise.all([
                fetch('/prodotti.json'),
                fetch('/database.json')
            ]);

            allProducts = await productsResponse.json();
            const videoData = await videosResponse.json();
            allVideos = videoData.videos;

            // Popola l'autocomplete dei prodotti
            allProducts.forEach(product => {
                const option = document.createElement('option');
                option.value = product.name;
                productList.appendChild(option);
            });
            
            console.log(`Database caricato: ${allVideos.length} video trovati.`);
            displayVideos(allVideos); // Mostra tutti i video all'inizio

        } catch (error) {
            console.error("Errore nel caricamento dei dati iniziali:", error);
            discoverResults.innerHTML = '<p>Impossibile caricare il database dei video. Riprova più tardi.</p>';
        }

        // Imposta gli event listeners
        searchButton.addEventListener('click', runFilter);
        toolSelect.addEventListener('change', populateCategories);
        closeButton.addEventListener('click', closeModal);
        videoModal.addEventListener('click', e => {
            if (e.target === videoModal) closeModal();
        });
    }

    // ESECUZIONE
    initializeApp();
});