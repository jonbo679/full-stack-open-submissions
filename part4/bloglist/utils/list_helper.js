const dummy = (blogs) => {
    return 1;
}

const totalLikes = (blogs) => {
    let numberOfLikes = 0;
    blogs.forEach(blog => {
        if (blog.likes) {
            numberOfLikes += blog.likes;
        }
    })
    return numberOfLikes;
}

const favoriteBlog = (blogs) => {
    let favoriteBlog = {};
    blogs.forEach(blog => {
        if ((!favoriteBlog.likes && blog.likes) || (blog.likes && favoriteBlog.likes && blog.likes > favoriteBlog.likes)) {
            favoriteBlog = {
                "title": blog.title,
                "author": blog.author,
                "likes": blog.likes
            }
        }
    })
    return favoriteBlog;
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}