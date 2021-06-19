// test test
const ms_min = 1000 * 60

const {auto_del_time} = require('./adt')

const { TimeTable } = require('./timetable')
const T = new TimeTable(require('./data/subject.json'), require('./data/timetable.json'))

const bot_config = require('./bot-config.json')
const Discord = require('discord.js')
const client = new Discord.Client();

var old_period, school_over, school_start
var discord_callback;


var pupdate = () => {

  if (school_over !== T.is_school_over()) {
    school_over = T.is_school_over()
    if (school_over && discord_callback) {
      console.log('[i] school is over')
      discord_callback(false)
      return true
    }
  }

  if (school_start !== T.is_school_start()) {
    school_start = T.is_school_start()
    if (!school_start && discord_callback) {
      console.log('[i] school is didn\'t start yet')
      discord_callback(false)
      return true
    }
  }

  if (T.is_school_over() === true || T.is_school_start() === false) {
    return false
  }

  if (old_period != T.get_current_period()) {

    console.log('[i] update alert')
    console.log(`[i] cur subject ${JSON.stringify(T.get_current_subject())}`)
    old_period = T.get_current_period()

    if (discord_callback) discord_callback(true)

    return true
  } 
  return false
}


const { Command, Commands } = require('./commands')
const cmds = new Commands(bot_config.prefix, { auto_delete_prompt: 1000 })
const { EmbedTimetable , TextTimetable} = require('./features/discord_simple_timetable')

var pcheck
var last_message = undefined

client.on('ready', async () => {

  console.log(`bot is rady login as ${client.user.tag}`)
  

  const is_owner = async (message) => {
    return message.author.id == bot_config.owner
  }

  cmds.add_command(new Command('ping', async (message) => { message.reply('pong') }, is_owner))

  cmds.add_command(new Command('set', async (message,args) => {

    let subject_code = args[1]
    let option = args[2]
    let value = args[3]

    if (subject_code === undefined)
      throw "subject_code === undefined"
    if (option === undefined)
      throw "option === undefined"
    if (value === undefined)
      throw "value === undefined"

    let subject = T.get_subject(subject_code)

    if (subject === undefined)
      throw "subject === undefined"

    console.log(`[$] old ${subject_code}[${option}] = ${subject[option]}`)
    subject[option] = value
    console.log(`[$] new ${subject_code}[${option}] = ${subject[option]}`)

  }, [is_owner]))

  cmds.add_command(new Command('d_c', async (message,args) => {
    discord_callback(args[1] === 'true')
  }))

  cmds.add_command(new Command('pupdate', async () => {
    console.log(`pupdate() : ${pupdate()}`)
  }))

  cmds.add_command(new Command('set_p', async (message,args) => {
    let value = Number.parseInt(args[1])
    T.force_period = Number.isNaN(value) ? undefined : value
  },  [is_owner]))

  cmds.add_command(new EmbedTimetable(T,'tt'))
  cmds.add_command(new TextTimetable(T,'ttt'))
  

  let my_guild = await client.guilds.fetch(bot_config.my_guild)
  let webhook = (await my_guild.fetchWebhooks()).find((v, k) => k == bot_config.webhook)
  
  let channel = await my_guild.channels.resolve(webhook.channelID)
  last_message = (await channel.messages.fetch({ limit: 10 })).find(m => m.author.id == webhook.id)


  const { AlertTimetable } = require('./features/discord_alert_timetable')
  
  const alert_timetable = new AlertTimetable(T,require('./embeds.json'))

  discord_callback = async (is_subject) => {
    if (typeof last_message !== 'undefined')
      last_message.delete().then(() => last_message = undefined)
    
    if (is_subject === false) {

      if (T.is_school_over()) {

        last_message = await webhook.send({
          content: "",
          embeds: [
            alert_timetable.get_school_over_embed()
          ]
        })

      } else if (!T.is_school_start()) {
        last_message = await webhook.send({
          content: "",
          embeds: [
            alert_timetable.get_school_isnt_start_embed(),
            alert_timetable.get_min_subject_embed(T.get_period_subject(0))
          ]
        })
      }

      return
    }
    
    let cs = T.get_current_subject()
    let message_object = {
      content: cs.alert.ping === true ?  bot_config.ping : "",
      embeds: [
        alert_timetable.get_subject_embed(cs)
       ]
    }

    let np = T.get_current_period() + 1
    if (np < T.get_current_table().length) {
      message_object.embeds.push(
        alert_timetable.get_min_subject_embed(T.get_period_subject(np))
      )
    }

    last_message = await webhook.send(
      message_object
    )
  }

  pcheck = setInterval(pupdate, 100)
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

