// function init(){
//     d3.csv("./data/crimes.csv", d => ({ 
//         id: d["ID"],
//         case_number: d["Case Number"],
//         date: new Date(d["Date"]),
//         primary_type: d["Primary Type"],
//         description: d["Description"],
//         location_description: d["Location Description"],
//         arrest: d["Arrest"] === "true",
//         domestic: d["Domestic"] === "true",
//         district: d["District"],
//         year: +d["Year"],
//         latitude: +d["Latitude"],
//         longitude: +d["Longitude"]
//     }))
//     .then(data => {
//         console.log("Data loaded:", data.length, "records");
        
//         // Filter out entries with missing coordinates
//         const validData = data.filter(d => !isNaN(d.latitude) && !isNaN(d.longitude));
//         console.log("Data with valid coordinates:", validData.length, "records");
        
//         // Group data by crime type
//         const crimesByType = d3.group(validData, d => d.primary_type);
        
//         // Create simple summary statistics
//         const stats = Array.from(crimesByType, ([type, crimes]) => ({
//             type: type,
//             count: crimes.length,
//             arrest_rate: d3.mean(crimes, d => d.arrest ? 1 : 0)
//         }));
        
//         // Sort by frequency
//         stats.sort((a, b) => b.count - a.count);
        
//         console.log("Crime statistics by type:", stats);
//     })
//     .catch(error => {
//         console.error("Error loading the dataset:", error);
//         document.getElementById("error-message").textContent = 
//             "Failed to load data. Please try refreshing the page.";
//     });
// }     