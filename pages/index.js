import {useState, useEffect} from "react";

import {MainCard} from "../components/MainCard";
import {ContentBox} from "../components/ContentBox";
import {Header} from "../components/Header";
import {DateAndTime} from "../components/DateAndTime";
import {MetricsBox} from "../components/MetricsBox";
import {UnitSwitch} from "../components/UnitSwitch";
import {LoadingScreen} from "../components/LoadingScreen";
import {ErrorScreen} from "../components/ErrorScreen";

import styles from "../styles/Home.module.css";

export const App = () => {
    const [cityInput, setCityInput] = useState(null);
    const [triggerFetch, setTriggerFetch] = useState(true);
    const [weatherData, setWeatherData] = useState(null);
    const [unitSystem, setUnitSystem] = useState("metric");

    useEffect(() => {
        const loadConfig = async () => {
            const response = await fetch('/config.json');
            const data = await response.json();
            setCityInput(data);
            setTriggerFetch(prev => !prev);
        };
        loadConfig();
    }, []);

    useEffect(() => {
        if (!cityInput) return
        const getData = async () => {
            const res = await fetch("api/data", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({cityInput}),
            });
            const data = await res.json();
            setWeatherData(data);
        };
        getData();

        const interval = setInterval(getData, 3600000);
        return () => clearInterval(interval);

    }, [triggerFetch, cityInput]);

    const changeSystem = () =>
        unitSystem == "metric"
            ? setUnitSystem("imperial")
            : setUnitSystem("metric");

    return weatherData && !weatherData.message ? (
        <div className={styles.wrapper}>
            <MainCard
                city={weatherData.name}
                country={weatherData.sys.country}
                description={weatherData.weather[0].description}
                iconName={weatherData.weather[0].icon}
                unitSystem={unitSystem}
                weatherData={weatherData}
            />
            <ContentBox>
                <Header>
                    <DateAndTime weatherData={weatherData} unitSystem={unitSystem} />
                </Header>
                <MetricsBox weatherData={weatherData} unitSystem={unitSystem}/>
                <UnitSwitch onClick={changeSystem} unitSystem={unitSystem} />
            </ContentBox>
        </div>
    ) : weatherData && weatherData.message ? (
        <ErrorScreen errorMessage="City not found, try again!">
        </ErrorScreen>
    ) : (
        <LoadingScreen loadingMessage="Loading data..."/>
    );
};

export default App;