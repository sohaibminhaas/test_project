const { Type, Status } = require('@prisma/client');
const prismaClient = require('../db/prisma');
const { passwordToHash, RandomCode } = require("../utils/helper");
const { sendEmail } = require('../utils/send-email');

function login(data) {
    try {
        if (data) {
            const admin = prismaClient.admins.findFirst({
                where: {
                    AND: [
                        {
                            password: passwordToHash(data.password)
                        },
                        {
                            OR: [
                                {
                                    email: data.user_name,
                                },
                                {
                                    phone_number: data.user_name
                                }
                            ]
                        },
                        {
                            status: Status.ACTIVE
                        }
                    ]
                },
                select: {
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone_number: true,
                    role: true,
                    id: true
                }
            })
            return admin;
        }
        return undefined;
    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

async function CreateTempSignIn(id, type, email) {
    try {
        const code = RandomCode();
        const temp_signin_response = await prismaClient.$transaction(async (prisma) => {
            const temp_sign_in = await prismaClient.tempSignIn.create({
                data: {
                    type: type,
                    type_id: id,
                    code: code,
                    createdAt: new Date().toISOString(),
                }
            })
            if (!temp_sign_in.id) {
                return undefined;
            }
            if (temp_sign_in) {
                await sendEmail(code, email, type, temp_sign_in.id);
            }
            return temp_sign_in;
        });
        return temp_signin_response;

    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

async function getTempSigninDetails(id, code) {
    try {
        const temp_sign_in_details = await prismaClient.tempSignIn.findFirst({
            where: {
                AND: [
                    {
                        is_validated: false
                    },
                    {
                        id: Number(id)
                    },
                    {
                        code: Number(code)
                    }
                ]
            },
            select: {
                id: true,
                type_id: true,
                type: true,
                code: true
            }
        })
        console.log("temp_sign_in_details:", temp_sign_in_details)
        return temp_sign_in_details;

    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

async function createAdmin(data) {
    try {
        const admin_response = await prismaClient.$transaction(async (prisma) => {
            const temp_sign_in_response = await getTempSigninDetails(data.temp_id, data.code);
            if (!temp_sign_in_response.id) {
                return undefined;
            }

            let user;
            if (temp_sign_in_response.type === Type.EMPLOYEE) {
                user = await prismaClient.employees.findFirst({
                    where: {
                        id: temp_sign_in_response.type_id
                    },
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone_number: true,
                    }
                });
            } else {
                user = await prismaClient.users.findFirst({
                    where: {
                        id: temp_sign_in_response.type_id
                    },
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone_number: true
                    }
                });
            }

            const admin = await prismaClient.admins.create({
                data: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone_number: user.phone_number,
                    password: passwordToHash(data.password),
                    role: temp_sign_in_response.type === Type.EMPLOYEE ? Type.EMPLOYEE : Type.USER,
                    createdAt: new Date().toISOString(),
                    status: Status.ACTIVE
                }
            });

            if (!admin.id) {
                return undefined;
            }

            await prismaClient.tempSignIn.update({
                where: {
                    id: Number(data.temp_id)
                },
                data: {
                    is_validated: true
                }
            });

            return admin;
        });
        return admin_response;

    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

async function deleteFunction(data){
    let response;
    if(data.type === Type.EMPLOYEE){
        response = await prismaClient.employees.update({
            where: {
                id: Number(data.id)
            },
            data: {
                status: Status.DELETED
            }
        });
    }else if(data.type === Type.USER){
        response = await prismaClient.users.update({
            where: {
                id: Number(data.id)
            },
            data: {
                status: Status.DELETED
            }
        });
    }
    console.log("response", response)
    if(response.id){
        await prismaClient.admins.updateMany({
            where: {
                email: response.email
            },
            data: {
                status: Status.DELETED
            }
        });
    }
    return response;
}

module.exports = {
    login: login,
    CreateTempSignIn: CreateTempSignIn,
    getTempSigninDetails: getTempSigninDetails,
    createAdmin: createAdmin,
    deleteFunction: deleteFunction
}