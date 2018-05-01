
// SIMPLE_UI | SIMPLE_LIGHT_UI | MODERN_UI
const defaultUIStyle = 'MODERN_UI';

var default_ip = "{{TARGET_IP}}";
var default_port = "{{TARGET_PORT}}";
var default_ssid = "{{SSID}}";
var default_passphrase = "{{PASSWORD}}";
var default_QRCode = "{{QR_CODE}}";

if (default_ssid === ("{"+"{SSID}}")) default_ssid = "";
if (default_passphrase === ("{"+"{PASSWORD}}")) default_passphrase = "";
if (default_ip === ("{"+"{TARGET_IP}}")) default_ip = "192.168.10.1";
if (default_port === ("{"+"{TARGET_PORT}}")) default_port = 7990;
if (default_QRCode === ("{"+"{QR_CODE}}")) default_QRCode = "ws://192.168.10.1:7986/";
else if (typeof(default_port) === "string") default_port = parseInt(default_port);

try {
    if (__DEV__) {
        default_ip = "192.168.10.1";
        default_port = 7990;
    }
} catch (e) {}

export {
    defaultUIStyle,
    default_ip,
    default_port,
    default_ssid,
    default_passphrase,
    default_QRCode,
};
