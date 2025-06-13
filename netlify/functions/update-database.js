const { Octokit } = require("@octokit/rest");
const fetch = require('node-fetch');
const searchTaxonomy = require('../../search_taxonomy.json');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const MY_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

// Funzione per fare una pausa e non sovraccaricare l'API
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Funzione principale del robot
exports.handler = async function(event, context) {
    console.log("Robot Definitivo attivato. Inizio la caccia ai video.");

    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner = process.env.GITHUB_USERNAME;
    const repo = process.env.GITHUB_REPONAME;
    const dbPath = 'database.json';

    let existingData = { lastUpdated: new Date(0).toISOString(), videos: [] };
    let currentSha;

    try {
        const response = await octokit.repos.getContent({ owner, repo, path: dbPath });
        currentSha = response.data.sha;
        const content = Buffer.from(response.data.content, 'base64').toString('utf8');
        existingData = JSON.parse(content);
    } catch (error) {
        console.log("database.json non trovato o illeggibile. Ne verrà creato uno nuovo.");
    }

    const allVideosMap = new Map(existingData.videos.map(v => [v.videoId, v]));
    
    // Genera le query dal dizionario
    const queries = [];
    for (const tool in searchTaxonomy) {
        for (const category in searchTaxonomy[tool]) {
            for (const synonym of searchTaxonomy[tool][category]) {
                queries.push(`tutorial ${synonym}`);
            }
        }
    }
    
    console.log(`Generate ${queries.length} ricerche dal dizionario.`);

    for (const query of queries.slice(0, 50)) { // Limitiamo a 50 ricerche per run per non esaurire la quota
        await sleep(200); // Pausa per non sovraccaricare l'API
        console.log(`Cerco: "${query}"`);
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&relevanceLanguage=it&key=${YOUTUBE_API_KEY}&maxResults=10`;

        try {
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (searchData.items && searchData.items.length > 0) {
                const videoIds = searchData.items.map(item => item.id.videoId).join(',');
                const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
                const detailsResponse = await fetch(detailsUrl);
                const detailsData = await detailsResponse.json();

                if (detailsData.items) {
                    detailsData.items.forEach(item => {
                        const description = (item.snippet.description || '').toLowerCase();
                        const title = (item.snippet.title || '').toLowerCase();
                        if ((description.includes('tessiland') || title.includes('tessiland')) && item.snippet.channelId !== MY_CHANNEL_ID) {
                            if (!allVideosMap.has(item.id)) {
                                allVideosMap.set(item.id, {
                                    videoId: item.id,
                                    title: item.snippet.title,
                                    thumbnail: item.snippet.thumbnails.high.url,
                                    channel: item.snippet.channelTitle
                                });
                            }
                        }
                    });
                }
            }
        } catch (e) {
            console.error(`Errore per la query "${query}":`, e.message);
        }
    }

    const updatedVideos = Array.from(allVideosMap.values());
    const newDbContent = {
        lastUpdated: new Date().toISOString(),
        videos: updatedVideos
    };

    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: dbPath,
        message: `[ROBOT] Aggiornamento DB: ${updatedVideos.length} video totali`,
        content: Buffer.from(JSON.stringify(newDbContent, null, 2)).toString('base64'),
        sha: currentSha
    });

    const successMessage = `Lavoro completato. Database aggiornato con ${updatedVideos.length} video.`;
    console.log(successMessage);
    return { statusCode: 200, body: JSON.stringify({ message: successMessage }) };
};