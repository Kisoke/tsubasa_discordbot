let autoRTServers = {};
const config = require("../settings.json");

module.exports.run = (client, message, args) => {
    const server = message.guild;
    const sender = message.member;
    if (!(autoRTServers.hasOwnProperty(server.id))) {
        autoRTServers[server.id] = config.auto_react.default;
    }
    let toggle = args[0] ? args[0].toLowerCase() : "";
    switch (toggle) {
        case "off":
            autoRTServers[server.id] = false;
            message.react(`❎`);
            break;
        case "on":
            autoRTServers[server.id] = true;
            message.react(`✅`);
            break;
        default:
            message.channel.send(`le paramètre doit être on/off`);
            break;
    }
    client.on("message", (message) => {
        if (autoRTServers[server.id] === true)
            config.auto_react.emotes.forEach(emoteId => {
                message.react(emoteId);
            });
        else return;
    });
}

module.exports.help = {
    name: "autoreact",
    command: "autoreact"
}