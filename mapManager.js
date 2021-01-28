window.onload = init;var map; var markers=undefined;


function init(){
    map = L.map('map').setView([0, 0], 2);markers = L.featureGroup([]);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    getModelsMetadata();
}

function getModelsMetadata(){
    markers.clearLayers();
    fetch('models.json').then(r => r.json())
    .then(r => {
        r.models.forEach( (model) => {
            let button = document.createElement('button');
            button.innerText = model.name+' ('+model.territory+')';
            button.addEventListener('click', changeDrawing);
            markers.addLayer(L.marker(model.coordinates).bindPopup(button))
        })
        markers.addTo(map);
    })
}

function changeDrawing(e){
    document.getElementsByTagName('iframe')[0].src = './draw.html?fold='+e.target.innerText.split(' ')[0];
}