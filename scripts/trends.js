function thirdTabFunc(event)
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
	document.getElementById("third").style.display = "block";
	event.currentTarget.className += " active";
	
	drawScatterPlot("B19013001", "B19301001", "B06009001");
}

function drawScatterPlot(variable1, variable2, variable3)
{
	console.log("O: drawScatterPlot() ENTER --");
	d3.select('#scatterPlot').selectAll("svg").remove();

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
		min3 = d3.min(values3);
		
		var xScale = d3.scaleLinear()
			.domain([0, max1])
			.range([0, chartWidth]);
			
		var yScale = d3.scaleLinear()
			.domain([0, max2])
			.range([chartHeight, 0]);
			
		var zScale = d3.scaleLinear()
			.domain([min3, max3])
			.range([6, 25]);
			
		var svg = d3.select('#scatterPlot')
			  .append('svg')
			  .attr('width', chartWidth+200)
			  .attr('height', chartHeight+200);
			  
		var group = svg.append("g")
					.attr("transform", "translate(100, 50)");	
		
		var tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(function(d) {
			return "<span style='color:red'>" + d + "</span>";
		})
		  
		group.call(tip);

		//ATTACHING TWO DATA SETS TO SAME SVG ELEMENTS
		//data set 1
		group.selectAll("circle").data(values1).enter().append("circle")
			.transition()
			.duration(1000)
			.attr("id", "dot")
			.attr("fill-opacity", 0.4)
			.attr("cx", function(d){ return xScale(d);});
			//.style("stroke", "black");
		
		//data set 2
		group.selectAll("circle").data(values2)
			.attr("cy", function(d){ return yScale(d);})
			
		//data set 3
		group.selectAll("circle").data(values3)
			.attr("r", function(d){ return zScale(d);})
			
		//now attach the labels
		group.selectAll("circle").data(stateNames)
			.style("fill", function(d) { return color(cValue(d));})			

		//now again attach colors data to same svg elements
		group.selectAll("circle").data(stateNames)
					.on('mouseover', tip.show)
					.on('mouseout', tip.hide);
				
		var xAxis = d3.axisBottom()
				.scale(xScale);

		group.append("g")
			.attr('class', 'axis')
			.attr('transform', 'translate(0,' + chartHeight + ')')
			.call(xAxis);

		var yAxis = d3.axisLeft()
			.scale(yScale);

		group.append("g")
			.attr('class', 'axis')
			.attr('transform', 'translate(-2,0)')
			.call(yAxis);

		group.append("text")
			.attr("text-anchor", "middle")
			.style("stroke", "grey")
			.style("font-size",15)
			.attr("transform", "translate("+ (-50) +","+(chartHeight/2)+")rotate(-90)")
			.text("Median Household Income");	
			
		group.append("text")
			.attr("text-anchor", "middle")
			.attr("transform", "translate("+ (chartWidth/2) +","+(chartHeight + 40)+")")  
			.style("stroke", "grey")
			.style("font-size",15)
			.text("Per Capita Income");			

		//showMapPreview();			
	});
	console.log("O: drawScatterPlot() EXIT --");
}

function showMapPreview()
{
	d3.select("#map2 svg2").selectAll("g").remove();

	var q = d3.queue()
		.defer(d3.json, "data/us-10m.json")
		.awaitAll(function(error, results) {
			if (error) throw error;
			console.log(results);
			var paths = svg2.append("g")
				.attr("transform", "translate(-300, -100)")
				.attr("class", "states")
				.selectAll("path")
				.data(topojson.feature(results[0], results[0].objects.states).features)
				.enter().append("path")
				.attr("id", function(d) { return (d.id+"state"); })
				.style("fill", "#ffffff")
				.style("stroke", "#000000")
				.attr("d", path2);			
	});
}


