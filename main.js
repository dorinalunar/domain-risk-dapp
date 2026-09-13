import { createClient } from "https://esm.sh/genlayer-js";
import { studionet } from "https://esm.sh/genlayer-js/chains";

const CONTRACT_ADDRESS = "0xB1871Ce9bc99A4dC24b0727ac78011000d480F76";
let userAccount = null;

// Read-only client using official studionet definition
const readClient = createClient({ chain: studionet });

// --- UI Logger ---
window.logToConsole = function(consoleId, msg, type = 'normal') {
    const el = document.getElementById(consoleId);
    if (!el) return;
    el.innerHTML = msg.replace(/\n/g, '<br>');
    el.className = 'console-output';
    if (type === 'error') el.classList.add('status-error');
    else if (type === 'success') el.classList.add('status-success');
    else if (type === 'warn') el.classList.add('status-warn');
    el.scrollTop = el.scrollHeight;
};

// --- Wallet Connection ---
async function connectWallet() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return null;
    }
    try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        userAccount = accounts[0];
        
        const walletText = document.getElementById('walletText');
        if (walletText) walletText.innerText = userAccount.slice(0, 6) + "..." + userAccount.slice(-4);
        
        const statusDot = document.getElementById('statusDot');
        if (statusDot) {
            statusDot.classList.add('connected-dot');
            statusDot.style.backgroundColor = '#4ade80';
        }
        
        console.log("Wallet connected:", userAccount);
        return userAccount;
    } catch (error) {
        console.error("Connection error:", error);
        return null;
    }
}

document.getElementById('connectBtn')?.addEventListener('click', connectWallet);

// --- Transaction Execution (Identical to working snippet) ---
window.executeTx = async function(functionName, args = [], consoleId = 'adminConsole') {
    if (!userAccount) {
        const connected = await connectWallet();
        if (!connected) {
            return window.logToConsole(consoleId, "Error: Connect wallet first.", "error");
        }
    }

    try {
        window.logToConsole(consoleId, `⚙️ Preparing ${functionName}...\nPlease confirm in MetaMask.`, "warn");

        // Fresh client initialized directly on window.ethereum
        const client = createClient({ 
            chain: studionet, 
            provider: window.ethereum, 
            account: userAccount 
        });

        const tx = await client.writeContract({
            address: CONTRACT_ADDRESS,
            functionName: functionName,
            args: args,
            value: 0n 
        });

        const hash = typeof tx === "string" ? tx : tx.txId;
        window.logToConsole(consoleId, `✅ Transaction sent!\nMethod: ${functionName}\nHash: ${hash}`, "success");
    } catch (error) {
        console.error("Execution error:", error);
        window.logToConsole(consoleId, `❌ Failed: ${error.shortMessage || error.message || 'Transaction rejected'}`, "error");
    }
};

// --- Read Contract Execution ---
window.readData = async function(functionName, args = [], consoleId = 'viewConsole') {
    try {
        window.logToConsole(consoleId, `Fetching data from ${functionName}...`, "normal");

        const result = await readClient.readContract({
            address: CONTRACT_ADDRESS,
            functionName: functionName,
            args: args
        });

        let displayStr = result;
        try {
            displayStr = JSON.stringify(typeof result === 'string' ? JSON.parse(result) : result, null, 2);
        } catch (e) {}

        window.logToConsole(consoleId, `✅ Result:\n${displayStr}`, "success");
    } catch (error) {
        console.error("Read error:", error);
        window.logToConsole(consoleId, `⚠️ Error: ${error.shortMessage || error.message || 'Execution reverted'}`, "warn");
    }
};

// --- Panel 1: Setup & Admin Handlers ---
window.addSteward = function() {
    const acc = document.getElementById('addStewardAcc')?.value.trim();
    if (!acc) return window.logToConsole('adminConsole', 'Error: Steward address required.', 'error');
    window.executeTx('add_steward', [acc], 'adminConsole');
};

window.setWhitelist = function() {
    const target = document.getElementById('whitelistAcc')?.value.trim();
    const status = document.getElementById('whitelistStatus')?.value;
    if (!target) return window.logToConsole('adminConsole', 'Error: Target address required.', 'error');
    window.executeTx('set_whitelist', [target, status === 'true'], 'adminConsole');
};

// --- Panel 2: Register Domain & Agreement ---
window.registerDomain = function() {
    const domain = document.getElementById('regDomainName')?.value.trim();
    const rules = document.getElementById('regRulesText')?.value.trim();
    if (!domain) return window.logToConsole('registerConsole', 'Error: Domain name required.', 'error');
    window.executeTx('register_domain', [domain, rules], 'registerConsole');
};

// --- Panel 3: Batch Evaluation & Resolution ---
window.executeBatchEval = function() {
    const input = document.getElementById('batchIds')?.value.trim();
    if (!input) return window.logToConsole('evalConsole', 'Error: Provide IDs.', 'error');
    const arr = input.split(',').map(s => s.trim()).filter(s => s !== "");
    window.executeTx('evaluate_batch', [arr], 'evalConsole');
};

window.resolveIssue = function() {
    const id = document.getElementById('resolveId')?.value.trim();
    const decision = document.getElementById('resolveDecision')?.value;
    if (!id) return window.logToConsole('evalConsole', 'Error: Agreement ID required.', 'error');
    window.executeTx('resolve_issue', [id, decision], 'evalConsole');
};

// --- Panel 4: Read & Query Views ---
window.getDomainState = function() {
    const actor = document.getElementById('dsActor')?.value.trim();
    const domain = document.getElementById('dsDomain')?.value.trim();
    if (!actor || !domain) return window.logToConsole('viewConsole', 'Error: Both Actor address and Domain are required.', 'error');
    window.readData('get_domain_state', [actor, domain], 'viewConsole');
};

window.getIssue = function() {
    const id = document.getElementById('issueAgreementId')?.value.trim();
    const idx = document.getElementById('issueIndex')?.value.trim();
    if (!id || idx === "") return window.logToConsole('viewConsole', 'Error: Agreement ID and Issue Index are required.', 'error');
    window.readData('get_issue', [id, idx], 'viewConsole');
};

window.getEvent = function() {
    const idx = document.getElementById('eventIdx')?.value.trim();
    window.readData('get_event', [idx !== "" ? idx : "0"], 'viewConsole');
};

window.getGlobalStats = function() {
    window.readData('get_global_stats', [], 'viewConsole');
};