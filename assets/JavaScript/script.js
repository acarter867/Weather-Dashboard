let APIKey = '22c381336de0f996a4083c7ecafd3174';

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
    btnSearch.on('click', displaySearch)   
});

function displaySearch(){
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth()+1).padStart(2, '0');
    let yyyy = String(today.getFullYear());
    today = '(' + mm + '/' + dd + '/' + yyyy + ')';
    let city = searchCity();
    
    let queryCity = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=1&appid=' + APIKey;
    
    //call api for coordinates using city name
    fetch(queryCity)
    .then(result => {
        console.log(result.status);
        return result.json()
    })
    .then(data => {
        //pass in coordinates for city and pull weather data
        let queryCoord = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + data[0].lat + '&lon=' + data[0].lon + '&units=imperial&appid=' + APIKey;
        fetch(queryCoord)
        .then(result => {
            console.log("Status: ", result.status)
            return result.json();
        })
        .then(data => {
            console.log(data)
            updateCurrent(data, today)
            getDays(data);
        });
        let searchedCities = localStorage.getItem('history');
        let parsedSearch = JSON.parse(searchedCities);
        if(parsedSearch == null || !parsedSearch.includes(city)){
            addToHistory(autoCaps(city));
        }
        $('.txt-search').val('');
    });
}

//display weather data of current city
function updateCurrent(data, date){
    $('.city-name').text(data.city.name + " " + date);
    $('.current-temp').text("Temp: " + data.list[0].main.temp + " °F");
    $('.current-wind').text("Wind: " + data.list[0].wind.speed + " MPH");
    $('.current-humidity').text("Humidity: " + data.list[0].main.humidity + "%");
}

//add current search to history and push to local storage. 
//would likely be faster to push all previously searched weather data to local storage.
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

    let dailyIcon = $('<h6></h6>').text(obj.icon);
    day.append(dailyIcon);

    let dailyTemp = $('<h6></h6>').text(obj.temp);
    day.append(dailyTemp);

    let dailyWind = $('<h6></h6>').text(obj.wind);
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
    console.log(today);

    let futureDates = [];
    //get list of *next* 5 dates 
    for(let i = 0; i < data.list.length; i++){
        let dayTime = data.list[i].dt_txt.split(" ");
        let day = dayTime[0];
        console.log(day)
        if(day > today && !futureDates.includes(day)){
            let formatDates = day.split('-');
            futureDates.push(day);
        }
    }
    console.log(futureDates.length)

    for(let i = 0; i < futureDates.length; i++){
        reformatFutureDate = futureDates[i].split("-");
        reformattedDate = reformatFutureDate[1] + "/" + reformatFutureDate[2] + "/" + reformatFutureDate[0];
        const dayOBJ = {
            date: reformattedDate,
            icon: "123",
            temp: "Temp: ",
            wind: "Wind: ",
            humidity: "Humidity: "
        }
        dailyForecast(dayOBJ)
    }

    console.log(futureDates)
}

//pull temp from input field and send coordinates to api call
function searchCity(){
    let input = $('.txt-search');
    let cityName = input.val();
    return cityName;
}

