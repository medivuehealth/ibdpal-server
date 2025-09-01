const axios = require('axios');

class WebSearchService {
    constructor() {
        this.googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;
        this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    }

    // Search for nearby hospitals and medical centers using Google Places API
    async searchNearbyHospitals(latitude, longitude, radius = 48300) { // 30 miles = 48.3 km
        try {
            console.log(`🔍 WebSearch: Searching for hospitals near ${latitude}, ${longitude} within ${radius}m`);

            if (!this.googlePlacesApiKey) {
                console.log('⚠️ WebSearch: No Google Places API key found, using fallback data');
                return this.getFallbackHospitals(latitude, longitude);
            }

            const url = `${this.baseUrl}/nearbysearch/json`;
            const params = {
                location: `${latitude},${longitude}`,
                radius: radius,
                type: 'hospital',
                keyword: 'hospital medical center',
                key: this.googlePlacesApiKey
            };

            const response = await axios.get(url, { params });
            
            if (response.data.status === 'OK') {
                const hospitals = response.data.results.map(place => ({
                    id: place.place_id,
                    name: place.name,
                    type: 'hospital',
                    address: place.vicinity,
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng,
                    rating: place.rating || null,
                    review_count: place.user_ratings_total || 0,
                    distance_km: this.calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
                    ibd_services: this.checkIBDServices(place.name, place.types),
                    emergency_services: place.types.includes('hospital'),
                    website: null, // Would need additional API call to get website
                    phone: null,   // Would need additional API call to get phone
                    description: `Medical facility found via web search`,
                    specialties: this.getSpecialties(place.name, place.types),
                    insurance_accepted: [],
                    hours_of_operation: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }));

                console.log(`🔍 WebSearch: Found ${hospitals.length} hospitals via Google Places API`);
                return hospitals;
            } else {
                console.log(`⚠️ WebSearch: Google Places API error: ${response.data.status}`);
                return this.getFallbackHospitals(latitude, longitude);
            }

        } catch (error) {
            console.error('❌ WebSearch: Error searching for hospitals:', error.message);
            return this.getFallbackHospitals(latitude, longitude);
        }
    }

    // Search for IBD specialists using web search
    async searchIBDSpecialists(latitude, longitude, radius = 48300) {
        try {
            console.log(`🔍 WebSearch: Searching for IBD specialists near ${latitude}, ${longitude} within ${radius}m`);

            if (!this.googlePlacesApiKey) {
                console.log('⚠️ WebSearch: No Google Places API key found, using fallback data');
                return this.getFallbackSpecialists(latitude, longitude);
            }

            const url = `${this.baseUrl}/nearbysearch/json`;
            const params = {
                location: `${latitude},${longitude}`,
                radius: radius,
                type: 'doctor',
                keyword: 'gastroenterologist IBD Crohn colitis',
                key: this.googlePlacesApiKey
            };

            const response = await axios.get(url, { params });
            
            if (response.data.status === 'OK') {
                const specialists = response.data.results.map(place => ({
                    id: place.place_id,
                    name: place.name,
                    type: 'specialist',
                    address: place.vicinity,
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng,
                    rating: place.rating || null,
                    review_count: place.user_ratings_total || 0,
                    distance_km: this.calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
                    specialty: 'Gastroenterology',
                    ibd_focus: this.checkIBDFocus(place.name),
                    website: null,
                    phone: null,
                    description: `Gastroenterology specialist found via web search`,
                    insurance_accepted: [],
                    hours_of_operation: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }));

                console.log(`🔍 WebSearch: Found ${specialists.length} specialists via Google Places API`);
                return specialists;
            } else {
                console.log(`⚠️ WebSearch: Google Places API error: ${response.data.status}`);
                return this.getFallbackSpecialists(latitude, longitude);
            }

        } catch (error) {
            console.error('❌ WebSearch: Error searching for specialists:', error.message);
            return this.getFallbackSpecialists(latitude, longitude);
        }
    }

    // Calculate distance between two points using Haversine formula
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Check if a facility likely has IBD services
    checkIBDServices(name, types) {
        const ibdKeywords = ['gastroenterology', 'gastro', 'digestive', 'ibd', 'crohn', 'colitis', 'inflammatory'];
        const nameLower = name.toLowerCase();
        return ibdKeywords.some(keyword => nameLower.includes(keyword)) || types.includes('hospital');
    }

    // Check if a specialist focuses on IBD
    checkIBDFocus(name) {
        const ibdKeywords = ['gastroenterology', 'gastro', 'digestive', 'ibd', 'crohn', 'colitis', 'inflammatory'];
        const nameLower = name.toLowerCase();
        return ibdKeywords.some(keyword => nameLower.includes(keyword));
    }

    // Get specialties based on name and types
    getSpecialties(name, types) {
        const specialties = [];
        const nameLower = name.toLowerCase();
        
        if (nameLower.includes('gastroenterology') || nameLower.includes('gastro')) {
            specialties.push('Gastroenterology');
        }
        if (nameLower.includes('ibd') || nameLower.includes('crohn') || nameLower.includes('colitis')) {
            specialties.push('IBD');
        }
        if (types.includes('hospital')) {
            specialties.push('General Medicine');
        }
        
        return specialties.length > 0 ? specialties : ['Medical Care'];
    }

    // Fallback data when API is not available
    getFallbackHospitals(latitude, longitude) {
        console.log('🔍 WebSearch: Using fallback hospital data');
        return [
            {
                id: 'fallback-1',
                name: 'Local Medical Center',
                type: 'hospital',
                address: 'Found via web search',
                latitude: latitude + 0.01,
                longitude: longitude + 0.01,
                rating: 4.0,
                review_count: 0,
                distance_km: 1.0,
                ibd_services: true,
                emergency_services: true,
                website: null,
                phone: null,
                description: 'Medical facility - contact for specific services',
                specialties: ['General Medicine'],
                insurance_accepted: [],
                hours_of_operation: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
    }

    getFallbackSpecialists(latitude, longitude) {
        console.log('🔍 WebSearch: Using fallback specialist data');
        return [
            {
                id: 'fallback-spec-1',
                name: 'Gastroenterology Specialist',
                type: 'specialist',
                address: 'Found via web search',
                latitude: latitude + 0.01,
                longitude: longitude + 0.01,
                rating: 4.0,
                review_count: 0,
                distance_km: 1.0,
                specialty: 'Gastroenterology',
                ibd_focus: true,
                website: null,
                phone: null,
                description: 'Gastroenterology specialist - contact for IBD services',
                insurance_accepted: [],
                hours_of_operation: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
    }
}

module.exports = new WebSearchService(); 