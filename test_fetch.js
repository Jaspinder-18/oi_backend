const axios = require('axios');

async function testParam() {
    try {
        console.log("Triggering refresh for NIFTY...");
        const res = await axios.post('http://localhost:5000/api/refresh', { symbol: 'NIFTY' });
        console.log("Response status:", res.status);
        if (res.data.data && res.data.data.records) {
            console.log("SUCCESS: Data received with records.");
        } else {
            console.log("FAILURE: Data received but likely invalid structure:", Object.keys(res.data));
        }
    } catch (e) {
        console.error("Error calling refresh:", e.message);
        if (e.response) {
            console.log("Response data:", e.response.data);
        }
    }
}

testParam();
