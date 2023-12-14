

const addKebabListener = elem => {

   // Open context menu on kebab icon click
    elem.addEventListener('click', (event) => {
        const itemElem = elem.parentElement
        const id = itemElem.getAttribute('trackId');
        log(`Track id: ${id}`);

        let x = event.clientX;  // Horizontal
        let y = event.clientY;  // Vertical
        log(`Mouse pos: ${x}, ${y}`);
        createKebabMenu(x, y, itemElem);
    })

}

const deleteTrackFromPlaylist = (trackId, listId) => {

    const body = {
        action:'deleteFromList',
        trackId: trackId,
        listId: listId
      };
    
      // Make post request with jQuery
      $.post('/mega', body, (data, status) => {
    
        log(status);
    
      });

}

// Remove element from DOM with optional fading animation
const removeElem = (elem, animMs=0) => {
    elem.style.transition = `all ${animMs}ms`;
    //transition-timing-function: ease-in-out;
    elem.style.opacity = 0;

    setTimeout(() => {
        elem.remove();
    }, animMs);
}


const createKebabMenu = (x, y, itemElem) => {
    const id = 'context-menu';
    // Delete old menu element if exists
    const oldElem = document.getElementById(id);
    if (oldElem !== null) { oldElem.remove(); }

    itemElem.classList.add('selected');
   
    const elem = document.createElement('div');
    elem.id = id

    elem.style.left = `${x-20}px`;
    elem.style.top = `${y-20}px`;



    const createMenuItem = (content, isItem=true) => {
        const menuItem = document.createElement('div');
        if(isItem) {
            menuItem.classList.add('menu-item');
        }
        menuItem.innerHTML = content;
        return menuItem;
    }

    const menuTitle = createMenuItem('Select action', false);
    const info = createMenuItem('<i class="fa-solid fa-circle-info"></i> Info');
    const add = createMenuItem('<i class="fa-solid fa-plus"></i> Add to playlist');
    const del = createMenuItem('<i class="fa-solid fa-trash-can red"></i> Delete from playlist');
    

    del.addEventListener('click', (event) => {
        const trackId = itemElem.getAttribute('trackId');
        const listId = document.querySelector('#playlists > .item.selected').getAttribute('list-id');
        deleteTrackFromPlaylist(trackId, listId);
        updateTrackAmount();
        del.parentElement.remove(); //delete the context menu for deleted item
        removeElem(itemElem, 300);
    })


    elem.append(menuTitle);
    elem.append(info);
    elem.append(add);

    // If not in Library, add "Delete from playlist" menu item
    const library = document.getElementById('library');
    if (!library.classList.contains('selected')) {
        elem.append(del);
    }

   

    document.body.prepend(elem);

 

    // Remove element when mouse leaves 
    elem.addEventListener("mouseleave", (event) => {
        elem.remove();
        itemElem.classList.remove('selected');
    });


}














/*
//set the opening and closing of kebab menu
const  setKebabMenu = () => {
        const kebab = document.querySelector('.kebab'),
        middle = document.querySelector('.middle'),
        cross = document.querySelector('.cross'),
        dropdown = document.querySelector('.dropdown');


    kebab.addEventListener('click', () => {
        middle.classList.toggle('active');
        cross.classList.toggle('active');
        dropdown.classList.toggle('active');
    })

}

const insertExitElem = () => {
    
    const imgContainer = document.createElement('div');
    imgContainer.id = 'exit-image';
    const img = document.createElement('img');
    img.setAttribute('src','icon/android-chrome-384x384.png');
    imgContainer.append(img);

    const textElem = document.createElement('p');
    textElem.innerText = 'App closed \n Reload page to restart';


    const reloadButton = document.createElement('div');
    reloadButton.id = 'reload-page';
    reloadButton.innerText = 'Reload';

    reloadButton.addEventListener('click', () => {
        location.reload();
    })


    const elem = document.createElement('div');
    elem.id = 'exit-message';
    elem.append(imgContainer);
    elem.append(textElem);
    elem.append(reloadButton);


    document.body.innerHTML = '';
    //document.body.innerHTML = text;
    document.body.style.backgroundColor = 'black';
    document.body.append(elem);


}


//set the menu items inside kebab menu
//closing tab with script is prevent
//instead just stop all music and return to playlists;
const  setKebabMenuContent = () => {
    const exit = document.getElementById('exit');
    const about = document.getElementById('about');
    const sleepTimer = document.getElementById('sleep-timer');


    //const reloadMenuElem = document.getElementById('exit');
    
    exit.addEventListener('click', () => {
        if (confirm("Exit app?")) {
            musicIsPlaying=false;
            insertExitElem();
        }
    })

    about.addEventListener('click', () => {
        setModalContent('about');
        showModal(true);
    })

    sleepTimer.addEventListener('click', () => {
        setModalContent('sleep-timer');
        //createSleepTimerPage();
        showModal(true);
    })

}
*/






//setKebabMenu();
//setKebabMenuContent();