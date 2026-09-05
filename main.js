import { createClient } from "https://esm.sh/genlayer-js";

const CONTRACT_ADDRESS = "0xB1871Ce9bc99A4dC24b0727ac78011000d480F76";
const studioChain = {
    id: 62001,
    name: 'GenLayer Studio',
    nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://studio.genlayer.com/api'] },
    }
};

let userAddress = null;
let writeClient = null;

const readClient = createClient({
    chain: studioChain
});

window.logToConsole = function(consoleId, msg, type = 'normal') {
    const el = document.getElementById(consoleId);
    if (!el) return;
    el.innerHTML = msg;
    el.className = 'console-output ' + (type === 'error' ? 'status-error' : type === 'success' ? 'status-success' : type === 'warn' ? 'status-warn' : '');
};

document.getElementById('connectBtn').addEventListener('click', async () => {
    if (typeof window.ethereum === 'undefined') {
        alert("Please install MetaMask!");
        return;
    }
    
    try {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xf22f' }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xf22f',
                        chainName: 'GenLayer Studio',
                        nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
                        rpcUrls: ['https://studio.genlayer.com/api'],
                    }],
                });
            } else {
                throw switchError;
            }
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = accounts[0];
        
        document.getElementById('walletText').innerText = userAddress.substring(0, 6) + "..." + userAddress.substring(38);
        document.getElementById('statusDot').classList.add('connected-dot');

        writeClient = createClient({
            chain: studioChain,
            account: userAddress,
            provider: window.ethereum
        });

    } catch (error) {
        console.error("Connection failed", error);
        alert("Failed to connect wallet or switch network.");
    }
});

window.executeTx = async function(methodName, args, consoleId) {
    if (!userAddress) {
        return window.logToConsole(consoleId, "Error: Connect wallet first.", "error");
    }

    try {
        window.logToConsole(consoleId, `⚙️ Preparing ${methodName}...\nPlease confirm in wallet.`, 'warn');

        const formattedArgs = args.map(a => {
            if (a === "true") return true;
            if (a === "false") return false;
            if (Array.isArray(a)) {
                return a.map(x => (!isNaN(x) && typeof x === 'string' && !x.startsWith('0x') ? BigInt(x) : x));
            }
            if (typeof a === 'string' && a.trim() !== "" && !isNaN(a) && !a.startsWith('0x')) {
                return BigInt(a);
            }
            return a;
        });

        // Try writing via SDK with fallback to direct JSON-RPC call
        let result;
        if (writeClient && typeof writeClient.writeContract === 'function') {
            try {
                result = await writeClient.writeContract({
                    address: CONTRACT_ADDRESS,
                    functionName: methodName,
                    args: formattedArgs,
                    value: 0n,
                    gasPrice: 0n,
                    gas: 20000000n
                });
            } catch (sdkErr) {
                console.warn("writeClient failed, falling back to window.ethereum.request", sdkErr);
            }
        }

        if (!result) {
            // Native GenVM RPC call
            const payload = {
                function_name: methodName,
                args: formattedArgs.map(x => typeof x === 'bigint' ? Number(x) : x)
            };
            const jsonStr = JSON.stringify(payload);
            const hexData = "0x" + Array.from(new TextEncoder().encode(jsonStr))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");

            result = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: userAddress,
                    to: CONTRACT_ADDRESS,
                    data: hexData,
                    gas: '0x1312D00'
                }]
            });
        }

        window.logToConsole(consoleId, `⏳ Tx broadcasted!\nHash: ${result}\nWaiting for consensus...`, 'warn');

        setTimeout(() => {
            window.logToConsole(consoleId, `✅ Transaction Broadcasted!\nMethod: ${methodName}\nTx: ${result}`, 'success');
        }, 5000);

    } catch (error) {
        console.error("Execution error:", error);
        window.logToConsole(consoleId, `❌ Tx Failed: ${error.message || 'Transaction rejected'}`, 'error');
    }
};

window.readData = async function(methodName, args, consoleId) {
    try {
        window.logToConsole(consoleId, `Fetching data from ${methodName}...`);

        const formattedArgs = args.map(a => {
            if (a === "true") return true;
            if (a === "false") return false;
            if (typeof a === 'string' && a.trim() !== "" && !isNaN(a) && !a.startsWith('0x')) {
                return BigInt(a);
            }
            return a;
        });

        const result = await readClient.readContract({
            address: CONTRACT_ADDRESS,
            functionName: methodName,
            args: formattedArgs
        });
        
        let displayStr = result;
        try { 
            displayStr = JSON.stringify(typeof result === 'string' ? JSON.parse(result) : result, null, 2); 
        } catch (e) {}
        
        window.logToConsole(consoleId, displayStr, 'success');
    } catch (error) {
        console.error("Read error:", error);
        window.logToConsole(consoleId, `⚠️ Data not found or state is empty. (Reverted)`, 'warn');
    }
};

window.executeBatchEval = function() {
    const input = document.getElementById('batchIds').value;
    if (!input) return window.logToConsole('evalConsole', 'Error: Provide IDs', 'error');
    const arr = input.split(',').map(s => s.trim()).filter(s => s !== "");
    window.executeTx('evaluate_batch', [arr], 'evalConsole');
};

window.getEvent = function() {
    const idx = document.getElementById('eventIdx').value;
    window.readData('get_event', [idx ? idx : "0"], 'viewConsole');
};
