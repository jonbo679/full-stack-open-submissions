const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const user = require('../models/user');

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
    response.json(blogs);
})



blogsRouter.post('/', async (request, response) => {

    if (!request.token) {
        return response.status(401).json({ error: 'token missing' });
    }
    const decodedToken = jwt.verify(request.token, process.env.SECRET);

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);

    const blog = new Blog({
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes,
        user: user._id
    })

    if (blog.title && blog.url) {

        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id);
        await user.save();

        response.status(201).json(savedBlog);
    } else {
        response.status(400).end();
    }
})

blogsRouter.delete('/:id', async (request, response) => {

    if (!request.token) {
        return response.status(401).json({ error: 'token missing' });
    }
    const decodedToken = jwt.verify(request.token, process.env.SECRET);

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' });
    }

    const blog = await Blog.findById(request.params.id);
    if (!blog) {
        return response.status(204).end();
    }

    if (blog.user && blog.user.toString() === decodedToken.id) {
        const user = await User.findById(decodedToken.id);
        user.blogs.splice(blog.id, 1);

        await user.save();
        await blog.remove();

        return response.status(204).end();
    } else {
        return response.status(403).json({ error: 'no permission to delete blog post' })
    }
})

blogsRouter.put('/:id', async (request, response) => {

    const body = request.body;

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
})

module.exports = blogsRouter