// Il nostro "Robot Lavoratore" v2.0 - Multi-Ricerca
// Scopo: Eseguire decine di ricerche mirate per accumulare un grande database.

exports.handler = async function(event, context) {
    console.log("Robot Stacanovista attivato...");

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    // La lista dei compiti per il nostro robot
    const searchQueries = [
        "tutorial uncinetto tessiland",
        "tutorial ferri tessiland",
        "amigurumi tessiland",
        "borsa uncinetto tessiland",
        "scialle uncinetto tessiland",
        "maglia ferri tessiland",
        "copertina uncinetto tessiland",
        "filato tessiland",
        "cordino thai tessiland",
        "review prodotti tessiland"
    ];

    const allVideosMap = new Map(); // Usiamo una Map per gestire facilmente i duplicati

    // Eseguiamo un ciclo per ogni ricerca nella nostra lista di compiti
    for (const query of searchQueries) {
        console.log(`Eseguo la ricerca per: "${query}"`);
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&relevanceLanguage=it&key=${YOUTUBE_API_KEY}&maxResults=50`;

        try {
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (searchData.items && searchData.items.length > 0) {
                searchData.items.forEach(item => {
                    // Aggiungiamo il video alla nostra mappa, l'ID video è la chiave.
                    // Se un video viene trovato più volte, verrà semplicemente sovrascritto,
                    // garantendo che ogni video sia presente una sola volta.
                    allVideosMap.set(item.id.videoId, {
                        videoId: item.id.videoId,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.high.url,
                        channel: item.snippet.channelTitle
                    });
                });
            }
        } catch (error) {
            console.error(`Errore durante la ricerca per "${query}":`, error);
            // Non blocchiamo tutto se una singola ricerca fallisce, andiamo avanti.
        }
    }

    // Convertiamo la mappa di video in un array
    const finalVideos = Array.from(allVideosMap.values());

    console.log(`Lavoro completato. Trovati in totale ${finalVideos.length} video unici.`);

    return {
        statusCode: 200,
        body: JSON.stringify(finalVideos)
    };
};