var auto_del_time = (time) => {
    return (msg) => { setTimeout((m) => { if (m.deleted) {return}  m.delete().then((mm) => console.log(`[i] message ${mm.id} deleted `)) }, time, msg) }
}

module.exports = {
    auto_del_time
}