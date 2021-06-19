const daysofweek = [ 'sunday' , 'monday' , 'tuesday' , 'wednesday' , 'thursday' , 'friday' , 'satureday' ]

class Subject {

    /**
     * 
     * @param {string} code 
     * @param {string} name 
     * @param {string} teacher_name 
     * @param {string} google_classroom 
     * @param {string} meet_link 
     * @param {Object} alert 
     * @param {boolean} alert.ping
     * @param {boolean} alert.enable
     * @param {string|null} image
     * @param {string|null} extra
     * @param {number|null} period
     */
    constructor(code,name,teacher_name,google_classroom,meet_link,alert,image,extra,period) {
        this.code = code
        this.name = name
        this.teacher_name = teacher_name
        this.google_classroom = google_classroom
        this.meet_link = meet_link
        this.alert = alert

        this.image = image
        this.extra = extra
        this.period = period
    }

    /**
     * 
     * @param {Object} Obj 
     */
    assign = function(Obj) {
        Object.assign(this,Obj)
        return this
    }

    /**
     * 
     * @param {number} period 
     */
    set_period = function(period) {
        this.period = period
        return this
    }

    /**
     * 
     * @param {string} url 
     * @returns {null}
     */
    set_meeting_link = function(url) {
        this.meeting_link = url
        return this
    }

    /**
     * 
     * @param {boolean} enable 
     */
    set_alert_enable = function(enable) {
        this.alert.enable = enable
    }
    
    /**
     * 
     * @param {boolean} ping 
     */
    set_alert_ping = function(ping) {
        this.alert.ping = enable
    }

}

class TimeTable {

    /**
     * @param {Subject[]} Subjects 
     * @param {string[][]} _TimeTable 
     */
    constructor( Subjects , _TimeTable) {
        this._TimeTable = _TimeTable
        this.Subjects = Subjects

        // assign json object to Subject
        Object.entries(this.Subjects).forEach ( v => {this.Subjects[v[0]] =  (new Subject()).assign(v[1])} )
        this.CurrentTimeTable = this.get_current_table()
        this.force_period = undefined
    }
    
    /**
     * 
     * @returns {number}
     */
    get_current_period = () => {
        if (this.force_period !== undefined) return this.force_period

        const period_len = 50
        const first_period = (8 * 60) + 30 // first period start at 8.30
        let curtime = new Date()
        let minsum = (curtime.getHours() * 60) + curtime.getMinutes()
        return Math.round(( (minsum - first_period) / period_len) + 0.5) - 1 // add 0.5 to round number up & array start at 0 :)
    }

    /**
     * 
     * @returns {string[]}
     */
    get_current_table = function() {
        return this._TimeTable[daysofweek[(new Date()).getDay()]]
    }

    /**
     * 
     * @param {string} code 
     * @returns {?Subject}
     */
    get_subject = function(code) {
        return this.Subjects[code]
    }

     /**
     * get _subhect wrapper will turn Unkow object instance of undefine
     * @param {string} code 
     * @returns {Subject}
     */
    get_subject_safe = function(code) {
        let s = this.get_subject(code)
        if (typeof s === 'undefined') {
            s = new Subject(
                code,
                "ไม่มีข้อมูล",
                "ไม่มีข้อมูล",
                "https://discordapp.com",
                "https://discordapp.com",
                {},
                "",
                "ไม่มีข้อมูล")
        }
        return s
    }
   
    /**
     * @param {number} period
     * @returns {Subject|null}
     */
    get_period_subject = function(period) {
        return this.get_subject_safe(this.get_period_subject_code(period)).set_period(period)
    }


    /**
     * @param {number} period
     * @returns {string|null}
     */
    get_period_subject_code = function(period) {
        if (this.CurrentTimeTable.length < period)
            return null
        if (period < 0)
            return null
        
        return this.CurrentTimeTable[period]
    }

    /**
     * @returns {string}
     */
    get_current_subject_code = function () {
        return this.get_period_subject_code(this.get_current_period())
    }

    /**
     * 
     * @returns {Subject}
     */
    get_current_subject = function() {
        return this.get_period_subject(this.get_current_period())
    }

    /**
     * 
     * @returns {boolean}
     */
    is_school_over = function() {
        return this.get_current_period() > this.CurrentTimeTable.length - 1
    }

    /**
     * 
     * @returns {boolean}
     */
    is_school_start = function() {
        return this.get_current_period() > -1
    }

    
    /**
     * @param {?string|number|Date} day
     */
    is_weekend = function(day) {
        
        if (typeof day === 'undefined')
            return !!this._TimeTable.weekend.find( v => v === daysofweek[(new Date()).getDay()])
            
        if (typeof day === 'string')
            return !!this._TimeTable.weekend.find( v => v === day)

        if (typeof day === 'number')
            return !!this._TimeTable.weekend.find( v => v === daysofweek[day])

        if (typeof day === 'Date')
            return !!this._TimeTable.weekend.find( v => v === daysofweek[day.getDay()])

    }

    /**
     * 
     * @param {number} period 
     * @returns {Date}
     */
     static get_period_start = (period) => {
        const first_period = (8 * 60) + 30
        let t = new Date()
        t.setHours(0,0,0,0)
        t.setMinutes(first_period + period * 50)
        return t
    }

    /**
     * 
     * @param {number} period 
     * @returns {Date}
     */
    static get_period_end = (period) => {
        let t = TimeTable.get_period_start(period)
        t.setMinutes(t.getMinutes() + 50)
        return t
    }
    
}

module.exports = {
    Subject,
    TimeTable
}
