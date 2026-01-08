const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const { fetchNSEData, closeBrowser } = require('./services/nseService');

dotenv.config();

console.log('DEBUG: Env Check');
console.log('PORT:', process.env.PORT);
console.log('USE_MOCK_DATA:', process.env.USE_MOCK_DATA);
console.log('CWD:', process.cwd());

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oi_dashboard')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api', apiRoutes);

// Store previous data for comparison
let previousDataCache = {};

const hasDataChanged = (symbol, newData, oldData) => {
    if (!oldData) return true;

    // Compare total OI strictly
    const newCE = newData?.filtered?.CE?.totOI || 0;
    const oldCE = oldData?.filtered?.CE?.totOI || 0;
    const newPE = newData?.filtered?.PE?.totOI || 0;
    const oldPE = oldData?.filtered?.PE?.totOI || 0;

    return newCE !== oldCE || newPE !== oldPE;
};

// Fetch data sequentially to avoid multiple browser instances
const symbols = ['NIFTY'];
let isFetching = false;

const fetchAllSymbols = async () => {
    if (isFetching) {
        console.log('⏭️  Previous fetch still in progress, skipping...');
        return;
    }

    isFetching = true;
    console.log('🔄 Polling NSE Data...');

    // Fetch symbols SEQUENTIALLY, not in parallel
    for (const symbol of symbols) {
        try {
            const data = await fetchNSEData(symbol);

            // Handle "No Change" specialized object
            if (data && data.status === 'no_change') {
                console.log(`- ${symbol}: No OI changes detected (Skipped Save)`);
            } else if (data) {
                // Data was saved (since fetchNSEData only returns data if it saved it)
                console.log(`✓ ${symbol}: Data changed & saved to DB`);
                previousDataCache[symbol] = data; // Cache recent
            } else {
                console.log(`✗ ${symbol}: Failed to fetch data (Network/Error)`);
            }
        } catch (error) {
            console.error(`✗ Error fetching ${symbol}:`, error.message);
        }
    }

    isFetching = false;
    console.log('✓ Polling cycle complete\n');
};

// Poll every 5 seconds as requested
setInterval(fetchAllSymbols, 5000);

// Initial fetch on start (delayed to allow server to fully start)
setTimeout(async () => {
    console.log('🚀 Initial fetch starting...');
    await fetchAllSymbols();
}, 3000);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await closeBrowser();
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await closeBrowser();
    await mongoose.connection.close();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
