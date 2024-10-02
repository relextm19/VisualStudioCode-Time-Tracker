import { getLanguagesData } from "./apiCall.js";
import { format_time } from "./parse.js";

var totalTime = 0;

document.addEventListener('DOMContentLoaded', async () => {
    let languages = await getLanguagesData();

    let languagesArray = Object.entries(languages);
    //the b[1] - a[1] is to sort the array in descending order it compares adjecent elements and if the result is negative it swaps them
    languagesArray.sort((a, b) => b[1] - a[1]);
    let sortedLanguages = Object.fromEntries(languagesArray);

    renderLanguages(sortedLanguages);

    //set the total time
    var totalTimeElement = document.querySelector('.total-time-p');
    totalTimeElement.textContent = format_time(totalTime);
});
function renderLanguages(languages){
    for(let [name, time] of Object.entries(languages)){
        
        //create the wrapper
        let langWrapDiv = document.createElement('div');
        langWrapDiv.classList.add('lang-wrap');
        //create the image and name div wrap
        let imgNameWrapDiv = document.createElement('div');
        imgNameWrapDiv.classList.add('img-name-wrap');
        
        //create the image element
        let langImg = document.createElement('img');
        langImg.src = "../static/img/" + name + ".png";
        langImg.alt = name;

        //create the name element
        let langName = document.createElement('h3');
        langName.classList.add('lang-name');
        langName.textContent = name;
            
        //append image and name to the img-name-wrap
        imgNameWrapDiv.appendChild(langImg);
        imgNameWrapDiv.appendChild(langName);

        //create the time element
        let langTime = document.createElement('h3');
        langTime.classList.add('lang-time');
        langTime.textContent = format_time(time);
        //update the global total time
        totalTime += time;

        //append img-name-wrap and time-element to lang-wrap
        langWrapDiv.appendChild(imgNameWrapDiv);
        langWrapDiv.appendChild(langTime);

        document.querySelector('.text-content').appendChild(langWrapDiv);
    }
}