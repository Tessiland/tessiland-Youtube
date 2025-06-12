// FUNZIONE DI RICERCA AVANZATA ("DEEP SEARCH") - VERSIONE CORRETTA

exports.handler = async function(event, context) {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const MY_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    // 1. Prendi la query di ricerca GIA' COSTRUITA dal frontend
    const searchTerm = event.queryStringParameters.q || 'tutorial uncinetto';
    
    // 2. Esegui la RICERCA AMPIA su YouTube
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&relevanceLanguage=it&key=${YOUTUBE_API_KEY}&maxResults=50`;

    try {
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            return { statusCode: 200, body: JSON.stringify([]) };
        }

        const videoIds = searchData.items.map(item => item.id.videoId).join(',');

        // 3. Esegui la SECONDA CHIAMATA per avere i dettagli completi
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (!detailsData.items) {
             return { statusCode: 200, body: JSON.stringify([]) };
        }

        // 4. FILTRAGGIO INTELLIGENTE
        const finalVideos = detailsData.items
            .filter(item => {
                const description = (item.snippet.description || '').toLowerCase();
                const title = (item.snippet.title || '').toLowerCase();
                const channelId = item.snippet.channelId;
                
                const mentionsTessiland = description.includes('tessiland') || title.includes('tessiland');
                const isNotMyChannel = channelId !== MY_CHANNEL_ID;

                return mentionsTessiland && isNotMyChannel;
            })
            .map(item => ({
                videoId: item.id,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.high.url,
                channel: item.snippet.channelTitle
            }));

        return { statusCode: 200, body: JSON.stringify(finalVideos) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Errore durante la ricerca avanzata' }) };
    }
};