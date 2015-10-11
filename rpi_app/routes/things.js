var express = require('express');
var router = express.Router();

var Gpio = require('onoff').Gpio,
    led1 = new Gpio(17, 'out'),led2 = new Gpio(27, 'out'),led3 = new Gpio(22, 'out') ;
var gpioport = require('rpi-gpio');



/* POST */
router.post('/', function(req, res, next) {
     

	console.log(req.body);
	if (req.body.device=="led1"){
                if (req.body.command=="on"){
                         led1.writeSync(1)
                }else if(req.body.command=="off"){
                         led1.writeSync(0)
                }else if(req.body.command=="status"){
         
			gpioport.setup(7,gpioport.DIR_IN, function(){
        			gpioport.read(7, function(err, value){
                			if (err) {
                       				 res.send('err');
                			} else {
                        			if (value==true){
                                			res.send("LED1 is on");
						
                        			}else if(value==false){
                                			res.send("LED1 is off");
						}
                        		}
                		});
        		});

		}
	}else if (req.body.device=="led2"){
                if (req.body.command=="on"){
                         led2.writeSync(1)
                }else if(req.body.command=="off"){
                         led2.writeSync(0)
                }else if(req.body.command=="status"){
          
			gpioport.setup(16,gpioport.DIR_IN, function(){
        			gpioport.read(16, function(err, value){
                			if (err) {
                        			res.send('err');
                			} else {
                        			if (value==true){
                                			res.send("LED2 is on");
						
                        			}else if(value==false){
                                			res.send("LED2 is off");
						}
                        		}
                		});
        		});

		}
	}else if (req.body.device=="led3"){
		if (req.body.command=="on"){
			 led3.writeSync(1)
		}else if(req.body.command=="off"){
			 led3.writeSync(0)
		}else if(req.body.command=="status"){
         
			gpioport.setup(18,gpioport.DIR_IN, function(){
				gpioport.read(18, function(err, value){
					if (err) {
						res.send('err');
					} else {
						if (value==true){
							res.send("LED3 is on");
						}else if(value==false){
							res.send("LED3 is off");
						}
					}
				});
			});

		}
           
	}
});


module.exports = router;



