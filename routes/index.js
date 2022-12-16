const express = require('express');
const router = express.Router();
const employee_routes = require("./employee");
const user_routes = require("./user");
const { login, getTempSigninDetails, createAdmin, deleteFunction, SendWhatsAppOrEmail } = require("../services/login");
const { getAll } = require("../services/employee")
const { getAllUsers, getUsersById, getUserByEmail } = require("../services/user");
const { Type } = require('@prisma/client');

module.exports = () => {
    router.get('/', (req, res) => {
        res.render("login");
    });

    router.get('/home', (req, res) => {
        if (req.session.admin != undefined) {
            if (req.session.admin.role === Type.ROOT) {
                getAll().then((all_employees) => {
                    getAllUsers().then((all_users) => {
                        res.render("home", {
                            session: req.session.admin,
                            employees: all_employees ?? [],
                            all_users: all_users ?? []
                        });
                    });
                });
            } else if (req.session.admin.role === Type.EMPLOYEE) {
                getUsersById(req.session.admin.id).then((all_users) => {
                    res.render("home", {
                        session: req.session.admin,
                        all_users: all_users ?? []
                    });
                });
            }
            else if (req.session.admin.role === Type.USER) {
                getUserByEmail(req.session.admin.email).then((all_users) => {
                    res.render("home", {
                        session: req.session.admin,
                        all_users: [all_users] ?? []
                    });
                })
            }
        } else {
            res.redirect('/');
        }
    });

    router.post('/login', async (req, res) => {
        try {
            const data = Object.assign(req.body);
            if (data.user_name && data.password) {
                const login_response = await login({
                    user_name: data.user_name,
                    password: data.password
                })
                if (login_response) {
                    req.session.admin = login_response;
                    req.session.save();
                    return res.send({
                        status: true,
                        data: login_response
                    })
                }
            }
            return res.send({
                status: false,
                data: undefined
            })
        } catch (error) {
            return res.send({
                status: false,
                data: undefined
            })
        }
    });

    router.get('/temporary/signin/:id', async (req, res) => {
        console.log("data:", req.params.id)
        res.render("temp_login", {
            temp_id: req.params.id
        });
    });

    router.post('/temp/login', async (req, res) => {
        try {
            const data = Object.assign(req.body);
            console.log("data:", data);
            if (data.temp_id && data.code) {
                const temp_login_response = await getTempSigninDetails(data.temp_id, data.code)
                if (temp_login_response) {
                    return res.send({
                        status: true,
                        data: temp_login_response
                    })
                }
            }
            return res.send({
                status: false,
                data: undefined
            })
        } catch (error) {
            return res.send({
                status: false,
                data: undefined
            })
        }
    });

    router.get('/password/reset', async (req, res) => {
        const data = Object.assign(req.query);
        if (data) {
            res.render("set_password", {
                temp_id: data.temp_id,
                code: data.code
            });
        }
    });

    router.post('/password/reset', async (req, res) => {
        const data = Object.assign(req.body);
        if (data) {
            console.log("data:", data);
            const admin_response = await createAdmin(data);
            if (admin_response) {
                return res.send({
                    status: true,
                    data: admin_response
                })
            }
            return res.send({
                status: false,
                data: undefined
            })
        }
    });

    router.get("/logout", (req, res) => {
        req.session.destroy();
        res.redirect('/')
    });

    router.post('/delete/user', async (req, res) => {
        try {
            const data = Object.assign(req.body);
            if (data.id && data.type) {
                const delete_response = await deleteFunction(data)
                if (delete_response) {
                    return res.send({
                        status: true,
                        data: delete_response
                    })
                }
            }
            return res.send({
                status: false,
                data: undefined
            })
        } catch (error) {
            return res.send({
                status: false,
                data: undefined
            })
        }
    });

    router.post('/send/message', async (req, res) => {
        try {
            const data = Object.assign(req.body);
            if (data) {
                const response = await SendWhatsAppOrEmail(data)
                if(response){
                    return res.send({
                        status: true,
                        data: response
                    });
                }
            }
            return res.send({
                status: false,
                data: undefined
            })
        } catch (error) {
            return res.send({
                status: false,
                data: undefined
            })
        }
    });

    router.use(employee_routes());
    router.use(user_routes());

    return router;
}