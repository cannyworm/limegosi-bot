// test test
const ms_min = 1000 * 60

const { auto_del_time } = require('./adt')
const Discord = require('discord.js')
const bot_config = require('./bot-config.json')
const { Timetable } = require('./timetable-js')
const { Command, Commands } = require('./commands')
// const { EmbedTimetable, TextTimetable } = require('./features/discord_full_timetable')
const { AlertTimetable } = require('./features/discord_alert_timetable')

const T = new Timetable(require('./data/periods.json'), require('./data/subjects.json'))
const alert_timetable = new AlertTimetable(T,require('./embeds.json'))


const client = new Discord.Client();

const cmds = new Commands(bot_config.prefix, { auto_delete_prompt: 1000 })

var last_message = undefined

client.on('ready', async () => {

  console.log(`bot is rady login as ${client.user.tag}`)
  

  const is_owner = async (message) => {
    return message.author.id == bot_config.owner
  }

  cmds.add_command(new Command('ping', async (message) => { message.reply('pong') }, is_owner))

  let my_guild = await client.guilds.fetch(bot_config.my_guild)
  let webhook = (await my_guild.fetchWebhooks()).find((v, k) => k == bot_config.webhook)
  
  let channel = await my_guild.channels.resolve(webhook.channelID)
  last_message = (await channel.messages.fetch({ limit: 10 })).find(m => m.author.id == webhook.id)
  if (last_message != undefined)
    await last_message.delete()

  T.add_period_update_callback( async ({ current_period, next_period, isnt_started, ended }) => {
    if (last_message != undefined && !last_message.deleted) 
      await last_message.delete()

    console.log(current_period, next_period, isnt_started, ended )

    if (ended) {
      last_message = await webhook.send({
        "content": "",
        "embeds": [
          alert_timetable.get_school_over_embed()
        ]
      })
      return
    }

    if (isnt_started) {
      last_message = await webhook.send({
        "content": "",
        "embeds": [
          alert_timetable.get_school_isnt_start_embed()
        ]
      })
      return
    }
    
    if (current_period == undefined)
      return

    let embeds = [
      alert_timetable.get_subject_embed(current_period)
    ]

    if (next_period) 
      embeds.push( alert_timetable.get_mini_subject_embed(next_period))
    last_message = await webhook.send({
      "content": "",
      "embeds": embeds
    })


  })

  T.start_update()
})

client.on('message', async (message) => {

  try {
    console.log(`await cmds.process_command(message) : ${await cmds.process_command(message)}`)
  }
  catch (e) {
    message.reply(`[!] error ${e}`).then(auto_del_time(5000))
  }

})


client.login(bot_config.token)

