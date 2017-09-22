  function drawBarChart(data, inputWidth, inputHeight, barId){

      var margin = {top: 30, right: 20, bottom: 10, left: 30},
          width = inputWidth - margin.left - margin.right,
          height = inputHeight - margin.top - margin.bottom,
          opacity = 1;

      x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1);

      y = d3.scale.linear()
          .rangeRound([height, 0]);

      //var color = d3.scale.ordinal()
      //    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
      
      // var color = d3.scale.category10();
      var color = d3.scale.ordinal()
        .range(["#a6cee3", "#fdae6b", "#1f77b4", "#d73027", "#8c6d31", "#7f7f7f", "#2ca02c", "#ffbb78", "#c49c94", "#DFFC1E"]);
      
      
      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      
      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickFormat(d3.format(".2s"));

      d3.select(barId).append("p")
      .attr("class","text-center")
      .style("margin","30px 20px -20px 0px")
      .text("EUI (KBTU/SQFT)");

      var svg = d3.select(barId).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //d3.csv("https://dl.dropboxusercontent.com/u/16228160/equestResults.csv", function(error, data) {
        
        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Case Description"; }));

        data.forEach(function(d) {
          //set to active for now
          //copy the initial value as current
          var y0 = 0;
          d.values = color.domain().map(function(name) { return {enabled : true, name: name, value: d[name], y0: y0, y1: y0 += +d[name]}; });
          d.total = d.values[d.values.length - 1].y1;
        });

        //data.sort(function(a, b) { return b.total - a.total; });
        
        x.domain(data.map(function(d) { return d["Case Description"]; }));
        y.domain([0, d3.max(data, function(d) { return d.total; })]);
        
        /*
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("kBtu");
        */

        state = svg.selectAll(".state")
            .data(data)
          .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + x(d["Case Description"]) + ",0)"; });

        // draw rectangles
        state.selectAll("rect")
            .data(function(d) { return d.values; })
          .enter().append("rect")
            .attr("class", "barchart")
          	//.attr("rx" , "1")
          	//.attr("ry" , "1")
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.y1); })
            .attr("height", function(d) { return y(d.y0) - y(d.y1); })
            .style("fill", function(d) { return color(d.name); })
            .style("opacity", opacity);

        dx = x.rangeBand()/2;
        state.selectAll("g")
          .data(function(d) { return d.values; })
          .enter().append("text")
          .attr("transform", function(d){return "translate(0," + (y(d.y0) - ((y(d.y0) - y(d.y1)) /2)) + ")"})
          .attr("dy", ".35em")
          .attr("dx", dx)
          .style("text-anchor", "middle")
          .attr("class", "barChartText")
          .attr("fill", "black")
          .style("font-family", "sans-serif")
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .text(function(d){return parseFloat(d.value).toFixed(2);}); // put Total as place holder
        
        }

        /*
        var legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color)
            .on('click', function(d) {
      						var rect = d3.select(this);
      						var name = d;
      						var enabled = true;
      						if (rect.attr('class') === 'disabled')
      							{
      								rect.attr('class', '');
      							}
      						else
      							{
       								rect.attr('class', 'disabled');
        							enabled = false;
      							};

    			  			// update values in pie and set value for disable one to 0
    						state.data().forEach(function(d) {
    							d.values.forEach(function(f) {
    								if (f.name === name) f.enabled = enabled;
    							})
    						});

    						updateBarChart();

      						});

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });
        */


    var updateBarChart = function updateBarChart(){
    	
      var totalEnergy = [ 0 , 0];

    	state.data().forEach(function(d, i) {
          	var y0 = 0;
         		d.values.forEach(function(f){
                f.y0 = y0;
          			if (f.enabled) {
                  f.value = parseFloat(d[f.name]).toFixed(2);
                  totalEnergy[i] += +f.value;
                  f.y1 = y0 += +f.value;
                }else{
                  f.y1 = y0;
                  f.value =""
                }
          		});
          		
          		d.total = d.values[d.values.length - 1].y1;

        	});

      y.domain([0, d3.max(state.data(), function(d) { return d.total; })]);

      // state.data().forEach(function(j){ console.log(j["Case Description"])});

    	state.selectAll("rect")
    	    .data(function(d) { return d.values; })
    	    .transition()
          .duration("750")
    	    //.delay(function(d, i) { return i * 50})
    	    .attr("y", function(d) {return y(d.y1);})
    	    .attr("height", function(d) { return y(d.y0) - y(d.y1); });

      state.selectAll("text")
          .data(function(d) { return d.values; })
          .transition()
          .duration("750")
          .attr("transform", function(d){return "translate(0," + (y(d.y0) - ((y(d.y0) - y(d.y1)) /2)) + ")"})
          .attr("dy", ".35em")
          .attr("dx", dx)
          .text(function(d){return d.value;});

        
        // update name of selected case
        var change = (((totalEnergy[0] - totalEnergy[1])/totalEnergy[0]) * 100).toFixed(2)
        var changeString = change + "%"
        d3.selectAll("#dynamicTitle")
          .text("Base Design vs. " + state.data()[1]["Case Description"])
          .style("font-size", "20px");
        
        d3.selectAll("#difference")
          .text(changeString)
          .style("font-size", "40px")
          .style("color", function(){return (change>0)? "green":"red";});
        
        return change;
    };



    var updateBarChartData = function updateBarChartData(newData){
      var count = 0;
      state.data().forEach(function(d){
        if (d["Case Description"] == "Base Design_1" && count == 0){
          count+=1;
        }
        else
        {
          d3.keys(newData).forEach(function(key){
          d[key] = newData[key];
          })
        }
      })
    }

