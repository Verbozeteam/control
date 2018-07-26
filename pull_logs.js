const FS = require('fs');
const Exec = require('child_process').exec;
const SourceMap = require('source-map');

var cmdArgs = process.argv.slice(2);
function hasArg(a) {
    if (typeof(a) != typeof([]))
        a = [a];
    return cmdArgs.filter(arg => arg == a).length > 0;
}

/*
 * Files loaded from ADB and are ready, parse the crashlog.
 */
function onFilesReady(crashlog, sourcemap, deployment) {
    deployment = JSON.parse(deployment);
    sourcemap = JSON.parse(sourcemap);
    crashlog = crashlog.toString('utf-8').split('\n').join(' ');
    crashlog = crashlog.match(/==--~~==(.*?)==~~--==/gi);
    crashlog = crashlog.map(L => JSON.parse(L.substr(8, L.length - 16)));

    console.log("Deployment:", deployment.commit);

    SourceMap.SourceMapConsumer.with(sourcemap, null, consumer => {
        if (hasArg(["--latest", "-l"]))
            crashlog = crashlog.slice(crashlog.length-1);
        for (var i = 0; i < crashlog.length; i++) {
            console.log("\nStack trace: ");
            for (var j = crashlog[i].stack.length - 1; j >= 0; j--) {
                var frame = crashlog[i].stack[j];
                var location = consumer.originalPositionFor(frame);
                var actualLine = FS.readFileSync(location.source, 'utf-8').split('\n')[location.line-1];
                var trimmedLine = actualLine.trim();
                var trimmedCol = location.column - (actualLine.indexOf(trimmedLine));
                console.log("\033[31m" + actualLine.trim() + "\033[0m");
                console.log(Array.from(new Array(trimmedCol), (v, i) => ' ').join("") + Array.from(new Array(location.name ? location.name.length : 1), (v, i) => '^').join(""));
                console.log('  ' + location.source + ':' + location.line + ':' + location.column);
                console.log("  In function " + location.name + ' (' + frame.function + ')');
                console.log("=================");
            }
            console.log("\n" + crashlog[i].message);
        }
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
                                FS.readFile('./tmp_sourcemap.map', function(err, sourcemap) {
                                    if (err) console.log(err);
                                    else {
                                        FS.readFile('./tmp_deployment.json', function(err, deployment) {
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
