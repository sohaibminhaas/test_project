const express = require('express');
const router = express.Router();
const { create, update, getUser } = require("../services/user")
const { getSkills } = require("../services/skills")

module.exports = () => {
    router.get('/user', async (req, res) => {
        if (req.session.admin) {
            const skills = await getSkills();
            res.render("user", {
                session: req.session.admin,
                isEdit: false,
                skills: skills
            });
        } else {
            res.redirect('/');
        }
    });

    router.get('/user/:id', async (req, res) => {
        if (req.session.admin) {
            const user = await getUser(req.params.id);
            const skills = await getSkills();
            res.render("user", {
                session: req.session.admin,
                user: user,
                isEdit: true,
                skills: skills
            });
        } else {
            res.redirect('/');
        }
    });

    router.post('/user', async (req, res) => {
        try {
            if (req.session.admin) {
                const data = Object.assign(req.body);
                console.log("data:", data)
                if (data) {
                    const user_response = await create(data, req.session.admin);
                    if (user_response) {
                        return res.send({
                            status: true,
                            data: user_response
                        })
                    }
                }
                return res.send({
                    status: false,
                    data: undefined
                })
            } else {
                res.redirect('/');
            }
        } catch (error) {
            return res.send({
                status: false,
                data: undefined
            })
        }
    });

    router.put('/user', async (req, res) => {
        try {
            if (req.session.admin) {
                const data = Object.assign(req.body);
                if (data) {
                    const user_response = await update(data);
                    console.log("user_response: ", user_response)
                    if (user_response) {
                        return res.send({
                            status: true,
                            data: user_response
                        })
                    }
                }
                return res.send({
                    status: false,
                    data: undefined
                })
            } else {
                res.redirect('/');
            }
        } catch (error) {
            return res.send({
                status: false,
                data: undefined
            })
        }
    });

    return router;
}