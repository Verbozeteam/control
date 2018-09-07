
// SIMPLE_UI | SIMPLE_LIGHT_UI | MODERN_UI
var defaultUIStyle = '{{UI_STYLE}}';
var default_ip = "{{TARGET_IP}}";
var default_port = "{{TARGET_PORT}}";

if (defaultUIStyle === ("{"+"{UI_STYLE}}")) defaultUIStyle = "MODERN_UI";
if (default_ip === ("{"+"{TARGET_IP}}")) default_ip = "";
if (default_port === ("{"+"{TARGET_PORT}}")) default_port = 0;
if (typeof(default_port) === "string") default_port = parseInt(default_port);

try {
    if (__DEV__) {
        default_ip = "192.168.0.7";
        default_port = 4567;
    }
} catch (e) {}

export {
    defaultUIStyle,
    default_ip,
    default_port,
};
