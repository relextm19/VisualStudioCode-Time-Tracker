import { getProjectsData } from "./apiCall.js";
import { format_time } from "./parse.js";


var totalTime = 0;
document.addEventListener('DOMContentLoaded', async () => {
    let projects = await getProjectsData();

    renderProjects(projects);

    //set the total time
    var totalTimeElement = document.querySelector('.total-time-p');
    totalTimeElement.textContent = format_time(totalTime);
});
function renderProjects(projects){
    for(let [name,time] of Object.entries(projects)){

        //create wrapper
        let wrapDiv = document.createElement('div');
        wrapDiv.classList.add('project-wrap');
        //create project-name
        let projectName = document.createElement('h3');
        projectName.classList.add('project-name')
        projectName.innerHTML = (`${name}: &nbsp;`);
        //create project-time
        let projectTime = document.createElement('h3');
        projectTime.classList.add('project-time')
        projectName.classList.add('time-div')
        projectTime.textContent = format_time(time);
        //add children
        wrapDiv.appendChild(projectName);
        wrapDiv.appendChild(projectTime);

        //append to document
        document.querySelector('.lang-stats').appendChild(wrapDiv);

        //update total time
        totalTime += time;
    }
}