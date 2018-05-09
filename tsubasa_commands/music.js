const ytdl = require('ytdl-core');
let playlist = {};

module.exports.run = (client, message, args) => {
    const server = message.guild;
    const sender = message.member;

    if (!(playlist.hasOwnProperty(server.id))) {
        playlist[server.id] = {};
        playlist[server.id].playing = false;
        playlist[server.id].songs = [];
        playlist[server.id].dispatcher;
        playlist[server.id].voiceChannel;
    }

    switch (args[0].toLowerCase()) {
        case "play":
            let validLink = true;
            let url = args[1];
            if (url === '' || url === undefined)
                return message.channel.send("Utilisation : !music play *lien Youtube*");
            ytdl.getInfo(url, (err, info) => {
                if (err || info === undefined) {
                    message.channel.send("Erreur pendant le chargement de la vidéo (*" + err + "*).");
                    validLink = false;
                }
                else if (playlist[server.id].songs.length === 0)
                    return message.channel.send(`Lecture de **${info.title}**`);
                else return message.channel.send(`Ajouté **${info.title}** à la playlist.`);
            });
            if (validLink === true) {
                if (!playlist[server.id].playing) {
                    // Jouer l'audio de la video YT
                    playlist[server.id].playing = true;
                    sender.voiceChannel.join().then(connection => {
                        playlist[server.id].voiceChannel = sender.voiceChannel;
                        playlist[server.id].dispatcher = connection.playStream(ytdl(url, {filter: "audioonly"}));

                        playlist[server.id].dispatcher.on("end", () => {
                            url = playlist[server.id].songs.shift();
                            if ((url === undefined) && (playlist[server.id].playing === true)) {
                                playlist[server.id].playing = false;
                                playlist[server.id].voiceChannel.leave();
                                message.channel.send("Playlist vide, sortie du channel audio.");
                            }
                            else {
                                playlist[server.id].dispatcher = connection.playStream(ytdl(url, {filter: "audioonly"}));
                            }
                        });
                    }).catch(console.error);
                }
                else {
                    // Ajouter a la playlist
                    playlist[server.id].songs.push(url);
                    console.log(playlist);
                }
            }
            break;
        case "stop":
            if (playlist[server.id].playing === false) return message.channel.send({
                embed: {
                    color: 3447003,
                    description: "La playlist est déjà vide."
                }
            });
            else {
                playlist[server.id].playing = false;
                playlist[server.id].dispatcher.end();
                playlist[server.id].voiceChannel.leave();
                playlist[server.id].songs = [];
                return;
            }
        case "skip":
            playlist[server.id].dispatcher.end();
            break;
        default:
            break;
    }
};

module.exports.help = {
    name: "Music",
    command: "music"
};