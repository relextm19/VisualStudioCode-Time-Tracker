document.addEventListener("DOMContentLoaded", () => {
  let elements = document.querySelectorAll(".lang-time");
  let total_time_element = document.querySelector(".total-time-p");
  const socket = io("http://127.0.0.1:5000");
  socket.on("update", (data) => {
    for(let element of elements) {
      if(element.getAttribute('name') == data.name) {
        element.innerHTML = format_time(data.time);
      }
    }
    total_time_element.innerHTML = data.total_time + 'h';
  });
  function format_time(time){
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = Math.floor(time % 60);
    return `${hours}h:${minutes}m:${seconds}s`;
  }
});