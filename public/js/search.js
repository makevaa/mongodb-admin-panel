
const searchFromTracklist = () => {
  log('searching...')
  const input = document.getElementById('search');
  const filter = input.value.toUpperCase();
  const elems = document.querySelectorAll('#tracklist > .item');

  //item elems have searchstring attribute

  // Loop through all list items, and hide those which don't match the search query
  for (let i = 0; i < elems.length; i++) {
    const elem = elems[i];
    const elemString = elem.getAttribute('searchstring');

    if (elemString.toUpperCase().indexOf(filter) > -1) {
      elem.style.display = '';
    } else {
      elem.style.display = 'none';
    }
  }
}


const clearSearchBar = () => {
  document.getElementById('search').value = '';
  //show all tracks again
  const elems = document.querySelectorAll('#tracklist > .item');
  for (let i = 0; i < elems.length; i++) {
    elems[i].style.display = '';
  }
}

