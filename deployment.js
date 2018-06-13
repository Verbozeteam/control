
// SIMPLE_UI | SIMPLE_LIGHT_UI | MODERN_UI
var defaultUIStyle = '{{UI_STYLE}}';
var default_ip = "{{TARGET_IP}}";
var default_port = "{{TARGET_PORT}}";
var default_ssid = "{{SSID}}";
var default_passphrase = "{{PASSWORD}}";
var default_QRCode = "{{QR_CODE}}";

if (defaultUIStyle === ("{"+"{UI_STYLE}}")) defaultUIStyle = "SIMPLE_UI";
if (default_ssid === ("{"+"{SSID}}")) default_ssid = "vbzatmn130";
if (default_passphrase === ("{"+"{PASSWORD}}")) default_passphrase = "notdefaultatall";
if (default_ip === ("{"+"{TARGET_IP}}")) default_ip = "192.168.10.1";
if (default_port === ("{"+"{TARGET_PORT}}")) default_port = 7990;
if (default_QRCode === ("{"+"{QR_CODE}}")) default_QRCode = "ws://192.168.10.1:7986/";
if (typeof(default_port) === "string") default_port = parseInt(default_port);

try {
    if (__DEV__) {
        default_ip = "10.11.28.190";
        default_port = 4568;
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
