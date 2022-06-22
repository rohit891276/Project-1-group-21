const AuthorModel = require('../models/authorModel');
const BlogModel = require('../models/blogModel');

const createBlog = async function (req, res) {
    try {
        let data = req.body;
        if (!data.authorId)
            return res.status(400).send({ status: false, msg: 'enter author id' })
        let check = await AuthorModel.findById(data.authorId);
        if (!check)
            return res.status(400).send({ status: false, msg: 'enter valid author id' });
        const createdBlog = await BlogModel.create(data);
        if (!createdBlog)
            return res.status(400).send({ status: false, msg: 'data required' });
        res.status(201).send({ status: true, msg: createdBlog });
    } catch (err) {
        res.status(500).send({
            status: false,
            msg: err.message,
        });
    }
};


const getAllBlogs = async function (req, res) {
    try {
      let data = req.query;
      let allBlogs = await BlogModel.find(
        data,
        { isDeleted: false },
        { isPublished: true }
      );
      if (!allBlogs) {
        return res.status(404).send({ msg: 'blogs not found' });
      }
      res.status(200).send(allBlogs);
    } catch (err) {
      res.status(500).send({ msg: 'Error', error: err.message });
    }
  };


const updateBlog = async function (req, res) {
    try {
        let id = req.params.blogId;
        let data = req.body;
        let blog = await BlogModel.findOne({ _id: id, isDeleted: false });
        if (Object.keys(data).length == 0) {
            return res.status(404).send('No such blog found');
        }
        if (data.title) blog.title = data.title;
        if (data.category) blog.category = data.category;
        if (data.body) blog.body = data.body;
        if (data.tags) {
            blog.tags.push(data.tags);
        }
        if (data.subcategory) {
            blog.subcategory.push(data.subcategory);
        }
        blog.isPublished = true;
        blog.publishedAt = Date();
        let updateData = await BlogModel.findByIdAndUpdate({ _id: id }, blog, { new: true });
        res.status(200).send({ msg: updateData });
    } catch (err) {
        res.status(500).send({ msg: 'Error', error: err.message });
    }
};


const deleteByParams = async function (req, res) {
    try {
        let id = req.params.blogId;
        const allBlogs = await BlogModel.findOne({ _id: id, isDeleted: false })
        if (!allBlogs) {
            return res.status(404).send({ status: false, Msg: "This blog is deleted." })
        };
        allBlogs.isDeleted = true;
        const updated = await BlogModel.findByIdAndUpdate({ _id: id }, allBlogs, { new: true })
        res.status(200).send({ status: true, Msg: updated })
    }
    catch (err) {
        res.status(500).send({ Status: "SERVER ERROR", Msg: err.message })
    }
}

const deletedByQuery = async function (req, res) {
    try {
        let data = req.query;
        if (!data.authorId)
            return res.status(400).send({ status: false, msg: 'author id required' });
        let queryData = {};
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: 'no query params' });
        }
        queryData = data;
        const check = await BlogModel.find(queryData).count();
        if (check == 0)
            return res.status(404).send({ status: false, msg: 'data not found' });
        const deletedData = await BlogModel.updateMany(queryData, {
            $set: {
                isDeleted: true,
                deletedAt: Date(),
            },
        });
        res.status(200).send({
            status: true,
            data: deletedData,
        });
        console.log(queryData);
    } catch (err) {
        res.status(500).send({
            status: false,
            msg: err.message,
        });
    }
};

module.exports.createBlog = createBlog;
module.exports.getAllBlogs = getAllBlogs
module.exports.updateBlog = updateBlog
module.exports.deleteByParams = deleteByParams
module.exports.deletedByQuery = deletedByQuery