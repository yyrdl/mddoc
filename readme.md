# DOC EDITOR

Write documents in markdown,and convert to html files .

This is just a simple tool ,but useful. 

# How to use

Just clone this repo ,and install the dependencies(`npm install`).Then you can write your doc in directory `docs` ，After that ,run  `node editor.js build [your doc name]` , for this demo ,the command is   `node editor.js build demo`.

And you can chose the highlight style ,the available styles is in `styles` directory.For example ,if we want to use `dracula.css` ,just run `node editor.js build demo -s dracula`.

When all done you will find the docs with html format in `build` directory,Then you can read them with your browser.

# License

MIT