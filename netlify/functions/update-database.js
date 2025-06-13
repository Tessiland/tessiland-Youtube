// Robot v3.2 - Con Logging Migliorato per Debug

const { Octokit } = require("@octokit/rest");
const fetch = require('node-fetch');
const searchTaxonomy = require('../../search_taxonomy.json');

exports.handler = async function(event, context) {
    console.log("HANDLER START: Robot v3.2 (Debug) attivato.");

    const { GITHUB_PAT, GITHUB_USERNAME, GITHUB_REPONAME, YOUTUBE_API_KEY, MY_CHANNEL_ID } = process.env;
    const dbPath = 'database.json';

    if (!GITHUB_PAT || !GITHUB_USERNAME || !GITHUB_REPONAME || !YOUTUBE_API_KEY) {
        const errorMsg = "ERRORE CRITICO: Una o più variabili d'ambiente non sono state trovate.";
        console.error(errorMsg);
        return { statusCode: 500, body: errorMsg };
    }
    console.log("OK: Variabili d'ambiente caricate.");

    const octokit = new Octokit({ auth: GITHUB_PAT });

    try {
        // STEP 1: Lettura del database esistente
        console.log(`Provo a leggere il file '${dbPath}' dal repo '${GITHUB_USERNAME}/${GITHUB_REPONAME}'...`);
        let existingData = { lastRunIndex: -1, videos: [] };
        let currentSha;
        try {
            const response = await octokit.repos.getContent({ owner: GITHUB_USERNAME, repo: GITHUB_REPONAME, path: dbPath });
            currentSha = response.data.sha;
            existingData = JSON.parse(Buffer.from(response.data.content, 'base64').toString('utf8'));
            console.log(`OK: Letto database esistente. SHA: ${currentSha}. Video presenti: ${existingData.videos.length}`);
        } catch (e) {
            if (e.status === 404) {
                console.log("ATTENZIONE: database.json non trovato. Verrà creato un nuovo file.");
            } else {
                throw new Error(`Errore durante la lettura da GitHub: ${e.message}`);
            }
        }

        const allVideosMap = new Map(existingData.videos.map(v => [v.videoId, v]));
        
        // STEP 2: Ricerca su YouTube
        // (Questa parte la omettiamo per ora per concentrarci sul salvataggio)
        console.log("OK: La ricerca su YouTube è temporaneamente disattivata per il test di scrittura.");
        
        // STEP 3: Scrittura del file su GitHub
        const updatedVideos = Array.from(allVideosMap.values());
        // Aggiungiamo un video fittizio per essere sicuri che ci sia una modifica da salvare
        updatedVideos.push({ videoId: `test_${Date.now()}`, title: "Test di scrittura dal robot" });

        const newDbContent = {
            lastUpdated: new Date().toISOString(),
            videos: updatedVideos
        };
        
        console.log(`Provo a scrivere ${updatedVideos.length} video su GitHub...`);
        await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_USERNAME,
            repo: GITHUB_REPONAME,
            path: dbPath,
            message: `[ROBOT DEBUG] Test di scrittura del database`,
            content: Buffer.from(JSON.stringify(newDbContent, null, 2)).toString('base64'),
            sha: currentSha
        });

        const successMessage = `TEST DI SCRITTURA RIUSCITO. Controlla il commit su GitHub.`;
        console.log(successMessage);
        return { statusCode: 200, body: successMessage };

    } catch (error) {
        console.error('ERRORE FATALE NEL ROBOT:', error);
        return { statusCode: 500, body: `Errore: ${error.message}` };
    }
};