async function fetchWeather() {
    const apiKey = '13c3fd8b66d8b30a742a0ef01cfa925d';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
  
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
          );
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
  
          // Update current weather information in Fahrenheit
          document.getElementById('temperature').textContent = `${Math.round(data.list[0].main.temp)}°F`;
          document.getElementById('condition').textContent =
            data.list[0].weather[0].description.charAt(0).toUpperCase() +
            data.list[0].weather[0].description.slice(1);
  
          // Format and display the date
          const today = new Date();
          const options = { year: 'numeric', month: 'long', day: 'numeric' };
          document.getElementById('date').textContent = today.toLocaleDateString(undefined, options);
  
          // Display city and state (assuming US locations)
          const city = data.city.name;
          const stateCode = await fetchStateCode(lat, lon);
          document.getElementById('location').textContent = `${city}, ${stateCode}`;
  
          // Populate hourly forecast in Fahrenheit
          const hourlyForecast = document.getElementById('hourly-forecast');
          hourlyForecast.innerHTML = ''; 
  
          // Get the current hour
          const currentHour = new Date().getHours();
  
          // Find the closest available forecast to the current time
          let currentForecastIndex = data.list.findIndex(hourData => {
            const forecastHour = new Date(hourData.dt * 1000).getHours();
            return forecastHour === currentHour;
          });
  
          if (currentForecastIndex === -1) {
            currentForecastIndex = 0; 
          }
  
          // Extract the current forecast and the next 7 hours forecast
          const currentForecast = data.list.splice(currentForecastIndex, 1);
          const remainingForecast = data.list.slice(0, 7); 
  
          // Combine current forecast and remaining forecasts
          const sortedHourlyData = [...currentForecast, ...remainingForecast];
  
          // Display the sorted hourly forecast
          sortedHourlyData.forEach((hourData) => {
            const forecastHour = new Date(hourData.dt * 1000).getHours();
            const displayHour = forecastHour === currentHour ? 'Now' : `${forecastHour}:00`;
  
            const hourElement = document.createElement('div');
            hourElement.classList.add('hour');
            hourElement.innerHTML = `
              <p>${displayHour}</p>
              <p>${Math.round(hourData.main.temp)}°F</p>
              <img src="http://openweathermap.org/img/wn/${hourData.weather[0].icon}.png" alt="${hourData.weather[0].description}" />
            `;
            hourlyForecast.appendChild(hourElement);
          });
        } catch (error) {
          console.error('Error fetching weather data:', error);
          document.getElementById('condition').textContent = 'Could not retrieve weather data.';
        }
      }, () => {
        alert('Unable to retrieve your location. Please allow location access.');
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }
  
  // Helper function to get the state code using a reverse geocoding API (e.g., Nominatim API)
  async function fetchStateCode(lat, lon) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await response.json();
    return data.address.state || ''; // Return state name if available
  }
  
  // Function to refresh the weather data every hour
  function refreshWeather() {
    fetchWeather();
    setInterval(fetchWeather, 3600000);
  }
  
  // Call the function on page load
  refreshWeather();


  //------------------------name display
  document.addEventListener("DOMContentLoaded", () => {
    displayUsername();
    refreshWeather(); 
  });
  
  function displayUsername() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // Redirect to login if no token is present
      window.location.replace("login.html");
      return;
    }
  
    try {
      // Decode the JWT to extract the username
      const payloadBase64 = token.split(".")[1];
      const payloadDecoded = atob(payloadBase64); 
      const payload = JSON.parse(payloadDecoded);
  
      // Get the username from the token payload
      const username = payload.userName || "User";
  
      // Display the username in the placeholder
      document.getElementById("username-placeholder").textContent = username;
    } catch (error) {
      console.error("Error decoding token:", error);
      // Redirect to login if decoding fails
      window.location.replace("login.html");
    }
  }

  //-----------------------------redirecting
  function redirectTo(page) {
window.location.href = page;
  }

  //--------------------------Login out
  function logout() {
    localStorage.removeItem("accessToken");
  
    // Redirect the user to the login page
    window.location.href = "login.html";
  }

  function redirectToUpload() {
  window.location.href = "upload.html";
}

