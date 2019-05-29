let mongoose = require('mongoose');
let { user, item,ticket,alert,ticketItem } = require('./schemas');



module.exports = {
    User: mongoose.model('User', user),
    Item: mongoose.model('Item', item),
    Ticket: mongoose.model('Ticket',ticket),
    Alert: mongoose.model('Alert',alert),
    TicketItem:mongoose.model('TickerItem',ticketItem)
}