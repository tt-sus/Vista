function drawPieChart(inputData, inputWidth, inputHeight, pieId, lInputWidth, lInputHeight, legendId){
		
		// map input data
		var data = prepareDataForPieChart(inputData);

		
		var width =inputWidth, //500,
			height = inputHeight, // 400,
			legendWidth = lInputWidth,
			legendHeight = lInputHeight,
			padding = 50,
			top = 0,
			outerRadius = Math.min(width, height) / 2 - padding,
			innerRadius = .6 * outerRadius,
			cornerRadius = 6,
			thickness = outerRadius - innerRadius,
			moveoutRadius = 10;

		// calculate total
		var total = d3.sum(data, function(d){return d.value;});


		// set up inner and outer radius for arc
		var arc = d3.svg.arc()
					.innerRadius(innerRadius)
					.outerRadius(outerRadius)
					.cornerRadius(cornerRadius);

		// arc to be shown when mouseover
		var arcOver = d3.svg.arc()
					.innerRadius(innerRadius + moveoutRadius)
					.outerRadius(outerRadius + moveoutRadius)
					.cornerRadius(cornerRadius);

		// d3 Pie layout
		pie = d3.layout.pie()
			.padAngle(.015)
			.value(function(d){return d.value;})
			.sort(null);


		// use d3 10 colors
		//var colorset = d3.scale.category10();
		var colorset = d3.scale.ordinal()
			.range(["#a6cee3", "#fdae6b", "#1f77b4", "#d73027", "#8c6d31", "#7f7f7f", "#2ca02c", "#ffbb78", "#c49c94", "#DFFC1E"]);

		// create svg element
		//var svg = d3.select("body").append("svg")
		var svg = d3.select(pieId).append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width/2 + "," + (top + height/2) + ")");

		// add circle
		var circleRads = [.95 * innerRadius, .98 * (outerRadius + moveoutRadius)];
		var outcircle = svg.selectAll("circle")
			.data(circleRads)
			.enter().append("circle")
			.attr("r", function(d,i){return circleRads[i];})
			.attr("fill", "none")
			//.attr("stroke-width", .05)
			.attr("stroke", "black");

		// add text inside donut - first title
		var innerTextTitle = svg.append("text")
			.attr("dy", ".35em")
    		.style("text-anchor", "middle")
    		.attr("class", "dountTitleText")
    		.text("TOTAL") // put Total as place holder
    		.attr("transform", "translate(0,-10)"); // move to center and slightly up

		// add text inside donut - first title
		var innerTextValue = svg.append("text")
			.attr("dy", ".35em")
    		.style("text-anchor", "middle")
    		.attr("class", "dountValueText")
    		.text( total.toFixed(2) ) // put Total as place holder
    		.attr("transform", "translate(0,10)"); // move to center and slightly down

		// set up group for arcs
		var arcs = svg.selectAll("g.arc")
			.data(pie(data))
			.enter()
				.append("g")
				.attr("class", "arc_segments");

		// draw arc paths
		var initArcs = arcs.append("path")
			.style("fill", function(d,i){return colorset(i);})
			.style("stroke", "black")
			.style("stroke-width", 2)
			.attr("d", arc)
			.each(function(d) { this._current = d; }); // store the initial angles in current

		// add text lables
		var lableTexts = arcs.append("text")
			.attr("id", "labletext")
			.attr("transform", function(d){return "translate(" + arc.centroid(d) + ")rotate(" + getRotationAngle(d)  + ")";}) // move and rotate
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.attr("fill", "white")
			.text(function(d){return d.data.value.toFixed(2);})
			.each(function(d) { this._current = d; }); // store the initial angles in current

		// add percentage outside the arc
		var perText = arcs.append("text")
			.attr("id", "pertext")
			.attr("transform", function(d){
					return "translate(" + getTextLocation(d) + ")rotate(" + getRotationAngle(d) + ")";}) // move and rotate
			.attr("dy", ".35em")
			.attr("font-weight", "bold")
			.attr("fill", "black")
			.attr("text-anchor", function(d){return getTextAnchor(d);})
			.text(function(d){return (100*d.data.value/total).toFixed(2) + "%";});

		// add 
		// add mouse events
		arcs.on("mouseover", function(d) {
                			// move geometry
                			d3.select(this).select("path")
                				.transition()
                    			.duration(200)
                    			.attr("d", arcOver);
                    		
                    		// move lable text
							d3.select(this).select("text")
								.transition()
                    			.duration(200)
								.attr("transform", function(d){return "translate(" + arcOver.centroid(d) + ")rotate(" + getRotationAngle(d)  + ")";}); // move and rotate
                    		
                    		// update text
							innerTextTitle.text(d.data.name);
							innerTextValue.text(d.data.value.toFixed(2));
                    		})
			.on("mouseout", function(d) {
                			// move geometry
                			d3.select(this).select("path")
                				.transition()
                    			.duration(200)
                    			.attr("d", arc);


                    		// move lable text
							d3.select(this).select("text")
								.transition()
                    			.duration(200)
								.attr("transform", function(d){return "translate(" + arc.centroid(d) + ")rotate(" + getRotationAngle(d)  + ")";}); // move and rotate

                    		// update text
							innerTextTitle.text("TOTAL");
							innerTextValue.text(total.toFixed(2));
                    		});


		// get rotation angle for text inside each segment
		function getRotationAngle(d){
			var ra = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
			return ra > 90 ? ra-180 : ra;
		}

		function getTextAnchor(d){
			var ra = d.startAngle + ((d.endAngle - d.startAngle)/2);
			return ra * 180/Math.PI >= 180 ? "end" : "start";
		}


		function getTextLocation(d){
			var ra = d.startAngle + ((d.endAngle - d.startAngle)/2);
			var dx = Math.sin(ra)* (moveoutRadius + outerRadius);
			var dy = -Math.cos(ra) * (moveoutRadius + outerRadius);
			return dx + "," + dy;
		}

		// add legend
		var legend = d3.select(legendId).append("svg")
      		.attr("class", "legend")
      		.attr("width", legendWidth)
      		.attr("height", legendHeight - 60)
    		.selectAll("g")
      		.data(data)
    		.enter().append("g")
      			.attr("transform", function(d, i) { return "translate(0," + (legendHeight - ((d3.keys(data).length - i + 2) * 20) - 2.5 * padding) + ")"; });
      	
      	legend.append("rect")
      				.attr("width", 18)
      				.attr("height", 18)
      				.style("fill", function(d, i){return colorset(i);})
      				.style("stroke", "black")
      				.style("stroke-width", 1)
      				.on('click', function(d) {
  						var rect = d3.select(this);
  						var name = d.name;
  						var enabled = true;
  						// check how many are still enabled
  						var totalEnabled = d3.sum(data.map(function(d) {
    										return (d.enabled) ? 1 : 0;
    									}));

  						if (rect.attr('class') === 'disabled')
  							{
  								rect.attr('class', '');
  							}
  						else
  							{
  								if (totalEnabled < 3) return; // if it is only one left it can't be disabled
  								rect.attr('class', 'disabled');
    							enabled = false;
  							}
  						
			  			// update values in pie and set value for disable one to 0
						pie.value(function(d) {
						if (d.name === name) d.enabled = enabled;
						return (d.enabled) ? d.value : 0;
							});

  						// update Pie Chart
						updatePieChart(data);

						
						// tag removed values to disable in bar chart
						state.data().forEach(function(d) {
							d.values.forEach(function(f) {
								if (f.name === name) f.enabled = enabled;
							})
						});

    					
    					change = updateBarChart();
						

						////////////////////////////////////////
						// make chenges to the other two graphs
						// get active dimensios to update parallel coordinate charts
						var activeDimensions = ["Case Description"].concat(data.filter(function(d){return (d.enabled) ? 1 : 0}).map(function(d){return d.name}));
						loadsGraph.dimensions(activeDimensions);
						peakGraph.dimensions(activeDimensions);
						
						// click label to activate coloring
						loadsGraph.svg.selectAll(".dimension")
				    		.on("click", update_colors_loadGraph)
				    		.selectAll(".label")
				    		.style("font-size", "13px"); // change font sizes of selected lable

             
		                 // click label to activate coloring
						peakGraph.svg.selectAll(".dimension")
						    .on("click", update_colors_peakGraph)
						    .selectAll(".label")
						    	.style("font-size", "13px"); // change font sizes of selected lable

						
						cleanTooltip(loadsGraph);
						loadsGraph.unhighlight();
			    		//addTooltip(clicked, clickedCenPts, loadsGraph);

			    		cleanTooltip(peakGraph);
						peakGraph.unhighlight();
			    		//addTooltip(clicked, clickedCenPts, peakGraph);

  						});

  		legend.append("text")
      		.attr("x", 24)
      		.attr("y", 9)
      		.attr("dy", ".35em")
      		.text(function(d) { return d.name; });

      	// from: http://bl.ocks.org/mbostock/5681842
		// Store the displayed angles in _current.
		// Then, interpolate from _current to the new angles.
		// During the transition, _current is updated in-place by d3.interpolate.
      	function arcTween(a) {
  			var i = d3.interpolate(this._current, a);
  			this._current = i(0);
  			return function(t) {return arc(i(t));}
  		};

  		updatePieChart = function updatePieChart(data){
			
			arcs.data(pie(data));
			initArcs = initArcs.data(pie(data)); //compute new angle
		
			initArcs.transition().duration(750).attrTween('d', arcTween); //redraw the arcs
			
			// still buggy
			total = d3.sum(pie(data), function(d){return d.value;});

			innerTextValue.text(total.toFixed(2));
			
			svg.selectAll("#labletext")
				.data(pie(data))
				.transition()
				.duration(750)
					.attr("transform", function(d){return "translate(" + arc.centroid(d) + ")rotate(" + getRotationAngle(d)  + ")";}) // move and rotate
					.text(function(d){
					if (d.data.enabled){
						return d.data.value.toFixed(2);
					}else{
						return "";}
					});

			svg.selectAll("#pertext")
				.data(pie(data))
				.transition()
				.duration(750)
					.attr("transform", function(d){
					return "translate(" + getTextLocation(d) + ")rotate(" + getRotationAngle(d) + ")";}) // move and rotate
				.attr("text-anchor", function(d){return getTextAnchor(d);})
				.text(function(d){
					if (d.data.enabled){
						return (100*d.data.value/total).toFixed(2) + "%";
					}else{
						return "";}
					});
		}
}


function prepareDataForPieChart(data) {
	// map input data
	var outputdata = d3.keys(data).map(function(d){
		var dd = {};
		dd.name = d;
		dd.value = + parseFloat(data[d]);
		dd.enabled = true;
		return dd;
		});

	return outputdata;
}