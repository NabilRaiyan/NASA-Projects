const request = require('supertest');
const app = require('../../app'); 


describe ('Test GET /launches', ()=>{
    test('It should response with the 200 success', async ()=>{
        const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
    });
});

describe('Test POST /launches', ()=>{
    test('It should response with 201 created', async ()=>{
        const response = await request(app)
        .post('/v1/launches')
        .send({
            mission: "USS Enterprise",
            rocket: "RAS 1022-d",
            target: "Kepler-186 f",
            launchDate: "January 4, 2048"
        })
        .expect('Content-Type', /json/)
        .expect(201);
    });
    test('It should catch missing requireed properties', ()=>{});
    test('It should catch invalid dates', ()=>{});
});