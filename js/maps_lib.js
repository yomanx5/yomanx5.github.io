/*!
 * TEMPLATE INSTRUCTIONS: Look for sections below marked MODIFY and adjust to fit your data and index.html page
 * Learn more at
 * Data Visualization book-in-progress by Jack Dougherty at Trinity College CT
 * http://epress.trincoll.edu/dataviz
 * and
 * Searchable Map Template with Google Fusion Tables
 * http://derekeder.com/searchable_map_template/
 *
 * Copyright 2012, Derek Eder
 * Licensed under the MIT license.
 * https://github.com/derekeder/FusionTable-Map-Template/wiki/License
 *
 * Date: 17/03/2014 template modified by Derek Eder and Jack Dougherty
 *
 */

// Enable the visual refresh
google.maps.visualRefresh = true;

var MapsLib = MapsLib || {};
var MapsLib = {

  //Setup section - put your Fusion Table details here
  //Using the v1 Fusion Tables API. See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info

  //MODIFY the encrypted Table IDs of your Fusion Tables (found under File => About)
  //NOTE: numeric IDs will be depricated soon
  fusionTableId:      "1rgEJ1-zdluRM7j35ueDcii2QCVPF7iSsUrjAZ-AN", //Point data layer  Original: 1WoxNIvjGQzQAk7B965hwVQOIl04f-Xn09JuTLu03                        

  //*MODIFY Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  //*Important* this key is for demonstration purposes. please register your own.
  googleApiKey:       "AIzaSyCOmC46B8kGL5E3hPUyeQy7THCAlyJQZsM&callback=initMap",

	 //Cambiada por la mia.
	
	
  //MODIFY name of the location column in your Fusion Table.
  //NOTE: if your location column name has spaces in it, surround it with single quotes
  //example: locationColumn:     "'my location'",
  //if your Fusion Table has two-column lat/lng data, see https://support.google.com/fusiontables/answer/175922   decia "Lat"
  locationColumn:     "Coordenadas",

  map_centroid:       new google.maps.LatLng(-25.40184,-69.273), // Las coordenadas del proyecto !! anteriores abajo
  //map_centroid:       new google.maps.LatLng(41.7682,-72.684), //center that your map defaults to
  
  
  locationScope:      "Taltal",      //geographical area appended to all address searches    original   locationScope:      "connecticut"
  recordName:         "result",       //for showing number of results
  recordNamePlural:   "results",

  searchRadius:       80000005,            //in meters ~ 1/2 mile   original   searchRadius:       805
  defaultZoom:        8,             //zoom level when map is loaded (bigger is more zoomed in)
  // el zoom era 12
  addrMarkerImage:    'images/blue-pushpin.png',
  currentPinpoint:    null,

  initialize: function() {
    $( "#result_count" ).html("");

    geocoder = new google.maps.Geocoder();
    var myOptions = {
      zoom: MapsLib.defaultZoom,
      center: MapsLib.map_centroid,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          stylers: [
            { saturation: -50 }, // MODIFY Saturation and Lightness if needed          { saturation: -100 },  // valor original
            { lightness: 50 }     // Current values make thematic polygon shading stand out over base map    { lightness: 40 }
          ]
        }
      ]
    };
    map = new google.maps.Map($("#map_canvas")[0],myOptions);
	infoWindow = new google.maps.InfoWindow();

		
    // maintains map centerpoint for responsive design
    google.maps.event.addDomListener(map, 'idle', function() {
        MapsLib.calculateCenter();
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(MapsLib.map_centroid);
    });

    MapsLib.searchrecords = null;

    //reset filters
    $("#search_address").val(MapsLib.convertToPlainString($.address.parameter('address')));
    var loadRadius = MapsLib.convertToPlainString($.address.parameter('radius'));
    if (loadRadius != "") $("#search_radius").val(loadRadius);
    else $("#search_radius").val(MapsLib.searchRadius);
    $("#result_box").hide();
	$(":checkbox").prop("checked", "checked");
    
    //-----custom initializers -- default setting to display Polygon1 layer
        
    //-----end of custom initializers-------

    //run the default search
    MapsLib.doSearch();
  },
	
  doSearch: function(location) {
	  
    MapsLib.clearSearch();

    var address = $("#search_address").val();
    MapsLib.searchRadius = $("#search_radius").val();

    var whereClause = MapsLib.locationColumn + " not equal to ''";

  //-----custom filters for point data layer
    //---MODIFY column header and values below to match your Google Fusion Table AND index.html
    //-- TEXTUAL OPTION to display legend and filter by non-numerical data in your table
	
    var type_column = "'profundidad (cm)'";  // -- note use of single & double quotes for two-word column header       Original var type_column = "'Program Type'"     OJO..debo poner en program type , el nombre de mi columna
    var tempWhereClause = [];
	
	//tempWhereClause.push($('input[name=depth]:checked').val());
	
	$('#zone23').click(function() {$('input[name=zone]').prop('checked', true);MapsLib.doSearch();});
	$('#zone24').click(function() {$('input[name=zone]').prop('checked', false);MapsLib.doSearch();});
	$('#Show42').click(function() {$('input[name=show]').prop('checked', true);MapsLib.doSearch();});
	$('#Show43').click(function() {$('input[name=show]').prop('checked', false);MapsLib.doSearch();});
	
	if ($('input[name=depth]:checked').val()=="superficial"){
		tempWhereClause.push("0-20");
		for (i=1;i<=32;i++){
			tempWhereClause.push(String(i));
		}
	} else if ($('input[name=depth]:checked').val()=="profundidad"){
		for (i=33;i<=100;i++){
			tempWhereClause.push(String(i));
		}
	}
    whereClause += " AND " + type_column + " IN ('" + tempWhereClause.join("','") + "')";

	var type_column = "'Número de Zona'";
    var tempWhereClause = [];
    if ( $("#zone1").is(':checked')) tempWhereClause.push("1");
    if ( $("#zone2").is(':checked')) tempWhereClause.push("2");
	if ( $("#zone3").is(':checked')) tempWhereClause.push("3");
	if ( $("#zone4").is(':checked')) tempWhereClause.push("4");	
	if ( $("#zone5").is(':checked')) tempWhereClause.push("5");
	if ( $("#zone6").is(':checked')) tempWhereClause.push("6");
	if ( $("#zone7").is(':checked')) tempWhereClause.push("7");
	if ( $("#zone8").is(':checked')) tempWhereClause.push("8");
	if ( $("#zone9").is(':checked')) tempWhereClause.push("9");
	if ( $("#zone10").is(':checked')) tempWhereClause.push("10");
    if ( $("#zone11").is(':checked')) tempWhereClause.push("11");
	if ( $("#zone12").is(':checked')) tempWhereClause.push("12");
	if ( $("#zone13").is(':checked')) tempWhereClause.push("13");	
	if ( $("#zone14").is(':checked')) tempWhereClause.push("14");
	if ( $("#zone15").is(':checked')) tempWhereClause.push("15");
	if ( $("#zone16").is(':checked')) tempWhereClause.push("16");
	if ( $("#zone17").is(':checked')) tempWhereClause.push("17");
	if ( $("#zone18").is(':checked')) tempWhereClause.push("18");
	if ( $("#zone19").is(':checked')) tempWhereClause.push("19");
	if ( $("#zone20").is(':checked')) tempWhereClause.push("20");
	if ( $("#zone21").is(':checked')) tempWhereClause.push("21");
	if ( $("#zone22").is(':checked')) tempWhereClause.push("22");
    whereClause += " AND " + type_column + " IN ('" + tempWhereClause.join("','") + "')";
	
	$('#Nothing').click(function() {
		type_column = "";
		tempWhereClause.push("");
		whereClause = type_column + " IN ('" + tempWhereClause.join("','") + "')";
		MapsLib.searchrecords.setMap(map)
		MapsLib.submitSearch(whereClause, map);
			$( "#result_count" ).html("");

			geocoder = new google.maps.Geocoder();
			var myOptions = {
			  zoom: MapsLib.defaultZoom,
			  center: MapsLib.map_centroid,
			  mapTypeId: google.maps.MapTypeId.ROADMAP,
			  styles: [
				{
				  stylers: [
					{ saturation: -50 }, // MODIFY Saturation and Lightness if needed          { saturation: -100 },  // valor original
					{ lightness: 50 }     // Current values make thematic polygon shading stand out over base map    { lightness: 40 }
				  ]
				}
			  ]
			};
			map = new google.maps.Map($("#map_canvas")[0],myOptions);
			infoWindow = new google.maps.InfoWindow();

				
			// maintains map centerpoint for responsive design
			google.maps.event.addDomListener(map, 'idle', function() {
				MapsLib.calculateCenter();
			});

			google.maps.event.addDomListener(window, 'resize', function() {
				map.setCenter(MapsLib.map_centroid);
			});
		});
	

    //-------end of custom filters--------

    if (address != "") {
      if (address.toLowerCase().indexOf(MapsLib.locationScope) == -1)
        address = address + " " + MapsLib.locationScope;

      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          MapsLib.currentPinpoint = results[0].geometry.location;

          $.address.parameter('address', encodeURIComponent(address));
          $.address.parameter('radius', encodeURIComponent(MapsLib.searchRadius));
          map.setCenter(MapsLib.currentPinpoint);
          map.setZoom(14);

          MapsLib.addrMarker = new google.maps.Marker({
            position: MapsLib.currentPinpoint,
            map: map,
            icon: MapsLib.addrMarkerImage,
            animation: google.maps.Animation.DROP,
            title:address
          });
		  
          whereClause += " AND ST_INTERSECTS(" + MapsLib.locationColumn + ", CIRCLE(LATLNG" + MapsLib.currentPinpoint.toString() + "," + MapsLib.searchRadius + "))";

          MapsLib.drawSearchRadiusCircle(MapsLib.currentPinpoint);
          MapsLib.submitSearch(whereClause, map, MapsLib.currentPinpoint);
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }
    else { //search without geocoding callback
      MapsLib.submitSearch(whereClause, map);
    }
  },
	
  submitSearch: function(whereClause, map, location) {
    //get using all filters
    //NOTE: styleId and templateId are recently added attributes to load custom marker styles and info windows
    //you can find your Ids inside the link generated by the 'Publish' option in Fusion Tables
    //for more details, see https://developers.google.com/fusiontables/docs/v1/using#WorkingStyles

    MapsLib.searchrecords = new google.maps.FusionTablesLayer({
		suppressInfoWindows: true,
      query: {
        from:   MapsLib.fusionTableId,
        select: MapsLib.locationColumn,
        where:  whereClause
      },
      styleId: 2,
      templateId: 2
    });
	
	google.maps.event.addListener(MapsLib.searchrecords, 'click', function(e) {
		windowControl(e, infoWindow, map);
	});
	
	//Populate new Info Window
	function windowControl(e, infoWindow, map) {
		// Extract various columns from Fusion Table
		var HTML;
		HTML = "<div class='googft-info-window'>";	
		if ( $("#Show0").is(':checked')) HTML += "<strong>Nombre Muestra</strong>:" 		+ e.row['Nombre muestra'].value 		+ "<br>";
		if ( $("#Show1").is(':checked')) HTML += "<strong>Fecha Muestra</strong>:" 			+ e.row['Fecha toma muestra 11'].value 	+ "<br>";
		if ( $("#Show2").is(':checked')) HTML += "<strong>Profundidad cm</strong>:" 		+ e.row['profundidad (cm)'].value 		+ "<br>";
		if ( $("#Show3").is(':checked')) HTML += "<strong>Número Zona</strong>:" 			+ e.row['Número de Zona'].value 		+ "<br>";
		if ( $("#Show4").is(':checked')) HTML += "<strong>Categoría Minera</strong>:" 		+ e.row['Categoría Minera'].value 		+ "<br>";
		if ( $("#Show5").is(':checked')) HTML += "<strong>Coordenadas</strong>:" 			+ e.row['Coordenadas'].value 			+ "<br>";
		if ( $("#Show6").is(':checked')) HTML += "<strong>Pot. Redox mV</strong>:" 			+ e.row['Potencial Redox (mV)'].value 	+ "<br>";
		if ( $("#Show7").is(':checked')) HTML += "<strong>pH</strong>:" 					+ e.row['pH'].value 					+ "<br>";
		if ( $("#Show8").is(':checked')) HTML += "<strong>Conduct. µS/cm</strong>:" 		+ e.row['Conductividad (µS/cm)'].value 	+ "<br>";
		if ( $("#Show9").is(':checked')) HTML += "<strong>Mo</strong>:" 					+ e.row['Mo'].value 					+ "<br>";
		if ( $("#Show10").is(':checked')) HTML += "<strong>Zr</strong>:" 					+ e.row['Zr'].value 					+ "<br>";
		if ( $("#Show11").is(':checked')) HTML += "<strong>Sr</strong>:" 					+ e.row['Sr'].value 					+ "<br>";
		if ( $("#Show12").is(':checked')) HTML += "<strong>U</strong>:" 					+ e.row['U'].value 						+ "<br>";
		if ( $("#Show13").is(':checked')) HTML += "<strong>Rb</strong>:" 					+ e.row['Rb'].value 					+ "<br>";
		if ( $("#Show14").is(':checked')) HTML += "<strong>Th</strong>:" 					+ e.row['Th'].value 		+ "<br>";
		if ( $("#Show15").is(':checked')) HTML += "<strong>Pb</strong>:" 					+ e.row['Pb'].value 		+ "<br>";
		if ( $("#Show16").is(':checked')) HTML += "<strong>Au</strong>:" 					+ e.row['Au'].value 		+ "<br>";
		if ( $("#Show17").is(':checked')) HTML += "<strong>Se</strong>:" 					+ e.row['Se'].value 		+ "<br>";
		if ( $("#Show18").is(':checked')) HTML += "<strong>As</strong>:" 					+ e.row['As'].value 		+ "<br>";
		if ( $("#Show19").is(':checked')) HTML += "<strong>Hg</strong>:" 					+ e.row['Hg'].value 		+ "<br>";
		if ( $("#Show20").is(':checked')) HTML += "<strong>Zn</strong>:" 					+ e.row['Zn'].value 		+ "<br>";
		if ( $("#Show21").is(':checked')) HTML += "<strong>W</strong>:" 					+ e.row['W'].value 			+ "<br>";
		if ( $("#Show22").is(':checked')) HTML += "<strong>Cu</strong>:" 					+ e.row['Cu'].value 		+ "<br>";
		if ( $("#Show23").is(':checked')) HTML += "<strong>Ni</strong>:" 					+ e.row['Ni'].value 		+ "<br>";
		if ( $("#Show24").is(':checked')) HTML += "<strong>Co</strong>:" 					+ e.row['Co'].value 		+ "<br>";
		if ( $("#Show25").is(':checked')) HTML += "<strong>Fe</strong>:" 					+ e.row['Fe'].value 		+ "<br>";
		if ( $("#Show26").is(':checked')) HTML += "<strong>Mn</strong>:" 					+ e.row['Mn'].value 		+ "<br>";
		if ( $("#Show27").is(':checked')) HTML += "<strong>Cr</strong>:" 					+ e.row['Cr'].value 		+ "<br>";
		if ( $("#Show28").is(':checked')) HTML += "<strong>V</strong>:" 					+ e.row['V'].value 			+ "<br>";
		if ( $("#Show29").is(':checked')) HTML += "<strong>Ti</strong>:" 					+ e.row['Ti'].value 		+ "<br>";
		if ( $("#Show30").is(':checked')) HTML += "<strong>Sc</strong>:" 					+ e.row['Sc'].value 		+ "<br>";
		if ( $("#Show31").is(':checked')) HTML += "<strong>Ca</strong>:" 					+ e.row['Ca'].value 		+ "<br>";
		if ( $("#Show32").is(':checked')) HTML += "<strong>K</strong>:" 					+ e.row['K'].value 			+ "<br>";
		if ( $("#Show33").is(':checked')) HTML += "<strong>S</strong>:" 					+ e.row['S'].value 			+ "<br>";
		if ( $("#Show34").is(':checked')) HTML += "<strong>Ba</strong>:" 					+ e.row['Ba'].value 		+ "<br>";
		if ( $("#Show35").is(':checked')) HTML += "<strong>Cs</strong>:" 					+ e.row['Cs'].value 		+ "<br>";
		if ( $("#Show36").is(':checked')) HTML += "<strong>Te</strong>:" 					+ e.row['Te'].value 		+ "<br>";
		if ( $("#Show37").is(':checked')) HTML += "<strong>Sb</strong>:" 					+ e.row['Sb'].value 		+ "<br>";
		if ( $("#Show38").is(':checked')) HTML += "<strong>Sn</strong>:" 					+ e.row['Sn'].value 		+ "<br>";
		if ( $("#Show39").is(':checked')) HTML += "<strong>Cd</strong>:" 					+ e.row['Cd'].value 		+ "<br>";
		if ( $("#Show40").is(':checked')) HTML += "<strong>Ag</strong>:" 					+ e.row['Ag'].value 		+ "<br>";
		if ( $("#Show41").is(':checked')) HTML += "<strong>Pd</strong>:" 					+ e.row['Pd'].value 		+ "<br>";
		HTML +="</div>";
		infoWindow.setOptions({
			content: HTML,
			position: e.latLng,
			pixelOffset: e.pixelOffset
			});
			infoWindow.open(map);
	}
	//End of new info window
	
    MapsLib.searchrecords.setMap(map);
    MapsLib.getCount(whereClause);
    MapsLib.getList(whereClause);
  },
  // MODIFY if you change the number of Polygon layers
  clearSearch: function() {
    if (MapsLib.searchrecords != null)
      MapsLib.searchrecords.setMap(null);
    if (MapsLib.addrMarker != null)
      MapsLib.addrMarker.setMap(null);
    if (MapsLib.searchRadiusCircle != null)
      MapsLib.searchRadiusCircle.setMap(null);
  },

  findMe: function() {
    // Try W3C Geolocation (Preferred)
    var foundLocation;

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        foundLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        MapsLib.addrFromLatLng(foundLocation);
      }, null);
    }
    else {
      alert("Sorry, we could not find your location.");
    }
  },

  addrFromLatLng: function(latLngPoint) {
    geocoder.geocode({'latLng': latLngPoint}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $('#search_address').val(results[1].formatted_address);
          $('.hint').focus();
          MapsLib.doSearch();
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  },

  drawSearchRadiusCircle: function(point) {
      var circleOptions = {
        strokeColor: "#4b58a6",
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: "#4b58a6",
        fillOpacity: 0.05,
        map: map,
        center: point,
        clickable: false,
        zIndex: -1,
        radius: parseInt(MapsLib.searchRadius)
      };
      MapsLib.searchRadiusCircle = new google.maps.Circle(circleOptions);
  },

  query: function(selectColumns, whereClause, groupBY, orderBY, limit, callback) {
    var queryStr = [];
    queryStr.push("SELECT " + selectColumns);
    queryStr.push(" FROM " + MapsLib.fusionTableId);

    if (whereClause != "")
      queryStr.push(" WHERE " + whereClause);

    if (groupBY != "")
      queryStr.push(" GROUP BY " + groupBY);

    if (orderBY != "")
      queryStr.push(" ORDER BY " + orderBY);

     if (limit != "")
      queryStr.push(" LIMIT " + limit);

    var sql = encodeURIComponent(queryStr.join(" "));
    // console.log(sql)
    $.ajax({url: "https://www.googleapis.com/fusiontables/v1/query?sql="+sql+"&callback="+callback+"&key="+MapsLib.googleApiKey, dataType: "jsonp"});
  },

  handleError: function(json) {
    if (json["error"] != undefined) {
      var error = json["error"]["errors"]
      console.log("Error in Fusion Table call!");
      for (var row in error) {
        console.log(" Domain: " + error[row]["domain"]);
        console.log(" Reason: " + error[row]["reason"]);
        console.log(" Message: " + error[row]["message"]);
      }
    }
  },
	
  getCount: function(whereClause) {
    var selectColumns = "Count()";
    MapsLib.query(selectColumns, whereClause,"", "", "", "MapsLib.displaySearchCount");
  },

  displaySearchCount: function(json) {
    MapsLib.handleError(json);
    var numRows = 0;
    if (json["rows"] != null)
      numRows = json["rows"][0];

    var name = MapsLib.recordNamePlural;
    if (numRows == 1)
    name = MapsLib.recordName;
    $( "#result_box" ).fadeOut(function() {
        $( "#result_count" ).html(MapsLib.addCommas(numRows) + " " + name + " found");
      });
    $( "#result_box" ).fadeIn();
  },

  getList: function(whereClause) {
    // select specific columns from the fusion table to display in th list
    // NOTE: we'll be referencing these by their index (0 = School, 1 = GradeLevels, etc), so order matters!
	
    var selectColumns = "'Nombre muestra','Fecha toma muestra 11','profundidad (cm)','Número de Zona','Categoría Minera','Coordenadas','Potencial Redox (mV)','pH', 'Conductividad (µS/cm)','Mo','Zr','Sr','U','Rb','Th','Pb','Au','Se','As','Hg','Zn','W','Cu','Ni','Co','Fe','Mn','Cr','V','Ti','Sc','Ca','K','S','Ba','Cs','Te','Sb','Sn','Cd','Ag','Pd'";
    MapsLib.query(selectColumns, whereClause,"", "", 500, "MapsLib.displayList");
  },

  displayList: function(json) {
    MapsLib.handleError(json);
    var columns = json["columns"];
    var rows = json["rows"];
    var template = "";

    var results = $("#listview");
    results.empty(); //hide the existing list and empty it out first

    if (rows == null) {
      //clear results list
      results.append("<span class='lead'>No results found</span>");
      }
    else {

      //set table headers
      var list_table = "\
      <table class='table' id ='list_table'>\
        <thead>\
          <tr><small>"
			if ( $("#Show0").is(':checked')) list_table += "<th>Nombre muestra </th>";
			if ( $("#Show1").is(':checked')) list_table += "<th>Fecha muestra </th>";
			if ( $("#Show2").is(':checked')) list_table += "<th>Profundidad </th>";
			if ( $("#Show3").is(':checked')) list_table += "<th>Número zona </th>";
			if ( $("#Show4").is(':checked')) list_table += "<th>Categoría Minera </th>";
			if ( $("#Show5").is(':checked')) list_table += "<th>Coordenadas </th>";
			if ( $("#Show6").is(':checked')) list_table += "<th>Pot.Redox mV </th>";
			if ( $("#Show7").is(':checked')) list_table += "<th>pH </th>";
			if ( $("#Show8").is(':checked')) list_table += "<th>Conductividad </th>";
			if ( $("#Show9").is(':checked')) list_table += "<th>Mo</th>";
			if ( $("#Show10").is(':checked')) list_table += "<th>Zr</th>";
			if ( $("#Show11").is(':checked')) list_table += "<th>Sr</th>";
			if ( $("#Show12").is(':checked')) list_table += "<th>U</th>";
			if ( $("#Show13").is(':checked')) list_table += "<th>Rb</th>";
			if ( $("#Show14").is(':checked')) list_table += "<th>Th</th>";
			if ( $("#Show15").is(':checked')) list_table += "<th>Pb</th>";
			if ( $("#Show16").is(':checked')) list_table += "<th>Au</th>";
			if ( $("#Show17").is(':checked')) list_table += "<th>Se</th>";
			if ( $("#Show18").is(':checked')) list_table += "<th>As</th>";
			if ( $("#Show19").is(':checked')) list_table += "<th>Hg</th>";
			if ( $("#Show20").is(':checked')) list_table += "<th>Zn</th>";
			if ( $("#Show21").is(':checked')) list_table += "<th>W</th>";
			if ( $("#Show22").is(':checked')) list_table += "<th>Cu</th>";
			if ( $("#Show23").is(':checked')) list_table += "<th>Ni</th>";
			if ( $("#Show24").is(':checked')) list_table += "<th>Co</th>";
			if ( $("#Show25").is(':checked')) list_table += "<th>Fe</th>";
			if ( $("#Show26").is(':checked')) list_table += "<th>Mn</th>";
			if ( $("#Show27").is(':checked')) list_table += "<th>Cr</th>";
			if ( $("#Show28").is(':checked')) list_table += "<th>V</th>";
			if ( $("#Show29").is(':checked')) list_table += "<th>Ti</th>";
			if ( $("#Show30").is(':checked')) list_table += "<th>Sc</th>";
			if ( $("#Show31").is(':checked')) list_table += "<th>Ca</th>";
			if ( $("#Show32").is(':checked')) list_table += "<th>K</th>";
			if ( $("#Show33").is(':checked')) list_table += "<th>S</th>";
			if ( $("#Show34").is(':checked')) list_table += "<th>Ba</th>";
			if ( $("#Show35").is(':checked')) list_table += "<th>Cs</th>";
			if ( $("#Show36").is(':checked')) list_table += "<th>Te</th>";
			if ( $("#Show37").is(':checked')) list_table += "<th>Sb</th>";
			if ( $("#Show38").is(':checked')) list_table += "<th>Sn</th>";
			if ( $("#Show39").is(':checked')) list_table += "<th>Cd</th>";
			if ( $("#Show40").is(':checked')) list_table += "<th>Ag</th>";
			if ( $("#Show41").is(':checked')) list_table += "<th>Pd</th>";
			list_table += "</small></tr>\
			</thead>\
		<tbody>";
		  // based on the columns we selected in getList()
		  // rows[row][0] = Primera columna mencionada en GetList
		  // rows[row][1] = Segunda columna mencion...
		  for (var row in rows) {
			list_table += "\
			  <tr><small>"
				if ( $("#Show0").is(':checked')) list_table += "<td>" + rows[row][0] +"</td>";
				if ( $("#Show1").is(':checked')) list_table += "<td>" + rows[row][1] +"</td>";
				if ( $("#Show2").is(':checked')) list_table += "<td>" + rows[row][2] +"</td>";
				if ( $("#Show3").is(':checked')) list_table += "<td>" + rows[row][3] +"</td>";
				if ( $("#Show4").is(':checked')) list_table += "<td>" + rows[row][4] +"</td>";
				if ( $("#Show5").is(':checked')) list_table += "<td>" + rows[row][5] +"</td>";
				if ( $("#Show6").is(':checked')) list_table += "<td>" + rows[row][6] +"</td>";
				if ( $("#Show7").is(':checked')) list_table += "<td>" + rows[row][7] +"</td>";
				if ( $("#Show8").is(':checked')) list_table += "<td>" + rows[row][8] +"</td>";
				if ( $("#Show9").is(':checked')) list_table += "<td>" + rows[row][9] +"</td>";
				if ( $("#Show10").is(':checked')) list_table += "<td>" + rows[row][10] +"</td>";
				if ( $("#Show11").is(':checked')) list_table += "<td>" + rows[row][11] +"</td>";
				if ( $("#Show12").is(':checked')) list_table += "<td>" + rows[row][12] +"</td>";
				if ( $("#Show13").is(':checked')) list_table += "<td>" + rows[row][13] +"</td>";
				if ( $("#Show14").is(':checked')) list_table += "<td>" + rows[row][14] +"</td>";
				if ( $("#Show15").is(':checked')) list_table += "<td>" + rows[row][15] +"</td>";
				if ( $("#Show16").is(':checked')) list_table += "<td>" + rows[row][16] +"</td>";
				if ( $("#Show17").is(':checked')) list_table += "<td>" + rows[row][17] +"</td>";
				if ( $("#Show18").is(':checked')) list_table += "<td>" + rows[row][18] +"</td>";
				if ( $("#Show19").is(':checked')) list_table += "<td>" + rows[row][19] +"</td>";
				if ( $("#Show20").is(':checked')) list_table += "<td>" + rows[row][20] +"</td>";
				if ( $("#Show21").is(':checked')) list_table += "<td>" + rows[row][21] +"</td>";
				if ( $("#Show22").is(':checked')) list_table += "<td>" + rows[row][22] +"</td>";
				if ( $("#Show23").is(':checked')) list_table += "<td>" + rows[row][23] +"</td>";
				if ( $("#Show24").is(':checked')) list_table += "<td>" + rows[row][24] +"</td>";
				if ( $("#Show25").is(':checked')) list_table += "<td>" + rows[row][25] +"</td>";
				if ( $("#Show26").is(':checked')) list_table += "<td>" + rows[row][26] +"</td>";
				if ( $("#Show27").is(':checked')) list_table += "<td>" + rows[row][27] +"</td>";
				if ( $("#Show28").is(':checked')) list_table += "<td>" + rows[row][28] +"</td>";
				if ( $("#Show29").is(':checked')) list_table += "<td>" + rows[row][29] +"</td>";
				if ( $("#Show30").is(':checked')) list_table += "<td>" + rows[row][30] +"</td>";
				if ( $("#Show31").is(':checked')) list_table += "<td>" + rows[row][31] +"</td>";
				if ( $("#Show32").is(':checked')) list_table += "<td>" + rows[row][32] +"</td>";
				if ( $("#Show33").is(':checked')) list_table += "<td>" + rows[row][33] +"</td>";
				if ( $("#Show34").is(':checked')) list_table += "<td>" + rows[row][34] +"</td>";
				if ( $("#Show35").is(':checked')) list_table += "<td>" + rows[row][35] +"</td>";
				if ( $("#Show36").is(':checked')) list_table += "<td>" + rows[row][36] +"</td>";
				if ( $("#Show37").is(':checked')) list_table += "<td>" + rows[row][37] +"</td>";
				if ( $("#Show38").is(':checked')) list_table += "<td>" + rows[row][38] +"</td>";
				if ( $("#Show39").is(':checked')) list_table += "<td>" + rows[row][39] +"</td>";
				if ( $("#Show40").is(':checked')) list_table += "<td>" + rows[row][40] +"</td>";
				if ( $("#Show41").is(':checked')) list_table += "<td>" + rows[row][41] +"</td>";
			  list_table += "</small></tr>";
		  }
		  list_table += "\
		  </tbody>\
        </table>";

      // add the table to the page
      results.append(list_table);
  
      // init datatable
      // once we have our table put together and added to the page, we need to initialize DataTables
      // reference: http://datatables.net/examples/index

      // custom sorting functions defined in js/jquery.dataTables.sorting.js
      // custom Bootstrap styles for pagination defined in css/dataTables.bootstrap.css

      $("#list_table").dataTable({
          "aaSorting": [[0, "asc"]], //default column to sort by (School)
          "aoColumns": [ // tells DataTables how to perform sorting for each column
              { "sType": "html-string" }, //School name with HTML for the link, which we want to ignore
              null, // Grades - default text sorting
              null, // Address - default text sorting
              null, // Manager - default text sorting
              { "sType": "data-value-num" } // Gain - sort by a hidden data-value attribute
          ],
          "bFilter": false, // disable search box since we already have our own
          "bInfo": false, // disables results count - we already do this too
          "bPaginate": true, // enables pagination
          "sPaginationType": "bootstrap", // custom CSS for pagination in Bootstrap
          "bAutoWidth": false
      });
    }
   },


  addCommas: function(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  },

  // maintains map centerpoint for responsive design
  calculateCenter: function() {
    center = map.getCenter();
  },

  //converts a slug or query string in to readable text
  convertToPlainString: function(text) {
    if (text == undefined) return '';
  	return decodeURIComponent(text);
  }
  
  //-----custom functions-------
  // NOTE: if you add custom functions, make sure to append each one with a comma, except for the last one.
  // This also applies to the convertToPlainString function above
  
  //-----end of custom functions-------
}
