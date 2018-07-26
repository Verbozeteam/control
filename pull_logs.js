const FS = require('fs');
const Exec = require('child_process').exec;
const SourceMap = require('source-map');

/*
 * Files loaded from ADB and are ready, parse the crashlog.
 */
function onFilesReady(crashlog, sourcemap, deployment) {
    console.log("Deployment: ", deployment.commit);
    SourceMap.SourceMapConsumer.with(sourcemap, null, consumer => {

    });
}

/*
 * Pull crash logs, sourcemap and deployment files from ADB, load them,
 * delete them and call onFilesReady().
 */
Exec("adb pull /sdcard/crashlog.txt ./tmp_crashlog.txt", (err, stdout, stderr) => {
    console.log(stdout, stderr);
    if (err) {}
    else {
        Exec("adb pull /sdcard/android.main.bundle.map ./tmp_sourcemap.map", (err, stdout, stderr) => {
            console.log(stdout, stderr);
            if (err) {}
            else {
                Exec("adb pull /sdcard/deployment.txt ./tmp_deployment.json", (err, stdout, stderr) => {
                    console.log(stdout, stderr);
                    if (err) {}
                    else {
                        FS.readFile('./tmp_crashlog.txt', function(err, crashlog) {
                            if (err) console.log(err);
                            else {
                                FS.readFile('./tmp_sourcemap.txt', function(err, sourcemap) {
                                    if (err) console.log(err);
                                    else {
                                        FS.readFile('./tmp_deployment.txt', function(err, deployment) {
                                            if (err) {}
                                            else {
                                                Exec("rm ./tmp_crashlog.txt; rm ./tmp_sourcemap.map; rm ./tmp_deployment.json", (err, stdout, stderr) => {
                                                    console.log(stdout, stderr);
                                                    if (err) console.log(err);
                                                    else {
                                                        onFilesReady(crashlog, sourcemap, deployment);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});
