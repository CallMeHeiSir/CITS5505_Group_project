$(document).ready(function () {
  // 使用 OpenWeatherMap API
  const apiKey = 'cb0ba94d7eca9d003747e57c48e2f8db'; // OpenWeatherMap API Key, Do not delete unless you want to break the weather function
  // 获取用户位置（可选）
  const city = 'Perth'; // 可根据需求动态获取用户位置
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  $.ajax({
    url: apiUrl,
    method: 'GET',
    dataType: 'json',
    success: function (data) {
      // 更新天气信息
      $('#weather-location').text(data.name);
      $('#weather-temp').text(`${Math.round(data.main.temp)}°C`);
      $('#weather-desc').text(data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1));
    },
    error: function () {
      $('#weather-location').text('Weather unavailable');
      $('#weather-temp').text('');
      $('#weather-desc').text('Unable to fetch weather data');
    }
  });
});