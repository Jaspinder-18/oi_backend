const mongoose = require('mongoose');
const OIData = require('./models/OIData');

mongoose.connect('mongodb://127.0.0.1:27017/oi_dashboard')
    .then(async () => {
        console.log('Connected to DB');
        const count = await OIData.countDocuments();
        console.log(`Total Records: ${count}`);
        if (count > 0) {
            const latest = await OIData.findOne().sort({ timestamp: -1 });
            console.log('Latest Record Time:', latest.timestamp);
            console.log('Latest Symbol:', latest.symbol);
            console.log('Data keys:', Object.keys(latest.data));
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
