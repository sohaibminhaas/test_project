const { Gender, ID_Type, Status, Prisma, Type} = require('@prisma/client');
const prismaClient = require('../db/prisma');
const {CreateTempSignIn} = require("./login");

async function create(data, session) {
    try {
        if (data) {
            const user_response = await prismaClient.$transaction(async (prisma) => {
                const user = await prismaClient.users.create({
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
                        status: Status.PENDING,
                        createdById: Number(session.id),
                        createdByType: session.Role == "EMPLOYEE" ? Type.EMPLOYEE : Type.ROOT,
                        resume: "test.resume",
                        date_of_birth: new Date(data.date_of_birth).toISOString()
                    }
                })
                if (!user.id) {
                    return undefined;
                }
                const addresses = await prismaClient.userAddresses.createMany({
                    data: [
                        {
                            user_id: user.id,
                            street_no: data.street,
                            house_no: data.house_no
                        },
                        {
                            user_id: user.id,
                            street_no: data.work_street,
                            house_no: data.work_house_no
                        }
                    ]
                })
                for(let index = 0; index < data.speciality.length; index++){
                    await prismaClient.userSkills.create({
                        data: {
                            user_id: user.id,
                            skill_id: Number(data.speciality[index]),
                        }
                    })
                }
                return user;
            });
            
            if(user_response){
                await CreateTempSignIn(user_response.id, Type.USER, user_response.email)
            }

            return user_response;
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
            console.log("data:", data)
            const user_response = await prismaClient.$transaction(async (prisma) => {
                await prismaClient.userSkills.deleteMany({
                    where:{
                        user_id:  Number(data.id)
                    }
                })

                const user = await prismaClient.users.update({
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
                        status: Status.ACTIVE,
                        resume: "test.resume",
                        date_of_birth: new Date(data.date_of_birth).toISOString(),
                        is_validated: true
                    }
                })
                if (!user.id) {
                    return undefined;
                }
                await prismaClient.userAddresses.update({
                    where: {
                        id: Number(data.home_address_id)
                    },
                    data: {
                        street_no: data.street,
                        house_no: data.house_no
                    }
                })
                await prismaClient.userAddresses.update({
                    where: {
                        id: Number(data.work_address_id)
                    },
                    data:
                    {
                        street_no: data.work_street,
                        house_no: data.work_house_no
                    }
                })

                for(let index = 0; index < data.speciality.length; index++){
                    await prismaClient.userSkills.create({
                        data: {
                            user_id: user.id,
                            skill_id: Number(data.speciality[index]),
                        }
                    })
                }
                return user;
            });
            return user_response;
        }
        return undefined;
    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

async function getAllUsers() {
    try {
        const users = await prismaClient.users.findMany({
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
        })
        if (!users) {
            return undefined;
        }
        return users;
    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

async function getUsersById(id) {
    try {
        const users = await prismaClient.users.findMany({
            where:{
                createdById: Number(id)
            },
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
        })
        if (!users) {
            return undefined;
        }
        return users;
    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

async function getUser(id) {
    try {
        const users = await prismaClient.users.findFirst({
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
                user_addresses: true,
                user_skills: true,
                date_of_birth: true,
                status: true
            }
        })
        if (!users) {
            return undefined;
        }
        return users;
    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

async function getUserByEmail(email) {
    try {
        const users = await prismaClient.users.findFirst({
            where: {
                email: email
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
                user_addresses: true,
                user_skills: true,
                date_of_birth: true,
                status: true
            }
        })
        if (!users) {
            return undefined;
        }
        return users;
    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

module.exports = {
    create: create,
    getAllUsers: getAllUsers,
    getUser: getUser,
    update: update,
    getUsersById: getUsersById,
    getUserByEmail: getUserByEmail
}