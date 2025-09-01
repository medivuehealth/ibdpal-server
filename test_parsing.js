// Test script to parse hospital and specialist data
const hospitalData = {
    "id": "fallback-1",
    "name": "Local Medical Center",
    "type": "hospital",
    "address": "Found via web search",
    "latitude": 35.006523094290955,
    "longitude": -80.80513991831886,
    "rating": 4,
    "review_count": 0,
    "distance_km": 1,
    "ibd_services": 1,
    "emergency_services": 1,
    "website": null,
    "phone": null,
    "description": "Medical facility - contact for specific services",
    "specialties": ["General Medicine"],
    "insurance_accepted": [],
    "hours_of_operation": {},
    "created_at": "2025-09-01T03:50:26.005Z",
    "updated_at": "2025-09-01T03:50:26.005Z"
};

const specialistData = {
    "id": "fallback-spec-1",
    "name": "Gastroenterology Specialist",
    "type": "specialist",
    "address": "Found via web search",
    "latitude": 35.006523094290955,
    "longitude": -80.80513991831886,
    "rating": 4,
    "review_count": 0,
    "distance_km": 1,
    "specialty": "Gastroenterology",
    "ibd_focus": 1,
    "website": null,
    "phone": null,
    "description": "Gastroenterology specialist - contact for IBD services",
    "insurance_accepted": [],
    "hours_of_operation": {},
    "created_at": "2025-09-01T03:50:26.000Z",
    "updated_at": "2025-09-01T03:50:26.000Z"
};

// Test hospital parsing
console.log("=== HOSPITAL PARSING TEST ===");
try {
    const idString = hospitalData["id"];
    const name = hospitalData["name"];
    const typeString = hospitalData["type"];
    const address = hospitalData["address"];
    const city = hospitalData["city"] || "Unknown";
    const state = hospitalData["state"] || "Unknown";
    const zipCode = hospitalData["zip_code"] || "Unknown";
    const country = hospitalData["country"] || "Unknown";
    const latitude = hospitalData["latitude"];
    const longitude = hospitalData["longitude"];
    
    // Handle boolean fields as both boolean and integer
    const ibdServicesRaw = hospitalData["ibd_services"];
    const ibdServices = (ibdServicesRaw === true) || (ibdServicesRaw === 1) || false;
    
    const emergencyServicesRaw = hospitalData["emergency_services"];
    const emergencyServices = (emergencyServicesRaw === true) || (emergencyServicesRaw === 1) || false;
    
    console.log("✅ Hospital parsing successful:");
    console.log(`  - ID: ${idString}`);
    console.log(`  - Name: ${name}`);
    console.log(`  - Type: ${typeString}`);
    console.log(`  - Address: ${address}`);
    console.log(`  - City: ${city}`);
    console.log(`  - State: ${state}`);
    console.log(`  - Zip: ${zipCode}`);
    console.log(`  - Country: ${country}`);
    console.log(`  - Latitude: ${latitude}`);
    console.log(`  - Longitude: ${longitude}`);
    console.log(`  - IBD Services: ${ibdServices}`);
    console.log(`  - Emergency Services: ${emergencyServices}`);
    
} catch (error) {
    console.log("❌ Hospital parsing failed:", error.message);
}

// Test specialist parsing
console.log("\n=== SPECIALIST PARSING TEST ===");
try {
    const id = specialistData["id"];
    const name = specialistData["name"];
    const address = specialistData["address"];
    const city = specialistData["city"] || "Unknown";
    const state = specialistData["state"] || "Unknown";
    const zipCode = specialistData["zip_code"] || "Unknown";
    const country = specialistData["country"] || "Unknown";
    const latitude = specialistData["latitude"];
    const longitude = specialistData["longitude"];
    
    // Handle boolean fields as both boolean and integer
    const ibdFocusRaw = specialistData["ibd_focus"];
    const ibdFocus = (ibdFocusRaw === true) || (ibdFocusRaw === 1) || false;
    
    console.log("✅ Specialist parsing successful:");
    console.log(`  - ID: ${id}`);
    console.log(`  - Name: ${name}`);
    console.log(`  - Address: ${address}`);
    console.log(`  - City: ${city}`);
    console.log(`  - State: ${state}`);
    console.log(`  - Zip: ${zipCode}`);
    console.log(`  - Country: ${country}`);
    console.log(`  - Latitude: ${latitude}`);
    console.log(`  - Longitude: ${longitude}`);
    console.log(`  - IBD Focus: ${ibdFocus}`);
    
} catch (error) {
    console.log("❌ Specialist parsing failed:", error.message);
} 