
class Subject {
    /**
     * 
     * @param {String} code 
     * @param {Number} time 
     * @param {Number} length 
     * @param {Number} period 
     * @param {Object} extra_information 
     * @param {Subject} next_subject 
     */
    constructor(code  , time , length , period , extra_information , next_subject) {
        this.code = code
        this.time = time
        this.length = length
        this.period = period
        

        const { name , teacher_name , gclass_link , meet_link } = extra_information

        this.name = name ?? this.code
        this.teacher_name = teacher_name ?? "not define" 
        this.gclass_link = gclass_link ?? "not define"
        this.meet_link = meet_link ?? "not define"
        this.next = next_subject

    }

}


module.exports  = {
    Subject
}