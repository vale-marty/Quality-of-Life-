import faviconPng from '../img/favicon.png';

function appendFavicon(){
    const faviconImage = document.createElement('link');
    faviconImage.rel = 'icon';
    faviconImage.type = 'image/x-icon';
    faviconImage.href = faviconPng;
    return faviconImage;
}

export default appendFavicon;