use anchor_lang::prelude::*;

declare_id!("8ckqj6yfYw9ZpFjM4VcUQ76u6ocZTk78Z9YNAgRUwKkd");

#[program]
pub mod notes {
    use super::*;

    pub fn create_note (ctx: Context<CreateNote>, topic: String) -> Result<()> {
        let clock: Clock = Clock::get().unwrap();

        ctx.accounts.note.set_inner(
            Note::new(
                ctx.accounts.author.key(),
                clock.unix_timestamp,
                topic
            )
        );

        Ok(())
    }
}

#[account]
pub struct Note {
    pub author: Pubkey,
    pub timestamp: i64,
    pub topic: String,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4; 

impl Note {

    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH
        + TIMESTAMP_LENGTH
        + STRING_LENGTH_PREFIX;

    pub fn new(author: Pubkey, timestamp: i64, topic: String) -> Self {
        Note {
            author,
            timestamp,
            topic,
        }
    }
}

#[derive(Accounts)]
#[instruction(topic: String)]
pub struct CreateNote<'info> {
    #[account(
        init, 
        payer = author, 
        space = Note::LEN + topic.len(), 
    )]
    pub note: Account<'info, Note>,
    
	#[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum NoteError {
    #[msg("The provided title should be 20 characters long maximum.")]
    TitleTooLong,
    #[msg("Title cannot not be empty.")]
    TitleEmpty,
}