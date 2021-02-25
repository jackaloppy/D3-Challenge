// @TODO: YOUR CODE HERE!
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var svgWidth = 900;
var svgHeight = 500;

var margin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 100
};

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

var svg = d3.select('#scatter')
            .append("svg")
                .attr("height", svgHeight)
                .attr("width", svgWidth);

var chartGroup = svg.append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);


var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.95,
        d3.max(data, d => d[chosenXAxis]) * 1.05
      ])
      .range([0, width]);
  
    return xLinearScale;
};

function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.95,
        d3.max(data, d => d[chosenYAxis]) * 1.05
      ])
      .range([0, height]);
  
    return yLinearScale;
};

function renderxAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
};

function renderyAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
};

function renderCircles(circleGroups, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circleGroups.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circleGroups;
};

function renderText(textGroups, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    textGroups.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]))
    return textGroups;
};

function updateToolTip(chosenXAxis, chosenYAxis, circleGroups, textGroups) {
    var xLabel;
    var yLabel;

    if (chosenXAxis === "poverty") {
      xLabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
      xLabel = "Age:";
    }
    else {
        xLabel = "Household Income:";
    }
    
    if (chosenYAxis === "healthcare") {
        yLabel = "Lacks Halthcare:";
      }
      else if (chosenYAxis === "smokes") {
        yLabel = "Smokes:";
      }
      else {
          yLabel = "Obesity:";
    }
    if (chosenXAxis === 'age') {
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function(d) {
                return (`${d.state}<br>${xLabel} ${d[chosenXAxis]} yrs<br>${yLabel} ${d[chosenYAxis]}%`);
            });
    }
    else if (chosenXAxis === 'income') {
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function(d) {
                return (`${d.state}<br>${xLabel} $${numberWithCommas(d[chosenXAxis])}<br>${yLabel} ${d[chosenYAxis]}%`);
            });
    }
    else {var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
          return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}%<br>${yLabel} ${d[chosenYAxis]}%`);
        });
    };
  
    circleGroups.call(toolTip);
    textGroups.call(toolTip);
      
    circleGroups.on("mouseover", function(data) {
        toolTip.show(data);
    })
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
    textGroups.on("mouseover", function(data) {
        toolTip.show(data);
    })
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
    return circleGroups;
    return textGroups;
  }

d3.csv("assets/data/data.csv").then(function(data) {
    data.forEach(function(d) {
        d.age = +d.age;
        d.healthcare = +d.healthcare;
        d.income = +d.income;
        d.obesity = +d.obesity;
        d.poverty = +d.poverty;
        d.smokes = +d.smokes;
    });
    
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(${width}), 0)`)
        .call(leftAxis);

    var node = chartGroup.selectAll("g.node")
        .data(data)
        .enter().append("svg:g")
        .attr("class", "node")

    var circleGroups = node.append("svg:circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 8)
        .attr("fill", "steelblue")
    
    var textGroups = node.append("svg:text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .style('font-size', 9)
        .attr('fill', 'white')
        .text(d => d.abbr)

    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");
    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 60- margin.left)
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");
    var smokeLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 40 - margin.left)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");
    var obesityLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 20 - margin.left)
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");
    
    var circleGroups = updateToolTip(chosenXAxis, chosenYAxis, circleGroups, textGroups);

    xLabelsGroup.selectAll("text")
        .on("click", function(){
            var xValue = d3.select(this).attr("value");
            if (xValue !== chosenXAxis) {
                chosenXAxis = xValue;
                xLinearScale = xScale(data, chosenXAxis);
                xAxis = renderxAxes(xLinearScale, xAxis);
                circleGroups = renderCircles(circleGroups, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                textGroups = renderText(textGroups, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circleGroups = updateToolTip(chosenXAxis, chosenYAxis, circleGroups, textGroups);
                if (chosenXAxis === "poverty") {
                    povertyLabel
                      .classed("active", true)
                      .classed("inactive", false);
                    ageLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    incomeLabel
                      .classed("active", false)
                      .classed("inactive", true);
                }
                else if (chosenXAxis === 'age') {
                    povertyLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    ageLabel
                      .classed("active", true)
                      .classed("inactive", false);
                    incomeLabel
                      .classed("active", false)
                      .classed("inactive", true);  
                }
                else {
                    povertyLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    ageLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    incomeLabel
                      .classed("active", true)
                      .classed("inactive", false);         
                }
            }
    });
    yLabelsGroup.selectAll("text")
        .on("click", function(){
            var yValue = d3.select(this).attr("value");
            if (yValue !== chosenYAxis) {
                chosenYAxis = yValue;
                yLinearScale = yScale(data, chosenYAxis);
                yAxis = renderyAxes(yLinearScale, yAxis);
                circleGroups = renderCircles(circleGroups, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                textGroups = renderText(textGroups, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circleGroups = updateToolTip(chosenXAxis, chosenYAxis, circleGroups, textGroups);
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                      .classed("active", true)
                      .classed("inactive", false);
                    smokeLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    obesityLabel
                      .classed("active", false)
                      .classed("inactive", true);
                }
                else if (chosenYAxis === 'smokes') {
                    healthcareLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    smokeLabel
                      .classed("active", true)
                      .classed("inactive", false);
                    obesityLabel
                      .classed("active", false)
                      .classed("inactive", true);  
                }
                else {
                    healthcareLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    smokeLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    obesityLabel
                      .classed("active", true)
                      .classed("inactive", false);         
                }
            }
    });
})