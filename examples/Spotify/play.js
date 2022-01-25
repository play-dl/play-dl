const { Intents, Client } = require('discord.js')
const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice')
const play = require('play-dl')
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES],
    partials: ['CHANNEL', 'MESSAGE']
})
const token = '< Your Bot Token >'

client.on('messageCreate', async message => {
    if (message.content.startsWith('!play')) {

        if (!message.member.voice?.channel) return message.channel.send('Connect to a Voice Channel')
        
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })

        if (play.is_expired()) {
            await play.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
        }

        let args = message.content.split('play ')[1].split(' ')[0]
        
        let sp_data = await play.spotify(args) // This will get spotify data from the url [ I used track url, make sure to make a logic for playlist, album ]
        
        let searched = await play.search(`${sp_data.name}`, {
            limit: 1
        }) // This will search the found track on youtube.

        let stream = await play.stream(searched[0].url) // This will create stream from the above search

        let resource = createAudioResource(stream.stream, {
            inputType: stream.type
        })
        let player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        })
        player.play(resource)

        connection.subscribe(player)
    }
})

client.on('ready', () => {
    console.log(`We have logged in as ${client.user.tag}!`)
})

client.login(token);