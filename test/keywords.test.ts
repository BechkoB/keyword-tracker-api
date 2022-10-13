describe('Keywords Test', () => {
    it('Should get all keywords /POST ---> array of Keywords', async () => {
        const response = await request(app).post('/keywords/all')
            .send({hasFilters: false})
            .query({skip: 10})
            .expect(200)
        expect(response.body.items.length).toBeGreaterThan(0)
    }, 5000)
})