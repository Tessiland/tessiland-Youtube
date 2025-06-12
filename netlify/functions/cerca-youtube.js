// FUNZIONE DI RICERCA AVANZATA ("DEEP SEARCH")

// Questa funzione prima esegue una ricerca ampia su YouTube,
// poi ispeziona i dettagli di ogni video per trovare menzioni di "Tessiland".

exports.handler = async function(event, context) {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const MY_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    // 1. Prendi i parametri dalla nostra app (frontend)
    const searchTerm = event.queryStringParameters.q || 'tutorial uncinetto';
    const order = event.queryStringParameters.order || 'relevance';

    // 2. Esegui la RICERCA AMPIA su YouTube
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&order=${order}&key=${YOUTUBE_API_KEY}&maxResults=50`;

    try {
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            return { statusCode: 200, body: JSON.stringify([]) };
        }

        // 3. Prepara la DEEP INSPECTION: prendi gli ID di tutti i video trovati
        const videoIds = searchData.items.map(item => item.id.videoId).join(',');

        // 4. Esegui la SECONDA CHIAMATA per avere i dettagli completi (incluse le descrizioni)
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        // 5. FILTRAGGIO INTELLIGENTE: Ispeziona ogni video
        const finalVideos = detailsData.items
            .filter(item => {
                const description = item.snippet.description.toLowerCase();
                const title = item.snippet.title.toLowerCase();
                const channelId = item.snippet.channelId;
                
                // Criteri:
                const mentionsTessiland = description.includes('tessiland') || title.includes('tessiland');
                const isNotMyChannel = channelId !== MY_CHANNEL_ID;

                return mentionsTessiland && isNotMyChannel;
            })
            .map(item => ({ // Formatta i dati per la nostra app
                videoId: item.id,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.high.url,
                channel: item.snippet.channelTitle
            }));

        // 6. Restituisci i risultati di alta qualità
        return {
            statusCode: 200,
            body: JSON.stringify(finalVideos)
        };

    } catch (error) {
        console.error('Errore nella funzione di ricerca:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Errore durante la ricerca avanzata' }) };
    }
};