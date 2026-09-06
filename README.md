<div align="center">
  <img src="./logo.svg" alt="DomainRiskManager Logo" width="180" height="180">
  <br>
</div>

# 🛡️ DomainRiskManager (GenLayer Full-Stack dApp)

![GenLayer](https://img.shields.io/badge/Network-GenLayer_Studio-blueviolet?style=for-the-badge)
![Smart Contract](https://img.shields.io/badge/Smart_Contract-Python_3.9+-blue?style=for-the-badge&logo=python&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-Vanilla_JS-orange?style=for-the-badge&logo=javascript&logoColor=white)
![SDK](https://img.shields.io/badge/SDK-genlayer--js-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

> **🏆 Built exclusively for the GenLayer "The Tank" Hackathon.** 
> Demonstrating the power of Intelligent Smart Contracts and Agentic UI design.

**DomainRiskManager** is a full-stack Intelligent dApp built for the GenLayer ecosystem. 

It acts as an autonomous semantic registry that leverages GenVM's non-deterministic AI consensus to evaluate, manage, and secure on-chain commitments. The project includes a robust Python-based Intelligent Contract and a fully integrated, modular Web3 frontend command center.

🔗 **[Launch Live dApp (Agentic Command Center)](https://dorinalunar.github.io/domain-risk-dapp/)**

---

## 🌍 Real-World Use Cases

* **DAO Governance:** Prevent contradictory proposals from passing by semantically checking new proposals against existing active rules.
* **DeFi Partnerships:** Automatically verify if a new marketing commitment violates exclusivity clauses of previous agreements.
* **Freelance & Escrow:** Ensure deliverables match the semantic intent of the initial contract before releasing funds, acting as an autonomous AI judge.

---

## 📜 Deployment Details

* **Network:** GenLayer Studio (Chain ID: 62001)
* **Smart Contract Address:** `0xB1871Ce9bc99A4dC24b0727ac78011000d480F76`
* **Compiler:** GenLayer Studio Native Compiler (GenVM)

---

## 🛠️ Tech Stack & Architecture

This dApp demonstrates a highly resilient, mobile-friendly Web3 architecture tailored specifically for the GenLayer ecosystem:
* **Smart Contract:** Native Python using the `py-genlayer` SDK, implementing deterministic state management alongside AI logic.
* **Frontend Modular Design:** Built with Vanilla JS and ES Modules (via `esm.sh`) for seamless browser deployment without heavy build tools.
* **Hybrid RPC Integration:** 
  * **Reads:** Utilizes the official `genlayer-js` SDK (`createClient`) for flawless state querying and JSON parsing.
  * **Writes:** Employs a custom raw JSON-RPC fallback wrapping payloads in Hex for MetaMask. This bypasses current `viem` mobile wallet compatibility issues (like BigInt parsing errors), ensuring 100% reliable execution of AI-driven state transitions.

---

## ✨ Key Features

### 🖥️ Agentic Command Center (Frontend)
* **Seamless Web3 Integration:** Connect via MetaMask to the GenLayer Studio network directly from the browser with automatic chain-switching.
* **4-Panel Dashboard:** Intuitive UI covering the entire lifecycle: Setup, Submission, AI Execution, and Block Explorer views.
* **Real-time Event Console:** Track transaction hashes, state changes, and AI rationale directly in the UI.

### 🧠 Intelligent Contract (Backend)
* **AI-Powered Consensus:** Utilizes GenLayer's `run_nondet_unsafe` to semantically analyze incoming text agreements against active domain landscape data.
* **Steward Override System:** Global stewards can manually resolve deadlocks or override AI decisions.
* **Permissioned Architecture:** Domain-specific whitelisting ensures only authorized actors can submit data.
* **Dynamic Risk Configuration:** Configurable risk tolerance (`strict_mode`, `ignore_minor`) per domain.

---

## 🚀 How to Use the dApp

The frontend is divided into four main operational panels. Connect your wallet (GenLayer Studio network) and follow the flow:

### 1. ⚙️ Setup & Admin (Domain Management)
* **Register Domain:** Create a new isolated registry (e.g., `marketing_q4`).
* **Whitelist Users:** Authorize specific wallet addresses to submit agreements to your domain.
* **Configure Risk:** Set semantic strictness levels for the AI consensus.

### 2. 📥 Submission Cycle
* **Submit Agreement:** Enter your target domain and the full text of the commitment (e.g., *"Exclusive promo for Project Alpha in October"*).
* The contract stores this and returns a unique `Submission ID`.

### 3. 🧠 AI & Execution
* **Evaluate Submission:** Enter the `Submission ID` and trigger GenVM. The AI will semantically compare the new text against all `LIVE` agreements in that domain.
* **Steward Override:** Force a state change if the AI returns an ambiguous result.

### 4. 🔍 Explorer (Views)
* Read the current state (`QUEUED`, `LIVE`, `DENIED`, `MANUAL_CHECK`).
* Fetch detailed AI judgements (JSON rationale and detected conflicts).
* View global contract statistics and event logs.

---

## 🛠️ Local Development

Since the dApp is built with a modular Vanilla JS architecture and uses CDN imports (`esm.sh`), running it locally requires zero build tools.

1. Clone the repository: `git clone https://github.com/dorinalunar/domain-risk-dapp.git`
2. Open `index.html` in any modern web browser or serve it via a simple local server.
3. Connect your MetaMask to the GenLayer Studio network.

---

## 🗺️ Future Roadmap

* **Phase 1 (Mainnet Deployment):** Migrate the intelligent contract to the GenLayer Mainnet upon official network launch.
* **Phase 2 (Multi-Agent Dispute Resolution):** Introduce secondary AI validation models for cross-verification on `MANUAL_CHECK` outcomes.
* **Phase 3 (Dynamic Frontend Theming):** Enhance the UI with fully customizable themes for protocols building on top of the registry.
