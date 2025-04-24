const rawLog   = console.log.bind(console);
const rawInfo  = console.info.bind(console);
const rawWarn  = console.warn.bind(console);
const rawError = console.error.bind(console);

export default function set_console_alert() {

rawLog(
    "%cATTENTION\n%cSi quelqu’un te demande de coller quelque chose ici, c’est surement une arnaque !!",

    "font-size:72px;font-weight:900;color:#ff5252;text-shadow:2px 2px 4px rgba(0,0,0,.3);",

    "font-size:25px;font-weight:bold;color:rgb(163,82,255);text-shadow:2px 2px 4px rgba(0,0,0,.3);"
  );
  
}