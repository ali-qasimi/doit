

var markerStart;
var runList = [];

var map;
var markerUser;
var runData = {}
var routeLat = []
var routeLng = []
var startBinary = false;
var accuracyWindow, accuracy
var latlng = []
var status = "status: not recording";
var stopPin, runPath, startPin
var routeMap



 function initMap() {
     
     /*Description: initialises the map in the record page, and makes sure to update the position of the user. Also hides/shows buttons as appropriate    *///////////////////////////////////////////
     
     document.getElementById('stop').style.visibility = 'hidden';
    document.getElementById('clear').style.visibility = 'hidden';
     var initialPosition = {lat: -38.1, lng: 145.3};
     
     
     //below funcions find the current position of the user
function initialLocation() {
    
    /* Description: Makes sure that the device supports geolocation and calls the function that returns the initial position of the user.
    
    precondition: the browser must support geolocation, and have high accuracy
     
     return: returns an error if the browser does not support geolocation. */
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initialCoords);
        console.log(initialPosition)
    } else {
        document.getElementById.innerHTML = "Geolocation is not supported by this browser.";
    }
}
     
     initialLocation();
     
function initialCoords(position){
    
    /*parameter1: used to refer to the position of the device.
    
    Description: finds the latidude and longitude of the user. Then sets up a map and a marker that contains the initial position. It also obtains the accuracy of the current location
    
    return: map, accuracy, marker */
    initialPosition.lat = position.coords.latitude;
    initialPosition.lng = position.coords.longitude;

     map = new google.maps.Map(document.getElementById('map'),{
        center: initialPosition,
        zoom: 18
    });
    
    markerUser = new google.maps.Marker({
      position: initialPosition,
      map: map,
      title: 'You'  
    })
    
        accuracy = position.coords.accuracy; //accuracy of latlng in metres 
    accuracy = "accuracy: +/-" + accuracy + " m";
        
        accuracyWindow = new google.maps.InfoWindow({
        content: accuracy + "</br>" + status
  });
        
        markerUser.addListener('click', function(){
            accuracyWindow.open(map, markerUser)
        })
    
    getLocation();
}

     
    function getLocation() {
        
        
        /*description: if the geolocation works it calls the showPosition function every time the device moves. 
        
        return: returns an error when the geolocation is not available.
         
         precondition: geolocation should be supported*/
   
    if (navigator.geolocation){
        navigator.geolocation.watchPosition(showPosition); //keeps calling the showposition function doesnt return anything, except the error.
    } else {
        document.getElementById("map") = "Geolocation is not supported by this browser.";
           }
    }

    function showPosition(position){
        /*parameter1: used to refer to the position of the user.
    
    description: finds the latitude/longitude and the accuracy of the user's position. and pans the map to the current location. If the user is recording the run, the coordinates are stored as well.
        */
        var currentPosition = {};
        
        currentPosition.lat = position.coords.latitude;
        currentPosition.lng = position.coords.longitude;
        accuracy = position.coords.accuracy;
        accuracy = "accuracy: +/-" + accuracy + " m";
        
        accuracyWindow.setContent(accuracy + "</br>" + status)
        markerUser.setPosition(currentPosition);
        
        map.panTo(currentPosition);
    
    
    
    if (startBinary == true){
        latlng.push(currentPosition);
        
        startPin = new google.maps.Marker({
        position: latlng[0],
        map: map,
        title: 'Starting Point',
        icon: 'images/startPin.png'
        })
        drawPath();
        
    }
 }
 }


function start() {
    
    /* description: sets up a binary variable that is used in other functions. gets a times stamp. sets a status for the page. Also hides/shows buttons as appropriate.     */
    startBinary = true;
    startTime = Date.now();
    status = "status: recording";
    document.getElementById('start').style.visibility = 'hidden';
    document.getElementById('stop').style.visibility = 'visible';
    
}

function drawPath(){
    
    /*description: sets up a polyline along the latlng array.
    
    return: a polyline with red colour*/
        runPath = new google.maps.Polyline({
        path: latlng,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
});
    }

function stop() {
    
    /*Description: gets a time stamp, changes the status of the page, sets up a stopping pin and shows/hides buttons as necessary. then runs the save function   */
    
    startBinary = false;
    stopTime = Date.now();
    status = "status: recorded"
    
        stopPin = new google.maps.Marker({
        position: latlng[latlng.length-1],
        map: map,
        title: 'Stopping Point',
        icon: 'images/stopPin.png'
        })
    
    document.getElementById('start').style.visibility = 'visible';
    document.getElementById('stop').style.visibility = 'hidden';
    document.getElementById('clear').style.visibility = 'visible';
    save();
}

                            
function save(){
    /* description: confirms to save the run, the asks for a run name. then uses localstorage to save the the run name inside an array of run names, and the details of teh run inside an object.
    
    precondition: the server should have local storage.*/
    
   var yesNo = confirm("Press OK if you want to save this run")
    
    if (yesNo == true) {
        
        var runName = prompt("please enter a name for this run: ") 
        
        if (JSON.parse(localStorage.getItem("runList")) == null){
            runList.push(runName);
        }
        else {
            runList = JSON.parse(localStorage.getItem("runList"))
            runList.push(runName)
        }
        
        
        runData = {
            time: (stopTime/1000 - startTime/1000).toFixed(1),
            distance: routeDistance(latlng).toFixed(1),
            speed: (routeDistance(latlng)/(stopTime/1000 - startTime/1000)).toFixed(1),
            calories: calories((stopTime/1000 - startTime/1000)/60).toFixed(1),
            route: latlng
    };
        
        
    
        if (typeof(Storage) !== "undefined"){
            localStorage.setItem(runName, JSON.stringify(runData));
            localStorage.setItem("runList", JSON.stringify(runList));
        }
    }
    else if (yesNo == false) {}
}


function clearRoute(){
    /*description: reloads the page so that all the markers and polylines are cleared   */
    
    location.reload();
}

function routeDistance(latlng){
    /*parameter1: latlng array that contaisn the latitude/longitude object.
    
    description: uses a for loop to calculate the total distance of the route taken.
    
    return: total distance travelled by the user.*/
    
    var distance = 0;
    for (var iteration = 0; iteration<latlng.length-1; iteration++){
        distance += latlngDistance(latlng[iteration].lat, latlng[iteration].lng, latlng[iteration+1].lat, latlng[iteration+1].lng)
    }
    
    return distance
}

function latlngDistance(lat1, lon1, lat2, lon2){
    /*parameter1: latitude1, parameter2: longitude1, parameter3: latitude2, parameter4: longitude2      
    
    description: finds the distance between to positions given an latitudes and longitudes.
    
    return: distance between to points on the map*/
    
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var radlon1 = Math.PI * lon1/180
	var radlon2 = Math.PI * lon2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var distance = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	distance = Math.acos(distance)
	distance = distance * 180/Math.PI
	distance = distance * 60 * 1.1515
    distance = distance * 1609.344
	return distance
}

function calories(duration){
    //source: http://fitnowtraining.com/2012/01/formula-for-calories-burned/
    
    /*parameter1: duration of the run in seconds.
    
    description: uses average values to find the calories burned during a run
    
    return: calories burnt*/
    var result = (21*0.2017 - 78.5*0.073885 + 199*0.53905 - 37.74955)*(duration/4.184)
    
    return result
}


    function showResults(){
        
        
        /* description: sets up a map for teh view page. retrieves the runlist array. then uses a for loop to get the details of each of the runs in the runlist, and appends in a table. Also enables the display of each route on the map
        
        return: the run details of all the saved routes.*/
        
        document.getElementById('deleteButton').style.visibility = 'hidden';
        
        routeMap = new google.maps.Map(document.getElementById('map'),{
                center: {lat: -38.1, lng: 145.3},
                zoom: 18
                });
        
        var retrievedRunList = JSON.parse(localStorage.getItem("runList"));
        
        for (var iteration = 0; iteration <= retrievedRunList.length-1; iteration++){
            var retrievedRunData = JSON.parse(localStorage.getItem(retrievedRunList[iteration]))
        
            var tableRow = document.createElement("tr"); //table row
            var rowName = document.createElement("td");   // first table data
            
            rowName.setAttribute("class", "mdl-data-table__cell--non-numeric")
            rowName.setAttribute("id", iteration.toString())
            tableRow.setAttribute("onClick", "showRoute(\"" + Number(rowName.getAttribute("id")) + "\");enableDelete(\"" + Number(rowName.getAttribute("id")) + "\")")  //display the route on the map onclick
            rowName.appendChild(document.createTextNode(retrievedRunList[iteration]))
            tableRow.appendChild(rowName)
            
            for (prop in retrievedRunData){
                if (prop !== "route"){
                var rowData = document.createElement("td");   //create table data for the run details
                rowData.appendChild(document.createTextNode(retrievedRunData.prop))
                rowData.innerHTML = retrievedRunData[prop]
                tableRow.appendChild(rowData)
                }
            }
            
            document.getElementById("tableBody").appendChild(tableRow)
            
            
            }
    }
        
        
        function showRoute(runIndex){
            
            /* parameter1: runIndex is the index of the run name in the runlist array.
            description: retrieves the latlng array of the selected run and displays it as a polyline on the map. also places a marker at the end points. It also allows different runs to be displayed different route colours.
            
            return: polyline of the selected route.*/
            
            document.getElementById('deleteButton').style.visibility = 'visible'; //enable the delete button
            
            var retrievedRunList =  JSON.parse(localStorage.getItem("runList"));
            
            var retrievedRunData = JSON.parse(localStorage.getItem(retrievedRunList[runIndex]));
            
            console.log(retrievedRunData)
            
            var marker1 = new google.maps.Marker({
                position: retrievedRunData.route[0],
                map: routeMap,
                icon: 'images/startPin.png'
                });
            
            var marker2 = new google.maps.Marker({
                position: retrievedRunData.route[retrievedRunData.route.length-1],
                map: routeMap,
                icon: 'images/stopPin.png'
                });
            
            drawPath();
            runPath.setMap(routeMap)
            runPath.setPath(retrievedRunData.route)
            
            var colour = [{strokeColor: 'black'},{strokeColor: 'blue'},{strokeColor: 'brown'},{strokeColor: 'forestgreen'},{strokeColor: 'gold'}];
            //  ^^ random colours
            var randomColour = Math.floor(Math.random()*5);
            runPath.setOptions(colour[randomColour])  //add a random colour to the polyline.
            
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(marker1.getPosition());
            bounds.extend(marker2.getPosition());
            
            console.log(bounds)
            
            routeMap.fitBounds(bounds);   //allow the markers to fit within the map page
            
        }


            function enableDelete(runIndex){
                
                /* paramter1: runIndex is the index of the run name in the runlist array.
                
                description: enables the delete button and sets an onclick attribute to it.*/
              
                var deleteButton = document.getElementById("deleteButton");
                
                deleteButton.setAttribute("onclick", "deleteRun(\"" + runIndex + "\")");
            }
            
            function deleteRun(runIndex){
                
                /*parameter: runIndex is the index of the run name in the runlist array.
                description: removes the selected run from teh runlist arrat and its details as well.
                
                precondition: local storage should be availabe*/
                var retrievedRunList =  JSON.parse(localStorage.getItem("runList"));
                
                localStorage.removeItem(retrievedRunList[runIndex]);
                
                retrievedRunList.splice(runIndex, 1)
                
                if (typeof(Storage) !== "undefined"){
                    localStorage.setItem("runList", JSON.stringify(retrievedRunList));
                }
            
                location.reload(); //reload the page to show the update of results
            }


