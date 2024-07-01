document.addEventListener("DOMContentLoaded", () => {
  let elements = document.querySelectorAll(".lang-time");
  let total_time_element = document.querySelector(".total-time-p");
  let total_time_seconds = parseInt(total_time_element.getAttribute('data-time-seconds'));
  let intervals = {};
  let isCoding = false;
  const socket = io("http://127.0.0.1:5000");

  //parse the time in seconds to a readable format
  for(let element of elements) {
    element.innerHTML = format_time(parseInt(element.getAttribute('data-time-seconds')));
  }
  //set interval for the total time
  setInterval(() => {
    console.log(isCoding);
    if(!isCoding) return;
    total_time_seconds += 1;
    total_time_element.setAttribute('data-time-seconds', total_time_seconds);
    total_time_element.innerHTML = (total_time_seconds / 3600).toFixed(2) + "h";
  }, 1000);

  //update the time when the server sends an update
  socket.on("update", (data) => {
    console.log(data);
    //clear the interval for all languages
    for(interval in intervals) {
      clearInterval(intervals[interval]);
      delete intervals[interval];
    }
    
    isCoding = false;

    //set the correct interval
    for(let element of elements) {
      if(element.getAttribute('data-name') == data.name) {
        intervals[data.name] = updateTime(element);
        isCoding = true;
      }
    }
  });
  
  function format_time(time){
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = Math.floor(time % 60);
    return `${hours}h:${minutes}m:${seconds}s`;
  }

  function updateTime(element){
    return setInterval(() => {
      let timeInSeconds = parseInt(element.getAttribute('data-time-seconds'));
      timeInSeconds += 1;
      element.setAttribute('data-time-seconds', timeInSeconds);
      element.innerHTML = format_time(timeInSeconds);
    }, 1000);
  }
});
