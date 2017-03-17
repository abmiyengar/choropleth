var isSort;

function secondTabFunc(event)
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
	document.getElementById("second").style.display = "block";
	event.currentTarget.className += " active";
	
	document.getElementById("resetButton").style.display = "none";
	document.getElementById("sortButton").style.display = "block";
	
	d3.select("#resetButton")
	.on('click', function() {
		showMap1("B01003001", "state");
			document.getElementById("resetButton").style.display = "none";
			document.getElementById("sortButton").style.display = "block";
	});
		
	showMap1("B01003001", "state");
}

//Fetches the dataset asynchronously and draws the choropleth
//Input: Census data variable and division - state/county
function showMap1(variable, division)
{
	d3.select("#map1 svg").selectAll("g").remove();

	isSort = false;
	
	key = "7adf8bfea67e27e5edcaa228acef5db5cb905303";
	year = "2015";
	
	var stateNames = [];
	var reqVar = getMeParam(variable);
	
	console.log("F(getData) : reqVar = "+reqVar);
	
	//get the response asynchronously
	var q = d3.queue()
		.defer(d3.json, "data/us-10m.json")
	    .defer(d3.json, "http://api.census.gov/data/"+year+"/acs1?get=NAME,"+reqVar+"&for="+division+":*&key="+key)
		.awaitAll(function(error, results) {
			if (error) throw error;
			
			console.log(results[0]);
			
			var val = [];
			var countyId;
			var valById = d3.map();
			var nameById = d3.map();
			var index = 1;
			
			for(i = 1; i < results[index].length; i++)
			{
				//make sure to start from 0 index for val else trouble at min and max and later
				val[i-1] = parseInt(results[index][i][1]);
				//make the key field using "state"+"county" value
				countyId = parseInt(results[index][i][2] + results[index][i][3]);
				//store the values and their IDs
				valById.set(countyId, parseInt(results[index][i][1]));
				//store the names and their IDs
				nameById.set(countyId, results[index][i][0]);
				stateNames[i-1] = results[index][i][0];
			}

			min = d3.min(val);	
			max = d3.max(val);
		
			console.log("min : "+min);
			console.log("max : "+max);
			
			var quantize = d3.scaleQuantize()
				.domain([min, max])
				.range(["#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a",
					"#ef3b2c", "#cb181d", "#a50f15", "#67000d"]);
					
			var tip = d3.tip()
				  .attr('class', 'd3-tip')
				  .offset([-10, 0])
				  .html(function(d) {
					return "<strong>Region:</strong> <span style='color:red'>" + nameById.get(d.id) + "</span>";
				  })
				  
			svg1.call(tip);

			if(division == "state"){
				//modify states to counties to get for counties below
				var paths = svg1.append("g")
					.attr("transform", "translate(-200, -100)")
					.attr("class", "states")
					.selectAll("path")
					.data(topojson.feature(results[0], results[0].objects.states).features)
					.enter().append("path")
					.attr("id", function(d) { return d.id; })
					.attr("fill", function(d) { return quantize(valById.get(d.id)); })
					.attr("d", path1)
					//.on("click", clicked)
					.on("mouseover", tip.show)
					.on("mouseout",  tip.hide);
					
					var linear = d3.scaleLinear()
								.domain([min, max])
								.range(["#fee0d2", "#67000d"]);
					  
					svg1.append("g")
					  .attr("class", "legendLinear")
					  .attr("transform", "translate(360,360)");

					var legendLinear = d3.legendColor()
					  .shapeWidth(80)
					  .cells(5)
					  .orient('vertical')
					  .scale(linear);

					svg1.select(".legendLinear")
					  .call(legendLinear);

			}
			else{
				//modify states to counties to get for counties below
				var paths = svg1.append("g")
					.attr("transform", "translate(0, 0)")
					.attr("class", "counties")
					.selectAll("path")
					.data(topojson.feature(results[0], results[0].objects.counties).features)
					.enter().append("path")
					.attr("id", function(d) { return d.id; })
					.attr("fill", function(d) { if(valById.get(d.id)){ return quantize(valById.get(d.id)); }else{ return "#cccccc";}})
					.attr("d", path1)
					//.on("click", clicked)
					.on("mouseover", tip.show)
					.on("mouseout",  tip.hide);
					
					var linear = d3.scaleLinear()
								.domain([min, max])
								.range(["#fee0d2", "#67000d"]);
					  
					svg1.append("g")
					  .attr("class", "legendLinear")
					  .attr("transform", "translate(360,360)");

					var legendLinear = d3.legendColor()
					  .shapeWidth(80)
					  .cells(5)
					  .orient('vertical')
					  .scale(linear);

					svg1.select(".legendLinear")
					  .call(legendLinear);
			}
			
			function clicked(d) 
			{
				if (active.node() === this) return reset();
				active.classed("active", false);

				active = d3.select(this).classed("active", true);

				var bounds = path.bounds(d),
				dx = bounds[1][0] - bounds[0][0],
				dy = bounds[1][1] - bounds[0][1],

				x = (bounds[0][0] + bounds[1][0]) / 2,
				y = (bounds[0][1] + bounds[1][1]) / 2,

				scale = .9 / Math.max(dx / width1, dy / height1),
				translate = [width1 / 2 - scale * x, height1 / 2 - scale * y];

				paths.transition()
				.duration(750)
				.style("stroke-width", 1.5 / scale + "px")
				.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
			}

			function reset() 
			{
				active.classed("active", false);
				active = d3.select(null);
				paths.transition()
					.duration(750)
					.style("stroke-width", "1.5px")
					.attr("transform", "");
			}
			console.log(stateNames,val);
			showTinyBarChart1(stateNames, val);
	});
}

function showTinyBarChart1(labels, data)
{
	console.log("O: showTinyBarChart1() ENTER --");
	d3.select('#barChart1').selectAll("svg").remove();
	
	var chartWidth = 600;
	var chartHeight= 600;
	var padding = 2;
	var labelWidth = 0;
	// figure out maximum energy production
	var max = d3.max(data);
	var min = d3.min(data);
	
	// figure out the width of individual bars
	var barHeight = (chartHeight / labels.length);

	// create a y scale - since the range has arguments interchanged, it returns -scale
	var xScale = d3.scaleLinear()
		.domain([0, max])
		.range([0, chartWidth]);
		
	var yScale = d3.scaleOrdinal()
		.domain(labels)
		.range([0 , chartHeight]);

	var svg = d3.select('#barChart1')
	  .append('svg')
	  .attr('width', chartWidth+100)
	  .attr('height', chartHeight+100);
	  
	var group = svg.append("g")
		.attr("transform", "translate(10, 30)");

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
		return "<strong>Value:</strong> <span style='color:green'>" + d + "</span>";
	})
	  
	group.call(tip);
	
	//the rectangle will be drawn from upper-left corner - co-ordinate system starts at the upper-left	screen
	
	group.selectAll("rect").data(data).enter().append('rect')
		.attr("class", "bar")
		.attr("id", function(d, i){ return i;})
		.attr("x", 0)
		.attr("y", function(d, i) { 
			return (i*(barHeight));
		})
		.attr("width", function(d){ return xScale(d);})
		.attr("height", barHeight/2)
		.style("stroke", "white")
		.style("fill", "#0088aa")
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);

	//USING DIFFERENT DATA FOR THE SAME SVG ELEMENT!
	group.selectAll("text").data(data).enter().append('text')
		.attr("class", "label")
		.attr("x", function(d){ return (xScale(d) + 4);})
		.attr("y", function(d, i) { 
			return (i*(barHeight));
		});
		
	group.selectAll("text").data(labels)
		.attr("dy", ".5em") //vertical align middle
		.text(function(d){ return d;}).each(function() {
			labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
    });
	
	var xAxis = d3.axisTop()
		.scale(xScale);

	group.append("g")
		.attr('class', 'axis')
		.attr('transform', 'translate(0, -5)')
		.call(xAxis);

	d3.select("#sortButton")
		.on('click', function() {

		document.getElementById("sortButton").style.display = "none";
		document.getElementById("resetButton").style.display = "block";
		
		var dataMap = d3.map();
		var newdata = data;
		
		for(i = 0; i < newdata.length; i++)
		{
			dataMap.set(newdata[i], i);
		}

		newdata.sort(function(a, b) { return a - b; });
		var labelSorted = [];
		
		for(i = 0; i < newdata.length; i++)
		{
			labelSorted[i] = labels[dataMap.get(newdata[i])];
		}
		
		console.log(newdata);
		console.log(labelSorted);
	
		group.selectAll("rect").remove();
		group.selectAll("text").remove();
		
		group.selectAll("rect").data(newdata).enter().append('rect').transition()
			  .duration(750)
			  .delay(function(d, i) { return i * 50; })
			.attr("class", "bar")
			.attr("id", function(d, i){ return i;})
			.attr("x", 0)
			.attr("y", function(d, i) { 
				return (i*(barHeight));
			})
			.attr("width", function(d){ return xScale(d);})
			.attr("height", barHeight/2)
			.style("stroke", "white")
			.style("fill", "#0088aa");

		//USING DIFFERENT DATA FOR THE SAME SVG ELEMENT!
		group.selectAll("text").data(newdata).enter().append('text').transition()
			  .duration(750)
			  .delay(function(d, i) { return i * 50; })
			.attr("class", "label")
			.attr("x", function(d){ return (xScale(d) + 4);})
			.attr("y", function(d, i) { 
				return (i*(barHeight));
			});
			
		group.selectAll("text").data(labelSorted)
			.attr("dy", ".5em") //vertical align middle
			.text(function(d){ return d;}).each(function() {
				labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));			
		});
		
				var xAxis = d3.axisTop()
		.scale(xScale);

	group.append("g")
		.attr('class', 'axis')
		.attr('transform', 'translate(0, -5)')
		.call(xAxis);
			
	});
	console.log("O: showTinyBarChart1() EXIT --");
}