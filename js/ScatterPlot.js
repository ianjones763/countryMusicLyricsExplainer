
const DOT_SIZE = 3;
const HOVER_DOT_SIZE = 5;
const MARGIN_LEFT = 100;
const MARGIN_RIGHT = 20;
const MARGIN_TOP = 20;
const MARGIN_BOT = 20;
const TOOLTIP_TEXT_COLOR = "black";
const TRANSITION_DELAY = 100;

class ScatterPlot {


	constructor(opts) {
		self.svg	 = opts.svg;
		this.data 	 = opts.data;
		this.element = opts.element;
		this.width   = opts.width - MARGIN_RIGHT - MARGIN_LEFT;			// graph width
		this.height  = opts.height - MARGIN_BOT - MARGIN_TOP;			// graph height
		this.width   = Math.min(this.width, this.height);
		this.height  = this.width;
		self.width   = opts.width;
		this.x 		 = opts.x;
		this.y 		 = opts.y;
		this.draw();
	}


	/* Draws the axes, labels, and plots the points */
	draw() {
		// x mappings
		var xValue = function(d) { return d.getCountryFreq(); },				// x is string to specify value
			xScale = d3.scaleLinear().range([0, this.width]),					// value --> display
			xMap   = function(d) { return xScale(xValue(d)) + MARGIN_LEFT; },	// data --> display
			xAxis  = d3.axisBottom(xScale).ticks(0).tickSize(0); 				// axis

		// y mappings
		var yValue = function(d) { return d.getGeneralFreq(); },	// y is string to specify value
			yScale = d3.scaleLinear().range([this.height, 0]),		// value --> display
			yMap   = function(d) { return yScale(yValue(d)) + MARGIN_TOP; },		// data --> display
			yAxis  = d3.axisLeft(yScale).ticks(0).tickSize(0);		// axis

		var colorMap = function(d) { return d.getColor(); };


		/* Draw x axis */
		var xAxisShift = this.height + MARGIN_TOP;
		self.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + MARGIN_LEFT + "," + xAxisShift + ")")
			.call(xAxis)
			
		// x axis arrow
		var xArrowX = this.width + MARGIN_LEFT;
		var xArrowY = this.height + MARGIN_TOP;
		self.svg.append("svg:path")
			.attr("class", "x axis")
			.attr("d", d3.symbol().type(d3.symbolTriangle))
			.attr("transform", "translate(" + xArrowX + "," + xArrowY + ")rotate(90)")
			.attr("fill", "black")

		// x axis labels
		var spacing = 10;
		var xAxisLabelsY = this.height + MARGIN_TOP + MARGIN_BOT + spacing;
		self.svg.append("text")
			.attr("class", "x axis")
		  	.attr("x", MARGIN_LEFT + (this.width / 2) - 50)
		  	.attr("y", xAxisLabelsY)
		  	.text("In Country")
		  	.style("font-weight", "bold")
		self.svg.append("text")
			.attr("class", "x axis")
		  	.attr("x", this.width + MARGIN_RIGHT)
		  	.attr("y", xAxisLabelsY)
		  	.text("More Usage")
		  	.style("font-style", "italic")


		/* Draw y axis */
		self.svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + MARGIN_LEFT + "," + MARGIN_TOP + ")")
			.call(yAxis)

		// y axis arrow
		self.svg.append("svg:path")
			.attr("class", "y axis")
			.attr("d", d3.symbol().type(d3.symbolTriangle))
			.attr("transform", "translate(" + MARGIN_LEFT + "," + MARGIN_TOP + ")")
			.attr("fill", "black")

		// y axis labels
		var v_spacing = 17;
		var yAxisLabelsX = MARGIN_LEFT / 2.7;
		self.svg.append("text")
		  	.attr("class", "y axis")
		  	.attr("x", yAxisLabelsX + 10)
		  	.attr("y", MARGIN_TOP + v_spacing)
		  	.text("More")
		  	.style("font-style", "italic")
		self.svg.append("text")
		  	.attr("class", "y axis")
		  	.attr("x", yAxisLabelsX + 10)
		  	.attr("y", MARGIN_TOP + (2 * v_spacing))
		  	.text("Usage")
		  	.style("font-style", "italic")
		self.svg.append("text")
		  	.attr("class", "y axis")
		  	.attr("x", yAxisLabelsX)
		  	.attr("y", MARGIN_TOP + (this.height / 2) - v_spacing)
		  	.text("In")
		  	.style("font-weight", "bold")
		self.svg.append("text")
		  	.attr("class", "y axis")
		  	.attr("x", yAxisLabelsX)
		  	.attr("y", MARGIN_TOP + (this.height / 2))
		  	.text("Other")
		  	.style("font-weight", "bold")
		self.svg.append("text")
		  	.attr("class", "y axis")
		  	.attr("x", yAxisLabelsX)
		  	.attr("y", MARGIN_TOP + (this.height / 2) + v_spacing)
		  	.text("Genres")
		  	.style("font-weight", "bold")
		self.svg.append("text")
		  	.attr("class", "y axis")
		  	.attr("x", yAxisLabelsX + 20)
		  	.attr("y", MARGIN_TOP + MARGIN_BOT / 2 + this.height)
		  	.text("Less")
		  	.style("font-style", "italic")
		self.svg.append("text")
		  	.attr("class", "y axis")
		  	.attr("x", yAxisLabelsX + 15)
		  	.attr("y", MARGIN_TOP + MARGIN_BOT / 2 + this.height + v_spacing)
		  	.text("Usage")
		  	.style("font-style", "italic")


		/* Draw line */
		var lineData = [{"x": MARGIN_LEFT, "y": this.height + MARGIN_TOP}, {"x": MARGIN_LEFT + this.width, "y": MARGIN_TOP}]
		var line = d3.line()
   			.x(function(d) { return d.x; })
   			.y(function(d) { return d.y; })
   		var lineGraph = self.svg.append("path")
   			.attr("class", "line")
	        .attr("d", line(lineData))
	        .attr("stroke", "blue")
	        .attr("stroke-width", 2)
	        .attr("fill", "none");

		/* Draw dots */
		self.svg.selectAll(".dot")
			.data(this.data)
		  .enter().append("circle")
		  	.attr("class", "dot")
		  	.attr("r", DOT_SIZE)
		  	.attr("cx", xMap)
		  	.attr("cy", yMap)
		  	.style("fill", colorMap)
		  	.on("mouseover", showTooltip)
		  	.on("mouseout", hideTooltip)

	}


	/* Shows the graph */
	show() {
		// show plotted points
		self.svg.selectAll(".dot")
		    .transition()
     		.delay(function(d, i) { return (i % 5) * TRANSITION_DELAY; })
     		.duration(TRANSITION_DURATION)
			.style("opacity", 1.0);
		// show line
		self.svg.selectAll(".line")
		    .transition()
     		.duration(TRANSITION_DURATION)
			.style("opacity", 1.0);
		// show axes
		self.svg.selectAll(".axis")
			.transition()
     		.duration(TRANSITION_DURATION)
			.style("opacity", 1.0);
	}


	/* Hides the graph */
	hide() {
		// hide plotted points
		self.svg.selectAll(".dot")
		    .transition()
		    .delay(function(d, i) { return (i % 5) * TRANSITION_DELAY; })
     		.duration(TRANSITION_DURATION)
			.style("opacity", 0);
		// hide line points
		self.svg.selectAll(".line")
		    .transition()
     		.duration(TRANSITION_DURATION)
			.style("opacity", 0);
		// hide axes
		self.svg.selectAll(".axis")
			.transition()
     		.duration(TRANSITION_DURATION)
			.style("opacity", 0);
	}


	/* For debugging */
	print() {
		console.log("total = " + Word.getTotalGeneral());
		this.data[0].print();
		console.log("data = " + this.data[0].getGeneralFreq());
	}
}


/*
 * Renders the tooltip information next to the given point
 */
function showTooltip(d) {
	d3.select(this).transition().attr("r", HOVER_DOT_SIZE);			// enlarge dot

	var x = +d3.select(this).attr("cx"),
	    y = +d3.select(this).attr("cy") + 20,
	    rect_y = +d3.select(this).attr("cy");

	var dims = drawTooltipInfo(d, x, y, 0, 0, false);
	var rect_width = dims[0],
		wordWidth = dims[1],
		freqLabelWidth = dims[2];
	d3.selectAll("#tooltip").remove();

	// Shift popup down and left if it is going to be cut off
	if (x + rect_width >= self.width) {
		x = self.width - rect_width;
		y += 4;
		rect_y += 4;
	}

	// Bounding rectangle, animated
	var rect = self.svg.append("rect")
		.attr('id', 'tooltip')
	 	.attr('x', x)
		.attr('y', rect_y)
		.attr('rx', 10)
		.attr('ry', 10)
		.attr('width', 0)
		.attr('height', 0)
		.attr('fill', 'red')
		.style("opacity", .8)
	rect.transition()
		.attr('width', rect_width)
		.attr('height', 65)

	drawTooltipInfo(d, x, y, wordWidth, freqLabelWidth, true);
}


/* 
 * Draws the tooltip on the svg element
 */
function drawTooltipInfo(d, x, y, wordWidth, freqLabelWidth, transition) {
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
	var word = self.svg.append("text")
		.attr("id", "tooltip")
	    .attr("x", x + h_spacing)
	    .attr("y", y + v_spacing)
	    .text(d.getWord())
	    .attr("font-family", "sans-serif")
	    .attr("font-size", fontSizeA)
	    .attr("fill", TOOLTIP_TEXT_COLOR)
	    .attr("opacity", opacity)

	// Freq label
	var freqLabel;
	if (d.getCountryFreq() > d.getGeneralFreq()) {
		var freq = d.getCountryFreq() / d.getGeneralFreq();
		freq = Number.parseFloat(freq).toPrecision(1)
		freqLabel = freq + "x higher in country"
	} else if (d.getCountryFreq() < d.getGeneralFreq()) {
		var freq = d.getGeneralFreq() / d.getCountryFreq();
		freq = Number.parseFloat(freq).toPrecision(1)
		freqLabel = freq + "x higher in other genres"
	} else {
		freqLabel = "Equally common in country and other genres"
	}
	var freqLabel = self.svg.append("text")
    	.attr("id", "tooltip")
		.attr("x", x + h_spacing)
		.attr("y", y + (4 * v_spacing))
		.text(freqLabel)
		.attr("font-family", "sans-serif")
		.attr("font-size", fontSizeB)
		.attr("fill", TOOLTIP_TEXT_COLOR)
		.attr("opacity", opacity)


	// Compute width 
	wordWidth = Math.max(wordWidth, word.node().getComputedTextLength());
	freqLabelWidth = Math.max(freqLabelWidth, freqLabel.node().getComputedTextLength());	

    // SECOND COLUMN
    var colWidth = Math.max(wordWidth, freqLabelWidth) + (3 * h_spacing);
	// Usage
	var usage = self.svg.append("text")
    	.attr("id", "tooltip")
		.attr("x", x + colWidth)
		.attr("y", y + v_spacing)
		.text("Usage per 10,000 words")
		.attr("font-family", "sans-serif")
		.attr("font-size", fontSizeA)
		.attr("fill", TOOLTIP_TEXT_COLOR)
		.attr("opacity", opacity)
	
	// Country frequency
	var countryFreq = self.svg.append("text")
		.attr("id", "tooltip")
    	.attr("x", x + colWidth)
   		.attr("y", y + (4 * v_spacing))
	    .text("Country")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", fontSizeB)
	    .attr("fill", TOOLTIP_TEXT_COLOR)
	    .attr("opacity", opacity)
	
	// General Frequency label
	var generalFreq = self.svg.append("text")
    	.attr("id", "tooltip")
		.attr("x", x + colWidth)
		.attr("y", y + (7 * v_spacing))
		.text("Other Genres")
		.attr("font-family", "sans-serif")
		.attr("font-size", fontSizeB)
		.attr("fill", TOOLTIP_TEXT_COLOR)
		.attr("opacity", opacity)

	var countX = x + colWidth + 120;
	// Country count
	var countryCount = self.svg.append("text")
		.attr("id", "tooltip")
    	.attr("x", countX)
   		.attr("y", y + (4 * v_spacing))
	    .text(d.getCountryFreq())
	    .attr("font-family", "sans-serif")
	    .attr("font-size", fontSizeB)
	    .attr("fill", TOOLTIP_TEXT_COLOR)
	    .attr("opacity", opacity)

	// General count
	var otherCount = self.svg.append("text")
		.attr("id", "tooltip")
    	.attr("x", countX)
   		.attr("y", y + (7 * v_spacing))
	    .text(d.getGeneralFreq())
	    .attr("font-family", "sans-serif")
	    .attr("font-size", fontSizeB)
	    .attr("fill", TOOLTIP_TEXT_COLOR)
	    .attr("opacity", opacity)

	// Animations
	if (transition) {
		word.transition()
			.attr("font-size", endFontSizeA)
			.attr("opacity", 1.0)
		freqLabel.transition()
			.attr("font-size", endFontSizeB)
			.attr("opacity", 1.0)

		usage.transition()
			.attr("font-size", endFontSizeA)
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
	return [rect_width, wordWidth, freqLabelWidth];
}


/*
 * Removes the tooltip from the d3 element
 */
function hideTooltip(d) {
	d3.select(this).transition().attr("r", DOT_SIZE);	// shrink dot
	d3.selectAll("#tooltip").remove();					// Remove tooltip
}













