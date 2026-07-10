#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
};

/// A payment stream: flows linearly from sender to recipient between start and stop time.
#[contracttype]
#[derive(Clone)]
pub struct Stream {
    pub sender: Address,
    pub recipient: Address,
    pub token: Address,
    pub amount: i128,
    pub withdrawn: i128,
    pub start_time: u64,
    pub stop_time: u64,
    pub cancelled: bool,
}

/// Storage keys
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Stream(u64),
    StreamCount,
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

/// Amount vested for a stream at a given timestamp (linear vesting).
fn vested_amount(stream: &Stream, now: u64) -> i128 {
    if now <= stream.start_time {
        0
    } else if now >= stream.stop_time {
        stream.amount
    } else {
        let elapsed = (now - stream.start_time) as i128;
        let duration = (stream.stop_time - stream.start_time) as i128;
        stream.amount * elapsed / duration
    }
}

#[contract]
pub struct AquaContract;

#[contractimpl]
impl AquaContract {
    /// Create a new stream and escrow the full amount into this contract.
    pub fn create_stream(
        env: Env,
        sender: Address,
        recipient: Address,
        token_addr: Address,
        amount: i128,
        start_time: u64,
        stop_time: u64,
    ) -> Result<u64, Error> {
        sender.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        if stop_time <= start_time {
            return Err(Error::InvalidTimeRange);
        }

        // Cross-contract call: pull tokens from sender into this contract (escrow).
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&sender, &env.current_contract_address(), &amount);

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::StreamCount)
            .unwrap_or(0);
        let stream_id = count;
        count += 1;

        let stream = Stream {
            sender: sender.clone(),
            recipient: recipient.clone(),
            token: token_addr,
            amount,
            withdrawn: 0,
            start_time,
            stop_time,
            cancelled: false,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Stream(stream_id), &stream);
        env.storage().instance().set(&DataKey::StreamCount, &count);

        env.events().publish(
            (symbol_short!("created"), stream_id),
            (sender, recipient, amount, start_time, stop_time),
        );

        Ok(stream_id)
    }

    /// Withdraw all currently-vested funds to the recipient.
    pub fn withdraw(env: Env, stream_id: u64) -> Result<i128, Error> {
        let mut stream: Stream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(Error::StreamNotFound)?;

        // Only the recipient can withdraw.
        stream.recipient.require_auth();

        if stream.cancelled {
            return Err(Error::StreamCancelled);
        }

        let now = env.ledger().timestamp();
        let available = vested_amount(&stream, now) - stream.withdrawn;
        if available <= 0 {
            return Err(Error::NothingToWithdraw);
        }

        // Cross-contract call: pay out from escrow to the recipient.
        let token_client = token::Client::new(&env, &stream.token);
        token_client.transfer(
            &env.current_contract_address(),
            &stream.recipient,
            &available,
        );

        stream.withdrawn += available;
        env.storage()
            .persistent()
            .set(&DataKey::Stream(stream_id), &stream);

        env.events().publish(
            (symbol_short!("withdraw"), stream_id),
            (stream.recipient.clone(), available),
        );

        Ok(available)
    }

    /// Cancel a stream: pay the recipient their vested-but-unwithdrawn funds,
    /// and refund the remaining unvested funds to the sender.
    pub fn cancel_stream(env: Env, stream_id: u64) -> Result<(i128, i128), Error> {
        let mut stream: Stream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(Error::StreamNotFound)?;

        // Only the sender can cancel the stream.
        stream.sender.require_auth();

        if stream.cancelled {
            return Err(Error::StreamCancelled);
        }

        let now = env.ledger().timestamp();
        let vested = vested_amount(&stream, now);
        let recipient_amount = vested - stream.withdrawn; // owed to recipient
        let sender_refund = stream.amount - vested; // returned to sender

        let token_client = token::Client::new(&env, &stream.token);
        if recipient_amount > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &stream.recipient,
                &recipient_amount,
            );
        }
        if sender_refund > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &stream.sender,
                &sender_refund,
            );
        }

        stream.cancelled = true;
        stream.withdrawn = vested;
        env.storage()
            .persistent()
            .set(&DataKey::Stream(stream_id), &stream);

        env.events().publish(
            (symbol_short!("cancel"), stream_id),
            (recipient_amount, sender_refund),
        );

        Ok((recipient_amount, sender_refund))
    }

    /// Amount currently available to withdraw (live balance).
    pub fn balance(env: Env, stream_id: u64) -> Result<i128, Error> {
        let stream: Stream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(Error::StreamNotFound)?;
        let now = env.ledger().timestamp();
        Ok(vested_amount(&stream, now) - stream.withdrawn)
    }

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