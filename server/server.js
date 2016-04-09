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
        //data['time'] = new Date().toString();
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
    if(db['buss'][id]['time'] != undefined)
        var difference = timeDifference(db['buss'][id]['time']);
    // dont mind fetching new timetables, not yet 5 minutes have passed
    if(difference != undefined && difference < (1000*60*5)) {
        if(callback) callback(db['buss'][id]);
        return;
    }
    console.log("updating buss shit");
    request(
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
                        console.log("updated buss information for buss stop "+id);
                        // update db file
                        db['buss'][id] = departures;
                        writedb(db);

                        if(callback) callback(departures);
                    }
                }
            );
        }
    );
}

var fetchWeather = function(callback) {
    if(db['weather'] == undefined) db['weather'] = {};
    // get difference in time between now and last update
    if(db['weather']['time'] != undefined)
        var difference = timeDifference(db['weather']['time']);
    
    if(difference != undefined && difference < (1000*60*5)) {
        if(callback) callback(db['weather']);
        return;
    }
    console.log("updating weather shit");
    request(
        "http://skinfo.dy.fi/api/weather.json",
        function(error, res, body) {
            if(error) console.log(error);
            else {
                var weather = JSON.parse(body);
                weather['time'] = new Date().toString();         
                console.log("updated weather information");
                // update db file
                db['weather'] = weather;
                writedb(db);
                if(callback) callback(departures);
            }
        }
    );
}

app.get('/buses/:id', function(req, res) {
    var stop_id = req.params.id;
    if(stop_id == undefined) stop_id = buss_stop;
    fetchBusses(stop_id, function(data) {
        res.send(JSON.stringify(db['buss'][stop_id]));
        res.end();
    });  
});


app.get('/weather', function(req, res) {
    fetchWeather(function(data) {
        res.send(JSON.stringify(db['weather']['current']));
        res.end();
    });  
});


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
    
    fetchBusses(buss_stop, function(data) {

    });

    fetchWeather();
};
/*
    busses from university
    http://bussit.lappeenranta.fi/bussit/web?command=rsearch&action=sd&id=205390
    finkino movies
    http://www.finnkino.fi/xml/Schedule/?area=1041&dt=08.04.2016
    lappeenranta happenings
    http://api.uusitapahtumakalenteri.ekarjala.fi/json/lappeenranta
    lämpötila
    http://skinfo.dy.fi/api/weather.json
*/
