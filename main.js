import { createClient } from "https://esm.sh/genlayer-js";
import { studionet } from "https://esm.sh/genlayer-js/chains";

const CONTRACT_ADDRESS = "0xBfD7843AF81097Faec3Ce05A86B7E106BB78024e";
const STUDIO_CHAIN_ID_HEX = '0xf22f';
const studioChainParams = {
    chainId: STUDIO_CHAIN_ID_HEX,
    chainName: 'GenLayer Studio',
    nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
    rpcUrls: ['https://studio.genlayer.com/api']
};

let userAccount = null;

const readClient = createClient({ chain: studionet });

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

async function switchNetwork() {
    if (!window.ethereum) return;
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: STUDIO_CHAIN_ID_HEX }]
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [studioChainParams]
            });
        } else {
            throw switchError;
        }
    }
}

async function connectWallet() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return null;
    }
    try {
        await switchNetwork();
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

window.executeTx = async function(functionName, args = [], consoleId = 'adminConsole') {
    if (!userAccount) {
        const connected = await connectWallet();
        if (!connected) {
            return window.logToConsole(consoleId, "Error: Connect wallet first.", "error");
        }
    }

    try {
        window.logToConsole(consoleId, `Preparing ${functionName}...\nPlease confirm in MetaMask.`, "warn");
        await switchNetwork();

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

        const hash = typeof tx === "string" ? tx : (tx.txId || tx.hash);
        window.logToConsole(consoleId, `Transaction sent!\nMethod: ${functionName}\nHash: ${hash}`, "success");
    } catch (error) {
        console.error("Execution error:", error);
        window.logToConsole(consoleId, `Failed: ${error.shortMessage || error.message || 'Transaction rejected'}`, "error");
    }
};

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

        window.logToConsole(consoleId, `Result:\n${displayStr}`, "success");
    } catch (error) {
        console.error("Read error:", error);
        window.logToConsole(consoleId, `Error: ${error.shortMessage || error.message || 'Execution reverted'}`, "warn");
    }
};

// --- Panel 1: Setup & Admin Handlers ---
window.addSteward = function() {
    const acc = document.getElementById('addStewardAcc')?.value.trim();
    if (!acc) return window.logToConsole('adminConsole', 'Error: Steward address required.', 'error');
    window.executeTx('add_steward', [acc], 'adminConsole');
};

window.registerDomain = function() {
    const domain = document.getElementById('regDomainName')?.value.trim();
    const owner = document.getElementById('regDomainOwner')?.value.trim();
    if (!domain || !owner) return window.logToConsole('adminConsole', 'Error: Domain and Owner address required.', 'error');
    window.executeTx('register_domain', [domain, owner], 'adminConsole');
};

window.configureDomainRisk = function() {
    const domain = document.getElementById('cfgDomain')?.value.trim();
    const strict = document.getElementById('cfgStrict')?.value === 'true';
    const minor = document.getElementById('cfgMinor')?.value === 'true';
    if (!domain) return window.logToConsole('adminConsole', 'Error: Domain required.', 'error');
    window.executeTx('configure_domain_risk', [domain, strict, minor], 'adminConsole');
};

window.setWhitelist = function() {
    const domain = document.getElementById('wlDomain')?.value.trim();
    const target = document.getElementById('wlAccount')?.value.trim();
    const status = document.getElementById('wlStatus')?.value === 'true';
    if (!domain || !target) return window.logToConsole('adminConsole', 'Error: Domain and Target address required.', 'error');
    window.executeTx('set_whitelist', [domain, target, status], 'adminConsole');
};

// --- Panel 2: Submissions ---
window.submitAgreement = function() {
    const domain = document.getElementById('subDomain')?.value.trim();
    const body = document.getElementById('subBody')?.value.trim();
    const bg = document.getElementById('subBg')?.value.trim();
    const hook = document.getElementById('subHook')?.value.trim() || "0x0000000000000000000000000000000000000000";
    if (!domain || !body) return window.logToConsole('subConsole', 'Error: Domain and Agreement text required.', 'error');
    window.executeTx('submit_agreement', [domain, body, bg, hook], 'subConsole');
};

window.manageSubmission = function(action) {
    const id = document.getElementById('manageId')?.value.trim();
    if (!id) return window.logToConsole('subConsole', 'Error: Submission ID required.', 'error');
    const u256Id = BigInt(id);

    if (action === 'reload') {
        window.executeTx('reload_submission', [u256Id], 'subConsole');
    } else if (action === 'revoke') {
        window.executeTx('revoke_submission', [u256Id], 'subConsole');
    } else if (action === 'archive') {
        const cause = document.getElementById('archiveCause')?.value.trim();
        if (!cause) return window.logToConsole('subConsole', 'Error: Archive cause required.', 'error');
        window.executeTx('archive_record', [u256Id, cause], 'subConsole');
    }
};

// --- Panel 3: AI & Execution Handlers ---
window.evaluateSubmission = function() {
    const id = document.getElementById('evalId')?.value.trim();
    if (!id) return window.logToConsole('evalConsole', 'Error: Submission ID required.', 'error');
    window.executeTx('evaluate_submission', [BigInt(id)], 'evalConsole');
};

window.executeBatchEval = function() {
    const input = document.getElementById('batchIds')?.value.trim();
    if (!input) return window.logToConsole('evalConsole', 'Error: Provide IDs.', 'error');
    const arr = input.split(',').map(s => BigInt(s.trim())).filter(n => !isNaN(Number(n)));
    window.executeTx('evaluate_batch', [arr], 'evalConsole');
};

window.overrideJudgement = function() {
    const id = document.getElementById('overId')?.value.trim();
    const outcome = document.getElementById('overOutcome')?.value;
    const rationale = document.getElementById('overRationale')?.value.trim();
    if (!id || !rationale) return window.logToConsole('evalConsole', 'Error: ID and Rationale required.', 'error');
    window.executeTx('override_judgement', [BigInt(id), outcome, rationale], 'evalConsole');
};

window.triggerHook = function() {
    const id = document.getElementById('hookId')?.value.trim();
    if (!id) return window.logToConsole('evalConsole', 'Error: Submission ID required.', 'error');
    window.executeTx('trigger_hook', [BigInt(id)], 'evalConsole');
};

// --- Panel 4: Read & Query Views ---
window.fetchSubmissionData = function(method) {
    const id = document.getElementById('viewId')?.value.trim();
    if (!id) return window.logToConsole('viewConsole', 'Error: Submission ID required.', 'error');
    window.readData(method, [parseInt(id, 10)], 'viewConsole');
};

window.getIssue = function() {
    const id = document.getElementById('viewId')?.value.trim();
    const idx = document.getElementById('issueIdx')?.value.trim();
    if (!id || idx === "") return window.logToConsole('viewConsole', 'Error: Submission ID and Issue Index required.', 'error');
    window.readData('get_issue', [parseInt(id, 10), parseInt(idx, 10)], 'viewConsole');
};

window.getDomainState = function() {
    const actor = document.getElementById('dsActor')?.value.trim();
    const domain = document.getElementById('dsDomain')?.value.trim();
    if (!actor || !domain) return window.logToConsole('viewConsole', 'Error: Actor and Domain required.', 'error');
    window.readData('get_domain_state', [actor, domain], 'viewConsole');
};

window.getEvent = function() {
    const idx = document.getElementById('eventIdx')?.value.trim();
    window.readData('get_event', [parseInt(idx || "0", 10)], 'viewConsole');
};

window.getStats = function() {
    window.readData('stats', [], 'viewConsole');
};