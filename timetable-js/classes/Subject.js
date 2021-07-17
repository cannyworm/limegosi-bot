
class Subject {
    constructor(code  , time , length , period , extra_information ) {
        this.code = code
        this.time = time
        this.length = length
        this.period = period
        

        const { name , teacher_name , gclass_link , meet_link } = extra_information

        this.name = name
        this.teacher_name = teacher_name 
        this.gclass_link = gclass_link
        this.meet_link = meet_link
    }

}


module.exports  = {
    Subject
}