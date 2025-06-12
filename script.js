// 1. Prendiamo le "maniglie" degli elementi HTML che ci servono
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');

// 2. Diciamo al pulsante di "ascoltare" l'evento 'click'
searchButton.addEventListener('click', () => {
    // 3. Quando l'utente clicca, esegui questa funzione

    // Prendiamo il testo scritto dall'utente nella barra di ricerca
    const searchTerm = searchInput.value;

    // Per ora, non cerchiamo su YouTube. Facciamo solo una prova:
    // scriviamo il termine di ricerca nella console del browser.
    console.log('L\'utente ha cercato:', searchTerm);

    // E mostriamo un messaggio di attesa sulla pagina
    resultsContainer.innerHTML = 'Ricerca in corso...';
});