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
        
        this.templates = this.config.templates
        this.embeds = this.config.embeds
    }

    compile_embed  = ( embed , subject ) => {
        
        let template = JSON.stringify(this.templates[embed.template])
       
        for ( const prop in embed.props) {
            const v = embed.props[prop]
            template = template.replace(`$${prop}$`,v)
        }

        if (embed.use_subject_var === true) {
            if (subject == undefined)
                throw 'subject is undefined'

            template = template.replace('$subject.name$',subject.name)
            template = template.replace('$subject.code$',subject.code)
            template = template.replace('$subject.period$',subject.period)
            template = template.replace('$subject.teacher_name$',subject.teacher_name)
            template = template.replace('$subject.meet_link$',(subject.meet_link === "" || subject.meet_link === undefined) ? `check in ${subject.gclass_link}` : subject.meet_link)
            template = template.replace('$subject.google_classroom$',subject.gclass_link)
            
            let extra  = this.config.subjects[subject.code] ?? this.config.subjects._global
            
            template = template.replace('$subject.extra$', extra.extra ?? this.config.subjects._global.extra)
            template = template.replace('$subject.image$', extra.image ?? this.config.subjects._global.image)
            
            template = template.replace('$subject.start$',date_to_str(this.timetable.get_period_start(subject.period)))
            template = template.replace('$subject.end$', date_to_str(this.timetable.get_period_end(subject.period)))
    
        }
        
        const discord_embed =  new Discord.MessageEmbed(JSON.parse(template))

        discord_embed.color = embed.color

        this.assign_timestamp(discord_embed)

        return discord_embed
    }

    /*
        TODO
        get template 
        merge embed.props to template
            loop through embed.props properties 
            
        call assign_subject_var to embed
        call assign_timestamp
        profit
    */

    /**
     * 
     * @param {Discord.MessageEmbed} embed 
     */
    assign_timestamp = (embed) => {
        if (embed.timestamp === null)
            embed.setTimestamp(new Date())
    }

    assign_subject_var = (embed , subject) => {
        
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
        json_string = json_string.replace('$end_period$', date_to_str(this.timetable.get_period_end(subject.period)))

        return JSON.parse(json_string)

    }

    should_alert = (subject) => {
        if (this.config.subjects[subject.code]?.alert !== undefined)
            return this.config.subjects[subject.code].alert

        return this.config.subjects._global.alert
    }

    get_full_subjects_embed = (current_subject , next_subject) => {
        if (next_subject)
            return [this.compile_embed(this.embeds.current_top,current_subject), this.compile_embed(this.embeds.current_bottom,next_subject)]

        return [this.compile_embed(this.embeds.current_top,current_subject)]
    }
    
    get_abts_subjects_embed = (current_subject , next_subject) => { 
        return [this.compile_embed( this.embeds.abst_top ,current_subject ) , this.compile_embed( this.embeds.abst_bottom ,next_subject )]
    }

    get_school_over_embed = () => {
        return this.compile_embed(this.embeds.school_over)
    }

    get_school_isnt_start_embed = () => {
        return this.compile_embed(this.embeds.school_isn_start)
    }

    get_weekend_embed = () => {
        return this.compile_embed(this.embeds.weekend)
    }


}


module.exports = {
    AlertTimetable
}