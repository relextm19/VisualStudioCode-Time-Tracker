document.addEventListener("DOMContentLoaded", () => {
  let elements = document.querySelectorAll(".lang-time");
  let total_time_element = document.querySelector(".total-time-p");
  let chart_button = document.querySelector("#chart-button");
  let text_button = document.querySelector("#text-button");
  let text_content = document.querySelector(".text-content");
  let chart_content = document.querySelector(".chart-content");

  // Parse the time in seconds to a readable format
  for (let element of elements) {
    element.innerHTML = format_time(parseInt(element.getAttribute('data-time-seconds')));
  }
  total_time_element.innerHTML = format_time(parseInt(total_time_element.getAttribute('data-time-seconds')));

  function format_time(time) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = Math.floor(time % 60);
    return `${hours}h:${minutes}m:${seconds}s`;
  }

  chart_content.style.display = 'none';
  text_button.style.background = '#01681c';

  chart_button.addEventListener("click", () => {
    if (chart_content.style.display !== 'none') return; 
    text_content.classList.remove('swipeIn');
    text_button.style.background = '#005517';
    chart_button.style.background = '#01681c';

    text_content.style.display = 'none';
    chart_content.style.display = 'flex';
    chart_content.classList.add('swipeIn');
  });

  text_button.addEventListener("click", () => {
    if (text_content.style.display !== 'none') return;
    chart_content.classList.remove('swipeIn');
    chart_button.style.background = '#005517';
    text_button.style.background = '#01681c';

    chart_content.style.display = 'none';
    text_content.style.display = 'flex';
    text_content.classList.add('swipeIn');
  });
});
