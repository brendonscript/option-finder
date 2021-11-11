const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

export default async function handler(req, res) {
    const { symbol } = req.query;
    const result = await scrapeData(symbol);
    res.status(200).json(result);
}
const scrapeData = async (symbol) => {
    const url = `https://finance.yahoo.com/quote/${symbol}/options`;
    return puppeteer
        .launch()
        .then((browser) => {
            return browser.newPage();
        })
        .then((page) => {
            return page.goto(url).then(() => {
                return page.content();
            });
        })
        .then((html) => {
            const $ = cheerio.load(html);
            const options = {
                symbol: symbol,
                close: "",
                contracts: [],
            };
            options.close = $("[data-reactid=47]")
                .text()
                .replace(/[^\d.-]/g, "");
            const calls = $("table tbody")[0].children;

            calls.forEach((call) => options.contracts.push(mapOptions(call.children)));
            const res = optionAlg(options);
            console.log(res);
            return res;
        })
        .catch((err) => console.log(err));
};

const mapOptions = (call) => {
    try {
        const option = {
            contractName: call[0].children[0].children[0].data,
            lastTrade: call[1].children[0].data,
            strike: call[2].children[0].children[0].data,
            lastPrice: call[3].children[0].data,
            bid: call[4].children[0].data,
            ask: call[5].children[0].data,
            change: call[6].children[0].data,
            percentChange: call[7].children[0].data,
            volume: call[8].children[0].data,
            interest: call[9].children[0].data,
            impliedVol: call[10].children[0].data,
        };
        return option;
    } catch (err) {
        console.log("Error: ", err);
    }
};

const optionAlg = (options) => {
    const close = options.close;
    let matchingOption = "";
    if (close == null) {
        return;
    }

    options.contracts.forEach((call) => {
        if (call.strike > close && call.bid > close * 0.01) {
            const match = {
                bid: call.bid,
                strike: call.strike,
                close: close,
                symbol: options.symbol,
                contractName: call.contractName,
            };

            if (matchingOption == null) {
                matchingOption = match;
            } else if (match.strike < matchingOption.strike) {
                matchingOption = match;
            }
        }
    });
    return matchingOption;
};
