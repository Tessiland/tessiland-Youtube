// Il nostro "Robot Lavoratore" v1.0
// Scopo: Cercare su YouTube e restituire i risultati.

exports.handler = async function(event, context) {
    console.log("Robot attivato...");

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    // Per ora, facciamo una ricerca fissa di prova molto ampia.
    const searchTerm = "tutorial uncinetto";

    console.log(`Eseguo una ricerca ampia per: "${searchTerm}"`);

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&relevanceLanguage=it&key=${YOUTUBE_API_KEY}&maxResults=50`;

    try {
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ message: "La ricerca ampia non ha prodotto risultati." }) };
        }

        const videoIds = searchData.items.map(item => item.id.videoId).join(',');

        console.log("Eseguo l'ispezione profonda per trovare menzioni di 'Tessiland'...");
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        if (!detailsData.items) {
             return { statusCode: 200, body: JSON.stringify([]) };
        }

        const finalVideos = detailsData.items
            .filter(item => {
                const description = (item.snippet.description || '').toLowerCase();
                const title = (item.snippet.title || '').toLowerCase();
                return description.includes('tessiland') || title.includes('tessiland');
            })
            .map(item => ({
                videoId: item.id,
                title: item.snippet.title,
                channel: item.snippet.channelTitle
            }));
        
        console.log(`Ispezione completata. Trovati ${finalVideos.length} video pertinenti.`);

        return {
            statusCode: 200,
            body: JSON.stringify(finalVideos) // Restituisce i video trovati
        };

    } catch (error) {
        console.error('Errore nel robot:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};