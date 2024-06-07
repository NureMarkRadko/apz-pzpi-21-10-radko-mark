const {Employee, User} = require('../models/models')
const {where} = require("sequelize");
const nodemailer = require('nodemailer')
const languages = require('../locale/lang')

class employeeController {
    async create (req, res){
        let preferredLang
        try {
            const { Role, Description, DepartmentId, UserId, Lang } = req.body;
            preferredLang = Lang
            const user = await User.findOne({
                where: { UserId: UserId } });

            if (!user) {
                console.error("User is not found");
                return res.status(404).json({error: languages.getLocalizedString(preferredLang, "User is not found")});
            }

            const employee = await Employee.create({
                UserUserId: UserId,
                Role: Role,
                Description: Description,
                DepartmentDepartmentId: DepartmentId
            });

            return res.status(201).json(employee);
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }

    async update (req, res){
        let preferredLang
        try {
            const { Role, Description, EmployeeId, Lang } = req.body;
            preferredLang = Lang
            const employee = await Employee.findOne({
                where: { EmployeeId: EmployeeId }
            });

            if (!employee) {
                return res.status(404).json({error: languages.getLocalizedString(preferredLang, "Employee is not found")});
            }

            employee.Role = Role || employee.Role;
            employee.Description = Description || employee.Description;

            await employee.save();

            return res.status(200).json(employee);
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }

    async delete (req, res){
        let preferredLang
        try {
            const { EmployeeId, Lang } = req.body;
            preferredLang = Lang
            const employee = await Employee.findOne({
                where: { EmployeeId: EmployeeId }
            });

            if (!employee) {
                return res.status(404).json({error: languages.getLocalizedString(preferredLang, "Employee is not found")});
            }

            await employee.destroy();

            return res.status(202).json({message: languages.getLocalizedString(preferredLang, "Employee deleted")});
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }
}

module.exports = new employeeController()