//form
const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const tipCard = document.querySelector(".tipSection");
const apiKey = "(API_KEY_HERE)"; //add your API key here from "https://openweathermap.org/" (requires sign up)

//temperature
const temperatureCard = document.querySelector(".temperatureSection");
const currentTemp = document.getElementById("currentTemp");
const minTemp = document.getElementById("minTemp");
const maxTemp = document.getElementById("maxTemp");

//radiobtns for temperature
const kelvinRadioBtn = document.getElementById("kelvin");
const celciusRadioBtn = document.getElementById("celcius");
const fahrenheitRadioBtn = document.getElementById("fahrenheit");

//humidity
const humidityCard = document.querySelector(".humiditySection");
const currentHumidity = document.getElementById("currentHumidity");
const cloudsDisplay = document.getElementById("clouds");
const windsDisplay = document.getElementById("winds");
const visibilityDisplay = document.getElementById("visibility");
const rainDisplay = document.getElementById("rain");

//5 days forecast
const weeklyCard = document.querySelector(".weeklyForecastSection");
const weeklyEachCards = document.querySelectorAll(".card-weekly");

//storing temperature for update
let storedCurrentTemp = 0;
let storedMinTemp = 0;
let storedMaxTemp = 0;
let storedWeeklyData = [];

//form submit starts here
weatherForm.addEventListener("submit", async event => {
    event.preventDefault();
    const city = cityInput.value;

    if(!city) {
        displayError("Please enter a city.");
        return;
    }

    try {
        const weatherData = await getWeatherData(city);
        displayTemperatureInfo(weatherData);
        displayHumidityInfo(weatherData);
        displayWeeklyForecastInfo(weatherData);

        temperatureCard.style.display = 'flex';
        humidityCard.style.display = 'flex';
        weeklyCard.style.display = 'flex';
        tipCard.style.display = 'none';

    } catch(error) {
        console.error(error);
        displayError(error.message);
    }
});

//api call function
async function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    const response  = await fetch(apiUrl);

    if(!response.ok) {
        throw new Error("Error: Couldn't fetch weather data.");
    }

    return await response.json();
}

//displays the temperature section data
function displayTemperatureInfo(data) {
    const todayForecast = data.list[0];

    storedCurrentTemp = todayForecast.main.temp;
    storedMinTemp = todayForecast.main.temp_min;
    storedMaxTemp = todayForecast.main.temp_max;

    if(fahrenheitRadioBtn.checked) {
        currentTemp.textContent = `${((storedCurrentTemp - 273.15) * 9/5 + 32).toFixed(1)} ℉`;
        minTemp.textContent = `${((storedMinTemp - 273.15) * 9/5 + 32).toFixed(1)} ℉`;
        maxTemp.textContent = `${((storedMaxTemp - 273.15) * 9/5 + 32).toFixed(1)} ℉`;
    } else if(celciusRadioBtn.checked) {
        currentTemp.textContent = `${(storedCurrentTemp - 273.15).toFixed(1)} ℃`;
        minTemp.textContent = `${(storedMinTemp - 273.15).toFixed(1)} ℃`;
        maxTemp.textContent = `${(storedMaxTemp  - 273.15).toFixed(1)} ℃`;
    } else {
        currentTemp.textContent = `${storedCurrentTemp} K`;
        minTemp.textContent = `${storedMinTemp} K`;
        maxTemp.textContent = `${storedMaxTemp} K`;
    }
}

//updates the temperature
kelvinRadioBtn.addEventListener("change", updateTemperatureInfo);
celciusRadioBtn.addEventListener("change", updateTemperatureInfo);
fahrenheitRadioBtn.addEventListener("change", updateTemperatureInfo);


function updateTemperatureInfo() {
    if(fahrenheitRadioBtn.checked) {
        currentTemp.textContent = `${((storedCurrentTemp - 273.15) * 9/5 + 32).toFixed(1)} ℉`;
        minTemp.textContent = `${((storedMinTemp - 273.15) * 9/5 + 32).toFixed(1)} ℉`;
        maxTemp.textContent = `${((storedMaxTemp - 273.15) * 9/5 + 32).toFixed(1)} ℉`;
    } else if(celciusRadioBtn.checked) {
        currentTemp.textContent = `${(storedCurrentTemp - 273.15).toFixed(1)} ℃`;
        minTemp.textContent = `${(storedMinTemp - 273.15).toFixed(1)} ℃`;
        maxTemp.textContent = `${(storedMaxTemp  - 273.15).toFixed(1)} ℃`;
    } else {
        currentTemp.textContent = `${storedCurrentTemp} K`;
        minTemp.textContent = `${storedMinTemp} K`;
        maxTemp.textContent = `${storedMaxTemp} K`;
    }

    updateWeekForecastInfo();
}

//displays the humidity data
function displayHumidityInfo(data) {
    const todayForecast = data.list[0];

    currentHumidity.textContent = `${todayForecast.main.humidity}%`;
    cloudsDisplay.textContent = `${todayForecast.clouds.all}%`;
    windsDisplay.textContent = `${todayForecast.wind.speed} m/s`;
    visibilityDisplay.textContent = `${(todayForecast.visibility / 1000).toFixed(1)} km`;
    rainDisplay.textContent = `${todayForecast.rain?.["3h"] || 0} mm`;
}

//the 5 days week data
function displayWeeklyForecastInfo(data) {
    //only checks afternoon of each day (only gets first 5 results)
    storedWeeklyData = data.list.filter(f => f.dt_txt.includes("12:00:00")).slice(0,5);

    updateWeekForecastInfo();
}

function updateWeekForecastInfo() {
    storedWeeklyData.forEach((forecast, index) => {
        const card = weeklyEachCards[index];
        if(!card) return

        let weekTemp = forecast.main.temp;
        let weekMinTemp = forecast.main.temp_min;
        let weekMaxTemp = forecast.main.temp_max;
        let unit = "K";

        if(fahrenheitRadioBtn.checked) {
            weekTemp = (weekTemp - 273.15) * 9/5 + 32;
            weekMinTemp = (weekMinTemp - 273.15) * 9/5 + 32;
            weekMaxTemp = (weekMaxTemp - 273.15) * 9/5 + 32;
            unit = "℉";
        } else if(celciusRadioBtn.checked) {
            weekTemp = weekTemp - 273.15;
            weekMinTemp = weekMinTemp - 273.15;
            weekMaxTemp = weekMaxTemp - 273.15;
            unit = "℃";
        }

        const dayWeekly = card.querySelector(".weekDay");
        const tempCurrentWeekly = card.querySelector(".weeklyCurrentTemp");
        const tempMinMaxWeekly = card.querySelector(".weeklyMinMaxTemp");
        const emojiWeekly = card.querySelector(".weeklyEmoji"); 

        const date = new Date(forecast.dt_txt);
        const options = {weekday: "long"};
        dayWeekly.textContent = date.toLocaleDateString("en-US", options); 

        const weatherId = forecast.weather[0].id;
        emojiWeekly.textContent = getWeatherEmoji(weatherId);

        tempCurrentWeekly.textContent = `${weekTemp.toFixed(1)} ${unit}`;
        tempMinMaxWeekly.textContent = `${weekMinTemp.toFixed(1)}  ${unit} / ${weekMaxTemp.toFixed(1)} ${unit}`
    })
}

//the weather emoji for weekly 5 days
function getWeatherEmoji(weatherId) {
    switch(true) {
        case (weatherId >= 200 && weatherId < 300): return "⛈️";
        case (weatherId >= 300 && weatherId < 400): return "🌧️";
        case (weatherId >= 500 && weatherId < 600): return "🌧️";
        case (weatherId >= 600 && weatherId < 700): return "❄️";
        case (weatherId >= 700 && weatherId < 800): return "🌫️";
        case (weatherId === 800): return "☀️";
        case (weatherId >= 801 && weatherId < 810): return "☁️";
        default: return "❓";
    }
}

//displays error if theres any
function displayError(text) {
    temperatureCard.style.display = 'none';
    humidityCard.style.display = 'none';
    weeklyCard.style.display = 'none';
    tipCard.style.display = 'flex';
    tipCard.style.textAlign = 'center';

    alert(text);
}