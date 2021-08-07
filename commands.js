const Discord = require('discord.js')
const {auto_del_time} = require('./adt')

var _debug = (format) => {
    console.debug(format)
}

class Command {
    
    /**
    * @async
    * @callback MessageCallback
    * @param {Discord.Message} message
    * @param {string[]} args
    * @return {boolean}
    */

    /**
     * 
     * @param {string} name 
     * @param {MessageCallback} callback 
     * @param {MessageCallback[]} filter 
     */
    constructor(name,callback,filters) {
        /** @type {string} */
        this.name = name

 
       /**
        * @type {MessageCallback}
        */
        this.callback = callback || this.callback

       /**
        * @description Array of MessageCallback. if atleast one of them return false will not call the callback
        * @type {?MessageCallback[]}
        */
        this.filters = filters || []

    }

    /**
     * @returns {boolean}
    * @param {Discord.Message} message
    * @param {string[]} args
     */
    check_filters = async (message,args) => {
        let promiees = []
        this.filters.forEach( (v) => {promiees.push(v(message,args))})
        return (await Promise.all(promiees)).find( v => v === false) === undefined
    }

}

/**
 * @class
 */
class Commands {
    
    /**
    * @typedef CommandsOptions
    * @type {object}
    * @property {number} auto_delete_prompt delete prompt after x ms
    */

    /**
     * 
     * @param {string} prefix 
     * @param {CommandsOptions} options
     */
    constructor(prefix,options) {

         /**
         * @type {string}
         */
        this.prefix = prefix

        /**
         * @type {object.<string,Command>}
         */
        this.commands = {}

        /**
         * @type {CommandsOptions}
         */
        this.options = options || {}
    }

    
    /**
     * 
     * @param {Command} command 
     */
    add_command = (command) => {
        if (typeof this.commands[command.name] !== 'undefined') throw `${command.name} already exits`
        this.commands[command.name] = command
    }

    /**
     *  
     * @param {Discord.Message} message 
     */
    process_command = async (message) => {
        
        let content = message.content

        if (!content.startsWith(this.prefix)) {
            //_debug(`[$] return false because !content.startsWith(this.prefix) (${message.id})`)
            return false
        }

        if (message.author.bot === true) {
            //_debug(`[$] return false because message.author.bot === true (${message.id})`)
            return false
        }


        let args = content.split(' ')
        
        const cmd = this.commands[args[0].slice(this.prefix.length)]
        
        if (typeof cmd === 'undefined') 
            return false

        let filters_result = await cmd.check_filters(message,args)
        if (typeof cmd.filters === 'undefined' || filters_result === true) {
            try {
                await cmd.callback(message, args)
            }
            catch(e) {
                console.log(`[!] error ${e}`)
                throw e
            }
            finally
            {
                if (typeof this.options.auto_delete_prompt !== 'undefined' && this.options.auto_delete_prompt > 0)
                    auto_del_time(this.options.auto_delete_prompt)(message)
            }
        }
        else {
            
            if (filters_result === false)
                _debug(`[$] return false because await cmd.check_filters(message,args) === false (${message.id})`)
            
            return false
        }
        return true
    }

}

module.exports = {
    Command,
    Commands
}
