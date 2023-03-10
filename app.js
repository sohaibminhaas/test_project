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
const RedisStore = require("connect-redis")(session);
const Redis = require("ioredis");
const fileUpload = require("express-fileupload");

const redisClient = new Redis({
    port: process.env.REDIS_PORT, // Redis port
    host: process.env.REDIS_URL, // Redis host
    password: process.env.REDIS_PASSWORD,
    tls: { servername: process.env.REDIS_URL },
});
const REDIS_PREFIX = process.env.REDIS_PREFIX
    ? process.env.REDIS_PREFIX.concat("-session:")
    : "unknown".concat("-session:");

app.use(
    session({
        name: "test_project",
        secret: "test_project",
        resave: false,
        saveUninitialized: true,
        store: new RedisStore({
            client: redisClient,
            prefix: REDIS_PREFIX,
        }),
    })
);

app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
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

