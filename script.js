document.addEventListener('DOMContentLoaded', () => {
    // RIFERIMENTI HTML
    const discoverResults = document.getElementById('discoverResults');
    const searchButton = document.getElementById('searchButton');
    const toolSelect = document.getElementById('toolSelect');
    const categorySelect = document.getElementById('categorySelect');
    const materialSelect = document.getElementById('materialSelect');
    const productInput = document.getElementById('productInput');
    const productList = document.getElementById('productList');

    // DATI E STATO
    let allProducts = [];
    let allVideos = [];
    const categories = {
        uncinetto: ['Borsa', 'Sciarpa', 'Scialle', 'Cappello', 'Amigurumi', 'Top/Canotta', 'Maglione', 'Cardigan', 'Copertina', 'Sottobicchiere', 'Presina', 'Cestino', 'Tappeto'],
        ferri: ['Maglione', 'Cardigan', 'Sciarpa', 'Cappello', 'Guanti', 'Calzini', 'Copertina', 'Scialle'],
        tunisino: ['Sciarpa', 'Cuscino', 'Maglia', 'Coperta'],
        ricamo: ['Telaio', 'Punto Croce', 'Quadro']
    };

    // FUNZIONI
    function displayVideos(videos) {
        discoverResults.innerHTML = '';
        if (videos.length === 0) {
            discoverResults.innerHTML = '<p>Nessun video trovato. Prova a usare filtri meno specifici.</p>';
            return;
        }
        const videosToDisplay = videos.slice(0, 100);
        videosToDisplay.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = 'video-card';
            // La card ora è un link!
            videoElement.innerHTML = `
                <a href="https://www.youtube.com/watch?v=FnTRzK6peYs...{video.videoId}" target="_blank" rel="noopener noreferrer">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <h3>${video.title}</h3>
                    <p>Canale: ${video.channel}</p>
                </a>
            `;
            discoverResults.appendChild(videoElement);
        });
    }

    function runFilter() {
        const product = productInput.value.toLowerCase();
        const tool = toolSelect.value.toLowerCase();
        const category = categorySelect.value.toLowerCase();
        const material = materialSelect.value.toLowerCase();

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
            const [productsResponse, videosResponse] = await Promise.all([
                fetch('/prodotti.json'),
                fetch('/database.json')
            ]);
            allProducts = await productsResponse.json();
            const videoData = await videosResponse.json();
            allVideos = videoData.videos;

            allProducts.forEach(product => {
                const option = document.createElement('option');
                option.value = product.name;
                productList.appendChild(option);
            });
            
            displayVideos(allVideos);

        } catch (error) {
            discoverResults.innerHTML = '<p>Impossibile caricare il database dei video. Riprova più tardi.</p>';
        }

        searchButton.addEventListener('click', runFilter);
        toolSelect.addEventListener('change', populateCategories);
    }

    initializeApp();
});