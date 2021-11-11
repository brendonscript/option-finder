import { useState } from "react";
import Image from "next/image";

export default function Home() {
    const [symbol, setSymbol] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const handleSymbolInput = (event) => {
        setSymbol(event.target.value);
    };

    const handleSubmit = async (event) => {
        setLoading(true);
        setResults(null);
        setMessage(null);
        event.preventDefault();
        const res = await fetch(`/api/options/${symbol}`);
        const { option } = await res.json();
        if (Object.entries(option).length === 0) {
            setMessage("No results found");
        } else {
            setResults(option);
        }
        setLoading(false);
    };
    return (
        <div className='App'>
            <h1>Welcome to Mike McGays Option Finder</h1>
            <h2>(send me bitcoin 3AZ4XLQXJ4twjxV4dhLqCpQjYV6YNH7ta7)</h2>
            <Image alt='Mike' src='/mike.JPG' layout='fixed' height='400px' width='400px' />
            <form onSubmit={handleSubmit}>
                <label>
                    Symbol Name:
                    <input type='text' value={symbol} onChange={handleSymbolInput} />
                </label>
                <input type='submit' value='Submit' />
            </form>

            {loading && <div>Loading...</div>}

            {message && <div>{message}</div>}

            {!loading && results && (
                <div>
                    <h3>Results</h3>
                    <Image alt='widemike' src='/mikewide.png' layout='fixed' height='400px' width='400px' />
                    <div>Symbol: {results.symbol}</div>
                    <div>Contract: {results.contractName}</div>
                    <div>Bid: {results.bid}</div>
                    <div>Strike: {results.strike}</div>
                    <div>Close: {results.close}</div>
                </div>
            )}
        </div>
    );
}
