const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();
var config = require("./settings.json");

client.commands = new Discord.Collection();

fs.readdir("./tsubasa_commands/", (err, files) => {
    if (err) return console.log(err);
    let jsFiles = files.filter(filepath => filepath.split('.').pop() === "js");
    if (jsFiles.length <= 0) {
        console.log("No commands loaded.");
    } else {
        console.log(`${jsFiles.length} commands loaded.`);
        jsFiles.forEach((file, i) => {
            let cmds = require(`./tsubasa_commands/${file}`);
            client.commands.set(cmds.help.command, cmds);
        });
    }
});

client.login(config.auth_token);

client.on("ready", function () {
    console.log("Bot is connected.");
});

client.on("message", function (message) {
    if (message.author.equals(client.user)) return;
    if (!message.content.startsWith(config.prefix)) return;

    const cmd = message.content.toLowerCase().split(' ')[0].slice(config.prefix.length);
    const args = message.content.split(' ').slice(1);

    var command = client.commands.get(cmd);
    if (command) command.run(client, message, args);
});

process.on("SIGINT", function () {
    client.destroy().then(function () {
        process.exit();
    }).catch(console.error);
});