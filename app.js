// app.js


import {log} from './modules/log.js';



import express from 'express';
const app = express();


app.use(express.urlencoded({extended: true})); 
app.use(express.json());


//createRequire is used to import CommonJS modules (the 'require' syntax) in a ES module.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);



import path from 'path';
const __dirname = path.resolve();

// Set EJS View Engine**
app.set('view engine','ejs');
// Set HTML engine**
app.engine('html', require('ejs').renderFile);
//set directory
app.set('views', __dirname + '/views');
//static folder
app.use(express.static('public'));


const mongoose = require('mongoose');
const connect = mongoose.connect;
const connection = mongoose.connection;
const url = 'mongodb://localhost:27017';
const dbName = 'mydb'; 

// Import models for collections (tables)
import Playlist from './model/playlist.js';
import Artist from './model/artist.js';
import Track from './model/track.js';
import Album from './model/album.js';





const connectToDb = async () => {
    connect(`${url}/${dbName}`).
        catch(error => console.log(error));

    return 'Connected successfully to server (Mongoose).';
}

connectToDb()
  .then(console.log)
  .catch(console.error)
  //.finally( () => client.close());

// Default endpoint
app.get('/', function (req, res) {
    log('/');
    //res.sendFile('/index.html' , {root: 'public'});
    res.render('collections', {});
});  




// Get all documents in a collection
const getAllDocuments = async collection => {
    const filter = {};
    const findResult = await collection.find(filter);
    return findResult;

    /* let json = JSON.stringify(findResult);
    json = JSON.parse(json);
    return json; */
}


// Get document 
const getDocument = async (id, collection) => {
    let doc = null;

    try {
        doc = await collection.findById(id).exec();
        //doc = await collection.findOne({ id });
    } catch (e) {
        console.error(e);
    } finally {
        return doc;
    }
}

//
const getName = async (id, collection) => {
    let name = undefined;
    try {
        let doc = await collection.findById(id).exec();
        name = doc.name;
    } catch (e) {
        console.error(e);
    } finally {
        return doc;
    }
}



// Create new document 
const createDocument = async (docObject, collection) => {
    const newDoc = await collection.create(docObject);
    return newDoc;
}


// Delete document 
const deleteDocument = async (id, collection) => {
    await collection.deleteOne({ _id: id }); 
    log(`Deleted document <${id}>`);
}


// Update document
const updateDocument = async (id, docObject, collection) => {
    try {
        const doc = await collection.findOne( {_id: id} );
        doc.overwrite(docObject);
        await doc.save();
        log(`Updated document <${id}>`);

    } catch (e) {
        console.error(e);
    } finally {
        //return doc;
    }
}


// Add/remove track from playlist
const changeTrackInPlaylist = async (trackId, listId, addTrack) => {
    const list = await getDocument(listId, Playlist);
    
    const obj = {
        name: list.name,
        desc: list.desc,
        image: list.image,
        imageSmall: list.imageSmall,
        tracks: list.tracks
    }

    const i = obj.tracks.indexOf(trackId);

    if (addTrack) {
        // Prevent duplicate tracks in playlist
        if (i > -1) {
            return false
        } else {
            obj.tracks.push(trackId);
        }
    } else {
        if (i > -1) { // only splice array when item is found
            obj.tracks.splice(i, 1); // 2nd parameter means remove one item only
        }
    }

    await updateDocument(list._id, obj, Playlist);
    return true;
}


const addToPlaylist = async (trackId, listId) => {
    await changeTrackInPlaylist(trackId, listId, true);
}

const removeFromPlaylist = async (trackId, listId) => {
    await changeTrackInPlaylist(trackId, listId, false);
}




/*** Collection endpoints ***/

// Get all collections in db
app.get('/api/collections', async function (req, res) {
    log('/api/collections');

    let a = 'lol'
    res.send(a)

    //const colls = await getAllCollections();
    //res.send(colls);

});

// Show all collections (tables)
app.get('/collections', async function (req, res) {
    log('/collections');
    const collections = await connection.db.listCollections().toArray();

    const names = [];

    for (const col of collections) {
        names.push(col.name);
    }

    res.render('collections', {colNames:names, colAmount: names.length});
});


// View page to add new collection
app.get('/add-collection', function (req, res) {
    res.render('add-collection', {});
});


// Submit new collection
app.post('/submit-collection', function (req, res) {
    const name = req.body.name;
    res.render('message-page', {name:name, msg:'Created new collection', url:'/collections'});
});



app.get('/collections/delete/:colName', function (req, res) {
    const name = req.params.colName;
    log(`/collections/delete/${name}`);
   
    connection.db.dropCollection(name, function(err, result) {
        // tämä toimii ja collection dropataan,
        // mutta konsoliin ei tulostu alla oleva:
        log(`Dropped collection: ${name}`);
    });
});




/*** Playlist endpoints ***/

// All playlists
app.get('/playlists', async function (req, res) {
    log('/playlists');
    const playlists = await getAllDocuments(Playlist);
    //log(playlists)
    res.render('playlists', {playlists:playlists});
});

// Page to add new playlist
app.get('/add-playlist', async function (req, res) {
    log('/add-playlist');
    res.render('add-playlist', {});
});

// Create new playlist
app.post('/submit-playlist', async function (req, res) {
    log('/submit-playlist');

    const obj = {
        name: req.body.name,
        desc: req.body.desc,
        image: req.body.image,
        imageSmall: req.body.imageSmall,
    }

    await createDocument(obj, Playlist);
    res.render('message-page', {doc:obj, msg:'Created new document', url:'/playlists'});
});


// View/edit playlist
app.get('/playlist/:id', async function (req, res) {
    log(`/playlist/${req.params.id}`);
    const doc = await getDocument(req.params.id, Playlist);
    res.render('playlist', { playlist:doc } );
})


// Update playlist
app.post('/update-playlist', async function (req, res) {
    log('/update-playlist');
    log('Request body:');
    log(req.body);

    const list = await getDocument(req.body.id, Playlist);

    const newValues = {
        name: req.body.name,
        desc: req.body.desc,
        desc: req.body.desc,
        image: req.body.image,
        imageSmall: req.body.imageSmall,
        tracks: list.tracks
    }


    await updateDocument(req.body.id, newValues, Playlist)
    res.render('message-page', {doc:newValues, msg:'Updated document', url:'/playlists'});
});


// Delete playlist
app.get('/playlist/:id/delete', async function (req, res) {
    log('/playlist/:id/delete');
    await deleteDocument(req.params.id, Playlist);
    res.render('message-page', {doc:req.params.id, msg:'Deleted document', url:'/playlists' });
});


/*** Tracks endpoints ***/

// Get all tracks
app.get('/tracks', async function (req, res) {
    log('/tracks');

    const tracks = await getAllDocuments(Track);
    const artists = await getAllDocuments(Artist);
    const albums = await getAllDocuments(Album);

    const artistIds = artists.map(artists => artists._id.toString());
    const albumIds = albums.map(albums => albums._id.toString());

    // Add artistName prop to track for viewing
    for (const track of tracks) {

        const artistIndex = artistIds.indexOf(track.artist);
        const artist = artists[artistIndex];

        const albumIndex = albumIds.indexOf(track.album);
        const album = albums[albumIndex];

        let artistName = '-';
        let albumName = '-';

        if (artist !== undefined) {
            artistName = artist.name;
        }

        if (album !== undefined) {
            albumName = album.name;
        }

        track.artistName = artistName;
        track.albumName = albumName;
    }



    res.render('tracks', {tracks:tracks});
 
});


// Get one track
app.get('/track/:id', async function (req, res) {
    log(`/track/${req.params.id}`);

    const doc = await getDocument(req.params.id, Track);
    const artists = await getAllDocuments(Artist);
    const albums = await getAllDocuments(Album);
    const playlists = await getAllDocuments(Playlist);

    doc.playlists = [];

    // Playlists which the track isn't in
    const unselectedPlaylists = [];


    // Add selected playlists to a doc prop, 
    // otherwise add to list of unselected lists
    for (const list of playlists) {
        if ( list.tracks.includes(doc._id) ) {
            log(`Track is in playlist: ${list.name}`);
            doc.playlists.push(list._id);
        } else {
            unselectedPlaylists.push(list);
        }
    }


    //default value if track doesnt have artist
    let selectedArtist = { name:null } 

    // Get currently selected artist for track, it may not have one
    const artist = await getDocument(doc.artist, Artist);

    if (artist !== null) {
        selectedArtist = artist;
        log(`Track has selected artist: ${selectedArtist.name}`);
    } else {
        log(`Track doesn't have selected artist.`);
    }



    // Add artistName prop to album with nested loops
    for (const album of albums) {
        let artistName = '';

        for (let artist of artists) {
            if (album.artist === artist._id.toString()) {
                artistName = artist.name;
                album.artistName = artistName;
                break;
            }
        }
    }

     //default value if track doesnt have album
     let selectedAlbum = { name:null } 

     // Get currently selected artist for track, it may not have one
     const album = await getDocument(doc.album, Album);
 
     if (album !== null) {
        selectedAlbum = album;
         //log(`Track has selected album: ${selectedAlbum.name}`);
     } else {
        // log(`Track doesn't have selected album.`);
     }


    res.render('track', { track:doc, artists:artists, albums:albums, artist:selectedArtist, album:selectedAlbum, allPlaylists:playlists } );
})


// Delete track
app.get('/track/:id/delete', async function (req, res) {
    log('/track/:id/delete');
    await deleteDocument(req.params.id, Track);
    res.render('message-page', {doc:req.params.id, msg:'Deleted document', url:'/tracks'});
});



// Show page to add track
app.get('/add-track', async function (req, res) {
    log('/add-track');

    const artists = await getAllDocuments(Artist);
    const albums = await getAllDocuments(Album);
    const playlists = await getAllDocuments(Playlist);

    // Add artistName prop to album with nested loops
    for (let album of albums) {
        let artistName = '';

        for (let artist of artists) {
            if (album.artist === artist._id.toString()) {
                artistName = artist.name;
                album.artistName = artistName;
                break;
            }
        }
    }

    res.render('add-track', {artists:artists, albums:albums, allPlaylists:playlists});
});


app.get('/add-track/:name', async function (req, res) {
    log('/add-track');

    const artists = await getAllDocuments(Artist);
    res.render('add-track', {artists:artists});
});



// Create new track
app.post('/submit-track', async function (req, res) {
    log('/submit-track');

    const obj = {
        name: req.body.name,
        artist: req.body.artist,
        album: req.body.album,
    }


    const newTrack = await createDocument(obj, Track);
    const trackId = newTrack._id;

    const selectedLists = req.body.playlists || [];
    const playlists = await getAllDocuments(Playlist);

    for (const list of playlists) {
        const listId = list._id.toString();

        if (!list.tracks.includes(trackId) && selectedLists.includes(listId)) {
            // List is selected, add track to it
            addToPlaylist(trackId, listId);
            log(`DEBUG: Adding track to playlist: ${list.name}`);
        }
   
    }

    res.render('message-page', {doc:obj, msg:'Created new document', url:'/tracks'});

  
});



// Update track
app.post('/update-track', async function (req, res) {
    log('/update-track');

    log('Request body:')
    log(req.body);

    const newValues = {
        name: req.body.name,
        artist: req.body.artist,
        album: req.body.album,
    }

    const trackId = req.body.id;
    await updateDocument(trackId, newValues, Track);


    const selectedLists = req.body.playlists || [];
    log(selectedLists)
    const playlists = await getAllDocuments(Playlist);

    // Loop through playlists,
    // check if we need to add or remove the track

    
    for (const list of playlists) {
        const listId = list._id.toString();

        if (!list.tracks.includes(trackId) && selectedLists.includes(listId)) {
            // List is selected and doesn't have the track already,
            // add track to list.  
            addToPlaylist(trackId, listId);
            log(`DEBUG: Adding track to playlist: ${list.name}`);
        } else if (list.tracks.includes(trackId) && !selectedLists.includes(listId)) {
            // The list has the track but the list is not selected,
            // remove the track from the list.
            removeFromPlaylist(trackId, listId);
            log(`DEBUG: Removing track from playlist: ${list.name}`);
        } 
   
    }



    res.render('message-page', {doc:newValues, msg:'Updated document', url:'/tracks'});
});



/*** Artist endpoints ***/


// Get all artists
app.get('/artists', function (req, res) {
    log('/artists');
    getAllDocuments(Artist).then( result => {
        res.render('artists', {artists:result});
    });
});


// Get one artist
app.get('/artist/:id', async function (req, res) {
    log(`/artist/${req.params.id}`);
    const doc = await getDocument(req.params.id, Artist);

    log(doc._id);
    res.render('artist', {artist:doc});
});

// Delete artist
app.get('/artist/:id/delete', async function (req, res) {
    log('/artist/:id/delete');
    await deleteDocument(req.params.id, Artist);
    res.render('message-page', {doc:req.params.id, msg:'Deleted document', url:'/artists'});
});


// Show page to add artist
app.get('/add-artist', function (req, res) {
    log('/add-artist');
    res.render('add-artist', {});
});


// Create new artist
app.post('/submit-artist', async function (req, res) {
    log('/submit-artist');

    const obj = {
        name: req.body.name,
        country: req.body.country
    }

    await createDocument(obj, Artist);
    res.render('message-page', {doc:obj, msg:'Created new document', url:'/artists'});
});


// Submit new artist from track page, "quick submit"
app.get('/submit-artist/:name', async function (req, res) {
    log('/submit-artist');
    let name = req.params.name;
    log(name)

    const obj = {
        name: req.params.name,
    }

    await createDocument(obj, Artist);


    const artists = await getAllDocuments(Artist);
    res.render('add-track', {artists:artists});
    //res.render('add-track', {});
});


// Update artist
app.post('/update-artist', async function (req, res) {
    log('/update-artist');

    const newValues = {
        name: req.body.name,
        country: req.body.country
    }

    await updateDocument(req.body.id, newValues, Artist)
    res.render('message-page', {doc:newValues, msg:'Updated document', url:'/artists'});
});



/*** Album endpoints ***/

// Get all albums
app.get('/albums', async function (req, res) {
    log('/albums');
    const albums = await getAllDocuments(Album);


    const artists = await getAllDocuments(Artist);
    const artistIds = artists.map(artists => artists._id.toString());

    // Add artistName prop to album for view
    for (const album of albums) {
        const artistIndex = artistIds.indexOf(album.artist);
        const artist = artists[artistIndex];

        let artistName = '-';
        if (artist !== undefined) {
            artistName = artist.name 
        }
        album.artistName = artistName;
    }


    res.render('albums', {albums:albums});
  
});



// Get one album
app.get('/album/:id', async function (req, res) {
    log(`/album/${req.params.id}`);
    const doc = await getDocument(req.params.id, Album);
    const artists = await getAllDocuments(Artist);

    // Get currently selected artist for track, it may not have one
    /*
    doc.artistName = { name:null } 
    const artist = await getDocument(doc.artist, Artist);
    if (artist !== null) {
        doc.artistName = artist.name;
    }
    */
    //log(doc._id);
    res.render('album', {album:doc, artists:artists});
});



// Delete artist
app.get('/album/:id/delete', async function (req, res) {
    log('/album/:id/delete');
    await deleteDocument(req.params.id, Album);
    res.render('message-page', {doc:req.params.id, msg:'Deleted document', url:'/albums'});
});


// Show page to add album
app.get('/add-album', async function (req, res) {
    log('/add-album');
    const artists = await getAllDocuments(Artist);
    res.render('add-album', {artists:artists});
});


// Create new album
app.post('/submit-album', async function (req, res) {
    log('/submit-album');

    const obj = {
        name: req.body.name,
        year: req.body.year,
        image: req.body.image,
        artist: req.body.artist
    }

    await createDocument(obj, Album);
    res.render('message-page', {doc:obj, msg:'Created new document', url:'/albums'});
});


// Update album
app.post('/update-album', async function (req, res) {
    log('/update-album');

    const newValues = {
        name: req.body.name,
        year: req.body.year,
        image: req.body.image,
        artist: req.body.artist
    }

    await updateDocument(req.body.id, newValues, Album)
    res.render('message-page', {doc:newValues, msg:'Updated document', url:'/albums'});
});


//import { playlists as _playlists, tracks as _tracks } from './public/js/music-list-data.json';
//import { playlists as _playlists, tracks as _tracks } from './public/js/music-list-data.json'  assert { type: "json" };;
//import packageJsonExample1 from "./public/js/music-list-data.json" assert { type: "json" };

const data = require('./public/js/music-list-data.json');
const _tracks = data.tracks;
const _playlists = data.playlists;

// Add test data from json file
app.get('/add-test-data', async function (req, res) {


    const file = '/js/music-list-data.json';
    const addedArtists = [];
    const addedAlbums = [];
    const addedTracks = [];

  

    // Add new playlists
    for (const list of _playlists) {
        // the new playlist object
        const obj = {
            name: list.name.trim(),
            //name:'asd',
            desc: null,
            image: null,
            imageSmall: null,
            tracks: []
        }

        //log(typeof list.image);

        // Add props to playlist object if it has those
        if (list.desc !== null) {
            obj.desc = list.desc;
        }

        if (list.image !== null) {
            obj.image = list.image;
            //log(list.image);
        }

        if (list.imageSmall !== null) {
            obj.imageSmall = list.imageSmall;
        }

        await createDocument(obj, Playlist);
    }

    


     // Add new artists
    for (const track of _tracks) {

        let artist = track.artist.trim();

       

        if (addedArtists.indexOf(artist) === -1 ) {
            addedArtists.push(artist);

            const obj = {
                name: artist,
                country: undefined
            }
            await createDocument(obj, Artist);
        }
    }


    // Get all artists to get ids for albums
    const artists = await getAllDocuments(Artist);


    // Add new albums
    for (const track of _tracks) {

        let album = track.album;
        if (album !== null) {
            album = album.trim();
        }

        const artist = track.artist.trim();

        if (album !== null) {
            // Make a "composite key" out of album and artist name
            const albumKey = `${artist} ${album}`;
           
            // Add props to new album object if data has them
            if (addedAlbums.indexOf(albumKey) === -1 ) {
                addedAlbums.push(albumKey);

                const obj = {
                    name:album,
                    year:null,
                    image:null,
                    artist:null,
                }

                if (track.year !== null) {
                    obj.year = track.year;
                }

                if (album.img !== null) {
                    obj.image = track.img;
                }

                // Find artist id based on name
                for (const item of artists) {
                    if (track.artist === item.name) {
                        obj.artist = item._id;
                        continue;
                    } 
                }

                await createDocument(obj, Album);
            }
        }
    }



    // Get all albums to get ids for tracks
    const albums = await getAllDocuments(Album);

    // Add new tracks
    for (const track of _tracks) {
        
        const trackName = track.name.trim();
        const trackArtist = track.artist.trim();
        let trackAlbum = track.album;
        if (trackAlbum !== null) { trackAlbum = trackAlbum.trim(); }
     

        //the track object
        const obj = {
            name: trackName,
            artist:null,
            album:null,
        }

        // Make a "composite key" out of artist and track name
        const trackKey = `${trackArtist} ${trackName}`;

        // Add props to new track object if data has them
        if (addedTracks.indexOf(trackKey) === -1 ) {
            addedTracks.push(trackKey); 

            // Find artist id based on name
            if (trackArtist !== null) {
                for (const artist of artists) {
                    if (artist.name === trackArtist) {
                        obj.artist = artist._id;
                        continue;
                    }
                }
            }   

            // If track has album, find album id
            if (track.album !== null) {
            
                //Find album id based on name (this doesn't work if albums have same names)
                for (const album of albums) {
                    if (album.name === trackAlbum) {
                        obj.album = album._id;
                        continue;
                    }
                }
            }


           

        }

        const newDoc = await createDocument(obj, Track);
        const playlists = await getAllDocuments(Playlist);

         // Add track to correct playlists if it has those
         if (track.pl.length > 0) {

            // Loop through all playlists the track has.
            // Track has an array of playlist names as strings.
            // Eg. ['Power metal', 'Black metal']
            for (const tracksPlaylist of track.pl) {

                // Find the matching playlist doc by matching names
                for (const list of playlists) {
                    if (tracksPlaylist === list.name) {
                        // Correct playlist found
                        // Add track to this playlist
                        await addToPlaylist(newDoc._id, list._id);
                    }
                }

            }

        }


    }


    //res.render('message-page', {doc:{name:'music-list-data.json'}, msg:`Added ${addedArtists.length} artists`, url:'/albums'});


    res.sendFile(file , {root: 'public'});
});

// Delete all data
app.get('/delete-test-data', async function (req, res) {
    log('/data');

    const artists = await getAllDocuments(Artist);
    for (const item of artists) {
        await deleteDocument(item._id, Artist);
    }

    const albums = await getAllDocuments(Album);
    for (const item of albums) {
        await deleteDocument(item._id, Album);
    }

    const tracks = await getAllDocuments(Track);
    for (const item of tracks) {
        await deleteDocument(item._id, Track);
    }

    const playlists = await getAllDocuments(Playlist);
    for (const item of playlists) {
        await deleteDocument(item._id, Playlist);
    }

    const file = '/js/music-list-data.json';
    res.sendFile(file , {root: 'public'});
});



class PlaylistObj {
    constructor(id, name, tracks) {
        this.id = id,
        this.name = name,
        this.tracks = tracks
    }
}

const getPlaylistObjects = async () => {
    const lists = [];
    const playlists = await getAllDocuments(Playlist);

   for (const list of playlists) {
        const listObj = new PlaylistObj(list._id, list.name, list.tracks);
        lists.push(listObj);
   }
   return lists;
}


app.get('/api/all-music', async function (req, res)  {
    const artists = await getAllDocuments(Artist);
    const albums = await getAllDocuments(Album);
    const tracks = await getAllDocuments(Track);
    const musicData = {artists, albums, tracks}
    res.send({ musicData });
});

app.get('/mega', async function (req, res)  {
    //log('/mega (get request)');

    const lists = await getPlaylistObjects();

    res.render('mega', {playlists:lists, selectedList:null });
});





app.post('/mega', async function (req, res)  {
    //log('/mega (post request)')
    const action = req.body.action;
    //log(action)

    if (action === 'getPlaylist') {
        const playlist = await getDocument(req.body.playlistId, Playlist);
        const artists = await getAllDocuments(Artist);
        const albums = await getAllDocuments(Album);
        const tracks = await getAllDocuments(Track);
        const musicData = {artists, albums, tracks}
        res.send({ playlist, musicData });
    }

    if (action === 'deleteFromList') {
        changeTrackInPlaylist(req.body.trackId, req.body.listId, false);
    }


    if (action === 'getAllMusic') {

    }

    if (action === 'addTrackToPlaylist') {
        const added = await changeTrackInPlaylist(req.body.trackId, req.body.playlistId, true);
        res.send({added:added})
    }


    if (action === 'createNewPlaylist') {
        const obj = {
            name: req.body.name+'',
            desc: '',
            image: '',
            imageSmall: '',
        }

        const doc = await createDocument(obj, Playlist);
        res.send({doc: doc})
    }

});









const server = app.listen(5000, function () {
    log('Node server is running (port 5000)..');
});





