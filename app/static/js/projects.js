import { getProjectsData } from "./apiCall.js";
import { format_time } from "./parse.js";
import { mainData } from "./mainData.js";


document.addEventListener('DOMContentLoaded', async () => {
    mainData.projects = await getProjectsData();

    const sortedProjects = Object.entries(mainData.projects).sort((a, b) => b[1] - a[1]);
    renderProjects(sortedProjects);

    //set the total time
    const totalTimeElement = document.querySelector('.total-time-p');
    totalTimeElement.textContent = format_time(mainData.totalTime);
});
function renderProjects(projects){
    for(let [name,time] of projects){

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
        document.querySelector('.text-content').appendChild(wrapDiv);

        //update total time
        mainData.totalTime += time;
    }
}