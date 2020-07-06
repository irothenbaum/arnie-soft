const auth = require('./auth.json');
const axios = require('axios');
const GMailSend = require('gmail-send')

const URL = auth.target;
const MIN_DATE = (new Date('2000-01-01')).getTime() / 1000;

async function run() {
    try {
        let response = await axios.get(URL);
        let match = response.data.match(/v = parseInt\("([0-9]*)"\)/);
        if (!match || match.length < 1) {
            throw new Error("Could not find loaded date")
        }
        let pageTime = parseInt(match[1]);

        if (isNaN(pageTime)) {
            throw new Error("Loaded date, received NaN: " + match[1])
        } else if (pageTime < MIN_DATE) {
            await sendEmail("Thermostat date is too old")
        } else {
            await sendEmail("Everything's ok")
        }
    } catch (err) {
        await sendEmail("ERROR:" + err.message, true)
    }
}

async function sendEmail(message, isError = false) {
    const send = GMailSend(auth.gmail);

    await send({
        text: message,
        subject: `Thermostat check: ${(new Date()).toISOString()}` + (isError ? (' -- ERROR!') : '')
    })
}

run().then(r => {
    process.exit();
}).catch(e => {
    console.error(e);
    process.exit(1);
});

