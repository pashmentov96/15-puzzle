async function initDB() {
    let db = await idb.openDb("resultsDB", 1, db => {
        let results = db.createObjectStore("results_table", {autoIncrement: true});
        results.createIndex("by_score", "score");
        results.createIndex("by_time", "time");
    });
}

async function addResultDB(result) {
    let db = await idb.openDb("resultsDB", 1);
    let transaction = db.transaction("results_table", "readwrite");
    let results = transaction.objectStore("results_table");
    await results.add(result);
}

async function getResultsDB(index) {
    let db = await idb.openDb("resultsDB", 1);
    let transaction = db.transaction("results_table", "readwrite");
    let results = transaction.objectStore("results_table");
    let index_results = results.index(index);
    let request = await index_results.getAll();
    return request;
}