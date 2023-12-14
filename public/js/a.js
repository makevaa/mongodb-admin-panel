




//init fomantic-ui dropdown menu


const createNew = document.createElement('a');
createNew.id = 'create-new';
createNew.setAttribute('href', 'submit-artist');
createNew.innerHTML = 'Create new artist';

$.fn.dropdown.settings.templates.message = () => { return createNew }


$('.ui.dropdown').dropdown(
    {
        
    }
);


let searchField = document.getElementById('artist');
let typedArtist;


createNew.addEventListener('clickdown', (e) => {

    log(`${typedArtist} ${timestamp()}`);

    
})




searchField.addEventListener('keyup', (event) => {
    //log(event.target)
    log(event.target.value)
    typedArtist = event.target.value;
    createNew.setAttribute('href', `/submit-artist/${typedArtist}`);
    //log('keyup ' + timestamp() )
  });




