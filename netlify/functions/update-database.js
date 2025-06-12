exports.handler = async function(event, context) {
    console.log("Esecuzione del robot lavoratore per aggiornare il database...");
    
    // In futuro, qui ci sarà la logica complessa per cercare su YouTube
    // e scrivere nel file database.json
    
    const message = "Lavoro del robot completato (versione di prova).";
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message })
    };
};