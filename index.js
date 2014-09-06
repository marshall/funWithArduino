var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    five = require('johnny-five'),
    board = new five.Board();

var slider1, slider2;
var led1, led2;

function analogToCelsius(analogValue) {
  // For the TMP36 sensor specifically
  return ((analogValue * 0.004882814) - 0.5) * 100;
}

function analogToFahrenheit(analogValue) {
  return analogToCelsius(analogValue) * ( 9/5 ) + 32;
}

board.on('ready', function() {
  slider1 = new five.Sensor('A0');
  led1 = new five.Led(5);

  slider2 = new five.Sensor('A1');
  led2 = new five.Led(6);

  slider3 = new five.Sensor('A2');
  temp = new five.Sensor('A4');

  slider1.scale([0, 255]).on('slide', function() {
    led1.brightness(this.value);
    io.emit('slider-value', { id: 1, value: this.value });
  });

  slider2.scale([0, 255]).on('slide', function() {
    led2.brightness(this.value);
    io.emit('slider-value', { id: 2, value: this.value });
  });

  slider3.scale([0, 255]).on('slide', function() {
    io.emit('slider-value', { id: 3, value: this.value });
  });

  setInterval(function() {
    temp.on('data', function tempListener() {
      temp.removeListener('data', tempListener);

      var c, f;
      c = analogToCelsius(this.value);
      f = analogToFahrenheit(this.value);
      io.emit('temperature', { c: c, f: f });
    });
  }, 1000);
});

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
   console.log('listening on *:3000');
});
