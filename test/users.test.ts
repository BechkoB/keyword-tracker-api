const request = require('supertest');
const app = require('../src/app');

describe('User login', () => {
    it('should return user credentials and token', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({email: 'test@abv.bg', password: '123456'});
        expect(response.statusCode).toEqual(200);
    });
});