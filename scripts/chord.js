function fourthTabFunc(event)
{
	console.log("F(firstTabFunc): ENTER");
	var i, tabcontent, tablinks;
	var varId;
	//show the first tab content and hide the rest
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById("fourth").style.display = "block";
	event.currentTarget.className += " active";
	
	drawChordChart("B19013001", "B19301001", "B06009001");
}

function drawChordChart(variable1, variable2, variable3)
{
	console.log("O: drawScatterPlot() ENTER --");
	d3.select('#chordChart').selectAll("svg").remove();

	var chartWidth = 400;
	var chartHeight = 400;
	
	key = "7adf8bfea67e27e5edcaa228acef5db5cb905303";
	year = "2015";
	division = "state";
	
	var reqVar1 = getMeParam(variable1);
	var reqVar2 = getMeParam(variable2);
	var reqVar3 = getMeParam(variable3);		
	
	var q = d3.queue()
	    .defer(d3.json, "http://api.census.gov/data/"+year+"/acs1?get=NAME,"+reqVar1+"&for="+division+":*&key="+key)
		.defer(d3.json, "http://api.census.gov/data/"+year+"/acs1?get=NAME,"+reqVar2+"&for="+division+":*&key="+key)
		.defer(d3.json, "http://api.census.gov/data/"+year+"/acs1?get=NAME,"+reqVar3+"&for="+division+":*&key="+key)
		.awaitAll(function(error, results) {
		
		var colorSp  = ["#a6cee3",
						"#1f78b4",
						"#b2df8a",
						"#33a02c",
						"#fb9a99",
						"#e31a1c",
						"#fdbf6f",
						"#ff7f00",
						"#cab2d6",
						"#6a3d9a"];	
			
		var values1 = [];
		var values2 = [];
		var values3 = [];
		var stateNames = [];
		var max1;
		var max2;
		var max3;
		var min3;
		
		var index = 0;		
		for(i = 1; i < results[index].length; i++)
		{
			values1[i-1] = parseInt(results[index][i][1]);
			stateNames[i-1] = results[index][i][0];
		}
		
		var index = 1;		
		for(i = 1; i < results[index].length; i++)
		{
			values2[i-1] = parseInt(results[index][i][1]);
		}
		
		var index = 2;		
		for(i = 1; i < results[index].length; i++)
		{
			values3[i-1] = parseInt(results[index][i][1]);
		}
		
		//color scheme changes below
		var cValue = function(d) { return d;},
			color = d3.scaleOrdinal(d3.schemeCategory20c);
	
		max1 = d3.max(values1);
		max2 = d3.max(values2);
		max3 = d3.max(values3);
		
		var matrix = [
		  [values1],
		  [values2],
		  [values3],
		];
		
		var svg = d3.select('#chordChart')
		  .append('svg')
		  .attr('width', chartWidth)
		  .attr('height', chartHeight);
			  
		var width = +svg.attr("width"),
			height = +svg.attr("height"),
			outerRadius = Math.min(width, height) * 0.5 - 40,
			innerRadius = outerRadius - 30;

		var formatValue = d3.formatPrefix(",.0", 1e3);

		var chord = d3.chord()
			.padAngle(0.05)
			.sortSubgroups(d3.descending);

		var arc = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);

		var ribbon = d3.ribbon()
			.radius(innerRadius);

		var color = d3.scaleOrdinal()
			.domain(d3.range(4))
			.range(["#000000", "#FFDD89", "#957244", "#F26223"]);

		var g = svg.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
			.datum(chord(matrix));

		var group = g.append("g")
			.attr("class", "groups")
		  .selectAll("g")
		  .data(function(chords) { return chords.groups; })
		  .enter().append("g");

		group.append("path")
			.style("fill", function(d) { return color(d.index); })
			.style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
			.attr("d", arc);

		var groupTick = group.selectAll(".group-tick")
		  .data(function(d) { return groupTicks(d, 1e3); })
		  .enter().append("g")
			.attr("class", "group-tick")
			.attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });

		groupTick.append("line")
			.attr("x2", 6);

		groupTick
		  .filter(function(d) { return d.value % 5e3 === 0; })
		  .append("text")
			.attr("x", 8)
			.attr("dy", ".35em")
			.attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
			.style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
			.text(function(d) { return formatValue(d.value); });

		g.append("g")
			.attr("class", "ribbons")
		  .selectAll("path")
		  .data(function(chords) { return chords; })
		  .enter().append("path")
			.attr("d", ribbon)
			.style("fill", function(d) { return color(d.target.index); })
			.style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); });

		// Returns an array of tick angles and values for a given group and step.
		function groupTicks(d, step) {
		  var k = (d.endAngle - d.startAngle) / d.value;
		  return d3.range(0, d.value, step).map(function(value) {
			return {value: value, angle: value * k + d.startAngle};
		  });
		}

		showMapPreview();
	});
}

function showMapPreview()
{
	d3.select("#map3 svg3").selectAll("g").remove();

	var q = d3.queue()
		.defer(d3.json, "data/us-10m.json")
		.awaitAll(function(error, results) {
			if (error) throw error;
			console.log(results);
			var paths = svg3.append("g")
				.attr("transform", "translate(-300, -100)")
				.attr("class", "states")
				.selectAll("path")
				.data(topojson.feature(results[0], results[0].objects.states).features)
				.enter().append("path")
				.attr("id", function(d) { return (d.id+"state"); })
				.style("fill", "#ffffff")
				.style("stroke", "#000000")
				.attr("d", path3);			
	});
}