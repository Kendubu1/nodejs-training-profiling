const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs');
var os = require('os');
const convertTime = require('microseconds')
var profiler = require('v8-profiler-node8');
var heapdump = require('heapdump')

app.get('/', (req, res) => {
  res.json({msg: 'Hello AppsReadyNext NodeJS Session.'});
});

function LeakingClass() { }

function fibonacci(n){
  if(n < 1){return 0;}
  else if(n == 1 || n == 2){return 1;}
  else if(n > 2){return fibonacci(n - 1) + fibonacci(n-2);}
}

function saveObjects (objectID) {
  const numbers = objectID / 8;
  const arr = []
  arr.length = numbers;
  for (let i = 0; i < numbers; i++) {
      arr[i] = i;
  }
  return arr;
};

app.use('/memory/:id', (req, res) => {
  var leaks = [];
  let id = req.params['id'];
  setInterval(function() {
    for (var i = 0; i < id; i++) {
      leaks.push(new LeakingClass);
    }
    console.log('Leaks: %d', leaks.length);
  }, 1000);
  res.json({msg: 'Command received...'});
});

var objectList = [];
app.use('/memory2', (req, res) => {
  let id = 200000 * 1024;
  const objectId = saveObjects(id);
  objectList.push(objectId);
  res.json({msg: 'Command received...'});
});

app.use('/cpu/:id', (req, res)=>{
  let id = req.params['id'];
  res.json({msg: 'Command received...' + fibonacci(id)});
});

app.get('/profiler/cpu/start/:id', function (req, res) {
  let id = req.params['id'];
  profiler.startProfiling(id);
  res.json({msg: 'Profiler started...'});
});

app.get('/profiler/cpu/stop/:id', function (req, res) {
  let id = req.params['id'];
  let profile = profiler.stopProfiling(id);
  fs.writeFile(__dirname + '/profiles/' + id + '.cpuprofile', JSON.stringify(profile), function () {
    console.log('CPU Profile data saved...');
  });
  res.json({msg: 'CPU Profiler stopped...'});
});

app.get('/profiler/memory/start/:id', function (req, res) {
  let id = req.params['id'];

  heapdump.writeSnapshot((err, filename) => {
    console.log("Heap dump written to", filename);
  });
  
  snapshot = profiler.takeSnapshot(id);
  snapshot.export(function(error, result){
    fs.writeFile(__dirname + '/profiles/' + id + '.heapsnapshot', JSON.stringify(result), function () {
      console.log('Memory profile data saved...');
    });
  })
  
  res.json({msg: 'Heapdump taken...'});
});


app.get('/process', function(req, res){
  const memory= process.memoryUsage();
  res.json({
      rss: `${Math.round(memory['rss'] / 1024 / 1024 * 100) / 100} MB`, //Resident set size (RSS) is the portion of memory occupied by a process that is held in main memory (RAM)
      heapTotal:`${Math.round(memory['heapTotal'] / 1024 / 1024 * 100) / 100} MB`, //Total Size of the Heap
      heapUsed:`${Math.round(memory['heapUsed'] / 1024 / 1024 * 100) / 100} MB`, //Heap actually Used
      external:`${Math.round(memory['external'] / 1024 / 1024 * 100) / 100} MB`,
      memory_raw: process.memoryUsage(),
      cpu_user: convertTime.parse(process.cpuUsage().user), //return the system and user cpu time in microseconds
      cpu_system: convertTime.parse(process.cpuUsage().system),
      cpu_raw: process.cpuUsage(),
      load_avarage: os.loadavg()
    });
  
})
app.listen(port, () => console.log('Listening on port %s', port));
