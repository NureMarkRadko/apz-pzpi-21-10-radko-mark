const {Company} = require('../models/models')
const {where} = require("sequelize");
const nodemailer = require('nodemailer')
const languages = require('../locale/lang')
const jwt = require('jsonwebtoken')
class companyController {
    async create(req, res) {
        let preferredLang
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const UserId = decoded.UserId;

            const { Name, Description, Lang } = req.body;
            preferredLang = Lang
            if (!Name || !Description) {
                console.error("Some required fields are missing")
                return res.status(400).json({error: languages.getLocalizedString(preferredLang, "Bad Request - Some required fields are missing")});
            }

            const newCompany = await Company.create({
                Name:Name,
                Description: Description,
                UserUserId: UserId
            });

            return res.status(201).json(newCompany);
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }

    async update(req, res) {
        let preferredLang
        try {
            const { Name, Description, CompanyId, Lang } = req.body;
            preferredLang = Lang
            const company = await Company.findOne({
                where: {CompanyId: CompanyId}
            })

            if (!company) {
                return res.status(404).json({error: languages.getLocalizedString(preferredLang, "Company is not found")});
            }

            company.Name = Name || company.Name;
            company.Description = Description || company.Description;
            await company.save();

            return res.status(200).json(company);
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }

    async delete(req, res) {
        let preferredLang
        try {
            const { CompanyId, Lang} = req.body;
            preferredLang = Lang
            const company = await Company.findOne({
                where: {CompanyId: CompanyId}
            })

            if(!company){
                return res.status(404).json({ message: "Company is not found" });
            }

            await company.destroy();

            return res.status(200).json({ message: "Company was deleted" });
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }
}

module.exports = new companyController()