// Funzione per prendere gli ultimi video dal canale ufficiale Tessiland

exports.handler = async function(event, context) {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    // Cerca gli ultimi video pubblicati da un canale specifico
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&key=${YOUTUBE_API_KEY}&maxResults=20`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const videos = data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            channel: item.snippet.channelTitle
        }));
        return { statusCode: 200, body: JSON.stringify(videos) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Errore nel recupero video del canale' }) };
    }
};