const allData = [];
const filteredData = [];

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

function updateFilteredData(data) {

}

// Load Data
function init(){
    d3.csv("https://cmsc471.nyc3.digitaloceanspaces.com/covid_crimes.csv", d => mapData(d))
    .then(data => {
        console.log("Data loaded:", data[0], "records");

        const validData = data.filter(d => !isNaN(d.latitude) && !isNaN(d.longitude));
        console.log("Data with valid coordinates:", validData.length, "records");

        const crimesByType = d3.group(validData, d => d.primary_type);

        const stats = Array.from(crimesByType, ([type, crimes]) => ({
            type: type,
            count: crimes.length,
            arrest_rate: d3.mean(crimes, d => d.arrest ? 1 : 0)
        }));

        stats.sort((a, b) => b.count - a.count);
        
        console.log("Crime statistics by type:", stats);
    })
    .catch(error => {
        console.error("Error loading the dataset:", error);
        document.getElementById("error-message").textContent = 
            "Failed to load data. Please try refreshing the page.";
    });
}

// Load data when page loads
window.addEventListener('load', init);