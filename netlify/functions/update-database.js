const { Octokit } = require("@octokit/rest");
const fetch = require('node-fetch');
const searchTaxonomy = require('../../search_taxonomy.json');

exports.handler = async function(event, context) {
    console.log("Robot v3.0 Incrementale attivato.");

    const { GITHUB_PAT, GITHUB_USERNAME, GITHUB_REPONAME, YOUTUBE_API_KEY, MY_CHANNEL_ID } = process.env;
    const dbPath = 'database.json';
    const octokit = new Octokit({ auth: GITHUB_PAT });

    // 1. Leggi il database esistente da GitHub
    let db = { lastRunIndex: -1, videos: [] };
    let currentSha;
    try {
        const response = await octokit.repos.getContent({ owner: GITHUB_USERNAME, repo: GITHUB_REPONAME, path: dbPath });
        currentSha = response.data.sha;
        db = JSON.parse(Buffer.from(response.data.content, 'base64').toString('utf8'));
    } catch (e) {
        if (e.status !== 404) throw e;
        console.log("Database non trovato, ne creo uno nuovo.");
    }

    // 2. Prepara le query e decidi quali eseguire in questo ciclo
    const queries = [];
    for (const tool in searchTaxonomy) {
        for (const category in searchTaxonomy[tool]) {
            searchTaxonomy[tool][category].forEach(synonym => queries.push(`${synonym} tessiland`));
        }
    }
    
    let nextIndex = (db.lastRunIndex || -1) + 1;
    if (nextIndex >= queries.length) nextIndex = 0; // Ricomincia il ciclo se ha finito

    const queriesToRun = queries.slice(nextIndex, nextIndex + 5); // Esegui 5 ricerche per ciclo
    console.log(`Eseguo ${queriesToRun.length} ricerche da indice ${nextIndex}.`);
    
    // 3. Cerca su YouTube e accumula i risultati
    const videosMap = new Map(db.videos.map(v => [v.videoId, v]));
    for (const query of queriesToRun) {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.items) {
            data.items.forEach(item => {
                if (item.snippet.channelId !== MY_CHANNEL_ID) {
                    videosMap.set(item.id.videoId, {
                        videoId: item.id.videoId,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.high.url,
                        channel: item.snippet.channelTitle
                    });
                }
            });
        }
    }

    // 4. Salva il database aggiornato su GitHub
    const updatedVideos = Array.from(videosMap.values());
    const newDbContent = {
        lastUpdated: new Date().toISOString(),
        lastRunIndex: nextIndex + queriesToRun.length -1,
        videos: updatedVideos
    };

    await octokit.repos.createOrUpdateFileContents({
        owner: GITHUB_USERNAME,
        repo: GITHUB_REPONAME,
        path: dbPath,
        message: `[ROBOT] DB Update. Indice: ${newDbContent.lastRunIndex}. Video totali: ${updatedVideos.length}`,
        content: Buffer.from(JSON.stringify(newDbContent, null, 2)).toString('base64'),
        sha: currentSha
    });

    return { statusCode: 200, body: `Database aggiornato. Indice di ricerca: ${newDbContent.lastRunIndex}. Video totali: ${updatedVideos.length}` };
};