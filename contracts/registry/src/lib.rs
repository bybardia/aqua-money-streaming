#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, vec, Address, Env, Vec,
};

/// Storage keys
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Aqua,
    UserStreams(Address),
    TotalStreams,
    TotalVolume,
}

/// Contract errors
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
}

#[contract]
pub struct RegistryContract;

#[contractimpl]
impl RegistryContract {
    /// Set the Aqua contract address (called once after deployment).
    pub fn initialize(env: Env, aqua: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Aqua) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Aqua, &aqua);
        Ok(())
    }

    /// Record a stream. Only the Aqua contract is allowed to call this.
    pub fn record_stream(
        env: Env,
        stream_id: u64,
        sender: Address,
        recipient: Address,
        amount: i128,
    ) -> Result<(), Error> {
        let aqua: Address = env
            .storage()
            .instance()
            .get(&DataKey::Aqua)
            .ok_or(Error::NotInitialized)?;
        aqua.require_auth();

        Self::append_stream(&env, &sender, stream_id);
        Self::append_stream(&env, &recipient, stream_id);

        let mut total: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalStreams)
            .unwrap_or(0);
        total += 1;
        env.storage().instance().set(&DataKey::TotalStreams, &total);

        let mut volume: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalVolume)
            .unwrap_or(0);
        volume += amount;
        env.storage().instance().set(&DataKey::TotalVolume, &volume);

        env.events().publish(
            (symbol_short!("recorded"), stream_id),
            (sender, recipient, amount),
        );

        Ok(())
    }

    /// All stream ids a user is involved in (as sender or recipient).
    pub fn streams_of(env: Env, user: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::UserStreams(user))
            .unwrap_or(vec![&env])
    }

    /// Total number of streams recorded across the protocol.
    pub fn total_streams(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalStreams)
            .unwrap_or(0)
    }

    /// Total volume (sum of all stream amounts) recorded.
    pub fn total_volume(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalVolume)
            .unwrap_or(0)
    }
}

// Private helpers (not exported as contract functions).
impl RegistryContract {
    fn append_stream(env: &Env, user: &Address, stream_id: u64) {
        let key = DataKey::UserStreams(user.clone());
        let mut list: Vec<u64> = env.storage().persistent().get(&key).unwrap_or(vec![env]);
        list.push_back(stream_id);
        env.storage().persistent().set(&key, &list);
    }
}
