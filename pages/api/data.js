const weatherCodeMapping = {
    0: {icon: "01", description: "Clear sky"},
    1: {icon: "02", description: "Mainly clear"},
    2: {icon: "02", description: "Partly cloudy"},
    3: {icon: "03", description: "Overcast"},
    45: {icon: "50", description: "Foggy"},
    48: {icon: "50", description: "Depositing rime fog"},
    51: {icon: "09", description: "Light drizzle"},
    53: {icon: "09", description: "Moderate drizzle"},
    55: {icon: "09", description: "Dense drizzle"},
    61: {icon: "10", description: "Slight rain"},
    63: {icon: "10", description: "Moderate rain"},
    65: {icon: "10", description: "Heavy rain"},
    71: {icon: "13", description: "Slight snow"},
    73: {icon: "13", description: "Moderate snow"},
    75: {icon: "13", description: "Heavy snow"},
    77: {icon: "13", description: "Snow grains"},
    80: {icon: "09", description: "Slight rain showers"},
    81: {icon: "09", description: "Moderate rain showers"},
    82: {icon: "09", description: "Violent rain showers"},
    95: {icon: "11", description: "Thunderstorm"},
    96: {icon: "11", description: "Thunderstorm with slight hail"},
    99: {icon: "11", description: "Thunderstorm with heavy hail"}
}


export default async function handler(req, res) {
    const {cityInput} = req.body

    const getWeatherData = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${cityInput.latitude}&longitude=${cityInput.longitude}&\
current_weather=true&timezone=auto&timeformat=unixtime&daily=sunrise,sunset&minutely_15=visibility,relative_humidity_2m,\
apparent_temperature`
    )
    const data = await getWeatherData.json()

    const mappedIcon = weatherCodeMapping[data.current_weather.weathercode].icon
    const authenticDescription = weatherCodeMapping[data.current_weather.weathercode].description
    const mappedIconSuffix = data.current_weather.is_day === 1 ? "d" : "n"
    const authenticIcon = `${mappedIcon}${mappedIconSuffix}`

    const currentTime = data.current_weather.time
    const dt = Math.floor(Date.now() / 1000)
    const timezone = data.utc_offset_seconds
    const timeIndex = data.minutely_15.time.findIndex(time => time == currentTime)

    const visibility = data.minutely_15.visibility[timeIndex]
    const humidity = data.minutely_15.relative_humidity_2m[timeIndex]
    const apparentTemperature = data.minutely_15.apparent_temperature[timeIndex]

    const temp = data.current_weather.temperature
    const windSpeed = data.current_weather.windspeed
    const windDeg = data.current_weather.winddirection
    const sunrise = data.daily.sunrise[0]
    const sunset = data.daily.sunset[0]

    const responseData = {
        "weather": [
            {
                "description": authenticDescription,
                "icon": authenticIcon
            }
        ],
        "main": {
            "temp": temp,
            "feels_like": apparentTemperature,
            "humidity": humidity,
        },
        "visibility": visibility,
        "wind": {
            "speed": windSpeed,
            "deg": windDeg
        },
        "dt": dt,
        "sys": {
            "country": cityInput.country,
            "sunrise": sunrise,
            "sunset": sunset
        },
        "timezone": timezone,
        "name": cityInput.city,
    }

    res.status(200).json(responseData)
}