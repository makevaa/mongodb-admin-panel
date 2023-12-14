

const initDrags = () => {
    const trackElems = document.querySelectorAll('#tracklist > .item');
    const playlistElems = document.querySelectorAll('#playlists > .item');


    for (const elem of trackElems) {
        elem.setAttribute('draggable', 'true');

        elem.addEventListener('dragstart', dragStartHandler);
        elem.addEventListener('dragend', dragEndHandler);
    }

    for (const elem of playlistElems) {
        //elem.addEventListener('ondragover', dragOverHandler);
        //elem.addEventListener('dragleave', dragLeaveHandler);

       
        elem.setAttribute( 'ondragover', 'dragOverHandler(event)' );
        elem.setAttribute( 'ondragleave', 'dragLeaveHandler(event)' );
        elem.setAttribute( 'ondrop', 'dragDropHandler(event)' );

        
        //elem.addEventListener('ondragover', dragOverHandler);
    }
}


// When drag starts, fired on source element
const dragStartHandler = e => {

    // Add the target element's id to the data transfer object
    const trackId = e.target.getAttribute('trackid').trim();

    e.dataTransfer.setData("application/my-app", trackId);
    e.dataTransfer.dropEffect = 'link';

    e.target.classList.add('selected');
}


// After dragging has stopped, fired on source element
const dragEndHandler = e => {

    e.preventDefault();
    e.dataTransfer.dropEffect = 'link';
    e.target.classList.remove('selected');
  
}


// When hovering over a drag target, fired on target element
const dragOverHandler = e => {
    //log('Hovering over drag target');

    e.preventDefault();
    e.dataTransfer.dropEffect = 'link';

    e.target.classList.add('drag-hover');
}


//When hovering leaves target, fired on target element
const dragLeaveHandler = e => {
    //log('Leave drag target');
    e.preventDefault();
    //e.dataTransfer.dropEffect = 'link';
    //log(e.target)

    e.target.classList.remove('drag-hover');
}


// When draggable item is dropped on a drag target, fired on target element
const dragDropHandler = e => {
    e.preventDefault();
    e.target.classList.remove('drag-hover');


    // Add track to playlist
    const trackId = e.dataTransfer.getData("application/my-app");
    const playlistId = e.target.getAttribute('list-id');

    const reqBody = {
        action: 'addTrackToPlaylist',
        trackId: trackId,
        playlistId: playlistId
    }


    let rect = e.target.getBoundingClientRect();
    let x = rect.x + rect.width/2;
    let y = rect.y ;


    // Make post request to server to add track to playlist
    $.post('/mega', reqBody, (response, status) => {

        if (response.added) {
            // Track was added to playlist
            createAddedText(x, y, e.target, '<i class="fa-solid fa-check"></i> added');
            animatePlaylistItem(e.target)
        } else {
            // Track wasn't added (duplicate prevention)
            createAddedText(x, y, e.target, '<i class="fa-solid fa-xmark"></i> has track already');
        }

    });
}


// Create 'added' label and animate it
const createAddedText = (x, y, targetElem, text) => {
    const elem = document.createElement('div');
    elem.classList.add('added');
    elem.innerHTML = text;

    elem.style.left = `${x-0}px`;
    elem.style.top = `${y-0}px`;

    const animDur = 800;
    elem.style.transition = `opacity ${animDur/2}ms`;

    document.body.prepend(elem);

    // Small timeout to make opacity transition work
    setTimeout(() => {
        elem.style.opacity = '0';
    }, animDur/2);

   
    setTimeout(() => {
        elem.remove();
    }, animDur);
}


// Animate playlist background color
const animatePlaylistItem = (targetElem) => {
    const animDur = 600;
    const targetRect = targetElem.getBoundingClientRect();

    const animElem = document.createElement('div');
    animElem.classList.add('playlist-item-bg');

    animElem.style.left = `${targetRect.x}px`;
    animElem.style.top = `${targetRect.y}`;
    animElem.style.width = `${targetRect.width}px`;
    animElem.style.height = `${targetRect.height}px`;


    document.body.prepend(animElem);

    setTimeout(() => {
        animElem.style.opacity = 0;
    }, 100);

    setTimeout(() => {
        animElem.remove();
    }, animDur);
}










