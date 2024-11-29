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
    try {
        const {cityInput} = req.body

        if (!cityInput || !cityInput.latitude || !cityInput.longitude) {
            return res.status(400).json({
                error: "Missing required location parameters"
            })
        }

        const getWeatherData = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${cityInput.latitude}&longitude=${cityInput.longitude}&\
current_weather=true&timezone=auto&timeformat=unixtime&daily=sunrise,sunset&minutely_15=visibility,relative_humidity_2m,\
apparent_temperature`
        )

        if (!getWeatherData.ok) {
            return res.status(getWeatherData.status).json({
                error: "Failed to fetch weather data"
            })
        }

        const data = await getWeatherData.json()

        const {
            current_weather: {
                temperature = 0,
                windspeed = 0,
                winddirection = 0,
                weathercode = 3,
                is_day = 0,
                time
            },
            minutely_15: {
                time: minutely_time = [],
                visibility = [],
                relative_humidity_2m = [],
                apparent_temperature = [],
            },
            daily: {
                sunrise = [],
                sunset = []
            },
            utc_offset_seconds = 0
        } = data

        const mappedIcon = weatherCodeMapping[weathercode]?.icon || "03"
        const authenticDescription = weatherCodeMapping[weathercode]?.description || "Unknown weather"
        const mappedIconSuffix = is_day === 1 ? "d" : "n"
        const authenticIcon = `${mappedIcon}${mappedIconSuffix}`

        const timeNow = Math.floor(Date.now() / 1000)
        const timeIndex = minutely_time.findIndex(t => t === time) || 0

        const currentVisibility = Math.min(visibility[timeIndex] || 10000)
        const currentHumidity = relative_humidity_2m[timeIndex] || 50
        const currentFeelsLike = apparent_temperature[timeIndex] || temperature

        const responseData = {
            "weather": [
                {
                    "description": authenticDescription,
                    "icon": authenticIcon
                }
            ],
            "main": {
                "temp": temperature,
                "feels_like": currentFeelsLike,
                "humidity": currentHumidity,
            },
            "visibility": currentVisibility,
            "wind": {
                "speed": windspeed,
                "deg": winddirection
            },
            "dt": timeNow,
            "sys": {
                "country": cityInput.country || "?",
                "sunrise": sunrise[0] || "?",
                "sunset": sunset[0] || "?"
            },
            "timezone": utc_offset_seconds,
            "name": cityInput.city || "?",
        }

        res.status(200).json(responseData)
    } catch (error) {
        console.error("API error: ", error)
        return res.status(500).json({
            error: process.env.NODE_ENV === "development"
                ? "Internal Server Error"
                : "Unable to load weather data",
            message: process.env.NODE_ENV === "development" ? error.message : undefined
        })
    }
}