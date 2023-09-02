
const fs = require('fs');
const path = require('path');
const {parse} = require('csv-parse');
const {planetModel} = require('./planets.mongo');


// const habitablePlanets = [];

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}


function loadPlanetData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    savePlanet(data);
                }
            })
            .on('error', (err) => {
                console.log(err);
                reject(err);
            })
            .on('end', async () => {
                const countPlanetFound = (await getAllPlanets()).length;
                // console.log(countPlanetFound.map((planet) => {
                //     return planet['kepler_name'];
                // }));
                console.log(`${countPlanetFound} habitable planets found!`);
                resolve();
            });
    })

}

async function getAllPlanets(){
    return await planetModel.find({}, {
        '_id':0, '__v':0,
    });
}

async function savePlanet(planet){
     try{
          // insert + update = upsert
       await planetModel.updateOne({
        keplerName: planet.kepler_name,
    }, {
        keplerName: planet.kepler_name,
    }, {
        upsert:true,
    });
     }
     catch(err){
        console.error(`Could not save a planet ${err}`);
     }
}

module.exports = {
    loadPlanetData,
    getAllPlanets,
};