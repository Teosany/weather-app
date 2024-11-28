# Weather App

Display current weather based on configured location. Data updates every hour automatically.

![Alt img](https://github.com/user-attachments/assets/c543abb4-f3f2-44e0-be3a-7bb4cd906ef1)


## Features

1. Configuration via JSON file (city coordinates and name)

2. Current local time and date

3. Temperatures and humidity

4. Wind speed and direction

5. Sunrise and sunset times

6. Metric vs Imperial system

7. Error handling and loading info
   
8. Hourly data updates


## Installation

1. `git clone https://github.com/madzadev/weather-app.git`

2. `cd weather-app`

3. `npm install`
   
4. Change config.json in the root directory to the data of the city you need

6. `npm run dev`

## API

The application uses the Open-Meteo API for weather data. No API key required.

## Project Context

This project is a modification of the original weather-app. Main changes include:
	•	Migration from OpenWeatherMap to Open-Meteo API
	•	Replacement of city search with JSON configuration
	•	Implementation of automatic hourly updates
	•	Removal of API key requirement

## License

The project is under [MIT license](https://choosealicense.com/licenses/mit/).
