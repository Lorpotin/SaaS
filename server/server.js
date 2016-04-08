var express = require('express'),
    app     = express(),
    time    = require('time'),
    request = require('request'),
    fs      = require('fs'),
    jsdom   = require('jsdom'),
    PORT    = process.env.PORT || 8000;

var db = 'db.json';

var readdb = function (callback) {
    var options = {
        encoding : 'utf-8'
    }
    fs.readFile(db, options, function(err, data) {
        if (err) console.log(err);
        else {
            if(callback) callback(JSON.parse(data));
        }
    });
}

var getBusses = function (id, callback) {
    var now = new time.Date();
    // nykäistään tähän jotain paskaa mikä tarkastaa ettei tartte joka vitun sekuntti ettiä sitä bussiaikataulua
    return request(
        'http://bussit.lappeenranta.fi/bussit/web?command=rsearch&action=sd&id='+id,
        function(error, res, body) {
            jsdom.env(
                body,
                ["http://code.jquery.com/jquery.js"], // tän nyt melkein vois ladata servulle
                function(err, window) {
                    var $ = window.$;
                    var departures = {};
                    departures['time'] = now.toString();
                    $('#stop-departures').find('.departure').each(function(index, element) {
                        var time = $(this).find('.time').text();
                        var line = $(this).find('.line').text();
                        var dest = $(this).find('.destination').text();
                        var dep = {
                            'time' : time,
                            'line' : line,
                            'destination' : dest
                        }
                        departures[index] = dep;
                    })
                    if(callback) callback(departures);
                }
            );
        }
    );
}

var server = app.listen(PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Express server now running at https://%s:%s", host, port);

    //readdb(console.log);
    //getBusses(205390, console.log);
});

/*
    busses from university
    http://bussit.lappeenranta.fi/bussit/web?command=rsearch&action=sd&id=205390
    finkino movies
    http://www.finnkino.fi/xml/Schedule/?area=1041&dt=08.04.2016
    lappeenranta happenings
    http://api.uusitapahtumakalenteri.ekarjala.fi/json/lappeenranta
*/
