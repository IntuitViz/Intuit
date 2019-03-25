var m = {t:10,r:10,b:30,l:30};

var wExplanation1 = d3.select("#ex-feature1").node().clientWidth,
    hExplanation1 = d3.select('#ex-feature1').node().clientHeight;

var wExplanation2 = d3.select("#ex-feature2").node().clientWidth,
    hExplanation2 = d3.select('#ex-feature2').node().clientHeight;

var wMatrix = d3.select('#matrix').node().clientWidth - m.l - m.r,
    hMatrix = d3.select('#matrix').node().clientHeight - m.t - m.b;

var wFList = d3.select('#featureList').node().clientWidth - m.l - m.r,
    hFList = d3.select('#featureList').node().clientHeight - m.t - m.b;

var wActualData = d3.select('#actualData').node().clientWidth - m.l - m.r,
    hActualData = d3.select('#actualData').node().clientHeight - m.t - m.b;

var wRealActivity = d3.select('#realActivity').node().clientWidth - m.l - m.r,
    hRealActivity = d3.select('#realActivity').node().clientHeight - m.t - m.b;

var wWrongActivity = d3.select('#wrongActivity').node().clientWidth - m.l - m.r,
    hWrongActivity = d3.select('#wrongActivity').node().clientHeight - m.t - m.b;

var canvasMatrix = d3.select('#matrix');
var plotMatrix = canvasMatrix
    .append('svg')
    .attr('width',wMatrix + m.l + m.r)
    .attr('height',hMatrix  + m.t + m.b);

var canvasExpl1 = d3.select('#ex-feature1');
var plotExplanation1 = canvasExpl1
    .append('svg')
    .attr('width',wExplanation1+m.r+m.l)
    .attr('height',hExplanation1 + m.t + m.b);

var canvasExpl2 = d3.select('#ex-feature2');
var plotExplanation2 = canvasExpl2
    .append('svg')
    .attr('width',wExplanation2+m.r+m.l)
    .attr('height',hExplanation2 + m.t + m.b);

var canvasActualData = d3.select('#actualData');
var plotActualData = canvasActualData
    .append('svg')
    .attr("id","actualSVG")
    .attr('width',wActualData+m.r+m.l)
    .attr('height',hActualData + m.t + m.b);

var canvasRealActivity = d3.select('#realActivity');
var plotRealActivity = canvasRealActivity
    .append('svg')
    .attr('id', "realSVG")
    .attr('width',wRealActivity+m.r+m.l)
    .attr('height',hRealActivity + m.t + m.b);

var canvasWrongActivity = d3.select('#wrongActivity');
var plotWrongActivity = canvasWrongActivity
    .append('svg')
    .attr('id', "wrongSVG")
    .attr('width',wWrongActivity+m.r+m.l)
    .attr('height',hWrongActivity + m.t + m.b);

//LINE CHART STATUS
var realPosition = 0;
var wrongPosition = 0;
var realRows, wrongRows;

//FORMATS
var formatDate = d3.timeFormat("%B %d, %Y");
var formatTime = d3.timeFormat("%H:%M:%S");
var formatProb = d3.format(".2f");




//load data
var queue = d3_queue.queue()
    .defer(d3.csv, "data/nodelist.csv")
    .defer(d3.csv, "data/edgelist.csv", parseMatrix)
    .defer(d3.csv,'data/dominant_thigh_predictions.csv',parseItems)
    .defer(d3.csv,'data/dominant_thigh_features.csv',parseFeatures)
    .defer(d3.csv,'data/dominant_thigh_raw_data_mini.csv',parseRawData)
    .defer(d3.csv,'data/dominant_thigh_predictions.csv',parsePrediction)
    .await(dataloaded);

function dataloaded (err,file1,matrixData,itemList,features,rawData,prediction){

    //FILTERS FOR ITEMS
    var dataI = itemList;
    var items = crossfilter(dataI);
    var itemsByClass = items.dimension(function(d){return d.class_id});
    var itemsByPrediction = items.dimension(function(d){return d.prediction_id});

    //FILTERS FOR RAW DATA
    var activities = crossfilter(rawData),
        activitiesByDate = activities.dimension(function(d){return d.date}),
        activitiesByParticipant = activities.dimension(function(d){return d.participant});

    //filter for prediction
    var initialPrediction = prediction;
    var predictions = crossfilter(prediction);
    var predictionByResult = predictions.dimension(function(d){return d.result});
    var predictionByClass = predictions.dimension(function(d){return d.class_name});
    var predictionByPrediction = predictions.dimension(function(d){return d.prediction_name});


    //TRY-OUT
    itemClass = itemsByClass.filter(1).top(Infinity);
    itemPrediction = itemsByPrediction.filter(2).top(Infinity);



    /////////// DESCRIPTION FEATURE INTRODUCTION ///////////////

    var startExpl1 = new Date ("Thu Feb 04 2016 14:47:55 GMT-0500 (Eastern Standard Time)"),
        endExpl1 = new Date ("Thu Feb 04 2016 14:48:00 GMT-0500 (Eastern Standard Time)"),
        startExpl2 = new Date ("Thu Feb 04 2016 13:22:50 GMT-0500 (Eastern Standard Time)"),
        endExpl2 = new Date ("Thu Feb 04 2016 13:22:55 GMT-0500 (Eastern Standard Time)");

    feature1 = activitiesByDate.filter([startExpl1,endExpl1]).top(Infinity);

    feature2 = activitiesByDate.filter([startExpl2,endExpl2]).top(Infinity);

    var expl = {
        scaleXExpl1 : d3.scaleTime().domain([startExpl1,endExpl1]).range([0,wExplanation1-10]),
        scaleXExpl2 : d3.scaleTime().domain([startExpl2,endExpl2]).range([0,wExplanation2-10]),
        scaleYExpl1 : d3.scaleLinear().domain([-3,2]).range([hExplanation1,0]),
        scaleYExpl2 : d3.scaleLinear().domain([0,1]).range([hExplanation2,0])
    };

    //AXIS
    var axisXExpl1 = d3.axisBottom()
        .scale(expl.scaleXExpl1)
        .tickFormat(formatTime)
        .tickSize(10);

    var axisYExpl1 = d3.axisLeft()
        .scale(expl.scaleYExpl1)
        .tickSizeInner(-wExplanation1);;

    var axisXExpl2 = d3.axisBottom()
        .scale(expl.scaleXExpl2)
        .tickFormat(formatTime)
        .tickSize(10);

    var axisYExpl2 = d3.axisLeft()
        .scale(expl.scaleYExpl2)
        .tickSizeInner(-wExplanation2);;

    //line
    var lineExplX = d3.line()
        .x(function(d) { return expl.scaleXExpl1(d.date); })
        .y(function(d) { return expl.scaleYExpl1(d.x); });

    var lineExplY = d3.line()
        .x(function(d) { return expl.scaleXExpl1(d.date); })
        .y(function(d) { return expl.scaleYExpl1(d.y); });

    var lineExplZ = d3.line()
        .x(function(d) { return expl.scaleXExpl1(d.date); })
        .y(function(d) { return expl.scaleYExpl1(d.z); });

    var lineExp2X = d3.line()
        .x(function(d) { return expl.scaleXExpl2(d.date); })
        .y(function(d) { return expl.scaleYExpl2(d.x); });

    var lineExp2Y = d3.line()
        .x(function(d) { return expl.scaleXExpl2(d.date); })
        .y(function(d) { return expl.scaleYExpl1(d.y); });

    var lineExp2Z = d3.line()
        .x(function(d) { return expl.scaleXExpl2(d.date); })
        .y(function(d) { return expl.scaleYExpl2(d.z); });


    plotExplanation1.append("g").attr('transform','translate('+ (m.l)+','+ (m.t)+')').attr('class','axis axis-y');
    plotExplanation1.append('g').attr('transform','translate('+ (m.l)+','+ (hExplanation1 + m.t)+')').attr('class','axis axis-x');
    plotExplanation1.append("g").attr("class","explanation explanation1").attr("transform","translate ("+ m.l + "," + m.t +")");
    plotExplanation2.append("g").attr('transform','translate('+ (m.l)+','+ (m.t)+')').attr('class','axis axis-y');
    plotExplanation2.append('g').attr('transform','translate('+ (m.l)+','+ (hExplanation2 + m.t)+')').attr('class','axis axis-x');
    plotExplanation2.append("g").attr("class","explanation explanation2").attr("transform","translate ("+ m.l + "," + m.t +")");


    plotExplanation1.select('.axis-x').transition().call(axisXExpl1);

    plotExplanation1.select('.axis-y').transition().call(axisYExpl1);

    var feature1plot = plotExplanation1.select(".explanation1");
    var feature2plot = plotExplanation2.select(".explanation2");

    feature1plot.append("path")
        .attr("class", "line acceleration-x")
        .attr("d", lineExplX(feature1));

    feature1plot.append("path")
        .attr("class", "line acceleration-y")
        .attr("d", lineExplY(feature1));

    feature1plot.append("path")
        .attr("class", "line acceleration-z")
        .attr("d", lineExplZ(feature1));

    plotExplanation2.select('.axis-x').transition().call(axisXExpl2);

    plotExplanation2.select('.axis-y').transition().call(axisYExpl2);

    feature2plot.append("path")
        .attr("class", "line acceleration-x")
        .attr("d", lineExp2X(feature2));

    feature2plot.append("path")
        .attr("class", "line acceleration-y")
        .attr("d", lineExp2Y(feature2));

    feature2plot.append("path")
        .attr("class", "line acceleration-z")
        .attr("d", lineExp2Z(feature2));

    // draw legend
    legendData1 = [{type:"Acceleration X", color:"#fc8d62"},{type:"Acceleration Y", color:"#8da0cb"},{type:"Acceleration Z", color:"#66c2a5"} ];
    scaleColor2 = d3.scaleOrdinal().domain(["Acceleration X","Acceleration Y","Acceleration Z"]).range(["#fc8d62","#8da0cb","#66c2a5"]);

    var legend = d3.select('#legendFeature').append('svg')
        .attr('width', wExplanation1)
        .attr("height",50)
        .append("g")
        .attr("class", "legend")
        .attr("transform","translate("+(5)+","+ m.t+")")
        .selectAll('.legendElement').data(legendData1).enter();

    legend
        .append('circle').attr('class', 'legendElement')
        .attr('cx', function (d, i) {return i * 150;})
        .attr('cy', 6)
        .attr('r', 5)
        .style('fill', function (d) {return scaleColor2(d.type);})
        .style("stroke","none");


    legend.append("text")
        .attr('class', 'legendElement')
        .text(function (d) {return d.type})
        .attr("x", function (d, i) {return 15 + (i * 150)})
        .attr('y', 10);

    var legend2 = d3.select('#legendFeature2').append('svg')
        .attr('width', wExplanation1)
        .attr("height",30)
        .append("g")
        .attr("class", "legend")
        .attr("transform","translate("+(5)+","+ m.t+")")
        .selectAll('.legendElement').data(legendData1).enter();

    legend2
        .append('circle').attr('class', 'legendElement')
        .attr('cx', function (d, i) {return i * 150;})
        .attr('cy', 6)
        .attr('r', 5)
        .style('fill', function (d) {return scaleColor2(d.type);})
        .style("stroke","none");


    legend2.append("text")
        .attr('class', 'legendElement')
        .text(function (d) {return d.type})
        .attr("x", function (d, i) {return 15 + (i * 150)})
        .attr("y",10);


    ////////MATRIX//////////////////////
    createAdjacencyMatrix(matrixData);
    var marginMatrixLeft = 200;
    var marginMatrixTop = 170;

    function createAdjacencyMatrix(matrixData,i) {

        // draw legend
        legendMatrix = [{type:"Correct Predictions", color:"#8da0cb"},{type:"Incorrect Predictions", color:"#fc8d62"}];

        var legendMatrixPlot = d3.select('#matrixLegend').append('svg')
            .attr('width', wMatrix)
            .attr("height",30)
            .append("g")
            .attr("class", "legend")
            .attr("transform","translate("+(5)+","+ m.t+")")
            .selectAll('.legendElement').data(legendMatrix).enter();

        legendMatrixPlot
            .append('rect').attr('class', 'legendElement')
            .attr('x', function (d, i) {return i * 200;})
            .attr('y', 0)
            .attr('width', 20)
            .attr('height', 10)
            .style('fill', function (d) {return d.color;})
            .style("stroke","none");


        legendMatrixPlot.append("text")
            .attr('class', 'legendElement')
            .text(function (d) {return d.type})
            .attr("x", function (d, i) {return 25 + (i * 200)})
            .attr('y', 10);


        var weightExtent = d3.extent(matrixData, function (d) {return +d.weight});

        var axisNames = ["biking outdoor","biking stationary at 300 KPM/min","folding pile of towels","frisbee","in elevator going up","jumping jacks","lying on back","on escalator going up","running at 5.5 mph 5% grade on treadmill","shelf reloading","shelf unloading","sitting","standing","sweeping","vending machine","walking at 1 mph","walking at 2 mph","walking at 3 mph","walking at 3.5 mph","walking outdoor","walking stairs down","walking stairs up"];

        var marginMatrixLeft =200;
        var marginMatrixTop = 190;
        var marginMatrixRight =150;

        var nameScaleX = d3.scaleBand().domain(axisNames).rangeRound([0,(wMatrix-marginMatrixLeft-marginMatrixRight)]);
        //var nameScaleXrect = d3.scaleLinear().domain(matrixX).range([marginMatrixLeft,(wMatrix-marginMatrixRight-38)]);

        var nameScaleY = d3.scaleBand().domain(axisNames).rangeRound([2,hMatrix-150]);
        //var nameScaleYrect = d3.scaleLinear().domain(matrixX).range([marginMatrixTop,hMatrix]);
        var opacityScale = d3.scaleLinear().domain(weightExtent).range([0.3,1]);


        plotMatrix.append("g").attr('transform','translate('+ (marginMatrixLeft)+','+ (marginMatrixTop)+')').attr('class','axis axis-y');
        plotMatrix.append('g').attr('transform','translate('+ (marginMatrixLeft+10)+','+(marginMatrixTop)+')').attr('class','axis axis-x');
        plotMatrix.append('g').attr('transform','translate('+ (marginMatrixLeft+10)+','+(10)+')').attr('class','legend class-axis-x');
        plotMatrix.append('g').attr('transform','translate('+ (0)+','+(marginMatrixTop)+')').attr('class','legend class-axis-y');
        plotMatrix.append("g").attr('class','adjmatrix').attr('transform','translate('+ (marginMatrixLeft+10)+','+(marginMatrixTop)+')');


        var sizeW = (wMatrix-marginMatrixLeft-marginMatrixRight-38)/(axisNames.length);
        var sizeH = (hMatrix-marginMatrixTop)/(axisNames.length);
        //var matrixY = matrix.map(function)

        xAxis = d3.axisTop().scale(nameScaleX).tickSize(4);
        yAxis = d3.axisLeft().scale(nameScaleY).tickSize(4);

        plotMatrix.select(".class-axis-x").append("text").text("Prediction");
        plotMatrix.select(".class-axis-x").append("line").attr("x1",0).attr("y1",5).attr("x2",(wMatrix-marginMatrixLeft-marginMatrixRight)).attr("y2",5);
        plotMatrix.select(".class-axis-y").append("text").text("True activity");
        plotMatrix.select(".class-axis-y").append("line").attr("x1",0).attr("y1",5).attr("x2",(marginMatrixLeft)).attr("y2",5);

        plotMatrix.select('.axis-x').transition().duration(100).call(xAxis)
            .selectAll("text").style("text-anchor", "start")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
            });

        plotMatrix.select('.axis-y').transition().duration(100).call(yAxis);

        drawMatrix = plotMatrix.select(".adjmatrix");

        drawMatrix
            .attr("id", "adjacencyG")
            .selectAll("rect")
            .data(matrixData)
            .enter()
            .append("rect")
            .attr("class",function(d){return d.source+"-"+ d.target})
            .attr("width", sizeW)
            .attr("height", sizeH)
            .attr("x", function(d,i){
                return nameScaleX(d.source)})
            .attr("y", function(d){return nameScaleY(d.target)})
            .style("fill",function(d){
                if (d.source != d.target){return "#fc8d62"
                }if(d.source == d.target){return "#8da0cb"}
                if(d.weight == 0){return "#f7f7f7"}
            })
            .style("fill-opacity",0)
            .on('mouseover', function(d){
                d3.select(this).style("fill-opacity", 1);
            })
            .on('mouseout', function(d){return d3.select(this).style("fill-opacity", function (d) {
                if (d.weight==0 || d.weight==NaN){return 0}
                else {return opacityScale(d.weight) }
            })})
            .on("click",drawItems)
            .transition()
            .duration(500)
            .style("fill-opacity", function (d) {
                if (d.weight==0 || d.weight==NaN){return 0}
                else {return opacityScale(d.weight) }
            })
            .on("start",function(d){
                drawMatrix.append("text")
                    .text(d.weight)
                    .attr("x", nameScaleX(d.source)+sizeW/2)
                    .attr("y", nameScaleY(d.target)+sizeH/2+3)
                    .style("text-anchor","middle").attr("class","textMatrix")
                    .on("click",drawItems);

            });

        d3.select(".loading").style("display","none");

        function drawItems (d){

            resetLineCharts();

            //display table
            d3.select("#table-wrapper").style("opacity",1)

            predictionByClass.filterAll().top(Infinity);
            predictionByPrediction.filterAll().top(Infinity);

            var className = d.target; // Gets the first part
            var predictionName = d.source;  // Gets the text part
            var label = predictionByClass.filter(className).top(Infinity);
            var prediction = predictionByPrediction.filter(predictionName).top(Infinity);

            //var prediction IS THE LIST OF ITEMS

            //////////////// ITEMS //////////////////////
            prediction.sort(function(a,b){return b.prediction_prob - a.prediction_prob});

            d3.select("#featureList").select("table").remove();

            var flTimesTable = d3.select("#featureList")
                .append("table");

            //column definitions
            var columns = [
                { head: 'Date', cl: 'title' },
                { head: 'Start Time', cl: 'center'},
                { head: 'Stop time', cl: 'center'},
                { head: 'Class Label', cl: 'center'},
                { head: 'Prediction', cl: 'num'},
                { head: 'Probability', cl: 'num'}
            ];


            flTimesTable
                .append("td")
                .attr('class', 'item title col-md-1')
                .html("Date");

            flTimesTable
                .append("td")
                .attr('class', 'item title col-md-1')
                .html("Start time");

            flTimesTable
                .append("td")
                .attr('class', 'item title col-md-1')
                .html("Stop time");

            flTimesTable
                .append("td")
                .attr('class', 'item title col-md-1')
                .html("Participant");

            flTimesTable
                .append("td")
                .attr('class', 'item title col-md-1')
                .html("Real Activity");

            flTimesTable
                .append("td")
                .attr('class', 'item title col-md-1')
                .html("Prediction");

            flTimesTable
                .append("td")
                .attr('class', 'item title col-md-1')
                .html("Probability");

            flTimesTr = flTimesTable
                .selectAll("tr")
                .data(prediction)
                .enter()
                .append("tr");

            flTimesTr
                .append("td")
                .attr('class', function(d,i){return 'item date tableid'+i})
                .html(function(d){return formatDate(d.start)})
                .on("mouseover",mouseOverTable)
                .on("mouseleave",mouseOutTable)
                .on("click",itemClick);

            flTimesTr
                .append("td")
                .attr('class', function(d,i){return 'item time tableid'+i})
                .html(function(d){return formatTime(d.start)})
                .on("mouseover",mouseOverTable)
                .on("mouseleave",mouseOutTable)
                .on("click",itemClick);

            flTimesTr
                .append("td")
                .attr('class', function(d,i){return 'item time tableid'+i})
                .html(function(d){return formatTime(d.stop)})
                .on("mouseover",mouseOverTable)
                .on("mouseleave",mouseOutTable)
                .on("click",itemClick);

            flTimesTr
                .append("td")
                .attr('class', function(d,i){return 'item time tableid'+i})
                .html(function(d){return (d.participant)})
                .on("mouseover",mouseOverTable)
                .on("mouseleave",mouseOutTable)
                .on("click",itemClick);

            flTimesTr
                .append("td")
                .attr('class',function(d,i){return 'item class tableid'+i})
                .html(function(d){return d.class_name})
                .on("mouseover",mouseOverTable)
                .on("mouseleave",mouseOutTable)
                .on("click",itemClick);

            flTimesTr
                .append("td")
                .attr('class', function(d,i){return 'item prediction tableid'+i})
                .html(function(d){return d.prediction_name})
                .on("mouseover",mouseOverTable)
                .on("mouseleave",mouseOutTable)
                .on("click",itemClick);


            flTimesTr
                .append("td")
                .attr('class', function(d,i){return 'item probability tableid'+i})
                .html(function(d){return formatProb(d.prediction_prob)})
                .on("mouseover",mouseOverTable)
                .on("mouseleave",mouseOutTable)
                .on("click",itemClick);

            flTimesTr.exit().remove();

            function mouseOverTable(d,i){
                d3.selectAll(".tableid"+i).style("background-color","#f7f7f7")

            }

            function mouseOutTable(d,i){
                d3.selectAll(".item").style("background-color","rgb(253, 253, 253)")
            }

            function resetLineCharts() {
                resetRealSVG();
                resetWrongSVG();
                resetActualSVG();
            }

            function resetRealSVG() {
                d3.select("#realSVG").remove();
                plotRealActivity = canvasRealActivity
                    .append('svg')
                    .attr('id', "realSVG")
                    .attr('width',wRealActivity+m.r+m.l)
                    .attr('height',hRealActivity + m.t + m.b);
                console.log("Reset Real");
                d3.select("#legendRealActivity").html("");
                realPosition = 0;

            }

            function resetWrongSVG() {
                d3.select("#wrongSVG").remove();
                plotWrongActivity = canvasWrongActivity
                    .append('svg')
                    .attr('id', "wrongSVG")
                    .attr('width',wWrongActivity+m.r+m.l)
                    .attr('height',hWrongActivity + m.t + m.b);
                console.log("Reset Wrong");
                d3.select("#legendWrongActivity").html("");
                wrongPosition = 0;
            }

            function resetActualSVG() {
                d3.select("#actualSVG").remove();
                plotActualData = canvasActualData
                    .append('svg')
                    .attr('id', "actualSVG")
                    .attr('width',wActualData+m.r+m.l)
                    .attr('height',hActualData + m.t + m.b);
                console.log("Reset Actual");
                d3.select("#legendActualActivity").html("");
            }

            //ON CLICK DRAW
            function itemClick (d,i){


                //show items when clicked
                d3.select("#plots").style("opacity",1);


                var thisStart = d.start;
                var thisStop = d.stop;
                var thisParticipant = d.participant;
                //Far
                thisRealActivityID = d.class,
                    thisWrongActivityID = d.prediction;

                var thisRealActivityName = d.class_name;
                var thisWrongActivityName = d.prediction_name;

                realPosition = 0;
                wrongPosition = 0;

                //FAR DON'T DELETE THIS COMMENT
                //REMEMBER TO REMOVE EACH SVG BEFORE REDRAWING

                //Far SET THE NAMES OF THE CHARTS ACCORDING TO ACTIVITY
                d3.select("#realActivityName").html("Samples of "+d.class_name);
                d3.select("#wrongActivityName").html("Samples of "+d.prediction_name);

                //FILTERS FOR RAW DATA
                var activities = crossfilter(rawData),
                    activitiesByDate = activities.dimension(function(d){return d.date}),
                    activitiesByParticipant = activities.dimension(function(d){return d.participant});

                activitiesByDate.filter([thisStart,thisStop]).top(Infinity);
                var rawActivity = activitiesByParticipant.filter(thisParticipant).top(Infinity);

                var max;
                var min;

                var extentX = d3.extent(rawActivity, function (d) {return d.x});
                var extentY = d3.extent(rawActivity, function (d) {return d.y});
                var extentZ = d3.extent(rawActivity, function (d) {return d.z});

                //MAX AND MIN IN AXIS
                min = Math.min(extentX[0], extentY[0]);
                if(extentZ[0] < min){ min = extentZ[0];}
                min = min - 0.4;

                max = Math.max(extentX[1], extentY[1]);
                if(extentZ[1] > max){ max = extentZ[1];}
                max = max + 0.4;

                var distanceAxis = 10;

                var dataScales = {
                    scaleXActualData : d3.scaleTime().domain([thisStart,thisStop]).range([0,(wActualData)]),
                    scaleYActualData : d3.scaleLinear().domain([min,max]).range([(hActualData - m.t),0]),
                };

                //AXIS
                var axisXActualData = d3.axisBottom()
                    .scale(dataScales.scaleXActualData)
                    .tickFormat(formatTime);

                var axisYActualData = d3.axisLeft()
                    .scale(dataScales.scaleYActualData)
                    .tickSizeInner(-wActualData);;

                var lineActualDataX = d3.line()
                    .x(function(d) { return dataScales.scaleXActualData(d.date); })
                    .y(function(d) { return dataScales.scaleYActualData(d.x); });

                var lineActualDataY = d3.line()
                    .x(function(d) { return dataScales.scaleXActualData(d.date); })
                    .y(function(d) { return dataScales.scaleYActualData(d.y); });


                var lineActualDataZ = d3.line()
                    .x(function(d) { return dataScales.scaleXActualData(d.date); })
                    .y(function(d) { return dataScales.scaleYActualData(d.z); });

                plotActualData.append("g").attr('transform','translate('+ (m.l)+','+ (m.t)+')').attr('class','axis axis-y');
                plotActualData.append('g').attr('transform','translate('+ (m.l)+','+ (hActualData - m.t)+')').attr('class','axis axis-x');
                plotActualData.append("g").attr("class","explanation actualDataClass").attr("transform","translate ("+ m.l + "," + m.t +")");

                plotActualData.select('.axis-x').transition().duration(500).call(axisXActualData)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-65)"
                    });

                plotActualData.select('.axis-y').transition().duration(500).call(axisYActualData);

                //Append line elements

                plotActualData.select(".explanation").append('path').attr('class','explanation acceleration-x');
                plotActualData.select(".explanation").append('path').attr('class','explanation acceleration-y');
                plotActualData.select(".explanation").append('path').attr('class','explanation acceleration-z');

                plotActualData.select(".acceleration-x")
                    .datum(rawActivity)
                    .transition()
                    .duration(500)
                    .attr("d", lineActualDataX);

                plotActualData.select(".acceleration-y")
                    .datum(rawActivity)
                    .transition()
                    .duration(500)
                    .attr("d", lineActualDataY);

                plotActualData.select(".acceleration-z")
                    .datum(rawActivity)
                    .transition()
                    .duration(500)
                    .attr("d", lineActualDataZ);


                d3.select("#legendActualActivity").html("User: " + thisParticipant);

                activitiesByDate.filterAll().top(Infinity);
                activitiesByParticipant.filterAll().top(Infinity);

                //var distanceAxis = 10;


                //Far
                //GET MAXIMUM 10 ROWS THAT HAVE REAL REALACTIVY DATA
                function checkRealItems(initialPrediction) {
                    //console.log("Real"+initialPrediction.class+" - "+initialPrediction.prediction+" - "+thisRealActivityID);

                    if((initialPrediction.class == initialPrediction.prediction) && ( initialPrediction.class == thisRealActivityID)){
                        return initialPrediction;
                    }
                }

                realRows = initialPrediction.filter(checkRealItems);

                if(realRows.length > 10)
                {
                    realRows.splice(10);
                }


                //GET MAXIMUM 10 ROWS THAT HAVE WRONG PREDICTED DATA
                function checkWrongItems(initialPrediction) {
                    //console.log("Wrong"+initialPrediction.class+" - "+initialPrediction.prediction+" - "+thisWrongActivityID);

                    if((initialPrediction.class == initialPrediction.prediction) && (initialPrediction.class == thisWrongActivityID)){
                        return initialPrediction;
                    }
                }

                wrongRows = initialPrediction.filter(checkWrongItems);

                if(wrongRows.length > 10)
                {
                    wrongRows.splice(10);
                }

                function sortByDateAscending(a, b) {
                    // Dates will be cast to numbers automagically:
                    return a.date - b.date;
                }

                //GET THE FIRST REAL SAMPLE TO BE PLOTED FIRST
                if(realRows.length != 0)
                {
                    activitiesByDate.filterAll().top(Infinity);
                    thisParticipant = realRows[realPosition].participant;
                    thisStart = realRows[realPosition].start;
                    thisStop = realRows[realPosition].stop;
                    realActivitySamples = activitiesByDate.filter([thisStart,thisStop]).top(Infinity);

                    //console.log("start "+thisStart+" - end "+thisStoprealActivitySamples);


                    //Far Transferred code inside
                    var maxActivity;
                    var minActivity;

                    realActivitySamples = realActivitySamples.sort(sortByDateAscending);

                    var dateAct1 = realActivitySamples[0].date;
                    var dateAct2 = realActivitySamples[realActivitySamples.length-1].date;

                    var extentXAct = d3.extent(realActivitySamples, function (d) {
                        console.log(d)
                        return d.x});
                    var extentYAct = d3.extent(realActivitySamples, function (d) {return d.y});
                    var extentZAct = d3.extent(realActivitySamples, function (d) {return d.z});


                    //MAX AND MIN IN AXIS
                    minActivity = Math.min(extentXAct[0], extentYAct[0]);
                    if(extentZAct[0] < minActivity){ minActivity = extentZAct[0];}
                    minActivity = minActivity - 0.4;

                    maxActivity = Math.max(extentXAct[1], extentYAct[1]);
                    if(extentZAct[1] > maxActivity){ maxActivity = extentZAct[1];}
                    maxActivity = maxActivity + 0.4;


                    var dataScales2 = {
                        scaleXRealData : d3.scaleTime().domain([dateAct1,dateAct2]).range([0,(wRealActivity)]),
                        scaleYRealData : d3.scaleLinear().domain([minActivity,maxActivity]).range([(hRealActivity - m.t),0])
                    };


                    //////////REAL ACTIVITY
                    var axisXActualData = d3.axisBottom()
                        .scale(dataScales2.scaleXRealData)
                        .tickFormat(formatTime);

                    var axisYActualData = d3.axisLeft()
                        .scale(dataScales2.scaleYRealData)
                        .tickSizeInner(-wRealActivity);

                    var lineActualDataX = d3.line()
                        .x(function(d) { return dataScales2.scaleXRealData(d.date); })
                        .y(function(d) { return dataScales2.scaleYRealData(d.x); });

                    var lineActualDataY = d3.line()
                        .x(function(d) { return dataScales2.scaleXRealData(d.date); })
                        .y(function(d) { return dataScales2.scaleYRealData(d.y); });


                    var lineActualDataZ = d3.line()
                        .x(function(d) { return dataScales2.scaleXRealData(d.date); })
                        .y(function(d) { return dataScales2.scaleYRealData(d.z); });

                    plotRealActivity.append("g").attr('transform','translate('+ (m.l)+','+ (m.t)+')').attr('class','axis axis-y');
                    plotRealActivity.append('g').attr('transform','translate('+ (m.l)+','+ (hRealActivity  - m.t )+')').attr('class','axis axis-x');
                    plotRealActivity.append("g").attr("class","explanation realDataClass").attr("transform","translate ("+ m.l + "," + m.t +")");

                    plotRealActivity.select('.axis-x').transition().duration(500).call(axisXActualData)
                        .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                        });

                    plotRealActivity.select('.axis-y').transition().duration(500).call(axisYActualData);

                    //Append line elements
                    plotRealActivity.select(".explanation").append('path').attr('class','explanation acceleration-x');
                    plotRealActivity.select(".explanation").append('path').attr('class','explanation acceleration-y');
                    plotRealActivity.select(".explanation").append('path').attr('class','explanation acceleration-z');


                    plotRealActivity.select(".acceleration-x")
                        .datum(realActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineActualDataX);

                    plotRealActivity.select(".acceleration-y")
                        .datum(realActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineActualDataY);

                    plotRealActivity.select(".acceleration-z")
                        .datum(realActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineActualDataZ);

                    d3.select("#legendRealActivity").html("User: " + thisParticipant);


                }else{
                    realActivitySamples =[];
                    d3.select("#legendRealActivity").html("Not found any samples for "+thisRealActivityName+"!");
                }

                //GET THE FIRST WRONG SAMPLE TO BE PLOTED FIRST
                if(wrongRows.length != 0)
                {
                    thisParticipant = wrongRows[wrongPosition].participant;
                    thisStart = wrongRows[wrongPosition].start;
                    thisStop = wrongRows[wrongPosition].stop;
                    wrongActivitySamples = activitiesByDate.filter([thisStart,thisStop]).top(Infinity);

                    var maxPrediction;
                    var minPrediction;

                    wrongActivitySamples = wrongActivitySamples.sort(sortByDateAscending);

                    var datePred1 = wrongActivitySamples[0].date;
                    var datePred2 = wrongActivitySamples[wrongActivitySamples.length-1].date;

                    var extentXPred = d3.extent(wrongActivitySamples, function (d) {return d.x});
                    var extentYPred = d3.extent(wrongActivitySamples, function (d) {return d.y});
                    var extentZPred = d3.extent(wrongActivitySamples, function (d) {return d.z});

                    //MAX AND MIN IN AXIS
                    minPrediction = Math.min(extentXPred[0], extentYPred[0]);
                    if(extentZPred[0] < minPrediction){ minPrediction = extentZPred[0];}
                    minPrediction = minPrediction - 0.4;

                    maxPrediction = Math.max(extentXPred[1], extentYPred[1]);
                    if(extentZPred[1] > maxPrediction){ maxPrediction = extentZPred[1];}
                    maxPrediction = maxPrediction + 0.4;


                    var dataScales2 = {
                        scaleWrongActivityX : d3.scaleTime().domain([datePred1,datePred2]).range([0,(wActualData)]),
                        scaleWrongActivityY : d3.scaleLinear().domain([minPrediction,maxPrediction]).range([(hActualData - m.t),0])
                    };

                    //////////WRONG ACTIVITY
                    var axisXWrongData = d3.axisBottom()
                        .scale(dataScales2.scaleWrongActivityX)
                        .tickFormat(formatTime);

                    var axisYWrongData = d3.axisLeft()
                        .scale(dataScales2.scaleWrongActivityY)
                        .tickSizeInner(-wWrongActivity);

                    var lineWrongDataX = d3.line()
                        .x(function(d) { return dataScales2.scaleWrongActivityX(d.date); })
                        .y(function(d) { return dataScales2.scaleWrongActivityY(d.x); });

                    var lineWrongDataY = d3.line()
                        .x(function(d) { return dataScales2.scaleWrongActivityX(d.date); })
                        .y(function(d) { return dataScales2.scaleWrongActivityY(d.y); });


                    var lineWrongDataZ = d3.line()
                        .x(function(d) { return dataScales2.scaleWrongActivityX(d.date); })
                        .y(function(d) { return dataScales2.scaleWrongActivityY(d.z); });

                    plotWrongActivity.append("g").attr('transform','translate('+ (m.l)+','+ (m.t)+')').attr('class','axis axis-y');
                    plotWrongActivity.append('g').attr('transform','translate('+ (m.l)+','+ (hWrongActivity - m.t)+')').attr('class','axis axis-x');
                    plotWrongActivity.append("g").attr("class","explanation realDataClass").attr("transform","translate ("+ m.l + "," + m.t +")");

                    plotWrongActivity.select('.axis-x').transition().duration(500).call(axisXActualData)
                        .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                        });

                    plotWrongActivity.select('.axis-y').transition().duration(500).call(axisYActualData);

                    //Append line elements
                    plotWrongActivity.select(".explanation").append('path').attr('class','explanation acceleration-x');
                    plotWrongActivity.select(".explanation").append('path').attr('class','explanation acceleration-y');
                    plotWrongActivity.select(".explanation").append('path').attr('class','explanation acceleration-z');

                    plotWrongActivity.select(".acceleration-x")
                        .datum(wrongActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineWrongDataX);

                    plotWrongActivity.select(".acceleration-y")
                        .datum(wrongActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineWrongDataY);

                    plotWrongActivity.select(".acceleration-z")
                        .datum(wrongActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineWrongDataZ);

                    d3.select("#legendWrongActivity").html("User: " + thisParticipant);

                }else{
                    wrongActivitySamples=[];
                    d3.select("#legendRealActivity").html("Not found any samples for "+thisWrongActivityName+"!");
                }

                d3.select(".loading").remove;
                //FAR
                SetSamplePlots();
            }//itemClick

            //FAR
            function SetSamplePlots(){
                d3.select("#prevReal").on("click", realLeftClick);
                d3.select("#nextReal").on("click", realRightClick);
                d3.select("#prevWrong").on("click", wrongLeftClick);
                d3.select("#nextWrong").on("click", wrongRightClick);
            }

            function realLeftClick() {
                if(realPosition > 0)
                {
                    //REMOVE PREVIOUS SVG AND REDRAW NEW ONE
                    d3.select("#realSVG").remove();
                    var plotRealActivity = canvasRealActivity
                        .append('svg')
                        .attr('id', "realSVG")
                        .attr('width',wRealActivity+m.r+m.l)
                        .attr('height',hRealActivity + m.t + m.b);

                    realPosition = realPosition + 1;
                    var thisParticipant = realRows[realPosition].participant;
                    var thisStart = realRows[realPosition].start;
                    var thisStop = realRows[realPosition].stop;
                    var realActivitySamples = activitiesByDate.filter([thisStart,thisStop]).top(Infinity);


                    var maxActivity;
                    var minActivity;

                    function sortByDateAscending(a, b) {
                        // Dates will be cast to numbers automagically:
                        return a.date - b.date;
                    }

                    realActivitySamples = realActivitySamples.sort(sortByDateAscending);

                    var dateAct1 = realActivitySamples[0].date;
                    var dateAct2 = realActivitySamples[realActivitySamples.length-1].date;

                    var extentXAct = d3.extent(realActivitySamples, function (d) {return d.x});
                    var extentYAct = d3.extent(realActivitySamples, function (d) {return d.y});
                    var extentZAct = d3.extent(realActivitySamples, function (d) {return d.z});


                    //MAX AND MIN IN AXIS
                    minActivity = Math.min(extentXAct[0], extentYAct[0]);
                    if(extentZAct[0] < minActivity){ minActivity = extentZAct[0];}
                    minActivity = minActivity - 0.4;

                    maxActivity = Math.max(extentXAct[1], extentYAct[1]);
                    if(extentZAct[1] > maxActivity){ maxActivity = extentZAct[1];}
                    maxActivity = maxActivity + 0.4;


                    var dataScales2 = {
                        scaleXRealData : d3.scaleTime().domain([dateAct1,dateAct2]).range([0,(wActualData)]),
                        scaleYRealData : d3.scaleLinear().domain([minActivity,maxActivity]).range([(hActualData- m.t-10),0])
                    };


                    //////////REAL ACTIVITY
                    var axisXActualData = d3.axisBottom()
                        .scale(dataScales2.scaleXRealData)
                        .tickFormat(formatTime);

                    var axisYActualData = d3.axisLeft()
                        .scale(dataScales2.scaleYRealData)
                        .tickSizeInner(-wRealActivity);

                    var lineActualDataX = d3.line()
                        .x(function(d) { return dataScales2.scaleXRealData(d.date); })
                        .y(function(d) { return dataScales2.scaleYRealData(d.x); });

                    var lineActualDataY = d3.line()
                        .x(function(d) { return dataScales2.scaleXRealData(d.date); })
                        .y(function(d) { return dataScales2.scaleYRealData(d.y); });


                    var lineActualDataZ = d3.line()
                        .x(function(d) { return dataScales2.scaleXRealData(d.date); })
                        .y(function(d) { return dataScales2.scaleYRealData(d.z); });

                    plotRealActivity.append("g").attr('transform','translate('+ (m.l)+','+ (m.t)+')').attr('class','axis axis-y');
                    plotRealActivity.append('g').attr('transform','translate('+ (m.l)+','+ (hRealActivity - m.t)+')').attr('class','axis axis-x');
                    plotRealActivity.append("g").attr("class","explanation realDataClass").attr("transform","translate ("+ m.l + "," + m.t +")");

                    plotRealActivity.select('.axis-x').transition().duration(500).call(axisXActualData)
                        .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                        });

                    plotRealActivity.select('.axis-y').transition().duration(500).call(axisYActualData);

                    //Append line elements
                    plotRealActivity.select(".explanation").append('path').attr('class','explanation acceleration-x');
                    plotRealActivity.select(".explanation").append('path').attr('class','explanation acceleration-y');
                    plotRealActivity.select(".explanation").append('path').attr('class','explanation acceleration-z');

                    plotRealActivity.select(".acceleration-x")
                        .datum(realActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineActualDataX);

                    plotRealActivity.select(".acceleration-y")
                        .datum(realActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineActualDataY);

                    plotRealActivity.select(".acceleration-z")
                        .datum(realActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineActualDataZ);

                    d3.select("#legendRealActivity").html("User: " + thisParticipant);

                }
            }

            function realRightClick() {
                if(realPosition < 9)
                {
                    d3.select("#realSVG").remove();
                    var plotRealActivity = canvasRealActivity
                        .append('svg')
                        .attr('id', "realSVG")
                        .attr('width',wRealActivity+m.r+m.l)
                        .attr('height',hRealActivity + m.t + m.b);

                    realPosition = realPosition + 1;
                    var thisParticipant = realRows[realPosition].participant;
                    var thisStart = realRows[realPosition].start;
                    var thisStop = realRows[realPosition].stop;


                    var maxActivity;
                    var minActivity;

                    function sortByDateAscending(a, b) {
                        // Dates will be cast to numbers automagically:
                        return a.date - b.date;
                    }

                    realActivitySamples = realActivitySamples.sort(sortByDateAscending);

                    var dateAct1 = realActivitySamples[0].date;
                    var dateAct2 = realActivitySamples[realActivitySamples.length-1].date;

                    var extentXAct = d3.extent(realActivitySamples, function (d) {return d.x});
                    var extentYAct = d3.extent(realActivitySamples, function (d) {return d.y});
                    var extentZAct = d3.extent(realActivitySamples, function (d) {return d.z});


                    //MAX AND MIN IN AXIS
                    minActivity = Math.min(extentXAct[0], extentYAct[0]);
                    if(extentZAct[0] < minActivity){ minActivity = extentZAct[0];}
                    minActivity = minActivity - 0.4;

                    maxActivity = Math.max(extentXAct[1], extentYAct[1]);
                    if(extentZAct[1] > maxActivity){ maxActivity = extentZAct[1];}
                    maxActivity = maxActivity + 0.4;


                    var dataScales2 = {
                        scaleXRealData : d3.scaleTime().domain([dateAct1,dateAct2]).range([0,(wActualData)]),
                        scaleYRealData : d3.scaleLinear().domain([minActivity,maxActivity]).range([(hActualData),0])
                    };


                    //////////REAL ACTIVITY
                    var axisXActualData = d3.axisBottom()
                        .scale(dataScales2.scaleXRealData)
                        .tickFormat(formatTime);

                    var axisYActualData = d3.axisLeft()
                        .scale(dataScales2.scaleYRealData)
                        .tickSizeInner(-wRealActivity);

                    var lineActualDataX = d3.line()
                        .x(function(d) { return dataScales2.scaleXRealData(d.date); })
                        .y(function(d) { return dataScales2.scaleYRealData(d.x); });

                    var lineActualDataY = d3.line()
                        .x(function(d) { return dataScales2.scaleXRealData(d.date); })
                        .y(function(d) { return dataScales2.scaleYRealData(d.y); });


                    var lineActualDataZ = d3.line()
                        .x(function(d) { return dataScales2.scaleXRealData(d.date); })
                        .y(function(d) { return dataScales2.scaleYRealData(d.z); });

                    plotRealActivity.append("g").attr('transform','translate('+ (m.l)+','+ (m.t)+')').attr('class','axis axis-y');
                    plotRealActivity.append('g').attr('transform','translate('+ (m.l)+','+ (hRealActivity - m.t -20)+')').attr('class','axis axis-x');
                    plotRealActivity.append("g").attr("class","explanation realDataClass").attr("transform","translate ("+ m.l + "," + m.t +")");

                    plotRealActivity.select('.axis-x').transition().duration(500).call(axisXActualData)
                        .selectAll("text")
                        .style("text-anchor", "end")
                        //.attr("dx", "-.8em")
                        //.attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                        });

                    plotRealActivity.select('.axis-y').transition().duration(500).call(axisYActualData);

                    //Append line elements
                    plotRealActivity.select(".explanation").append('path').attr('class','explanation acceleration-x');
                    plotRealActivity.select(".explanation").append('path').attr('class','explanation acceleration-y');
                    plotRealActivity.select(".explanation").append('path').attr('class','explanation acceleration-z');

                    plotRealActivity.select(".acceleration-x")
                        .datum(realActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineActualDataX);

                    plotRealActivity.select(".acceleration-y")
                        .datum(realActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineActualDataY);

                    plotRealActivity.select(".acceleration-z")
                        .datum(realActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineActualDataZ);

                    d3.select("#legendRealActivity").html("User: " + thisParticipant);
                }
            }

            function wrongLeftClick() {
                if(wrongPosition > 0)
                {
                    d3.select("#wrongSVG").remove();
                    var plotWrongActivity = canvasWrongActivity
                        .append('svg')
                        .attr('id', "wrongSVG")
                        .attr('width',wWrongActivity+m.r+m.l)
                        .attr('height',hWrongActivity + m.t + m.b);

                    wrongPosition = wrongPosition - 1;
                    var thisStart = wrongRows[wrongPosition].start;
                    var thisStop = wrongRows[wrongPosition].stop;
                    var thisParticipant = wrongRows[wrongPosition].participant;
                    var wrongActivitySamples = activitiesByDate.filter([thisStart,thisStop]).top(Infinity);



                    //plot

                    function sortByDateAscending(a, b) {
                        // Dates will be cast to numbers automagically:
                        return a.date - b.date;
                    }

                    wrongActivitySamples = wrongActivitySamples.sort(sortByDateAscending);


                    var datePred1 = wrongActivitySamples[0].date;
                    var datePred2 = wrongActivitySamples[realActivitySamples.length-1].date;



                    var maxPrediction;
                    var minPrediction;

                    var extentXPred = d3.extent(wrongActivitySamples, function (d) {return d.x});
                    var extentYPred = d3.extent(wrongActivitySamples, function (d) {return d.y});
                    var extentZPred = d3.extent(wrongActivitySamples, function (d) {return d.z});

                    //MAX AND MIN IN AXIS
                    minPrediction = Math.min(extentXPred[0], extentYPred[0]);
                    if(extentZPred[0] < minPrediction){ minPrediction = extentZPred[0];}
                    minPrediction = minPrediction - 0.4;

                    maxPrediction = Math.max(extentXPred[1], extentYPred[1]);
                    if(extentZPred[1] > maxPrediction){ maxPrediction = extentZPred[1];}
                    maxPrediction = maxPrediction + 0.4;

                    var dataScales2 = {
                        scaleWrongActivityX : d3.scaleTime().domain([datePred1,datePred2]).range([0,(wActualData)]),
                        scaleWrongActivityY : d3.scaleLinear().domain([minPrediction,maxPrediction]).range([(hActualData),0])
                    };

                    //////////WRONG ACTIVITY
                    var axisXWrongData = d3.axisBottom()
                        .scale(dataScales2.scaleWrongActivityX)
                        .tickFormat(formatTime);

                    var axisYWrongData = d3.axisLeft()
                        .scale(dataScales2.scaleWrongActivityY)
                        .tickSizeInner(-wWrongActivity);

                    var lineWrongDataX = d3.line()
                        .x(function(d) { return dataScales2.scaleWrongActivityX(d.date); })
                        .y(function(d) { return dataScales2.scaleWrongActivityY(d.x); });

                    var lineWrongDataY = d3.line()
                        .x(function(d) { return dataScales2.scaleWrongActivityX(d.date); })
                        .y(function(d) { return dataScales2.scaleWrongActivityY(d.y); });


                    var lineWrongDataZ = d3.line()
                        .x(function(d) { return dataScales2.scaleWrongActivityX(d.date); })
                        .y(function(d) { return dataScales2.scaleWrongActivityY(d.z); });

                    plotWrongActivity.append("g").attr('transform','translate('+ (m.l)+','+ (m.t)+')').attr('class','axis axis-y');
                    plotWrongActivity.append('g').attr('transform','translate('+ (m.l)+','+ (hWrongActivity)+')').attr('class','axis axis-x');
                    plotWrongActivity.append("g").attr("class","explanation realDataClass").attr("transform","translate ("+ m.l + "," + m.t +")");

                    plotWrongActivity.select('.axis-x').transition().duration(500).call(axisXWrongData)
                        .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                        });

                    plotWrongActivity.select('.axis-y').transition().duration(500).call(axisYWrongData);

                    //Append line elements
                    plotWrongActivity.select(".explanation").append('path').attr('class','explanation acceleration-x');
                    plotWrongActivity.select(".explanation").append('path').attr('class','explanation acceleration-y');
                    plotWrongActivity.select(".explanation").append('path').attr('class','explanation acceleration-z');

                    plotWrongActivity.select(".acceleration-x")
                        .datum(wrongActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineWrongDataX);

                    plotWrongActivity.select(".acceleration-y")
                        .datum(wrongActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineWrongDataY);

                    plotWrongActivity.select(".acceleration-z")
                        .datum(wrongActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineWrongDataZ);

                    d3.select("#legendWrongActivity").html("User: " + thisParticipant);


                    //plot


                }
            }

            function wrongRightClick() {
                if(wrongPosition < 9)
                {
                    d3.select("#wrongSVG").remove();
                    var plotWrongActivity = canvasWrongActivity
                        .append('svg')
                        .attr('id', "wrongSVG")
                        .attr('width',wWrongActivity+m.r+m.l)
                        .attr('height',hWrongActivity + m.t + m.b);

                    wrongPosition = wrongPosition + 1;
                    var thisStart = wrongRows[wrongPosition].start;
                    var thisStop = wrongRows[wrongPosition].stop;
                    var thisParticipant = wrongRows[wrongPosition].participant;
                    var wrongActivitySamples = activitiesByDate.filter([thisStart,thisStop]).top(Infinity);

                    //plot

                    function sortByDateAscending(a, b) {
                        // Dates will be cast to numbers automagically:
                        return a.date - b.date;
                    }

                    wrongActivitySamples = wrongActivitySamples.sort(sortByDateAscending);


                    var datePred1 = wrongActivitySamples[0].date;
                    var datePred2 = wrongActivitySamples[realActivitySamples.length-1].date;



                    var maxPrediction;
                    var minPrediction;

                    var extentXPred = d3.extent(wrongActivitySamples, function (d) {return d.x});
                    var extentYPred = d3.extent(wrongActivitySamples, function (d) {return d.y});
                    var extentZPred = d3.extent(wrongActivitySamples, function (d) {return d.z});

                    //MAX AND MIN IN AXIS
                    minPrediction = Math.min(extentXPred[0], extentYPred[0]);
                    if(extentZPred[0] < minPrediction){ minPrediction = extentZPred[0];}
                    minPrediction = minPrediction - 0.4;

                    maxPrediction = Math.max(extentXPred[1], extentYPred[1]);
                    if(extentZPred[1] > maxPrediction){ maxPrediction = extentZPred[1];}
                    maxPrediction = maxPrediction + 0.4;


                    var dataScales2 = {
                        scaleWrongActivityX : d3.scaleTime().domain([datePred1,datePred2]).range([0,(wActualData)]),
                        scaleWrongActivityY : d3.scaleLinear().domain([minPrediction,maxPrediction]).range([(hActualData- m.t-10),0])
                    };

                    //////////WRONG ACTIVITY
                    var axisXWrongData = d3.axisBottom()
                        .scale(dataScales2.scaleWrongActivityX)
                        .tickFormat(formatTime);

                    var axisYWrongData = d3.axisLeft()
                        .scale(dataScales2.scaleWrongActivityY)
                        .tickSizeInner(-wWrongActivity);

                    var lineWrongDataX = d3.line()
                        .x(function(d) { return dataScales2.scaleWrongActivityX(d.date); })
                        .y(function(d) { return dataScales2.scaleWrongActivityY(d.x); });

                    var lineWrongDataY = d3.line()
                        .x(function(d) { return dataScales2.scaleWrongActivityX(d.date); })
                        .y(function(d) { return dataScales2.scaleWrongActivityY(d.y); });


                    var lineWrongDataZ = d3.line()
                        .x(function(d) { return dataScales2.scaleWrongActivityX(d.date); })
                        .y(function(d) { return dataScales2.scaleWrongActivityY(d.z); });

                    plotWrongActivity.append("g").attr('transform','translate('+ (m.l)+','+ (m.t)+')').attr('class','axis axis-y');
                    plotWrongActivity.append('g').attr('transform','translate('+ (m.l)+','+ (hWrongActivity- m.t)+')').attr('class','axis axis-x');
                    plotWrongActivity.append("g").attr("class","explanation realDataClass").attr("transform","translate ("+ m.l + "," + m.t +")");

                    plotWrongActivity.select('.axis-x').transition().duration(500).call(axisXWrongData)
                        .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                        });

                    plotWrongActivity.select('.axis-y').transition().duration(500).call(axisYWrongData);

                    //Append line elements
                    plotWrongActivity.select(".explanation").append('path').attr('class','explanation acceleration-x');
                    plotWrongActivity.select(".explanation").append('path').attr('class','explanation acceleration-y');
                    plotWrongActivity.select(".explanation").append('path').attr('class','explanation acceleration-z');

                    plotWrongActivity.select(".acceleration-x")
                        .datum(wrongActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineWrongDataX);

                    plotWrongActivity.select(".acceleration-y")
                        .datum(wrongActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineWrongDataY);

                    plotWrongActivity.select(".acceleration-z")
                        .datum(wrongActivitySamples)
                        .transition()
                        .duration(500)
                        .attr("d", lineWrongDataZ);

                    d3.select("#legendWrongActivity").html("User: " + thisParticipant);


                    //plot
                }
            }


        }


        //function gridOver(d,i) {
        //    d3.selectAll("rect").style("stroke-width", function (p) {return p.x == d.x || p.y == d.y ? "3px" : "1px"})
        //}

    }

}


// parse data
function parseMatrix(d){
    //console.log(d)

    return {
        source: d.source,
        target: d.target,
        weight: +d.weight,

    }

}


function parseItems(d){
    //console.log(d);
    return {
        id: +d.id,
        start: new Date (d.HEADER_START_TIME),
        stop: new Date (d.HEADER_STOP_TIME),
        class: d.CLASS_NAME,
        class_id: +d.CLASS_ID,
        prediction: d.PREDICT_NAME,
        prediction_id: +d.PREDICT_ID,
        prediction_prob: +d.PREDICT_PROB,


    }

}

function parseFeatures (d){

    return {
        start: new Date (d.HEADER_START_TIME),
        stop: new Date (d.HEADER_STOP_TIME),
        meanX: +d.MEAN_X,
        meanY: +d.MEAN_Y,
        meanZ: +d.MEAN_Z,
        varianceX: +d.VARIANCE_X,
        varianceY: +d.VARIANCE_Y,
        varianceZ: +d.VARIANCE_Z,
        zeroX: +d.ZERO_CROSSING_RATE_X,
        zeroY: +d.ZERO_CROSSING_RATE_Y,
        zeroZ: +d.ZERO_CROSSING_RATE_Z,
        absX: +d.ABSOLUTE_MAX_X,
        absY: +d.ABSOLUTE_MAX_Y,
        absZ: +d.ABSOLUTE_MAX_Z,
        domFreq1X: +d.DOMINANT_FREQUENCY_1_X,
        domFreq1Y: +d.DOMINANT_FREQUENCY_1_Y,
        domFreq1Z: +d.DOMINANT_FREQUENCY_1_Z,
        energyFreq1X: +d.ENERGY_DOMINANT_FREQUENCY_1_X,
        energyFreq1Y: +d.ENERGY_DOMINANT_FREQUENCY_1_Y,
        energyFreq1Z: +d.ENERGY_DOMINANT_FREQUENCY_1_Z,
        rollDegree: +d.ROLL_DEGREE,
        pitchDegree: +d.PITCH_DEGREE,
        participant: +d.PARTICIPANT_ID,

    }

}


function parseRawData (d){
    return {
        date: new Date(d.HEADER_TIME_STAMP),
        x: +d.X_ACCELERATION_METERS_PER_SECOND_SQUARED,
        y: +d.Y_ACCELERATION_METERS_PER_SECOND_SQUARED,
        z: +d.Z_ACCELERATION_METERS_PER_SECOND_SQUARED,
        participant: d.PARTICIPANT_ID,
    }

}

function parsePrediction(d){
    return {
        participant: d.PARTICIPANT_ID,
        start: new Date (d.HEADER_START_TIME),
        stop: new Date (d.HEADER_STOP_TIME),
        class: +d.CLASS_ID,
        prediction: +d.PREDICT_ID,
        prediction_prob: d.PREDICT_PROB,
        class_name: d.CLASS_NAME,
        prediction_name: d.PREDICT_NAME,
        //if result = 0, prediction correct
        result: +d.CLASS_ID-(+d.PREDICT_ID),

    }
}
