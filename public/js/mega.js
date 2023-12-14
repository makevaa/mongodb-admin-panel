/*** mega.js ***/

const getItemById = (id, itemList) => {
  let item;

  for (const item of itemList) {
    //log(typeof item._id)
    //log(typeof id)

    if (item._id.toString() === id) {
      //log("found item")
      return item;
    }
  }
}


const createTrackArray = (playlist, musicData) => {
  const newArr = [];

  const artists = musicData.artists;
  const albums = musicData.albums; 
  const tracks = musicData.tracks;

  // Create track objects and push to array
  for (const trackId of playlist) {


    const foundTrack = getItemById(trackId, tracks);

    const artist =  getItemById(foundTrack.artist, artists);
    const album =  getItemById(foundTrack.album, albums) || undefined;

    const obj = {
      name: foundTrack.name,
      artist: artist.name,
      album: {
        name: null, year: null, image: null
      },
      trackId: trackId
    }

    if (album !== undefined) {
      obj.album.name = album.name;
      obj.album.year = album.year;
      obj.album.image = album.image;
    }
    newArr.push(obj)
  }

  sortArrayByProp(newArr, 'artist');
  return newArr;
}


const getPlaylist = id => {

  const body = {
    action:'getPlaylist',
    playlistId: id.toString().trim()
  };

  // Make post request with jQuery
  $.post('/mega', body, (data, status) => {
    log(data);

    const playlistObj = {
      name: data.playlist.name,
      tracks: -1
    }

    playlistObj.tracks = createTrackArray(data.playlist.tracks, data.musicData);

    insertTracklistElems(playlistObj)
  });
}


const sortArrayByProp = (array, propName) => {
  //sort in place
  array.sort((a, b) => (a[propName] > b[propName]) ? 1 : -1)
}


const createElem = (type, content, cssClasses) => {
  const elem = document.createElement(type);

  for (const cssClass of cssClasses) {
    elem.classList.add(cssClass);
  }
 
  elem.innerHTML = content;
  return elem;
}

// Create tracklist items in the browser
const insertTracklistElems = list => {
  log(list)

  const title = document.querySelector('#right.side > .header > .title');
  title.innerText = list.name;

  const trackAmount = document.querySelector('#right.side > .header > .track-amount');
  trackAmount.innerText = `${list.tracks.length} tracks`;

  const tracklist = document.querySelector('#right.side > #tracklist');
  tracklist.innerText = '';


  for (const track of list.tracks) {

    const elem = document.createElement('div');
    elem.classList.add('item');
    elem.setAttribute('trackId', track.trackId);


    const searchString = `${track.artist} ${track.name} ${track.album.name}`
    elem.setAttribute('searchstring', searchString);
    
    const artistCon = createElem('div', track.artist, ['artist', 'cell']);
    const artist = createElem('div', track.artist, ['artist', 'cell']);


    const name = createElem('div', track.name, ['name', 'cell'] );
    const album = createElem('div', track.album.name, ['album', 'cell']);

    const kebab = createElem('div', '<i class="fa-solid fa-ellipsis-vertical"></i>', ['kebab', 'cell']);
    //kebab.setAttribute('index', );
    addKebabListener(kebab);


    


    elem.append(artist);
    elem.append(name);
    elem.append(album);
    elem.append(kebab);
    tracklist.append(elem);
   
  }
  updateTrackAmount();
  initDrags();

}


const clearSelectedItem = () => {
  const playlistElems = document.querySelectorAll('#playlists > .item');
  playlistElems.forEach((elem) =>  elem.classList.remove('selected') );

  document.getElementById('library').classList.remove('selected');
}


// Show playlist tracks on click
document.getElementById("playlists").addEventListener("click", (e) => {
  const target = e.target;
  const id = target.getAttribute('list-id');

  if (id !== null) {
    clearSelectedItem(); //css
    clearSearchBar();
    target.classList.add('selected');
    getPlaylist(id); // Show playlist tracks on right side
  }

}); 


const updateTrackAmount = () => {
  const elem = document.querySelector('.track-amount');
  const trackAmount = document.querySelectorAll('#tracklist > .item').length;
  elem.innerText = `${trackAmount} tracks`;
}


const createNewPlaylistField = (clickTarget) => {
  const elem = document.createElement('div');
  elem.classList.add('new-playlist-container')
  //elem.innerHTML = 'asd';


  const field = document.createElement('input');
  field.classList.add('name');
  field.setAttribute('placeholder', 'New playlist name...')

  const create = document.createElement('div');
  create.classList.add('button');
  create.classList.add('create');
  create.innerHTML = '<i class="fa-solid fa-square-check"></i>';




  const discard = document.createElement('div');
  discard.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
  discard.classList.add('button');
  discard.classList.add('discard');

  discard.addEventListener('click', (e) => {
    elem.remove();
  });



  elem.append(field);
  elem.append(create);
  elem.append(discard);

  const playlists = document.getElementById('playlists');
  playlists.insertAdjacentElement('afterend', elem );


  create.addEventListener('click', (e) => {
    // Read value from input field
    const newName = field.value;

    // Create new document in playlist collection
    const body = {
      action:'createNewPlaylist',
      name: newName
    };
  
    
    $.post('/mega', body, (data, status) => {
      // create new playlist item in playlists element
      const newElem = document.createElement('div');
      newElem.classList.add('item');
      newElem.setAttribute('list-id', data.doc._id);


      newElem.innerHTML = `<i class="fa-regular fa-circle-play"></i> ${newName}`;
      playlists.append(newElem)

    // remove the temporary new playlist element
    elem.remove();
  
    });



  
  
   
  });
}


const setListeners = () => {

  const library = document.getElementById('library');

  // Show all music on "Library" button click
  library.addEventListener('click', (event) => {

    // Set Library-button as selected before server request for responsiveness
    clearSelectedItem();
    library.classList.add('selected');


    $.get('/api/all-music', (data, status) => {
      // Put all track ids in an array
      const trackIds = []

      for (const track of data.musicData.tracks) {
        trackIds.push(track._id);
      }

      const playlistObj = {
        name: 'Library (all music)', tracks: -1
      }
  
      playlistObj.tracks = createTrackArray(trackIds, data.musicData);
      insertTracklistElems(playlistObj);

    });

  });


  const newPlaylist = document.getElementById('new-playlist-button');

  newPlaylist.addEventListener('click', (e) => {
    // Create new playlist element with text field and 2 buttons: create & discard
    // Create button creates new empty playlist
    // Discard removes the new playlist element

    // Prevent creating multiple "New playlist" elements
    const playlistsElem = document.getElementById('playlists-container');
    const previousFields = playlistsElem.querySelectorAll('.new-playlist-container');
    
    if (!previousFields.length > 0) {
      createNewPlaylistField(e.target);
    } else {
      //previous field is already open, flash background
      const prev = previousFields[0];
      const origColor = prev.style.backgroundColor;
      prev.style.backgroundColor = 'rgba(0,0,0,0.5)';

      setTimeout(() => {
        prev.style.backgroundColor = origColor;
      }, 100);
      
    }


    

  });


}

setListeners();