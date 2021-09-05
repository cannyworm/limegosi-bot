const {Subject} = require('./Subject')
const day_of_week = [ 'sunday' , 'monday' , 'tuesday' , 'wednesday' , 'thursday' , 'friday' , 'satureday' ]

 const time_format = { hour: '2-digit', minute: '2-digit' }
 var date_to_str = (date) => {
   return date.toLocaleTimeString([], time_format)
 }

class Timetable {
    
    constructor(period_config , subject_list) {

        this.period_config = period_config
        this.subject_list = subject_list

        this.period_table = undefined
        this.subject_table = undefined 
        
        this.old_period = -1
        this.old_date = -1

        this.start_time = this.parse_time(this.period_config.global.start)

        this.timetable = new Map()

        for (const key in this.period_config.days) {
            const day = this.period_config.days[key]
            
            let sum = 0
            this.timetable[key] = (day.map( (v , i) => {
                let sp = v.split(':')
                let code = sp[0]
                let strlength = sp[1] ?? this.period_config.global.period_lenght
                
                let length = Number.parseInt(strlength)
                
                if (length == undefined) {
                    throw `error parsing day.length ${strlength} is not a valid length`
                }
                
                
                return new Subject(code , sum += length , length , i , { ... (this.subject_list[code]) })
            }))
        }

        this.period_udpate_callbacks = []
    }
    
    parse_time = (str) => {
        let digits = str.split(/[\.\:]/)
        let h = Number.parseInt(digits[0])
        let m = Number.parseInt(digits[1])
        return (h * 60) + m
    }

    get_date = () => {
        return new Date()
    }

    get_day = () => {
        return this.get_date().getDay()
    }

    get_day_of_week = () => {
        return day_of_week[this.get_day()]
    }

    get_sum_min = () => {
        let d = this.get_date()
        return (d.getHours() * 60) + d.getMinutes()
    }

    get_current_timetalbe = () => {
        return this.timetable[this.get_day_of_week()]
    }

    get_current_period_index = () => {
        let time_diff = this.get_sum_min() - this.start_time
        if (time_diff < 0) return undefined
        let current_period = undefined
        
        for ( const p of this.get_current_timetalbe()) {
            if (p.time >= time_diff  ) {
                current_period = p.period
                break
            }
        }

        return current_period
    }

    get_current_period = () => {
        return this.get_current_timetalbe()[this.get_current_period_index()]
    }
    
    get_period_subject = (period , timetable) => {
        return (timetable ?? this.get_current_timetalbe())[period]
    }

    get_subject_from_code = (code) => {
        return this.subject_list[code]
    }

    get_current_subject = () => {
        return this.get_subject_from_code(this.get_current_period()?.code)
    }

    get_period_start = (period , timetable) => {
        let p = this.get_period_subject(period , timetable)
        if (p == undefined)
            return undefined
        
        let date = new Date()
        date.setHours(0,0,0,0)
        date.setMinutes(this.start_time + p.time - p.length )
        return date
    }
    
    get_period_end = (period , timetable) => {
        let p = this.get_period_subject(period , timetable)
        if (p == undefined)
            return undefined

        let date = new Date()
        date.setHours(0,0,0,0)
        date.setMinutes(this.start_time + p.time)
        return date
    }
    
    period_update = () => {
       
        
        if (this.old_date != this.get_date().getDate()) {
            this.old_period = -1
            this.old_date = this.get_date().getDate()

            if (this.is_weekend()) {
                this.period_udpate_callbacks.forEach( fn => { 
                    fn( { is_weekend : true })
               })
            }

        }
        
        if (this.is_weekend()) return

        let current_period = this.get_current_period()
        let next_period = current_period ? this.get_period_subject(current_period.period+1) : undefined
        

        if (this.old_period !== this.get_current_period_index()) {
            
            this.old_period = this.get_current_period_index()
            
            this.period_udpate_callbacks.forEach( fn => { 
                fn({
                    current_period : current_period, 
                    next_period : next_period, 
                    is_started : this.is_school_start(),
                    is_ended : this.is_school_end() , 
                    changed : true 
                })
            })
            this.about_to_start = false
            
            return
        }

        if ( next_period != undefined &&  this.about_to_start == false && (current_period.time - this.get_school_time()) <= 5  ) {
            this.period_udpate_callbacks.forEach( fn => { 
                fn({
                    current_period : current_period, 
                    next_period : next_period, 
                    is_started : this.is_school_start(),
                    is_ended : this.is_school_end() , 
                    changed : false
                })
            })
            this.about_to_start = true
            return
        } 
        

    }
    
    /**
 * @param {?string|number|Date} day
 */
    is_weekend = function (day) {

        if (typeof day === 'undefined')
            return !!this.period_config.global.weekends.find(v => v === day_of_week[this.get_day()])

        if (typeof day === 'string')
            return !!this.period_config.global.weekends.find(v => v === day)

        if (typeof day === 'number')
            return !!this.period_config.global.weekends.find(v => v === day_of_week[day])

        if (typeof day === 'Date')
            return !!this.period_config.global.weekends.find(v => v === day_of_week[day.getDay()])

    }

    is_school_end = () => {
        let tt = this.get_current_timetalbe()
        return (this.get_sum_min() - this.start_time) > tt[tt.length-1].time
    }

    is_school_start = () => {
        return this.get_school_time() > 0
    }

    get_school_time = () => {
        return this.get_sum_min() - this.start_time
    }

    start_update = () => {
        
        if (this.period_update_interval !== undefined) 
            return false
        
        this.period_update_interval = setInterval(() => {
            this.period_update()
        }, 1000);
    }

    stop_update = () => {
        if (this.period_update_interval) {
            clearInterval(this.period_update_interval)
            return true
        }

        return false
    }
    /**
     * 
     * @param {function} fn 
     * @returns 
     */
    add_period_update_callback = (fn) => {
        return this.period_udpate_callbacks.push(fn) - 1
    }

}


module.exports  = {
    Timetable,
    date_to_str
}