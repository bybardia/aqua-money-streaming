#![cfg(test)]
use crate::{AquaContract, AquaContractClient, Error};
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, TokenClient},
    Address, Env,
};

#[test]
fn test_create_stream_escrows_funds() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000);

    let aqua_id = env.register(AquaContract, ());
    let client = AquaContractClient::new(&env, &aqua_id);

    let admin = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let token_addr = sac.address();
    let token_admin = StellarAssetClient::new(&env, &token_addr);
    let token = TokenClient::new(&env, &token_addr);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    token_admin.mint(&sender, &1_000);

    let id = client.create_stream(&sender, &recipient, &token_addr, &1_000, &1000, &2000);
    assert_eq!(id, 0);
    assert_eq!(client.stream_count(), 1);

    // full amount is escrowed into the contract
    assert_eq!(token.balance(&sender), 0);
    assert_eq!(token.balance(&aqua_id), 1_000);

    let s = client.get_stream(&0);
    assert_eq!(s.amount, 1_000);
    assert_eq!(s.withdrawn, 0);
    assert_eq!(s.recipient, recipient);
}

#[test]
fn test_withdraw_half_way() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000);

    let aqua_id = env.register(AquaContract, ());
    let client = AquaContractClient::new(&env, &aqua_id);

    let admin = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let token_addr = sac.address();
    let token_admin = StellarAssetClient::new(&env, &token_addr);
    let token = TokenClient::new(&env, &token_addr);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    token_admin.mint(&sender, &1_000);

    client.create_stream(&sender, &recipient, &token_addr, &1_000, &1000, &2000);

    // advance to the halfway point → 50% vested
    env.ledger().set_timestamp(1500);
    assert_eq!(client.balance(&0), 500);

    let withdrawn = client.withdraw(&0);
    assert_eq!(withdrawn, 500);
    assert_eq!(token.balance(&recipient), 500);
    assert_eq!(token.balance(&aqua_id), 500);
}

#[test]
fn test_cancel_splits_funds_fairly() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1000);

    let aqua_id = env.register(AquaContract, ());
    let client = AquaContractClient::new(&env, &aqua_id);

    let admin = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let token_addr = sac.address();
    let token_admin = StellarAssetClient::new(&env, &token_addr);
    let token = TokenClient::new(&env, &token_addr);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    token_admin.mint(&sender, &1_000);

    client.create_stream(&sender, &recipient, &token_addr, &1_000, &1000, &2000);

    // advance to 25% → recipient 250, sender refund 750
    env.ledger().set_timestamp(1250);
    let (to_recipient, to_sender) = client.cancel_stream(&0);
    assert_eq!(to_recipient, 250);
    assert_eq!(to_sender, 750);
    assert_eq!(token.balance(&recipient), 250);
    assert_eq!(token.balance(&sender), 750);
}

#[test]
fn test_invalid_amount_is_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let aqua_id = env.register(AquaContract, ());
    let client = AquaContractClient::new(&env, &aqua_id);

    let admin = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let token_addr = sac.address();

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let res = client.try_create_stream(&sender, &recipient, &token_addr, &0, &1000, &2000);
    assert_eq!(res, Err(Ok(Error::InvalidAmount)));
}
