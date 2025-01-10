import { getLanguagesData } from "./apiCall.js";
import { format_time } from "./parse.js";
import { mainData } from "./mainData.js";

prepareAndRender();

async function prepareAndRender(){
    mainData.languages = await getLanguagesData();
    const sortedLanguages = Object.entries(mainData.languages).sort((a, b) => b[1] - a[1]);

    renderLanguages(sortedLanguages);

    //set the total time
    const totalTimeElement = document.querySelector('.total-time-p');
    totalTimeElement.textContent = format_time(mainData.totalTime);
}

function renderLanguages(languages){
    for(let [name, time] of languages){
        
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
        mainData.totalTime += time;

        //append img-name-wrap and time-element to lang-wrap
        langWrapDiv.appendChild(imgNameWrapDiv);
        langWrapDiv.appendChild(langTime);

        document.querySelector('.text-content').appendChild(langWrapDiv);
    }
}
