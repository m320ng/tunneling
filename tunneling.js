var spawn = require('child_process').spawn;
var async = require('async');
//var ON_DEATH = require('death');
var ON_DEATH = require('death')({uncaughtException: true});
ON_DEATH(function(err) {
	console.log('on-death');
	console.log(err);
	process.exit();
});

var target_list = [{
	host: 'heyo.iptime.org',
	port: 3022,
	pem: __dirname+'/pogo_server.pem',
	listen: 30022,
	dest: 'localhost:22',
},{
	host: 'heyo.iptime.org',
	port: 3022,
	pem: __dirname+'/pogo_server.pem',
	listen: 30212,
	dest: '10.60.68.212:3389',
},{
	host: 'heyo.iptime.org',
	port: 3022,
	pem: __dirname+'/pogo_server.pem',
	listen: 30211,
	dest: '10.60.68.211:3389',
},{
	host: 'heyo.iptime.org',
	port: 3022,
	pem: __dirname+'/pogo_server.pem',
	listen: 30210,
	dest: '10.60.68.210:3389',
},{
	host: 'heyo.iptime.org',
	port: 3022,
	pem: __dirname+'/pogo_server.pem',
	listen: 30061,
	dest: '10.10.10.61:1433',
},{
	host: 'heyo.iptime.org',
	port: 3022,
	pem: __dirname+'/pogo_server.pem',
	listen: 30063,
	dest: '10.10.10.63:1433',
},{
        host: 'heyo.iptime.org',
        port: 3022,
	pem: __dirname+'/pogo_server.pem',
        listen: 30165,
        dest: '125.60.69.165:1433',
},{
	host: 'heyo.iptime.org',
	port: 3022,
	pem: __dirname+'/pogo_server.pem',
	listen: 30043,
	dest: '172.17.50.43:3389',
},{
        host: 'heyo.iptime.org',
        port: 3022,
        pem: __dirname+'/pogo_server.pem',
        listen: 31043,
        dest: '172.17.50.43:8080',
}];

//process.on('SIGKILL', function () {
//	process.exit();
//});
process.on('SIGINT', function () {
	process.exit();
});
process.on('exit', function () {
	console.log('exit..');
	target_list.forEach(function(target) {
		if (target.ssh) target.ssh.kill();
	});
});
async.eachSeries(target_list, function(target, next) {
	var connect = function(target) {
		var ssh = spawn('ssh', ['-i'+target.pem, '-R'+target.listen+':'+target.dest,'-p'+target.port,'-g',target.host]);
		console.log('ssh::start');
		console.log(target);
		target.ssh = ssh;
		ssh.stdout.on('data', function(data) {
			console.log('stdout:'+data);
			if (data.toString().indexOf('Are you sure you want to continue connecting')!=-1) {
				ssh.stdin.write("yes\n");
			}
		});
		ssh.stderr.on('data', function(data) {
			console.log('stderr:'+data);
			if (data.toString().indexOf('remote port forwarding failed')!=-1) {
				ssh.kill();
			}
		});
		ssh.on('exit', function() {
			ssh.stderr.removeAllListeners('data'); 
			ssh.stdout.removeAllListeners('data'); 
			target.ssh = null;
			console.log('ssh::exit');
			console.log(target);

			setTimeout(function() {
				connect(target);
			}, 15000);
		});
	}
	connect(target);
	next();
}, function() {
	console.log('started.');
});


//var ssh = spawn('ssh', ['-i pogo_server.pem', '-R*:'+target.listen+':'+target.dest,'-p'+target.port,'-g',target.host]);
/*
process.stdin.resume();
process.stdin.on('data', function (chunk) {
  ssh.stdin.write(chunk);
});
setTimeout(function() {
	ssh.stdin.write('ls\n');
}, 3000);
*/
