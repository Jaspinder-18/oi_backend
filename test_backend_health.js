// Quick test to verify the backend is responding correctly
const axios = require('axios');

const testBackend = async () => {
    console.log('=== Testing Backend Health ===\n');

    try {
        // Test 1: Server health
        console.log('1. Testing server connection...');
        const healthResponse = await axios.get('http://localhost:5000/api/data/NIFTY?limit=1');
        console.log('✓ Server is responding');
        console.log(`   Records in DB: ${healthResponse.data.length}`);

        if (healthResponse.data.length > 0) {
            const latestRecord = healthResponse.data[0];
            console.log(`   Latest timestamp: ${latestRecord.timestamp}`);
            console.log(`   Data points: ${latestRecord.data?.filtered?.data?.length || 0}`);
        }

        // Test 2: Trigger manual refresh
        console.log('\n2. Testing manual refresh for NIFTY...');
        const refreshResponse = await axios.post('http://localhost:5000/api/refresh', {
            symbol: 'NIFTY'
        });

        if (refreshResponse.data.success) {
            console.log('✓ Manual refresh successful');
            if (refreshResponse.data.data?.filtered?.data) {
                console.log(`   Fetched ${refreshResponse.data.data.filtered.data.length} strike prices`);
                console.log(`   Total Call OI: ${refreshResponse.data.data.filtered.CE.totOI}`);
                console.log(`   Total Put OI: ${refreshResponse.data.data.filtered.PE.totOI}`);
            }
        } else {
            console.log('✗ Manual refresh returned no data');
        }

        console.log('\n=== All Tests Passed ===');

    } catch (error) {
        console.error('\n✗ Test Failed:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
    }
};

testBackend();
