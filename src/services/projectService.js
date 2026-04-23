const projectModel = require("../models/projectModel");

exports.getAllProjects = async () =>
{
    return await projectModel.findAll();
};

exports.getProjectsByType = async (type) =>
{
    return await projectModel.findByType(type);
};

exports.getProjectById = async (id) =>
{
    return await projectModel.findById(id);
};

exports.getProjectBySlug = async (slug) =>
{
    return await projectModel.findBySlug(slug);
};
