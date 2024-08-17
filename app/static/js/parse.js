document.addEventListener("DOMContentLoaded", () => {
  let elements = document.querySelectorAll(".time-div");
  let total_time_element = document.querySelector(".total-time-p");
 
  // Parse the time in seconds to a readable format
  for (let element of elements) {
    console.log(element.getAttribute('data-time-seconds'));
    element.innerHTML = format_time(parseInt(element.getAttribute('data-time-seconds')));
  }
  total_time_element.innerHTML = format_time(parseInt(total_time_element.getAttribute('data-time-seconds')));

  function format_time(time) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = Math.floor(time % 60);
    return `${hours}h:${minutes}m:${seconds}s`;
  }
});