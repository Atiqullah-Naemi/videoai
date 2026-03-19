import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setConcurrency(1);
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumHeadlessMode(true);

export default Config;
