const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const helper = require('./test_helper');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

let token = undefined;

beforeEach(async () => {


    await User.deleteMany({})
    const user = new User({
        "username": "test",
        "name": "Tester",
        "password": "abc123",
        "_id": "5a422a851b54a676234d17f9"
    });
    await user.save();

    const userForToken = {
        username: user.username,
        id: user._id,
    }

    token = jwt.sign(userForToken, process.env.SECRET);

    await Blog.deleteMany({})
    let blogObjects = helper.initialBlogList
        .map(blog => new Blog(blog));
    const promiseArray = blogObjects.map(blog => blog.save());
    await Promise.all(promiseArray);
})

test('There is a correct number of blog posts', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogList.length)
})

test('The identifier is named id', async () => {

    const response = await api.get('/api/blogs/');
    expect(response.body[0].id).toBeDefined();
})

describe('adding a', () => {

    test('correct post', async () => {
        const newBlog = {
            title: 'Favor progress over pride in open-source',
            author: 'Kent C. Dodds',
            url: 'https://kentcdodds.com/blog/favor-progress-over-pride-in-open-source',
            likes: 0,
        }

        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + token)
            .send(newBlog)

        const response = await api.get('/api/blogs')

        const blogs = response.body.map(r => {
            return ({
                title: r.title,
                author: r.author,
                url: r.url,
                likes: r.likes
            })
        });


        expect(response.body).toHaveLength(helper.initialBlogList.length + 1);
        expect(blogs).toContainEqual(newBlog);
    })

    test('post without likes', async () => {
        const newBlog = {
            title: 'Favor progress over pride in open-source',
            author: 'Kent C. Dodds',
            url: 'https://kentcdodds.com/blog/favor-progress-over-pride-in-open-source',
        }

        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + token)
            .send(newBlog)

        const response = await api.get(`/api/blogs/`);

        const likes = response.body.map(r => r.likes);

        expect(likes).toContain(0);

    })

    test('post with no title should result in status=400', async () => {
        const newBlog = {
            author: 'Kent C. Dodds',
            url: 'https://kentcdodds.com/blog/favor-progress-over-pride-in-open-source',
            likes: 10
        }

        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + token)
            .send(newBlog)
            .expect(400)
    })

    test('post with no url should result in status=400', async () => {
        const newBlog = {
            title: 'Favor progress over pride in open-source',
            author: 'Kent C. Dodds',
            likes: 10
        }

        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + token)
            .send(newBlog)
            .expect(400)
    })

    test('post with no token should result in status=401', async () => {
        const newBlog = {
            title: 'Favor progress over pride in open-source',
            author: 'Kent C. Dodds',
            likes: 10
        }

        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)

        expect(response.body.error).toContain('token missing');
    })
})

describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToDelete = blogsAtStart[0];

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', 'bearer ' + token)
            .expect(204)
        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(
            helper.initialBlogList.length - 1
        )

        const titles = blogsAtEnd.map(r => r.title)

        expect(titles).not.toContain(blogToDelete.title)
    })
})

describe('updating a blog', () => {
    test('new number of likes is updated', async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToUpdate = blogsAtStart[0];
        blogToUpdate.likes = 365;

        await api.
            put(`/api/blogs/${blogToUpdate.id}`)
            .send(blogToUpdate);
        const blogsAtEnd = await helper.blogsInDb()

        const likes = blogsAtEnd.map(r => r.likes)

        expect(likes).toContain(365)
    })
})

afterAll(() => {
    mongoose.connection.close()
})

