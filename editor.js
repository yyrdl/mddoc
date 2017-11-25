const fs = require("fs");
const markdown = require("markdown-it");
const highlight = require("highlight.js");
const args = require('optimist').argv;

const md = markdown({
    html: true,
    xhtmlOut: false,

    breaks: false,
    langPrefix: 'language-',

    linkify: false,
    typographer: false,

    quotes: '“”‘’',

    highlight: function (str, lang) {
        if (lang && highlight.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    highlight.highlight(lang, str, true).value +
                    '</code></pre>';
            } catch (__) { }
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

function showDocs() {
    let list = fs.readdirSync("./docs");
    let docs = [];
    for (let i = 0; i < list.length; i++) {
        let stat = fs.statSync("./docs/" + list[i]);
        if (stat.isDirectory()) {
            docs.push(list[i]);
        }
    }
    console.log("\nFound " + docs.length + " docs\n");
    for (let i = 0; i < docs.length; i++) {
        console.log(" " + docs[i]);
    }
    console.log("\n");
}

function showStyles() {
    let list = fs.readdirSync("./styles");
    let styles = [];
    for (let i = 0; i < list.length; i++) {
        let stat = fs.statSync("./styles/" + list[i]);
        if (!stat.isDirectory()) {
            styles.push(list[i]);
        }
    }

    console.log("\nFound " + styles.length + " styles\n");

    for (let i = 0; i < styles.length; i++) {
        console.log(" " + styles[i]);
    }
    console.log("\n");
}

function do_build(from, to, doc, style) {

    let stat = fs.statSync(from + "/" + doc);

    if (stat.isDirectory()) {

        if (!fs.existsSync(to + "/" + doc)) {
            fs.mkdirSync(to + "/" + doc);
        }

        let list = fs.readdirSync(from + "/" + doc);

        for (let i = 0; i < list.length; i++) {
            do_build(from + "/" + doc, to + "/" + doc, list[i], style);
        }

    } else {

        let file = fs.readFileSync(from + "/" + doc);

        if (doc.endsWith(".md")) {
            let html = md.render(file.toString());
            let name = doc.split(".");
            name.pop();
            name.push("html");
            name = name.join(".");
            html = '<div class="markdown-body">' + html + "</div>";
            fs.writeFileSync(to + "/" + name, style + "\n" + html);
        } else {
            fs.writeFileSync(to + "/" + doc, file);
        }
    }
    return null;
}

function clean_dir(dir) {
    let list = fs.readdirSync(dir);
    for (let i = 0; i < list.length; i++) {
        let stat = fs.statSync(dir + "/" + list[i]);
        if (stat.isDirectory()) {
            clean_dir(dir + "/" + list[i]);
        } else {
            fs.unlinkSync(dir + "/" + list[i]);
        }
    }
    fs.rmdirSync(dir);
}
function build(all, doc, style) {
    let targets = [];
    if (all) {
        let list = fs.readdirSync("./docs");
        for (let i = 0; i < list.length; i++) {
            let stat = fs.statSync("./docs/" + list[i]);
            if (stat.isDirectory()) {
                targets.push(list[i]);
            }
        }
    } else {
        if (fs.existsSync("./docs/" + doc)) {
            targets.push(doc);
        } else {
            return console.log("Doc " + doc + " does not exist in directory 'docs'!");
        }
    }

    let style_content = "";

    style = style || "github";

    if (style && style.length > 0) {

        if (!style.endsWith(".css")) {
            style = style + ".css";
        }

        if (!fs.existsSync("./styles/" + style)) {
            return console.log("Style  " + style + " does not exist!");
        }
        style_content = fs.readFileSync("./styles/" + style);
        if ("string" != typeof style_content) {
            style_content = style_content.toString();
        }
    }

    if (fs.existsSync("./default.css")) {
        let deault_style = fs.readFileSync("./default.css");
        style_content += deault_style.toString();
    }

    style_content = "<style>" + style_content + "</style>";

    for (let i = 0; i < targets.length; i++) {
        if (fs.existsSync("./build/" + targets[i])) {
            clean_dir("./build/" + targets[i]);
        }
        do_build("./docs", "./build", targets[i], style_content);
    }
}

if (!fs.existsSync("./docs")) {
    fs.mkdirSync("./docs");
}

if (!fs.existsSync("./build")) {
    fs.mkdirSync("./build");
}

(function () {

    let commands = args._;

    if (commands.length > 0) {
        if ("show" == commands[0]) {
            let what = commands[1];
            if ("docs" === commands[1]) {
                return showDocs();
            }
            if ("styles" === commands[1]) {
                return showStyles();
            }
            console.log("show docs or show styles?");
        }

        if ("build" == commands[0]) {

            let what = commands[1];

            if (what) {
                return build(false, what, args.s);
            }
            /**
             * 否则编译全部
             * 
             * */
            return build(true, undefined, args.s);
        }
    }

    console.log("\nThe commands:");
    console.log("   show docs/styles");
    console.log("   build what -s ...");
    console.log("\n");
})()

