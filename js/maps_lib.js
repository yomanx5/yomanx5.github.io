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
  fusionTableId:      "1wXBR9lB6qM6ZfaeIp95AkqqSApDzd3oAI_p48g_S", // datos solo sup Base-datos-final del proyecto
    // base de datos solo superficie completa 1okfkLjlPceQtAMn83VYyNpUkjnAxcxDOH18DkJDj
    // datos de Base de datos Mapa FONDEF.  Point data layer  Original: 1rgEJ1-zdluRM7j35ueDcii2QCVPF7iSsUrjAZ-AN
    // base de datos completa, pero no compila, por no compatibiidad de nombres
    //  fusionTableId:      "1rgEJ1-zdluRM7j35ueDcii2QCVPF7iSsUrjAZ-AN"  // tabla de datos antigua datos fonde-c
    // 19Yr6jjhl4LThlL_VeDBB5yqcvv8dLRK0HePYyQCd, tabla tipo b funciona

  polygon1TableID:    "1QCZbdyN0hQfB8fBdhDz2-zmbdvIvS3VS_qcKA7s4", //Outline map layer of CT town boundaries, original polygon1TableID:    "1ceippR4giBiF-pT9PE1YAUvebFp6_NKvYriccYo"
  polygon2TableID:    "1VopQGBhRKyyk25EIA5ptScvULxR68d43RhZ1ycM", //Thematic map layer of selected CT school districts

  //*MODIFY Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  //*Important* this key is for demonstration purposes. please register your own.
  googleApiKey:       "AIzaSyDWI-uh-hTBmGL4KVF1t9ulHk2oyCB8bfs&callback=initMap",

	 //Cambiada por la mia. antigua  googleApiKey:       "AIzaSyCOmC46B8kGL5E3hPUyeQy7THCAlyJQZsM&callback=initMap",
	
	
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
      
      
    // Aca esta incorporado el polygono, 1 y 2 ...sin embargo esto debe modificarse  
      
        // MODIFY if needed: defines background polygon1 and polygon2 layers
    MapsLib.polygon1 = new google.maps.FusionTablesLayer({
      query: {
        from:   MapsLib.polygon1TableID,
        select: "geometry"
      },
      styleId: 2,
      templateId: 2
    });

    MapsLib.polygon2 = new google.maps.FusionTablesLayer({
      query: {
        from:   MapsLib.polygon2TableID,
        select: "geometry"
      },
      styleId: 2,
      templateId: 2
    });
  
      // Aca se acaba la inclusion ! ojo esta sujeto a modificaciones
      
      
      
      
      
      
      

    //reset filters
    $("#search_address").val(MapsLib.convertToPlainString($.address.parameter('address')));
    var loadRadius = MapsLib.convertToPlainString($.address.parameter('radius'));
    if (loadRadius != "") $("#search_radius").val(loadRadius);
    else $("#search_radius").val(MapsLib.searchRadius);
    $("#result_box").hide();
	$(":checkbox").prop("checked", "checked");
    
      
      
    //-----custom initializers -- default setting to display Polygon1 layer
        
      // Agregado del template, para incializar el box de polygon1
          $("#rbPolygon0").attr("checked", "checked"); 
        
      
    //-----end of custom initializers-------

      
      
      
    //run the default search
    MapsLib.doSearch();
  },
	
  doSearch: function(location) {
	  
    MapsLib.clearSearch();
      
      
      // Agregado, del template, ojo se puede mejorar ! o se debe ser mejorar
      
          // MODIFY if needed: shows background polygon layer depending on which checkbox is selected
    if ($("#rbPolygon1").is(':checked')) {
      MapsLib.polygon1.setMap(map);
    }
    else if ($("#rbPolygon2").is(':checked')) {
      MapsLib.polygon2.setMap(map);
    }
      
      // Fin de pegado
      
      
      
      

    var address = $("#search_address").val();
    MapsLib.searchRadius = $("#search_radius").val();

    var whereClause = MapsLib.locationColumn + " not equal to ''";

  //-----custom filters for point data layer
    //---MODIFY column header and values below to match your Google Fusion Table AND index.html
    //-- TEXTUAL OPTION to display legend and filter by non-numerical data in your table
	
    var type_column = "'profundidad (cm)'";  // -- note use of single & double quotes for two-word column header       Original var type_column = "'Program Type'"     OJO..debo poner en program type , el nombre de mi columna
    var tempWhereClause = [];
	
	//tempWhereClause.push($('input[name=depth]:checked').val());
	
	$('#zone34').click(function() {$('input[name=zone]').prop('checked', true);MapsLib.doSearch();});
	$('#zone35').click(function() {$('input[name=zone]').prop('checked', false);MapsLib.doSearch();});
	$('#Show90').click(function() {$('input[name=show]').prop('checked', true);MapsLib.doSearch();});
	$('#Show91').click(function() {$('input[name=show]').prop('checked', false);MapsLib.doSearch();});
	
	if ($('input[name=depth]:checked').val()=="superficial"){
		tempWhereClause.push("20");
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
      if ( $("#zone23").is(':checked')) tempWhereClause.push("23");
      if ( $("#zone24").is(':checked')) tempWhereClause.push("24");
      if ( $("#zone25").is(':checked')) tempWhereClause.push("25");
      if ( $("#zone26").is(':checked')) tempWhereClause.push("26");
      if ( $("#zone27").is(':checked')) tempWhereClause.push("27");
      if ( $("#zone28").is(':checked')) tempWhereClause.push("28");
      if ( $("#zone29").is(':checked')) tempWhereClause.push("29");
      if ( $("#zone30").is(':checked')) tempWhereClause.push("30");
      if ( $("#zone31").is(':checked')) tempWhereClause.push("31");
      if ( $("#zone32").is(':checked')) tempWhereClause.push("32");
      if ( $("#zone33").is(':checked')) tempWhereClause.push("33");
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
		if ( $("#Show0").is(':checked')) HTML += "<strong>Sample Name</strong>:" 		+ e.row['Nombre muestra'].value 		+ "<br>";
		if ( $("#Show1").is(':checked')) HTML += "<strong>Sample date</strong>:" 			+ e.row['Fecha toma muestra 11'].value 	+ "<br>";
		if ( $("#Show2").is(':checked')) HTML += "<strong>Depth cm</strong>:" 		+ e.row['profundidad (cm)'].value 		+ "<br>";
		if ( $("#Show3").is(':checked')) HTML += "<strong>Zone</strong>:" 			+ e.row['Número de Zona'].value 		+ "<br>";
		if ( $("#Show4").is(':checked')) HTML += "<strong>Mining Category</strong>:" 		+ e.row['Categoría Minera'].value 		+ "<br>";
		if ( $("#Show5").is(':checked')) HTML += "<strong>Coordinates</strong>:" 			+ e.row['Coordenadas'].value 			+ "<br>";
		if ( $("#Show6").is(':checked')) HTML += "<strong>Pot. Redox mV</strong>:" 			+ e.row['Potencial Redox (mV)'].value 	+ "<br>";
		if ( $("#Show7").is(':checked')) HTML += "<strong>pH</strong>:" 					+ e.row['pH'].value 					+ "<br>";
		if ( $("#Show8").is(':checked')) HTML += "<strong>Conduct. µS/cm</strong>:" 		+ e.row['Conductividad (µS/cm)'].value 	+ "<br>";
		if ( $("#Show9").is(':checked')) HTML += "<strong>Ag XRF</strong>:" 				+ e.row['Ag XRF'].value 					+ "<br>";
		if ( $("#Show10").is(':checked')) HTML += "<strong>Ag ICP</strong>:" 				+ e.row['Ag ICP'].value 					+ "<br>";
		if ( $("#Show11").is(':checked')) HTML += "<strong>Al ICP</strong>:"				+ e.row['Al ICP'].value 					+ "<br>";
		if ( $("#Show12").is(':checked')) HTML += "<strong>As ICP</strong>:" 				+ e.row['As ICP'].value 						+ "<br>";
		if ( $("#Show13").is(':checked')) HTML += "<strong>As XRF</strong>:" 				+ e.row['As XRF'].value 					+ "<br>";
		if ( $("#Show14").is(':checked')) HTML += "<strong>B ICP</strong>:" 				+ e.row['B ICP'].value 		+ "<br>";
		if ( $("#Show15").is(':checked')) HTML += "<strong>Ba ICP</strong>:" 				+ e.row['Ba ICP'].value 		+ "<br>";
		if ( $("#Show16").is(':checked')) HTML += "<strong>Ba XRF</strong>:" 				+ e.row['Ba XRF'].value 		+ "<br>";
		if ( $("#Show17").is(':checked')) HTML += "<strong>Be ICP</strong>:" 				+ e.row['Be ICP'].value 		+ "<br>";
		if ( $("#Show18").is(':checked')) HTML += "<strong>Bi ICP</strong>:" 				+ e.row['Bi ICP'].value 		+ "<br>";
		if ( $("#Show19").is(':checked')) HTML += "<strong>Ca ICP</strong>:" 				+ e.row['Ca ICP'].value 		+ "<br>";
		if ( $("#Show20").is(':checked')) HTML += "<strong>Ca XRF</strong>:" 				+ e.row['Ca XRF'].value 		+ "<br>";
		if ( $("#Show21").is(':checked')) HTML += "<strong>Cd ICP</strong>:" 				+ e.row['Cd ICP'].value 		+ "<br>";
		if ( $("#Show22").is(':checked')) HTML += "<strong>Cd XRF</strong>:" 				+ e.row['Cd XRF'].value 		+ "<br>";
		if ( $("#Show23").is(':checked')) HTML += "<strong>Co ICP</strong>:" 				+ e.row['Co ICP'].value 		+ "<br>";
		if ( $("#Show24").is(':checked')) HTML += "<strong>Co XRF</strong>:" 				+ e.row['Co XRF'].value 		+ "<br>";
		if ( $("#Show25").is(':checked')) HTML += "<strong>Cr ICP</strong>:" 				+ e.row['Cr ICP'].value 		+ "<br>";
		if ( $("#Show26").is(':checked')) HTML += "<strong>Cr XRF</strong>:" 		       	+ e.row['Cr XRF'].value 		+ "<br>";
		if ( $("#Show27").is(':checked')) HTML += "<strong>Cs XRF</strong>:" 				+ e.row['Cs XRF'].value 		+ "<br>";
		if ( $("#Show28").is(':checked')) HTML += "<strong>Cu ICP</strong>:" 				+ e.row['Cu ICP'].value 			+ "<br>";
		if ( $("#Show29").is(':checked')) HTML += "<strong>Cu XRF</strong>:" 				+ e.row['Cu XRF'].value 		+ "<br>";
		if ( $("#Show30").is(':checked')) HTML += "<strong>Fe ICP</strong>:" 				+ e.row['Fe ICP'].value 		+ "<br>";
		if ( $("#Show31").is(':checked')) HTML += "<strong>Fe XRF</strong>:" 				+ e.row['Fe XRF'].value 		+ "<br>";
		if ( $("#Show32").is(':checked')) HTML += "<strong>Ga ICP</strong>:" 				+ e.row['Ga ICP'].value 			+ "<br>";
		if ( $("#Show33").is(':checked')) HTML += "<strong>Hg ICP</strong>:" 				+ e.row['Hg ICP'].value 			+ "<br>";
		if ( $("#Show34").is(':checked')) HTML += "<strong>Hg XRF</strong>:" 				+ e.row['Hg XRF'].value 		+ "<br>";
		if ( $("#Show35").is(':checked')) HTML += "<strong>K ICP</strong>:" 				+ e.row['K ICP'].value 		+ "<br>";
		if ( $("#Show36").is(':checked')) HTML += "<strong>K XRF</strong>:" 				+ e.row['K XRF'].value 		+ "<br>";
		if ( $("#Show37").is(':checked')) HTML += "<strong>La ICP</strong>:" 				+ e.row['La ICP'].value 		+ "<br>";
		if ( $("#Show38").is(':checked')) HTML += "<strong>Li ICP</strong>:" 				+ e.row['Li ICP'].value 		+ "<br>";
		if ( $("#Show39").is(':checked')) HTML += "<strong>Mg ICP</strong>:" 				+ e.row['Mg ICP'].value 		+ "<br>";
		if ( $("#Show40").is(':checked')) HTML += "<strong>Mn ICP</strong>:" 				+ e.row['Mn ICP'].value 		+ "<br>";
		if ( $("#Show41").is(':checked')) HTML += "<strong>Mn XRF</strong>:" 				+ e.row['Mn XRF'].value 		+ "<br>";
        
        if ( $("#Show42").is(':checked')) HTML += "<strong>Mo ICP</strong>:" 				+ e.row['Mo ICP'].value 		+ "<br>";
        if ( $("#Show43").is(':checked')) HTML += "<strong>Mo XRF</strong>:" 				+ e.row['Mo XRF'].value 		+ "<br>";
        if ( $("#Show44").is(':checked')) HTML += "<strong>Na ICP</strong>:" 				+ e.row['Na ICP'].value 		+ "<br>";
        if ( $("#Show45").is(':checked')) HTML += "<strong>Ni ICP</strong>:" 				+ e.row['Ni ICP'].value 		+ "<br>";
        if ( $("#Show46").is(':checked')) HTML += "<strong>Ni XRF</strong>:" 				+ e.row['Ni XRF'].value 		+ "<br>";
        
        
        if ( $("#Show47").is(':checked')) HTML += "<strong>P ICP</strong>:" 				+ e.row['P ICP'].value 		+ "<br>";        
        if ( $("#Show48").is(':checked')) HTML += "<strong>Pb ICP</strong>:" 				+ e.row['Pb ICP'].value 		+ "<br>";        
        if ( $("#Show49").is(':checked')) HTML += "<strong>Pb XRF</strong>:" 				+ e.row['Pb XRF'].value 		+ "<br>";      
        if ( $("#Show50").is(':checked')) HTML += "<strong>Pd XRF</strong>:" 				+ e.row['Pd XRF'].value 		+ "<br>";       
        if ( $("#Show51").is(':checked')) HTML += "<strong>Rb XRF</strong>:" 				+ e.row['Rb XRF'].value 		+ "<br>";        
        if ( $("#Show52").is(':checked')) HTML += "<strong>S ICP</strong>:" 				+ e.row['S ICP'].value 		+ "<br>";      
        if ( $("#Show53").is(':checked')) HTML += "<strong>S XRF</strong>:" 				+ e.row['S XRF'].value 		+ "<br>";     
        if ( $("#Show54").is(':checked')) HTML += "<strong>Sb ICP</strong>:" 				+ e.row['Sb ICP'].value 		+ "<br>";      
        if ( $("#Show55").is(':checked')) HTML += "<strong>Sb XRF</strong>:" 				+ e.row['Sb XRF'].value 		+ "<br>";        
        if ( $("#Show56").is(':checked')) HTML += "<strong>Sc ICP</strong>:" 				+ e.row['Sc ICP'].value 		+ "<br>";
        if ( $("#Show57").is(':checked')) HTML += "<strong>Sc XRF</strong>:" 				+ e.row['Sc XRF'].value 		+ "<br>";      
        if ( $("#Show58").is(':checked')) HTML += "<strong>Se ICP</strong>:" 				+ e.row['Se ICP'].value 		+ "<br>";    
        if ( $("#Show59").is(':checked')) HTML += "<strong>Se XRF</strong>:" 				+ e.row['Se XRF'].value 		+ "<br>"; 
        if ( $("#Show60").is(':checked')) HTML += "<strong>Sn ICP</strong>:" 				+ e.row['Sn ICP'].value 		+ "<br>";
        if ( $("#Show61").is(':checked')) HTML += "<strong>Sn XRF</strong>:" 				+ e.row['Sn XRF'].value 		+ "<br>";
        if ( $("#Show62").is(':checked')) HTML += "<strong>Sr ICP</strong>:" 				+ e.row['Sr ICP'].value 		+ "<br>";  
        if ( $("#Show63").is(':checked')) HTML += "<strong>Sr XRF</strong>:" 				+ e.row['Sr XRF'].value 		+ "<br>";   
        if ( $("#Show64").is(':checked')) HTML += "<strong>Te XRF</strong>:" 				+ e.row['Te XRF'].value 		+ "<br>";       
        if ( $("#Show65").is(':checked')) HTML += "<strong>Th ICP</strong>:" 				+ e.row['Th ICP'].value 		+ "<br>"; 
        
        
        
        if ( $("#Show66").is(':checked')) HTML += "<strong>Th XRF</strong>:" 				+ e.row['Th XRF'].value 		+ "<br>";
        if ( $("#Show67").is(':checked')) HTML += "<strong>Ti ICP</strong>:" 				+ e.row['Ti ICP'].value 		+ "<br>";
        if ( $("#Show68").is(':checked')) HTML += "<strong>Ti XRF</strong>:" 				+ e.row['Ti XRF'].value 		+ "<br>";
        if ( $("#Show69").is(':checked')) HTML += "<strong>Tl ICP</strong>:" 				+ e.row['Tl ICP'].value 		+ "<br>";    
        
        if ( $("#Show70").is(':checked')) HTML += "<strong>U ICP</strong>:" 				+ e.row['U ICP'].value 		+ "<br>";
        
                
        if ( $("#Show71").is(':checked')) HTML += "<strong>U XRF</strong>:" 				+ e.row['U XRF'].value 		+ "<br>";        
        if ( $("#Show72").is(':checked')) HTML += "<strong>V ICP</strong>:" 				+ e.row['V ICP'].value 		+ "<br>";        
        if ( $("#Show73").is(':checked')) HTML += "<strong>V XRF</strong>:" 				+ e.row['V XRF'].value 		+ "<br>";
        if ( $("#Show74").is(':checked')) HTML += "<strong>W ICP</strong>:" 				+ e.row['W ICP'].value 		+ "<br>";        
        if ( $("#Show75").is(':checked')) HTML += "<strong>W XRF</strong>:" 				+ e.row['W XRF'].value 		+ "<br>";        
        if ( $("#Show76").is(':checked')) HTML += "<strong>Zn ICP</strong>:" 				+ e.row['Zn ICP'].value 		+ "<br>";
        if ( $("#Show78").is(':checked')) HTML += "<strong>Zn XRF</strong>:" 				+ e.row['Zn XRF'].value 		+ "<br>";        
        if ( $("#Show79").is(':checked')) HTML += "<strong>Altura SNM (m)2</strong>:" 				+ e.row['Altura SNM (m)2'].value 		+ "<br>";        
        if ( $("#Show80").is(':checked')) HTML += "<strong>Geomorfología</strong>:" 				+ e.row['Geomorfología'].value 		+ "<br>";
        if ( $("#Show81").is(':checked')) HTML += "<strong>Geologia</strong>:" 				+ e.row['Geologia'].value 		+ "<br>";        
        
        
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
      // aca agrego lo que falta del conjunto if
      
   if (MapsLib.polygon1 != null)
      MapsLib.polygon1.setMap(null);
   if (MapsLib.polygon2 != null)
      MapsLib.polygon2.setMap(null);
 
      
      
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
	
    var selectColumns = "'Nombre muestra','Fecha toma muestra 11','profundidad (cm)','Número de Zona','Categoría Minera','Coordenadas','Potencial Redox (mV)','pH', 'Conductividad (µS/cm)','Ag XRF','Ag ICP','Al ICP','As ICP','As XRF','B ICP','Ba ICP','Ba XRF','Be ICP','Bi ICP','Ca ICP','Ca XRF','Cd ICP','Cd XRF','Co ICP','Co XRF','Cr ICP','Cr XRF','Cs XRF','Cu ICP','Cu XRF','Fe ICP','Fe XRF','Ga ICP','Hg ICP','Hg XRF','K ICP','K XRF','La ICP','Li ICP','Mg ICP','Mn ICP','Mn XRF', 'Mo ICP', 'Mo XRF', 'Na ICP', 'Ni ICP', 'Ni XRF', 'P ICP', 'Pb ICP','Pb XRF','Pd XRF','Rb XRF','S ICP','S XRF','Sb ICP','Sb XRF','Sc ICP', 'Sc XRF','Se ICP','Se XRF','Sn ICP','Sn XRF','Sr ICP','Sr XRF','Te XRF','Th ICP', 'Th XRF','Ti ICP','Ti XRF','Tl ICP','U ICP','U XRF','V ICP','V XRF','W ICP','W XRF','Zn ICP','Zn XRF','ZrXRF','Altura SNM (m)2','Geomorfología','Geologia'";
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
			if ( $("#Show0").is(':checked')) list_table += "<th>Sample Name </th>";
			if ( $("#Show1").is(':checked')) list_table += "<th>Sample Date </th>";
			if ( $("#Show2").is(':checked')) list_table += "<th>Depth </th>";
			if ( $("#Show3").is(':checked')) list_table += "<th>Zone </th>";
			if ( $("#Show4").is(':checked')) list_table += "<th>Mining Category </th>";
			if ( $("#Show5").is(':checked')) list_table += "<th>Coordinate </th>";
			if ( $("#Show6").is(':checked')) list_table += "<th>Pot.Redox mV </th>";
			if ( $("#Show7").is(':checked')) list_table += "<th>pH </th>";
			if ( $("#Show8").is(':checked')) list_table += "<th>Conductivity </th>";
			if ( $("#Show9").is(':checked')) list_table += "<th>Ag XRF</th>";
			if ( $("#Show10").is(':checked')) list_table += "<th>Ag ICP</th>";
			if ( $("#Show11").is(':checked')) list_table += "<th>Al ICP</th>";
			if ( $("#Show12").is(':checked')) list_table += "<th>As ICP</th>";
			if ( $("#Show13").is(':checked')) list_table += "<th>As XRF</th>";
			if ( $("#Show14").is(':checked')) list_table += "<th>B ICP</th>";
			if ( $("#Show15").is(':checked')) list_table += "<th>Ba ICP</th>";
			if ( $("#Show16").is(':checked')) list_table += "<th>Ba XRF</th>";
			if ( $("#Show17").is(':checked')) list_table += "<th>Be ICP</th>";
			if ( $("#Show18").is(':checked')) list_table += "<th>Bi ICP</th>";
			if ( $("#Show19").is(':checked')) list_table += "<th>Ca ICP</th>";
			if ( $("#Show20").is(':checked')) list_table += "<th>Ca XRF</th>";
			if ( $("#Show21").is(':checked')) list_table += "<th>Cd ICP</th>";
			if ( $("#Show22").is(':checked')) list_table += "<th>Cd XRF</th>";
			if ( $("#Show23").is(':checked')) list_table += "<th>Co ICP</th>";
			if ( $("#Show24").is(':checked')) list_table += "<th>Co XRF</th>";
			if ( $("#Show25").is(':checked')) list_table += "<th>Cr ICP</th>";
			if ( $("#Show26").is(':checked')) list_table += "<th>Cr XRF</th>";
			if ( $("#Show27").is(':checked')) list_table += "<th>Cs XRF</th>";
			if ( $("#Show28").is(':checked')) list_table += "<th>Cu ICP</th>";
			if ( $("#Show29").is(':checked')) list_table += "<th>Cu XRF</th>";
			if ( $("#Show30").is(':checked')) list_table += "<th>Fe ICP</th>";
			if ( $("#Show31").is(':checked')) list_table += "<th>Fe XRF</th>";
			if ( $("#Show32").is(':checked')) list_table += "<th>Ga ICP</th>";
			if ( $("#Show33").is(':checked')) list_table += "<th>Hg ICP</th>";
			if ( $("#Show34").is(':checked')) list_table += "<th>Hg XRF</th>";
			if ( $("#Show35").is(':checked')) list_table += "<th>K ICP</th>";
			if ( $("#Show36").is(':checked')) list_table += "<th>K XRF</th>";
			if ( $("#Show37").is(':checked')) list_table += "<th>La ICP</th>";
			if ( $("#Show38").is(':checked')) list_table += "<th>Li ICP</th>";
			if ( $("#Show39").is(':checked')) list_table += "<th>Mg ICP</th>";
			if ( $("#Show40").is(':checked')) list_table += "<th>Mn ICP</th>";
			if ( $("#Show41").is(':checked')) list_table += "<th>Mn XRF</th>";      
			if ( $("#Show42").is(':checked')) list_table += "<th>Mo ICP</th>";        
			if ( $("#Show43").is(':checked')) list_table += "<th>Mo XRF</th>";           
			if ( $("#Show44").is(':checked')) list_table += "<th>Na ICP</th>";  
			if ( $("#Show45").is(':checked')) list_table += "<th>Ni ICP</th>";          
			if ( $("#Show46").is(':checked')) list_table += "<th>Ni XRF</th>"; 
			if ( $("#Show46").is(':checked')) list_table += "<th>Ni XRF</th>";        
			if ( $("#Show47").is(':checked')) list_table += "<th>P ICP</th>";        
			if ( $("#Show48").is(':checked')) list_table += "<th>Pb ICP</th>";        
			if ( $("#Show49").is(':checked')) list_table += "<th>Pb XRF</th>";        
			if ( $("#Show50").is(':checked')) list_table += "<th>Pd XRF</th>";        
			if ( $("#Show51").is(':checked')) list_table += "<th>Rb XRF</th>";        
			if ( $("#Show52").is(':checked')) list_table += "<th>S ICP</th>";
			if ( $("#Show53").is(':checked')) list_table += "<th>S XRF</th>";        
			if ( $("#Show54").is(':checked')) list_table += "<th>Sb ICP</th>";        
			if ( $("#Show55").is(':checked')) list_table += "<th>Sb XRF</th>";        
			if ( $("#Show56").is(':checked')) list_table += "<th>Sc ICP</th>";        
			if ( $("#Show57").is(':checked')) list_table += "<th>Sc XRF</th>";        
			if ( $("#Show58").is(':checked')) list_table += "<th>Se ICP</th>";        
			if ( $("#Show59").is(':checked')) list_table += "<th>Se XRF</th>";        
			if ( $("#Show60").is(':checked')) list_table += "<th>Sn ICP</th>";
			if ( $("#Show61").is(':checked')) list_table += "<th>Sn XRF</th>";        
			if ( $("#Show62").is(':checked')) list_table += "<th>Sr ICP</th>";        
			if ( $("#Show63").is(':checked')) list_table += "<th>Sr XRF</th>";        
			if ( $("#Show64").is(':checked')) list_table += "<th>Te XRF</th>";        
			if ( $("#Show65").is(':checked')) list_table += "<th>Th ICP</th>";        
			if ( $("#Show66").is(':checked')) list_table += "<th>Th XRF</th>";        
			if ( $("#Show67").is(':checked')) list_table += "<th>Ti ICP</th>";        
			if ( $("#Show68").is(':checked')) list_table += "<th>Ti XRF</th>";
			if ( $("#Show69").is(':checked')) list_table += "<th>Tl ICP</th>";        
			if ( $("#Show70").is(':checked')) list_table += "<th>U ICP</th>";        
			if ( $("#Show71").is(':checked')) list_table += "<th>U XRF</th>";        
			if ( $("#Show72").is(':checked')) list_table += "<th>V ICP</th>";        
			if ( $("#Show73").is(':checked')) list_table += "<th>V XRF</th>";        
			if ( $("#Show74").is(':checked')) list_table += "<th>W ICP</th>";        
			if ( $("#Show75").is(':checked')) list_table += "<th>W XRF</th>";        
			if ( $("#Show76").is(':checked')) list_table += "<th>Zn ICP</th>";
			if ( $("#Show77").is(':checked')) list_table += "<th>Zn XRF</th>";
			if ( $("#Show78").is(':checked')) list_table += "<th>Zr XRF</th>";        
			if ( $("#Show79").is(':checked')) list_table += "<th>Altura SNM (m)2</th>";        
			if ( $("#Show80").is(':checked')) list_table += "<th>Geomorfología</th>";        
			if ( $("#Show81").is(':checked')) list_table += "<th>Geologia</th>";           
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
 				if ( $("#Show42").is(':checked')) list_table += "<td>" + rows[row][42] +"</td>";
 				if ( $("#Show43").is(':checked')) list_table += "<td>" + rows[row][43] +"</td>";              
            	if ( $("#Show44").is(':checked')) list_table += "<td>" + rows[row][44] +"</td>"; 
 				if ( $("#Show45").is(':checked')) list_table += "<td>" + rows[row][45] +"</td>";               
  				if ( $("#Show46").is(':checked')) list_table += "<td>" + rows[row][46] +"</td>";  
  				if ( $("#Show47").is(':checked')) list_table += "<td>" + rows[row][47] +"</td>";                
  				if ( $("#Show48").is(':checked')) list_table += "<td>" + rows[row][48] +"</td>";                
  				if ( $("#Show49").is(':checked')) list_table += "<td>" + rows[row][49] +"</td>";  
  				if ( $("#Show50").is(':checked')) list_table += "<td>" + rows[row][50] +"</td>";                
  				if ( $("#Show51").is(':checked')) list_table += "<td>" + rows[row][51] +"</td>";                
  				if ( $("#Show52").is(':checked')) list_table += "<td>" + rows[row][52] +"</td>";  
  				if ( $("#Show53").is(':checked')) list_table += "<td>" + rows[row][53] +"</td>";                
  				if ( $("#Show54").is(':checked')) list_table += "<td>" + rows[row][54] +"</td>";                
  				if ( $("#Show55").is(':checked')) list_table += "<td>" + rows[row][55] +"</td>";  
  				if ( $("#Show56").is(':checked')) list_table += "<td>" + rows[row][56] +"</td>";                
  				if ( $("#Show57").is(':checked')) list_table += "<td>" + rows[row][57] +"</td>";                
  				if ( $("#Show58").is(':checked')) list_table += "<td>" + rows[row][58] +"</td>";  
  				if ( $("#Show59").is(':checked')) list_table += "<td>" + rows[row][59] +"</td>";                
  				if ( $("#Show60").is(':checked')) list_table += "<td>" + rows[row][60] +"</td>";                
  				if ( $("#Show61").is(':checked')) list_table += "<td>" + rows[row][61] +"</td>";  
  				if ( $("#Show62").is(':checked')) list_table += "<td>" + rows[row][62] +"</td>";                
  				if ( $("#Show63").is(':checked')) list_table += "<td>" + rows[row][63] +"</td>";                
  				if ( $("#Show64").is(':checked')) list_table += "<td>" + rows[row][64] +"</td>";  
  				if ( $("#Show65").is(':checked')) list_table += "<td>" + rows[row][65] +"</td>";                
  				if ( $("#Show66").is(':checked')) list_table += "<td>" + rows[row][66] +"</td>";                
  				if ( $("#Show67").is(':checked')) list_table += "<td>" + rows[row][67] +"</td>";  
  				if ( $("#Show68").is(':checked')) list_table += "<td>" + rows[row][68] +"</td>";                
  				if ( $("#Show69").is(':checked')) list_table += "<td>" + rows[row][69] +"</td>";                
  				if ( $("#Show70").is(':checked')) list_table += "<td>" + rows[row][70] +"</td>";  
  				if ( $("#Show71").is(':checked')) list_table += "<td>" + rows[row][71] +"</td>";                
  				if ( $("#Show72").is(':checked')) list_table += "<td>" + rows[row][72] +"</td>";                
  				if ( $("#Show73").is(':checked')) list_table += "<td>" + rows[row][73] +"</td>";  
  				if ( $("#Show74").is(':checked')) list_table += "<td>" + rows[row][74] +"</td>";                
  				if ( $("#Show75").is(':checked')) list_table += "<td>" + rows[row][75] +"</td>";                
  				if ( $("#Show76").is(':checked')) list_table += "<td>" + rows[row][76] +"</td>";  
  				if ( $("#Show77").is(':checked')) list_table += "<td>" + rows[row][77] +"</td>";                
  				if ( $("#Show78").is(':checked')) list_table += "<td>" + rows[row][78] +"</td>";                
  				if ( $("#Show79").is(':checked')) list_table += "<td>" + rows[row][79] +"</td>";  
  				if ( $("#Show80").is(':checked')) list_table += "<td>" + rows[row][80] +"</td>";                
  				if ( $("#Show81").is(':checked')) list_table += "<td>" + rows[row][81] +"</td>";                         
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
