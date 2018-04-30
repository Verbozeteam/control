
// SIMPLE_UI | SIMPLE_LIGHT_UI | MODERN_UI
const defaultUIStyle = 'SIMPLE_UI';

var default_ip = "{{TARGET_IP}}";
var default_port = "{{TARGET_PORT}}";
var default_ssid = "{{SSID}}";
var default_passphrase = "{{PASSWORD}}";

if (default_ssid === ("{"+"{SSID}}")) default_ssid = "";
if (default_passphrase === ("{"+"{PASSWORD}}")) default_passphrase = "";
if (default_ip === ("{"+"{TARGET_IP}}")) default_ip = "192.168.10.1";
if (default_port === ("{"+"{TARGET_PORT}}")) default_port = 7990;
else if (typeof(default_port) === "string") default_port = parseInt(default_port);

try {
    if (__DEV__) {
        default_ip = "10.11.28.190";
        default_port = 4567;
    }
} catch (e) {}

export {
    defaultUIStyle,
    default_ip,
    default_port,
    default_ssid,
    default_passphrase,
};
