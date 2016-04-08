var express = require('express'),
    app     = express(),
    request = require('request'),
    fs      = require('fs'),
    jsdom   = require('jsdom'),
    PORT    = process.env.PORT || 8000;

const db_path = 'db.json';
const buss_stop = 205390;
var db = {
    'buss':{}
};

var dbinit = function (callback) {
    // create file if it does not already exist
    fs.open(db_path, 'a', function(err, fd) {
        if(err) console.log(err);
        else {
            console.log('database file ('+db_path+') opened successfully');
            readdb(function(data){
                db = data;
                if(callback) callback();
            });
        }
    })
}

var readdb = function (callback) {
    fs.readFile(db_path, 'utf-8', function(err, data) {
        if (err) console.log(err);
        else {
            try {
                data = JSON.parse(data);
                if(callback) callback(data);
            } catch (err) {
                console.log("failed to parse db.json, initializing with empty (might be first time opened)");
                writedb(db, callback);
            }
        }
    });
}

var writedb = function(data, callback) {
    try {
        // pretty printing enabled
        data['time'] = new Date().toString();
        var json = JSON.stringify(data, null, 4);
    } catch(err) {
        console.log("(writedb) failed JSON.toString");
        return;
    }
    fs.writeFile(db_path, json, 'utf-8', function(err) {
        if (err) console.log(err);
        else {
            if(callback) callback();
        }
    });
}
/*
    returns time difference between now and then (in mm.)
*/
var timeDifference = function (then) {
    var difference = undefined;
    if(then != undefined) {
        try {
            difference = ((new Date()).getTime() - (new Date(then)).getTime());
        } catch (err) {
            console.log(err);
            console.log("something weird happened when tried to use new Date on your stupid time parameter, fix it!");
        }
    } else {
        console.log("you stupid cunt, you gave timeDifference function undefined parameter!");
    }
    return difference;
}
var fetchBusses = function (id, callback) {
    // in entirely empty db there is no buss stops
    if(db['buss'][id] == undefined) db['buss'][id] = {};
    // get difference in time between now and last update
    var difference = timeDifference(db['buss'][id]['time']);
    // dont mind fetching new timetables, not yet 5 minutes have passed
    if(difference != undefined && difference < (1000*60*5)) return;

    return request(
        'http://bussit.lappeenranta.fi/bussit/web?command=rsearch&action=sd&id='+id,
        function(error, res, body) {
            jsdom.env(
                body,
                ["http://code.jquery.com/jquery.js"], // tän nyt melkein vois ladata servulle
                function(err, window) {
                    if(err) console.log(err);
                    else {
                        var $ = window.$;
                        var departures = {};
                        departures['time'] = new Date().toString();
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
                        console.log("updated buss information for buss stop "+buss_stop);
                        if(callback) callback(departures);
                    }
                }
            );
        }
    );
}

var server = app.listen(PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Express server now running at https://%s:%s", host, port);
    dbinit(update);
});

// start database updating here
var update = function() {
    console.log("doing update loop");
    // try updating busses every 1 minute or so (fetchBusses wont actually ping server if we have less than 5 minutes old information)
    setInterval(function() {
            fetchBusses(buss_stop, function(data) {
                db['buss'][buss_stop] = data;
                writedb(db);
            });
        }, 1000*60
    )
};
/*
    busses from university
    http://bussit.lappeenranta.fi/bussit/web?command=rsearch&action=sd&id=205390
    finkino movies
    http://www.finnkino.fi/xml/Schedule/?area=1041&dt=08.04.2016
    lappeenranta happenings
    http://api.uusitapahtumakalenteri.ekarjala.fi/json/lappeenranta
*/
