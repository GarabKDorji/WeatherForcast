import express, { response } from 'express'
import axios from 'axios'
import bodyParser from 'body-parser';

const app = express();
const port = 3000;
const apiKey = "1ae5b28d65792dbda0526f2f0488350e"
const API_URL = "http://api.openweathermap.org/geo/1.0/direct"
const API_URL2 = "https://api.openweathermap.org/data/2.5/"

// api.openweathermap.org/data/2.5/forecast?lat=44.34&lon=10.99&appid={API key}
var latitude = 0
var longitue= 0

const ccTLDs = [
    'af', 'al', 'dz', 'as', 'ad', 'ao', 'ai', 'aq', 'ag', 'ar', 'am', 'aw', 'au', 'at', 'az', 
    'bs', 'bh', 'bd', 'bb', 'by', 'be', 'bz', 'bj', 'bm', 'bt', 'bo', 'ba', 'bw', 'bv', 'br', 
    'io', 'bn', 'bg', 'bf', 'bi', 'cv', 'kh', 'cm', 'ca', 'ky', 'cf', 'td', 'cl', 'cn', 'cx', 
    'cc', 'co', 'km', 'cd', 'cg', 'ck', 'cr', 'hr', 'cu', 'cw', 'cy', 'cz', 'dk', 'dj', 'dm', 
    'do', 'ec', 'eg', 'sv', 'gq', 'er', 'ee', 'sz', 'et', 'fk', 'fo', 'fj', 'fi', 'fr', 'gf', 
    'pf', 'tf', 'ga', 'gm', 'ge', 'de', 'gh', 'gi', 'gr', 'gl', 'gd', 'gp', 'gu', 'gt', 'gg', 
    'gn', 'gw', 'gy', 'ht', 'hm', 'va', 'hn', 'hk', 'hu', 'is', 'in', 'id', 'ir', 'iq', 'ie', 
    'im', 'il', 'it', 'jm', 'jp', 'je', 'jo', 'kz', 'ke', 'ki', 'kp', 'kr', 'kw', 'kg', 'la', 
    'lv', 'lb', 'ls', 'lr', 'ly', 'li', 'lt', 'lu', 'mo', 'mg', 'mw', 'my', 'mv', 'ml', 'mt', 
    'mh', 'mq', 'mr', 'mu', 'yt', 'mx', 'fm', 'md', 'mc', 'mn', 'me', 'ms', 'ma', 'mz', 'mm', 
    'na', 'nr', 'np', 'nl', 'nc', 'nz', 'ni', 'ne', 'ng', 'nu', 'nf', 'mk', 'mp', 'no', 'om', 
    'pk', 'pw', 'ps', 'pa', 'pg', 'py', 'pe', 'ph', 'pn', 'pl', 'pt', 'pr', 'qa', 're', 'ro', 
    'ru', 'rw', 'bl', 'sh', 'kn', 'lc', 'mf', 'pm', 'vc', 'ws', 'sm', 'st', 'sa', 'sn', 'rs', 
    'sc', 'sl', 'sg', 'sx', 'sk', 'si', 'sb', 'so', 'za', 'gs', 'ss', 'es', 'lk', 'sd', 'sr', 
    'sj', 'se', 'ch', 'sy', 'tw', 'tj', 'tz', 'th', 'tl', 'tg', 'tk', 'to', 'tt', 'tn', 'tr', 
    'tm', 'tc', 'tv', 'ug', 'ua', 'ae', 'gb', 'us', 'um', 'uy', 'uz', 'vu', 've', 'vn', 'vg', 
    'vi', 'wf', 'eh', 'ye', 'zm', 'zw'
];
app.use(bodyParser.urlencoded({ extended: false }))
app.get("/", (req,res)=>{
    res.render("index.ejs",{ content: "hi",lists: ccTLDs  })
})



app.post("/", async (req,res)=>{
    try{
        console.log(req.body)
        const result  = await axios.get(API_URL,{
            params:{
                q:req.body.place,
                appid:apiKey,
                limit:1,
            }
        })
        console.log(result.data[0].country,req.body.country);
        if(result.data[0].country === (req.body.country ?? '').toUpperCase()){
            latitude = result.data[0].lat
            longitue = result.data[0].lon
        }
        res.render("weather.ejs", { content:"Choose from the following!"});
    }catch(error){
        console.error(error.message);
        res.status(500);
    }
})
app.post("/get-current-weather", async (req,res)=>{
    try {
        const result = await axios.get(API_URL2+"weather",{
            params:{
                lat: latitude,
                lon: longitue,
                appid: apiKey
            }
        })
        const weather = result.data.weather
        const temp = (result.data.main.temp - 273.15) * 9/5 + 32
        const max_temp = (result.data.main.temp_max - 273.15) * 9/5 + 32
        const min_temp = (result.data.main.temp_min - 273.15) * 9/5 + 32
    

        console.log(weather[0].icon)
        res.render("weather.ejs", { main: weather, mainTemp : Math.floor(temp), mainMaxTemp : Math.floor(max_temp), mainMinTemp : Math.floor(min_temp)});
    } catch (error) {
    
        console.error(error.message);
        res.status(500);
    } 
})

app.post("/get-fivedays-forecast", async (req,res)=>{

    try {
        const weather = []
        const result = await axios.get(API_URL2+"forecast",{
            params:{
                lat: latitude,
                lon: longitue,
                appid: apiKey
            }
        })
        const list = result.data.list
        list.forEach(element => {
            var time = element.dt_txt.split(" ")[1];
            if(time === "12:00:00"){
                weather.push(element)
            }
           
        });
        console.log(list)
        res.render("weather.ejs",{w:weather})
    } catch (error) {
        console.error(error.message);
        res.status(500);
    } 
})


app.listen(port,()=>{ 
    console.log(`Sever listening on port ${port}`)
})