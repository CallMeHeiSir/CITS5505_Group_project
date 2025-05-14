$(document).ready(function () {
  // 将 Open-Meteo 的天气代码转换为描述
  function getWeatherDescription(code) {
    const weatherCodes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      51: 'Light drizzle',
      61: 'Light rain',
      63: 'Moderate rain',
      80: 'Showers',
      95: 'Thunderstorm'
    };
    return weatherCodes[code] || 'Unknown';
  }

  // 获取天气数据的函数
  function fetchWeather(latitude, longitude, cityName) {
    const apiUrl = `/weather/${latitude}/${longitude}/${encodeURIComponent(cityName)}`;

    $.ajax({
      url: apiUrl,
      method: 'GET',
      dataType: 'json',
      success: function (data) {
        if (data.error) {
          $('#weather-location').text('Weather unavailable');
          $('#weather-temp').text('');
          $('#weather-desc').text('Unable to fetch weather data');
        } else {
          $('#weather-location').text(cityName);
          const temperature = data.current_weather.temperature;
          $('#weather-temp').text(`${Math.round(temperature)}°C`);
          const weatherCode = data.current_weather.weathercode;
          const weatherDesc = getWeatherDescription(weatherCode);
          $('#weather-desc').text(weatherDesc);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $('#weather-location').text('Weather unavailable');
        $('#weather-temp').text('');
        $('#weather-desc').text('Unable to fetch weather data');
        console.error('AJAX error:', textStatus, errorThrown);
      }
    });
  }

  // 页面加载时，获取默认城市天气
  const defaultCity = $('#city-select').val().split(',');
  const defaultLat = defaultCity[0];
  const defaultLon = defaultCity[1];
  const defaultCityName = defaultCity[2];
  fetchWeather(defaultLat, defaultLon, defaultCityName);

  // 用户选择城市时，更新天气
  $('#city-select').on('change', function () {
    const selectedCity = $(this).val().split(',');
    const lat = selectedCity[0];
    const lon = selectedCity[1];
    const cityName = selectedCity[2];
    fetchWeather(lat, lon, cityName);
  });
});