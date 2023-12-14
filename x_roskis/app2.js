const log = console.log;
const MongoClient = require('mongodb').MongoClient;
//const { MongoClient } = require("mongodb");
const url  = "mongodb://localhost:27017/mydb";




async function run() {
    let db;

    try {
        log('try connect');

        db = await MongoClient.connect(url);
        log('connected');

      
        await db.listCollections().toArray();  


        //await list( db.listCollections().toArray() );  
        //await log( db.collection('persons') );

        /*
        db.collection('persons').count(function (err, count) {
            if (err) throw err;
            
            console.log('Total Rows: ' + count);
        });
        */



        
    } catch (e) {
        log('catch error');
        console.error(e);
        
    } finally {
        log('close client');
        if (db) await db.close();
    }
}

run();



const list = data => {


    log(data)

}


