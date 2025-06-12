// Questo è il codice della nostra funzione "segreta" che gira sui server di Netlify

exports.handler = async function(event, context) {
    // Prendiamo la nostra chiave API segreta che imposteremo su Netlify
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    // Prendiamo il termine di ricerca che ci arriva dalla nostra app
    const searchTerm = event.queryStringParameters.q || 'Tessiland';

    // L'indirizzo dell'API di YouTube per la ricerca
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=20`;

    try {
        // Usiamo 'fetch' per chiamare l'API di YouTube
        const response = await fetch(url);
        const data = await response.json();

        // Estraiamo solo le informazioni che ci servono
        const videos = data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            channel: item.snippet.channelTitle
        }));

        // Restituiamo i video alla nostra app
        return {
            statusCode: 200,
            body: JSON.stringify(videos)
        };

    } catch (error) {
        // In caso di errore, lo comunichiamo
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Errore durante la ricerca su YouTube' })
        };
    }
};