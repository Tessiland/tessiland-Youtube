// Il nostro "Robot Lavoratore" v3.1 - Anti-Timeout
// Scopo: Eseguire un numero limitato di ricerche per rimanere entro i 10 secondi.

const { Octokit } = require("@octokit/rest");
const fetch = require('node-fetch');
// Assicurati che il percorso del file JSON sia corretto
const searchTaxonomy = require('../../search_taxonomy.json');

exports.handler = async function(event, context) {
    console.log("Robot Anti-Timeout attivato...");

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const GITHUB_PAT = process.env.GITHUB_PAT;
    const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
    const GITHUB_REPONAME = process.env.GITHUB_REPONAME;
    const dbPath = 'database.json';

    // Controlla che le variabili d'ambiente essenziali esistano
    if (!YOUTUBE_API_KEY || !GITHUB_PAT || !GITHUB_USERNAME || !GITHUB_REPONAME) {
        const errorMessage = "Errore: una o più variabili d'ambiente non sono configurate.";
        console.error(errorMessage);
        return { statusCode: 500, body: JSON.stringify({ error: errorMessage }) };
    }

    const octokit = new Octokit({ auth: GITHUB_PAT });

    // Genera tutte le possibili query dal dizionario
    const allQueries = [];
    for (const tool in searchTaxonomy) {
        for (const category in searchTaxonomy[tool]) {
            for (const synonym of searchTaxonomy[tool][category]) {
                allQueries.push(`tutorial ${synonym}`);
            }
        }
    }

    try {
        let existingData = { lastUpdated: new Date(0).toISOString(), videos: [] };
        let currentSha;
        try {
            const response = await octokit.repos.getContent({ owner: GITHUB_USERNAME, repo: GITHUB_REPONAME, path: dbPath });
            currentSha = response.data.sha;
            const content = Buffer.from(response.data.content, 'base64').toString('utf8');
            existingData = JSON.parse(content);
        } catch (error) {
            if (error.status !== 404) throw error;
            console.log("database.json non trovato, ne verrà creato uno nuovo.");
        }
        
        const allVideosMap = new Map(existingData.videos.map(v => [v.videoId, v]));
        
        // ESEGUIAMO SOLO LE PRIME 3 RICERCHE per stare nei tempi
        const queriesToRun = allQueries.slice(0, 3);
        console.log(`Eseguo ${queriesToRun.length} ricerche su ${allQueries.length} totali.`);

        for (const query of queriesToRun) {
            const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&relevanceLanguage=it&key=${YOUTUBE_API_KEY}&maxResults=10`;
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (searchData.items) {
                searchData.items.forEach(item => {
                    allVideosMap.set(item.id.videoId, {
                        videoId: item.id.videoId,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.high.url,
                        channel: item.snippet.channelTitle
                    });
                });
            }
            await new Promise(resolve => setTimeout(resolve, 100)); // Piccola pausa
        }

        const updatedVideos = Array.from(allVideosMap.values());
        const newDbContent = {
            lastUpdated: new Date().toISOString(),
            videos: updatedVideos
        };

        await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_USERNAME,
            repo: GITHUB_REPONAME,
            path: dbPath,
            message: `[ROBOT] Aggiornamento parziale DB: ${updatedVideos.length} video totali`,
            content: Buffer.from(JSON.stringify(newDbContent, null, 2)).toString('base64'),
            sha: currentSha
        });

        const successMessage = `Lavoro parziale completato. Database aggiornato con ${updatedVideos.length} video.`;
        return { statusCode: 200, body: JSON.stringify({ message: successMessage }) };

    } catch (error) {
        console.error('Errore fatale nel robot:', error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};