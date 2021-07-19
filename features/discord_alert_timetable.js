const {Timetable , Subject , date_to_str} = require('../timetable-js')

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
    }


    /**
     * 
     * @param {Discord.MessageEmbed} embed 
     */
    assign_timestamp = (embed) => {
        if (embed.timestamp === null)
            embed.setTimestamp(new Date())
    }

    assign_var = (embed , subject) => {
        
        let json_string = JSON.stringify(embed)
        json_string = json_string.replace('$name$',subject.name)
        json_string = json_string.replace('$code$',subject.code)
        json_string = json_string.replace('$period$',subject.period)
        json_string = json_string.replace('$teacher_name$',subject.teacher_name)
        json_string = json_string.replace('$meet_link$',(subject.meet_link === "" || subject.meet_link === undefined) ? `check in ${subject.gclass_link}` : subject.meet_link)
        json_string = json_string.replace('$google_classroom$',subject.gclass_link)
        
        let extra  = this.config.subjects[subject.code] ?? this.config.subjects._global
        
        json_string = json_string.replace('$extra$', extra.extra ?? this.config.subjects._global.extra)
        json_string = json_string.replace('$image$', extra.image ?? this.config.subjects._global.image)
        
        json_string = json_string.replace('$start_period$',date_to_str(this.timetable.get_period_start(subject.period)))
        json_string = json_string.replace('$end_period$',date_to_str(this.timetable.get_period_end(subject.period)))

        return JSON.parse(json_string)

    }

    should_alert = (subject) => {
        if (this.config.subjects[subject.code]?.alert !== undefined)
            return this.config.subjects[subject.code].alert

        return this.config.subjects._global.alert
    }

    get_subject_embed = (subject) => {
        const embed =  new Discord.MessageEmbed(this.assign_var(this.config.subject , subject))

        this.assign_timestamp(embed)
        return embed
    }

    get_mini_subject_embed = (subject) => {
        const embed =  new Discord.MessageEmbed(this.assign_var(this.config.min_subject , subject))

        this.assign_timestamp(embed)
        return embed
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


}


module.exports = {
    AlertTimetable
}