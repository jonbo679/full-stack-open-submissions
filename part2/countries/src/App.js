import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Countries = ({ countries, handleCountrySelected }) => {
  return (
    countries.map(country =>
      <div key={country.name}>{country.name} <button onClick={() => handleCountrySelected(country)}>show</button></div>
    )
  )
}

const Country = ({ country, weather }) => {

  console.log("weather", weather);
  return (
    <>
      <h2>{country.name}</h2>
      <div>capital {country.capital}</div>
      <div>population {country.population}</div>
      <h3>languages</h3>
      <ul>{country.languages.map(language => <li key={language.name}>{language.name}</li>)}</ul>
      <img style={{ height: "100px" }} src={country.flag} alt={`Flag of ${country.name}`} />
      {weather && <Weather weather={weather} capital={country.capital}></Weather>}
    </>
  )
}

const Weather = ({ weather, capital }) => {
  console.log("weather", weather)
  return (
    <>
      <h3>Weather in {capital}</h3>
      <div><strong>temperature:</strong> {weather.temperature}</div>
      <img src={weather.weather_icons[0]} alt={weather.weather_descriptions} />
      <div><strong>wind:</strong> {weather.wind_speed} mph direction {weather.wind_dir}</div>
    </>
  )

}

const Filter = ({ filter, handleChangeFilter }) => {
  return (
    <div>find countries <input onChange={handleChangeFilter} value={filter} ></input></div>
  )
}

function App() {

  const [countries, setCountries] = useState([]);
  const [filter, setFilter] = useState("");
  const [weather, setWeather] = useState(undefined);

  useEffect(() => {
    axios.get("https://restcountries.eu/rest/v2/all")
      .then(response => {
        setCountries(response.data);
      })
  }, [])

  const filteredCountries = countries.filter(country => {
    return country.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
  });

  let currentCountry = "";
  if (filteredCountries.length === 1) {
    currentCountry = filteredCountries[0];
  } else {
    currentCountry = "";
  }

  useEffect(() => {
    if (currentCountry) {
      axios.get(`http://api.weatherstack.com/current?access_key=${process.env.REACT_APP_API_KEY}&query=${currentCountry.capital}`)
        .then(response => {
          console.log("response.data");
          setWeather(response.data.current)
        })
    }
  }, [currentCountry])

  const handleChangeFilter = (event) => {
    setFilter(event.target.value);
  }

  const handleCountrySelected = (country) => {
    setFilter(country.name);
  }



  return (
    <div className="App">
      <Filter filter={filter} handleChangeFilter={handleChangeFilter} />
      {filteredCountries.length < 10 ?
        filteredCountries.length === 1 ?
          <Country country={filteredCountries[0]} weather={weather} />
          :
          <Countries countries={filteredCountries} handleCountrySelected={handleCountrySelected} />
        :
        <div>Too many matches, specify another filter</div>}
    </div>
  );
}

export default App;
