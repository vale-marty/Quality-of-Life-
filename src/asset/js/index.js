import '../css/style.css';
import * as bootstrap from 'bootstrap';

//axios e lodash
import axios from 'axios';
const _ = require('lodash');

//favicon
import appendFavicon from './favicon';
document.head.appendChild(appendFavicon());

//create and delete element
function createElement(element, parent, classList, idName){
    element.classList = `${classList}`;
    element.setAttribute('id', `${idName}`);
    parent.appendChild(element);
}

async function deleteElement(element){
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
}

//searchbar + download city from API
let input = document.getElementById('search-bar');
let suggestion = document.getElementById('search-suggestion');
let arrayOfCity = [];
let failedResearchAlert = document.getElementById('failed-research-alert');

let ul = document.createElement('ul');
createElement(ul, suggestion, 'list-group', 'suggestion-ul');
let suggestionUl = document.getElementById('suggestion-ul');

let cityName;

//download list of city API
async function createArrayOfCity(){
    try{
        let download = await axios.get(`https://api.teleport.org/api/urban_areas/`);
        console.log(download);

        let cityList = _.get(download, 'data._links.ua:item');
        console.log(cityList);
        cityList.forEach(city => {
            arrayOfCity.push(city.name)
        }); 
    } catch (err){
        console.log('error: ', err)
        failedResearchAlert.classList.remove('d-none');
        failedResearchAlert.innerHTML = 'Oops... There was an error downloading the resources. Reload the page and try again!';
    };
};

createArrayOfCity();

//show the date of API 
input.addEventListener('keyup', autocomplete);

function autocomplete(input){
    suggestion.classList.remove('d-none');
    const arrayOfCity = autocompleteMatch(input.target.value);

    arrayOfCity.forEach((city) => {
        let li = document.createElement('li');
        createElement(li, ul, 'list-group-item', '');
        li.innerHTML = `${city}`;
        li.addEventListener('click', select);
    });
};

function select(event){
    cityName = event.target.textContent;
    input.value = cityName;
    suggestion.classList.add('d-none');
};

function autocompleteMatch(value){
    deleteElement(suggestionUl);
    if (value == ''){
        failedResearchAlert.classList.remove('d-none');
        suggestion.classList.add('d-none');
        failedResearchAlert.innerHTML = 'Write the name of the city you want to search for';
        return [];
    }
    failedResearchAlert.classList.add('d-none');
    suggestion.classList.remove('d-none');
    const reg = new RegExp(`^${value}`, 'i');
    return arrayOfCity.filter(city => {
        if(city.match(reg)){
            return city;
        }
    })
};

//city score
let instructionsOrScore = document.getElementById('istruction-scores');
let scoreData = document.getElementById('score-data');

//function on search button
let searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener('click', search);

async function search(){
    try{
        let urlValue = await adjustValue(cityName);
        let cityInfo = await axios.get(`https://api.teleport.org/api/urban_areas/slug:${urlValue}/`);
        appendInfo(cityInfo, 'data.name', 'Error: please try realoding the page', 'city-name');
        appendInfo(cityInfo, 'data.continent', 'Error: please try realoding the page', 'continent');

        let cityScore = await axios.get(`https://api.teleport.org/api/urban_areas/slug:${urlValue}/scores/`);

        //summary
        deleteElement(document.getElementById('summary-or-presentation'));
        appendHtml(cityScore, 'data.summary', 'Error: please try realoding the page', 'summary-or-presentation');

        //score
        instructionsOrScore.innerHTML = 'City scores';
        deleteElement(scoreData);
        let categoryNumber = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
        categoryNumber.forEach((number) => {
            appendScores(cityScore, `data.categories.${number}.score_out_of_10`, `data.categories.${number}.name`, 'Error: please try realoding the page', scoreData);
        })
        input.value = '';

    }catch(err){
        failedResearchAlert.classList.remove('d-none')
        failedResearchAlert.innerHTML = 'Error: please try realoding the page';
        input.value = '';
        console.log('Error: ', err);
    }
}

//adjust city name for researchin data with the api
function adjustValue(value){
    if(value == 'Galway' || value == 'galway'){
        return 'gaillimh'
    }
    value = value.toLowerCase();
    value = value.trim();
    value = value.replaceAll(' ', '-');
    return value;
}

//append data on the page
async function appendInfo(download, path, error, idElement){
    let element = document.getElementById(`${idElement}`);
    let text = await _.get(download, `${path}`, `${error}`);
    element.innerText = text;
}

async function appendHtml(download, path, error, idParent){
    let parent = document.getElementById(`${idParent}`);
    let element = await _.get(download, `${path}`, `${error}`);
    parent.innerHTML += element; 
}

async function appendScores(download, pathNumber, pathName, error, parent){
    let divName = document.createElement('div');
    let number = await _.get(download, pathNumber, error);
    number = Math.round(number);
    let name = await _.get(download, pathName, error);
    createElement(divName, parent, 'score', ' ');
    divName.innerHTML += `<p>${name} : ${number}</p><div class="out-of-ten"><div class="bg-lightcolor lenght-${number}"></div></div>`;
}