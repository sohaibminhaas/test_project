const express = require('express');
const router = express.Router();
const { create, update, getEmployee } = require("../services/employee")

module.exports = () => {
    router.get('/employee', (req, res) => {
        if (req.session.admin) {
            res.render("employee", {
                session: req.session.admin,
                isEdit: false
            });
        } else {
            res.redirect('/');
        }
    });

    router.get('/employee/:id', async (req, res) => {
        if (req.session.admin) {
            const employee = await getEmployee(req.params.id);
            res.render("employee", {
                session: req.session.admin,
                employee: employee,
                isEdit: true,
                baseURLImage: process.env.IMAGES_BLOB_BASEURL
            });
        } else {
            res.redirect('/');
        }
    });

    router.post('/employee', async (req, res) => {
        try {
            if (req.session.admin) {
                const data = Object.assign(req.body);
                if (data) {
                    const employee_response = await create(data);
                    if (employee_response) {
                        return res.send({
                            status: true,
                            data: employee_response
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

    router.put('/employee', async (req, res) => {
        try {
            if (req.session.admin) {
                const data = Object.assign(req.body);
                if (data) {
                    const employee_response = await update(data);
                    if (employee_response) {
                        return res.send({
                            status: true,
                            data: employee_response
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