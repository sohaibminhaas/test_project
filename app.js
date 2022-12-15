const express = require("express");
const dotenv = require('dotenv')
const app = express();
dotenv.config();
const routes = require("./routes");
const path = require("path");
const handlebars = require('handlebars');
const bodyparser = require("body-parser");
const { engine } = require('express-handlebars');
const session = require("express-session");

app.use(
    session({
        name: "codeil",
        secret: "test_project",
        resave: true,
        saveUninitialized: true,
        proxy: true,
        cookie: {
            secure: true,
            httpOnly: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 48
        }
    })
);

app.use(
    bodyparser.urlencoded({
        extended: true,
    })
);
app.enable('trust proxy');
app.use(bodyparser.json());
app.set('views', path.join(`${__dirname}/views/`))
app.engine('hbs', engine({
    extname: "hbs",
    defaultLayout: "index",
    layoutsDir: `${__dirname}/views/layouts/`,
    partialsDir: `${__dirname}/views/partials/`,
}))
app.set("view engine", "hbs");

app.use(express.static(__dirname + "/public"));
const port = process.env.PORT ?? 3000;
app.use('/', routes());
app.listen(port, () => {
    console.log(`server is listing on port: ${port}`)
})

handlebars.registerHelper("condition", function (v1, v2, options) {
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

handlebars.registerHelper("IsSelected", function (v1, v2, options) {
    if (v2 && v2.find((skill) => skill.skill_id == v1)) {
        return options.fn(this);
    }
    return options.inverse(this);
});

handlebars.registerHelper("getDate", function (value, options) {
    if (value) {
        return new Date(value).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
});

