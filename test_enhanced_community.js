const axios = require('axios');

// Test the enhanced community search endpoints
async function testEnhancedCommunitySearch() {
    const baseUrl = 'https://ibdpal-server-production.up.railway.app';
    const testLocation = {
        latitude: 35.2271,  // Charlotte, NC coordinates
        longitude: -80.8431,
        radius: 80.5  // 50 miles
    };

    console.log('🧪 Testing Enhanced Community Search');
    console.log('📍 Test Location: Charlotte, NC');
    console.log('🔍 Search Radius: 50 miles (80.5 km)');
    console.log('🌐 Base URL:', baseUrl);
    console.log('');

    try {
        // Test 1: Enhanced Hospitals
        console.log('🏥 TEST 1: Enhanced Hospitals Search');
        console.log('=====================================');
        const hospitalsResponse = await axios.get(`${baseUrl}/api/community/hospitals`, {
            params: {
                latitude: testLocation.latitude,
                longitude: testLocation.longitude,
                radius: testLocation.radius,
                limit: 20
            }
        });

        if (hospitalsResponse.data.success) {
            const hospitals = hospitalsResponse.data.data.hospitals;
            console.log(`✅ Found ${hospitals.length} hospitals`);
            console.log('📋 Hospital Details:');
            hospitals.forEach((hospital, index) => {
                console.log(`  ${index + 1}. ${hospital.name}`);
                console.log(`     📍 Address: ${hospital.address}`);
                console.log(`     📞 Phone: ${hospital.phone || 'N/A'}`);
                console.log(`     🌐 Website: ${hospital.website || 'N/A'}`);
                console.log(`     ⭐ Rating: ${hospital.rating || 'N/A'}`);
                console.log(`     🏥 IBD Services: ${hospital.ibd_services ? 'Yes' : 'No'}`);
                console.log(`     🚨 Emergency: ${hospital.emergency_services ? 'Yes' : 'No'}`);
                console.log(`     📏 Distance: ${hospital.distance_km} km`);
                console.log('');
            });
        } else {
            console.log('❌ Hospitals search failed:', hospitalsResponse.data);
        }

        // Test 2: Enhanced Specialists
        console.log('👨‍⚕️ TEST 2: Enhanced Specialists Search');
        console.log('=======================================');
        const specialistsResponse = await axios.get(`${baseUrl}/api/community/specialists`, {
            params: {
                latitude: testLocation.latitude,
                longitude: testLocation.longitude,
                radius: testLocation.radius,
                limit: 20
            }
        });

        if (specialistsResponse.data.success) {
            const specialists = specialistsResponse.data.data.specialists;
            console.log(`✅ Found ${specialists.length} specialists`);
            console.log('📋 Specialist Details:');
            specialists.forEach((specialist, index) => {
                console.log(`  ${index + 1}. ${specialist.name}`);
                console.log(`     📍 Address: ${specialist.address}`);
                console.log(`     📞 Phone: ${specialist.phone || 'N/A'}`);
                console.log(`     🌐 Website: ${specialist.website || 'N/A'}`);
                console.log(`     ⭐ Rating: ${specialist.rating || 'N/A'}`);
                console.log(`     🏥 Specialty: ${specialist.specialty || 'N/A'}`);
                console.log(`     🔬 IBD Focus: ${specialist.ibd_focus ? 'Yes' : 'No'}`);
                console.log(`     📏 Distance: ${specialist.distance_km} km`);
                console.log('');
            });
        } else {
            console.log('❌ Specialists search failed:', specialistsResponse.data);
        }

        // Test 3: Support Organizations
        console.log('🤝 TEST 3: Support Organizations Search');
        console.log('=======================================');
        const supportResponse = await axios.get(`${baseUrl}/api/community/support-organizations`, {
            params: {
                latitude: testLocation.latitude,
                longitude: testLocation.longitude,
                radius: testLocation.radius,
                limit: 20
            }
        });

        if (supportResponse.data.success) {
            const organizations = supportResponse.data.data.organizations;
            console.log(`✅ Found ${organizations.length} support organizations`);
            console.log('📋 Organization Details:');
            organizations.forEach((org, index) => {
                console.log(`  ${index + 1}. ${org.name}`);
                console.log(`     📍 Address: ${org.address}, ${org.city}, ${org.state} ${org.zip_code}`);
                console.log(`     📞 Phone: ${org.phone || 'N/A'}`);
                console.log(`     🌐 Website: ${org.website || 'N/A'}`);
                console.log(`     📧 Email: ${org.email || 'N/A'}`);
                console.log(`     ⭐ Rating: ${org.rating || 'N/A'}`);
                console.log(`     📏 Distance: ${org.distance_km} km`);
                console.log('');
            });
        } else {
            console.log('❌ Support organizations search failed:', supportResponse.data);
        }

        // Summary
        console.log('📊 SUMMARY');
        console.log('==========');
        const totalHospitals = hospitalsResponse.data.success ? hospitalsResponse.data.data.hospitals.length : 0;
        const totalSpecialists = specialistsResponse.data.success ? specialistsResponse.data.data.specialists.length : 0;
        const totalOrganizations = supportResponse.data.success ? supportResponse.data.data.organizations.length : 0;
        
        console.log(`🏥 Hospitals: ${totalHospitals}`);
        console.log(`👨‍⚕️ Specialists: ${totalSpecialists}`);
        console.log(`🤝 Support Organizations: ${totalOrganizations}`);
        console.log(`📈 Total Results: ${totalHospitals + totalSpecialists + totalOrganizations}`);
        
        if (totalHospitals > 0 && totalSpecialists > 0 && totalOrganizations > 0) {
            console.log('🎉 All tests passed! Enhanced community search is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Check the individual results above.');
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testEnhancedCommunitySearch(); 