// Il nostro "Robot Lavoratore" v3.0 - Ricerca e Salvataggio
// Scopo: Eseguire ricerche, accumulare risultati e salvare tutto nel database.json

const { Octokit } = require("@octokit/rest");

exports.handler = async function(event, context) {
    console.log("Robot con potere di scrittura attivato...");

    // Informazioni per autenticarsi e scrivere su GitHub
    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner = process.env.GITHUB_USERNAME;
    const repo = process.env.GITHUB_REPONAME;
    const path = 'database.json';

    // Chiave API di YouTube
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    // Lista di ricerche da eseguire
    const searchQueries = [
        "tutorial uncinetto tessiland", "tutorial ferri tessiland", "amigurumi tessiland",
        "borsa uncinetto tessiland", "scialle uncinetto tessiland", "maglia ferri tessiland",
        "copertina uncinetto tessiland", "filato tessiland", "cordino thai tessiland",
        "recensione prodotti tessiland", "haul tessiland"
    ];

    try {
        // 1. LEGGI IL DATABASE ATTUALE DA GITHUB
        let existingData = { videos: [] };
        let currentSha;
        try {
            const response = await octokit.repos.getContent({ owner, repo, path });
            currentSha = response.data.sha;
            const content = Buffer.from(response.data.content, 'base64').toString('utf8');
            existingData = JSON.parse(content);
        } catch (error) {
            if (error.status === 404) {
                console.log("database.json non trovato, ne verrà creato uno nuovo.");
            } else {
                throw error;
            }
        }
        
        const existingVideosMap = new Map(existingData.videos.map(v => [v.videoId, v]));

        // 2. ESEGUI LE NUOVE RICERCHE SU YOUTUBE
        for (const query of searchQueries) {
            const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&relevanceLanguage=it&key=${YOUTUBE_API_KEY}&maxResults=50`;
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (searchData.items) {
                searchData.items.forEach(item => {
                    if (!existingVideosMap.has(item.id.videoId)) {
                         existingVideosMap.set(item.id.videoId, {
                            videoId: item.id.videoId,
                            title: item.snippet.title,
                            thumbnail: item.snippet.thumbnails.high.url,
                            channel: item.snippet.channelTitle,
                            // Aggiungeremo altri dettagli in futuro
                         });
                    }
                });
            }
        }

        // 3. PREPARA IL NUOVO DATABASE AGGIORNATO
        const updatedVideos = Array.from(existingVideosMap.values());
        const newDbContent = {
            lastUpdated: new Date().toISOString(),
            videos: updatedVideos
        };

        // 4. SCRIVI IL FILE AGGIORNATO SU GITHUB
        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: `Aggiornamento automatico del database: ${updatedVideos.length} video totali`,
            content: Buffer.from(JSON.stringify(newDbContent, null, 2)).toString('base64'),
            sha: currentSha // Necessario per aggiornare un file esistente
        });

        const successMessage = `Database aggiornato con successo. Video totali: ${updatedVideos.length}`;
        console.log(successMessage);
        return { statusCode: 200, body: JSON.stringify({ message: successMessage }) };

    } catch (error) {
        console.error('Errore fatale nel robot:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};