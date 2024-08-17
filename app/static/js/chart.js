function format_time(time) {
    return time / 3600;
}

document.addEventListener("DOMContentLoaded", () => {
  let chartInitialized = false;
  let chart_button = document.querySelector("#chart-button");
  let text_button = document.querySelector("#text-button");
  let text_content = document.querySelector(".text-content");
  let chart_content = document.querySelector(".chart-content");
  chart_content.style.display = 'none';


  function initializeChart() {
    const chart = document.getElementById('chart');
    const ctx = chart.getContext('2d'); 

    const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
    gradient.addColorStop(0, '#005517'); 
    gradient.addColorStop(1, '#23541c'); 

    var rawData = projects ?? languages;

    const labels = Object.keys(rawData);
    const data = Object.values(rawData).map((time) => format_time(time));

    new Chart(chart, {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [{
              label: 'Time spent (hours)',
              data: data,
              borderWidth: 1,
              borderColor: '#23541c',
              backgroundColor: gradient
          }]
      },
      options: {
          maintainAspectRatio: false, 
          animation: { duration: 0 },
          scales: {
              y: {
                  beginAtZero: true,
                  ticks: { font: { size: 14 } }
              },
              x: {
                  ticks: { font: { size: 14 } }
              }
          }
      }
    });
  }

  chart_button.addEventListener("click", () => {
    console.log(chart_content.style.display);
    if (chart_content.style.display !== 'none') return; 

    text_content.classList.remove('swipeIn');
    text_button.classList.remove('button-active');
    chart_button.classList.add('button-active');

    text_content.style.display = 'none';
    chart_content.style.display = 'flex';
    chart_content.classList.add('swipeIn');

    if (!chartInitialized) {
      initializeChart();
      chartInitialized = true;
    }
  });

  text_button.addEventListener("click", () => {
    if (text_content.style.display !== 'none') return;
    
    chart_content.classList.remove('swipeIn');
    chart_button.classList.remove('button-active');
    text_button.classList.add('button-active');

    chart_content.style.display = 'none';
    text_content.style.display = 'flex';
    text_content.classList.add('swipeIn');
  });
});
