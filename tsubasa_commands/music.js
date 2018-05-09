const ytdl = require('ytdl-core');
let playlist = {};

/**
 * Represents a song in playlists.
 */
class Song {
    constructor(url, title) {
        this.url = url;
        this.title = title;
    }
}

/**
 * Class for playing {@link Song}s. One per server.
 */
class MusicPlayer {
    /**
     * Creates a new instance of a {@link MusicPlayer}.
     * @param textChannel the textChannel in which logs are to be posted
     * @param voiceChannel the voiceChannel in which the audio is to be played
     */
    constructor(textChannel, voiceChannel) {
        this.textChannel = textChannel;
        this.playing = false;
        this.playlist = [];
        this.dispatcher = null;
        this.voiceChannel = voiceChannel;
        this.currentSong = null;
    }

    /**
     * Adds a song to this {@link MusicPlayer}'s playlist.
     * @param song the song to add
     */
    addToPlaylist(song) {
        if (song instanceof Song) {
            this.playlist.push(song);
            if (this.playing === true)
                this.textChannel.send({
                    embed: {
                        color: 3447003,
                        description: `Ajouté **${song.title}** à la playlist.`
                    }
                });
        }
    }

    /**
     * Retrieves a song from Youtube. If valid, adds it to the playlist, and if playlist was empty, starts the playback.
     * @param url the youtube URL
     */
    retrieveSong(url) {
        if (url === '' || url === undefined)
            this.textChannel.send("Utilisation : !music play *lien Youtube*");
        else {
            ytdl.getInfo(url, (err, info) => {
                if (err || info === undefined) {
                    this.textChannel.send({
                        embed: {
                            color: 3447003,
                            title: `Erreur pendant le chargement de la vidéo`,
                            description: `*${err}*`
                        }
                    });
                }
                else {
                    let toAdd = new Song(url, info.title);
                    this.addToPlaylist(toAdd);
                    if (this.playing === false) {
                        this.startPlaying();
                    }
                }
            });
        }
    }

    /**
     * Starts playing the contents of the playlist.
     */
    startPlaying() {
        this.playing = true;
        this.currentSong = this.playlist.shift();
        if (this.currentSong !== undefined) {
            this.voiceChannel.join().then(connection => {
                this.playStream(connection);
            }).catch(console.error);
        }
    }

    playStream(connection) {
        this.dispatcher = connection.playStream(ytdl(this.currentSong.url, {filter: "audioonly"})).on("start", () => {
            this.textChannel.send({
                embed: {
                    color: 3447003,
                    description: `Lecture de **${this.currentSong.title}**`
                }
            });
        });
        this.dispatcher.on("end", () => {
            this.currentSong = this.playlist.shift();
            if ((this.currentSong === undefined) && (this.playing === true)) {
                this.playing = false;
                this.voiceChannel.leave();
                this.textChannel.send("Playlist vide, sortie du channel audio.");
            }
            else {
                this.playStream(connection);
            }
        });
    }

    /**
     * Skips the currently playing song.
     */
    skipSong() {
        if (this.dispatcher !== undefined) {
            this.textChannel.send({
                embed: {
                    color: 3447003,
                    description: `Skipped ${this.currentSong.title}`,
                }
            });
            this.dispatcher.end();
        }
    }


    /**
     * Stops playing, exits the voice channel and empties the playlist.s
     */
    stopPlaying() {
        if (this.playing === false) this.textChannel.send({
            embed: {
                color: 3447003,
                description: "La playlist est déjà vide."
            }
        });
        else {
            if (this.dispatcher !== undefined) {
                this.dispatcher.end();
                this.voiceChannel.leave();
                this.playlist = [];
            }
        }
    }
}

module.exports.run = (client, message, args) => {
    const server = message.guild;
    const sender = message.member;
    let player = playlist[server.id];

    if (sender.voiceChannel !== undefined) {
        if (!(playlist.hasOwnProperty(server.id))) {
            playlist[server.id] = new MusicPlayer(message.channel, sender.voiceChannel);
            player = playlist[server.id];
        }
        switch (args[0].toLowerCase()) {
            case "play":
                let url = args[1];
                player.retrieveSong(url);
                break;
            case "stop":
                player.stopPlaying();
                break;
            case "skip":
                player.skipSong();
                break;
            default:
                break;
        }
    }
    else {
        message.channel.send("Vous n'êtes pas dans un channel audio.");
    }
};

module.exports.help = {
    name: "Music",
    command: "music"
};