document.addEventListener('DOMContentLoaded', () => {
    // RIFERIMENTI HTML
    const resultsContainer = document.getElementById('discoverResults');
    const searchButton = document.getElementById('searchButton');
    const toolSelect = document.getElementById('toolSelect');
    const categorySelect = document.getElementById('categorySelect');
    const materialSelect = document.getElementById('materialSelect');
    const productInput = document.getElementById('productInput');
    const productList = document.getElementById('productList');
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';
    
    // DATI E STATO
    let allProducts = [];
    let allVideos = [];
    let currentPage = 1;
    const resultsPerPage = 20;
    
    const categoriesByTool = {
        uncinetto: ['Borsa', 'Scialle / Collo', 'Amigurumi / Pupazzi', 'Maglione / Top', 'Casa / Decorazioni', 'Accessori Persona', 'Bambino / Neonato'],
        ferri: ['Maglione / Top', 'Scialle / Collo', 'Accessori Persona', 'Bambino / Neonato', 'Casa / Decorazioni'],
        tunisino: ['Sciarpa', 'Cuscino', 'Maglia'],
        ricamo: ['Telaio', 'Punto Croce']
    };

    // FUNZIONI
    function displayVideos(videos) {
        resultsContainer.innerHTML = '';
        paginationContainer.innerHTML = '';

        if (videos.length === 0) {
            resultsContainer.innerHTML = '<p>Nessun video trovato per questa ricerca. Prova a usare filtri meno specifici.</p>';
            return;
        }

        const totalPages = Math.ceil(videos.length / resultsPerPage);
        const startIndex = (currentPage - 1) * resultsPerPage;
        const endIndex = startIndex + resultsPerPage;
        const paginatedVideos = videos.slice(startIndex, endIndex);

        paginatedVideos.forEach(video => {
            const videoElement = document.createElement('a'); // La card è un link diretto
            videoElement.className = 'video-card';
            videoElement.href = `https://www.youtube.com/watch?v=FnTRzK6peYs...{video.videoId}`;
            videoElement.target = '_blank';
            videoElement.rel = 'noopener noreferrer';
            videoElement.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}">
                <h3>${video.title}</h3>
                <p>Canale: ${video.channel}</p>
            `;
            resultsContainer.appendChild(videoElement);
        });

        // Crea i pulsanti di paginazione
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.className = 'page-button';
                if (i === currentPage) {
                    pageButton.classList.add('active');
                }
                pageButton.addEventListener('click', () => {
                    currentPage = i;
                    displayVideos(videos);
                });
                paginationContainer.appendChild(pageButton);
            }
            resultsContainer.insertAdjacentElement('afterend', paginationContainer);
        }
    }

    function runFilter() {
        const product = productInput.value.toLowerCase();
        const tool = toolSelect.value.toLowerCase();
        const category = categorySelect.value.toLowerCase();
        const material = materialSelect.value.toLowerCase();
        let filteredVideos = allVideos;

        // Logica di filtro...
        if (product) {
            filteredVideos = filteredVideos.filter(v => (v.title.toLowerCase().includes(product) || v.description.toLowerCase().includes(product)));
        }
        if (tool) {
            // Logica più complessa basata sulla tassonomia... per ora semplice
        }

        currentPage = 1;
        displayVideos(filteredVideos);
    }

    function populateCategories() {
        const selectedTool = toolSelect.value;
        const relevantCategories = categoriesByTool[selectedTool] || [];
        categorySelect.innerHTML = '<option value="">Tutte</option>';
        relevantCategories.forEach(categoryName => {
            const option = document.createElement('option');
            option.value = categoryName.toLowerCase().split(' / ')[0];
            option.textContent = categoryName;
            categorySelect.appendChild(option);
        });
    }

    async function initializeApp() {
        discoverResults.innerHTML = '<p>Caricamento del database dei video...</p>';
        try {
            const [productsResponse, videosResponse] = await Promise.all([
                fetch('/prodotti.json'),
                fetch('/database.json')
            ]);
            allProducts = await productsResponse.json();
            const videoData = await videosResponse.json();
            allVideos = videoData.videos;

            allProducts.forEach(p => {
                const option = document.createElement('option');
                option.value = p.name;
                productList.appendChild(option);
            });
            
            console.log(`Database caricato: ${allVideos.length} video.`);
            displayVideos(allVideos);

        } catch (error) {
            discoverResults.innerHTML = '<p>Impossibile caricare il database dei video. Riprova più tardi.</p>';
        }

        searchButton.addEventListener('click', runFilter);
        toolSelect.addEventListener('change', populateCategories);
    }
    
    initializeApp();
});