document.addEventListener("DOMContentLoaded", () => {
  let elements = document.querySelectorAll(".lang-time");
  let total_time_element = document.querySelector(".total-time-p");
  let intervals = {};
  const socket = io("http://127.0.0.1:5000");

  for(let element of elements) {
    element.innerHTML = format_time(parseInt(element.getAttribute('data-time-seconds')));
  }

  socket.on("update", (data) => {
    if(data.name == 'None') {
      for(let element of elements) {
        console.log('Clearing interval for:', element.getAttribute('data-name'));
        clearInterval(intervals[element.getAttribute('data-name')]);
      }
      return;
    }
    for(let element of elements) {
      if(element.getAttribute('data-name') == data.name) {
        intervals[data.name] = updateTime(element);
      } else{
        clearInterval(intervals[element.getAttribute('data-name')]);
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
