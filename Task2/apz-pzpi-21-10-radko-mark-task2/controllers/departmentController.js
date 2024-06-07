const {Department} = require('../models/models')
const {where} = require("sequelize");
const nodemailer = require('nodemailer')
const languages = require('../locale/lang')
const {Op} = require('sequelize')

class departmentController {
    async create (req, res){
        let preferredLang
        try {
            const { Address, StartWorkingTime, EndWorkingTime, Name, Info, PhoneNumber, CompanyId, Lang } = req.body;
            preferredLang = Lang
            const department = await Department.create({
                Address: Address,
                StartWorkingTime: StartWorkingTime,
                EndWorkingTime: EndWorkingTime,
                Name: Name,
                Info: Info,
                PhoneNumber: PhoneNumber,
                CompanyCompanyId: CompanyId
            });

            return res.status(201).json(department);
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }

    async update (req, res){
        let preferredLang
        try {
            const { Address, StartWorkingTime, EndWorkingTime, Name, Info, PhoneNumber, DepartmentId, Lang } = req.body;
            preferredLang = Lang
            const department = await Department.findOne({
                where: { DepartmentId: DepartmentId }
            });
            if (!department) {
                return res.status(404).json({error: languages.getLocalizedString(preferredLang, "Department is not found")});
            }

            department.Address = Address;
            department.StartWorkingTime = StartWorkingTime;
            department.EndWorkingTime = EndWorkingTime;
            department.Name = Name;
            department.Info = Info;
            department.PhoneNumber = PhoneNumber;

            await department.save();

            return res.status(200).json(department);
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }

    async delete (req, res){
        let preferredLang
        try {
            const { DepartmentId, Lang } = req.body;
            preferredLang = Lang
            const department = await Department.findOne({
                where: { DepartmentId: DepartmentId }
            });
            if (!department) {
                return res.status(404).json({ message: "Department is not found" });
            }

            await department.destroy();

            return res.status(200).json({ message: "department was deleted" });
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }

    async searchByAddress(req, res) {
        let preferredLang
        try {
            const { Address, Lang } = req.body;
            preferredLang = Lang
            if (!Address) {
                return res.status(400).json({ message: "No address specified" });
            }

            const departments = await Department.findAll({
                where: {
                    Address: {
                        [Op.like]: `%${Address}%`
                    }
                }
            });

            if (!departments || departments.length === 0) {
                return res.status(404).json({error: languages.getLocalizedString(preferredLang, "Department is not found")});
            }

            return res.status(200).json(departments);
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }
}

module.exports = new departmentController()