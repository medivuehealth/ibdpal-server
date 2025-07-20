const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'https://ibdpal-server-production.up.railway.app/api';

const testUsernameJournal = async () => {
  console.log('🧪 Testing journal endpoints with username...');
  
  const testData = {
    username: 'aryan.skumar17@gmail.com',
    entry_date: '2025-07-24',
    breakfast: 'Test breakfast with username',
    breakfast_calories: 350
  };

  try {
    // Test POST endpoint (create new entry)
    console.log('\n📝 Testing POST /api/journal/entries...');
    const postResponse = await fetch(`${API_BASE_URL}/journal/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('POST Response Status:', postResponse.status);
    const postData = await postResponse.json();
    console.log('POST Response Data:', JSON.stringify(postData, null, 2));

    if (postResponse.ok) {
      console.log('✅ POST successful! Entry ID:', postData.entry_id);
      
      // Test GET endpoint (fetch entries)
      console.log('\n📖 Testing GET /api/journal/entries/aryan.skumar17@gmail.com...');
      const getResponse = await fetch(`${API_BASE_URL}/journal/entries/aryan.skumar17@gmail.com`);
      
      console.log('GET Response Status:', getResponse.status);
      const getData = await getResponse.json();
      console.log('GET Response Data:', JSON.stringify(getData, null, 2));
      
      if (getResponse.ok) {
        console.log('✅ GET successful! Found', getData.length, 'entries');
        
        // Test PUT endpoint (update entry)
        if (getData.length > 0) {
          const entryId = getData[0].entry_id;
          console.log('\n✏️ Testing PUT /api/journal/entries/' + entryId + '...');
          
          const updateData = {
            username: 'aryan.skumar17@gmail.com',
            lunch: 'Test lunch update',
            lunch_calories: 450
          };
          
          const putResponse = await fetch(`${API_BASE_URL}/journal/entries/${entryId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          });
          
          console.log('PUT Response Status:', putResponse.status);
          const putData = await putResponse.json();
          console.log('PUT Response Data:', JSON.stringify(putData, null, 2));
          
          if (putResponse.ok) {
            console.log('✅ PUT successful!');
          } else {
            console.log('❌ PUT failed');
          }
        }
      } else {
        console.log('❌ GET failed');
      }
    } else {
      console.log('❌ POST failed');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testUsernameJournal(); 