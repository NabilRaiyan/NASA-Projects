const PORT = process.env.PORT || 8000;
require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL;
const http = require('http');
const app = require('./app');
const {loadPlanetData} = require('./models/planets.model');
const {loadLaunchData} = require('./models/launches.mode');
const { default: mongoose } = require('mongoose');


const server = http.createServer(app);

mongoose.connection.once('open', ()=>{
    console.log("MongoDB connnection ready...");
});

mongoose.connection.on('error', (err)=>{
    console.error(err);
});


async function startServer(){
    await mongoose.connect(MONGO_URL);
    await loadPlanetData();
    await loadLaunchData();

server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});

}
startServer();


