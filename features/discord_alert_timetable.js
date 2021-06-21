const {TimeTable , Subject} = require('../timetable')
const {date_to_str} = require('./discord_full_timetable')

const Discord = require('discord.js')

class AlertTimetable {

    /**
     * 
     * @param {TimeTable} timetable 
     * @param {Object} config 
     */
    constructor(timetable , config) {
        this.timetable = timetable
        this.config = config
        
        this.type_fix(this.config.school_over)   
        this.type_fix(this.config.school_isnt_start)
        this.type_fix(this.config.subject)
        this.type_fix(this.config.min_subject)
        this.type_fix(this.config.weekend)
        
    }


    type_fix = (json_embed) => {
        
        if (json_embed.image === undefined)
            json_embed.image = { 'url' :  ""}

        if (typeof json_embed.image === 'string')
            json_embed.image = { 'url' :  json_embed.image}


    }


    /**
     * 
     * @param {Discord.MessageEmbed} embed 
     */
    assign_timestamp = (embed) => {
        if (embed.timestamp === null)
            embed.setTimestamp(new Date())
    }


    get_school_over_embed = () => {
        const embed =  new Discord.MessageEmbed(this.config.school_over)

        this.assign_timestamp(embed)

        return embed
    }

    get_school_isnt_start_embed = () => {
        
        const embed =  new Discord.MessageEmbed(this.config.school_isnt_start)
        
        this.assign_timestamp(embed)

        return embed
    }

    get_weekend_embed = () => {
        
        const embed =  new Discord.MessageEmbed(this.config.weekend)
        
        this.assign_timestamp(embed)

        return embed
    }

    /**
     * 
     * @param {Discord.MessageEmbed} embed 
     * @param {Subject} subject
     */
    assign_subject_var = (embed , subject) => {
        let json_string = JSON.stringify(embed)
        json_string = json_string.replace('$name$',subject.name)
        json_string = json_string.replace('$code$',subject.code)
        json_string = json_string.replace('$teacher_name$',subject.teacher_name)
        json_string = json_string.replace('$meet_link$',(subject.meet_link === "" || subject.meet_link === undefined) ? `check in ${subject.google_classroom}` : subject.meet_link)
        json_string = json_string.replace('$google_classroom$',subject.google_classroom)
        json_string = json_string.replace('$extra$',subject.extra)
        json_string = json_string.replace('$image$',subject.image || "")
        
        json_string = json_string.replace('$start_period$',date_to_str(TimeTable.get_period_start(subject.period)))
        json_string = json_string.replace('$end_period$',date_to_str(TimeTable.get_period_end(subject.period)))

        return JSON.parse(json_string)
    }

    /**
     * 
     * @param {Subject} subject 
     */
     get_subject_embed = (subject) => {
        let s = this.assign_subject_var(this.config.subject,subject)
        
        const embed =  new Discord.MessageEmbed(s)
        
        this.assign_timestamp(embed)

        return embed

    }

    /**
     * 
     * @param {Subject} subject 
     */
    get_min_subject_embed = (subject) => {
        let s = this.assign_subject_var(this.config.min_subject,subject)
        
        const embed =  new Discord.MessageEmbed(s)
        
        this.assign_timestamp(embed)

        return embed

    }

}


module.exports = {
    AlertTimetable
}