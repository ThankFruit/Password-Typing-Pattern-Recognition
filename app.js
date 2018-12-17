var express = require("express");
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var mongoose = require("mongoose")
mongoose.connect("mongodb://localhost/test");

//SCHEMA SETUP
var patternSchema = new mongoose.Schema({
    name: String,
    password: String,
    intervals: [Number],
    distances: [Number],
    stdDev: Number,
    averageDis: Number,
    value: Number
});
var Pattern = mongoose.model("Pattern", patternSchema);

app.set("view engine", "ejs");//不用再写.ejs

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/collectdata/start", function(req, res){
    res.render("start");
});

app.get("/demo", function(req, res){
    res.render("demo");
});
app.get("/collectdata/:next", function(req, res){
    var namei = req.query.name;
    var next = req.params.next;
    res.render(next, {namei: namei});
});

app.post("/collectdata/password", function(req, res){
    var name = req.query.name;
    var url = "/collectdata/password?name="+name;
    res.redirect(url);
});

app.post("/collectdata/:next", function(req, res){
    var next = req.params.next;
    var intervals = req.query.intervals.split(',');
    var distances = req.query.distances.split(',');
    var name = req.query.name;
    var stdDev = req.query.stdDev;
    var url = "/collectdata/"+next+"?name="+name;
    Pattern.create({
        name: req.query.name, 
        password: req.query.password,
        intervals: intervals,
        distances: distances,
        value: req.query.value,
        averageDis: req.query.averageDis,
        stdDev: req.query.standerdDev
    });
    res.redirect(url);
});

app.get("/test", function(req, res){
    res.render("test");
});

app.post("/test/result", function(req, res){
    var intervals = req.query.intervals.split(',');
    var password = req.query.password;
    var min = 9999;
    var indexMin = -1;
    Pattern.find({"password": password}, function(err, allpatterns){
        if(err){
            console.log(err);
        }else{
            console.log(allpatterns);
            for(var i=0; i<allpatterns.length; i++){
                var distance = calDistance(intervals, allpatterns[i].intervals);
                if(distance < min){
                    min = distance;
                    indexMin = i;
                }
            }
            console.log(indexMin);
            console.log(min);
            var stddev = allpatterns[indexMin].stdDev;
            var meandistance = allpatterns[indexMin].averageDis;
            var name = allpatterns[indexMin].name;
            var found = true;
            if(Math.abs(meandistance-min)>2*stddev){
                found = false;
            }
            res.render("result", {password: password, name: name, found: found});
        }
    });
});
function calDistance(inter1, inter2){
    var sum = 0;
    for(var i=0; i<inter1.length; i++){
        sum = sum+(inter1[i]-inter2[i])*(inter1[i]-inter2[i]);
    }
    return Math.sqrt(sum);
}

app.get("/data", function(req, res){
    Pattern.find({}, function(err, allpatterns){
        if(err){
            console.log(err);
        }else{
            res.render("data", {allpatterns: allpatterns});
        }
    });
});
function calDistance(inter1, inter2){
    var sum = 0;
    for(var i=0; i<inter1.length; i++){
        sum = sum+(inter1[i]-inter2[i])*(inter1[i]-inter2[i]);
    }
    return Math.sqrt(sum);
    
}


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("the server has started");
});