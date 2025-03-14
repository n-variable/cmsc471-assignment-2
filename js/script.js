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

}

function setupTimeSlider() {
    const minDate = d3.min(allData, d => d.date);
    const maxDate = d3.max(allData, d => d.date);

    const sliderScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([0, 100]);

    const slider = d3.sliderBottom(sliderScale)
        .width(width)
        .height(20)
        .min(minDate)
        .max(maxDate)
        .step(1)
        .displayValue(false)
        .on('onchange', (val) => {
            // Filter data based on slider values
            timeFilteredData.length = 0; // Clear the array
            
            // Add filtered data based on date range
            allData.forEach(d => {
                if (d.date >= val[0] && d.date <= val[1]) {
                timeFilteredData.push(d);
                }
            });
        })

        // Add slider to the container
        const gSlider = d3.select('#year-slider-container')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', 100)
          .append('g')
          .attr('transform', `translate(${margin.left},30)`);
        
        gSlider.call(slider);
        
        // Add labels
        d3.select('#year-slider-container')
          .append('div')
          .attr('class', 'slider-label')
          .style('text-align', 'center')
          .style('margin-top', '10px')
          .text('Filter by Date Range (2020-2023)');
}

// Helper function to generate ticks with years as main ticks and months as subticks
function getTickValues(startDate, endDate) {
    const ticks = [];
    
    // Add year ticks (major ticks)
    const years = d3.timeYear.range(
      d3.timeYear.floor(startDate),
      d3.timeYear.ceil(endDate)
    );
    
    years.forEach(year => {
      ticks.push(year); // Add the year tick
      
      // Add month ticks (minor ticks)
      const monthsInYear = d3.timeMonth.range(
        d3.max([startDate, d3.timeYear.floor(year)]),
        d3.min([endDate, d3.timeYear.offset(year, 1)])
      );
      
      // Add only selected months as minor ticks to avoid overcrowding
      monthsInYear.forEach((month, i) => {
        // Add every 3rd month as a minor tick
        if (i % 3 === 1) {
          ticks.push(month);
        }
      });
    });
    
    return ticks;
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
    d3.csv("https://cmsc471.nyc3.digitaloceanspaces.com/covid_crimes.csv", d => mapData(d))
    .then(data => {
        console.log("Data loaded:", data[0], "records");

        allData.push(...validData);

        setupTimeSlider();
    })
    .catch(error => {
        console.error("Error loading the dataset:", error);
        document.getElementById("error-message").textContent = 
            "Failed to load data. Please try refreshing the page.";
    });
}

// Load data when page loads
window.addEventListener('load', init);