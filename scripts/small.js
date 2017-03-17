function showMapsm(variable,chart)
{
        d3.select("#map svg").selectAll("g").remove();

        key = "7adf8bfea67e27e5edcaa228acef5db5cb905303";
        year = "2015";

        var reqVar = getMeParam(variable);

        console.log("F(getData) : reqVar = "+reqVar);

        //get the response asynchronously
        var q = d3.queue()
                .defer(d3.json, "data/us-10m.json")
            .defer(d3.json, "http://api.census.gov/data/"+year+"/acs1?get=NAME,"+reqVar+"&for="+'state'+":*&key="+key)
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
                        }

                        min = d3.min(val);
                        max = d3.max(val);

                        console.log("min : "+min);
                        console.log("max : "+max);

                        var quantize = d3.scaleQuantize()
                                .domain([min, max])
                                .range(['#fcc5c0','#fa9fb5','#f768a1','#dd3497','#ae017e']);

                        var tip = d3.tip()
                                  .attr('class', 'd3-tip')
                                  .offset([-10, 0])
                                  .html(function(d) {
                                        return "<strong>Region:</strong> <span style='color:red'>" + nameById.get(d.id) + "</span>";
                                  })

                        chart.call(tip);


                                //modify states to counties to get for counties below
                                var paths = chart.append("g")
                                        .attr("transform", "translate(0, 0)")
                                        .attr("class", "states")
                                        .selectAll("path")
                                        .data(topojson.feature(results[0], results[0].objects.states).features)
                                        .enter().append("path")
                                        .attr("onmousedown", function(d){ return "showDivisonData("+d.id+",'"+nameById.get(d.id)+"',"+valById.get(d.id)+")";})
                                        .attr("id", function(d) { return d.id; })
                                        .attr("fill", function(d) { return quantize(valById.get(d.id)); })
                                        .attr("d", path)
                                        .on("mouseover", tip.show)
                                        .on("mouseout",  tip.hide);

                                        var linear = d3.scaleLinear()
                                                                .domain([min, max])
                                                                .range(["#fee0d2", "#67000d"]);

                                        chart.append("g")
                                          .attr("class", "legendLinear")
                                          .attr("transform", "translate(900,360)");

                                        var legendLinear = d3.legendColor()
                                          .shapeWidth(80)
                                          .cells(5)
                                          .orient('vertical')
                                          .scale(linear);

                                        chart.select(".legendLinear")
                                          .call(legendLinear);



        });
        }
// small multiple code ends