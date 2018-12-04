const DOT_SIZE = 3;
const HOVER_DOT_SIZE = 5;
const TOOLTIP_TEXT_COLOR = "black";
const GREY_ACCENT = "#ddd";
const TRANSITION_DELAY = 100;

class ScatterPlot {


	constructor(opts) {
		this.svg	 = opts.svg;		// background
		self.currSearch = null;			// keep track of currently selected search term
		self.margin = opts.margin;

		// make width and height equal
		this.width   = opts.width - self.margin.right - self.margin.left;			// graph width
		this.height  = opts.height - self.margin.bottom - self.margin.top;			// graph height
		this.width   = Math.min(this.width, this.height);
		this.height  = this.width;
		self.width   = this.width;
		self.height  = this.height;

		this.csv = opts.csv;
		this.type = opts.type;			// for alternate x/y variables

		this.draw();
	}


	/* Draws the axes, labels, and plots the points */
	draw() {
		var svg = this.svg;
		var type = this.type;
		// x mappings
		var xScale = d3.scaleLog()
	    				.domain([
							0.041572436, 
							352.2016762
	    				])
						.range([0, self.width]),
			xMap   = function(d) { return xScale(+d.x) + self.margin.left; };	// data --> display
		

		// y mappings
		var yScale = d3.scaleLog()
			    		.domain([
			    			0.033501997,
			    			387.1602479
			    		])
			    		.range([self.height, 0]),
			yMap   = function(d) { return yScale(+d.y) + self.margin.top; };		// data --> display
			

		/* search bar */
		var search = this.type == "country" ? document.querySelector('#searchA') : document.querySelector('#searchB');
		search.style.left = 1.2*self.margin.left + "px";
		search.style.top = self.margin.top + 30 + "px";
		
		// Delay searching so that animation doesn't get cut off
		var timeout = null;
		search.onkeyup = function() {
			clearTimeout(timeout);				// Restart delay if key is pressed
			timeout = setTimeout(function() {	// Delay function call
				searchWords(svg, type);
			}, 300);
		}
		search.onsearch = function() {	
			clearTimeout(timeout);				// Restart delay if search is pressed
			timeout = setTimeout(function() {	// Delay function call
				searchWords(svg, type);
			}, 300);			
		}

		/* Set up word list functionality -- hovering over a word selects it in the vis */
		var wordList = document.querySelector(".wordlist.A").querySelectorAll(".wordentry");
		wordList.forEach(function(d) {
			// Highlight word in vis 
			d.onmouseover = function() {
				hideTooltip();
				d.style.background = "#f2f2f2";
				var selection = d3.select("#" + d.getAttribute("word"));
				showTooltip(selection.datum(), d3.select("#svg1"));
				self.currSearch = selection;

			}
			// Dehighlight word in vis
			d.onmouseout = function() {
				d.style.background = "white";
				var selection = d3.select("#" + d.getAttribute("word"));
				hideTooltip();
				self.currSearch = null;
			}	
		})
		/* Set up word list functionality -- hovering over a word selects it in the vis */
		var wordList = document.querySelector(".wordlist.B").querySelectorAll(".wordentry");

		wordList.forEach(function(d) {
			// Highlight word in vis 
			d.onmouseover = function() {
				hideTooltip();
				d.style.background = "#f2f2f2";
				var selection = d3.select("#" + d.getAttribute("word"));
				showTooltip(selection.datum(), d3.select("#svg1"));
				self.currSearch = selection;

			}
			// Dehighlight word in vis
			d.onmouseout = function(e) {
				d.style.background = "white";
				var selection = d3.select("#" + d.getAttribute("word"));
				hideTooltip();
				self.currSearch = null;
			}	
		})


		/* Draw line */
		var lineData = [{"x": self.margin.left, "y": self.height + self.margin.top}, {"x": self.margin.left + self.width, "y": self.margin.top}]
		var line = d3.line()
	 			.x(function(d) { return d.x; })
	 			.y(function(d) { return d.y; })
	 		var lineGraph = svg.append("path")
	 			.attr("class", "scatter line")
	        .attr("d", line(lineData))
	        .attr("stroke", GREY_ACCENT)
	        .attr("stroke-width", 2)


	    renderAxes(svg, this.type);

		var colorMap = function(d) {
			var res = +d.y - +d.x;
			// More common in country, bottom triangle
			if (res < 0) {
				var spectrum = (yScale(+d.y) - yScale(+d.x));
				if (spectrum > 0 && spectrum <= self.height / 20.0) {
					return "#ccccff";
				}
				else if (spectrum > self.height / 20.0 && spectrum <= 1.0/10.0 * self.height) {
					return "#9999ff";
				}
				else if (spectrum > 1.0/10.0 * self.height && spectrum <=  1.0/5.0 * self.height) {
					return "#6666ff";
				}
				else if (spectrum > 1.0/5.0 * self.height && spectrum <= 1.0/2.0 * self.height) {
					return "#3333ff";
				}
				else if (spectrum > 1.0/2.0 * self.height) {
					return "#0000ff";
				}
			}
			// Less common in country, top triangle
			else if (res > 0) {
				var spectrum = (yScale(+d.y) - yScale(+d.x)) * -1;
				if (spectrum > 0 && spectrum <= self.height / 20.0) {
					return "#ffcccc";
				}
				else if (spectrum > self.height / 20.0 && spectrum <= 1.0/10.0 * self.height) {
					return "#ff9999";
				}
				else if (spectrum > 1.0/10.0 * self.height && spectrum <=  1.0/5.0 * self.height) {
					return "#ff6666";
				}
				else if (spectrum > 1.0/5.0 * self.height && spectrum <= 1.0/2.0 * self.height) {
					return "#ff3333";
				}
				else if (spectrum > 1.0/2.0 * self.height) {
					return "#ff0000";
				}

			}
			// Equally common in both genres
			else {
				return "#e6e6e6";
			}
		};
		// Plot points, store in array
		d3.csv(this.csv).then(function (data) {
			svg.selectAll(".dot")
				.data(data)
				.enter().append("circle")
				.attr("class", "scatter dot")
				.attr("id", function(d) { return d.word; })
				.attr("r", DOT_SIZE)
				.attr("cx", xMap)
				.attr("cy", yMap)
				.attr("fill", colorMap)
				.style("opacity", 0)
				.on("mouseover", function(d) {
			  		hideTooltip(d);
			  		showTooltip(d, svg);
			  	})
			  	.on("mouseout", hideTooltip)
		})

		renderTriangles(svg);
	}


	/* Shows the graph */
	show(opacity, type) {
		// show plotted points
		this.svg.selectAll(".dot")
		    .transition()
     		.delay(function(d, i) { return (i % 5) * TRANSITION_DELAY; })
     		.duration(TRANSITION_DURATION)
			.style("opacity", opacity);
		// show line
		this.svg.selectAll(".scatter.line")
		    .transition()
     		.duration(TRANSITION_DURATION)
			.style("opacity", 1.0);
		// show axes
		this.svg.selectAll(".scatter.axis")
			.transition()
     		.duration(TRANSITION_DURATION)
			.style("opacity", 1.0);
		this.svg.selectAll("." + type)
			.transition()
     		.duration(TRANSITION_DURATION)
			.style("opacity", 1.0);
	}


	/* Hides the graph */
	hide() {
		// hide search bar
		var search = this.type == "country" ? document.querySelector('#searchA') : document.querySelector('#searchB');
		window.setTimeout(function () {
			search.style.opacity = 0;
		}, TRANSITION_DELAY);

		// hide plotted points
		this.svg.selectAll(".dot")
		    .transition()
		    .delay(function(d, i) { return (i % 5) * TRANSITION_DELAY; })
     		.duration(TRANSITION_DURATION)
			.style("opacity", 0);
		// hide line points
		this.svg.selectAll(".scatter.line")
		    .transition()
     		.duration(TRANSITION_DURATION)
			.style("opacity", 0);
		// hide axes
		this.svg.selectAll(".scatter.axis")
			.transition()
     		.duration(TRANSITION_DURATION)
			.style("opacity", 0);
		// hide type specific labels
		this.svg.selectAll("." + this.type)
			.transition()
     		.duration(TRANSITION_DURATION)
			.style("opacity", 0);

		// hide tooltip
		hideTooltip();
		this.hideTriangles();
	}

	/* Hides the graph without animationas */
	hideFast() {
		// hide search bar
		var search = this.type == "country" ? document.querySelector('#searchA') : document.querySelector('#searchB');
		search.style.opacity = 0;

		// hide plotted points
		this.svg.selectAll(".dot")
			.style("opacity", 0);
		// hide line points
		this.svg.selectAll(".scatter.line")
			.style("opacity", 0);
		// hide axes
		this.svg.selectAll(".axis")
			.style("opacity", 0);

		// hide type specific labels
		this.svg.selectAll("." + this.type)
			.style("opacity", 0);

		// hide tooltip
		if (self.currSearch != null) {
		self.currSearch
			.attr("r", DOT_SIZE)
			.style("stroke-width", 0)
		}
		// remove tooltip
		d3.selectAll("#tooltip").remove();	
	}


	/* Displays the triangles on the graph */
	showTriangles() {
		this.svg.selectAll(".triangle")
			.transition()
			.duration(TRANSITION_DURATION)
			.style("opacity", .1)

		this.svg.selectAll(".trianglelabels")
			.transition()
			.duration(TRANSITION_DURATION)
			.style("opacity", 1)
	}

	/* Hides the triangles on the graph */
	hideTriangles() {
		this.svg.selectAll(".triangle")
			.transition()
			.duration(TRANSITION_DURATION)
			.style("opacity", 0)

		this.svg.selectAll(".trianglelabels")
			.transition()
			.duration(TRANSITION_DURATION)
			.style("opacity", 0)
	}

	/* Displays the search bar */
	showSearch() {
		// show search bar with animation
		var search = this.type == "country" ? document.querySelector('#searchA') : document.querySelector('#searchB');
		search.style.display = "inline-block";;
		search.style.width = '0px';
		search.style.height = '0px';
		search.style.opacity = 0;
		window.setTimeout(function () {
			search.style.width = '';
			search.style.height = '';
			search.style.opacity = 1.0;
		}, TRANSITION_DELAY * 2);
	}

	/* Hides the triangles on the graph */
	hideSearch() {
		// show search bar with animation
		var search = this.type == "country" ? document.querySelector('#searchA') : document.querySelector('#searchB');
		search.style.display = "inline-block";;

		window.setTimeout(function () {
			search.style.width = '';
			search.style.height = '';
			search.style.opacity = 0;
		}, TRANSITION_DELAY * 2);
	}
}


/*
 * Allows searching functionality of the dataset
 * If word is found, animates a visual to highlight the searched word on the graph
 */
function searchWords(svg, type) {
	var search = type == "country" ? document.querySelector('#searchA') : document.querySelector('#searchB');

	// If a word is found, animate a transition to highlight it on the graph
	if (search.value != "" && !d3.select("#" + search.value).empty()) {
		var selection = d3.select("#" + search.value);
		var endX = selection.attr("cx"),
		    endY = selection.attr("cy");

		// Set starting position for animation
		if (self.currSearch != null) {
			// previously searched word
			selection.attr("cx", self.currSearch.attr("cx"));
			selection.attr("cy", self.currSearch.attr("cy"));

			// revert past selection
			hideTooltip.call(self.currSearch, self.currSearch.datum());
		} else {
			// no previously searched word
			// animate from random location
			// var cx = Math.floor(Math.random() * (self.width - self.margin.left)) + self.margin.left;
			// var cy = Math.floor(Math.random() * (self.height)) + self.margin.top;
			// selection.attr("cx", cx);
			// selection.attr("cy", cy);

			// animate from origin
			selection.attr("cx", self.margin.left);
			selection.attr("cy", self.height - self.margin.bottom);
		}

		// Animate dot enlarging
		selection.transition()
			.attr("cx", endX)
			.attr("cy", endY)
			.attr("r", HOVER_DOT_SIZE)
			.style("stroke", "black")
			.style("stroke-width", 2)
			.duration(TRANSITION_DURATION)

		setTimeout(function() { showTooltip(selection.datum(), svg); }, TRANSITION_DURATION);
	
		self.currSearch = selection;		// keep track of currently searched term
	} else {
		// unhighlight selection
		if (self.currSearch != null && search.value == "") {
			hideTooltip.call(self.currSearch, self.currSearch.datum());
			self.currSearch = null;
		}
	}
}


/*
 * Renders the tooltip information next to the given point
 */
function showTooltip(d, svg) {

	self.currSearch = d3.select("#" + d.word);
	// Animate dot enlarging
	d3.select("#" + d.word).transition()
		.attr("r", HOVER_DOT_SIZE)
		.style("stroke", "black")
		.style("stroke-width", 2)
		.duration(TRANSITION_DURATION);	

	var x = +d3.select("#" + d.word).attr("cx"),
	    y = +d3.select("#" + d.word).attr("cy") + 20,
	    rect_y = +d3.select("#" + d.word).attr("cy");

	var dims = drawTooltipInfo(svg, d, x, y, 0, 0, 0, false);
	var rect_width = dims[0],
		wordWidth = dims[1],
		freqWidth = dims[2],
		freqLabelWidth = dims[3];
	d3.selectAll("#tooltip").remove();

	// Shift popup down and left if it is going to be cut off
	if (x + rect_width >= self.width) {
		x = x + rect_width - self.width;
		y += 4;
		rect_y += 4;
	}

	// Bounding rectangle, animated
	var rect = svg.append("rect")
		.attr('id', 'tooltip')
	 	.attr('x', x)
		.attr('y', rect_y)
		.attr('rx', 4)
		.attr('ry', 4)
		.attr('width', 0)
		.attr('height', 0)
		.attr('fill', GREY_ACCENT)
		.style("opacity", .8)
	rect.transition()
		.attr('width', rect_width)
		.attr('height', 75)

	drawTooltipInfo(svg, d, x, y, wordWidth, freqWidth, freqLabelWidth, true);
}


/* 
 * Draws the tooltip on the svg element
 */
function drawTooltipInfo(svg, d, x, y, wordWidth, freqWidth, freqLabelWidth, transition) {
	// Spacing
	var h_spacing = 10,
		v_spacing = 5;
	// Font size to draw elements
	var endFontSizeA = "20px",
		endFontSizeB = "15px";
	// Font size to draw elements initially, for transitions
	var fontSizeA = "20px",
		fontSizeB = "15px",
		opacity = 1.0;
	if (transition) {
		fontSizeA = "0px";
		fontSizeB = "0px";
		opacity = 0;
	}

	// FIRST COLUMN
	// Word
	var word = svg.append("text")
		.attr("id", "tooltip")
	    .attr("x", x + h_spacing)
	    .attr("y", y + v_spacing)
	    .text(d.word)
	    .attr("font-family", "sans-serif")
	    .attr("font-size", fontSizeA)
	    .attr("fill", TOOLTIP_TEXT_COLOR)
	    .attr("opacity", opacity)
	    .style("font-weight", "bold")

	// Freq label
	var freqLabel1, freqLabel2 = null;
	var freqLabelWidth;
	// Same frequency, probaably super rare
	if (d.x === d.y) {
		freqLabel1 = svg.append("text")
	    	.attr("id", "tooltip")
			.attr("x", x + h_spacing)
			.attr("y", y + (5 * v_spacing))
			.text("Equally common in Country and other genres")
			.attr("font-family", "sans-serif")
			.attr("font-size", fontSizeB)
			.attr("fill", TOOLTIP_TEXT_COLOR)
			.attr("opacity", opacity)
		freqLabelWidth = Math.max(freqLabelWidth, freqLabel1.node().getComputedTextLength());
	// Different frequencies
	} else {
		var freq, freqLabel;
		if (d.x > d.y) {
			freq = d.x / d.y;
			freq = Math.round(freq * 100) / 100;
			freqLabel = " higher in Country";
		} else if (d.x < d.y) {
			freq = d.y / d.x;
			freq = Math.round(freq * 100) / 100;
			freqLabel = " higher in other genres";
		}

		var freqLabel1 = svg.append("text")
	    	.attr("id", "tooltip")
			.attr("x", x + h_spacing)
			.attr("y", y + (5 * v_spacing))
			.text(freq + "x")
			.attr("font-family", "sans-serif")
			.attr("font-size", fontSizeB)
			.attr("fill", TOOLTIP_TEXT_COLOR)
			.attr("opacity", opacity)
			.style("font-weight", "bold")
		var freqLabel2 = svg.append("text")
	    	.attr("id", "tooltip")
			.attr("x", x + h_spacing + freqWidth + 4)
			.attr("y", y + (5 * v_spacing))
			.text(freqLabel)
			.attr("font-family", "sans-serif")
			.attr("font-size", fontSizeB)
			.attr("fill", TOOLTIP_TEXT_COLOR)
			.attr("opacity", opacity)

		freqLabelWidth = Math.max(freqLabelWidth, freqLabel1.node().getComputedTextLength() + freqLabel2.node().getComputedTextLength());
	}

	// Compute width 
	wordWidth = Math.max(wordWidth, word.node().getComputedTextLength());	

    // SECOND COLUMN
    var colWidth = Math.max(wordWidth, freqLabelWidth) + (3 * h_spacing);
	// Usage
	var usage = svg.append("text")
    	.attr("id", "tooltip")
		.attr("x", x + colWidth)
		.attr("y", y + v_spacing)
		.text("Usage per 10,000 words")
		.attr("font-family", "sans-serif")
		.attr("font-size", fontSizeB)
		.attr("fill", TOOLTIP_TEXT_COLOR)
		.attr("opacity", opacity)
		.style("font-weight", "lighter")
	
	// Country frequency
	var countryFreq = svg.append("text")
		.attr("id", "tooltip")
    	.attr("x", x + colWidth)
   		.attr("y", y + (5 * v_spacing))
	    .text("Country")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", fontSizeB)
	    .attr("fill", TOOLTIP_TEXT_COLOR)
	    .attr("opacity", opacity)
	
	// General Frequency label
	var generalFreq = svg.append("text")
    	.attr("id", "tooltip")
		.attr("x", x + colWidth)
		.attr("y", y + (9 * v_spacing))
		.text("Other Genres")
		.attr("font-family", "sans-serif")
		.attr("font-size", fontSizeB)
		.attr("fill", TOOLTIP_TEXT_COLOR)
		.attr("opacity", opacity)

	var countX = x + colWidth + 120;
	// Country count
	var countryCount = svg.append("text")
		.attr("id", "tooltip")
    	.attr("x", countX)
   		.attr("y", y + (5 * v_spacing))
	    .text(function() { 
	    	return Math.round(d.x * 100) / 100;
	    })
	    .attr("font-family", "sans-serif")
	    .attr("font-size", fontSizeB)
	    .attr("fill", TOOLTIP_TEXT_COLOR)
	    .attr("opacity", opacity)
	    .style("font-weight", "bold")

	// General count
	var otherCount = svg.append("text")
		.attr("id", "tooltip")
    	.attr("x", countX)
   		.attr("y", y + (9 * v_spacing))
	    .text(function() { 
	    	return Math.round(d.y * 100) / 100;
	    })
	    .attr("font-family", "sans-serif")
	    .attr("font-size", fontSizeB)
	    .attr("fill", TOOLTIP_TEXT_COLOR)
	    .attr("opacity", opacity)
	    .style("font-weight", "bold")

	// Animations
	if (transition) {
		word.transition()
			.attr("font-size", endFontSizeA)
			.attr("opacity", 1.0)

		if (freqLabel2 != null) {
			freqLabel2.transition()
			.attr("font-size", endFontSizeB)
			.attr("opacity", 1.0)
		}
		freqLabel1.transition()
			.attr("font-size", endFontSizeB)
			.attr("opacity", 1.0)


		usage.transition()
			.attr("font-size", endFontSizeB)
			.attr("opacity", 1.0)

		countryFreq.transition()
			.attr("font-size", endFontSizeB)
			.attr("opacity", 1.0)

		generalFreq.transition()
			.attr("font-size", endFontSizeB)
			.attr("opacity", 1.0)

		countryCount.transition()
			.attr("font-size", endFontSizeB)
			.attr("opacity", 1.0)

		otherCount.transition()
			.attr("font-size", endFontSizeB)
			.attr("opacity", 1.0)
	}

	// Calculate width of bounding rectangle
	var rect_width = colWidth + usage.node().getComputedTextLength() + h_spacing;
	return [rect_width, wordWidth, freqLabel1.node().getComputedTextLength(), freqLabelWidth];
}


/*
 * Removes the tooltip from the d3 element
 */
function hideTooltip(d) {
	if (self.currSearch != null) {
		self.currSearch.transition()
			.attr("r", DOT_SIZE)
			.style("stroke-width", 0)
			.duration(TRANSITION_DURATION);	
	}
	// remove tooltip
	d3.selectAll("#tooltip").remove();					
}






function renderTriangles(svg) {
	/* Draw triangles */
	var topTriangleData = [{"x": self.margin.left, "y": self.margin.top}, {"x": self.margin.left, "y": self.height + self.margin.top}, {"x": self.margin.left + self.width, "y": self.margin.top}]
	var botTriangleData = [{"x": self.margin.left + self.width, "y": self.margin.top + self.height}, {"x": self.margin.left, "y": self.height + self.margin.top}, {"x": self.margin.left + self.width, "y": self.margin.top}]
	var line = d3.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
		var topTriangle = svg.append("path")
			.attr("class", "triangle")
        .attr("d", line(topTriangleData))
        .attr("fill", "#ff0000")
        .attr("stroke", "#ff0000")
        .attr("stroke-width", 0)
        .style("opacity", 0)
    var botTriangle = svg.append("path")
			.attr("class", "triangle")
        .attr("d", line(botTriangleData))
        .attr("fill", "#0000ff")
        .attr("stroke", "#0000ff")
        .attr("stroke-width", 0)
        .style("opacity", 0)

	/* Draw top triangle labels and arrows */
    var topLabels = svg.append("g")
    	.attr("class", "trianglelabels")
    	.attr("transform", "translate(" + self.width/2 + "," + self.height/3 + ")")
    	.style("opacity", 0)
    topLabels.append("text")
    	.attr("x", 0)
    	.attr("y", 0)
    	.attr("fill", "#ff3333")
    	.text("Less")
    	.style("font-weight", "bold")
    topLabels.append("text")
    	.attr("x", 34)
    	.attr("y", 0)
    	.attr("fill", "#ff3333")
    	.text("usage")
    topLabels.append("text")
    	.attr("x", 0)
    	.attr("y", 20)
    	.attr("fill", "#ff3333")
    	.text("in country")
    topLabels.append("text")
    	.attr("x", 0)
    	.attr("y", 40)
    	.attr("fill", "#ff3333")
    	.text("compared to")
    topLabels.append("text")
    	.attr("x", 0)
    	.attr("y", 60)
    	.attr("fill", "#ff3333")
    	.text("other genres")

    /* Draw bottom triangle labels and arrows */
    var topLabels = svg.append("g")
    	.attr("class", "trianglelabels")
    	.attr("transform", "translate(" + self.width*3/4 + "," + self.height*2/3 + ")")
    	.style("opacity", 0)
    topLabels.append("text")
    	.attr("x", 0)
    	.attr("y", 0)
    	.attr("fill", "#3333ff")
    	.style("font-weight", "bold")
    	.text("More")
    topLabels.append("text")
    	.attr("x", 40)
    	.attr("y", 0)
    	.attr("fill", "#3333ff")
    	.text("usage")
    topLabels.append("text")
    	.attr("x", 0)
    	.attr("y", 20)
    	.attr("fill", "#3333ff")
    	.text("in country")
    topLabels.append("text")
    	.attr("x", 0)
    	.attr("y", 40)
    	.attr("fill", "#3333ff")
    	.text("compared to")
    topLabels.append("text")
    	.attr("x", 0)
    	.attr("y", 60)
    	.attr("fill", "#3333ff")
    	.text("other genres")
}


function renderAxes(svg, type) {
	var xScale = d3.scaleLog()
	    				.domain([
							0.041572436, 
							352.2016762
	    				])
						.range([0, self.width]),
		yScale = d3.scaleLog()
			    		.domain([
			    			0.033501997,
			    			387.1602479
			    		])
			    		.range([self.height, 0]);
	var xAxis = d3.axisBottom(xScale).ticks(0).tickSize(0); 	// x axis
        yAxis = d3.axisLeft(yScale).ticks(0).tickSize(0);		// y axis
	/* Draw x axis */
	var xAxisShift = self.height + self.margin.top;
	svg.append("g")
		.attr("class", "scatter x axis")
		.attr("transform", "translate(" + self.margin.left + "," + xAxisShift + ")")
		.call(xAxis)
		
	// x axis arrow
	var xArrowX = self.width + self.margin.left;
	var xArrowY = self.height + self.margin.top;
	svg.append("svg:path")
		.attr("class", "scatter x axis")
		.attr("d", d3.symbol().type(d3.symbolTriangle))
		.attr("transform", "translate(" + xArrowX + "," + xArrowY + ")rotate(90)")
		.attr("fill", "black")

	// x axis labels
	var spacing = 10;
	var xAxisLabelsY = self.height  + self.margin.bottom + spacing;
	svg.append("text")
		.attr("class", "scatter x axis")
	  	.attr("x", self.margin.left + (self.width / 2) - 50)
	  	.attr("y", xAxisLabelsY)
	  	.text("In Country")
	  	.style("font-weight", "bold")
	svg.append("text")
		.attr("class", "scatter x axis")
	  	.attr("x", self.width + self.margin.left - 70)
	  	.attr("y", xAxisLabelsY)
	  	.text("More Usage")
	  	.style("font-style", "italic")


	/* Draw y axis */
	svg.append("g")
		.attr("class", "scatter y axis")
		.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
		.call(yAxis)

	// y axis arrow
	svg.append("svg:path")
		.attr("class", "scatter y axis")
		.attr("d", d3.symbol().type(d3.symbolTriangle))
		.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
		.attr("fill", "black")

	// y axis labels
	var v_spacing = 17;
	var yAxisLabelsX = 40;
	svg.append("text")
	  	.attr("class", "scatter y axis")
	  	.attr("x", yAxisLabelsX + 10)
	  	.attr("y", self.margin.top + v_spacing)
	  	.text("More")
	  	.style("font-style", "italic")
	svg.append("text")
	  	.attr("class", "scatter y axis")
	  	.attr("x", yAxisLabelsX + 10)
	  	.attr("y", self.margin.top + (2 * v_spacing))
	  	.text("Usage")
	  	.style("font-style", "italic")

	if (type == "country") {
		svg.append("text")
		  	.attr("class", "country")
		  	.attr("x", yAxisLabelsX)
		  	.attr("y", self.margin.top + (self.height / 2) - v_spacing)
		  	.text("In")
		  	.style("font-weight", "bold")
		svg.append("text")
		  	.attr("class", "country")
		  	.attr("x", yAxisLabelsX)
		  	.attr("y", self.margin.top + (self.height / 2))
		  	.text("Other")
		  	.style("font-weight", "bold")
		svg.append("text")
		  	.attr("class", "country")
		  	.attr("x", yAxisLabelsX)
		  	.attr("y", self.margin.top + (self.height / 2) + v_spacing)
		  	.text("Genres")
		  	.style("font-weight", "bold")
	} else if (type == "gender") {
		svg.append("text")
		  	.attr("class", "gender")
		  	.attr("x", yAxisLabelsX)
		  	.attr("y", self.margin.top + (self.height / 2) - v_spacing)
		  	.text("In")
		  	.style("font-weight", "bold")
		svg.append("text")
		  	.attr("class", "gender")
		  	.attr("x", yAxisLabelsX)
		  	.attr("y", self.margin.top + (self.height / 2))
		  	.text("Male")
		  	.style("font-weight", "bold")
		svg.append("text")
		  	.attr("class", "gender")
		  	.attr("x", yAxisLabelsX)
		  	.attr("y", self.margin.top + (self.height / 2) + v_spacing)
		  	.text("Artists")
		  	.style("font-weight", "bold")
	}

	svg.append("text")
	  	.attr("class", "scatter y axis")
	  	.attr("x", yAxisLabelsX + 20)
	  	.attr("y", self.margin.top + self.margin.bottom / 2 + self.height)
	  	.text("Less")
	  	.style("font-style", "italic")
	svg.append("text")
	  	.attr("class", "scatter y axis")
	  	.attr("x", yAxisLabelsX + 15)
	  	.attr("y", self.margin.top + self.margin.bottom / 2 + self.height + v_spacing)
	  	.text("Usage")
	  	.style("font-style", "italic")
}







