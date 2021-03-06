"use strict"

let util = require("util");
let exec = require("child_process").exec;
let fs = require("fs");
let request = require("request");
let Infiniteloop = require("infinite-loop");
let express = require("express");
let app = express();



let addr = process.argv[3].split(",");//"http://192.168.2.134:8080/video";
let destAddr = "http://127.0.0.1:8086";
let quality = ["500k", "1000k", "2000k"];
let qualityDash = ["500000", "1000000", "2000000"];
let counter = 1; //global variable
let counterFind = 0;
let contentId = process.argv[2].split(",");


  for (let i = 0; i < quality.length; i++) {
    setTimeout(
      function() {
        var child;
        child = exec(
          `ffmpeg -use_wallclock_as_timestamps 1 -i ` +
            addr +
            ` -c copy -flags +global_header -map 0 -codec:v libx264 -profile:v main -b:v ` +
            quality[i] +
            ` -vf scale=640:480 -x264opts keyint=12:min-keyint=12:scenecut=-1 -bf 0 -r 24 -f segment -segment_time 6 -segment_format_options movflags=+faststart -reset_timestamps 1 ${contentId}/${quality[i]}/${quality[i]}_%d.mp4`,
          function(error, stdout, stderr) {
            util.print("stdout: " + stdout);
            util.print("stderr: " + stderr);
            if (error !== null) {
              console.log("exec error: " + error);
            }
          }
        );
      },0);
  };


function mp4box() {
    console.log("=============================>>>>>>>>>>>>>>"+ counter);
  if (
    fs.existsSync(contentId + "/" + quality[0] + "/" + quality[0] + "_" + counter + ".mp4") &&
    fs.existsSync(contentId + "/" + quality[1] + "/" + quality[1] + "_" + counter + ".mp4") &&
    fs.existsSync(contentId + "/" + quality[2] + "/" + quality[2] + "_" + counter + ".mp4")
  ) {
    var counterTmp = counter - 1;
    var child;
    child = exec(
      `MP4Box -dash 6000-profile live -bs-switching no -segment-name '${contentId}/$RepresentationID$_${counterTmp}' -out 'mpd.mpd' ${contentId}/${quality[0]}/${quality[0]}_${counterTmp}.mp4 ${contentId}/${quality[1]}/${quality[1]}_${counterTmp}.mp4 ${contentId}/${quality[2]}/${quality[2]}_${counterTmp}.mp4`,
      function(error, stdout, stderr) {
        util.print("stdout: " + stdout);
        util.print("stderr: " + stderr);
        if (error !== null) {
          console.log("exec error: " + error);
        }
      }
    );
     counter++;
  }
}


function renameSendDelete () {
  if (
    fs.existsSync(contentId + "/" + "2_"+counterFind+"1.m4s") &&
    fs.existsSync(contentId + "/" + "3_"+counterFind+"1.m4s") &&
    fs.existsSync(contentId + "/" + "4_"+counterFind+"1.m4s")
  ) {
    var counterRename = counterFind + 1;

    /*----------------------------------- Quality 500k ---------------------------------*/

    // rename
    fs.rename(contentId + "/" + "2_"+counterFind+"1.m4s", contentId + "/" + "out"+qualityDash[0]+"_dash"+counterRename+".m4s", function(err) {
      if ( err ) console.log('ERROR: ' + err);
      // Send
      fs.createReadStream(contentId + "/" + "out"+qualityDash[0]+"_dash"+counterRename+".m4s").pipe(request.put(destAddr +"/api/content/"+contentId+"/"+qualityDash[0]+"/"+ "out"+qualityDash[0]+"_dash"+counterRename+".m4s"));
    });
    //Delete
    fs.unlinkSync(contentId + "/" +quality[0] + "/" +quality[0] + "_" + counterFind + ".mp4");


    /*------------------------------------- Quality 1000k -------------------------------*/

  fs.rename(contentId + "/" + "3_"+counterFind+"1.m4s", contentId + "/" + "out"+qualityDash[1]+"_dash"+counterRename+".m4s", function(err) {
      if ( err ) console.log('ERROR: ' + err);
      // Send
      fs.createReadStream(contentId + "/" + "out"+qualityDash[1]+"_dash"+counterRename+".m4s").pipe(request.put(destAddr +"/api/content/"+contentId+"/"+qualityDash[1]+"/"+ "out"+qualityDash[1]+"_dash"+counterRename+".m4s"));
    });

    //Delete
    fs.unlinkSync(contentId + "/" + quality[1] + "/" +quality[1] + "_" + counterFind + ".mp4");
  
    /*--------------------------------------- Quality 2000k --------------------------------*/

  fs.rename(contentId + "/" + "4_"+counterFind+"1.m4s", contentId + "/" + "out"+qualityDash[2]+"_dash"+counterRename+".m4s", function(err) {
      if ( err ) console.log('ERROR: ' + err);
      // Send
      fs.createReadStream(contentId + "/" + "out"+qualityDash[2]+"_dash"+counterRename+".m4s").pipe(request.put(destAddr +"/api/content/"+contentId+"/"+qualityDash[2]+"/"+ "out"+qualityDash[2]+"_dash"+counterRename+".m4s"));
    });
    //Delete
    fs.unlinkSync(contentId + "/" + quality[2] + "/" +quality[2] + "_" + counterFind + ".mp4");

    /*--------------------------------------Send mp4 ----------------------------------------*/

 fs.rename(contentId + "/" + "2_0.mp4", contentId + "/" + "out"+qualityDash[0]+"_dash"+".mp4", function(err) {
      fs.createReadStream(contentId + "/" + "out"+qualityDash[0]+"_dash"+".mp4").pipe(request.put(destAddr +"/api/mp4/" + contentId + "/"+qualityDash[0]+"/"+ "out"+qualityDash[0]+"_dash"+".mp4"));
    });

    fs.rename(contentId + "/" + "3_0.mp4", contentId + "/" + "out"+qualityDash[1]+"_dash"+".mp4", function(err) {
      fs.createReadStream(contentId + "/" + "out"+qualityDash[1]+"_dash"+".mp4").pipe(request.put(destAddr +"/api/mp4/" + contentId + "/"+qualityDash[1]+"/"+ "out"+qualityDash[1]+"_dash"+".mp4"));
    });

    fs.rename(contentId + "/" + "4_0.mp4", contentId + "/" + "out"+qualityDash[2]+"_dash"+".mp4", function(err) {
      fs.createReadStream(contentId + "/" + "out"+qualityDash[2]+"_dash"+".mp4").pipe(request.put(destAddr +"/api/mp4/" + contentId + "/"+qualityDash[2]+"/"+ "out"+qualityDash[2]+"_dash"+".mp4"));
    });
    counterFind ++;
  }
}

//loop for mp4tom4s
var loop1 = new Infiniteloop();
//use loop.add to add a function
//fisrt argument should be the fn, the rest is the fn's arguments
loop1.add(mp4box, []);
loop1.setInterval(2000);
loop1.run();


//loop for renameSendDelete
var loop2 = new Infiniteloop();
loop2.add(renameSendDelete, []);
loop2.setInterval(2000);
loop2.run();

let server = app.listen(6500);
server.timeout = 100000000;



















/*
ffmpeg -use_wallclock_as_timestamps 1 -i http://192.168.0.25:8080/video -c copy -flags +global_header -map 0 -codec:v libx264 -profile:v main -b:v 500k -vf scale=640:480 -x264opts keyint=12:min-keyint=12:scenecut=-1 -bf 0 -r 24 -f segment -segment_time 6 -segment_format_options movflags=+faststart -reset_timestamps 1 500k_%d.mp4
*/