var http = require('http');

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
//change unique ID with actual value
var options = {
    host: 'www.duckdns.org',
    path: '/update/DNSName/xxxx-x-xx-xxx-xx'
};

callback = function(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function(chunk) {
        str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function() {
        console.log(str);
    });
}
http.request(options, callback).end();

var i = 0;
setInterval(function() {

    i = i + 1;
    var ip = "10.10.1." + i;
    if (i == 200) {
        i = 0;
    }
    var duckDns = {
        host: 'www.duckdns.org',
        path: '/update/DNSName/xxxx-x-xx-xxx-xx/' + ip
    };
    console.log("calling duck IP:" + ip);
    http.request(duckDns, callback).end();
    setTimeout(function() {
        console.log("calling duck IP:" + "default IP");
        http.request(options, callback).end();
    }, 10000)

}, 3600000);
//3600000
