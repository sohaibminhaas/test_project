const { Gender, ID_Type, Status, Prisma } = require('@prisma/client');
const prismaClient = require('../db/prisma');

async function getSkills() {
    try {
        const skills = await prismaClient.skills.findMany({
            where: {
                status: Status.ACTIVE
            }
        })
        if (!skills) {
            return undefined;
        }
        return skills;
    } catch (error) {
        console.log("login error: ", error);
        return undefined;
    }
}

module.exports = {
    getSkills: getSkills,
}