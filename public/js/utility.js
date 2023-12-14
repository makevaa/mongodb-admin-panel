// utility.js
const log = console.log;



const moveToPage = (pageUrl, delayMs) => {
    setTimeout(() => {
        log('moveToPage')
        window.location.href = pageUrl;
      }, delayMs);
      
}

const timestamp = () => {
    let str = `(${Date.now()})` 
    return str;
}