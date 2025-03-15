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
    // Get the aggregated data
    const crimeTypes = getCrimeTypeDistribution(timeFilteredData);
    const locationTypes = getCrimeLocationDistribution(timeFilteredData);
    
    // Clear existing arrays and update with new data
    crimeTypeDistribution.length = 0;
    crimeLocationDistribution.length = 0;
    
    crimeTypes.forEach(d => crimeTypeDistribution.push(d));
    locationTypes.forEach(d => crimeLocationDistribution.push(d));
    
    // Render the charts
    renderCrimeTypePieChart();
    renderLocationPieChart();
}

function renderCrimeTypePieChart() {
    const width = 700;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    
    // Clear previous chart
    d3.select("#crime-type-vis").html("");
    
    // Create SVG element
    const svg = d3.select("#crime-type-vis")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);
    
    // Take top 10 crime types to avoid cluttering
    const data = crimeTypeDistribution.slice(0, 10);
    
    // Create color scale
    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.category))
        .range(d3.schemeTableau10);
    
    // Create pie generator
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);
    
    // Create arc generator
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 0.8);
    
    // Create label arc
    const labelArc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.8);
    
    // Create pie chart
    const arcs = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");
    
    // Add color fill
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.data.category))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("opacity", 1);
                
            // Display tooltip with information
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
    
    // Add legend
    const legend = svg.selectAll(".legend")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(-${width/2 + 10}, ${-height/2 + 20 + i * 20})`);
    
    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => colorScale(d.category));
    
    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text(d => {
            // Truncate long category names
            return d.category.length > 20 ? d.category.substring(0, 20) + "..." : d.category;
        })
        .style("font-size", "12px");
}

function renderLocationPieChart() {
    const width = 700;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    
    // Clear previous chart
    d3.select("#location-type-vis").html("");
    
    // Create SVG element
    const svg = d3.select("#location-type-vis")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);
    
    // Take top 10 locations to avoid cluttering
    const data = crimeLocationDistribution.slice(0, 10);
    
    // Create color scale
    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.category))
        .range(d3.schemeTableau10);
    
    // Create pie generator
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);
    
    // Create arc generator
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 0.8);
    
    // Create label arc
    const labelArc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.8);
    
    // Create pie chart
    const arcs = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");
    
    // Add color fill
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.category))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.8)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("opacity", 1);
                
            // Display tooltip with information
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
    
    // Add legend
    const legend = svg.selectAll(".legend")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(-${width/2 + 10}, ${-height/2 + 20 + i * 20})`);
    
    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => colorScale(d.category));
    
    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text(d => {
            // Truncate long category names
            return d.category.length > 20 ? d.category.substring(0, 20) + "..." : d.category;
        })
        .style("font-size", "12px");
}

function setupTimeSlider() {
    const timeSlider = document.getElementById("slider");
    
    noUiSlider.create(timeSlider, {
        start: [2020, 2023], // 2020 to 2023
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
                    // Just return the year as is
                    return Math.round(value);
                }
            }
        }
    });
    
    // Add event listener for value changes
    timeSlider.noUiSlider.on('update', function(values) {
        const startYear = Math.round(parseFloat(values[0]));
        const endYear = Math.round(parseFloat(values[1]));
        
        // Filter data based on the selected year range
        timeFilteredData.length = 0; // Clear the array
        allData.forEach(d => {
            if (d.year >= startYear && d.year <= endYear) {
                timeFilteredData.push(d);
            }
        });
        
        console.log('Time range updated:', startYear, 'to', endYear, 'Records:', timeFilteredData.length);
        
        // Update visualization with the filtered data
        updateVisualization();
    });
}

function mapData(d){
    return { 
        arrest: d["Arrest"] === "true",
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

// Load Data
function init(){
    document.getElementById('status-text').innerText = 'Loading Data...';
    d3.csv("https://cmsc471.nyc3.digitaloceanspaces.com/covid_crimes.csv", d => mapData(d))
    .then(data => {
        console.log("Data loaded:", data[0], "records");

        allData = data;

        setupTimeSlider();
        updateVisualization(); // Initialize visualization with all data

        // Update the status-text paragraph text
        document.getElementById('status-text').innerText = 'Data Loaded';
    })
}

// Load data when page loads
window.addEventListener('load', init);
