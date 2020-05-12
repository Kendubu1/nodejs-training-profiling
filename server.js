const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({msg: 'Hello AppsReadyNext NodeJS Session.'});
});

function LeakingClass() { }

app.use('/leaking/:id', (req, res) => {
  var leaks = [];
  let id = req.params['id'];
  setInterval(function() {
    for (var i = 0; i < id; i++) {
      leaks.push(new LeakingClass);
    }
    console.error('Leaks: %d', leaks.length);
  }, 1000);
  res.json({msg: 'Command received...'});
});

app.use('/cpu/:id', (req, res)=>{
  let id = req.params['id'];
  res.json({msg: 'Command received...' + fibonacci(id)});
});

app.use('/cpu/kill', (req, res)=>{
  process.exit(0);
});

function fibonacci(n){
  if(n < 1){return 0;}
  else if(n == 1 || n == 2){return 1;}
  else if(n > 2){return fibonacci(n - 1) + fibonacci(n-2);}
}

app.get('/profiler/start/:id', function (req, res) {
  let id = req.params['id'];
  profiler.startProfiling(id);
  res.json({msg: 'Profiler started...'});
});

app.get('/profiler/stop/:id', function (req, res) {
  let id = req.params['id'];
  let profile = profiler.stopProfiling(id);
  fs.writeFile(__dirname + '/profiles/' + id + '.cpuprofile', JSON.stringify(profile), function () {
    console.log('Profile data saved...');
  });
  res.json({msg: 'Profiler stopped...'});
});



app.listen(port, () => console.log('Listening on port %s', port));
