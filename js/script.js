let allData = [];
const timeFilteredData = [];
const crimeTypeDistribution = [];
const crimeLocationDistribution = [];

function getCrimeTypeDistribution(data) {
    const crimesByType = d3.group(data, d => d.primary_type);

    const distribution = Array.from(crimesByType, ([type, crimes]) => ({
        category: type,
        count: crimes.length,
        arrest_rate: d3.mean(crimes, d => d.arrest ? 1 : 0)
    }));

    return distribution.sort((a, b) => b.count - a.count);
}

function getCrimeLocationDistribution(data) {
    const crimesByLocation = d3.group(data, d => d.location_description);

    const distribution = Array.from(crimesByLocation, ([location, crimes]) => ({
        category: location,
        count: crimes.length,
        arrest_rate: d3.mean(crimes, d => d.arrest ? 1 : 0)
    }));

    return distribution.sort((a, b) => b.count - a.count);
}

function updateVisualization() {
    const crimeTypes = getCrimeTypeDistribution(timeFilteredData);
    const locationTypes = getCrimeLocationDistribution(timeFilteredData);
    
    crimeTypeDistribution.length = 0;
    crimeLocationDistribution.length = 0;
    
    crimeTypes.forEach(d => crimeTypeDistribution.push(d));
    locationTypes.forEach(d => crimeLocationDistribution.push(d));
    
    renderCrimeTypePieChart();
    renderLocationPieChart();
    renderGridHeatMap();
}

function renderCrimeTypePieChart() {
    const width = 600;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    d3.select("#crime-type-vis").html("");

    const svg = d3.select("#crime-type-vis")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/4}, ${height/2})`);

    const data = crimeTypeDistribution.slice(0, 10);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.category))
        .range(d3.schemeTableau10);

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);
    
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 0.8);

    const labelArc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.8);

    const arcs = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.data.category))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 1);

            const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "white")
                .style("border", "1px solid #ddd")
                .style("border-radius", "5px")
                .style("padding", "10px")
                .style("opacity", 0.9)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
                
            tooltip.html(`
                <strong>${d.data.category}</strong><br>
                Count: ${d.data.count}<br>
                Percentage: ${percent}%<br>
                Arrest Rate: ${(d.data.arrest_rate * 100).toFixed(1)}%
            `);
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("opacity", 0.8);
            d3.selectAll(".tooltip").remove();
        });

    const legend = svg.selectAll(".legend")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => {
            const legendHeight = data.length * 20;
            const startY = -legendHeight / 2;
            return `translate(${radius + 20}, ${startY + i * 20})`;
        });
    
    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => colorScale(d.category));
    
    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text(d => {
            return d.category.length > 20 ? d.category.substring(0, 20) + "..." : d.category;
        })
        .style("font-size", "12px");
}

function renderLocationPieChart() {
    const width = 600;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    d3.select("#location-type-vis").html("");

    const svg = d3.select("#location-type-vis")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/4}, ${height/2})`);

    const data = crimeLocationDistribution.slice(0, 10);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.category))
        .range(d3.schemeTableau10);

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);
    
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 0.8);
    
    const labelArc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.8);
    
    const arcs = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.data.category))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 1);

            const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "white")
                .style("border", "1px solid #ddd")
                .style("border-radius", "5px")
                .style("padding", "10px")
                .style("opacity", 0.9)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
                
            tooltip.html(`
                <strong>${d.data.category}</strong><br>
                Count: ${d.data.count}<br>
                Percentage: ${percent}%<br>
                Arrest Rate: ${(d.data.arrest_rate * 100).toFixed(1)}%
            `);
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("opacity", 0.8);
            d3.selectAll(".tooltip").remove();
        });

    const legend = svg.selectAll(".legend")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => {
            const legendHeight = data.length * 20;
            const startY = -legendHeight / 2;
            return `translate(${radius + 20}, ${startY + i * 20})`;
        });
    
    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => colorScale(d.category));
    
    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text(d => {
            return d.category.length > 20 ? d.category.substring(0, 20) + "..." : d.category;
        })
        .style("font-size", "12px");
}

function renderGridHeatMap() {
    const margin = {top: 80, right: 25, bottom: 120, left: 120};
    const width = 800 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    d3.select("#grid-heatmap-vis").html("");

    d3.selectAll(".heatmap-tooltip").remove();

    const svg = d3.select("#grid-heatmap-vis")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const topCrimeTypes = crimeTypeDistribution.slice(0, 10).map(d => d.category);
    const topLocations = crimeLocationDistribution.slice(0, 10).map(d => d.category);

    const correlationData = [];

    const groupedData = d3.group(timeFilteredData, 
        d => d.location_description, 
        d => d.primary_type
    );

    topLocations.forEach(location => {
        topCrimeTypes.forEach(crimeType => {
            const locationData = groupedData.get(location);
            const count = locationData && locationData.has(crimeType) ? 
                locationData.get(crimeType).length : 0;
            
            correlationData.push({
                location: location,
                crimeType: crimeType,
                count: count
            });
        });
    });

    const x = d3.scaleBand()
        .range([0, width])
        .domain(topCrimeTypes)
        .padding(0.05);
    
    const y = d3.scaleBand()
        .range([0, height])
        .domain(topLocations)
        .padding(0.05);

    svg.append("g")
        .style("font-size", 12)
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .style("font-size", 12)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove();
        
    const maxCount = d3.max(correlationData, d => d.count);
    
    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([0, maxCount]);

    const tooltip = d3.select("body").append("div")
        .attr("class", "heatmap-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("z-index", "1000");

    svg.selectAll()
        .data(correlationData, d => d.location+':'+d.crimeType)
        .enter()
        .append("rect")
        .attr("x", d => x(d.crimeType))
        .attr("y", d => y(d.location))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => d.count === 0 ? "#f8f9fa" : colorScale(d.count))
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1);
            
            tooltip.style("opacity", 1)
                .html(`
                    <strong>Location:</strong> ${d.location}<br>
                    <strong>Crime Type:</strong> ${d.crimeType}<br>
                    <strong>Count:</strong> ${d.count}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8);
            
            tooltip.style("opacity", 0);
        });
    
    const legendWidth = 300;
    const legendHeight = 20;
    
    const legendScale = d3.scaleLinear()
        .domain([0, maxCount])
        .range([0, legendWidth]);
    
    const legendAxis = d3.axisBottom()
        .scale(legendScale)
        .ticks(5);
    
    const legend = svg.append("g")
        .attr("transform", `translate(${width/2 - legendWidth/2}, ${-40})`);
    
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "heatmap-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
    
    const colorStops = [0, 0.2, 0.4, 0.6, 0.8, 1];
    colorStops.forEach(stop => {
        gradient.append("stop")
            .attr("offset", `${stop * 100}%`)
            .attr("stop-color", colorScale(stop * maxCount));
    });
    
    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#heatmap-gradient)");
    
    legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);
    
    legend.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .text("Number of Crimes");
}

function setupTimeSlider() {
    const timeSlider = document.getElementById("slider");
    
    noUiSlider.create(timeSlider, {
        start: [2020, 2023],
        connect: true,
        step: 1,
        range: {
            'min': 2020,
            'max': 2023
        },
        pips: {
            mode: 'steps',
            density: 1,
            format: {
                to: function(value) {
                    return Math.round(value);
                }
            },
            cssClasses: {
                large: 'noUi-large',
                small: 'noUi-large',
                marker: 'noUi-marker',
                value: 'noUi-value'
            }
        }
    });

    timeSlider.noUiSlider.on('update', function(values) {
        const startYear = Math.round(parseFloat(values[0]));
        const endYear = Math.round(parseFloat(values[1]));

        timeFilteredData.length = 0;
        allData.forEach(d => {
            if (d.year >= startYear && d.year <= endYear) {
                timeFilteredData.push(d);
            }
        });
        
        console.log('Time range updated:', startYear, 'to', endYear, 'Records:', timeFilteredData.length);

        updateVisualization();
    });
}

function mapData(d){
    return { 
        arrest: d["Arrest"] === "True",
        beat: parseInt(d["Beat"]),
        block: d["Block"],
        case_number: d["Case Number"],
        primary_type: d["Primary Type"],
        latitude: parseFloat(d["Latitude"]),
        longitude: parseFloat(d["Longitude"]),
        year: parseInt(d["Year"]),
        location_description: d["Location Description"],
        date: new Date(d["Date"])
    }
}

function init(){
    document.getElementById('status-text').innerText = 'Loading Data...';
    
    d3.csv("https://cmsc471.nyc3.digitaloceanspaces.com/covid_crimes.csv", d => mapData(d))
    .then(data => {
        console.log("Data loaded:", data.length, "records");

        allData = data;

        setupTimeSlider();
        updateVisualization();

        document.getElementById('status-text').innerText = 'Data Loaded';
    })
    .catch(error => {
        console.error("Error loading data:", error);
        document.getElementById('status-text').innerText = 'Error Loading Data';
    });
}

window.addEventListener('load', init);