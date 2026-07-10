#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env};

/// A payment stream: flows linearly from sender to recipient between start and stop time.
#[contracttype]
#[derive(Clone)]
pub struct Stream {
    pub sender: Address,     // stream creator (payer)
    pub recipient: Address,  // receiver
    pub token: Address,      // token (SAC) address being streamed
    pub amount: i128,        // total amount to stream
    pub withdrawn: i128,     // amount withdrawn so far
    pub start_time: u64,     // start time (unix timestamp)
    pub stop_time: u64,      // stop time (unix timestamp)
    pub cancelled: bool,     // whether the stream is cancelled
}

/// Storage keys
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Stream(u64),   // stream_id -> Stream
    StreamCount,   // total stream counter
}

/// Contract errors
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    StreamNotFound = 1,
    Unauthorized = 2,
    InvalidTimeRange = 3,
    InvalidAmount = 4,
    StreamCancelled = 5,
    NothingToWithdraw = 6,
}

#[contract]
pub struct AquaContract;

#[contractimpl]
impl AquaContract {
    /// Read a stream by its id.
    pub fn get_stream(env: Env, stream_id: u64) -> Result<Stream, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(Error::StreamNotFound)
    }

    /// Total number of streams created.
    pub fn stream_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::StreamCount)
            .unwrap_or(0)
    }
}