const allData = [];
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
    renderPieChart("#crime-type-vis", getCrimeTypeDistribution(timeFilteredData), "Crime Type Distribution");
    renderPieChart("#location-type-vis", getCrimeLocationDistribution(timeFilteredData), "Crime Location Distribution");
}

function setupTimeSlider() {
    if (!allData.length) {
        console.error("No data available for slider.");
        return;
    }

    const minDate = d3.timeMonth.floor(d3.min(allData, d => d.date));
    const maxDate = d3.timeMonth.ceil(d3.max(allData, d => d.date));

    const slider = d3.sliderBottom()
        .min(minDate)
        .max(maxDate)
        .width(500)
        .tickFormat(d3.timeFormat("%b %Y")) // Format as "Sep 2023"
        .step(1000 * 60 * 60 * 24 * 30) // Approximate 1-month step
        .on("onchange", (val) => {
            timeFilteredData.length = 0;
            allData.forEach(d => {
                if (d.date >= val) timeFilteredData.push(d);
            });
            updateVisualization(); // Refresh chart after filtering
        });

    d3.select("#year-slider-container").html(""); // Clear existing content
    const gSlider = d3.select("#year-slider-container")
        .append("svg")
        .attr("width", 600)
        .attr("height", 80)
        .append("g")
        .attr("transform", "translate(50,30)");

    gSlider.call(slider);
}

function renderPieChart(container, data, title) {
    d3.select(container).html(""); // Clear previous chart

    const width = 300, height = 300, radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value(d => d.count);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const slices = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    slices.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.category));

    slices.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .text(d => d.data.category);
}

function mapData(d) {
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
    };
}

function init() {
    d3.csv("https://cmsc471.nyc3.digitaloceanspaces.com/covid_crimes.csv", mapData)
    .then(data => {
        console.log("Data loaded:", data.length, "records");

        allData.push(...data);
        setupTimeSlider(); 
        updateVisualization(); // Initialize visualizations
    })
    .catch(error => {
        console.error("Error loading dataset:", error);
        document.getElementById("error-message").textContent = 
            "Failed to load data. Please try refreshing the page.";
    });
}

window.addEventListener('load', init);
