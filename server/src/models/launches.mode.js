const launches = new Map();
const { flatMap } = require('lodash');
const {launchs} = require('./launches.mongo');
const {planetModel} = require('./planets.mongo');
const axios = require('axios');
const { async } = require('regenerator-runtime');

const DEFAULT_FLIGHT_NUMBER = 100;


const launch = {
    flightNumber: 100,
    mission:"keplaer Exploration X",
    rocket: "Explorer IS1",
    launchDate: new Date('December 27, 2030'),
    target: "Kepler-442 b",
    customers: ["ZTM", "NASA"],
    upcoming: true,
    success: true,
};


saveLaunch(launch);
// launches.set(launch.flightNumber, launch);


async function populateLaunches(){
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select:{
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers':1
                    }
                }
            ]
        } 
    });


    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload)=>{
            return payload['customers'];
        });
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcomming: launchDoc['upcomming'],
            success: launchDoc['success'],
            customers: customers,
        };

        console.log(launch.flightNumber, launch.mission);
        // populate launches collections...
        await saveLaunch(launch)

    }
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';
async function loadLaunchData(){
    console.log("Downloading SpaceX launches data....");
    const firtstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });

    if (firtstLaunch){
        console.log("launches data already loaded..");
        return;
    }
    else{
        await populateLaunches();
    }
    
}

async function findLaunch(filter){
    return await launchs.findOne(filter);
}

async function getAllLaunches(){
    return await launchs.find({}, { '_id':0, '__v':0 });
}

async function saveLaunch(launch){
    await launchs.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    });
}


async function getLatestFlightNumber(){
    const latestLaunch = await launchs
    .findOne()
    .sort('-flightNumber');

    if (!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;


}


async function existLaunchWithId(launchId){
    return await findLaunch({
        flightNumber: launchId,
    });
}

async function scheduleNewLaunch(launch){
    const planet = await planetModel.findOne({
        keplerName: launch.target,
    });

    if (!planet){
        throw new Error('No matching planet was found');
    }
    
    const newFlightnumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch,{
        success: true,
        upcoming:true,
        customers: ["ZTM", "NASA"],
        flightNumber: newFlightnumber,
    });

    await saveLaunch(newLaunch);
}

 


function abortedLaunchById(launchId){
    const aborted = launches.delete(launchId);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted;
}

module.exports ={
    loadLaunchData,
    existLaunchWithId,
    getAllLaunches,
    abortedLaunchById,
    scheduleNewLaunch,
};