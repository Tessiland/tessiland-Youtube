// Funzione per cercare su TUTTO YouTube, escludendo il canale Tessiland

exports.handler = async function(event, context) {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const MY_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    const searchTerm = event.queryStringParameters.q || 'Tessiland';
    const order = event.queryStringParameters.order || 'relevance';

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&order=${order}&key=${YOUTUBE_API_KEY}&maxResults=25`; // Ne cerco un po' di più per avere margine

    try {
        const response = await fetch(url);
        const data = await response.json();

        // FILTRIAMO I RISULTATI per escludere il canale ufficiale
        const filteredVideos = data.items.filter(item => item.snippet.channelId !== MY_CHANNEL_ID);

        const videos = filteredVideos.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            channel: item.snippet.channelTitle
        }));
        return { statusCode: 200, body: JSON.stringify(videos) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Errore durante la ricerca su YouTube' }) };
    }
};