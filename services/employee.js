const { Gender, ID_Type, Status, Prisma, Type } = require('@prisma/client');
const { type } = require('os');
const prismaClient = require('../db/prisma');
const {CreateTempSignIn} = require("./login");

async function create(data) {
    try {
        if (data) {
            const employee_response = await prismaClient.$transaction(async (prisma) => {
                const employee = await prismaClient.employees.create({
                    data: {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        phone_number: data.phone_number,
                        gender: data.gender === 'male' ? Gender.MALE : Gender.FEMALE,
                        identity_type: data.id_type === "idcard" ? ID_Type.ID_CARD : ID_Type.PASSPORT,
                        identity_number: data.id_number,
                        img: "test.png",
                        createdAt: new Date().toISOString(),
                        status: Status.PENDING
                    }
                })
                if (!employee.id) {
                    return undefined;
                }
                const addresses = await prismaClient.employeeAddresses.create({
                    data: {
                        employee_id: employee.id,
                        street_no: data.street,
                        house_no: data.house_no
                    }
                })
                return { ...employee, addresses };
            });
            return employee_response;
        }
        return undefined;
    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

async function update(data) {
    try {
        if (data) {
            const employee_response = await prismaClient.$transaction(async (prisma) => {
                const employee = await prismaClient.employees.update({
                    where:{
                        id: Number(data.id)
                    },
                    data: {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        phone_number: data.phone_number,
                        gender: data.gender === 'male' ? Gender.MALE : Gender.FEMALE,
                        identity_type: data.id_type === "idcard" ? ID_Type.ID_CARD : ID_Type.PASSPORT,
                        identity_number: data.id_number,
                        img: "test.png",
                        updatedAt: new Date().toISOString(),
                        status: Status.PENDING
                    }
                })
                if (!employee.id) {
                    return undefined;
                }
                const addresses = await prismaClient.employeeAddresses.updateMany({
                    where:{
                        employee_id: Number(data.id)
                    },
                    data: {
                        street_no: data.street,
                        house_no: data.house_no
                    }
                })
                return { ...employee, addresses };
            });
            return employee_response;
        }
        return undefined;
    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

async function getAll() {
    try {
        const employees = await prismaClient.employees.findMany({
            select:{
                first_name: true,
                last_name: true,
                email: true,
                phone_number: true,
                id: true,
                status: true
            },
            orderBy: {
                id: Prisma.SortOrder.desc
            }
        });

        if (!employees) {
            return undefined;
        }
        return employees;
    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

async function getEmployee(id) {
    try {
        const employee = await prismaClient.employees.findFirst({
            where: {
                id: Number(id)
            },
            select:{
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone_number: true,
                gender: true,
                identity_type: true,
                identity_number: true,
                img: true,
                employee_addresses: true
            }
        })
        if (!employee) {
            return undefined;
        }
        return employee;
    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

module.exports = {
    create: create,
    getAll: getAll,
    getEmployee: getEmployee,
    update: update
}