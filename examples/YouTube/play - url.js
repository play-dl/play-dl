const { Intents, Client } = require('discord.js')
const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice')
const play = require('play-dl')
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES],
    partials: ['CHANNEL', 'MESSAGE']
})
const token = '< YOUR BOT TOKEN >'

client.on('messageCreate', async message => {

    if (message.content.startsWith('!play')) {
        
        if (!message.member.voice?.channel) return message.channel.send('Connect to a Voice Channel')
        
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })

        let args = message.content.split('play ')[1].split(' ')[0]

        let stream = await play.stream(args)
        
        /*
        OR if you want to get info about youtube link and then stream it

        let yt_info = await play.video_info(args)
        console.log(yt_info.video_details.title) 
        let stream = await play.stream_from_info(yt_info)
        */

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
