var mongoose  =  require('mongoose');
var ObjectId  = mongoose.Schema.ObjectId;
require('../models/modelReservas');
require('../models/modelReservasByUser');
require('../models/modelUsers');
require('../models/modelActivities')
var reserva =  mongoose.model('reservasmodel');
var reservaByUser = mongoose.model('reservasbyusermodel');
var User = mongoose.model('usuariosmodel');
var Activities = mongoose.model('activitiesmodel');

var sendMail = require('../config/sendMail');
var mensaje = 'Gracias por reservar con nosotros, <p>DPlan</p> el mejor lugar para estar al tanto de las actividades unicas que puedes'                        + 'realizar a menos de 2 horas de tu ubicación';
//POST - Insert a new user in the Collection
/*

    req.body = {
        
        nombre:     {type: String},
        correo:     {type: String},
        event: 		{type: Schema.ObjectId, ref: 'activitiesmodel'},
        fecha:      {type: Date, default: new Date()},
        quantity: 	{type: Number},
        mount: 		   {type: Number},
        typePayment:   {type: String},
        wasPayment:    {type: Boolean, default: false},
        status:        {type: String},
        options:       {type: Array, default: []}
    
    }
    
*/

exports.saveReserva = function(req, res) {
    saveReserva(req.body, function(result){
        console.log(result);
        if(!result.err){
           return res.status(200).send(result);
        }else{
           return res.status(500).send(result);
        }
    });
};

exports.getReservas = function(req, res) {
    reserva.find({}).populate('event', 'name').exec(function(err, reservas) {
        if (!err) return res.status(200).json({reservas: reservas});
        return res.status(500).json({err: err});
    });
};

exports.getReserva = function(req, res) {
    reserva.findOne({'_id':mongoose.Types.ObjectId(req.query.id)},function(err, reserva) {
        if (!err) return res.status(200).json({reserva: reserva});
        return res.status(500).json({err: err});
    });
};

exports.updateReserva = function(req, res) {
    reserva.findByIdAndUpdate({_id: req.body.id}, {$set: req.body.dataToUpdate}, function(err,updated) {
        if (!err) return res.status(200).json({reserva: updated});
        return res.status(500).json({err: err});
    });
};

//Helpers
function addReservation(correo, reserva, next) {
    User.findOne({correo: correo},function(err,user) {
        if (!err && user) {
            var reservaBy = new reservaByUser({user:user._id, reserva: reserva._id});
            reservaBy.save(function(err,newreserby) {
                if (err) next({err:true,message:err});
                next(null);
            });
        }
    });
};

function saveReserva(objectReserv, cb){
    var newReserv = new reserva(objectReserv);
    newReserv.save(function(err, newreserva){
        if (err) { cb({err:true, message: err.message}); }
        addReservation(objectReserv.correo, newreserva, function(next) {
            if(objectReserv.status === 'Aceptada') {
                 updateOptions(objectReserv, function(err){
                    if(!err){
                        sendMail.send(objectReserv.nombre, objectReserv.correo, mensaje);
                        cb({err:false, message: 'Reserva creada correctamente, te contactaremos para confirmar tu reserva'});
                    }else{
                        cb({err:true, message: err.message});
                    }
                 }); 
            }
            
            cb({err:false, message: 'reserva rechazada creada correctamente'});
            
        });
        cb({err:false, message: 'reserva rechazada creada correctamente'});
    });
};

function updateOptions(reserva, cb){
    Activities.findOne({'_id':reserva.event},function(err, activity){
       if(!err){
           Activities.update({'_id':reserva.event}, {$set: {options: reCount(activity, reserva.options)}}, function(err,updated){
               if(err) cb(err);
               cb(null);
           });
       }else{
           cb(err)
       } 
    });
};

function reCount(activity, options){
    for(var i=0; i > options.length; i++){
        for(var i=0; i > options.length; i++){
            if(options[i].name === activity.options[j].name ){
               activity.options[j].numAvailabe -= options[i].qtyReserv;   
            }
        }
    }
    return activity.options;
};