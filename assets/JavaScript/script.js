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
    
    let queryCity = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=5&appid=' + APIKey;
    
    fetch(queryCity)
    .then(result => {
        console.log(result.status);
        return result.json()
    })
    .then(data => {
        let queryCoord = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + data[0].lat + '&lon=' + data[0].lon + '&units=imperial&cnt=40&appid=' + APIKey;
        fetch(queryCoord)
        .then(result => {
            console.log("Status: ", result.status)
            return result.json();
        })
        .then(data => {
            console.log(data)
            updateCurrent(data, today)
        });
        let searchedCities = localStorage.getItem('history');
        let parsedSearch = JSON.parse(searchedCities);
        if(parsedSearch == null || !parsedSearch.includes(city)){
            addToHistory(autoCaps(city));
        }      
        $('.txt-search').val('');
    });

}

function updateCurrent(data, date){
    $('.city-name').text(data.city.name + " " + date);
    $('.current-temp').text("Temp: " + data.list[0].main.temp + " °F");
    $('.current-wind').text("Wind: " + data.list[0].wind.speed + " MPH");
    $('.current-humidity').text("Humidity: " + data.list[0].main.humidity + "%");
}

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

function searchCity(){
    let input = $('.txt-search');
    let cityName = input.val();
    return cityName;
}

