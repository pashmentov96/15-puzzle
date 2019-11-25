async function initDB() {
    let db = await idb.openDb("resultsDB", 2, db => {
        switch (db.oldVersion) {
            case 0:
                let results = db.createObjectStore("results_table", {autoIncrement: true});
                results.createIndex("by_score", "score");
                results.createIndex("by_time", "time");
            case 1:
                let time_segments = db.createObjectStore("time_segments_table", {autoIncrement: true});
                time_segments.createIndex("by_start", "start");
                time_segments.createIndex("by_finish", "finish");
                break;
        }

    });
}

async function addTimeSegment(start, finish) {
    console.log("[" + start + ", " + finish + "]");
    let segment = {start: start, finish: finish};
    let db = await idb.openDb("resultsDB", 2);
    let transaction = db.transaction("time_segments_table", "readwrite");
    let time_segments = transaction.objectStore("time_segments_table");
    await time_segments.add(segment);
}

async function getTimeSegments() {
    let db = await idb.openDb("resultsDB", 2);
    let transaction = db.transaction("time_segments_table");
    let time_segments = transaction.objectStore("time_segments_table");
    //let index_results = results.index(index);
    let request = await time_segments.getAll();
    return request;
}

async function clearTimeSegments() {
    localStorage.removeItem("start_segment");
    localStorage.removeItem("finish_segment");
    let db = await idb.openDb("resultsDB", 2);
    let transaction = db.transaction("time_segments_table", "readwrite");
    let time_segments = transaction.objectStore("time_segments_table");
    time_segments.clear();
}

async function addResultDB(result) {
    let db = await idb.openDb("resultsDB", 2);
    let transaction = db.transaction("results_table", "readwrite");
    let results = transaction.objectStore("results_table");
    await results.add(result);
}

async function getResultsDB(index) {
    let db = await idb.openDb("resultsDB", 2);
    let transaction = db.transaction("results_table");
    let results = transaction.objectStore("results_table");
    let index_results = results.index(index);
    let request = await index_results.getAll();
    return request;
}