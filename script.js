// =================================================================
// TESSILAND ORGANIZER - SCRIPT VERSIONE FINALE 1.0
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. RIFERIMENTI AGLI ELEMENTI HTML
    const discoverResults = document.getElementById('discoverResults');
    const myChannelResults = document.getElementById('myChannelResults');
    const tabDiscover = document.getElementById('tabDiscover');
    const tabMyChannel = document.getElementById('tabMyChannel');
    const discoverContent = document.getElementById('discoverContent');
    const myChannelContent = document.getElementById('myChannelContent');
    const searchButton = document.getElementById('searchButton');
    const toolSelect = document.getElementById('toolSelect');
    const categorySelect = document.getElementById('categorySelect');
    const materialSelect = document.getElementById('materialSelect');
    const productInput = document.getElementById('productInput');
    const productList = document.getElementById('productList');
    const videoModal = document.getElementById('videoModal');
    const closeButton = document.getElementById('closeButton');
    const youtubePlayerContainer = document.getElementById('youtubePlayerContainer');

    // 2. DATI E STATO
    let allProducts = [];
    const categories = {
        uncinetto: ['Borsa', 'Sciarpa', 'Scialle', 'Cappello', 'Amigurumi', 'Top/Canotta', 'Maglione', 'Cardigan', 'Copertina', 'Sottobicchiere', 'Presina', 'Cestino', 'Tappeto'],
        ferri: ['Maglione', 'Cardigan', 'Sciarpa', 'Cappello', 'Guanti', 'Calzini', 'Copertina', 'Scialle'],
        tunisino: ['Sciarpa', 'Cuscino', 'Maglia', 'Coperta'],
        ricamo: ['Telaio', 'Punto Croce', 'Quadro']
    };

    // 3. FUNZIONI PRINCIPALI

    function openModal(videoId) {
        youtubePlayerContainer.innerHTML = `<iframe src="https://www.youtube.com/watch?v=JlBWfm0pjgA{videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        videoModal.classList.add('visible');
    }

    function closeModal() {
        videoModal.classList.remove('visible');
        youtubePlayerContainer.innerHTML = '';
    }

    function displayVideos(videos, container) {
        container.innerHTML = '';
        if (videos.length === 0) {
            container.innerHTML = '<p>Nessun video trovato per questa ricerca. Prova a usare filtri meno specifici.</p>';
            return;
        }
        videos.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = 'video-card';
            videoElement.dataset.videoId = video.videoId;
            videoElement.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}">
                <h3>${video.title}</h3>
                <p>Canale: ${video.channel}</p>
            `;
            videoElement.addEventListener('click', () => openModal(video.videoId));
            container.appendChild(videoElement);
        });
    }

    async function handleDiscoverSearch() {
        // Costruzione intelligente della query di ricerca
        const product = productInput.value;
        const tool = toolSelect.value;
        const category = categorySelect.value;
        const material = materialSelect.value;
        
        let searchTerm = 'tutorial';
        // La ricerca per prodotto specifico ha la priorità
        if (product) {
            searchTerm = `tutorial "${product}" ${tool} ${category}`;
        } else {
            searchTerm = `tutorial ${tool} ${category} ${material}`;
        }
        
        discoverResults.innerHTML = '<p>Ricerca avanzata in corso... potrebbe richiedere qualche istante...</p>';
        try {
            const response = await fetch(`/.netlify/functions/cerca-youtube?q=${encodeURIComponent(searchTerm.trim())}`);
            if (!response.ok) throw new Error('Errore di rete.');
            const videos = await response.json();
            displayVideos(videos, discoverResults);
        } catch (error) {
            discoverResults.innerHTML = '<p>Oops, qualcosa è andato storto durante la ricerca. Riprova.</p>';
            console.error('Errore:', error);
        }
    }

    async function handleMyChannelLoad() {
        myChannelResults.innerHTML = '<p>Caricamento video dal canale ufficiale...</p>';
        try {
            const response = await fetch(`/.netlify/functions/get-my-channel-videos`);
            if (!response.ok) throw new Error('Errore di rete.');
            const videos = await response.json();
            displayVideos(videos, myChannelResults);
        } catch (error) {
            myChannelResults.innerHTML = '<p>Oops, qualcosa è andato storto. Riprova.</p>';
            console.error('Errore:', error);
        }
    }

    function populateCategories() {
        const selectedTool = toolSelect.value;
        const relevantCategories = categories[selectedTool] || [];
        categorySelect.innerHTML = '<option value="">Tutte le categorie</option>';
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
            if (myChannelResults.innerHTML.includes('<p>')) { // Carica solo la prima volta
                handleMyChannelLoad();
            }
        }
    }

    async function initializeApp() {
        // Carica la lista dei prodotti per l'autocomplete
        try {
            const response = await fetch('/prodotti.json');
            allProducts = await response.json();
            allProducts.forEach(product => {
                const option = document.createElement('option');
                option.value = product.name;
                productList.appendChild(option);
            });
        } catch (error) {
            console.error("Errore nel caricamento dei prodotti:", error);
        }

        // Imposta gli event listeners
        tabDiscover.addEventListener('click', () => switchToTab('discover'));
        tabMyChannel.addEventListener('click', () => switchToTab('myChannel'));
        searchButton.addEventListener('click', handleDiscoverSearch);
        toolSelect.addEventListener('change', populateCategories);
        closeButton.addEventListener('click', closeModal);
        videoModal.addEventListener('click', e => {
            if (e.target === videoModal) closeModal();
        });

        // Inizializza l'app
        populateCategories();
        switchToTab('discover');
        handleDiscoverSearch();
    }

    // 4. ESECUZIONE
    initializeApp();
});