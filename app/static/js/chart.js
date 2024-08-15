function format_time(time) {
    return time / 3600;
}

document.addEventListener("DOMContentLoaded", () => {
    const chart = document.getElementById('chart');
    const ctx = chart.getContext('2d'); 
    // Create a linear gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
    gradient.addColorStop(0, '#005517'); // Start color
    gradient.addColorStop(1, '#23541c'); // End color

    const labels = Object.keys(language_times);
    const data = Object.values(language_times).map((time) => {
        return format_time(time);
    });
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
          animation:{
            duration: 0
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks:{
                font:{
                  size: 14
                }
              }
            },
            x:{
              font:{
                size: 14
              }
            }
          }
        }
      });
});