var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//User collection
reservas = new mongoose.Schema({
    nombre:     {type: String},
    correo:     {type: String},
    event: 		{type: Schema.ObjectId, ref: 'activitiesmodel'},
    fecha:      {type: Date, default: new Date()},
    quantity: 	{type: Number},
    mount: 		   {type: Number},
    typePayment:   {type: String},
    wasPayment:    {type: Boolean, default: false},
    status:        {type: String},
    options:       {type: Array, default: []},
    codeTransaction: {type: String},
    dateReserv: {type: String}
});

module.exports = mongoose.model('reservasmodel',reservas);