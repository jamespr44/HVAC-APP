"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const schema_1 = require("./schema");
async function seed() {
    console.log('🌱 Seeding Australian climate data...');
    const data = [
        { location: 'Sydney', state: 'NSW', latitude: '-33.87', longitude: '151.21', summerDbC: '33.4', summerWbC: '24.4', winterDbC: '8.0', dailyRangeC: '7.2', altitudeM: 6, bomStationId: '066062' },
        { location: 'Melbourne', state: 'VIC', latitude: '-37.81', longitude: '144.97', summerDbC: '34.7', summerWbC: '23.1', winterDbC: '5.4', dailyRangeC: '10.1', altitudeM: 31, bomStationId: '086071' },
        { location: 'Brisbane', state: 'QLD', latitude: '-27.47', longitude: '153.03', summerDbC: '33.1', summerWbC: '25.8', winterDbC: '10.0', dailyRangeC: '8.6', altitudeM: 4, bomStationId: '040223' },
        { location: 'Perth', state: 'WA', latitude: '-31.95', longitude: '115.86', summerDbC: '38.2', summerWbC: '23.6', winterDbC: '7.7', dailyRangeC: '11.4', altitudeM: 15, bomStationId: '009021' },
        { location: 'Adelaide', state: 'SA', latitude: '-34.92', longitude: '138.62', summerDbC: '38.8', summerWbC: '22.0', winterDbC: '6.7', dailyRangeC: '10.6', altitudeM: 48, bomStationId: '023034' },
        { location: 'Canberra', state: 'ACT', latitude: '-35.31', longitude: '149.20', summerDbC: '33.2', summerWbC: '20.8', winterDbC: '-1.5', dailyRangeC: '12.3', altitudeM: 578, bomStationId: '070351' },
        { location: 'Hobart', state: 'TAS', latitude: '-42.88', longitude: '147.33', summerDbC: '28.7', summerWbC: '19.8', winterDbC: '2.0', dailyRangeC: '8.5', altitudeM: 4, bomStationId: '094029' },
        { location: 'Darwin', state: 'NT', latitude: '-12.46', longitude: '130.84', summerDbC: '34.5', summerWbC: '28.2', winterDbC: '19.5', dailyRangeC: '7.1', altitudeM: 30, bomStationId: '014015' },
        { location: 'Gold Coast', state: 'QLD', latitude: '-28.00', longitude: '153.43', summerDbC: '31.4', summerWbC: '25.0', winterDbC: '11.0', dailyRangeC: '7.4', altitudeM: 3, bomStationId: '040764' },
        { location: 'Townsville', state: 'QLD', latitude: '-19.25', longitude: '146.77', summerDbC: '34.8', summerWbC: '28.2', winterDbC: '14.0', dailyRangeC: '10.9', altitudeM: 5, bomStationId: '032040' },
        { location: 'Newcastle', state: 'NSW', latitude: '-32.92', longitude: '151.78', summerDbC: '33.0', summerWbC: '23.5', winterDbC: '7.5', dailyRangeC: '8.0', altitudeM: 9, bomStationId: '061078' },
        { location: 'Wollongong', state: 'NSW', latitude: '-34.42', longitude: '150.89', summerDbC: '30.5', summerWbC: '23.8', winterDbC: '8.5', dailyRangeC: '6.5', altitudeM: 32, bomStationId: '068034' },
    ];
    for (const record of data) {
        await index_1.db.insert(schema_1.climateData).values(record).onConflictDoNothing({ target: schema_1.climateData.location });
        console.log(`✅ Seeded ${record.location}`);
    }
    console.log('✅ Seeding complete.');
    process.exit(0);
}
seed().catch(err => {
    console.error('❌ Failed to seed:', err);
    process.exit(1);
});
