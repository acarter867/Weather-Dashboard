let APIKey = '22c381336de0f996a4083c7ecafd3174';

//JQuery call
$(function(){
    getSearchHistory();
    let btnSearch = $('.btn-search');

    //change color of button on click
    btnSearch.on('mousedown', () => {
        btnSearch.css("background-color", "blue");
    })
    btnSearch.on('mouseup', () => {
        btnSearch.css("background-color", "rgb(100, 165, 229)");
    })
    //search city
    btnSearch.on('click', displaySearch);
});

function displaySearch(){
    //get and format todays date
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth()+1).padStart(2, '0');
    let yyyy = String(today.getFullYear());
    today = '(' + mm + '/' + dd + '/' + yyyy + ')';

    let city = searchCity();
    
    let queryCity = 'https://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=1&appid=' + APIKey;
    
    //call api for coordinates using city name
    fetch(queryCity)
    .then(result => {
        return result.json()
    })
    .then(data => {
        //pass in coordinates for city and pull weather data
        try{
            let queryCoord = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + data[0].lat + '&lon=' + data[0].lon + '&units=imperial&appid=' + APIKey;
            fetch(queryCoord)
            .then(result => {
                return result.json();
            })
            .then(data => {``
                updateCurrent(data, today);
                getDays(data);
            });
            let searchedCities = localStorage.getItem('history');
            let parsedSearch = JSON.parse(searchedCities);

            //avoid duplicates in search history
            if(parsedSearch == null || !parsedSearch.includes(city)){
                addToHistory(autoCaps(city));
            }
            $('.txt-search').val('');
        }catch{
            openModal();
        }
    });
}

//functions to open and close modals if city search returns error
function openModal(){
    $('.modal').removeClass('hidden');
    $('.overlay').removeClass('hidden');
    $('.error-message').text("'" + autoCaps($('.txt-search').val()) + "'" + " is not a searchable city!");
    $('.close-modal').on('click', closeModal);
}

function closeModal(){
    $('.modal').addClass('hidden');
    $('.overlay').addClass('hidden');
    $('.txt-search').val('');
}

//display weather data of current city
function updateCurrent(data, date){
    let weatherIcon = $('<img></img>');
    weatherIcon.attr('src', 'https://openweathermap.org/img/wn/' + data.list[0].weather[0].icon + '@2x.png')
    $('.city-name').text(data.city.name + " " + date);
    $('.city-name').append(weatherIcon)

    $('.current-temp').text("Temp: " + data.list[0].main.temp + " °F");
    $('.current-wind').text("Wind: " + data.list[0].wind.speed + " MPH");
    $('.current-humidity').text("Humidity: " + data.list[0].main.humidity + "%");
}

//add current search to history and push to local storage. 
//would likely be faster to push all previously searched weather data to local storage. TODO maybe?
function addToHistory(cName){
    let entries = [];
    entries = localStorage.getItem('history');
    let parsedEntry = JSON.parse(entries);
    if(entries == null){
        firstEntry = [cName];
        localStorage.setItem('history', JSON.stringify(firstEntry));
    }else{
        if(!parsedEntry.includes(cName));
        parsedEntry.push(cName);
        localStorage.setItem('history', JSON.stringify(parsedEntry));
    }
    let newBtn = $('<button></button>').text(cName);
    newBtn.on('click', () => {
        $('.txt-search').val(cName);
        displaySearch();
    });
    $('.history').append(newBtn);
}

//pull previous searches from localstorage & display as buttons
function getSearchHistory(){
    let previousEntries = localStorage.getItem('history');
    let parsedEntries = JSON.parse(previousEntries);
    if(parsedEntries !== null){
        for(let i = 0; i < parsedEntries.length; i++){
        let btnHistory = $('<button></button>').text(parsedEntries[i]);
        btnHistory.on('click', () => {
            $('.txt-search').val(parsedEntries[i]);
            displaySearch();
        });
        $('.history').append(btnHistory);
    }
    }
}

//function to guarentee all city searches are capitalized correctly & consistently (helps avoid duplicates)
function autoCaps(s){
    let words = s.split(" ");
    console.log("Words: " + words);
    let resultString = ""
    for(let i = 0; i < words.length; i++){
        adjustedWord = words[i][0].toUpperCase() + words[i].substring(1).toLowerCase();
        resultString += adjustedWord + ' ';
    }
    return resultString;
}

//set daily card info
function dailyForecast(obj){
    let day = $('<div></div>');
    day.attr('class', 'card');

    let dailyDate = $('<h5></h5>').text(obj.date);
    day.append(dailyDate);

    let dailyIcon = $('<img></img>');
    dailyIcon.attr('src', 'https://openweathermap.org/img/wn/' + obj.icon + '@2x.png')
    dailyIcon.attr('alt', 'weather descriptor icon');

    day.append(dailyIcon);

    let dailyTemp = $('<h6></h6>').text(obj.temp);
    day.append(dailyTemp);

    let dailyWind = $('<h6></h6>').text(obj.wind + " MPH");
    day.append(dailyWind);

    let dailyHumidity = $('<h6></h6>').text(obj.humidity);
    day.append(dailyHumidity);

    $('.infographic').append(day);
}

//sort by day & pull highest forcasted temp for card display
function getDays(data){
    $('.infographic').empty();

    let day = new Date();
    let yyyy = day.getFullYear();
    let mm = String(day.getMonth() + 1).padStart(2, '0');
    let dd = String(day.getDate()).padStart(2, '0');
    let today = yyyy + "-" + mm + "-" + dd;

    let futureDates = [];
    //get list of *next* 5 dates 
    for(let i = 0; i < data.list.length; i++){
        let dayTime = data.list[i].dt_txt.split(" ");
        let day = dayTime[0];
        if(day > today && !futureDates.includes(day)){
            futureDates.push(day);
        }
    }

    //search through future dates and find object with highest forecasted temp
    for(let i = 0; i < 5; i++){
        let highestTemp = findHighest(data, futureDates[i]);
        reformatFutureDate = futureDates[i].split("-");
        reformattedDate = reformatFutureDate[1] + "/" + reformatFutureDate[2] + "/" + reformatFutureDate[0];

        //object for each of the 5 days
        const dayOBJ = {
            date: reformattedDate,
            icon: highestTemp.weather[0].icon,
            temp: "Temp: " + highestTemp.main.temp + ' °F',
            wind: "Wind: " + highestTemp.wind.speed,
            humidity: "Humidity: " + highestTemp.main.humidity + "%"
        }
        //create card with new object data
        dailyForecast(dayOBJ)
    }
}

//function to find highest temp projection for a given day to display on 5 day forecast
function findHighest(data, targetDate){
    let currentHigh = Number.NEGATIVE_INFINITY;
    let currentObj;
    for(let i = 0; i < data.list.length; i++){
        let currentData = data.list[i];
        if(currentData.dt_txt.includes(targetDate)){
            if(currentData.main.temp > currentHigh){
                currentHigh = currentData.main.temp;
                currentObj = currentData;
            }
        }
    }
    return currentObj;
}

//pull temp from input field and send coordinates to api call
function searchCity(){
    let input = $('.txt-search');
    let cityName = input.val();
    return cityName;
}

