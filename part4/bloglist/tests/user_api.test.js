const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const helper = require('./test_helper');
const bcrypt = require('bcrypt')

//...

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('passw', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'jonbo',
            name: 'Jonas Boström',
            password: 'abc123',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    describe("creation fails with proper statuscode and message when username", () => {
        test('is too short', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'jo',
                name: 'Jonas Boström',
                password: 'abc123',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            expect(result.body.error).toContain("User validation failed: username: Path `username` (`jo`) is shorter than the minimum allowed length (3).")

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)

        })

        test('is not supplied', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                name: 'Jonas Boström',
                password: 'abc123',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            expect(result.body.error).toContain("User validation failed: username: Path `username` is required.")

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)

        })

        test('is already in the database', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'root',
                name: 'Jonas Boström',
                password: 'abc123',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            expect(result.body.error).toContain("User validation failed: username: Error, expected `username` to be unique. Value: `root`")

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)

        })
    })

    describe("creation fails with proper statuscode and message when password", () => {
        test('is too short', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'jonbo',
                name: 'Jonas Boström',
                password: 'x',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            expect(result.body.error).toContain("password is shorter than the minimum allowed length (3)")

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)

        })

        test('is not supplied', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'jonbo',
                name: 'Jonas Boström'
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)

            expect(result.body.error).toContain("password is missing")

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)

        })
    })

})

afterAll(() => {
    mongoose.connection.close()
})

