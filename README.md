# 🛡️ DomainRiskManager (GenLayer Full-Stack dApp)

![GenLayer](https://img.shields.io/badge/Network-GenLayer_Studio-blueviolet?style=for-the-badge)
![Smart Contract](https://img.shields.io/badge/Smart_Contract-Python_3.9+-blue?style=for-the-badge&logo=python&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-HTML%2FJS-orange?style=for-the-badge)
![Type](https://img.shields.io/badge/Type-Intelligent_dApp-success?style=for-the-badge)

**DomainRiskManager** is a full-stack Intelligent dApp built for the **GenLayer "The Tank" Hackathon**. 

It acts as an autonomous semantic registry that leverages GenVM's non-deterministic AI consensus to evaluate, manage, and secure on-chain commitments. The project includes a robust Python-based Intelligent Contract and a fully integrated Web3 frontend command center.

🔗 **[Launch Live dApp (Agentic Command Center)](https://dorinalunar.github.io/domain-risk-dapp/)**

---

## ✨ Key Features

### 🖥️ Agentic Command Center (Frontend)
*   **Seamless Web3 Integration:** Connect via MetaMask to the GenLayer Studio network directly from the browser.
*   **4-Panel Dashboard:** Intuitive UI covering the entire lifecycle: Setup, Submission, AI Execution, and Block Explorer views.
*   **Real-time Event Console:** Track transaction hashes, state changes, and AI rationale directly in the UI.

### 🧠 Intelligent Contract (Backend)
*   **AI-Powered Consensus:** Utilizes GenLayer's `run_nondet_unsafe` to semantically analyze incoming text agreements against active domain landscape data.
*   **Steward Override System:** Global stewards can manually resolve deadlocks or override AI decisions.
*   **Permissioned Architecture:** Domain-specific whitelisting ensures only authorized actors can submit data.
*   **Dynamic Risk Configuration:** Configurable risk tolerance (`strict_mode`, `ignore_minor`) per domain.

---

## 🚀 How to Use the dApp

The frontend is divided into four main operational panels. Connect your wallet (GenLayer Studio network) and follow the flow:

### 1. ⚙️ Setup & Admin (Domain Management)
*   **Register Domain:** Create a new isolated registry (e.g., `marketing_q4`).
*   **Whitelist Users:** Authorize specific wallet addresses to submit agreements to your domain.
*   **Configure Risk:** Set semantic strictness levels for the AI consensus.

### 2. 📥 Submission Cycle
*   **Submit Agreement:** Enter your target domain and the full text of the commitment (e.g., *"Exclusive promo for Project Alpha in October"*).
*   The contract stores this and returns a unique `Submission ID`.
*   *Manage:* Ability to revoke or archive active submissions.

### 3. 🧠 AI & Execution
*   **Evaluate Submission:** Enter the `Submission ID` and trigger GenVM. The AI will semantically compare the new text against all `LIVE` agreements in that domain.
*   **Steward Override:** Force a state change (`SAFE` or `CLASH`) if the AI returns an ambiguous result.

### 4. 🔍 Explorer (Views)
*   Read the current state (`QUEUED`, `LIVE`, `DENIED`, `MANUAL_CHECK`).
*   Fetch detailed AI judgements (JSON rationale and detected conflicts).
*   View global contract statistics and event logs.

---

## 🏗️ State Machine Lifecycle

Submissions flow through a strict on-chain state machine:

```mermaid
graph TD
    A((Start)) -->|submit_agreement| B(QUEUED)
    B -->|evaluate_submission| C{AI Consensus}
    
    C -->|OUTCOME_SAFE| D[LIVE]
    C -->|OUTCOME_CLASH| E[DENIED]
    C -->|OUTCOME_UNCLEAR| F[MANUAL_CHECK]
    
    F -->|override_judgement| G{Steward Decision}
    G -->|SAFE| D
    G -->|CLASH| E
    
    D -->|archive_record| H(ARCHIVED)
    B -->|revoke_submission| I(REVOKED)
    F -->|revoke_submission| I
    
    style D fill:#2e7d32,stroke:#1b5e20,stroke-width:2px,color:#fff
    style E fill:#c62828,stroke:#b71c1c,stroke-width:2px,color:#fff
    style F fill:#f9a825,stroke:#f57f17,stroke-width:2px,color:#fff
