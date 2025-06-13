document.addEventListener('DOMContentLoaded', () => {
    // RIFERIMENTI
    const discoverResults = document.getElementById('discoverResults');
    const searchButton = document.getElementById('searchButton');
    const toolSelect = document.getElementById('toolSelect');
    const categorySelect = document.getElementById('categorySelect');
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';
    
    // STATO
    let allVideos = [];
    let currentPage = 1;
    const resultsPerPage = 24;

    const categoriesByTool = {
        uncinetto: ['Borsa', 'Scialle / Collo', 'Amigurumi / Pupazzi', 'Maglione / Top', 'Casa / Decorazioni'],
        ferri: ['Maglione / Top', 'Scialle / Collo', 'Calzini']
    };

    // FUNZIONI
    function displayVideos(videos) {
        discoverResults.innerHTML = '';
        paginationContainer.innerHTML = '';

        if (!videos || videos.length === 0) {
            discoverResults.innerHTML = '<p>Nessun video trovato per questa ricerca. Prova a usare filtri meno specifici.</p>';
            return;
        }

        const totalPages = Math.ceil(videos.length / resultsPerPage);
        const startIndex = (currentPage - 1) * resultsPerPage;
        const paginatedVideos = videos.slice(startIndex, startIndex + resultsPerPage);

        paginatedVideos.forEach(video => {
            const videoElement = document.createElement('a');
            videoElement.className = 'video-card';
            videoElement.href = `https://www.youtube.com/watch?v=FnTRzK6peYs...{video.videoId}`;
            videoElement.target = '_blank';
            videoElement.rel = 'noopener noreferrer';
            videoElement.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}">
                <h3>${video.title}</h3>
                <p>${video.channel}</p>
            `;
            discoverResults.appendChild(videoElement);
        });

        if (totalPages > 1) {
            const pageInfo = document.createElement('span');
            pageInfo.textContent = `Pagina ${currentPage} di ${totalPages}`;
            pageInfo.className = 'page-info';
            paginationContainer.appendChild(pageInfo);
            discoverResults.insertAdjacentElement('afterend', paginationContainer);
        }
    }

    function runFilter() {
        const tool = toolSelect.value.toLowerCase();
        const category = categorySelect.value.toLowerCase();
        let filteredVideos = allVideos;

        if (tool) {
            filteredVideos = filteredVideos.filter(v => (v.title + v.description).toLowerCase().includes(tool));
        }
        if (category) {
            filteredVideos = filteredVideos.filter(v => (v.title + v.description).toLowerCase().includes(category));
        }
        
        currentPage = 1;
        displayVideos(filteredVideos);
    }

    function populateCategories() {
        const selectedTool = toolSelect.value;
        const relevantCategories = categoriesByTool[selectedTool] || Object.values(categoriesByTool).flat();
        categorySelect.innerHTML = '<option value="">Tutte le Categorie</option>';
        new Set(relevantCategories).forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.toLowerCase().split(' / ')[0];
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }

    async function initializeApp() {
        discoverResults.innerHTML = '<p>Caricamento database...</p>';
        try {
            const response = await fetch('/database.json?v=' + new Date().getTime());
            const data = await response.json();
            allVideos = data.videos || [];
            displayVideos(allVideos);
            populateCategories();
        } catch (error) {
            discoverResults.innerHTML = '<p>Database non ancora disponibile o in fase di creazione. Prova a ricaricare tra qualche minuto.</p>';
        }
        searchButton.addEventListener('click', runFilter);
        toolSelect.addEventListener('change', populateCategories);
    }
    
    initializeApp();
});