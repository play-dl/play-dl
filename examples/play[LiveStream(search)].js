const discord = require('discord.js')
const { Intents } = require('discord.js')
const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice')
const youtube = require('play-dl')
const client = new discord.Client({ intents : [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES] , partials : ['CHANNEL', 'MESSAGE']})
const token = '< YOUR BOT TOKEN >'


client.on('messageCreate', async message => {
	if(message.content.startsWith('!play')){
		if(!message.member.voice?.channel) return message.channel.send('Connect to a Voice Channel')
        const connection = joinVoiceChannel({
            channelId : message.member.voice.channel.id,
            guildId : message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })
		
		let args = message.content.split('play ')[1]
        let yt_info = await youtube.search(args)
        let stream = await youtube.stream(yt_info[0].url)
        /*
        OR if you want to stream Live Video have less delay 

        let stream = await youtube.stream(yt_info[0].url, { actual_live : true })

        OR if you want higher quality audio Live Stream

        let stream = await youtube.stream(yt_info[0].url, { preferred_quality : "480p"}) // You can have resolution upto 1080p

        Default : preferred_quality : "144p"

        OR both

        let stream = await youtube.stream(yt_info[0].url, { actual_live : true ,preferred_quality : "480p"})
        */

        let resource = createAudioResource(stream.stream, {
            inputType : stream.type
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

