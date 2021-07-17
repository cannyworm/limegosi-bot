
class Subject {
    constructor(code  , time , length , period , extra_information ) {
        this.code = code
        this.time = time
        this.length = length
        this.period = period
        

        const { name , teacher_name , gclass_link , meet_link } = extra_information

        this.name = name ?? this.code
        this.teacher_name = teacher_name ?? "not define" 
        this.gclass_link = gclass_link ?? "not define"
        this.meet_link = meet_link ?? "not define"
    }

}


module.exports  = {
    Subject
}