const {Appointment, Employee, User} = require('../models/models')
const {where} = require("sequelize");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const languages = require('../locale/lang')

class appointmentController {
    async create(req, res){
        let preferredLang
        try {
            const { PetId, DateAndTime, EmployeeId, Lang } = req.body;
            preferredLang = Lang

            const appointment = await Appointment.create({
                EmployeeEmployeeId: EmployeeId,
                PetPetId: PetId,
                DateAndTime
            });

            return res.status(201).json(appointment);
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }

    async update(req, res) {
        let preferredLang
        try {
            const { AppointmentId, PetId, DateAndTime, Lang } = req.body;
            preferredLang = Lang
            const appointment = await Appointment.findByPk(AppointmentId);
            if (!appointment) {
                return res.status(404).json({error: languages.getLocalizedString(preferredLang, "Appointment not found")});
            }

            appointment.PetId = PetId;
            appointment.DateAndTime = DateAndTime;

            await appointment.save();

            return res.status(200).json(appointment);
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }

    async delete(req, res){
        let preferredLang
        try {
            const { AppointmentId, Lang } = req.body;
            preferredLang = Lang
            const appointment = await Appointment.findByPk(AppointmentId);
            if (!appointment) {
                return res.status(404).json({error: languages.getLocalizedString(preferredLang, "Appointment not found")});
            }

            await appointment.destroy();

            return res.status(404).json({message: languages.getLocalizedString(preferredLang, "Appointment deleted")});
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString(preferredLang, "Internal Server Error - Unexpected error")});
        }
    }

    async getWhereUser(req, res){
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const UserId = decoded.UserId;

            const appointments = await Appointment.findAll({
                include: [
                    {
                        model: User,
                        where: { UserId }
                    }
                ]
            });

            return res.status(200).json(appointments);
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString('en', "Internal Server Error - Unexpected error")});
        }
    }

    async getWhereEmployee(req, res){
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const UserId = decoded.UserId;

            const employee = await Employee.findOne({
                where: { UserUserId: UserId }
            });
            if (!employee) {
                return res.status(404).json({error: languages.getLocalizedString('en', "Employee is not found")});
            }

            const appointments = await Appointment.findAll({
                where: { EmployeeEmployeeId: employee.EmployeeId }
            });

            return res.status(200).json(appointments);
        } catch (error) {
            console.error("Unexpected error:", error);
            return res.status(500).json({error: languages.getLocalizedString('en', "Internal Server Error - Unexpected error")});
        }
    }
}

module.exports = new appointmentController()