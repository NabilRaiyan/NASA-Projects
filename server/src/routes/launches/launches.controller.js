const {existLaunchWithId, abortedLaunchById, scheduleNewLaunch, getAllLaunches} = require('../../models/launches.mode');


async function httpGetAllLaunches(req, res){
    return await res.status(200).json(getAllLaunches());
}

async function httpAddNewLaunch(req, res){
    const launch = req.body;

    if(!launch.mission || !launch.rocket ||!launch.launchDate || !launch.target){
        return res.status(400).json({
            error: 'Mission required launch property'
        });
    }
    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)){
        return res.status(400).json({
            error: 'Invalid launch date'
        });
    }


    scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

function httpAbortLaunch(req, res){
    const launchId = Number(req.params.id);

    if (!existLaunchWithId(launchId)){
        return res.status(404).json({
            error:'Launch not found',
        });
    }
    

    const aborted = abortedLaunchById(launchId)
    return res.status(200).json(aborted);
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
    
}