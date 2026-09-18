import pytest
import json
from genlayer import *


@pytest.fixture
def deployer():
    return Address("0x38409CCa5f5ca70F3fe189634e062B289e6378dd")


@pytest.fixture
def non_whitelisted_user():
    return Address("0x1111111111111111111111111111111111111111")


@pytest.fixture
def contract(deployer):
    with gl.as_account(deployer):
        instance = gl.deploy("DomainRiskManager.py")
    return instance


def test_domain_registration_and_whitelisting(contract, deployer, non_whitelisted_user):
    domain = "web3_promo"

    # Step 1: Register domain by admin/steward
    with gl.as_account(deployer):
        contract.register_domain(domain, deployer)

    # Step 2: Ensure non-whitelisted account cannot submit
    with gl.as_account(non_whitelisted_user):
        with pytest.raises(gl.vm.UserError, match="HALT: Submitter not whitelisted"):
            contract.submit_agreement(
                domain=domain,
                body_text="Unauthorized proposal.",
                bg_info="Spam context",
                hook=Address("0x0000000000000000000000000000000000000000"),
            )

    # Step 3: Whitelist account and verify permission
    with gl.as_account(deployer):
        contract.set_whitelist(domain, deployer, True)
        sub_id = contract.submit_agreement(
            domain=domain,
            body_text="I will exclusively promote Protocol Alpha during October 2026.",
            bg_info="Ambassadorship contract",
            hook=Address("0x0000000000000000000000000000000000000000"),
        )
        assert int(sub_id) == 1


def test_ai_consensus_and_conflict_resolution(contract, deployer):
    domain = "web3_promo"

    with gl.as_account(deployer):
        contract.register_domain(domain, deployer)
        contract.set_whitelist(domain, deployer, True)

        # 1. Submit first agreement
        id_1 = contract.submit_agreement(
            domain=domain,
            body_text="I will exclusively promote Protocol Alpha during October 2026.",
            bg_info="Exclusive campaign deal",
            hook=Address("0x0000000000000000000000000000000000000000"),
        )
        contract.evaluate_submission(id_1)
        sub_1 = json.loads(contract.get_submission(id_1))
        assert sub_1["state"] == "LIVE"
        assert sub_1["outcome"] == "SAFE"

        # 2. Submit second conflicting agreement
        id_2 = contract.submit_agreement(
            domain=domain,
            body_text="I will exclusively promote Protocol Beta during October 2026.",
            bg_info="Direct competitor campaign",
            hook=Address("0x0000000000000000000000000000000000000000"),
        )
        contract.evaluate_submission(id_2)
        sub_2 = json.loads(contract.get_submission(id_2))
        assert sub_2["state"] == "DENIED"
        assert sub_2["outcome"] == "CLASH"

        # Check recorded AI conflict issues
        judgement = json.loads(contract.get_judgement(id_2))
        assert judgement["outcome"] == "CLASH"
        assert len(judgement["issues"]) > 0
        assert judgement["issues"][0]["uid"] == str(id_1)


def test_cross_party_conflict_detection(contract, deployer, non_whitelisted_user):
    domain = "global_defi"

    with gl.as_account(deployer):
        contract.register_domain(domain, deployer)
        contract.set_whitelist(domain, deployer, True)
        contract.set_whitelist(domain, non_whitelisted_user, True)

        # User A (deployer) submits and gets approved
        id_1 = contract.submit_agreement(
            domain=domain,
            body_text="Exclusive DEX partnership for Q4.",
            bg_info="No conflicts",
            hook=Address("0x0000000000000000000000000000000000000000"),
        )
        contract.evaluate_submission(id_1)

    # User B (different account) submits to the same domain
    with gl.as_account(non_whitelisted_user):
        id_2 = contract.submit_agreement(
            domain=domain,
            body_text="Exclusive DEX partnership for Q4 with another entity.",
            bg_info="Potential clash",
            hook=Address("0x0000000000000000000000000000000000000000"),
        )
        
        record_b = json.loads(contract.get_submission(id_2))
        
        # Verify that User A's LIVE agreement is present in User B's sync_keys (cross-party check)
        assert str(id_1) in record_b["sync_keys"], "Cross-party active agreement missing from sync_keys"


def test_steward_override_consistency(contract, deployer):
    domain = "override_test"

    with gl.as_account(deployer):
        contract.register_domain(domain, deployer)
        contract.set_whitelist(domain, deployer, True)

        # Submit baseline agreement
        id_1 = contract.submit_agreement(
            domain=domain,
            body_text="Primary agreement text.",
            bg_info="Context",
            hook=Address("0x0000000000000000000000000000000000000000"),
        )
        contract.evaluate_submission(id_1)

        # Submit conflicting agreement
        id_2 = contract.submit_agreement(
            domain=domain,
            body_text="Conflicting secondary text.",
            bg_info="Context",
            hook=Address("0x0000000000000000000000000000000000000000"),
        )
        contract.evaluate_submission(id_2)

        # Verify initial denied state and recorded issues
        sub_2_pre = json.loads(contract.get_submission(id_2))
        assert sub_2_pre["state"] == "DENIED"
        assert int(sub_2_pre["issues_count"]) > 0

        # Force approve rejected submission via Steward Override
        override_reason = "Manual exception approved by DAO committee"
        contract.override_judgement(id_2, "SAFE", override_reason)

        # Verify state transition and issue count reset in main record
        sub_2_post = json.loads(contract.get_submission(id_2))
        assert sub_2_post["state"] == "LIVE"
        assert "STEWARD OVERRIDE" in sub_2_post["rationale"]
        assert int(sub_2_post["issues_count"]) == 0, "Issues count not cleared after override"

        # Verify consistency in judgement getter
        judgement = json.loads(contract.get_judgement(id_2))
        assert judgement["outcome"] == "SAFE"
        assert len(judgement["issues"]) == 0, "Judgement database not cleared after override"

        # Check global stats consistency
        stats = json.loads(contract.stats())
        assert stats["count_live"] == "2"
        assert stats["count_denied"] == "0"